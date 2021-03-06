// UserInteraction Types
export enum UserInteractionsTypes {
  /* General Tracking */
  PAGEVIEW = 'pageView',
  LOGIN = 'login',
  LEVEL = 'level',
  COMPLETEPLAN = 'completePlan',
  /* Student About Me Page */
  PICTURE = 'picture',
  WEBSITE = 'website',
  SHAREINFORMATION = 'shareInformation',
  /* Favorites */
  FAVORITEITEM = 'favoriteItem',
  UNFAVORITEITEM = 'unFavoriteItem',
  /* Reviews */
  ADDREVIEW = 'addReview',
  EDITREVIEW = 'editReview',
  /* Mentor Space */
  ASKQUESTION = 'askQuestion',
  /* Degree Planner */
  VERIFYREQUEST = 'verifyRequest',
}

// type for interactionData object
export type UserInteractionsDataType = {
  username: string;
  type: string;
  typeData: string | string[];
}

// Default string if we do not need to store a typeData for that User Interaction
export const USERINTERACTIONSNOTYPEDATA = 'N/A';
