import React from 'react';
import { Container, Grid, Header, Image } from 'semantic-ui-react';
import styles from './landing-styles';

interface ILandingSection3Props {
  careerGoals: string;
  interests: string;
  academicPlans: string;
}

const LandingSection3 = (props: ILandingSection3Props) => (
  <div id="landing-section-3" style={styles['inverted-section']}>
    <Container>
      <Grid textAlign="center" padded stackable columns={2} style={styles.container}>
        <Grid.Column>
          <Image rounded src="/images/landing/abi-about-me.png" />
        </Grid.Column>
        <Grid.Column>
          <Header as="h1" style={styles['inverted-header']}>
            Specify your academic plan, career goals, and interests
          </Header>
          <p style={styles['inverted-description']}>
            Getting started with RadGrad is easy. Just meet with your advisor, and they will set up your account and
            answer your questions.
          </p>

          <p style={styles['inverted-description']}>
            To start, you&apos;ll select one of the <strong style={styles['green-text']}>{props.academicPlans}</strong>
            <a href="#/explorer/plans"> academic plans</a>, one out of <strong>{props.careerGoals}</strong>
            <a href="#/explorer/career-goals"> career directions</a>, and a few of the <strong>{props.interests}</strong>
            <a href="#/explorer/interests"> interest areas.</a> Don&apos;t worry, you can change them later!
          </p>
        </Grid.Column>
      </Grid>
    </Container>
  </div>
);

export default LandingSection3;
