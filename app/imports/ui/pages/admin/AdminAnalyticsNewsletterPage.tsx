import * as React from 'react';
import { Grid, Image } from 'semantic-ui-react';
import AdminPageMenuWidget from '../../components/admin/AdminPageMenuWidget';
import AdminAnalyticsMenuWidget from '../../components/admin/AdminAnalyticsMenuWidget'
import AdminAnalyticsLoggedInUsersWidget from "../../components/admin/AdminAnalyticsLoggedInUsersWidget";
import AdminAnalyticsNewsletterWidget from "../../components/admin/AdminAnalyticsNewsletterWidget";

/** A simple static component to render some text for the landing page. */
class AdminAnalyticsNewsletterPage extends React.Component {
  /** If the subscription(s) have been received, render the page, otherwise show a loading icon. */
  public render() {
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
  }
}

export default AdminAnalyticsNewsletterPage;