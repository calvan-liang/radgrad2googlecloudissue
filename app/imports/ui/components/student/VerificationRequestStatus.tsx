import React from 'react';
import _ from 'lodash';
import { Header, Card, List } from 'semantic-ui-react';
import moment from 'moment';

import { IVerificationRequest } from '../../../typings/radgrad';

interface IVerificationRequestStatusProps {
  request: IVerificationRequest;
}

const VerificationRequestStatus = (props: IVerificationRequestStatusProps) => {
  const whenSubmitted = moment(props.request.submittedOn).calendar();
  return (
    <Card.Content>
      <Header>Verification Status</Header>
      <span><strong>Date Submitted:</strong> {whenSubmitted}</span>
      <br />
      <span><strong>Status:</strong> {props.request.status}</span>
      <br />
      {props.request.processed.length > 0 ?
        (
          <React.Fragment>
            <strong>Documentation: </strong>
            <List bulleted>
              {_.map(props.request.processed, (process, index) => (
                <List.Item key={index}>
                  <b>({process.status}) {moment(process.date).calendar()}</b>
                  <br />
                  By {process.verifier}
                  {process.feedback ?
                    (<React.Fragment>: <em>{process.feedback}</em></React.Fragment>)
                    : ''}
                </List.Item>
              ))}
            </List>
          </React.Fragment>
        )
        : ''}
    </Card.Content>
  );
};

export default VerificationRequestStatus;
