import * as React from 'react';
import { connect } from 'react-redux';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Card, Form, Grid, Header, Icon, Image, Loader, Segment } from 'semantic-ui-react';
import { _ } from 'meteor/erasaur:meteor-lodash';
import { Courses } from '../../../api/course/CourseCollection';
import { selectCourse } from '../../../redux/actions/actions';
import { ICourse } from '../../../typings/radgrad';
import withGlobalSubscription from '../../layouts/shared/GlobalSubscriptionsHOC';
import withInstanceSubscriptions from '../../layouts/shared/InstanceSubscriptionsHOC';
import { Slugs } from '../../../api/slug/SlugCollection';

interface IConnectedCourseSelectorTempProps {
  ready: boolean;
  courses: ICourse[];
  selectCourse: (courseID: string) => any;
}
interface IConnectedCourseSelectorTempState {
  courseID?: string;
}

const mapDispatchToProps = (dispatch) => {
  return {
    selectCourse: (courseID) => dispatch(selectCourse(courseID)),
  };
};

class ConnectedCourseSelectorTemp extends React.Component<IConnectedCourseSelectorTempProps, IConnectedCourseSelectorTempState> {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {};
  }

  private handleChange(event, { value }) {
    // console.log(value);
    this.setState({ courseID: value });
  }

  private handleSubmit(event) {
    event.preventDefault();
    const { courseID } = this.state;
    // console.log(courseID);
    this.props.selectCourse(courseID);
  }

  public render() {
    return (this.props.ready) ? this.renderPage() : <Loader>Loading Courses</Loader>;
  }

  private renderPage() {
    const options = [];
    _.forEach(this.props.courses, (c) => {
      options.push({
        key: c._id,
        text: c.shortName,
        value: c._id,
      });
    });
    // console.log(options);
    return (
      <Form>
        <Form.Select fluid={true} label="Course" options={options} placeholder="Course" onChange={this.handleChange} />
        <Form.Button onClick={this.handleSubmit}>Submit</Form.Button>
      </Form>
    );
  }
}

const ConnectedCourseSelectorTempCon = withGlobalSubscription(ConnectedCourseSelectorTemp);
const ConnectedCourseSelectorTempCont = withInstanceSubscriptions(ConnectedCourseSelectorTempCon);

const ConnectedCourseSelectorTempConta = withTracker(() => {
  const sub1 = Meteor.subscribe(Courses.getPublicationName());
  const sub2 = Meteor.subscribe(Slugs.getPublicationName());
  return {
    ready: sub1.ready() && sub2.ready(),
    courses: Courses.findNonRetired({}, { sort: { shortName: 1 } }),
    count: Courses.countNonRetired(),
  };
})(ConnectedCourseSelectorTempCont);

const ConnectedCourseSelectorTempContainer = connect(null, mapDispatchToProps)(ConnectedCourseSelectorTempConta);
export default ConnectedCourseSelectorTempContainer;
