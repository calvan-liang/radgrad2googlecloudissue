import React from 'react';
import { connect } from 'react-redux';
import { Message } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import DetailCourseCard from './DetailCourseCard';
import { CourseInstances } from '../../../api/course/CourseInstanceCollection';
import { OpportunityInstances } from '../../../api/opportunity/OpportunityInstanceCollection';
import DetailOpportunityCard from './DetailOpportunityCard';
import { ICourseInstance, IOpportunityInstance } from '../../../typings/radgrad';

interface IDepDetailsWidgetProps {
  selectedCourseInstanceID: string;
  selectedOpportunityInstanceID: string;
  courseP: boolean;
  opportunityP: boolean;
  instance: (ICourseInstance | IOpportunityInstance);
}

const mapStateToProps = (state) => ({
  selectedCourseInstanceID: state.student.degreePlanner.inspector.depInspector.selectedCourseInstanceID,
  selectedOpportunityInstanceID: state.student.degreePlanner.inspector.depInspector.selectedOpportunityInstanceID,
});

const DepDetailsWidget = (props: IDepDetailsWidgetProps) => {
  const { instance, courseP, opportunityP } = props;
  if (!(courseP || opportunityP)) {
    return (
      <Message>
        No course or opportunity selected. Click on a course or opportunity from the degree planner.
      </Message>
    );
  }
  return (courseP ? <DetailCourseCard instance={instance} /> : <DetailOpportunityCard instance={instance} />);
};

const DepDetailsWidgetContainer = withTracker((props) => {
  const courseP = props.selectedCourseInstanceID !== '';
  const opportunityP = props.selectedOpportunityInstanceID !== '';
  let instance: (ICourseInstance | IOpportunityInstance);
  if (courseP) {
    instance = CourseInstances.findDoc(props.selectedCourseInstanceID);
  } else if (opportunityP) {
    instance = OpportunityInstances.findDoc(props.selectedOpportunityInstanceID);
  }
  return {
    courseP,
    opportunityP,
    instance,
  };
})(DepDetailsWidget);

export default connect(mapStateToProps, null)(DepDetailsWidgetContainer);
