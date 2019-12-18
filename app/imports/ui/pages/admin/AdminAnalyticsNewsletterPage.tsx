import * as React from 'react';
import { Grid } from 'semantic-ui-react';
import AdminPageMenuWidget from '../../components/admin/AdminPageMenuWidget';
import AdminAnalyticsMenuWidget from '../../components/admin/AdminAnalyticsMenuWidget';
import AdminAnalyticsNewsletterWidget from '../../components/admin/AdminAnalyticsNewsletterWidget';

/** A simple static component to render some text for the landing page. */
const AdminAnalyticsNewsletterPage = () => {
  const paddedStyle = {
    paddingTop: 20,
  };
  return (
    <div>
      <AdminPageMenuWidget/>
      <Grid container={true} stackable={true} style={paddedStyle} columns={1}>
        <Grid.Column>
          <Grid>
            <Grid.Column width={3}>
              <AdminAnalyticsMenuWidget/>
            </Grid.Column>
            <Grid.Column width={13}>
              <AdminAnalyticsNewsletterWidget/>
            </Grid.Column>
          </Grid>
        </Grid.Column>
      </Grid>
    </div>
  );
};

export default AdminAnalyticsNewsletterPage;
// don't forget to wrap the AdminAnalyticsNewsletterPage just like the Admin Database Page
// the page also needs the subsciption
// multifactor
