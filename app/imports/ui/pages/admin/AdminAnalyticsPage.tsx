import React from 'react';
import { Grid } from 'semantic-ui-react';
import AdminPageMenuWidget from '../../components/admin/AdminPageMenuWidget';
import AdminAnalyticsMenuWidget from '../../components/admin/AdminAnalyticsMenuWidget';
import AdminAnalyticsLoggedInUsersWidget from '../../components/admin/AdminAnalyticsLoggedInUsersWidget';

const AdminAnalyticsPage = () => (
  <div>
    <AdminPageMenuWidget />
    <Grid container stackable columns={1}>
      <Grid.Column>
        <Grid>
          <Grid.Column width={3}>
            <AdminAnalyticsMenuWidget />
          </Grid.Column>
          <Grid.Column width={13}>
            <AdminAnalyticsLoggedInUsersWidget />
          </Grid.Column>
        </Grid>
      </Grid.Column>
    </Grid>
  </div>
);


export default AdminAnalyticsPage;
