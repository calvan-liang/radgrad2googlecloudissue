import * as React from 'react';
import { Label, SemanticSIZES } from 'semantic-ui-react';
import { withRouter, Link } from 'react-router-dom';
import { Users } from '../../../api/user/UserCollection';
import * as _ from 'lodash';
import { Interests } from '../../../api/interest/InterestCollection';
import { Slugs } from '../../../api/slug/SlugCollection';

interface IInterestListProps {
  item: object;
  size: SemanticSIZES;
  match: {
    isExact: boolean;
    path: string;
    url: string;
    params: {
      username: string;
    }
  };
}

class InterestList extends React.Component<IInterestListProps> {
  constructor(props) {
    super(props);
  }

  private getUsername = () => {
    return this.props.match.params.username;
  }

  private interestName = (interest): string => {
    return interest.name;
  }

  private matchingUserInterests = (course) => {
    try {
      return this.matchingUserInterestsHelper(course);
    } catch (err) {
      return null;
    }
  }

  private matchingUserInterestsHelper = (item) => {
    const matchingInterests = [];
    const userInterestIDs = Users.getInterestIDsByType(this.getUsername());
    const userInterests = _.map(userInterestIDs[0], (id) => Interests.findDoc(id));
    const itemInterests = _.map(item.interestIDs, (id) => Interests.findDoc(id));
    _.forEach(itemInterests, (itemInterest) => {
      _.forEach(userInterests, (userInterest) => {
        if (_.isEqual(itemInterest, userInterest)) {
          matchingInterests.push(userInterest);
        }
      });
    });
    return matchingInterests;
  }

  private matchingCareerInterests = (course) => {
    try {
      return this.matchingCareerInterestsHelper(course);
    } catch (err) {
      return null;
    }
  }

  private matchingCareerInterestsHelper = (item) => {
    const matchingInterests = [];
    const userInterestIDs = Users.getInterestIDsByType(this.getUsername());
    const userInterests = _.map(userInterestIDs[1], (id) => Interests.findDoc(id));
    const itemInterests = _.map(item.interestIDs, (id) => Interests.findDoc(id));
    _.forEach(itemInterests, (itemInterest) => {
      _.forEach(userInterests, (userInterest) => {
        if (_.isEqual(itemInterest, userInterest)) {
          matchingInterests.push(userInterest);
        }
      });
    });
    return matchingInterests;
  }

  private otherInterests = (course) => {
    try {
      const matchingInterests = this.matchingInterestsHelper(course);
      const courseInterests = _.map(course.interestIDs, (id) => Interests.findDoc(id));
      return _.filter(courseInterests, (courseInterest) => {
        let ret = true;
        _.forEach(matchingInterests, (matchingInterest) => {
          if (_.isEqual(courseInterest, matchingInterest)) {
            ret = false;
          }
        });
        return ret;
      });
    } catch (err) {
      return null;
    }
  }

  private matchingInterestsHelper = (item) => {
    const matchingInterests = [];
    const userInterestIDs = Users.getInterestIDs(this.getUsername());
    const userInterests = _.map(userInterestIDs, (id) => Interests.findDoc(id));
    const itemInterests = _.map(item.interestIDs, (id) => Interests.findDoc(id));
    _.forEach(itemInterests, (itemInterest) => {
      _.forEach(userInterests, (userInterest) => {
        if (_.isEqual(itemInterest, userInterest)) {
          matchingInterests.push(userInterest);
        }
      });
    });
    return matchingInterests;
  }

  private interestsRouteName = (interest) => {
    const url = this.props.match.url;
    const splitUrl = url.split('/');
    const group = splitUrl[1];
    const interestName = this.interestSlug(interest);
    switch (group) {
      case 'student':
        return `/student/${this.getUsername()}/explorer/interests/${interestName}`;
      case 'faculty':
        return `/faculty/${this.getUsername()}/explorer/interests/${interestName}`;
      default:
        return `/mentor/${this.getUsername()}/explorer/interests/${interestName}`;
    }
  }

  private interestSlug = (interest) => {
    return Slugs.findDoc(interest.slugID).name;
  }

  public render():
      React.ReactElement<any> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
    const matchingUserInterests = this.matchingUserInterests(this.props.item);
    const matchingCareerInterests = this.matchingCareerInterests(this.props.item);
    const otherInterests = this.otherInterests(this.props.item);
    return (
        <Label.Group>
          {
            matchingUserInterests.map((interest, index) => (
                <Link to={this.interestsRouteName(interest)}>
                  <Label key={index} size={this.props.size}>
                    <i className="fitted star icon"/> {this.interestName(interest)}
                  </Label>
                </Link>
            ))
          }

          {
            matchingCareerInterests.map((interest, index) => (
                <Link to={this.interestsRouteName(interest)}>
                  <Label key={index} size={this.props.size}>
                    <i className="fitted suitcase icon"/> {this.interestName(interest)}
                  </Label>
                </Link>
            ))
          }

          {
            otherInterests.map((interest, index) => (
                <Link to={this.interestsRouteName(interest)}>
                  <Label key={index} size={this.props.size}>
                    {this.interestName(interest)}
                  </Label>
                </Link>
            ))
          }

        </Label.Group>
    );
  }
}

export default withRouter(InterestList);
