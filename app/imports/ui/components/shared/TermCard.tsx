import * as React from 'react';
import { Button, Card, Icon, SemanticCOLORS } from 'semantic-ui-react'; // eslint-disable-line
import * as _ from 'lodash';
import * as Markdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { ITermCard } from '../../../typings/radgrad'; // eslint-disable-line
import IceHeader from './IceHeader';
import { AcademicTerms } from '../../../api/academic-term/AcademicTermCollection';
import InterestList from './InterestList';
import WidgetHeaderNumber from './WidgetHeaderNumber';
import { CourseInstances } from '../../../api/course/CourseInstanceCollection';
import { OpportunityInstances } from '../../../api/opportunity/OpportunityInstanceCollection';
import { Users } from '../../../api/user/UserCollection';
import { Slugs } from '../../../api/slug/SlugCollection';

class TermCard extends React.Component<ITermCard> {
  constructor(props) {
    super(props);
  }

  private isType = (typeToCheck) => {
    const { type } = this.props;
    return type === typeToCheck;
  }

  private itemName = (item) => {
    if (this.isType('courses')) {
      return `${item.name} (${item.number})`;
    }
    return item.name;
  }

  private itemSlug = (item) => Slugs.findDoc(item.slugID).name;

  // This was originally in a ui/utilities/template-helpers.js (radgrad1) file called opportunitySemesters
  // Should move it to one if one is made - Gian.
  private opportunityTerms(opportunityInstance) {
    const academicTermIDs = opportunityInstance.termIDs;
    const upcomingAcademicTerms = _.filter(academicTermIDs, termID => AcademicTerms.isUpcomingTerm(termID));
    return _.map(upcomingAcademicTerms, termID => AcademicTerms.toString(termID));

  }

  private replaceTermString(array) {
    const currentTerm = AcademicTerms.getCurrentAcademicTermDoc();
    const currentYear = currentTerm.year;
    let fourRecentTerms = _.filter(array, function isRecent(termYear) {
      return termYear.split(' ')[1] >= currentYear;
    });
    fourRecentTerms = array.slice(0, 4);
    const termString = fourRecentTerms.join(' - ');
    return termString.replace(/Summer/g, 'Sum').replace(/Spring/g, 'Spr');

  }

  private itemTerms = () => {
    const { item } = this.props;
    let ret = [];
    if (this.isType('courses')) {
      // do nothing
    } else {
      ret = this.opportunityTerms(item);
    }
    return ret;
  }

  private itemShortDescription = (item) => {
    let description = item.description;
    if (description.length > 200) {
      description = `${description.substring(0, 200)}`;
      if (description.charAt(description.length - 1) === ' ') {
        description = `${description.substring(0, 199)}`;
      }
    }
    return `${description}...`;
  }

  private numberStudents = (course) => this.interestedStudentsHelper(course, this.props.type).length

  private interestedStudentsHelper = (item, type) => {
    let instances;
    if (type === 'courses') {
      instances = CourseInstances.find({
        courseID: item._id,
      }).fetch();
    } else {
      instances = OpportunityInstances.find({
        opportunityID: item._id,
      }).fetch();
    }
    return _.uniqBy(instances, i => i.studentID);
  }

  private getUsername = () => this.props.match.params.username;

  private hidden = () => {
    const username = this.getUsername();
    let ret = '';
    const profile = Users.getProfile(username);
    if (this.isType('courses')) {
      if (_.includes(profile.hiddenCourseIDs, this.props.item._id)) {
        ret = 'grey';
      }
    } else if (_.includes(profile.hiddenOpportunityIDs, this.props.item._id)) {
      ret = 'grey';
    }
    return ret;
  }

  /*
    Because we are using react-router, the converted markdown hyperlinks won't be redirected properly. This is a solution.
    See https://github.com/rexxars/react-markdown/issues/29#issuecomment-231556543
  */
  private routerLink = (props) => (
    props.href.match(/^(https?:)?\/\//)
      ? <a href={props.href}>{props.children}</a>
      : <Link to={props.href}>{props.children}</Link>
  )

  private buildRouteName = (item, type) => {
    const itemName = this.itemSlug(item);
    const username = this.props.match.params.username;
    const baseUrl = this.props.match.url;
    const baseIndex = baseUrl.indexOf(username);
    const baseRoute = `${baseUrl.substring(0, baseIndex)}${username}/`;
    switch (type) {
      case 'courses':
        return `${baseRoute}explorer/courses/${itemName}`;
      case 'opportunities':
        return `${baseRoute}explorer/opportunities/${itemName}`;
      default:
        break;
    }
    return '#';
  }

  public render(): React.ReactElement<any> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
    const { item, type } = this.props;
    const itemName = this.itemName(item);
    const isTypeOpportunity = this.isType('opportunities');
    const itemTerms = this.itemTerms();
    const itemShortDescription = this.itemShortDescription(item);
    const numberStudents = this.numberStudents(item);
    const hidden = this.hidden() as SemanticCOLORS;
    const isStudent = this.props.isStudent;
    const canAdd = this.props.canAdd;

    return (
      <Card className="radgrad-interest-card">
        <Card.Content>
          <Card.Header>
            {itemName}
            {isTypeOpportunity ? <IceHeader ice={item.ice}/> : ''}
          </Card.Header>

          <Card.Meta>
            {itemTerms ? this.replaceTermString(itemTerms) : ''}
          </Card.Meta>
        </Card.Content>

        <Card.Content>
          <Markdown escapeHtml={true} source={itemShortDescription} renderers={{ link: this.routerLink }}/>
          <InterestList item={item} size="mini"/>
        </Card.Content>

        <Card.Content>
          <span>STUDENTS PARTICIPATING <WidgetHeaderNumber inputValue={numberStudents}/></span>
        </Card.Content>

        <Button.Group className="radgrad-home-buttons center aligned" attached="bottom" widths={3}
                      color={hidden || undefined}>
          {
            <Link to={this.buildRouteName(this.props.item, this.props.type)}>
              <Button><Icon name="chevron circle right"/><br/>View More</Button>
            </Link>
          }

          {
            isStudent ?
              [
                [
                  canAdd ?
                    <SemesterAdd item={item} type={type}/>
                    : '',
                ],
                [
                  hidden ?
                    <Button onClick={this.handleUnHideStudentInterest}><Icon name="unhide"/><br/>Unhide</Button>
                    :
                    <Button onClick={this.handleHideStudentInterest}><Icon name="hide"/><br/>Hide</Button>,
                ],
              ]
              : ''
          }
        </Button.Group>
      </Card>
    );
  }
}

export default TermCard;
