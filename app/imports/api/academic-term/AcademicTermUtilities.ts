import _ from 'lodash';
import moment from 'moment';
import { AcademicTerms } from './AcademicTermCollection';
import { RadGradProperties } from '../radgrad/RadGradProperties';

/**
 * Defines default academicTerms from 2014 till 2020.
 * @memberOf api/academic-term
 */
export function defineAcademicTerms() {
  let year = moment().year() - 1;
  if (AcademicTerms.find().count() === 0) {
    for (let i = 0; i < 5; i++) {
      AcademicTerms.define({ term: AcademicTerms.SPRING, year });
      AcademicTerms.define({ term: AcademicTerms.SUMMER, year });
      AcademicTerms.define({ term: AcademicTerms.FALL, year });
      if (RadGradProperties.getQuarterSystem()) {
        AcademicTerms.define({ term: AcademicTerms.WINTER, year });
      }
      year++;
    }
  }
}

/**
 * Returns the next AcademicTerm document given an AcademicTerm document.
 * @param termDoc the AcademicTerm doc.
 * @returns The next AcademicTerm doc.
 * @memberOf api/academic-term
 */
export function nextAcademicTerm(termDoc) {
  const currentTerm = termDoc.term;
  const currentYear = termDoc.year;
  let term;
  let year = currentYear;
  if (currentTerm === AcademicTerms.FALL) {
    if (RadGradProperties.getQuarterSystem()) {
      term = AcademicTerms.WINTER;
    } else {
      term = AcademicTerms.SPRING;
    }
    year += 1;
  } else if (currentTerm === AcademicTerms.WINTER) {
    term = AcademicTerms.SPRING;
  } else if (currentTerm === AcademicTerms.SPRING) {
    term = AcademicTerms.SUMMER;
  } else {
    term = AcademicTerms.FALL;
  }
  return AcademicTerms.findDoc(AcademicTerms.define({ term, year }));
}

/**
 * Returns the next Fall, Winter or Spring academic term doc. Skips over Summer academic terms.
 * @param term the academic term doc.
 * @returns The next academic term doc (excluding summer).
 * @memberOf api/academic-term
 */
export function nextNonSummerTerm(term) {
  let next: { term: string } = nextAcademicTerm(term);
  if (next.term === AcademicTerms.SUMMER) {
    next = nextAcademicTerm(next);
  }
  return next;
}

/**
 * Returns an array of the upcoming academicTerms.
 * @return {array} of the upcoming academicTerms.
 * @memberOf api/academic-term
 */
export function upComingTerms() {
  const currentTerm = AcademicTerms.getCurrentAcademicTermDoc();
  const nine = currentTerm.termNumber + 10;
  return _.sortBy(AcademicTerms.find({
    termNumber: {
      $gt: currentTerm.termNumber,
      $lt: nine,
    },
  }).fetch(), (sem) => sem.termNumber);
}

export function termIDsToString(termIDs: string[]) {
  const retVal = [];
  termIDs.forEach((id) => {
    retVal.push(AcademicTerms.toString(id));
  });
  return retVal;
}
