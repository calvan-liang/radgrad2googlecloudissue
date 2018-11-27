import * as React from 'react';
import { Grid, Image } from 'semantic-ui-react';
import MentorPageMenuWidget from '../../components/mentor/MentorPageMenuWidget';
import withGlobalSubscription from '../../layouts/shared/GlobalSubscriptionsHOC';
import withInstanceSubscriptions from '../../layouts/shared/InstanceSubscriptionsHOC';

/** A simple static component to render some text for the landing page. */
class MentorMentorSpacePage extends React.Component {
  public render() {
    return (
      <div>
        <MentorPageMenuWidget/>
        <Grid verticalAlign="middle" textAlign="center" container={true}>

          <Grid.Column width={4}>
            <Image size="small" circular={true} src="/images/radgrad_logo.png"/>
          </Grid.Column>

          <Grid.Column width={8}>
            <h1>Mentor MentorSpace</h1>
          </Grid.Column>

        </Grid>
      </div>
    );
  }
}

const MentorMentorSpacePageCon = withGlobalSubscription(MentorMentorSpacePage);
const MentorMentorSpacePageContainer = withInstanceSubscriptions(MentorMentorSpacePageCon);

export default MentorMentorSpacePageContainer;