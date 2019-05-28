import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/erasaur:meteor-lodash';
import { Roles } from 'meteor/alanning:roles';
import SimpleSchema from 'simpl-schema';
import { ReactiveAggregate } from 'meteor/jcbernack:reactive-aggregate';
import { Courses } from './CourseCollection';
import { AcademicYearInstances } from '../degree-plan/AcademicYearInstanceCollection';
import { ROLE } from '../role/Role';
import { AcademicTerms } from '../academic-term/AcademicTermCollection';
import { Users } from '../user/UserCollection';
import { Slugs } from '../slug/SlugCollection';
import BaseCollection from '../base/BaseCollection';
import { makeCourseICE, iceSchema } from '../ice/IceProcessor';
import { ICourseInstanceDefine, ICourseInstanceUpdate } from '../../typings/radgrad'; // eslint-disable-line
import { StudentProfiles } from '../user/StudentProfileCollection';
import { CourseScoreboardName } from '../../startup/both/names';

/**
 * Represents the taking of a course by a specific student in a specific academicTerm.
 * @memberOf api/course
 * @extends api/base.BaseCollection
 */
class CourseInstanceCollection extends BaseCollection {
  public validGrades: string[];
  public readonly publicationNames: {
    student: string;
    perStudentAndAcademicTerm: string;
    publicStudent: string;
    publicSlugStudent: string;
    studentID: string;
    scoreboard: string;
  };

  /**
   * Creates the CourseInstance collection.
   */
  constructor() {
    super('CourseInstance', new SimpleSchema({
      termID: SimpleSchema.RegEx.Id,
      courseID: { type: SimpleSchema.RegEx.Id, optional: true },
      verified: Boolean,
      fromRegistrar: { type: Boolean, optional: true },
      grade: { type: String, optional: true },
      creditHrs: Number,
      note: { type: String, optional: true },
      studentID: SimpleSchema.RegEx.Id,
      ice: { type: iceSchema, optional: true },
      retired: { type: Boolean, optional: true },
    }));
    this.validGrades = ['', 'A', 'A+', 'A-',
      'B', 'B+', 'B-', 'C', 'C+', 'C-', 'D', 'D+', 'D-', 'F', 'CR', 'NC', '***', 'W', 'TBD', 'OTHER'];
    this.publicationNames = {
      student: this.collectionName,
      perStudentAndAcademicTerm: `${this.collectionName}.PerStudentAndAcademicTerm`,
      publicStudent: `${this.collectionName}.PublicStudent`,
      publicSlugStudent: `${this.collectionName}.PublicSlugStudent`,
      studentID: `${this.collectionName}.studentID`,
      scoreboard: `${this.collectionName}.Scoreboard`,
    };
    this.defineSchema = new SimpleSchema({
      academicTerm: String,
      course: String,
      verified: { type: Boolean, optional: true },
      fromRegistrar: { type: Boolean, optional: true },
      grade: { type: String, optional: true },
      note: { type: String, optional: true },
      student: String,
      creditHrs: SimpleSchema.Integer,
    });
    this.updateSchema = new SimpleSchema({
      termID: {
        type: String,
        optional: true,
      },
      verified: { type: Boolean, optional: true },
      fromRegistrar: { type: Boolean, optional: true },
      grade: { type: String, optional: true },
      creditHrs: { type: SimpleSchema.Integer, optional: true },
      note: { type: String, optional: true },
      ice: { type: iceSchema, optional: true },
      retired: { type: Boolean, optional: true },
    });
    if (Meteor.isServer) {
      // this.collection.rawCollection().createIndex({ _id: 1, studentID: 1, courseID: 1 });
    }
  }

  /**
   * Defines a new CourseInstance.
   * @example
   * // To define an instance of a CS course:
   * CourseInstances.define({ academicTerm: 'Spring-2016',
   *                          course: 'ics311',
   *                          verified: false,
   *                          fromRegistrar: false,
   *                          grade: 'B',
   *                          note: '',
   *                          student: 'joesmith@hawaii.edu',
   *                          creditHrs: 3 });
   * @param { Object } description Object with keys academicTerm, course, verified, fromRegistrar, grade,
   * note, student, creditHrs.
   * Required fields: academicTerm, student, course, which must all be valid slugs or instance IDs.
   * If the course slug is 'other', then the note field will be used as the course number.
   * Optional fields: note (defaults to ''), valid (defaults to false), grade (defaults to '').
   * CreditHrs defaults to the creditHrs assigned to course, or can be provided explicitly.
   * @throws {Meteor.Error} If the definition includes an undefined course or student.
   * @returns The newly created docID.
   */
  public define({ academicTerm, course, verified = false, fromRegistrar = false, grade = '', note = '', student, creditHrs, retired = false }: ICourseInstanceDefine) {
    // Check arguments
    const termID = AcademicTerms.getID(academicTerm);
    const academicTermDoc = AcademicTerms.findDoc(termID);
    const courseID = Courses.getID(course);
    const studentID = Users.getID(student);
    const profile = Users.getProfile(studentID);
    // ensure the AcademicYearInstance is defined.
    if (academicTermDoc.term === AcademicTerms.SPRING || academicTermDoc.term === AcademicTerms.SUMMER || academicTermDoc.term === AcademicTerms.WINTER) {
      AcademicYearInstances.define({ year: academicTermDoc.year - 1, student: profile.username });
    } else {
      AcademicYearInstances.define({ year: academicTermDoc.year, student: profile.username });
    }
    const ice = makeCourseICE(course, grade);
    if ((typeof verified) !== 'boolean') {
      throw new Meteor.Error(`${verified} is not a boolean.`);
    }
    if (!_.includes(this.validGrades, grade)) {
      if (grade.startsWith('I')) {
        grade = grade.substring(1); // eslint-disable-line no-param-reassign
      }
      if (!_.includes(this.validGrades, grade)) {
        throw new Meteor.Error(`${grade} is not a valid grade.`);
      }
    }
    if (!creditHrs) {
      /* eslint-disable-next-line no-param-reassign */
      creditHrs = Courses.findDoc(courseID).creditHrs;
    }
    // Define and return the CourseInstance
    return this.collection.insert({
      termID,
      courseID,
      verified,
      fromRegistrar,
      grade,
      studentID,
      creditHrs,
      note,
      ice,
      retired,
    });
  }

  /**
   * Update the course instance. Only a subset of fields can be updated.
   * @param docID The course instance docID (required).
   * @param termID the termID for the course instance optional.
   * @param verified boolean optional.
   * @param fromRegistrar boolean optional.
   * @param grade optional.
   * @param creditHrs optional.
   * @param note optional.
   * @param ice an object with fields i, c, e (optional)
   */
  public update(docID: string, { termID, verified, fromRegistrar, grade, creditHrs, note, ice, retired }: ICourseInstanceUpdate) {
    // console.log('CourseInstances.update', termID, verified, fromRegistrar, grade, creditHrs, note, ice);
    this.assertDefined(docID);
    const updateData: ICourseInstanceUpdate = {};
    if (termID) {
      updateData.termID = termID;
    }
    if (_.isBoolean(verified)) {
      updateData.verified = verified;
    }
    if (_.isBoolean(fromRegistrar)) {
      updateData.fromRegistrar = fromRegistrar;
    }
    if (grade) {
      updateData.grade = grade;
      const ci = this.findDoc(docID);
      const slug = Courses.findSlugByID(ci.courseID);
      updateData.ice = makeCourseICE(slug, grade);
    }
    if (creditHrs) {
      updateData.creditHrs = creditHrs;
    }
    if (note) {
      updateData.note = note;
    }
    if (ice) {
      updateData.ice = ice;
    }
    if (_.isBoolean(retired)) {
      updateData.retired = retired;
    }
    this.collection.update(docID, { $set: updateData });
  }

  /**
   * Remove the course instance.
   * @param docID The docID of the course instance.
   */
  public removeIt(docID: string) {
    this.assertDefined(docID);
    // OK, clear to delete.
    return super.removeIt(docID);
  }

  /**
   * Removes all CourseInstance documents referring to user.
   * @param user The user, either the ID or the username.
   * @throws { Meteor.Error } If user is not an ID or username.
   */
  public removeUser(user: string) {
    const studentID = Users.getID(user);
    this.collection.remove({ studentID });
  }

  /**
   * Implementation of assertValidRoleForMethod. Asserts that userId is logged in as an Admin, Advisor or
   * Student.
   * This is used in the define, update, and removeIt Meteor methods associated with each class.
   * @param userId The userId of the logged in user. Can be null or undefined
   * @throws { Meteor.Error } If there is no logged in user, or the user is not an Admin or Advisor.
   */
  public assertValidRoleForMethod(userId: string) {
    this.assertRole(userId, [ROLE.ADMIN, ROLE.ADVISOR, ROLE.STUDENT]);
  }

  /**
   * Returns the Course associated with the CourseInstance with the given instanceID.
   * @param instanceID The id of the CourseInstance.
   * @returns {Object} The associated Course.
   * @throws {Meteor.Error} If instanceID is not a valid ID.
   */
  public getCourseDoc(instanceID: string) {
    this.assertDefined(instanceID);
    const instance = this.collection.findOne({ _id: instanceID });
    return Courses.findDoc(instance.courseID);
  }

  /**
   * Returns the Course slug for the instance's corresponding Course.
   * @param instanceID The CourseInstanceID.
   * @return {string} The course slug.
   */
  public getCourseSlug(instanceID: string) {
    this.assertDefined(instanceID);
    const instance = this.collection.findOne({ _id: instanceID });
    return Courses.getSlug(instance.courseID);
  }

  /**
   * Gets the publication names.
   * @returns {{student: string; perStudentAndAcademicTerm: string; publicStudent: string; publicSlugStudent: string; studentID: string}}
   */
  public getPublicationNames() {
    return this.publicationNames;
  }

  /**
   * Returns the AcademicTerm associated with the CourseInstance with the given instanceID.
   * @param instanceID The id of the CourseInstance.
   * @returns {Object} The associated AcademicTerm.
   * @throws {Meteor.Error} If instanceID is not a valid ID.
   */
  public getAcademicTermDoc(instanceID: string) {
    this.assertDefined(instanceID);
    const instance = this.collection.findOne({ _id: instanceID });
    return AcademicTerms.findDoc(instance.termID);
  }

  /**
   * Returns a schema for the update method's second parameter.
   * @returns { SimpleSchema }.
   */
  public getUpdateSchema() {
    const terms = AcademicTerms.find({}, { sort: { termNumber: 1 }, fields: { _id: 1 } }).fetch();
    console.log(terms);
    this.updateSchema = new SimpleSchema({
      termID: {
        type: String,
        optional: true,
        allowedValues: _.map(terms, (term) => term._id),
      },
      verified: { type: Boolean, optional: true },
      fromRegistrar: { type: Boolean, optional: true },
      grade: { type: String, optional: true },
      creditHrs: { type: SimpleSchema.Integer, optional: true },
      note: { type: String, optional: true },
      ice: { type: iceSchema, optional: true },
      retired: { type: Boolean, optional: true },
    });

    return this.updateSchema;
  }

  /**
   * Returns the Student profile associated with the CourseInstance with the given instanceID.
   * @param instanceID The id of the CourseInstance.
   * @returns {Object} The associated Student profile.
   * @throws {Meteor.Error} If instanceID is not a valid ID.
   */
  public getStudentDoc(instanceID: string) {
    this.assertDefined(instanceID);
    const instance = this.collection.findOne({ _id: instanceID });
    return Users.getProfile(instance.studentID);
  }

  /**
   * @returns { String } The course name associated with courseInstanceID.
   * @param courseInstanceID The course instance ID.
   * @throws {Meteor.Error} If courseInstanceID is not a valid ID.
   */
  public findCourseName(courseInstanceID: string) {
    this.assertDefined(courseInstanceID);
    const courseID = this.findDoc(courseInstanceID).courseID;
    return Courses.findDoc(courseID).name;
  }

  /**
   * Returns the courseInstance document associated with academicTerm, course, and student.
   * @param academicTerm The academicTerm (slug or ID).
   * @param course The course (slug or ID).
   * @param student The student (slug or ID)
   * @returns { Object } Returns the document or null if not found.
   * @throws { Meteor.Error } If academicTerm, course, or student does not exist.
   */
  public findCourseInstanceDoc(academicTerm: string, course: string, student: string) {
    const termID = AcademicTerms.getID(academicTerm);
    const studentID = Users.getID(student);
    const courseID = Courses.getID(course);
    return this.collection.findOne({ termID, studentID, courseID });
  }

  /**
   * Returns true if there exists a CourseInstance for the given academicTerm, course, and student.
   * @param academicTerm The academicTerm (slug or ID).
   * @param course The course (slug or ID).
   * @param student The student (slug or ID).
   * @returns True if the course instance exists.
   * @throws { Meteor.Error } If academicTerm, course, or student does not exist.
   */
  public isCourseInstance(academicTerm: string, course: string, student: string) {
    return !!this.findCourseInstanceDoc(academicTerm, course, student);
  }

  /**
   * @returns { boolean } If the course is an interesting course associated with courseInstanceID.
   * @param courseInstanceID The course instance ID.
   * @throws {Meteor.Error} If courseInstanceID is not a valid ID.
   */
  public isInteresting(courseInstanceID: string) {
    this.assertDefined(courseInstanceID);
    const instance = this.findDoc(courseInstanceID);
    return Courses.findDoc(instance.courseID).num !== Courses.unInterestingSlug;
  }

  /**
   * Depending on the logged in user publish only their CourseInstances. If
   * the user is in the Role.ADMIN then publish all CourseInstances.
   */
  public publish() {
    if (Meteor.isServer) {
      const instance = this;
      Meteor.publish(this.publicationNames.student, function publish() {
        if (!this.userId) { // https://github.com/meteor/meteor/issues/9619
          return this.ready();
        }
        if (Roles.userIsInRole(this.userId, [ROLE.ADMIN, ROLE.ADVISOR, ROLE.FACULTY])) {
          return instance.collection.find();
        }
        return instance.collection.find({ studentID: this.userId });
      });
      Meteor.publish(this.publicationNames.perStudentAndAcademicTerm,
        function perStudentAndAcademicTerm(studentID, termID) { // eslint-disable-line meteor/audit-argument-checks
          new SimpleSchema({
            studentID: { type: String },
            termID: { type: String },
          }).validate({ studentID, termID });
          return instance.collection.find({ studentID, termID });
        });
      Meteor.publish(this.publicationNames.publicStudent, function publicStudentPublish() {
        const userID = Meteor.userId();
        const willingToShare = [];
        const profiles = StudentProfiles.find().fetch();
        _.forEach(profiles, (p) => {
          if (p.shareCourses) {
            willingToShare.push(p.userID);
          }
        });
        // console.log(willingToShare);
        ReactiveAggregate(this, instance.collection, [
          {
            $match: {
              $expr: {
                $or: [
                  { $in: ['$studentID', willingToShare] },
                  { $eq: [Roles.userIsInRole(userID, [ROLE.ADMIN, ROLE.ADVISOR, ROLE.FACULTY]), true] }],
              },
            },
          },
          { $project: { studentID: 1, termID: 1, courseID: 1 } },
        ]);
        // verified: Boolean,
        //   fromRegistrar: { type: Boolean, optional: true },
        // grade: { type: String, optional: true },
        // creditHrs: Number,
        //   note: { type: String, optional: true },
        // studentID: SimpleSchema.RegEx.Id,
        //   ice: { type: iceSchema, optional: true },
        // retired: { type: Boolean, optional: true },
        //
        // return instance.collection.find({}, { fields: { studentID: 1, termID: 1, courseID: 1 } });
      });
      Meteor.publish(this.publicationNames.scoreboard, function publishCourseScoreboard() {
        ReactiveAggregate(this, instance.collection, [
          {
            $addFields: { courseTerm: { $concat: ['$courseID', ' ', '$termID'] } },
          },
          {
            $group: {
              _id: '$courseTerm',
              count: { $sum: 1 },
            },
          },
          { $project: { count: 1, termID: 1, courseID: 1 } },
        ], { clientCollection: CourseScoreboardName });
      });
      Meteor.publish(this.publicationNames.publicSlugStudent, function publicSlugPublish(courseSlug) { // eslint-disable-line meteor/audit-argument-checks
        // check the courseID.
        const slug = Slugs.findDoc({ name: courseSlug });
        const course = Courses.findDoc({ slugID: slug._id });
        const courseID = course._id;
        new SimpleSchema({
          courseID: { type: String },
        }).validate({ courseID });

        return instance.collection.find({ courseID }, { fields: { studentID: 1, termID: 1, courseID: 1 } });
      });
      Meteor.publish(this.publicationNames.studentID, function filterStudentID(studentID) { // eslint-disable-line meteor/audit-argument-checks
        new SimpleSchema({
          studentID: { type: String },
        }).validate({ studentID });
        // console.log(Roles.userIsInRole(studentID, [ROLE.ADMIN, ROLE.ADVISOR, ROLE.FACULTY]));
        if (Roles.userIsInRole(studentID, [ROLE.ADMIN, ROLE.ADVISOR, ROLE.FACULTY])) {
          return instance.collection.find();
        }
        return instance.collection.find({ studentID });
      });
    }
  }

  /**
   * @returns {string} A formatted string representing the course instance.
   * @param courseInstanceID The course instance ID.
   * @throws {Meteor.Error} If not a valid ID.
   */
  public toString(courseInstanceID: string) {
    this.assertDefined(courseInstanceID);
    const courseInstanceDoc = this.findDoc(courseInstanceID);
    const courseName = this.findCourseName(courseInstanceID);
    const academicTerm = AcademicTerms.toString(courseInstanceDoc.termID);
    const grade = courseInstanceDoc.grade;
    return `[CI ${academicTerm} ${courseName} ${grade}]`;
  }

  /**
   * Updates the CourseInstance's grade. This should be used for planning purposes.
   * @param courseInstanceID The course instance ID.
   * @param grade The new grade.
   * @throws {Meteor.Error} If courseInstanceID is not a valid ID.
   */
  public updateGrade(courseInstanceID: string, grade: string) {
    this.assertDefined(courseInstanceID);
    const ice = makeCourseICE(courseInstanceID, grade);
    this.collection.update({ _id: courseInstanceID }, { $set: { grade, ice, verified: false } });
  }

  /**
   * Updates the CourseInstance's AcademicTerm.
   * @param courseInstanceID The course instance ID.
   * @param termID The academicTerm id.
   * @throws {Meteor.Error} If courseInstanceID is not a valid ID.
   */
  public updateAcademicTerm(courseInstanceID: string, termID: string) {
    this.assertDefined(courseInstanceID);
    AcademicTerms.assertAcademicTerm(termID);
    this.collection.update({ _id: courseInstanceID }, { $set: { termID } });
  }

  /**
   * Returns an array of strings, each one representing an integrity problem with this collection.
   * Returns an empty array if no problems were found.
   * Checks termID, courseID, and studentID.
   * @returns {Array} A (possibly empty) array of strings indicating integrity issues.
   */
  public checkIntegrity() {
    const problems = [];
    this.find().forEach((doc) => {
      if (!AcademicTerms.isDefined(doc.termID)) {
        problems.push(`Bad termID: ${doc.termID}`);
      }
      if (!Courses.isDefined(doc.courseID)) {
        problems.push(`Bad courseID: ${doc.courseID}`);
      }
      if (!Users.isDefined(doc.studentID)) {
        problems.push(`Bad studentID: ${doc.studentID}`);
      }
    });
    return problems;
  }

  /**
   * Returns an object representing the CourseInstance docID in a format acceptable to define().
   * @param docID The docID of a CourseInstance.
   * @returns { Object } An object representing the definition of docID.
   */
  public dumpOne(docID: string): ICourseInstanceDefine {
    const doc = this.findDoc(docID);
    const academicTerm = AcademicTerms.findSlugByID(doc.termID);
    const course = Courses.findSlugByID(doc.courseID);
    const note = doc.note;
    const verified = doc.verified;
    const creditHrs = doc.creditHrs;
    const grade = doc.grade;
    const fromRegistrar = doc.fromRegistrar;
    const student = Users.getProfile(doc.studentID).username;
    const retired = doc.retired;
    return { academicTerm, course, note, verified, fromRegistrar, creditHrs, grade, student, retired };
  }
}

/**
 * Provides the singleton instance of this class to all other entities.
 * @memberOf api/course
 */
export const CourseInstances = new CourseInstanceCollection();
