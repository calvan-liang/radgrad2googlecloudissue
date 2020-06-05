import * as React from 'react';
import { Grid } from 'semantic-ui-react';
import * as Router from '../../components/shared/RouterHelperFunctions';
import { URL_ROLES } from '../../../startup/client/route-constants';
import AdminPageMenuWidget from '../../components/admin/AdminPageMenuWidget';
import AdvisorPageMenuWidget from '../../components/advisor/AdvisorPageMenuWidget';
import FacultyPageMenuWidget from '../../components/faculty/FacultyPageMenuWidget';
import MentorPageMenuWidget from '../../components/mentor/MentorPageMenuWidget';
import StudentPageMenuWidget from '../../components/student/StudentPageMenuWidget';
import { IMatchProps } from '../../components/shared/RouterHelperFunctions';
import HelpPanelWidget from '../../components/shared/HelpPanelWidget';
import PageTrackingScoreboardMenu from '../../components/shared/PageTrackingMenu';
import PageTrackingComparisonWidget from './PageTrackingComparisonWidget';

interface IPageTrackingComparisonPageProps {
  match: IMatchProps;
}

const PageTrackingComparisonPage = (props: IPageTrackingComparisonPageProps) => {
  const renderPageMenuWidget = (): JSX.Element => {
    const role = Router.getRoleByUrl(props.match);
    switch (role) {
      case URL_ROLES.ADMIN:
        return <AdminPageMenuWidget />;
      case URL_ROLES.ADVISOR:
        return <AdvisorPageMenuWidget />;
      case URL_ROLES.FACULTY:
        return <FacultyPageMenuWidget />;
      case URL_ROLES.MENTOR:
        return <MentorPageMenuWidget />;
      case URL_ROLES.STUDENT:
        return <StudentPageMenuWidget />;
      default:
        console.error('renderPageMenuWidget(): Unable to render the correct menu widget for the current role');
        return undefined;
    }
  };

  return (
    <React.Fragment>
      {renderPageMenuWidget()}

      <Grid stackable>
        <Grid.Row>
          <Grid.Column width={1} />
          <Grid.Column width={14}><HelpPanelWidget /></Grid.Column>
          <Grid.Column width={1} />
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={1} />
          <Grid.Column width={3}>
            <PageTrackingScoreboardMenu type="comparison" />
          </Grid.Column>

          <Grid.Column width={11} stretched>
            <PageTrackingComparisonWidget />
          </Grid.Column>
          <Grid.Column width={1} />
        </Grid.Row>
      </Grid>
    </React.Fragment>
  );
};

export default PageTrackingComparisonPage;
