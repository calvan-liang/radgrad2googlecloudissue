import { Meteor } from 'meteor/meteor';
import { moment } from 'meteor/momentjs:moment';
import { Roles } from 'meteor/alanning:roles';
import SimpleSchema from 'simpl-schema';
import BaseCollection from '../base/BaseCollection';
import { ROLE } from '../role/Role';
import { Users } from '../user/UserCollection';


/**
 * Represents a log of an Advisor talking to a Student.
 * @extends api/base.BaseCollection
 * @memberOf api/log
 */
class AdvisorLogCollection extends BaseCollection {

  /**
   * Creates the AdvisorLog collection.
   */
  constructor() {
    super('AdvisorLog', new SimpleSchema({
      studentID: { type: SimpleSchema.RegEx.Id },
      advisorID: { type: SimpleSchema.RegEx.Id },
      text: { type: String },
      createdOn: { type: Date },
    }));
  }

  /**
   * Defines an advisor log record.
   * @example
   * AdvisorLogs.define({
   *                      advisor: 'glau',
   *                      student: 'abi@hawaii.edu',
   *                      text: 'Talked about changing academic plan to B.S. CS from B.A. ICS.',
   *                      });
   * @param advisor The advisor's username.
   * @param student The student's username.
   * @param text The contents of the session.
   */
  define({ advisor, student, text, createdOn = moment().toDate() }) {
    const advisorID = Users.getID(advisor);
    const studentID = Users.getID(student);
    this.collection.insert({ advisorID, studentID, text, createdOn });
  }

  update(docID, { text }) {
    this.assertDefined(docID);
    const updateData = {};
    if (text) {
      updateData.text = text;
    }
    this.collection.update(docID, { $set: updateData });
  }

  /**
   * Removes all AdvisorLog documents referring to (the student) user.
   * @param user The student user, either the ID or the username.
   * @throws { Meteor.Error } If user is not an ID or username.
   */
  removeUser(user) {
    const studentID = Users.getID(user);
    this.collection.remove({ studentID });
  }

  /**
   * Returns the Advisor associated with the log instance.
   * @param instanceID the instance ID.
   * @returns {Object}
   */
  getAdvisorDoc(instanceID) {
    this.assertDefined(instanceID);
    const instance = this.findDoc(instanceID);
    return Users.getProfile(instance.advisorID);
  }

  /**
   * Returns the Student associated with the log instance.
   * @param instanceID the instance ID.
   * @returns {Object}
   */
  getStudentDoc(instanceID) {
    this.assertDefined(instanceID);
    const instance = this.findDoc(instanceID);
    return Users.getProfile(instance.studentID);
  }

  /**
   * Depending on the logged in user publish only their AdvisorLogs. If
   * the user is in the Role.ADMIN or Role.ADVISOR then publish all AdvisorLogs.
   */
  publish() {
    if (Meteor.isServer) {
      const instance = this;
      Meteor.publish(this.collectionName, function publish() {
        if (!this.userId) {  // https://github.com/meteor/meteor/issues/9619
          return this.ready();
        }
        if (Roles.userIsInRole(this.userId, [ROLE.ADMIN, ROLE.ADVISOR])) {
          return instance.collection.find();
        }
        return instance.collection.find({ studentID: this.userId });
      });
    }
  }

  /**
   * Returns an array of strings, each one representing an integrity problem with this collection.
   * Returns an empty array if no problems were found.
   * Checks studentID, advisorID.
   * @returns {Array} A (possibly empty) array of strings indicating integrity issues.
   */
  checkIntegrity() {
    const problems = [];
    this.find().forEach(doc => {
      if (!Users.isDefined(doc.studentID)) {
        problems.push(`Bad studentID: ${doc.studentID}`);
      }
      if (!Users.isDefined(doc.advisorID)) {
        problems.push(`Bad advisorID: ${doc.advisorID}`);
      }
    });
    return problems;
  }


  /**
   * Returns an object representing the Log docID in a format acceptable to define().
   * @param docID The docID of a Log.
   * @returns { Object } An object representing the definition of docID.
   */
  dumpOne(docID) {
    const doc = this.findDoc(docID);
    const student = Users.getProfile(doc.studentID).username;
    const advisor = Users.getProfile(doc.advisorID).username;
    const text = doc.text;
    const createdOn = doc.createdOn;
    return { student, advisor, text, createdOn };
  }
}

/**
 * Provides the singleton instance of this class to all other entities.
 * @type {api/log.AdvisorLogCollection}
 * @memberOf api/log
 */
export const AdvisorLogs = new AdvisorLogCollection();

