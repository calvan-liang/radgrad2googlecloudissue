import * as React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withRouter, Link } from 'react-router-dom';
import { Segment, Header, Button, Divider, Grid } from 'semantic-ui-react';
import * as Markdown from 'react-markdown';
import { DragDropContext } from 'react-beautiful-dnd';
import { IAcademicPlan } from '../../../typings/radgrad'; // eslint-disable-line
import { Users } from '../../../api/user/UserCollection';
import AcademicPlanStaticViewer from './AcademicPlanStaticViewer';
import { StudentProfiles } from '../../../api/user/StudentProfileCollection';
import { updateMethod } from '../../../api/base/BaseCollection.methods';

interface IExplorerPlansWidgetProps {
  name: string;
  descriptionPairs: any[];
  id: string;
  item: IAcademicPlan;
  role: string;
  profile: object;
  match: {
    isExact: boolean;
    path: string;
    url: string;
    params: {
      username: string;
      opportunity: string;
    }
  };
}

class ExplorerPlansWidget extends React.Component<IExplorerPlansWidgetProps> {
  constructor(props) {
    super(props);
  }

  private toUpper = (string: string): string => string.toUpperCase();

  private getUsername = (): string => this.props.match.params.username;

  private userStatus = (plan: IAcademicPlan): boolean => {
    const profile = Users.getProfile(this.getUsername());
    return profile.academicPlanID !== plan._id;
  }

  private routerLink = (props: any): JSX.Element => (
    props.href.match(/^(https?:)?\/\//)
      ? <a href={props.href} target="_blank" rel="noopener noreferrer">{props.children}</a>
      : <Link to={props.href}>{props.children}</Link>
  )

  // Note, in the context of PlanCard (/explorer/plans), this function doesn't do anything because the Draggables and
  // Droppables are set to disabled when the user is in the /explorer/plans page. This is just to get rid of the error
  // saying that onDragEnd field for <DragDropContext/> is required.
  private handleDragEnd = () => {
    // do nothing
  }

  private handleAddPlan = (e: any): void => {
    e.preventDefault();
    const profile = Users.getProfile(this.getUsername());
    const updateData: { [key: string]: any } = {};
    const collectionName = StudentProfiles.getCollectionName();
    updateData.id = profile._id;
    updateData.academicPlan = this.props.item._id;
    updateMethod.call({ collectionName, updateData }, (error) => {
      if (error) {
        console.log(`Error updating ${this.getUsername()}'s academic plan ${JSON.stringify(error)}`);
      }
    });
  }

  public render(): React.ReactElement<any> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
    const backgroundColorWhiteStyle = { backgroundColor: 'white' };
    const clearingBasicSegmentStyle = {
      margin: 0,
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 0,
      paddingBottom: 0,
    };
    const divierStyle = { marginTop: 0 };

    const { name, descriptionPairs, item, role } = this.props;
    const upperName = this.toUpper(name);
    const isStudent = role === 'student';
    const userStatus = this.userStatus(item);

    return (
      <Segment.Group style={backgroundColorWhiteStyle}>
        <Segment padded={true} className="container">
          <Segment clearing={true} basic={true} style={clearingBasicSegmentStyle}>
            <Header floated="left">{upperName}</Header>
            {
              isStudent ?
                <React.Fragment>
                  {
                    userStatus ?
                      <Button basic={true} color="green" size="mini" floated="right" onClick={this.handleAddPlan}>
                        SET AS ACADEMIC PLAN
                      </Button>
                      : ''
                  }
                </React.Fragment>
                : ''
            }
          </Segment>

          <Divider style={divierStyle}/>

          <Grid stackable={true}>
            <Grid.Column>
              {
                descriptionPairs.map((descriptionPair, index) => (
                  <React.Fragment key={index}>
                    <b>{descriptionPair.label}:</b>
                    {
                      descriptionPair.value ?
                        <Markdown escapeHtml={true} source={descriptionPair.value}
                                  renderers={{ link: this.routerLink }}/>
                        :
                        <React.Fragment> N/A <br/></React.Fragment>
                    }
                  </React.Fragment>
                ))
              }
            </Grid.Column>
          </Grid>
        </Segment>

        <Segment>
          <DragDropContext onDragEnd={this.handleDragEnd}>
            <AcademicPlanStaticViewer plan={item}/>
          </DragDropContext>
        </Segment>
      </Segment.Group>
    );
  }
}

const ExplorerPlansWidgetContainer = withTracker((props) => {
  const profile = Users.getProfile(props.match.params.username);
  return {
    profile,
  };
})(ExplorerPlansWidget);
export default withRouter(ExplorerPlansWidgetContainer);
