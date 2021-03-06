import React from 'react';
import { Grid, Message } from 'semantic-ui-react';
import * as Router from '../../components/shared/RouterHelperFunctions';
import AdvisorPageMenuWidget from '../../components/advisor/AdvisorPageMenuWidget';
import AdminPageMenuWidget from '../../components/admin/AdminPageMenuWidget';
import FacultyPageMenuWidget from '../../components/faculty/FacultyPageMenuWidget';
import HelpPanelWidget from '../../components/shared/HelpPanelWidget';
import ScoreboardPageMenu from '../../components/shared/ScoreboardPageMenu';
import { COURSE_SCOREBOARD, OPPORTUNITY_SCOREBOARD } from '../../../startup/client/route-constants';
import CourseScoreboardWidget from '../../components/shared/CourseScoreboardWidget';
import OpportunityScoreboardWidgetContainer from '../../components/shared/OpportunityScoreboardWidget';
import BackToTopButton from '../../components/shared/BackToTopButton';

export interface IScoreboardPageProps {
  match: {
    isExact: boolean;
    path: string;
    url: string;
    params: {
      username: string;
    }
  };
}

const renderPageMenuWidget = (props: IScoreboardPageProps): JSX.Element => {
  const role = Router.getRoleByUrl(props.match);
  switch (role) {
    case 'advisor':
      return <AdvisorPageMenuWidget />;
    case 'admin':
      return <AdminPageMenuWidget />;
    case 'faculty':
      return <FacultyPageMenuWidget />;
    default:
      return <React.Fragment />;
  }
};

const ScoreboardPage = (props: IScoreboardPageProps) => {
  let content = <Message>Choose a scoreboard from the menu to the left.</Message>;
  if (props.match.path.indexOf(COURSE_SCOREBOARD) !== -1) {
    content = <CourseScoreboardWidget />;
  }
  if (props.match.path.indexOf(OPPORTUNITY_SCOREBOARD) !== -1) {
    content = <OpportunityScoreboardWidgetContainer />;
  }
  return (
    <React.Fragment>
      {renderPageMenuWidget(props)}
      <Grid container stackable padded="vertically">
        <Grid.Row>
          <HelpPanelWidget />
        </Grid.Row>

        <Grid.Column width={3}>
          <ScoreboardPageMenu />
        </Grid.Column>
        <Grid.Column width={13}>
          {content}
        </Grid.Column>
      </Grid>

      <BackToTopButton />
    </React.Fragment>
  );
};

export default ScoreboardPage;
