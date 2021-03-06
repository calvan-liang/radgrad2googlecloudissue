import React from 'react';
import { Grid } from 'semantic-ui-react';
import HelpPanelWidget from '../../components/shared/HelpPanelWidget';
import StudentPageMenuWidget from '../../components/student/StudentPageMenuWidget';
import MentorPageMenuWidget from '../../components/mentor/MentorPageMenuWidget';
import FacultyPageMenuWidget from '../../components/faculty/FacultyPageMenuWidget';
import * as Router from '../../components/shared/RouterHelperFunctions';
import ExplorerNavDropdown from '../../components/shared/ExplorerNavDropdown';

interface IExplorerHomePageProps {
  match: {
    isExact: boolean;
    path: string;
    url: string;
    params: {
      username: string;
    }
  };
}

const renderPageMenuWidget = (props: IExplorerHomePageProps): JSX.Element => {
  const role = Router.getRoleByUrl(props.match);
  switch (role) {
    case 'student':
      return <StudentPageMenuWidget />;
    case 'mentor':
      return <MentorPageMenuWidget />;
    case 'faculty':
      return <FacultyPageMenuWidget />;
    default:
      return <React.Fragment />;
  }
};

const ExplorerHomePage = (props: IExplorerHomePageProps) => (
  <div>
    {renderPageMenuWidget(props)}
    <Grid stackable>
      <Grid.Row>
        <Grid.Column width={1} />
        <Grid.Column width={14}><HelpPanelWidget /></Grid.Column>
        <Grid.Column width={1} />
      </Grid.Row>

      <Grid.Row>
        <Grid.Column width={1} />
        <Grid.Column width={3}>
          <ExplorerNavDropdown match={props.match} text="Select Explorer" />
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </div>
);

export default ExplorerHomePage;
