import * as React from 'react';
import * as _ from 'lodash';
import { Grid, Header, Icon, Segment } from 'semantic-ui-react';
import { Droppable } from 'react-beautiful-dnd';
import { getDroppableListStyle } from '../shared/StyleFunctions';
import { IPlanChoiceDefine } from '../../../typings/radgrad';
import DraggableCoursePill from '../shared/DraggableCoursePill';
import { buildCombineAreaDraggableId, CHOICE_AREA, COMBINE_AREA, DELETE_AREA } from './AcademicPlanBuilderUtilities';

interface IAdvisorAPBPlanChoiceWidgetProps {
  choices: IPlanChoiceDefine[],
  combineChoice: string,
}

const AdvisorAPBPlanChoiceWidget = (props: IAdvisorAPBPlanChoiceWidgetProps) => {
  const column1 = [];
  const column2 = [];
  const column3 = [];
  const column4 = [];
  props.choices.forEach((choice, index) => {
    switch (index % 4) {
      case 0:
        column1.push(choice);
        break;
      case 1:
        column2.push(choice);
        break;
      case 2:
        column3.push(choice);
        break;
      default:
        column4.push(choice);
    }
  });
  const narrowStyle = {
    paddingLeft: 2,
    paddingRight: 2,
  };
  return (
    <Segment>
      <Header dividing>Course Choices</Header>
      <Droppable droppableId={CHOICE_AREA}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            // style={style}
            style={getDroppableListStyle(snapshot.isDraggingOver)}
          >
            <Grid columns="equal">
              <Grid.Column style={narrowStyle}>
                {_.map(column1, (choice, index) => (
                  <DraggableCoursePill
                    key={choice.choice}
                    index={index}
                    choice={choice.choice}
                    draggableId={`courseChoices-${choice.choice}`}
                    satisfied
                    studentID="fakeID"
                  />
                ))}
              </Grid.Column>
              <Grid.Column style={narrowStyle}>
                {_.map(column2, (choice, index) => (
                  <DraggableCoursePill
                    key={choice.choice}
                    index={index}
                    choice={choice.choice}
                    draggableId={`courseChoices-${choice.choice}`}
                    satisfied
                    studentID="fakeID"
                  />
                ))}
                {provided.placeholder}
              </Grid.Column>
              <Grid.Column style={narrowStyle}>
                {_.map(column3, (choice, index) => (
                  <DraggableCoursePill
                    key={choice.choice}
                    index={index}
                    choice={choice.choice}
                    draggableId={`courseChoices-${choice.choice}`}
                    satisfied
                    studentID="fakeID"
                  />
                ))}
              </Grid.Column>
              <Grid.Column style={narrowStyle}>
                {_.map(column4, (choice, index) => (
                  <DraggableCoursePill
                    key={choice.choice}
                    index={index}
                    choice={choice.choice}
                    draggableId={`courseChoices-${choice.choice}`}
                    satisfied
                    studentID="fakeID"
                  />
                ))}
              </Grid.Column>
              {provided.placeholder}
            </Grid>
          </div>
)}
      </Droppable>
      <Segment>
        <Icon name="linkify" size="big" />
        <Droppable droppableId={COMBINE_AREA}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              // style={style}
              style={getDroppableListStyle(snapshot.isDraggingOver)}
            >
              {props.combineChoice ? (
                <DraggableCoursePill
                  key={props.combineChoice}
                  index={0}
                  choice={props.combineChoice}
                  draggableId={buildCombineAreaDraggableId(props.combineChoice)}
                  satisfied
                  studentID="fakeID"
                />
              ) : ''}
              {provided.placeholder}
            </div>
)}
        </Droppable>
      </Segment>
      <Segment>
        <Icon name="trash alternate outline" size="big" />
        <Droppable droppableId={DELETE_AREA}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              // style={style}
              style={getDroppableListStyle(snapshot.isDraggingOver)}
              id="ApbTrash"
            >
              {provided.placeholder}
            </div>
)}
        </Droppable>
      </Segment>
    </Segment>
  );
};

export default AdvisorAPBPlanChoiceWidget;
