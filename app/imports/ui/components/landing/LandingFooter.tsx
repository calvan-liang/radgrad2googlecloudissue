import * as React from 'react';
import { Meteor } from 'meteor/meteor';
import { Card, Container, Grid, Header, Icon, Image, Label, List, Loader, Segment } from 'semantic-ui-react';
import styles from './landing-styles';

const style = {
  backgroundColor: '#252525',
  padding: '1rem 0',
};

const LandingFooter = () => (
  <footer>
    <div style={style}>
      <Container textAlign={'center'}>
        <List bulleted={true} horizontal={true}>
          <List.Item as="a" href="http://radgrad.org/" style={styles['footer-item:before, .footer-item']}>
            About Us
          </List.Item>
          <List.Item as="a" href="http://radgrad.org/organization/contact.html"style={styles['footer-item:before, .footer-item']}>
            Contact
          </List.Item>
        </List>
      </Container>
    </div>
  </footer>
);

export default LandingFooter;