import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import { AcademicTerms } from '../semester/AcademicTermCollection';
import { CourseInstances } from '../course/CourseInstanceCollection';
import { makeSampleCourse, sampleCourseName } from '../course/SampleCourses';
import { makeSampleUser } from '../user/SampleUsers';
import { removeAllEntities } from '../base/BaseUtilities';

/* tslint:disable:ter-prefer-arrow-callback no-unused-expression */

if (Meteor.isServer) {
  describe('CourseInstanceCollection', function testSuite() {
    // Define course data.
    let course: string;
    let student: string;
    let semester: string;
    const verified = true;
    const grade = 'B';

    before(function setup() {
      this.timeout(5000);
      removeAllEntities();
      course = makeSampleCourse();
      student = makeSampleUser();
      semester = AcademicTerms.define({ term: AcademicTerms.FALL, year: 2015 });
    });

    after(function teardown() {
      removeAllEntities();
    });

    it('#define, #isDefined, #removeIt, #dumpOne, #restoreOne', function test() {
      let courseInstanceID = CourseInstances.define({ semester, course, verified, grade, student });
      expect(CourseInstances.isDefined(courseInstanceID)).to.be.true;
      const dumpObject = CourseInstances.dumpOne(courseInstanceID);
      CourseInstances.removeIt(courseInstanceID);
      expect(CourseInstances.isDefined(courseInstanceID)).to.be.false;
      courseInstanceID = CourseInstances.restoreOne(dumpObject);
      expect(CourseInstances.isDefined(courseInstanceID)).to.be.true;
      CourseInstances.removeIt(courseInstanceID);
    });

    it('#findCourseName, #toString', function test() {
      const courseInstanceID = CourseInstances.define({ semester, course, verified, grade, student });
      CourseInstances.toString(courseInstanceID);
      expect(CourseInstances.findCourseName(courseInstanceID)).to.equal(sampleCourseName);
      CourseInstances.removeIt(courseInstanceID);
    });
  });
}
