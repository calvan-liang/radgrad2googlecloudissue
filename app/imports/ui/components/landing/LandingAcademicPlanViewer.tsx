import * as React from 'react';
import { Button, Card, Grid, Header, Icon, Label } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import { getSlug, itemShortDescription } from './helper-functions';
import { IAcademicPlan } from '../../../typings/radgrad';
import { PlanChoiceCollection } from '../../../api/degree-plan/PlanChoiceCollection';

interface ILandingAcademicPlanViewerProps {
  plan: IAcademicPlan;
}

function getCourses(plan, yearNum, semesterNum) {
  const ret = [];
  const totalSem = (3 * yearNum) + semesterNum;
  // console.log(`courses(${yearNumber}, ${semesterNumber}) ${totalSem}`);
  const numCoursesList = plan.coursesPerSemester.slice(0);
  const numCourses = numCoursesList[totalSem];
  const courseList = plan.courseList.slice(0);
  let i = 0;
  for (i = 0; i < totalSem; i += 1) {
    courseList.splice(0, numCoursesList[i]);
  }
  // console.log(numCourses, courseList);
  for (i = 0; i < numCourses; i += 1) {
    const course = courseList.splice(0, 1);
    ret.push(course[0]);
  }
  // console.log(`yearNum ${yearNum} semester ${semesterNum}`, ret);
  return ret;
}

const LandingAcademicPlanViewer = (props: ILandingAcademicPlanViewerProps) => {
  const plan = props.plan;
  const numYears = props.plan.isBAM ? 5 : 4;
  return (
    <Grid stackable={true} padded={true} columns={numYears}>
      <Grid.Column>
        <Header>Fall</Header>
        {getCourses(props.plan, 0, 0).map((c) => (<Label key={c} basic={true} color="green">{PlanChoiceCollection.toStringFromSlug(c)}</Label>))}
        <Header>Spring</Header>
        {getCourses(props.plan, 0, 1).map((c) => (<Label key={c} basic={true} color="green">{PlanChoiceCollection.toStringFromSlug(c)}</Label>))}
        <Header>Summer</Header>
        {getCourses(props.plan, 0, 2).map((c) => (<Label key={c} basic={true} color="green">{PlanChoiceCollection.toStringFromSlug(c)}</Label>))}
      </Grid.Column>
      <Grid.Column>
        <Header>Fall</Header>
        {getCourses(props.plan, 1, 0).map((c) => (<Label key={c} basic={true} color="green">{PlanChoiceCollection.toStringFromSlug(c)}</Label>))}
        <Header>Spring</Header>
        {getCourses(props.plan, 1, 1).map((c) => (<Label key={c} basic={true} color="green">{PlanChoiceCollection.toStringFromSlug(c)}</Label>))}
        <Header>Summer</Header>
        {getCourses(props.plan, 1, 2).map((c) => (<Label key={c} basic={true} color="green">{PlanChoiceCollection.toStringFromSlug(c)}</Label>))}
      </Grid.Column>
      <Grid.Column>
        <Header>Fall</Header>
        {getCourses(props.plan, 2, 0).map((c) => (<Label key={c} basic={true} color="green">{PlanChoiceCollection.toStringFromSlug(c)}</Label>))}
        <Header>Spring</Header>
        {getCourses(props.plan, 2, 1).map((c) => (<Label key={c} basic={true} color="green">{PlanChoiceCollection.toStringFromSlug(c)}</Label>))}
        <Header>Summer</Header>
        {getCourses(props.plan, 2, 2).map((c) => (<Label key={c} basic={true} color="green">{PlanChoiceCollection.toStringFromSlug(c)}</Label>))}
      </Grid.Column>
      <Grid.Column>
        <Header>Fall</Header>
        {getCourses(props.plan, 3, 0).map((c) => (<Label key={c} basic={true} color="green">{PlanChoiceCollection.toStringFromSlug(c)}</Label>))}
        <Header>Spring</Header>
        {getCourses(props.plan, 3, 1).map((c) => (<Label key={c} basic={true} color="green">{PlanChoiceCollection.toStringFromSlug(c)}</Label>))}
        <Header>Summer</Header>
        {getCourses(props.plan, 3, 2).map((c) => (<Label key={c} basic={true} color="green">{PlanChoiceCollection.toStringFromSlug(c)}</Label>))}
      </Grid.Column>
      {props.plan.isBAM ? (
        <Grid.Column>
          <Header>Fall</Header>
          <Header>Spring</Header>
          <Header>Summer</Header>
        </Grid.Column>
      ) : ''}
    </Grid>
  );
};

export default LandingAcademicPlanViewer;