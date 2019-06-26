import { Users } from '../../../api/user/UserCollection';
import { URL_ROLES } from '../../../startup/client/routes-config';

interface IMatchProps {
  isExact: boolean;
  path: string;
  url: string;
  params?: {
    username: string;
  }
}

// Returns the USERNAME param based on React-Router's match object
export const getUsername = (match: IMatchProps): string => match.params.username;

// Returns the User ID based off of the USERNAME param
export const getUserIdFromRoute = (match: IMatchProps): string => {
  const username = getUsername(match);
  return username && Users.getID(username);
};

// Returns the URL based on React-Router's match object.
const getUrl = (match: IMatchProps): string => match.url;

// Slits the URL into an array of parameter strings.
// i.e., /student/abi@hawaii.edu/explorer => ["", "student", "abi@hawaii.edu", "explorer"]
export const splitUrlIntoArray = (match: IMatchProps): string[] => {
  const url = getUrl(match);
  return url.split('/');
};

// Returns the base route of the URL (role + username)
// i.e. /student/abi@hawaii.edu
// Note, this function does NOT add a ending forward slash.
export const getBaseRoute = (match: IMatchProps): string => {
  const username = match.params.username;
  const baseUrl = match.url;
  const baseIndex = baseUrl.indexOf(username);
  const baseRoute = `${baseUrl.substring(0, baseIndex)}${username}`;
  return baseRoute;
};

// Builds a route name and returns it. Make sure routeName is preceeded by a forward slash ('/').
// i.e., buildRouteName('/explorer/plans') => /role/:username/explorer/plans
export const buildRouteName = (match: IMatchProps, routeName: string): string => {
  const baseRoute = getBaseRoute(match);
  const route = `${baseRoute}${routeName}`;
  return route;
};

// Returns the parameter by index (the parameters AFTER the base route)
// i.e., /student/abi@hawaii.edu/param1/param2/param3 (index = 1 returns param1, index = 2 returns param2, etc...)
export const getUrlParam = (match: IMatchProps, index: number) => {
  if (index <= 0) {
    throw new Error('getUrlParam() function from RouterHelperFunctions.tsx requires index to be greater than 0');
  }
  const parameters = splitUrlIntoArray(match);
  const username = getUsername(match);
  const usernameIndex = parameters.indexOf(username);
  const param = parameters[usernameIndex + index];
  return param;
};

// Returns the last param of the URL
// i.e., /student/abi@hawaii/edu/param1/param2/param3/param4 => param4
export const getLastUrlParam = (match: IMatchProps): string => {
  const parameters = splitUrlIntoArray(match);
  const lastParam = parameters[parameters.length - 1];
  return lastParam;
};

// Returns the role of the USERNAME of the url
// i.e., /mentor/somementor@hawaii.edu => mentor
export const getRoleByUrl = (match: IMatchProps): string => {
  const url = match.url;
  const username = getUsername(match);
  const indexUsername = url.indexOf(username);
  const role = url.substring(1, indexUsername - 1);
  return role;
};

// Returns if the role by URL is Admin
export const isUrlRoleAdmin = (match: IMatchProps): boolean => {
  const role = getRoleByUrl(match);
  return role === URL_ROLES.ADMIN;
};

// Returns if the role by URL is Advisor
export const isUrlRoleAdvisor = (match: IMatchProps): boolean => {
  const role = getRoleByUrl(match);
  return role === URL_ROLES.ADVISOR;
};

// Returns if the role by URL is Alumni
export const isUrlRoleAlumni = (match: IMatchProps): boolean => {
  const role = getRoleByUrl(match);
  return role === URL_ROLES.ALUMNI;
};

// Returns if the role by URL is Faculty
export const isUrlRoleFaculty = (match: IMatchProps): boolean => {
  const role = getRoleByUrl(match);
  return role === URL_ROLES.FACULTY;
};

// Returns if the role by URL is Mentor
export const isUrlRoleMentor = (match: IMatchProps): boolean => {
  const role = getRoleByUrl(match);
  return role === URL_ROLES.MENTOR;
};

// Returns if the role by URL is Student
export const isUrlRoleStudent = (match: IMatchProps): boolean => {
  const role = getRoleByUrl(match);
  return role === URL_ROLES.STUDENT;
};