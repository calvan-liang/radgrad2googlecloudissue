import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import {} from 'mocha';
import { Courses } from './CourseCollection';
import { makeSampleInterest } from '../interest/SampleInterests';
import { removeAllEntities } from '../base/BaseUtilities';

/* eslint prefer-arrow-callback: "off", no-unused-expressions: "off" */
/* eslint-env mocha */

if (Meteor.isServer) {
  describe('CourseCollection', function testSuite() {
    before(function setup() {
      removeAllEntities();
    });

    after(function teardown() {
      removeAllEntities();
    });

    it('#define, #isDefined, #removeIt, #dumpOne, #restoreOne', function test() {
      const name = 'Algorithms';
      const slug = 'ics311';
      const num = 'ICS 311';
      const description = 'Study algorithms';
      const creditHrs = 3;
      const interests = [makeSampleInterest()];
      const docID = Courses.define({ name, slug, num, description, creditHrs, interests });
      expect(Courses.isDefined(slug)).to.be.true;
      expect(Courses.findDoc(docID).shortName).to.equal(name);
      const dumpObject = Courses.dumpOne(docID);
      expect(Courses.countNonRetired()).to.equal(1);
      Courses.update(docID, { retired: true });
      expect(Courses.countNonRetired()).to.equal(0);
      Courses.removeIt(slug);
      expect(Courses.isDefined(slug)).to.be.false;
      Courses.restoreOne(dumpObject);
      expect(Courses.isDefined(slug)).to.be.true;
      Courses.removeIt(slug);
    });

    it('course shortname', function test() {
      const name = 'Algorithms';
      const shortName = 'Algo';
      const slug = 'ics311';
      const num = 'ICS 311';
      const description = 'Study algorithms';
      const creditHrs = 3;
      const interests = [makeSampleInterest()];
      const docID = Courses.define({ name, shortName, slug, num, description, creditHrs, interests });
      expect(Courses.isDefined(slug)).to.be.true;
      expect(Courses.findDoc(docID).shortName).to.equal(shortName);
      Courses.removeIt(slug);
      expect(Courses.isDefined(slug)).to.be.false;
    });
  });
}
