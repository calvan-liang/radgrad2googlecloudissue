import React from 'react';
import { Container, Grid, Header, Image } from 'semantic-ui-react';
import styles from './landing-styles';

const LandingSection5 = () => (
  <div id="landing-section-5" style={styles['inverted-section']}>
    <Container>
      <Grid
        columns={2}
        centered
        padded
        stackable
        style={styles['landing-section-3 .grid, landing-section-4 .grid, landing-section-5 .grid, landing-section-6 .container, landing-section-7 .grid, landing-section-8 .container, landing-section-9 .container']}
      >
        <Grid.Column>
          <Image rounded src="/images/landing/abi-home-ice.png" />
        </Grid.Column>

        <Grid.Column>
          <Header as="h1" style={styles['inverted-header']}>Measure your progress with ICE</Header>
          <p style={styles['inverted-description']}>
            A decent GPA is only one piece of the puzzle for a well-rounded computer science degree experience. RadGrad
            provides a self-assessment tool called &quot;ICE&quot;, which stands for
            <span className="ice-innovation-proj-color"><b> Innovation</b></span>,
            <span className="ice-competency-proj-color"><b> Competency</b></span>, and
            <span className="ice-experience-proj-color"><b> Experience</b></span>.
          </p>

          <p style={styles['inverted-description']}>
            To be competitive in the high tech job market, you want to demonstrate innovation (through participation in
            research, hackathons, and the like), competency (through good grades in CS course work), and real-world
            experience (through participation in internships and other professional experiences).
          </p>

          <p style={styles['inverted-description']}>
            How do you know when you&apos;re well-rounded? Just accumulate 100 points in each of the three categories by
            the time you graduate.
          </p>
        </Grid.Column>
      </Grid>
    </Container>
  </div>
);

export default LandingSection5;
