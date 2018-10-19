import { moment } from 'meteor/momentjs:moment';
import { InterestTypes } from './InterestTypeCollection';
import { Interests } from './InterestCollection';

/**
 * Creates an InterestType with a unique slug and returns its docID.
 * @returns { String } The docID of the newly generated InterestType.
 * @memberOf api/interest
 */
export function makeSampleInterestType() {
  const name = 'Sample Interest Type';
  const slug = `interest-type-${moment().format('YYYY-MM-DD-HH-mm-ss-SSSSS')}`;
  const description = 'Sample Interest Type Description';
  return InterestTypes.define({ name, slug, description });
}

/**
 * Creates an Interest with a unique slug and returns its docID.
 * Also creates a new InterestType.
 * @returns { String } The docID for the newly generated Interest.
 * @memberOf api/interest
 */
export function makeSampleInterest() {
  const interestType = makeSampleInterestType();
  const name = 'Sample Interest';
  const slug = `interest-${moment().format('YYYY-MM-DD-HH-mm-ss-SSSSS')}`;
  const description = 'Sample Interest Description';
  return Interests.define({ name, slug, description, interestType });
}
