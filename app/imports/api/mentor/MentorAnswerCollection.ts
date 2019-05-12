import SimpleSchema from 'simpl-schema';
import BaseCollection from '../base/BaseCollection';
import { MentorQuestions } from './MentorQuestionCollection';
import { ROLE } from '../role/Role';
import { Users } from '../user/UserCollection';
import { IMentorAnswerDefine, IMentorAnswerUpdate } from '../../typings/radgrad'; // eslint-disable-line

/**
 * Represents a mentor answer.
 * @extends api/base.BaseCollection
 * @memberOf api/mentor
 */
class MentorAnswerCollection extends BaseCollection {
  /**
   * Creates the Mentor Answer collection.
   */
  constructor() {
    super('MentorAnswer', new SimpleSchema({
      questionID: { type: SimpleSchema.RegEx.Id },
      mentorID: { type: SimpleSchema.RegEx.Id },
      text: { type: String },
      retired: { type: Boolean, optional: true },
    }));
  }

  /**
   * Defines the mentor answer for a given question.
   * @example
   * MentorAnswers.define({ question: 'data-science-career-prep',
   *                        mentor: 'rbrewer',
   *                        text: 'Understanding the incredible amount of data that humankind is constantly producing is one of the fundamental challenges facing society. The best way to learn is to pick a topic that interests you, find a public source of data in that area, and start actually looking at the data. What patterns can you see? Start asking questions, and figure out how to answer them from the data. Quick plug: Tableau is great for exploring data graphically, and answering questions about data. It's free for students (http://www.tableau.com/academic/students), and Tableau Public (https://public.tableau.com/s/) is a great place to find interesting public data sets and visual analytics based on the data.',
   *                        });
   * @param question The question (slug or ID).
   * @param mentor The mentor who answered the question (slug or ID).
   * @param text The answer itself.
   * @return { String } The docID of the answer.
   * @throws { Meteor.Error } If question or mentor is undefined.
   */
  public define({ question, mentor, text }: IMentorAnswerDefine) {
    const questionID = MentorQuestions.getID(question);
    const mentorID = Users.getID(mentor);
    Users.assertInRole(mentorID, ROLE.MENTOR);
    return this.collection.insert({ questionID, mentorID, text });
  }

  /**
   * Updates the mentor answer.
   * @param docID the docID of the mentor answer.
   * @param text the updated text.
   */
  public update(docID: string, { text }: IMentorAnswerUpdate) {
    this.assertDefined(docID);
    const updateData: IMentorAnswerUpdate = {};
    if (text) {
      updateData.text = text;
    }
    this.collection.update(docID, { $set: updateData });
  }

  /**
   * Remove the mentor answer.
   * @param docID the ID of the answer.
   */
  public removeIt(docID: string) {
    this.assertDefined(docID);
    // OK, clear to delete.
    return super.removeIt(docID);
  }

  /**
   * Removes all the MentorAnswers to the given MentorQuestion.
   * @param question the question's ID or slug.
   */
  public removeQuestion(question: string) {
    const questionID = MentorQuestions.getID(question);
    this.collection.remove({ questionID });
  }

  /**
   * Removes all the MentorAnswers associated with the given user.
   * @param user the user's ID or username.
   */
  public removeUser(user: string) {
    const mentorID = Users.getID(user);
    this.collection.remove({ mentorID });
  }

  /**
   * Returns the MentorAnswer document associated with question and mentor.
   * @param question The question (slug or ID)
   * @param mentor The mentor (slug or ID)
   * @return { Object } Returns the document or null if not found.
   * @throws { Meteor.Error } If question or mentor does not exist.
   */
  public findMentorAnswerDoc(question: string, mentor: string) {
    const questionID = MentorQuestions.getID(question);
    const mentorID = Users.getID(mentor);
    return this.collection.findOne({ questionID, mentorID });
  }

  /**
   * Returns true if there exists a MentorAnswer for the question and mentor.
   * @param question The question (slug or ID)
   * @param mentor The mentor (slug or ID)
   * @return { Object } True if the MentorAnswer exists.
   * @throws { Meteor.Error } If question or mentor does not exist.
   */
  public isMentorAnswer(question: string, mentor: string) {
    return !!this.findMentorAnswerDoc(question, mentor);
  }

  /**
   * Implementation of assertValidRoleForMethod. Asserts that userId is logged in as an Admin, Advisor or
   * Mentor.
   * This is used in the define, update, and removeIt Meteor methods associated with each class.
   * @param userId The userId of the logged in user. Can be null or undefined
   * @throws { Meteor.Error } If there is no logged in user, or the user is not an Admin or Advisor.
   */
  public assertValidRoleForMethod(userId: string) {
    this.assertRole(userId, [ROLE.ADMIN, ROLE.ADVISOR, ROLE.MENTOR]);
  }

  /**
   * Returns the text for the given questionID.
   * @param questionID the id of the question.
   */
  public getAnswers(questionID: string) {
    return this.collection.find({ questionID });
  }

  /**
   * Returns an array of strings, each one representing an integrity problem with this collection.
   * Returns an empty array if no problems were found.
   * Checks questionID, mentorID
   * @returns {Array} A (possibly empty) array of strings indicating integrity issues.
   */
  public checkIntegrity() {
    const problems = [];
    this.find().forEach((doc) => {
      if (!MentorQuestions.isDefined(doc.questionID)) {
        problems.push(`Bad questionID: ${doc.questionID}`);
      }
      if (!Users.isDefined(doc.mentorID)) {
        problems.push(`Bad mentorID: ${doc.mentorID}`);
      }
    });
    return problems;
  }

  /**
   * Returns an object representing the MentorAnswer docID in a format acceptable to define().
   * @param docID The docID of a MentorQuestion.
   * @returns { Object } An object representing the definition of docID.
   */
  public dumpOne(docID: string): IMentorAnswerDefine {
    const doc = this.findDoc(docID);
    const question = MentorQuestions.findSlugByID(doc.questionID);
    const mentor = Users.getProfile(doc.mentorID).username;
    const text = doc.text;
    return { question, mentor, text };
  }
}

/**
 * Provides the singleton instance of this class to all other entities.
 * @type {api/mentor.MentorAnswerCollection}
 * @memberOf api/mentor
 */
export const MentorAnswers = new MentorAnswerCollection();
