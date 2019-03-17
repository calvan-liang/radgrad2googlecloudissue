import * as React from 'react';
import { Grid } from 'semantic-ui-react';
import { getSatisfiedStyle } from '../shared/StyleFunctions';
import NamePill from '../shared/NamePill';
import { PlanChoiceCollection } from '../../../api/degree-plan/PlanChoiceCollection';

interface ILandingPlanChoicePillProps {
  choice: string;
  index: number;
}

const LandingPlanChoicePill = (props: ILandingPlanChoicePillProps) => {
  return (
    <Grid.Row style={getSatisfiedStyle()}>
      <NamePill name={PlanChoiceCollection.toStringFromSlug(props.choice)}/>
    </Grid.Row>
  );
};

export default LandingPlanChoicePill;