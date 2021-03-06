import React, { useState } from 'react';
import { Segment, Header, Form } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import { AdvisorLogs } from '../../../api/log/AdvisorLogCollection';
import { Users } from '../../../api/user/UserCollection';
import { defineMethod } from '../../../api/base/BaseCollection.methods';
import { IAdvisorLog, IStudentProfile } from '../../../typings/radgrad';

export interface IAdvisorLogEntryWidgetProps {
  advisorLogs: IAdvisorLog[];
  usernameDoc: IStudentProfile;
  advisorUsername: string;
}

const AdvisorLogEntryWidget = (props: IAdvisorLogEntryWidgetProps) => {
  const [commentState, setComment] = useState('');
  const [advisorLogsState] = useState(props.advisorLogs);

  // For use with Date.getMinutes()
  const formatMinuteString = (min) => {
    if (min === 0) {
      return '00';
    }
    if (min > 0 && min < 10) {
      return `0${min}`;
    }
    if (min > 9 && min < 60) {
      return min.toString();
    }
    return 'formatMinuteString: error';
  };

  const handleForm = (e, { value }) => {
    setComment(value);
  };

  const onSubmit = () => {
    const collectionName = AdvisorLogs.getCollectionName();
    const definitionData: any = {};
    definitionData.advisor = props.advisorUsername;
    definitionData.student = props.usernameDoc.username;
    definitionData.text = commentState;

    defineMethod.call({ collectionName, definitionData }, (error) => {
      if (error) {
        Swal.fire({
          title: 'Add failed',
          text: error.message,
          icon: 'error',
        });
      } else {
        Swal.fire({
          title: 'Add succeeded',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
        });
        setComment('');
      }
    });
  };

  // componentDidUpdate(prevProps: Readonly<IAdvisorLogEntryWidgetProps>): void {
  //   if (props !== prevProps) {
  //     // eslint-disable-next-line react/no-did-update-set-state
  //     this.setState({ advisorLogs: props.advisorLogs });
  //   }
  // }

  return (
    <Segment padded>
      <Header as="h4" dividing>ADVISOR LOG</Header>
      <Form onSubmit={onSubmit} widths="equal">
        <Form.TextArea
          label="Comments"
          name="comment"
          onChange={handleForm}
          value={commentState}
        />
        <Form.Button content="ADD COMMENTS" type="Submit" basic color="green" />
      </Form>
      <br />
      <p style={{
        marginTop: '15px',
        display: 'block',
        margin: '0 0 .28571429rem 0',
        color: '#696969',
        fontSize: '.92857143em',
        fontWeight: 700,
        textTransform: 'none',
      }}
      >
        Past Advisor Logs
      </p>
      <div style={{ height: '200px' }}>
        <div style={{ height: '100%', overflowY: 'auto' }}>
          {advisorLogsState.length > 0 ? advisorLogsState.map(
            (ele) => (
              <Segment key={ele._id}>
                <strong>
                  {ele.createdOn.toDateString()} {ele.createdOn.getHours()}
                  :
                  {formatMinuteString(ele.createdOn.getMinutes())}
                  :
                </strong> {ele.text} <i>({Users.getProfile(ele.advisorID).firstName})
                </i>
              </Segment>
            ),
          ) : <i>No past advisor logs with this student.</i>}
        </div>
      </div>
    </Segment>
  );
};

export default AdvisorLogEntryWidget;
