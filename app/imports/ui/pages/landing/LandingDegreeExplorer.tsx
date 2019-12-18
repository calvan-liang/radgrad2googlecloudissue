import * as React from 'react';
import * as Markdown from 'react-markdown';
import { withRouter } from 'react-router';
import { withTracker } from 'meteor/react-meteor-data';
import { Grid, Header, Segment } from 'semantic-ui-react';
import ExplorerMenuBarContainer from '../../components/landing/LandingExplorerMenuBar';
import { IDesiredDegree, IRadGradMatch } from '../../../typings/radgrad'; // eslint-disable-line no-unused-vars
import { Slugs } from '../../../api/slug/SlugCollection';
import LandingExplorerMenuContainer from '../../components/landing/LandingExplorerMenu';
import withListSubscriptions from '../../layouts/shared/SubscriptionListHOC';
import { DesiredDegrees } from '../../../api/degree-plan/DesiredDegreeCollection';
import * as Router from '../../components/shared/RouterHelperFunctions';
import HelpPanelWidget from '../../components/shared/HelpPanelWidget';
import BackToTopButton from '../../components/shared/BackToTopButton';

interface IDesiredDegreeExplorerProps {
  desiredDegree: IDesiredDegree;
  match: IRadGradMatch;
}

const DesiredDegreeExplorer = (props: IDesiredDegreeExplorerProps) => {
  const { match } = props;
  return (
    <div>
      <ExplorerMenuBarContainer/>
      <Grid stackable={true}>
        <Grid.Row>
          <Grid.Column width={1}/>
          <Grid.Column width={14}><HelpPanelWidget/></Grid.Column>
          <Grid.Column width={1}/>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={1}/>
          <Grid.Column width={3}>
            <LandingExplorerMenuContainer/>
          </Grid.Column>

          <Grid.Column width={11}>
            <Segment padded={true} style={{ overflow: 'auto', maxHeight: 750 }}>
              <Header as="h4" dividing={true}>
                <span>{props.desiredDegree.name}</span>
              </Header>
              <b>Description:</b>
              <Markdown escapeHtml={true} source={props.desiredDegree.description}
                        renderers={{ link: (localProps) => Router.renderLink(localProps, match) }}/>
            </Segment>
          </Grid.Column>
          <Grid.Column width={1}/>
        </Grid.Row>
      </Grid>

      <BackToTopButton/>
    </div>
  );
};

const WithSubs = withListSubscriptions(DesiredDegreeExplorer, [
  DesiredDegrees.getPublicationName(),
  Slugs.getPublicationName(),
]);

const LandingDesiredDegreeExplorerCon = withRouter(WithSubs);

const LandingDesiredDegreeExplorerContainer = withTracker((props) => {
  const slugName = props.match.params.degree;
  // console.log(Slugs.find().fetch());
  const id = Slugs.getEntityID(slugName, 'DesiredDegree');
  return {
    desiredDegree: DesiredDegrees.findDoc(id),
  };
})(LandingDesiredDegreeExplorerCon);

export default LandingDesiredDegreeExplorerContainer;
