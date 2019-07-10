import { Meteor } from 'meteor/meteor';
import { defineMethod, removeItMethod, updateMethod } from '../base/BaseCollection.methods';
import { Opportunities } from './OpportunityCollection';
import { defineTestFixturesMethod, withRadGradSubscriptions, withLoggedInUser } from '../test/test-utilities';

/* eslint prefer-arrow-callback: "off", no-unused-expressions: "off" */
/* eslint-env mocha */

if (Meteor.isClient) {
  describe('OpportunityCollection Meteor Methods ', function test() {
    const collectionName = Opportunities.getCollectionName();
    const definitionData = {
      name: 'name',
      slug: 'opportunity-slug-example',
      description: 'description',
      opportunityType: 'club',
      sponsor: 'radgrad@hawaii.edu',
      ice: { i: 5, c: 5, e: 5 },
      interests: ['algorithms'],
      academicTerms: ['Spring-2017'],
    };

    before(function (done) {
      defineTestFixturesMethod.call(['minimal', 'opportunities'], done);
    });

    it('Define Method', async function (done) {
      try {
        await withLoggedInUser();
        await withRadGradSubscriptions();
        await defineMethod.callPromise({ collectionName, definitionData });
        done();
      } catch (e) {
        done(e);
      }
    });

    it('Update Method', async function (done) {
      try {
        const id = Opportunities.findIdBySlug(definitionData.slug);
        const description = 'updated description';
        await updateMethod.callPromise({ collectionName, updateData: { id, description } });
        done();
      } catch (e) {
        done(e);
      }
    });

    it('Remove Method', async function (done) {
      try {
        await removeItMethod.callPromise({ collectionName, instance: definitionData.slug });
        done();
      } catch (e) {
        done(e);
      }
    });
  });
}
