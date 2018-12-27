import * as React from 'react';
import { Grid, Header } from 'semantic-ui-react';
import { DragDropContext } from 'react-beautiful-dnd';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import StudentPageMenuWidget from '../../components/student/StudentPageMenuWidget';
import withGlobalSubscription from '../../layouts/shared/GlobalSubscriptionsHOC';
import withInstanceSubscriptions from '../../layouts/shared/InstanceSubscriptionsHOC';
import TabbedPlanInspector from '../../components/student/TabbedPlanInspector';
import DegreeExperiencePlannerWidget from '../../components/student/DegreeExperiencePlannerWidget';
import { selectCourseInstance, selectOpportunityInstance } from '../../../redux/actions/actions';
import { Courses } from '../../../api/course/CourseCollection';
import { CourseInstances } from '../../../api/course/CourseInstanceCollection';
import { defineMethod } from '../../../api/base/BaseCollection.methods';
import { ICourseInstanceDefine, IOpportunityInstanceDefine } from '../../../typings/radgrad';
import { Opportunities } from '../../../api/opportunity/OpportunityCollection';
import { OpportunityInstances } from '../../../api/opportunity/OpportunityInstanceCollection';
import { Users } from '../../../api/user/UserCollection';

interface IPageProps {
  selectCourseInstance: (courseInstanceID: string) => any;
  selectOpportunityInstance: (opportunityInstanceID: string) => any;
  match: {
    isExact: boolean;
    path: string;
    url: string;
    params: {
      username: string;
    }
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    selectCourseInstance: (courseInstanceID) => dispatch(selectCourseInstance(courseInstanceID)),
    selectOpportunityInstance: (opportunityInstanceID) => dispatch(selectOpportunityInstance(opportunityInstanceID)),
  };
};

class StudentDegreePlannerPage extends React.Component<IPageProps> {
  constructor(props) {
    super(props);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  public onDragEnd(result) {
    // console.log(result);
    if (!result.destination) {
      return;
    }
    const termSlug: string = result.destination.droppableId;
    const slug: string = result.draggableId;
    const student = this.props.match.params.username;
    const instance = this; // tslint:disable-line: no-this-assignment
    console.log(termSlug, slug, student);
    if (Courses.isDefined(slug)) {
      const courseID = Courses.findIdBySlug(slug);
      const course = Courses.findDoc(courseID);
      const collectionName = CourseInstances.getCollectionName();
      const definitionData: ICourseInstanceDefine = {
        academicTerm: termSlug,
        course: slug,
        verified: false,
        fromSTAR: false,
        note: course.num,
        grade: 'B',
        student,
        creditHrs: course.creditHrs,
      };
      defineMethod.call({ collectionName, definitionData }, (error, res) => {
        if (error) {
          console.log(error);
        } else {
          // console.log(res);
          instance.props.selectCourseInstance(res);
        }
      });
    } else if (Opportunities.isDefined(slug)) {
      const opportunityID = Opportunities.findIdBySlug(slug);
      const opportunity = Opportunities.findDoc(opportunityID);
      const sponsor = Users.getProfile(opportunity.sponsorID).username;
      const collectionName = OpportunityInstances.getCollectionName();
      const definitionData: IOpportunityInstanceDefine = {
        academicTerm: termSlug,
        opportunity: slug,
        verified: false,
        student,
        sponsor,
      };
      // console.log(definitionData);
      defineMethod.call({ collectionName, definitionData }, (error, res) => {
        if (error) {
          console.log(error);
        } else {
          // console.log(res);
          instance.props.selectOpportunityInstance(res);
        }
      });
    }
  }

  public render() {
    const paddedStyle = {
      paddingTop: 0,
      paddingLeft: 10,
      paddingRight: 20,
    };
    const marginStyle = {
      marginLeft: 10,
      marginRight: 10,
      marginTop: 5,
    };
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <StudentPageMenuWidget/>
        <Grid stackable={true} style={marginStyle}>
          <Grid.Row verticalAlign="middle" style={{ paddingBottom: 0 }}>
            <Header as="h1" style={{ paddingLeft: 10 }}>Degree Experience Planner</Header>
          </Grid.Row>
          <Grid.Row stretched={true}>
            <Grid.Column width={10} style={paddedStyle}>
              <DegreeExperiencePlannerWidget/>
            </Grid.Column>

            <Grid.Column width={6} style={paddedStyle}>
              <TabbedPlanInspector/>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </DragDropContext>
    );
  }
}

const StudentDegreePlannerPageCon = withGlobalSubscription(StudentDegreePlannerPage);
const StudentDegreePlannerPageCont = withInstanceSubscriptions(StudentDegreePlannerPageCon);
const StudentDegreePlannerPageContainer = connect(null, mapDispatchToProps)(StudentDegreePlannerPageCont);

export default withRouter(StudentDegreePlannerPageContainer);
