import * as React from 'react';
import { Button, Container, Header, Icon } from 'semantic-ui-react';
import * as Markdown from 'react-markdown';
import { withRouter } from 'react-router-dom';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { connect } from 'react-redux';
import { moment } from 'meteor/momentjs:moment';
import { _ } from 'meteor/erasaur:meteor-lodash';
import { Opportunities } from '../../../api/opportunity/OpportunityCollection';
import { Slugs } from '../../../api/slug/SlugCollection';
import IceHeader from '../shared/IceHeader';
import UserInterestList from '../shared/UserInterestList';
import { AcademicTerms } from '../../../api/academic-term/AcademicTermCollection';
import { OpportunityInstances } from '../../../api/opportunity/OpportunityInstanceCollection';
import { VerificationRequests } from '../../../api/verification/VerificationRequestCollection';
import { termIDsToString } from '../../../api/academic-term/AcademicTermUtilities';
import { getInspectorDraggablePillStyle } from '../shared/StyleFunctions';
import NamePill from '../shared/NamePill';
import { removeItMethod } from '../../../api/base/BaseCollection.methods';
import { selectOpportunity } from '../../../redux/actions/actions';

interface IInspectorOpportunityViewProps {
  opportunityID: string;
  studentID: string;
  opportunityInstanceID?: string;
  selectOpportunity: (opportunityID: string) => any;
  match: {
    isExact: boolean;
    path: string;
    url: string;
    params: {
      username: string;
    }
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    selectOpportunity: (courseID) => dispatch(selectOpportunity(courseID)),
  };
};

class InspectorOpportunityView extends React.Component<IInspectorOpportunityViewProps> {
  constructor(props) {
    super(props);
    this.handleVRClick = this.handleVRClick.bind(this);
    this.handleRemoveClick = this.handleRemoveClick.bind(this);
  }

  private handleVRClick(event, { value }) {
    event.preventDefault();
    console.log(value);
  }

  private handleRemoveClick(event, { value }) {
    event.preventDefault();
    console.log(`Remove OI ${value}`);
    const oi = OpportunityInstances.findDoc(value);
    const collectionName = OpportunityInstances.getCollectionName();
    const instance = value;
    const inst = this; // tslint:disable-line: no-this-assignment
    removeItMethod.call({ collectionName, instance }, (error) => {
      if (error) {
        console.log(`Remove opportunityInstance ${instance} failed`, error);
      } else {
        inst.props.selectOpportunity(oi.opportunityID);
      }
    });
  }

  public render() {
    const opportunity = Opportunities.findDoc(this.props.opportunityID);
    const opportunitySlug = Slugs.getNameFromID(opportunity.slugID);
    const opportunityName = opportunity.name;
    let opportunityInstance;
    let plannedOpportunity = false;
    let pastOpportunity = false;
    let hasRequest = false;
    let whenSubmitted = '';
    let requestStatus = '';
    let requestHistory = [];
    if (this.props.opportunityInstanceID) {
      opportunityInstance = OpportunityInstances.findDoc(this.props.opportunityInstanceID);
      const currentTerm = AcademicTerms.getCurrentAcademicTermDoc();
      const opportunityTerm = AcademicTerms.findDoc(opportunityInstance.termID);
      plannedOpportunity = currentTerm.termNumber <= opportunityTerm.termNumber;
      pastOpportunity = currentTerm.termNumber > opportunityTerm.termNumber;
      const requests = VerificationRequests.find({ opportunityInstanceID: opportunityInstance._id }).fetch();
      hasRequest = requests.length > 0;
      if (hasRequest) {
        const request = requests[0];
        whenSubmitted = moment(request.submittedOn).calendar();
        requestStatus = request.status;
        requestHistory = request.processed;
      }
    }
    const paddingStyle = {
      paddingTop: 15,
      paddingBottom: 15,
    };
    const username = this.props.match.params.username;
    const baseUrl = this.props.match.url;
    const baseIndex = baseUrl.indexOf(username);
    const baseRoute = `/#${baseUrl.substring(0, baseIndex)}${username}/explorer/opportunities/${opportunitySlug}`;
    // console.log(opportunity, pastOpportunity, hasRequest);
    return (
      <Container fluid={true} style={paddingStyle}>
        <Header as="h4" dividing={true}>{opportunity.num} {opportunity.name} <IceHeader
          ice={opportunity.ice}/></Header>
        {plannedOpportunity ? <Button floated="right" basic={true} color="green" onClick={this.handleRemoveClick}
                                      size="tiny" value={opportunityInstance._id}>remove</Button> : (pastOpportunity ?
          <Button floated="right" basic={true} color="green"
                  size="tiny">taken</Button> :
          <Droppable droppableId={'inspecto-opportunity'}>
            {(provided) => (
              <div
                ref={provided.innerRef}
              >
                <Draggable key={opportunitySlug} draggableId={opportunitySlug} index={0}>
                  {(prov, snap) => (
                    <div
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      {...prov.dragHandleProps}
                      style={getInspectorDraggablePillStyle(
                        snap.isDragging,
                        prov.draggableProps.style,
                      )}
                    >
                      <NamePill name={opportunityName}/>
                    </div>
                  )}
                </Draggable>
              </div>)}
          </Droppable>)}

        <b>When: {opportunityInstance ? AcademicTerms.toString(opportunityInstance.termID) : termIDsToString(opportunity.termIDs)}</b>
        <p><b>Description:</b></p>
        <Markdown escapeHtml={true} source={opportunity.description}/>
        <p/>
        <p><b>Interests:</b></p>
        <UserInterestList userID={this.props.studentID} interestIDs={opportunity.interestIDs}/>
        <p/>
        <a href={baseRoute}>View in Explorer <Icon name="arrow right"/></a>
        <p/>
        {(pastOpportunity) ? (!hasRequest ? (
          <div>
            <Header dividing={true}/>
            <Button basic={true} color="green" size="tiny" onClick={this.handleVRClick} value={opportunity._id}>Request
              Verification</Button>
          </div>
        ) : (
          <div>
            <Header as="h4" textAlign="center" dividing={true}>REQUEST STATUS</Header>
            <strong>Date Submitted:</strong> {whenSubmitted} <br/>
            <strong>Status: </strong>{requestStatus}
            {_.map(requestHistory, (processed, index) => (
                <p key={index}>
                <span>Processed: {moment(processed.date).calendar()} by {processed.verifier}
                  ({processed.status}) <em>{processed.feedback}</em></span><br/>
                </p>
              ),
            )}
          </div>
        )) : ''
        }
      </Container>
    );
  }
}

const InspectorOpportunityViewContainer = connect(null, mapDispatchToProps)(InspectorOpportunityView);
export default withRouter(InspectorOpportunityViewContainer);