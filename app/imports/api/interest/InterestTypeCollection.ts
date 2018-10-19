import { _ } from 'meteor/erasaur:meteor-lodash';
import BaseTypeCollection from '../base/BaseTypeCollection';

/**
 * InterestTypes help organize Interests into logically related groupings such as "CS-Disciplines", "Locations", etc.
 * @extends api/base.BaseTypeCollection
 * @memberOf api/interest
 */
class InterestTypeCollection extends BaseTypeCollection {

  /**
   * Creates the InterestType collection.
   */
  constructor() {
    super('InterestType');
  }

  /**
   * Defines a new InterestType with its name, slug, and description.
   * @example
   * InterestTypes.define({ name: 'Locations', slug: 'locations', description: 'Regions of interest.' });
   * @param { Object } description Object with keys name, slug, and description.
   * Slug must be globally unique and previously undefined.
   * @throws { Meteor.Error } If the slug already exists.
   * @returns The newly created docID.
   */
  public define({ name, slug, description }) {
    return super.define({ name, slug, description });
  }

  /**
   * Update an InterestType.
   * @param docID the docID to be updated.
   * @param name the new name (optional).
   * @param description the new description (optional).
   * @throws { Meteor.Error } If docID is not defined.
   */
  public update(docID, { name, description }) {
    this.assertDefined(docID);
    const updateData: { name?: string, description?: string } = {};
    if (!_.isNil(name)) {
      updateData.name = name;
    }
    if (!_.isNil(description)) {
      updateData.description = description;
    }
    this.collection.update(docID, { $set: updateData });
    return true;
  }

}

/**
 * Provides the singleton instance of this class to all other entities.
 * @type {api/interest.InterestTypeCollection}
 * @memberOf api/interest
 */
export const InterestTypes = new InterestTypeCollection();
