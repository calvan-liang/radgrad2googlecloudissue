import SimpleSchema from 'simpl-schema';
import { _ } from 'meteor/erasaur:meteor-lodash';
import { Slugs } from '../slug/SlugCollection';
import BaseSlugCollection from '../base/BaseSlugCollection';
import { Interests } from '../interest/InterestCollection';
import { Opportunities } from '../opportunity/OpportunityCollection';
import { ITeaserDefine, ITeaserUpdate, ITeaserUpdateData } from '../../typings/radgrad';

/**
 * Represents a teaser instance, such as "ACM Webmasters".
 * @extends api/base.BaseSlugCollection
 * @memberOf api/teaser
 */
class TeaserCollection extends BaseSlugCollection {

  /**
   * Creates the Teaser collection.
   */
  constructor() {
    super('Teaser', new SimpleSchema({
      title: String,
      slugID: SimpleSchema.RegEx.Id,
      author: String,
      url: String,
      description: String,
      interestIDs: [SimpleSchema.RegEx.Id],
      opportunityID: SimpleSchema.RegEx.Id,
      duration: { type: String, optional: true },
      retired: { type: Boolean, optional: true },
    }));
  }

  /**
   * Defines a new Teaser video to provide information about an opportunity.
   * @example
   * Teaser.define({ title: 'ACM Webmasters',
   *                 slug: 'acm-webmasters-teaser',
   *                 opportunity: 'acm-webmasters'
   *                 interests: ['html', 'javascript', 'css', 'web-development'],
   *                 author: 'Torlief Nielson'
   *                 url: 'https://www.youtube.com/watch?v=OI4CXULK3tw'
   *                 description: 'Learn web development by helping to develop and maintain the ACM Manoa website.',
   *                 duration: '0:39'
   *                 })
   * @param { Object } description Object with keys title, slug, URL, description, duration. interestIDs.
   * Title is a required string.
   * Slug is required and must be previously undefined. By convention, use a '-teaser' suffix.
   * Interests is a required array of one or more defined interest slugs or interestIDs.
   * Opportunity is a required opportunity slug or opportunityID.
   * URL is a required string; the url to the (typically YouTube) video defining this teaser.
   * Author is a required string indicating the author of the Teaser.
   * Description is a required string providing a short description of this teaser.
   * Duration is an optional string indicating the length of the teaser.
   * @throws {Meteor.Error} If the interest definition includes a defined slug or undefined interestID,
   * if the slug is already defined, or if the opportunity is supplied and not found.
   * @returns The newly created docID.
   */
  public define({ title, slug, author, url, description, duration, interests, opportunity }: ITeaserDefine) {
    // Get InterestIDs, throw error if any of them are not found.
    const interestIDs = Interests.getIDs(interests);
    // Get SlugID, throw error if found.
    const slugID = Slugs.define({ name: slug, entityName: this.getType() });
    // Get OpportunityID, throw error if not found.
    const opportunityID = Opportunities.getID(opportunity);
    const teaserID = this.collection.insert({ title, slugID, author, url, description, duration, interestIDs,
      opportunityID });
    // Connect the Slug to this teaser
    Slugs.updateEntityID(slugID, teaserID);
    return teaserID;
  }

  /**
   * Update a Teaser. Everything can be updated except the slug.
   * @param docID The docID to be updated.
   * @throws { Meteor.Error } If docID is not defined, or if any interest or opportunity is undefined.
   */
  public update(docID, { title, opportunity, interests, author, url, description, duration }: ITeaserUpdate) {
    this.assertDefined(docID);
    const updateData: ITeaserUpdateData = {};
    if (title) {
      updateData.title = title;
    }
    if (opportunity) {
      updateData.opportunityID = Opportunities.getID(opportunity);
    }
    if (interests) {
      updateData.interestIDs = Interests.getIDs(interests);
    }
    if (author) {
      updateData.author = author;
    }
    if (url) {
      updateData.url = url;
    }
    if (description) {
      updateData.description = description;
    }
    if (duration) {
      updateData.duration = duration;
    }
    this.collection.update(docID, { $set: updateData });
  }

  /**
   * Remove the Teaser.
   * @param instance The docID or slug of the entity to be removed.
   * @throws { Meteor.Error } If docID is not a Teaser.
   */
  public removeIt(instance: string) {
    const docID = this.getID(instance);
    // OK, clear to delete.
    return super.removeIt(docID);
  }

  /**
   * Returns true if teaser has the specified interest.
   * @param teaser The teaser (docID or slug)
   * @param interest The Interest (docID or slug).
   * @returns {boolean} True if the teaser has the associated Interest.
   * @throws { Meteor.Error } If teaser is not a teaser or interest is not a Interest.
   */
  public hasInterest(teaser: string, interest: string) {
    const interestID = Interests.getID(interest);
    const doc = this.findDoc(teaser);
    return _.includes(doc.interestIDs, interestID);
  }

  /**
   * Returns true if teaser has the specified opportunity.
   * @param teaser The teaser (docID or slug)
   * @param opportunity The Interest (docID or slug).
   * @returns {boolean} True if the teaser has the associated Opportunity.
   * @throws { Meteor.Error } If teaser is not a teaser or opportunity is not a Opportunity.
   */
  public hasOpportunity(teaser: string, opportunity: string) {
    const opportunityID = Opportunities.getID(opportunity);
    const doc = this.findDoc(teaser);
    return (doc.opportunityID === opportunityID);
  }

  /**
   * Returns an array of strings, each one representing an integrity problem with this collection.
   * Returns an empty array if no problems were found.
   * Checks slugID, interestIDs
   * @returns {Array} A (possibly empty) array of strings indicating integrity issues.
   */
  public checkIntegrity() {
    const problems = [];
    this.find().forEach((doc) => {
      if (!Slugs.isDefined(doc.slugID)) {
        problems.push(`Bad slugID: ${doc.slugID}`);
      }
      _.forEach(doc.interestIDs, (interestID) => {
        if (!Interests.isDefined(interestID)) {
          problems.push(`Bad interestID: ${interestID}`);
        }
      });
      if (doc.opportunityID && !Opportunities.isDefined(doc.opportunityID)) {
        problems.push(`Bad opportunityID: ${doc.opportunityID}`);
      }
    });
    return problems;
  }

  /**
   * Returns an object representing the Teaser docID in a format acceptable to define().
   * @param docID The docID of a Teaser.
   * @returns { Object } An object representing the definition of docID.
   */
  public dumpOne(docID: string): ITeaserDefine {
    const doc = this.findDoc(docID);
    const title = doc.title;
    const slug = Slugs.getNameFromID(doc.slugID);
    const author = doc.author;
    const url = doc.url;
    const description = doc.description;
    const duration = doc.duration;
    const interests = _.map(doc.interestIDs, (interestID) => Interests.findSlugByID(interestID));
    let opportunity;
    if (doc.opportunityID) {
      opportunity = Opportunities.findSlugByID(doc.opportunityID);
    }
    return { title, slug, author, url, description, duration, interests, opportunity };
  }
}

/**
 * Provides the singleton instance of this class to all other entities.
 * @type {api/teaser.TeaserCollection}
 * @memberOf api/teaser
 */
export const Teasers = new TeaserCollection();
