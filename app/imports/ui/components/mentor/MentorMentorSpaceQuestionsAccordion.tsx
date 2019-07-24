import * as React from 'react';
import { Accordion, Icon, Grid, Divider, Segment } from 'semantic-ui-react';
import { _ } from 'meteor/erasaur:meteor-lodash';
import { withTracker } from 'meteor/react-meteor-data';
import { MentorQuestions } from '../../../api/mentor/MentorQuestionCollection';
import { MentorAnswers } from '../../../api/mentor/MentorAnswerCollection';
import MentorQuestionAnswerWidget from '../student/MentorQuestionAnswerWidget';
import MentorMentorSpaceAnswerForm from './MentorMentorSpaceAnswerForm';
import { MentorProfiles } from '../../../api/user/MentorProfileCollection';
// eslint-disable-next-line no-unused-vars
import { IMentorAnswer } from '../../../typings/radgrad';

interface IMentorMentorSpaceQuestionsAccordionState {
  activeIndex: number;
}

interface IMentorMentorSpaceQuestionsAccordionProps {
  answers: IMentorAnswer[];
  questions: string;
  index: number;
  answerCount: number;
}

class MentorMentorSpaceQuestionsAccordion extends React.Component<IMentorMentorSpaceQuestionsAccordionProps, IMentorMentorSpaceQuestionsAccordionState> {
  constructor(props) {
    super(props);
    this.state = { activeIndex: -1 };
  }

  public handleClick = (e, titleProps) => {
    e.preventDefault();
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;
    this.setState({ activeIndex: newIndex });
  }

  public clickAnswer(event, instance) {
    const questionID = event.target.id;
    instance.answering.set(questionID);
  }

  public render() {
    const { activeIndex } = this.state;
    const { questions, answers, answerCount } = this.props;
    const accordionStyle = { overflow: 'hidden' };
    return (
      <div>
        {_.map(questions, (q, ind) => {
          const mentorAnswers = _.filter(answers, (ans) => ans.questionID === q._id);
          return (
            <Segment key={ind}>
              <Accordion fluid={true} styled={true} key={ind} style={accordionStyle}>
                <Accordion.Title active={activeIndex === ind} index={ind} onClick={this.handleClick}>
                  <Grid columns='equal'>
                    <Grid.Row>
                      <Grid.Column>
                        <Icon name='dropdown'/>
                        {q.question}
                      </Grid.Column>
                      <Grid.Column width={2} textAlign={'right'}>
                        {answerCount[ind]} {answerCount[ind] > 1 ? ' answers' : ' answer'}
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                </Accordion.Title>
                <Accordion.Content active={activeIndex === ind}>
                  <React.Fragment>
                    {_.map(mentorAnswers, (answer, index) => {
                      const mentor = MentorProfiles.findDoc({ userID: answer.mentorID });
                      return (
                        <React.Fragment key={index}>
                          <MentorQuestionAnswerWidget answer={answer} mentor={mentor}/>
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                </Accordion.Content>
              </Accordion>
              <Divider/>
              <MentorMentorSpaceAnswerForm question={q}/>
            </Segment>
          );
        })}
      </div>
    );
  }
}

const MentorMentorSpaceQuestionsAccordionContainer = withTracker(() => {
  const questions = MentorQuestions.find().fetch();
  const answerCount = _.map(questions, (q) => MentorAnswers.find({ questionID: q._id }).fetch().length);
  const answers = MentorAnswers.find().fetch();
  // console.log('StudentMentorSpaceQuestionAccordion withTracker items=%o', questions);
  // console.log('StudentMentorSpaceQuestionAccordion withTracker items=%o', answerCount);
  return {
    questions,
    answerCount,
    answers,
  };
})(MentorMentorSpaceQuestionsAccordion);
export default MentorMentorSpaceQuestionsAccordionContainer;
