import * as React from 'react';
import { Button, Container, Dropdown, Grid, Header, Icon, Segment } from 'semantic-ui-react';
import { _ } from 'meteor/erasaur:meteor-lodash';
import { Courses } from '../../../api/course/CourseCollection';
import { buildSimpleName } from '../../../api/degree-plan/PlanChoiceUtilities';
import { Slugs } from '../../../api/slug/SlugCollection';
import IceHeader from '../shared/IceHeader';
import { makeCourseICE } from '../../../api/ice/IceProcessor';
import CoursePrerequisitesView from './CoursePrerequisitesView';

interface IInspectorCourseViewProps {
  courseID: string;
  studentID: string;
}

class InspectorCourseView extends React.Component<IInspectorCourseViewProps> {
  constructor(props) {
    super(props);
  }

  public render() {
    const course = Courses.findDoc(this.props.courseID);
    const courseSlug = Slugs.getNameFromID(course.slugID);
    const paddingStyle = {
      paddingTop: 15,
    };
    console.log(course.prerequisites);
    return (
      <Container fluid={true} style={paddingStyle}>
        <Header as="h4" dividing={true}>{course.num} {course.name} <IceHeader ice={makeCourseICE(courseSlug, 'C')}/></Header>
          <Button floated="right" basic={true} color="green"
                  size="tiny">{buildSimpleName(courseSlug)}</Button>
        <b>Scheduled: N/A</b>
        <p><b>Prerequisites:</b>
          <CoursePrerequisitesView prerequisites={course.prerequisites} studentID={this.props.studentID}/>
        </p>
      </Container>
    );
  }
}

export default InspectorCourseView;
