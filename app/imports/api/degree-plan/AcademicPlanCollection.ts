import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/erasaur:meteor-lodash';
import SimpleSchema from 'simpl-schema';
import BaseSlugCollection from '../base/BaseSlugCollection';
import { DesiredDegrees } from './DesiredDegreeCollection';
import { AcademicTerms } from '../academic-term/AcademicTermCollection';
import { Slugs } from '../slug/SlugCollection';
import { Users } from '../user/UserCollection';
import { IAcademicPlanDefine, IAcademicPlanUpdate } from '../../typings/radgrad'; // eslint-disable-line

/**
 * AcademicPlans holds the different academic plans possible in this department.
 * @extends api/base.BaseSlugCollection
 * @memberOf api/degree-plan
 */
class AcademicPlanCollection extends BaseSlugCollection {

  /**
   * Creates the AcademicPlan collection.
   */
  constructor() {
    super('AcademicPlan', new SimpleSchema({
      name: { type: String },
      description: String,
      slugID: SimpleSchema.RegEx.Id,
      degreeID: SimpleSchema.RegEx.Id,
      effectiveAcademicTermID: SimpleSchema.RegEx.Id,
      termNumber: Number,
      year: Number,
      // CAM: maxCount of 20 is for quarter system bachelors and masters.
      //      minCount of 6 for 2 year plan
      coursesPerAcademicTerm: { type: Array, minCount: 6, maxCount: 20 },
      'coursesPerAcademicTerm.$': Number,
      courseList: [String],
      retired: { type: Boolean, optional: true },
    }));
    if (Meteor.isServer) {
      this.collection._ensureIndex({ _id: 1, degreeID: 1, effectiveAcademicTermID: 1 });
    }
    this.defineSchema = new SimpleSchema({
      slug: String,
      degreeSlug: String,
      name: String,
      description: String,
      academicTerm: String,
      coursesPerAcademicTerm: [Number],
      courseList: [String],
    });
    this.updateSchema = new SimpleSchema({
      degreeSlug: { type: String, optional: true },
      name: { type: String, optional: true },
      academicTerm: { type: String, optional: true },
      coursesPerAcademicTerm: { type: Array, optional: true },
      'coursesPerAcademicTerm.$': { type: Number },
      courseList: { type: Array, optional: true },
      'courseList.$': { type: String },
      retired: { type: Boolean, optional: true },
    });
  }

  /**
   * Defines an AcademicPlan.
   * @example
   *     AcademicPlans.define({
   *                        slug: 'bs-cs-2016',
   *                        degreeSlug: 'bs-cs',
   *                        name: 'B.S. in Computer Science',
   *                        description: 'The BS in CS degree offers a solid foundation in computer science.',
   *                        academicTerm: 'Spring-2016',
   *                        coursesPerAcademicTerm: [2, 2, 0, 2, 2, 0, 2, 2, 0, 2, 2, 0],
   *                        courseList: ['ics111-1', 'ics141-1, 'ics211-1', 'ics241-1', 'ics311-1', 'ics314-1',
   *                                     'ics212-1', 'ics321-1', 'ics313,ics361-1', 'ics312,ics331-1', 'ics332-1',
   *                                     'ics400+-1', 'ics400+-2', 'ics400+-3', 'ics400+-4', 'ics400+-5'] })
   * @param slug The slug for the academic plan.
   * @param degreeSlug The slug for the desired degree.
   * @param name The name of the academic plan.
   * @param description The description of the academic plan.
   * @param academicTerm the slug for the academicTerm.
   * @param coursesPerAcademicTerm an array of the number of courses to take in each academicTerm.
   * @param courseList an array of PlanChoices. The choices for each course.
   * @param retired boolean optional defaults to false.
   * @returns {*}
   */
  public define({ slug, degreeSlug, name, description, academicTerm, coursesPerAcademicTerm, courseList, retired = false }: IAcademicPlanDefine) {
    const degreeID = Slugs.getEntityID(degreeSlug, 'DesiredDegree');
    const effectiveAcademicTermID = AcademicTerms.getID(academicTerm);
    const doc = this.collection.findOne({ degreeID, name, effectiveAcademicTermID });
    if (doc) {
      return doc._id;
    }
    // Get SlugID, throw error if found.
    const slugID = Slugs.define({ name: slug, entityName: this.getType() });
    const academicTermDoc = AcademicTerms.findDoc(effectiveAcademicTermID);
    const termNumber = academicTermDoc.termNumber;
    const year = academicTermDoc.year;
    const planID = this.collection.insert({
      slugID,
      degreeID,
      name,
      description,
      effectiveAcademicTermID,
      termNumber,
      year,
      coursesPerAcademicTerm,
      courseList,
      retired,
    });
    // Connect the Slug to this AcademicPlan.
    Slugs.updateEntityID(slugID, planID);
    return planID;
  }

  /**
   * Updates the AcademicPlan, instance.
   * @param instance the docID or slug associated with this AcademicPlan.
   * @param degreeSlug the slug for the DesiredDegree that this plan satisfies.
   * @param name the name of this AcademicPlan.
   * @param academicTerm the first academicTerm this plan is effective.
   * @param coursesPerAcademicTerm an array of the number of courses per academicTerm.
   * @param courseList an array of PlanChoices, the choices for each course.
   * @param retired boolean, optional.
   */
  public update(instance, { degreeSlug, name, academicTerm, coursesPerAcademicTerm, courseList, retired }: IAcademicPlanUpdate) {
    const docID = this.getID(instance);
    const updateData: { degreeID?: string; name?: string; effectiveAcademicTermID?: string; coursesPerAcademicTerm?: number[]; courseList?: string[]; retired?: boolean; } = {};
    if (degreeSlug) {
      updateData.degreeID = DesiredDegrees.getID(degreeSlug);
    }
    if (name) {
      updateData.name = name;
    }
    if (academicTerm) {
      updateData.effectiveAcademicTermID = AcademicTerms.getID(academicTerm);
    }
    if (coursesPerAcademicTerm) {
      if (!Array.isArray(coursesPerAcademicTerm)) {
        throw new Meteor.Error(`CoursesPerAcademicTerm ${coursesPerAcademicTerm} is not an Array.`);
      }
      _.forEach(coursesPerAcademicTerm, (cps) => {
        if (!_.isNumber(cps)) {
          throw new Meteor.Error(`CoursePerAcademicTerm ${cps} is not a Number.`);
        }
      });
      updateData.coursesPerAcademicTerm = coursesPerAcademicTerm;
    }
    if (courseList) {
      if (!Array.isArray(courseList)) {
        throw new Meteor.Error(`CourseList ${courseList} is not an Array.`);
      }
      _.forEach(courseList, (pc) => {
        if (!_.isString(pc)) {
          throw new Meteor.Error(`CourseList ${pc} is not a PlanChoice.`);
        }
      });
      updateData.courseList = courseList;
    }
    if (_.isBoolean(retired)) {
      updateData.retired = retired;
    }
    this.collection.update(docID, { $set: updateData });
  }

  /**
   * Remove the AcademicPlan.
   * @param instance The docID or slug of the entity to be removed.
   * @throws { Meteor.Error } If docID is not an AcademicPlan, or if this plan is referenced by a User.
   */
  public removeIt(instance: string) {
    const academicPlanID = this.getID(instance);
    // Check that no student is using this AcademicPlan.
    const isReferenced = Users.someProfiles((profile) => profile.academicPlanID === academicPlanID);
    if (isReferenced) {
      throw new Meteor.Error(`AcademicPlan ${instance} is referenced.`);
    }
    return super.removeIt(academicPlanID);
  }

  /**
   * Returns an array of problems. Checks the termID and DesiredDegree ID.
   * @returns {Array} An array of problem messages.
   */
  public checkIntegrity() {
    const problems = [];
    this.find().forEach((doc) => {
      if (!Slugs.isDefined(doc.slugID)) {
        problems.push(`Bad slugID: ${doc.slugID}`);
      }
      if (!AcademicTerms.isDefined(doc.effectiveAcademicTermID)) {
        problems.push(`Bad termID: ${doc.effectiveAcademicTermID}`);
      }
      if (!DesiredDegrees.isDefined(doc.degreeID)) {
        problems.push(`Bad desiredDegreeID: ${doc.degreeID}`);
      }
      let numCourses = 0;
      _.forEach(doc.coursesPerAcademicTerm, (n) => {
        numCourses += n;
      });
      if (doc.courseList.length !== numCourses) {
        problems.push(`Mismatch between courseList.length ${doc.courseList.length} and sum of coursesPerAcademicTerm ${numCourses}`);
      }
    });
    return problems;
  }

  /**
   * Returns the AcademicPlans that are effective on or after termNumber for the given DesiredDegree.
   * @param degree the desired degree either a slug or id.
   * @param academicTermNumber (optional) the academicTerm number. if undefined returns the latest AcademicPlans.
   * @return {any}
   */
  public getPlansForDegree(degree: string, academicTermNumber?: number) {
    const degreeID = DesiredDegrees.getID(degree);
    if (!academicTermNumber) {
      return this.collection.find({ degreeID, termNumber: this.getLatestAcademicTermNumber() }).fetch();
    }
    return this.collection.find({ degreeID, termNumber: { $gte: academicTermNumber } }).fetch();
  }

  /**
   * Returns an array of the latest AcademicPlans.
   * @return {array}
   */
  public getLatestPlans() {
    const termNumber = this.getLatestAcademicTermNumber();
    return this.collection.find({ termNumber }).fetch();
  }

  /**
   * Returns the largest academicTerm number.
   * @return {number}
   */
  public getLatestAcademicTermNumber() {
    const plans = this.collection.find({}, { sort: { termNumber: 1 } }).fetch();
    const currentTerm = AcademicTerms.getCurrentAcademicTermDoc();
    let max = 0;
    let latest = 0;
    _.forEach(plans, (p) => {
      if (max < p.termNumber) {
        max = p.termNumber;
      }
      if (p.termNumber <= currentTerm.termNumber && latest < p.termNumber) {
        latest = p.termNumber;
      }
    });
    if (latest !== 0) {
      return latest;
    }
    return max;
  }

  /**
   * Returns an array of years that have AcademicPlans.
   * @returns {number[]} an array of the years that have AcademicPlans.
   */
  public getPlanYears() {
    const plans = this.collection.find({}).fetch();
    return _.uniq(_.map(plans, (p) => p.year));
  }

  /**
   * Returns the plan name and year for the given plan id.
   * @param planID the id of the academic plan.
   * @return {string}
   */
  public toFullString(planID: string) {
    const plan = this.findDoc(planID);
    const academicTerm = AcademicTerms.findDoc(plan.effectiveAcademicTermID);
    return `${plan.name} (${academicTerm.year})`;
  }

  /**
   * Returns true if the give academic plan includes graduate classes.
   * @param {string} planID the id of the academic plan.
   * @returns {boolean}
   */
  public isGraduatePlan(planID: string): boolean {
    const plan = this.findDoc(planID);
    // console.log('isGraduatePlan', planID, plan.coursesPerAcademicTerm, plan.coursesPerAcademicTerm.length >= 15);
    return plan.coursesPerAcademicTerm.length >= 15;
  }

  /**
   * Returns an object representing the AcademicPlan docID in a format acceptable to define().
   * @param docID The docID of a HelpMessage.
   * @returns { Object } An object representing the definition of docID.
   */
  public dumpOne(docID: string): IAcademicPlanDefine {
    const doc = this.findDoc(docID);
    const slug = Slugs.getNameFromID(doc.slugID);
    const degree = DesiredDegrees.findDoc(doc.degreeID);
    const degreeSlug = Slugs.findDoc(degree.slugID).name;
    const name = doc.name;
    const description = doc.description;
    const academicTermDoc = AcademicTerms.findDoc(doc.effectiveAcademicTermID);
    const academicTerm = Slugs.findDoc(academicTermDoc.slugID).name;
    const coursesPerAcademicTerm = doc.coursesPerAcademicTerm;
    const courseList = doc.courseList;
    const retired = doc.retired;
    return { slug, degreeSlug, name, description, academicTerm, coursesPerAcademicTerm, courseList, retired };
  }

}

/**
 * Provides the singleton instance of this class to all other entities.
 * @memberOf api/degree-plan
 */
export const AcademicPlans = new AcademicPlanCollection();
