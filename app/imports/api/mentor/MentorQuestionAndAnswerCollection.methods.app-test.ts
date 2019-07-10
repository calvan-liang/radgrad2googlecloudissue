import { Meteor } from 'meteor/meteor';
import { expect } from 'chai';
import { defineMethod, removeItMethod, updateMethod } from '../base/BaseCollection.methods';
import { MentorAnswers } from './MentorAnswerCollection';
import { MentorQuestions } from './MentorQuestionCollection';
import { defineTestFixturesMethod, withRadGradSubscriptions, withLoggedInUser } from '../test/test-utilities';

/* eslint prefer-arrow-callback: "off", no-unused-expressions: "off" */
/* eslint-env mocha */

if (Meteor.isClient) {
  describe('MentorQuestionAndAnswerCollection Meteor Methods ', function test() {
    // this.timeout(10000);
    const questionCollectionName = MentorQuestions.getCollectionName();
    const questionDefinition = {
      question: 'question',
      slug: 'test-question',
      student: 'abi@hawaii.edu',
    };
    const answerCollectionName = MentorAnswers.getCollectionName();
    const answerDefinition = {
      question: 'test-question',
      mentor: 'rbrewer@gmail.com',
      text: 'mentor-answer',
    };

    before(function (done) {
      this.timeout(5000);
      defineTestFixturesMethod.call(['minimal', 'abi.student', 'rbrewer.mentor'], done);
    });

    it('Define Method (Question)', async function (done) {
      try {
        await withLoggedInUser();
        await withRadGradSubscriptions();
        const questionID = await defineMethod.callPromise({
          collectionName: questionCollectionName,
          definitionData: questionDefinition,
        });
        expect(MentorQuestions.isDefined(questionID)).to.be.true;
        done();
      } catch (e) {
        done(e);
      }
    });

    it('Define Method (Answer)', async function (done) {
      try {
        const answerID = await defineMethod.callPromise({
          collectionName: answerCollectionName,
          definitionData: answerDefinition,
        });
        expect(MentorAnswers.isDefined(answerID)).to.be.true;
        done();
      } catch (e) {
        done(e);
      }
    });

    it('Question Update Method', async function (done) {
      try {
        const id = MentorQuestions.findIdBySlug(questionDefinition.slug);
        const question = 'updated CareerGoal name';
        const student = 'abi@hawaii.edu';
        const moderated = true;
        const visible = false;
        const moderatorComments = 'comments';
        await updateMethod.callPromise({
          collectionName: questionCollectionName,
          updateData: { id, question, student, moderated, visible, moderatorComments },
        });
        const doc = MentorQuestions.findDoc(id);
        expect(doc.question).to.equal(question);
        done();
      } catch (e) {
        done(e);
      }
    });

    it('Answer Update Method', async function (done) {
      try {
        const questionID = MentorQuestions.findIdBySlug(questionDefinition.slug);
        const id = MentorAnswers.findDoc({ questionID })._id;
        const text = 'updated answer text';
        await updateMethod.callPromise({ collectionName: answerCollectionName, updateData: { id, text } });
        const doc = MentorAnswers.findDoc(id);
        expect(doc.text).to.equal(text);
        done();
      } catch (e) {
        done(e);
      }
    });

    it('Question & Answer Remove Methods', async function (done) {
      try {
        const questionID = MentorQuestions.findIdBySlug(questionDefinition.slug);
        const answerID = MentorAnswers.findDoc({ questionID })._id;
        await removeItMethod.callPromise({ collectionName: answerCollectionName, instance: answerID });
        expect(MentorAnswers.isDefined(answerID)).to.be.false;
        await removeItMethod.callPromise({ collectionName: questionCollectionName, instance: questionID });
        expect(MentorQuestions.isDefined(questionID)).to.be.false;
        done();
      } catch (e) {
        done(e);
      }
    });
  });
}
