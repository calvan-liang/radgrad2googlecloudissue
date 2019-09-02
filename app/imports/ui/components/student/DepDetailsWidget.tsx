import * as React from 'react';
import { connect } from 'react-redux';
import { Message } from 'semantic-ui-react';
import { ICourseInstance, IOpportunityInstance } from '../../../typings/radgrad'; // eslint-disable-line no-unused-vars
import DetailCourseCard from './DetailCourseCard';
import { CourseInstances } from '../../../api/course/CourseInstanceCollection';
import { OpportunityInstances } from '../../../api/opportunity/OpportunityInstanceCollection';

interface IDepDetailsWidgetProps {
  selectedCourseInstanceID: string;
  selectedOpportunityInstanceID: string;
}

const mapStateToProps = (state) => ({
  selectedCourseInstanceID: state.student.degreePlanner.inspector.depInspector.selectedCourseInstanceID,
  selectedOpportunityInstanceID: state.student.degreePlanner.inspector.depInspector.selectedOpportunityInstanceID,
});

const DepDetailsWidget = (props: IDepDetailsWidgetProps) => {
  const courseP = props.selectedCourseInstanceID !== '';
  const opportunityP = props.selectedOpportunityInstanceID !== '';
  // console.log('DepDetailsWidget', props, courseP, opportunityP);
  let instance;
  if (courseP) {
    instance = CourseInstances.findDoc(props.selectedCourseInstanceID);
  } else if (opportunityP) {
    instance = OpportunityInstances.findDoc(props.selectedOpportunityInstanceID);
  } else {
    return <Message>No course or opportunity selected. Please click on a course or opportunity to the left.</Message>;
  }
  return (courseP ? <DetailCourseCard instance={instance}/> : 'Opportunity Instance');
};

export default connect(mapStateToProps, null)(DepDetailsWidget);