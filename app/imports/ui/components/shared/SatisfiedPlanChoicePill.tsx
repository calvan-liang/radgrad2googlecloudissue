import * as React from 'react';
import { Grid } from 'semantic-ui-react';
import { Draggable } from 'react-beautiful-dnd';
import { getDraggablePillStyle, getNotSatisfiedStyle, getSatisfiedStyle } from './StyleFunctions';
import NamePill from './NamePill';
import { PlanChoiceCollection } from '../../../api/degree-plan/PlanChoiceCollection';

interface ISatisfiedPlanChoicePillProps {
  choice: string;
  index: number;
  satisfied: boolean;
}

const SatisfiedPlanChoicePill = (props: ISatisfiedPlanChoicePillProps) => {
  const style = props.satisfied ? getSatisfiedStyle() : getNotSatisfiedStyle();
  console.log(props.satisfied, style);
  return (
    <Grid.Row style={style}>
      <NamePill name={PlanChoiceCollection.toStringFromSlug(props.choice)}/>
    </Grid.Row>
  );
};

export default SatisfiedPlanChoicePill;
