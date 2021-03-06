import React, { useState } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import { Grid, Segment, Header, Button, Table } from 'semantic-ui-react';
import { IStudentProfile } from '../../../typings/radgrad';
import { StudentProfiles } from '../../../api/user/StudentProfileCollection';
import { userInteractionFindMethod } from '../../../api/analytic/UserInteractionCollection.methods';

interface IAdminAnalyticsUserInteractionsWidgetProps {
  students: IStudentProfile[];
}

interface IAdminAnalyticsUserInteractionsWidgetState {
  selectedStudent?: IStudentProfile;
  interactions: any[];
}

const AdminAnalyticsUserInteractionsWidget = (props: IAdminAnalyticsUserInteractionsWidgetProps) => {
  const [selectedStudent, setSelectedStudent] = useState(undefined);
  const [interactions, setInteractions] = useState([]);

  const handleClick = (event, instance) => {
    // console.log(event, instance);
    event.preventDefault();
    const username = instance.value;
    setSelectedStudent(StudentProfiles.findDoc({ username }));
    // console.log(selectedStudent);
    const selector = { username };
    const options = { sort: { timestamp: -1 } };
    userInteractionFindMethod.call({ selector, options }, (error, result) => {
      if (error) {
        console.log('Error finding user interactions.', error);
      } else {
        setInteractions(result);
      }
    });

  };

  const getStudentName = () => {
    if (selectedStudent) {
      return ` ${selectedStudent.firstName} ${selectedStudent.lastName}`;
    }
    return ' NO USER SELECTED';
  };

  const usersStyle = {
    height: 200,
    overflowY: 'auto',
  };
  const columnStyle = {
    padding: 2,
  };
  const buttonStyle = {
    textAlign: 'left',
  };
  const nameStyle = {
    color: '#6FBE44',
  };
  return (
    <div>
      <Segment padded>
        <Header as="h4" dividing>USERS</Header>
        <Grid padded stackable style={usersStyle}>
          {props.students.map((student) => (
            <Grid.Column width={4} style={columnStyle} key={student._id}>
              <Button
                size="tiny"
                color="grey"
                basic
                fluid
                style={buttonStyle}
                value={student.username}
                onClick={handleClick}
              >
                {`${student.firstName} ${student.lastName}`}
              </Button>
            </Grid.Column>
          ))}
        </Grid>
      </Segment>
      <Segment padded style={usersStyle}>
        <Header as="h4" dividing>
          USER INTERACTIONS:&nbsp;
          <span style={nameStyle}>{getStudentName()}</span>
        </Header>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Type Data</Table.HeaderCell>
              <Table.HeaderCell>Timestamp</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {interactions.map((interaction) => (
              <Table.Row key={interaction._id}>
                <Table.Cell>{interaction.type}</Table.Cell>
                <Table.Cell>{interaction.typeData}</Table.Cell>
                <Table.Cell>{moment(interaction.timestamp).format('MM/DD/YY HH:mm')}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

      </Segment>
    </div>
  );
};

const AdminAnalyticsUserInteractionsWidgetCon = withTracker(() => {
  const students = StudentProfiles.findNonRetired({ isAlumni: false });
  return {
    students,
  };
})(AdminAnalyticsUserInteractionsWidget);

export default withRouter(AdminAnalyticsUserInteractionsWidgetCon);
