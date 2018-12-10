import { CallPromiseMixin } from 'meteor/didericis:callpromise-mixin';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { _ } from 'meteor/erasaur:meteor-lodash';
import { Courses } from './CourseCollection';
import { CourseInstances } from './CourseInstanceCollection';
import { AcademicTerms } from '../semester/AcademicTermCollection';
import { nextAcademicTerm } from '../semester/AcademicTermUtilities';

/**
 * Returns an array with two elements: a string with the shortName of the semester, and an integer indicating the
 * current planned enrollment for the course in that semester.
 * @param courseID The ID of the course.
 * @param termID The ID of the semester.
 * @memberOf api/course
 */
function getEnrollmentData(courseID, termID) {
  const semesterShortName = AcademicTerms.getShortName(termID);
  const enrollment = CourseInstances.getCollection().find({ termID, courseID }).count();
  return [semesterShortName, enrollment];
}

/**
 * Given a courseID, returns enrollment data for the upcoming 9 semesters.
 * The returned data is an object with fields courseID and enrollmentData.
 * CourseID is the course ID.
 * EnrollmentData is an array of arrays. Each interior array is a tuple: a string containing the shortname and an
 * integer indicating the enrollment data.
 * @memberOf api/course
 * @example
 * { courseID: 'xghuyf2132q3',
 *   enrollmentData: [['Sp19', 0], ['Su19', 1], ['Fa19', 5],
 *                    ['Sp20', 25], ['Su20', 2], ['Fa20', 0],
 *                    ['Sp21', 1], ['Su21', 0], ['Fa21', 1]]
 * }
 */
export const getFutureEnrollmentMethod = new ValidatedMethod({
  name: 'CourseCollection.getFutureEnrollment',
  mixins: [CallPromiseMixin],
  validate: null,
  run(courseID) {
    // Throw error if an invalid courseID is passed.
    Courses.assertDefined(courseID);
    // Create an array of the upcoming 9 semesters after the current semester.
    let semesterDoc = AcademicTerms.getCurrentAcademicTermDoc();
    const semesterList = [];
    for (let i = 0; i < 9; i++) {
      semesterDoc = nextAcademicTerm(semesterDoc);
      semesterList.push(semesterDoc);
    }
    // Map over these semesters and return a new list that includes the enrollment data for this course and semester.
    const enrollmentData = _.map(semesterList, (doc) => getEnrollmentData(courseID, AcademicTerms.getID(doc)));
    return { courseID, enrollmentData };
  },
});
