import React, { useState } from 'react';
import { Grid, Menu } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router-dom';
import AdvisorPageMenuWidget from '../../components/advisor/AdvisorPageMenuWidget';
import HelpPanelWidget from '../../components/shared/HelpPanelWidget';
import PendingVerificationsWidget from '../../components/shared/PendingVerificationsWidget';
import EventVerificationsWidget from '../../components/shared/EventVerificationsWidget';
import CompletedVerificationsWidget from '../../components/shared/CompletedVerificationsWidget';
import { VerificationRequests } from '../../../api/verification/VerificationRequestCollection';
import { IOpportunity, IVerificationRequest } from '../../../typings/radgrad';
import { Opportunities } from '../../../api/opportunity/OpportunityCollection';
import BackToTopButton from '../../components/shared/BackToTopButton';
import withAdditionalSubscriptions from '../../layouts/shared/AdvisorFacultyAdditionalSubscriptionsHOC';

interface IAdvisorVerificationRequestPageProps {
  verificationRequests: IVerificationRequest[];
  eventOpportunities: IOpportunity[];
  match: {
    params: {
      username: string;
    }
  }
}

interface IAdvisorVerificationRequestPageState {
  activeItem: string;
}

const AdvisorVerificationRequestPage = (props: IAdvisorVerificationRequestPageProps) => {
  const [activeItemState, setActiveItem] = useState('pending');

  const handleMenu = (e, { name }) => setActiveItem(name);

  return (
    <div>
      <AdvisorPageMenuWidget />
      <Grid stackable>
        <Grid.Row>
          <Grid.Column width={1} />
          <Grid.Column width={14}><HelpPanelWidget /></Grid.Column>
          <Grid.Column width={1} />
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={1} />
          <Grid.Column width={3}>
            <Menu vertical>
              <Menu.Item
                name="pending"
                active={activeItemState === 'pending'}
                onClick={handleMenu}
              >
                Pending Verifications
              </Menu.Item>
              <Menu.Item
                name="event"
                active={activeItemState === 'event'}
                onClick={handleMenu}
              >
                Event Verifications
              </Menu.Item>
              <Menu.Item
                name="completed"
                active={activeItemState === 'completed'}
                onClick={handleMenu}
              >
                Completed Verifications
              </Menu.Item>
            </Menu>
          </Grid.Column>
          <Grid.Column width={11}>
            {activeItemState === 'pending' ? (
              <PendingVerificationsWidget
                pendingVerifications={props.verificationRequests.filter(ele => ele.status === VerificationRequests.OPEN)}
              />
              )
              : undefined}
            {activeItemState === 'event' ?
              <EventVerificationsWidget eventOpportunities={props.eventOpportunities} />
              : undefined}
            {activeItemState === 'completed' ? (
              <CompletedVerificationsWidget
                username={props.match.params.username}
                completedVerifications={props.verificationRequests.filter(ele => VerificationRequests.ACCEPTED === ele.status || ele.status === VerificationRequests.REJECTED)}
              />
              )
              : undefined}
          </Grid.Column>
          <Grid.Column width={1} />
        </Grid.Row>
        {/* </Grid.Column> */}
      </Grid>

      <BackToTopButton />
    </div>
  );
};

const AdvisorVerificationRequestPageContainerTracker = withTracker(() => ({
  verificationRequests: VerificationRequests.find({}).fetch(),
  eventOpportunities: Opportunities.find({ eventDate: { $exists: true } }).fetch(),
}))(AdvisorVerificationRequestPage);
const AdvisorVerificationRequestPageContainerTrackerRouter = withRouter(AdvisorVerificationRequestPageContainerTracker);

export default withAdditionalSubscriptions(AdvisorVerificationRequestPageContainerTrackerRouter);
