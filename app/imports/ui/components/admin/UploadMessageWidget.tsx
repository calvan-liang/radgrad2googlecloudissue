import React from 'react';
import { Message } from 'semantic-ui-react';

interface IUploadMessageWidgetProps {
  message: string;
  error: boolean;
}

const UploadMessageWidget = (props: IUploadMessageWidgetProps) => {
  if (props.error) {
    return (
      <Message negative>
        <Message.Header>Error loading fixture</Message.Header>
        <p>{props.message}</p>
      </Message>
    );
  }
  return (
    <Message positive>
      <Message.Header>Success loading fixture</Message.Header>
      <p>{props.message}</p>
    </Message>
  );
};

export default UploadMessageWidget;
