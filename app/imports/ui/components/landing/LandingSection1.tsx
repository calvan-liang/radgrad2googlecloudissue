import React from 'react';
import { Card, Container, Grid, Header, Icon, Image, Label } from 'semantic-ui-react';
import RadGradLogoText from '../shared/RadGradLogoText';
import MenuIceCircle from '../shared/MenuIceCircle';
import styles from './landing-styles';

// import './landing-section-1.css';

const headerStyle = { fontSize: '72px', display: 'inline' };
const LandingSection1 = () => (
  <div id="landing-section-1" style={styles['inverted-section']}>
    <Container textAlign="center">
      <Header as="h1" inverted style={styles['inverted-main-header']}>
        Welcome to
        <span style={styles['green-text']}> <RadGradLogoText style={headerStyle} /></span>
      </Header>
      <Header as="h2" inverted className="mobile only" style={styles['mobile-header']}>
        Welcome to&nbsp;
        <span className="green-text"><RadGradLogoText /></span>
      </Header>
      <br />
      <span style={styles['inverted-main-description']}>
        Developing awesome computer scientists, <b>one</b> graduate at a time.
      </span>
      <Card.Group stackable doubling centered itemsPerRow={4} style={styles['main-header-ice']}>
        <Card>
          <Card.Content>
            <Image size="mini" floated="right" src="/images/landing/yamakawa.jpg" />
            <Card.Header>Kelsie Y.</Card.Header>
            <Card.Meta>
              B.S. in Computer Science
            </Card.Meta>
            <Card.Description>
              <Grid className="landing-ice" columns={3}>
                <Grid.Column>
                  <MenuIceCircle earned={92} planned={100} type="innov" />
                </Grid.Column>
                <Grid.Column>
                  <MenuIceCircle earned={81} planned={100} type="comp" />
                </Grid.Column>
                <Grid.Column>
                  <MenuIceCircle earned={90} planned={100} type="exp" />
                </Grid.Column>
              </Grid>
            </Card.Description>
          </Card.Content>
          <Card.Content extra textAlign="left">
            <Label size="mini">
              <Icon fitted name="suitcase" />
              Data Science
            </Label>
            <Label size="mini">
              <Icon fitted name="suitcase" />
              Databases
            </Label>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content>
            <Image size="mini" floated="right" src="/images/landing/boado.jpg" />
            <Card.Header>Brian B.</Card.Header>
            <Card.Meta>
              B.A. in Info. &amp; Comp. Sci.
            </Card.Meta>
            <Card.Description>
              <Grid className="landing-ice" columns={3}>
                <Grid.Column>
                  <MenuIceCircle earned={68} planned={100} type="innov" />
                </Grid.Column>
                <Grid.Column>
                  <MenuIceCircle earned={63} planned={100} type="comp" />
                </Grid.Column>
                <Grid.Column>
                  <MenuIceCircle earned={70} planned={100} type="exp" />
                </Grid.Column>
              </Grid>
            </Card.Description>
          </Card.Content>
          <Card.Content extra textAlign="left">
            <Label size="mini">
              <Icon fitted name="suitcase" />
              Software Engineering
            </Label>
            <Label size="mini" className="ui mini label">
              <Icon fitted name="suitcase" />
              Reseach
            </Label>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content>
            <Image size="mini" floated="right" src="/images/landing/shimoda.jpg" />
            <Card.Header>Michele S.</Card.Header>
            <Card.Meta>
              B.S. in Computer Science
            </Card.Meta>
            <Card.Description>
              <Grid className="landing-ice" columns={3}>
                <Grid.Column>
                  <MenuIceCircle earned={86} planned={100} type="innov" />
                </Grid.Column>
                <Grid.Column>
                  <MenuIceCircle earned={81} planned={100} type="comp" />
                </Grid.Column>
                <Grid.Column>
                  <MenuIceCircle earned={95} planned={100} type="exp" />
                </Grid.Column>
              </Grid>
            </Card.Description>
          </Card.Content>
          <Card.Content extra>
            <Label size="mini">
              <Icon fitted name="suitcase" />
              Game Design
            </Label>
            <Label size="mini">
              <Icon fitted name="star" />
              Unity
            </Label>
          </Card.Content>
        </Card>
        <Card>
          <Card.Content>
            <Image size="mini" floated="right" src="/images/landing/morikawa.jpg" />
            <Card.Header>Sy M.</Card.Header>
            <Card.Meta>
              B.S. in Computer Science
            </Card.Meta>
            <Card.Description>
              <Grid className="landing-ice" columns={3}>
                <Grid.Column>
                  <MenuIceCircle earned={65} planned={100} type="innov" />
                </Grid.Column>
                <Grid.Column>
                  <MenuIceCircle earned={78} planned={100} type="comp" />
                </Grid.Column>
                <Grid.Column>
                  <MenuIceCircle earned={74} planned={100} type="exp" />
                </Grid.Column>
              </Grid>
            </Card.Description>
          </Card.Content>
          <Card.Content extra>
            <Label size="mini">
              <Icon fitted name="suitcase" />
              Hardware
            </Label>
            <Label size="mini">
              <Icon fitted name="suitcase" />
              Networks
            </Label>
          </Card.Content>
        </Card>
      </Card.Group>
    </Container>
  </div>
);

export default LandingSection1;
