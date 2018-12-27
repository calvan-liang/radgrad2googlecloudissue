import * as React from 'react';
import { connect } from 'react-redux';
import { Button, Dropdown, Grid, Icon, Segment } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import { Roles } from 'meteor/alanning:roles';
import { ICourse, ICourseInstance, IOpportunity, IOpportunityInstance } from '../../../typings/radgrad';
import withGlobalSubscription from '../../layouts/shared/GlobalSubscriptionsHOC';
import withInstanceSubscriptions from '../../layouts/shared/InstanceSubscriptionsHOC';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { AcademicPlans } from '../../../api/degree-plan/AcademicPlanCollection';
import { Courses } from '../../../api/course/CourseCollection';
import { CourseInstances } from '../../../api/course/CourseInstanceCollection';
import { Opportunities } from '../../../api/opportunity/OpportunityCollection';
import { OpportunityInstances } from '../../../api/opportunity/OpportunityInstanceCollection';
import { ROLE } from '../../../api/role/Role';
import { StudentProfiles } from '../../../api/user/StudentProfileCollection';
import { Users } from '../../../api/user/UserCollection';
import InspectorCourseMenuContainer from './InspectorCourseMenu';
import InspectorCourseView from './InspectorCourseView';
import InspectorOpportunityView from './InspectorOpportunityView';
import InspectorOpportunityMenuContainer from './InspectorOpportunityMenu';

interface ICOInspectorWidgetProps {
  selectedCourseID: string;
  selectedCourseInstanceID: string;
  selectedOpportunityID: string;
  selectedOpportunityInstanceID: string;
  courses: ICourse[];
  opportunities: IOpportunity[];
  match: {
    isExact: boolean;
    path: string;
    url: string;
    params: {
      username: string;
    }
  };
}

const mapStateToProps = (state) => {
  return {
    selectedCourseID: state.selectedCourseID,
    selectedCourseInstanceID: state.selectedCourseInstanceID,
    selectedOpportunityID: state.selectedOpportunityID,
    selectedOpportunityInstanceID: state.selectedOpportunityInstanceID,
  };
};

class CourseOpportunityInspectorWidget extends React.Component<ICOInspectorWidgetProps> {
  constructor(props) {
    super(props);
  }

  public render() {
    const userName = this.props.match.params.username;
    const studentID = Users.getID(userName);
    const padddingBottomStyle = {
      paddingBottom: 0,
    };
    const paddingStyle = {
      padding: 0,
    };
    let courseID;
    if (this.props.selectedCourseInstanceID) {
      const courseInstance = CourseInstances.findDoc(this.props.selectedCourseInstanceID);
      courseID = courseInstance.courseID;
    }
    let opportunityID;
    if (this.props.selectedOpportunityInstanceID) {
      const instance = OpportunityInstances.findDoc(this.props.selectedOpportunityInstanceID);
      opportunityID = instance.opportunityID;
    }
    return (
      <div>
        <Button.Group attached="top">
          <Button>
            <InspectorCourseMenuContainer studentID={studentID}/>
          </Button>
          <Button.Or/>
          <Button>
            <InspectorOpportunityMenuContainer studentID={studentID}/>
          </Button>
        </Button.Group>
        <Grid container={true}>
          <Grid.Row stretched={true} style={padddingBottomStyle}>
            {this.props.selectedCourseID ?
              <InspectorCourseView courseID={this.props.selectedCourseID} studentID={studentID}/> : ''}
            {this.props.selectedCourseInstanceID ?
              <InspectorCourseView courseInstanceID={this.props.selectedCourseInstanceID} courseID={courseID}
                                   studentID={studentID}/> : ''}
            {this.props.selectedOpportunityID ?
              <InspectorOpportunityView opportunityID={this.props.selectedOpportunityID} studentID={studentID}/> : ''}
            {this.props.selectedOpportunityInstanceID ?
              <InspectorOpportunityView opportunityInstanceID={this.props.selectedOpportunityInstanceID}
                                        opportunityID={opportunityID} studentID={studentID}/> : ''}
            {(!this.props.selectedCourseID && !this.props.selectedCourseInstanceID && !this.props.selectedOpportunityID && !this.props.selectedOpportunityInstanceID) ? 'Please choose a Course or Opportunity from the menus above or click on a Course or Opportunity in the Degree Experience Planner to the right.' : ''}
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

const CourseOpportunityInspectorWidgetCon = withGlobalSubscription(CourseOpportunityInspectorWidget);
const CourseOpportunityInspectorWidgetCont = withInstanceSubscriptions(CourseOpportunityInspectorWidgetCon);
const COIW = withRouter(CourseOpportunityInspectorWidgetCont);
const CourseOpportunityInspectorWidgetConati = withTracker((props) => {
  return {
    courses: Courses.findNonRetired({}, { sort: { shortName: 1 } }),
    opportunities: Opportunities.findNonRetired({}, { sort: { name: 1 } }),
  };
})(COIW);
const CourseOpportunityInspectorWidgetContainer = connect(mapStateToProps)(CourseOpportunityInspectorWidgetConati);
export default CourseOpportunityInspectorWidgetContainer;
