import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
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

    it('#define, #isDefined, #update, #removeIt, #dumpOne, #restoreOne', function test() {
      const docID = DesiredDegrees.define({ name, shortName, slug, description });
      expect(DesiredDegrees.isDefined(slug)).to.be.true;
      const dumpObject = DesiredDegrees.dumpOne(docID);
      expect(DesiredDegrees.countNonRetired()).to.equal(1);
      DesiredDegrees.update(docID, { retired: true });
      expect(DesiredDegrees.countNonRetired()).to.equal(0);
      DesiredDegrees.removeIt(slug);
      expect(DesiredDegrees.isDefined(slug)).to.be.false;
      DesiredDegrees.restoreOne(dumpObject);
      expect(DesiredDegrees.isDefined(slug)).to.be.true;
      DesiredDegrees.removeIt(slug);
    });
  });
}
