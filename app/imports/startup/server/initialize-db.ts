import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import _ from 'lodash';
import moment from 'moment';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import { PublicStats } from '../../api/public-stats/PublicStatsCollection';
import { RadGrad } from '../../api/radgrad/RadGrad';
import { Interests } from '../../api/interest/InterestCollection';
import { CareerGoals } from '../../api/career/CareerGoalCollection';
import { AcademicPlans } from '../../api/degree-plan/AcademicPlanCollection';
import { UserInteractions } from '../../api/analytic/UserInteractionCollection';
import { RadGradProperties } from '../../api/radgrad/RadGradProperties';
import { loadCollection } from '../../api/test/test-utilities';
import { removeAllEntities } from '../../api/base/BaseUtilities';
import { checkIntegrity } from '../../api/integrity/IntegrityChecker';
import { StudentParticipations } from '../../api/public-stats/StudentParticipationCollection';
import { AdminProfiles } from '../../api/user/AdminProfileCollection';

/** global Assets */

/**
 * Returns an Array of numbers, one per loadable collection, indicating the number of documents in that collection.
 * @returns { Array } An array of collection document counts.
 * @memberOf startup/server
 */
function documentCounts() {
  return _.map(RadGrad.collectionLoadSequence, (collection) => collection.count());
}

/**
 * Returns the total number of documents in the loadable collections.
 * @returns { Number } The total number of RadGrad documents in the loadable collections.
 * @memberOf startup/server
 */
function totalDocuments() {
  return _.reduce(documentCounts(), (sum, count) => sum + count, 0);
}

/**
 * The load/fixture file date format.
 * Used when dumping and restoring the RadGrad database.
 * @type {string}
 * @memberOf startup/server
 */
const loadFileDateFormat = 'YYYY-MM-DD-HH-mm-ss';

/**
 * Returns a string indicating how long ago the load file was created. Parses the file name string.
 * @param loadFileName The file name.
 * @returns { String } A string indicating how long ago the file was created.
 * @memberOf startup/server
 */
function getRestoreFileAge(loadFileName) {
  const terms = _.words(loadFileName, /[^/. ]+/g);
  const dateString = terms[terms.length - 2];
  return moment(dateString, loadFileDateFormat).fromNow();
}

/**
 * If the database is empty, this function looks up the name of the load file in the settings file,
 * and if it is specified, then it reads it in and calls define() on its contents in order to load the database.
 * Console messages are generated when the contents of the load file does not include collections that
 * this function assumes are present. Conversely, if the load file contains collections not processed with
 * this file, a string is also printed out.
 * @memberOf startup/server
 */
function loadDatabase() {
  const loadFileName = Meteor.settings.public.databaseRestoreFileName;
  if (loadFileName && (totalDocuments() === 0 || totalDocuments() === 1)) {
    const loadFileAge = getRestoreFileAge(loadFileName);
    console.log(`Loading database from file ${loadFileName}, dumped ${loadFileAge}.`);
    const loadJSON = JSON.parse(Assets.getText(loadFileName));
    // The list of collections, ordered so that they can be sequentially restored.
    const collectionList = RadGrad.collectionLoadSequence;

    const loadNames = _.map(loadJSON.collections, (obj) => obj.name);
    const collectionNames = _.map(collectionList, (collection) => collection.getCollectionName());
    const extraRestoreNames = _.difference(loadNames, collectionNames);
    const extraCollectionNames = _.difference(collectionNames, loadNames);

    if (extraRestoreNames.length) {
      console.log(`Error: Expected collections are missing from collection list: ${extraRestoreNames}`);
    }
    if (extraCollectionNames.length) {
      console.log(`Error: Expected collections are missing from restore JSON file: ${extraCollectionNames}`);
    }

    if (!extraRestoreNames.length && !extraCollectionNames.length) {
      _.each(collectionList, (collection) => loadCollection(collection, loadJSON, true));
    }
    console.log('Finished loading database.');
  }
}

/**
 * Runs the PublicStats generator to collect stats on the database, then sets up a cron job to update the stats
 * once a day.
 * @memberOf startup/server
 */
function startupPublicStats() {
  PublicStats.generateStats();
  SyncedCron.add({
    name: 'Run the PublicStats.generateStats method',
    schedule(parser) {
      return parser.text('every 24 hours');
    },
    job() {
      PublicStats.generateStats();
    },
  });
}

function startupStudentParticipation() {
  StudentParticipations.upsertEnrollmentData();
  SyncedCron.add({
    name: 'Run StudentParticipations.upsertEnrollmentData',
    schedule(parser) {
      return parser.text('every 24 hours');
    },
    job() {
      StudentParticipations.upsertEnrollmentData();
    },
  });
}

/**
 * Check the integrity of the newly loaded collections; print out problems if any occur.
 * @memberOf startup/server
 */
function startupCheckIntegrity() {
  // console.log('Checking DB integrity.');
  const integrity = checkIntegrity();
  if (integrity.count > 0) {
    console.log(checkIntegrity().message);
  }
}

function defineAdminUser() {
  const adminProfile = RadGradProperties.getAdminProfile();
  if (!adminProfile) {
    console.error('\n\nNO ADMIN PROFILE SPECIFIED IN SETTINGS FILE! SHUTDOWN AND FIX!!\n\n');
    return;
  }
  const user = Meteor.users.findOne({ username: adminProfile.username });
  if (!user) {
    AdminProfiles.define(adminProfile);
  }
}

function defineTestAdminUser() {
  if (Meteor.isTest || Meteor.isAppTest) {
    const adminProfile = {
      username: 'radgrad@hawaii.edu',
      firstName: 'RadGrad',
      lastName: 'Admin',
    };
    AdminProfiles.define(adminProfile);
  }
}

/**
 * Fixes issues with user interactions, particularly older documents that are not consistent with the
 * new schema.
 * @memberOf startup/server
 */
function fixUserInteractions() {
  if (Meteor.settings.public.fixUserInteractions) {
    console.log('Fixing UserInteraction collection.');
    _.each(UserInteractions.find().fetch(), (interaction) => {
      /* if (interaction.userID) {
        const username = Meteor.users.findOne({ _id: interaction.userID }).username;
        console.log('Fixing interaction for user: ', username);
        UserInteractions.update(interaction._id, { $set: { username } });
      } */
      if (!Array.isArray(interaction.typeData)) {
        const oldTypeData = interaction.typeData.split(',');
        const typeData = [];
        const type = interaction.type;
        if (type === 'interestIDs' && oldTypeData[0] !== 'n/a') {
          _.each(oldTypeData, (entry) => {
            typeData.push(Interests.findSlugByID(entry));
          });
        } else if (type === 'careerGoalIDs' && oldTypeData[0] !== 'n/a') {
          _.each(oldTypeData, (entry) => {
            typeData.push(CareerGoals.findSlugByID(entry));
          });
        } else if (type === 'academicPlanID' && oldTypeData[0] !== 'n/a') {
          _.each(oldTypeData, (entry) => {
            typeData.push(AcademicPlans.findSlugByID(entry));
          });
        } else {
          _.each(oldTypeData, (entry) => {
            typeData.push(entry);
          });
        }
        console.log('Fixing interaction for: ', interaction.username);
        UserInteractions.getCollection().update(interaction._id, { $set: { typeData } });
      } else if (interaction.typeData[0] === 'ERROR: No such UserInteraction type found!') {
        const typeData = ['Leveled up!'];
        UserInteractions.getCollection().update(interaction._id, { $set: { typeData } });
      }
    });
  }
}

// Add a startup callback that distinguishes between test and dev/prod mode and does the right thing.
Meteor.startup(() => {
  if (Meteor.isTest || Meteor.isAppTest) {
    console.log('Test mode. Database initialization disabled, current database cleared, rate limiting disabled.');
    Accounts.removeDefaultRateLimit();
    removeAllEntities();
    defineTestAdminUser();
  } else {
    defineAdminUser();
    loadDatabase();
    startupCheckIntegrity();
    startupPublicStats();
    startupStudentParticipation();
    fixUserInteractions();
    SyncedCron.start();
  }
});
