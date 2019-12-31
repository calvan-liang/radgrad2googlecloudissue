import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import fc from 'fast-check';
import 'mocha';
import { DesiredDegrees } from './DesiredDegreeCollection';
import { removeAllEntities } from '../base/BaseUtilities';

/* eslint prefer-arrow-callback: "off",  @typescript-eslint/no-unused-expressions: "off" */
/* eslint-env mocha */

if (Meteor.isServer) {
  describe('DesiredDegreeCollection', function testSuite() {
    const name = 'Bachelors in Computer Science';
    const shortName = 'B.S. CS';
    const slug = 'bs-cs';
    const description = 'B.S. in CS.';

    before(function setup() {
      removeAllEntities();
    });

    after(function teardown() {
      removeAllEntities();
    });

    it('Can define and removeIt', function test1(done) {
      this.timeout(5000);
      fc.assert(
        fc.property(fc.lorem(1), fc.lorem(1), fc.lorem(1), fc.lorem(6), fc.boolean(), (fcName, fcShortName, fcSlug, fcDescription, fcRetired) => {
          const docID = DesiredDegrees.define({
            name: fcName,
            shortName: fcShortName,
            description: fcDescription,
            slug: fcSlug,
            retired: fcRetired,
          });
          expect(DesiredDegrees.isDefined(docID)).to.be.true;
          const dd = DesiredDegrees.findDoc(docID);
          expect(dd.name).to.equal(fcName);
          expect(dd.shortName).to.equal(fcShortName);
          expect(dd.description).to.equal(fcDescription);
          expect(dd.retired).to.equal(fcRetired);
          DesiredDegrees.removeIt(docID);
          expect(DesiredDegrees.isDefined(docID)).to.be.false;
        }),
      );
      done();
    });

    it('Can define duplicates', function test2() {
      // The behavior depends upon the rules for duplicates in the collection.
      // set up additional parameters for define
      // const docID1 = <Name>.define({params});
      // const docID2 = <Name>.define({params});
      // expect(docId1).to.equal(docId2);
      // expect(<Name>.isDefined(docID1)).to.be.true;
      // expect(<Name>.isDefined(docID2)).to.be.true;
      // <Name>.removeIt(docId1);
      // expect(<Name>.isDefined(docId1)).to.be.false;
      // expect(<Name>.isDefined(docId2)).to.be.false;
    });

    it('Can update', function test3(done) {
      this.timeout(5000);
      // set up additional parameters for define
      // define an instance
      // const docID = <Name>.define({params});
      // fc.assert(
      // fc.property(<fc parameters>, (<fc parameters>) => {
      // Optionally create other update parameters, interests, slugs, etc.
      // <Name>.update(docID, { parameter: fcParameter, ... });
      // const doc = <Name>.findDoc(docID);
      // expect(doc.parameter).to.equal(fcParameter); for each parameter
      done();
    });

    it('Can dumpOne, removeIt, and restoreOne', function test4() {

    });

    it('Can checkIntegrity no errors', function test5() {
      // const errors = <Name>.checkIntegrity();
      // expect(errors.length).to.equal(0); or number based upon the true errors
    });

    it('#define, #isDefined, #update, #checkIntegrity, #removeIt, #dumpOne, #restoreOne', function test() {
      const docID = DesiredDegrees.define({ name, shortName, slug, description });
      expect(DesiredDegrees.isDefined(slug)).to.be.true;
      const dumpObject = DesiredDegrees.dumpOne(docID);
      expect(DesiredDegrees.countNonRetired()).to.equal(1);
      DesiredDegrees.update(docID, { retired: true });
      const errors = DesiredDegrees.checkIntegrity();
      expect(errors.length).to.equal(0);
      expect(DesiredDegrees.countNonRetired()).to.equal(0);
      DesiredDegrees.removeIt(slug);
      expect(DesiredDegrees.isDefined(slug)).to.be.false;
      DesiredDegrees.restoreOne(dumpObject);
      expect(DesiredDegrees.isDefined(slug)).to.be.true;
      DesiredDegrees.removeIt(slug);
    });
  });
}
