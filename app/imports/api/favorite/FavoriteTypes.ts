// types for Favorites
export enum FAVORITE_TYPE {
  ACADEMICPLAN = 'academicPlan',
  CAREERGOAL = 'careerGoal',
  COURSE = 'course',
  INTEREST = 'interest',
  OPPORTUNITY = 'opportunity',
}

export type IFavoriteTypes =
  FAVORITE_TYPE.ACADEMICPLAN
  | FAVORITE_TYPE.CAREERGOAL
  | FAVORITE_TYPE.COURSE
  | FAVORITE_TYPE.INTEREST
  | FAVORITE_TYPE.OPPORTUNITY;
