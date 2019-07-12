import * as React from 'react';
import { withRouter } from 'react-router-dom';
import * as Markdown from 'react-markdown';
import { Segment, Grid, Container, Message, Icon, Image, Header } from 'semantic-ui-react';
import { getUserIdFromRoute } from '../shared/RouterHelperFunctions';
import { Users } from '../../../api/user/UserCollection';

// import { HelpMessages } from '../../../api/help/HelpMessageCollection';

interface IStudentLevelsWidgetProps {
  match: {
    isExact: boolean;
    path: string;
    url: string;
    params: {
      username: string;
    }
  };
}

class StudentLevelsWidget extends React.Component<IStudentLevelsWidgetProps> {
  constructor(props) {
    super(props);
  }

  private getUserIdFromRoute = (): string => getUserIdFromRoute(this.props.match);

  private studentLevelNumber = (): number => {
    if (this.getUserIdFromRoute()) {
      const profile = Users.getProfile(this.getUserIdFromRoute());
      return profile.level || 1;
    }
    return 1;
  }

  private studentLevelName = (): string => {
    if (this.getUserIdFromRoute()) {
      const profile = Users.getProfile(this.getUserIdFromRoute());
      if (profile.level) {
        return `LEVEL ${profile.level}`;
      }
    }
    return 'LEVEL 1';
  }

  private studentLevelHint = (): string => {
    let levelNumber = 0;
    if (this.getUserIdFromRoute()) {
      const profile = Users.getProfile(this.getUserIdFromRoute());
      levelNumber = profile.level;
    }
    // const helpMessage = HelpMessages.findDocByRouteName('/student/:username/home/levels').text;
    // const delimiter = '<div class="header">';
    // const levelMessages = helpMessage.split(delimiter);
    switch (levelNumber) {
      case 1:
        return 'Successfully finish your first semester of ICS coursework. Then meet with your advisor and ask him/her to update RadGrad with your current STAR data. That should bring you to Level 2, and earn you the Level 2 laptop sticker.';
      case 2:
        return 'With any luck, you\'ll achieve Level 3 after you complete your second semester of ICS coursework, as long as your grades are good. As before, meet with your Advisor to update RadGrad with your current STAR data, and if the system shows you\'ve gotten to Level 3, you\'ll get your Green laptop sticker.';
      case 3:
        return 'ICS has a "core curriculum", and Level 4 students have not only finished it, but they have also thought beyond mere competency. Once your current STAR data is in RadGrad, and you\'ve achieved some verified opportunities, you might just find yourself at Level 4! But you will not get to Level 4 with the default profile photo, so be sure to upload a head shot using the About Me page. Meet with your advisor to pick up your sticker, and bask in the glory it will bring to you!';
      case 4:
        return 'Level 5 students are far along in their degree program, and they\'ve made significant progress toward 100 verified points in each of the three ICE categories. You will probably be at least a Junior before Level 5 becomes a realistic option for you. Keep your STAR data current in RadGrad, make sure your opportunities are verified, and good luck! Some students might graduate before reaching Level 5, so try to be one of the few that make it all the way to here!';
      case 5:
        return 'If you achieve Level 6, you are truly one of the elite ICS students, and you will have demonstrated excellent preparation for entering the workforce, or going on to Graduate School, whichever you prefer. Congratulations! Note that in addition to fulfilling the ICE requirements, you\'ll also need to "pay it forward" to the RadGrad community in order to obtain your Black RadGrad laptop sticker.';
      case 6:
        return 'Congratulations!  You have reached the top of the RadGrad mountain!  As a Level 6 RadGrad Ninja, you need not strive any further. There are no further levels to reach.';
      default:
        return 'No level available for this student';
    }
  }

  public render(): React.ReactElement<any> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
    const imageStyle = { width: '230px' };

    const studentLevelNumber = this.studentLevelNumber();
    const studentLevelName = this.studentLevelName();
    const studentLevelHint = this.studentLevelHint();
    return (
      <Segment padded={true}>
        <Header as="h4" dividing={true}>CURRENT LEVEL</Header>
        <Grid stackable={true}>
          <Grid.Column width={16}>
            <Container>
              <Image size="small" centered={true} style={imageStyle}
                     src={`/images/level-icons/radgrad-level-${studentLevelNumber}-icon.png`}/>
              <Header as="h3" textAlign="center">{studentLevelName}</Header>
            </Container>
          </Grid.Column>
        </Grid>

        <Message icon={true}>
          <Icon name="rocket"/>
          <Message.Content>
            <Markdown escapeHtml={true} source={studentLevelHint}/>
          </Message.Content>
        </Message>
      </Segment>
    );
  }
}

export default withRouter(StudentLevelsWidget);