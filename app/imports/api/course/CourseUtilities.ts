import { Meteor } from 'meteor/meteor';
import _ from 'lodash';
import faker from 'faker';
import { CourseInstances } from './CourseInstanceCollection';
import { Courses } from './CourseCollection';
import PreferredChoice from '../degree-plan/PreferredChoice';
import { Users } from '../user/UserCollection';
import { profileGetInterestIDs } from '../../ui/components/shared/data-model-helper-functions';
import { ICourse } from '../../typings/radgrad';

/**
 * Returns true if the coursesTakenSlugs fulfills courseID's prerequisites.
 * @memberOf api/course
 * @param coursesTakenSlugs slugs of the courses taken.
 * @param courseID course ID.
 * @return {boolean}
 * @memberOf api/course
 */
export function prereqsMet(coursesTakenSlugs: string[], courseID: string) {
  const course = Courses.findDoc(courseID);
  let ret = true;
  _.forEach(course.prerequisites, (prereq) => {
    if (_.indexOf(coursesTakenSlugs, prereq) === -1) {
      ret = false;
      return false;
    }
    return true;
  });
  return ret;
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min); // eslint-disable-line no-param-reassign
  max = Math.floor(max); // eslint-disable-line no-param-reassign
  return Math.floor(Math.random() * (max - min)) + min;
}

export function clearPlannedCourseInstances(studentID: string) {
  const courses = CourseInstances.find({ studentID, verified: false, fromRegistrar: false }).fetch();
  _.forEach(courses, (ci) => {
    CourseInstances.removeIt(ci);
  });
}

export function get300LevelDocs(): ICourse[] {
  return Courses.findNonRetired({ num: /3\d\d/ });
}

export function getStudent300LevelDocs(studentID: string, coursesTakenSlugs: string[]) {
  let ret = [];
  const courses: ICourse[] = get300LevelDocs();
  const instances = CourseInstances.find({ studentID }).fetch();
  const courseTakenIDs = [];
  instances.forEach((courseInstance) => {
    if (CourseInstances.isInteresting(courseInstance._id)) {
      if (courseInstance.note !== 'ICS 499') { // TODO: hardcoded ICS string
        courseTakenIDs.push(courseInstance.courseID);
      }
    }
  });
  ret = _.filter(courses, (c) => _.indexOf(courseTakenIDs, c._id) === -1);
  ret = _.filter(ret, (c) => prereqsMet(coursesTakenSlugs, c._id)); // remove courses that don't have the prerequisites
  return ret;
}

export function bestStudent300LevelCourses(studentID: string, coursesTakenSlugs: string[]) {
  const choices = getStudent300LevelDocs(studentID, coursesTakenSlugs);
  const profile = Users.getProfile(studentID);
  const interestIDs = profileGetInterestIDs(profile);
  const preferred = new PreferredChoice(choices, interestIDs);
  return preferred.getBestChoices();
}

export function chooseStudent300LevelCourse(studentID: string, coursesTakenSlugs: string[]) {
  const best = bestStudent300LevelCourses(studentID, coursesTakenSlugs);
  return best[getRandomInt(0, best.length)];
}

export function get400LevelDocs() {
  return Courses.findNonRetired({ number: /4\d\d/ });
}

export function getStudent400LevelDocs(studentID: string, coursesTakenSlugs: string[]) {
  let ret = [];
  const courses = get400LevelDocs();
  const instances = CourseInstances.find({ studentID }).fetch();
  const courseTakenIDs = [];
  instances.forEach((courseInstance) => {
    if (CourseInstances.isInteresting(courseInstance._id)) {
      if (!courseInstance.note.endsWith('499')) {
        courseTakenIDs.push(courseInstance.courseID);
      }
    }
  });
  ret = _.filter(courses, (c) => _.indexOf(courseTakenIDs, c._id) === -1);
  ret = _.filter(ret, (c) => prereqsMet(coursesTakenSlugs, c._id)); // remove courses that don't have the prerequisites
  return ret;
}

export function bestStudent400LevelCourses(studentID, coursesTakenSlugs) {
  const choices = getStudent400LevelDocs(studentID, coursesTakenSlugs);
  const profile = Users.getProfile(studentID);
  const interestIDs = profileGetInterestIDs(profile);
  const preferred = new PreferredChoice(choices, interestIDs);
  return preferred.getBestChoices();
}

export function chooseStudent400LevelCourse(studentID, coursesTakenSlugs) {
  const best = bestStudent400LevelCourses(studentID, coursesTakenSlugs);
  return best[getRandomInt(0, best.length)];
}

/**
 * Chooses the 'best' course to take given an array of slugs, the student and the courses the student
 * has taken.
 * @param slugs an array of course slugs to choose between.
 * @param studentID the student's ID.
 * @param coursesTakenSlugs an array of the course slugs the student has taken.
 * @returns {*}
 * @memberOf api/course
 */
export function chooseBetween(slugs, studentID, coursesTakenSlugs) {
  // console.log('chooseBetween', slugs, coursesTakenSlugs);
  const courses = [];
  _.forEach(slugs, (slug) => {
    const courseID = Courses.getID(slug);
    if (prereqsMet(coursesTakenSlugs, courseID)) {
      courses.push(Courses.findDoc(courseID));
    }
  });
  const profile = Users.getProfile(studentID);
  const interestIDs = profileGetInterestIDs(profile);
  const preferred = new PreferredChoice(courses, interestIDs);
  const best = preferred.getBestChoices();
  if (best) {
    // console.log('chooseBetween', best, interestIDs);
    return best[getRandomInt(0, best.length)];
  }
  return null;
}

/**
 * Checks the format of the getCourseSlug. Does not check to see if the slug is defined. Valid course
 * slugs have the format <dept>_<number>.
 * @param courseSlug the slug to check.
 * @returns {boolean}
 * @throws Meteor.Error if the slug doesn't have the right format.
 */
export function validateCourseSlugFormat(courseSlug): boolean {
  if (courseSlug !== 'other' && courseSlug.indexOf('_') === -1) {
    throw new Meteor.Error(`${courseSlug} is not a valid course slug.`);
  }
  return true;
}

/**
 * Returns the department from the given course slug.
 * @param courseSlug the course slug.
 * @returns {string}
 * @memberOf api/course
 */
export function getDepartment(courseSlug): string {
  return courseSlug.split('_')[0].toUpperCase();
}

/**
 * Returns the number portion of the getCourseSlug.
 * @param courseSlug the course slug.
 * @returns {string}
 */
export function getCourseNumber(courseSlug): string {
  return courseSlug.split('_')[1];
}

/**
 * Returns a random department string.
 * @param {number} length
 * @returns {string}
 */
export function getRandomDepartment(length: number = 3): string {
  let retVal = '';
  for (let i = 0; i < length; i++) {
    retVal = `${retVal}${faker.random.alphaNumeric()}`;
  }
  return retVal;
}

/**
 * Returns a random course slug for the given department.
 * @param {string} dept the department
 * @param {number} min the minimum course number, (optional) defaults to 100.
 * @param {number} max the maximum course number, (optional) defaults to 800.
 * @returns {string}
 */
export function getRandomCourseSlugForDept(dept: string, min: number = 100, max: number = 800): string {
  return `${dept}_${faker.random.number({
    min,
    max,
  })}`;
}

/**
 * Returns a random course slug for a random department.
 * @param {number} deptLength the length of the department string, defaults to 3.
 * @param {number} min the minimum course number, (optional) defaults to 100.
 * @param {number} max the maximum course number, (optional) defaults to 800.
 * @returns {string}
 */
export function getRandomCourseSlug(deptLength: number = 3, min: number = 100, max: number = 800): string {
  const deptName = getRandomDepartment(deptLength);
  return getRandomCourseSlugForDept(deptName, min, max);
}
