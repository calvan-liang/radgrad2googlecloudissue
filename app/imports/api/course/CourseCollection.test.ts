import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import faker from 'faker';
import fc from 'fast-check';
import 'mocha';
import { Courses } from './CourseCollection';
import { makeSampleInterest, makeSampleInterestArray } from '../interest/SampleInterests';
import { removeAllEntities } from '../base/BaseUtilities';
import { getRandomCourseSlug } from './CourseUtilities';
import { ICourse } from '../../typings/radgrad';
import { makeSampleCourse } from './SampleCourses';
import { Slugs } from '../slug/SlugCollection';

/* eslint prefer-arrow-callback: "off",  @typescript-eslint/no-unused-expressions: "off" */
/* eslint-env mocha */

if (Meteor.isServer) {
  describe('CourseCollection', function testSuite() {
    before(function setup() {
      removeAllEntities();
    });

    after(function teardown() {
      removeAllEntities();
    });

    it('Can define and removeIt', function test1(done) {
      this.timeout(5000);
      fc.assert(
        fc.property(fc.lorem(1), fc.lorem(1), fc.lorem(20, true), fc.integer(1, 6), (fcName, fcNum, fcDescription, fcCreditHrs) => {
          const interests = makeSampleInterestArray();
          const slug = getRandomCourseSlug();
          const docID1 = Courses.define({ name: fcName, slug, num: fcNum, description: fcDescription, creditHrs: fcCreditHrs, interests });
          expect(Courses.isDefined(docID1)).to.be.true;
          Courses.removeIt(docID1);
          expect(Courses.isDefined(docID1)).to.be.false;
        }),
      );
      done();
    });

    it('Can define duplicates', function test2(done) {
      const name = faker.lorem.word();
      const slug = getRandomCourseSlug();
      const num = faker.lorem.word();
      const description = faker.lorem.paragraph();
      const creditHrs = faker.random.number({
        min: 1,
        max: 6,
      });
      const interests = makeSampleInterestArray(faker.random.number({
        min: 1,
        max: 6,
      }));
      const docID1 = Courses.define({ name, slug, num, description, creditHrs, interests });
      const docID2 = Courses.define({ name, slug, num, description, creditHrs, interests });
      expect(Courses.isDefined(slug)).to.be.true;
      expect(Courses.isDefined(docID1)).to.be.true;
      expect(Courses.isDefined(docID2)).to.be.true;
      expect(docID1).to.equal(docID2);
      expect(Courses.findDoc(docID1).shortName).to.equal(name);
      Courses.removeIt(docID2);
      expect(Courses.isDefined(slug)).to.be.false;
      expect(Courses.isDefined(docID1)).to.be.false;
      expect(Courses.isDefined(docID2)).to.be.false;
      done();
    });

    it('Can update', function test3(done) {
      this.timeout(5000);
      const docID = makeSampleCourse();
      // { name, shortName, num, description, creditHrs, interests, prerequisites, syllabus, retired }
      fc.assert(
        fc.property(fc.lorem(1), fc.lorem(1), fc.lorem(1), fc.lorem(20, true), fc.integer(1, 6), fc.lorem(20, true), fc.boolean(),
          (fcName, fcShortName, fcNum, fcDescription, fcCreditHrs, fcSyllabus, fcRetired) => {
          const interests2 = makeSampleInterestArray();
          Courses.update(docID, { name: fcName, shortName: fcShortName, num: fcNum, description: fcDescription, creditHrs: fcCreditHrs, interests: interests2, syllabus: fcSyllabus, retired: fcRetired });
          const course: ICourse = Courses.findDoc(docID);
          expect(course.name).to.equal(fcName);
          expect(course.shortName).to.equal(fcShortName);
          expect(course.num).to.equal(fcNum);
          expect(course.description).to.equal(fcDescription);
          expect(course.creditHrs).to.equal(fcCreditHrs);
          expect(course.interestIDs).to.have.lengthOf(interests2.length);
          expect(course.syllabus).to.equal(fcSyllabus);
          expect(course.retired).to.equal(fcRetired);
        }),
      );
      Courses.removeIt(docID);
      done();
    });

    it('Can dumpOne, removeIt, and restoreOne', function test5() {
      let docID = makeSampleCourse();
      const origCourse: ICourse = Courses.findDoc(docID);
      const dumpObject = Courses.dumpOne(docID);
      Courses.removeIt(docID);
      expect(Courses.isDefined(docID)).to.be.false;
      docID = Courses.restoreOne(dumpObject);
      const restored: ICourse = Courses.findDoc(docID);
      expect(origCourse.name).to.equal(restored.name);
      expect(origCourse.shortName).to.equal(restored.shortName);
      expect(origCourse.num).to.equal(restored.num);
      expect(origCourse.description).to.equal(restored.description);
      expect(origCourse.creditHrs).to.equal(restored.creditHrs);
      expect(origCourse.syllabus).to.equal(restored.syllabus);
      expect(origCourse.retired).to.equal(restored.retired);
    });

    it('Can checkIntegrity no errors', function test6() {
      const course = Courses.findOne({});
      const errors = Courses.checkIntegrity();
      // When we call makeSampleCourse we don't create the courses for the prereqs
      expect(errors.length).to.equal(course.prerequisites.length);
    });

    it('Can get slug for course', function test7() {
      const course = Courses.findOne({});
      const slug = Slugs.getNameFromID(course.slugID);
      const badSlug = faker.lorem.word();
      expect(Courses.findSlugByID(course._id)).to.equal(slug);
      expect(Courses.findSlugByID(course._id)).to.not.equal(badSlug);
    });

    it('Can detect if has interest', function test8() {
      const interestID = makeSampleInterest();
      const badInterestID = makeSampleInterest();
      const courseID = makeSampleCourse({ interestID });
      expect(Courses.hasInterest(courseID, interestID)).to.be.true;
      expect(Courses.hasInterest(courseID, badInterestID)).to.be.false;
    });
  });
}
