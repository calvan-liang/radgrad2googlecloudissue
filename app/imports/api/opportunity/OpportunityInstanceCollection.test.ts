import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import fc from 'fast-check';
import 'mocha';
import { AcademicTerms } from '../academic-term/AcademicTermCollection';
import { ROLE } from '../role/Role';
import { OpportunityInstances } from './OpportunityInstanceCollection';
import { makeSampleOpportunity } from './SampleOpportunities';
import { makeSampleUser } from '../user/SampleUsers';
import { removeAllEntities } from '../base/BaseUtilities';
import { VerificationRequests } from '../verification/VerificationRequestCollection';
import { makeSampleAcademicTerm } from '../academic-term/SampleAcademicTerms';
import { makeSampleIce } from '../ice/SampleIce';
import { IAcademicTerm, IOpportunity, IOpportunityInstance } from '../../typings/radgrad';
import { Users } from '../user/UserCollection';
import { Opportunities } from './OpportunityCollection';

/* eslint prefer-arrow-callback: "off",  @typescript-eslint/no-unused-expressions: "off" */
/* eslint-env mocha */

if (Meteor.isServer) {
  describe('OpportunityInstanceCollection', function testSuite() {
    before(function setup() {
      removeAllEntities();
    });

    after(function teardown() {
      removeAllEntities();
    });

    it('Can define and removeIt', function test1(done) {
      this.timeout(5000);
      const academicTerm = makeSampleAcademicTerm();
      const sponsor = makeSampleUser(ROLE.FACULTY);
      const opportunity = makeSampleOpportunity(sponsor);
      const student = makeSampleUser();
      fc.assert(
        fc.property(fc.boolean(), fc.boolean(), (verified, retired) => {
          const docID = OpportunityInstances.define({ opportunity, academicTerm, student, sponsor, verified, retired });
          const vrID = VerificationRequests.define({ student, opportunityInstance: docID });
          expect(OpportunityInstances.isDefined(docID)).to.be.true;
          expect(VerificationRequests.isDefined(vrID)).to.be.true;
          const doc = OpportunityInstances.findDoc(docID);
          expect(doc.retired).to.equal(retired);
          expect(doc.verified).to.equal(verified);
          OpportunityInstances.removeIt(docID);
          expect(OpportunityInstances.isDefined(docID)).to.be.false;
          expect(VerificationRequests.isDefined(vrID)).to.be.false;
        }),
      );
      done();
    });

    it('Cannot define duplicates', function test2() {
      const academicTerm = makeSampleAcademicTerm();
      const sponsor = makeSampleUser(ROLE.FACULTY);
      const opportunity = makeSampleOpportunity(sponsor);
      const student = makeSampleUser();
      const verified = false;
      const docID1 = OpportunityInstances.define({ opportunity, academicTerm, student, sponsor, verified });
      const docID2 = OpportunityInstances.define({ opportunity, academicTerm, student, sponsor, verified });
      expect(OpportunityInstances.isDefined(docID1)).to.be.true;
      expect(OpportunityInstances.isDefined(docID2)).to.be.true;
      expect(docID1).to.equal(docID2);
      OpportunityInstances.removeIt(docID1);
      expect(OpportunityInstances.isDefined(docID1)).to.be.false;
      expect(OpportunityInstances.isDefined(docID2)).to.be.false;
    });

    it('Can update', function test3(done) {
      this.timeout(5000);
      let academicTerm = makeSampleAcademicTerm();
      const sponsor = makeSampleUser(ROLE.FACULTY);
      const opportunity = makeSampleOpportunity(sponsor);
      const student = makeSampleUser();
      const verified = false;
      const docID = OpportunityInstances.define({ opportunity, academicTerm, student, sponsor, verified });
      let doc: IOpportunityInstance = OpportunityInstances.findDoc(docID);
      fc.assert(
        fc.property(fc.boolean(), fc.boolean(), (fcVerified, retired) => {
          const ice = makeSampleIce();
          academicTerm = makeSampleAcademicTerm();
          OpportunityInstances.update(docID, { ice, termID: academicTerm, verified: fcVerified, retired });
          doc = OpportunityInstances.findDoc(docID);
          expect(doc.ice.i).to.equal(ice.i);
          expect(doc.ice.c).to.equal(ice.c);
          expect(doc.ice.e).to.equal(ice.e);
          expect(doc.verified).to.equal(fcVerified);
          expect(doc.retired).to.equal(retired);
          expect(doc.termID).to.equal(academicTerm);
        }),
      );
      done();
    });

    it('Can dumpOne, removeIt, and restoreOne', function test4() {
      const oi: IOpportunityInstance = OpportunityInstances.findOne({});
      let docID = oi._id;
      const dumpObject = OpportunityInstances.dumpOne(docID);
      OpportunityInstances.removeIt(docID);
      expect(OpportunityInstances.isDefined(docID)).to.be.false;
      docID = OpportunityInstances.restoreOne(dumpObject);
      const restored = OpportunityInstances.findDoc(docID);
      expect(OpportunityInstances.isDefined(docID)).to.be.true;
      expect(oi.studentID).to.equal(restored.studentID);
      expect(oi.termID).to.equal(restored.termID);
      expect(oi.verified).to.equal(restored.verified);
      expect(oi.retired).to.equal(restored.retired);
    });

    it('Can checkIntegrity no errors', function test5() {
      const problems = OpportunityInstances.checkIntegrity();
      const oi: IOpportunityInstance = OpportunityInstances.findOne({});
      if (oi.verified) {
        expect(problems.length).to.equal(1);
      } else {
        expect(problems.length).to.equal(0);
      }
    });

    it('Can getOpportunityDoc, getAcademicTermDoc, getStudentDoc, and removeUser', function test6() {
      const oi: IOpportunityInstance = OpportunityInstances.findOne({});
      const docID = oi._id;
      const opportunity: IOpportunity = Opportunities.findDoc(oi.opportunityID);
      const oDoc = OpportunityInstances.getOpportunityDoc(docID);
      expect(opportunity.name).to.equal(oDoc.name);
      expect(opportunity.description).to.equal(oDoc.description);
      expect(opportunity.ice.i).to.equal(oDoc.ice.i);
      expect(opportunity.ice.c).to.equal(oDoc.ice.c);
      expect(opportunity.ice.e).to.equal(oDoc.ice.e);
      const academicTerm: IAcademicTerm = AcademicTerms.findDoc(oi.termID);
      const aDoc: IAcademicTerm = OpportunityInstances.getAcademicTermDoc(docID);
      expect(academicTerm.year).to.equal(aDoc.year);
      expect(academicTerm.term).to.equal(aDoc.term);
      expect(academicTerm.termNumber).to.equal(aDoc.termNumber);
      const student = Users.getProfile(oi.studentID);
      const sDoc = OpportunityInstances.getStudentDoc(docID);
      expect(student.username).to.equal(sDoc.username);
      expect(student.firstName).to.equal(sDoc.firstName);
      expect(student.lastName).to.equal(sDoc.lastName);
      OpportunityInstances.removeUser(oi.studentID);
      expect(OpportunityInstances.isDefined(docID)).to.be.false;
    });
  });
}
