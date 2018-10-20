import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import { ROLE } from '../role/Role';
import { VerificationRequests } from './VerificationRequestCollection';
import { Semesters } from '../semester/SemesterCollection';
import { OpportunityInstances } from '../opportunity/OpportunityInstanceCollection';
import { removeAllEntities } from '../base/BaseUtilities';
import { makeSampleOpportunityInstance, makeSampleOpportunity } from '../opportunity/SampleOpportunities';
import { makeSampleUser } from '../user/SampleUsers';

/* tslint:disable:ter-prefer-arrow-callback no-unused-expression */

if (Meteor.isServer) {
  describe('VerificationRequestCollection', function testSuite() {
    before(function setup() {
      removeAllEntities();
    });

    after(function teardown() {
      removeAllEntities();
    });

    it('#define, #isDefined, #removeIt, #findOne, #toString, #dumpOne, #restoreOne', function test() {
      Semesters.define({ term: Semesters.SUMMER, year: 2015 });
      Semesters.define({ term: Semesters.FALL, year: 2015 });
      const student = makeSampleUser();
      const faculty = makeSampleUser(ROLE.FACULTY);
      const opportunityInstance = makeSampleOpportunityInstance(student, faculty);
      let docID = VerificationRequests.define({ student, opportunityInstance });
      expect(VerificationRequests.isDefined(docID)).to.be.true;
      expect(VerificationRequests.findOne({ opportunityInstanceID: opportunityInstance })).to.exist;
      VerificationRequests.toString(docID);
      const dumpObject = VerificationRequests.dumpOne(docID);
      VerificationRequests.removeIt(docID);
      expect(VerificationRequests.isDefined(docID)).to.be.false;
      docID = VerificationRequests.restoreOne(dumpObject);
      expect(VerificationRequests.isDefined(docID)).to.be.true;
      VerificationRequests.removeIt(docID);
    });

    it('#define using semester and opportunity', function test() {
      const semester = Semesters.define({ term: Semesters.SUMMER, year: 2015 });
      const opportunity = makeSampleOpportunity(makeSampleUser(ROLE.FACULTY));
      const student = makeSampleUser();
      const sponsor = makeSampleUser(ROLE.FACULTY);
      const verified = false;
      OpportunityInstances.define({ semester, opportunity, sponsor, student, verified });
      const docID = VerificationRequests.define({ student, semester, opportunity });
      expect(VerificationRequests.isDefined(docID)).to.be.true;
      VerificationRequests.removeIt(docID);
    });
  });
}
