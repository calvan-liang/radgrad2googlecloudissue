import * as React from 'react';
import { Button, Form, Header, Segment } from 'semantic-ui-react';
import AutoForm from 'uniforms-semantic/AutoForm';
import AutoField from 'uniforms-semantic/AutoField';
import BoolField from 'uniforms-semantic/BoolField';
import DateField from 'uniforms-semantic/DateField';
import LongTextField from 'uniforms-semantic/LongTextField';
import TextField from 'uniforms-semantic/TextField';
import SelectField from 'uniforms-semantic/SelectField';
import SubmitField from 'uniforms-semantic/SubmitField';
import SimpleSchema from 'simpl-schema';
import { withTracker } from 'meteor/react-meteor-data';
import { _ } from 'meteor/erasaur:meteor-lodash';
import { IAcademicTerm, IBaseProfile, IInterest, IOpportunityType } from '../../../typings/radgrad'; // eslint-disable-line
import BaseCollection from '../../../api/base/BaseCollection'; // eslint-disable-line
import {
  academicTermIdToName,
  academicTermToName,
  docToName, interestIdToName,
  opportunityTypeIdToName,
  profileToName, userIdToName,
} from '../shared/AdminDataModelHelperFunctions';
import { AcademicTerms } from '../../../api/academic-term/AcademicTermCollection';
import { FacultyProfiles } from '../../../api/user/FacultyProfileCollection';
import { AdvisorProfiles } from '../../../api/user/AdvisorProfileCollection';
import { OpportunityTypes } from '../../../api/opportunity/OpportunityTypeCollection';
import { iceSchema } from '../../../api/ice/IceProcessor';
import { Interests } from '../../../api/interest/InterestCollection';

interface IUpdateOpportunityFormProps {
  sponsors: IBaseProfile[];
  terms: IAcademicTerm[];
  interests: IInterest[];
  opportunityTypes: IOpportunityType[];
  collection: BaseCollection;
  id: string;
  formRef: any;
  handleUpdate: (doc) => any;
  handleCancel: (event) => any;
  itemTitleString: (item) => React.ReactNode;
}

class UpdateOpportunityForm extends React.Component<IUpdateOpportunityFormProps> {
  constructor(props) {
    super(props);
    // console.log('UpdateOpportunityType props=%o', props);
  }

  public render(): React.ReactElement<any> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
    const model = this.props.collection.findDoc(this.props.id);
    console.log('collection model = %o', model);
    model.opportunityType = opportunityTypeIdToName(model.opportunityTypeID);
    model.interests = _.map(model.interestIDs, interestIdToName);
    model.terms = _.map(model.termIDs, academicTermIdToName);
    model.sponsor = userIdToName(model.sponsorID);
    console.log(model);
    // console.log(this.props);
    const sponsorNames = _.map(this.props.sponsors, profileToName);
    const termNames = _.map(this.props.terms, academicTermToName);
    const opportunityTypeNames = _.map(this.props.opportunityTypes, docToName);
    const interestNames = _.map(this.props.interests, docToName);
    // console.log(opportunityTypeNames);
    const schema = new SimpleSchema({
      name: { type: String, optional: true },
      description: { type: String, optional: true },
      opportunityType: { type: String, allowedValues: opportunityTypeNames, optional: true },
      sponsor: { type: String, allowedValues: sponsorNames, optional: true },
      terms: { type: Array, optional: true },
      'terms.$': { type: String, allowedValues: termNames },
      interests: { type: Array, optional: true },
      'interests.$': { type: String, allowedValues: interestNames },
      eventDate: { type: Date, optional: true },
      ice: { type: iceSchema, optional: true },
      retired: { type: Boolean, optional: true },
    });
    return (
      <Segment padded={true}>
        <Header dividing={true}>Update Course</Header>
        <AutoForm schema={schema} onSubmit={this.props.handleUpdate} ref={this.props.formRef}
                  showInlineError={true} model={model}>
          <Form.Group widths="equal">
            <TextField name="name"/>
          </Form.Group>
          <Form.Group widths="equal">
            <SelectField name="opportunityType"/>
            <SelectField name="sponsor"/>
          </Form.Group>
          <LongTextField name="description"/>
          <Form.Group widths="equal">
            <SelectField name="terms"/>
            <SelectField name="interests"/>
          </Form.Group>
          <DateField name="eventDate"/>
          <AutoField name="ice"/>
          <BoolField name="retired"/>
          <SubmitField/>
          <Button onClick={this.props.handleCancel}>Cancel</Button>
        </AutoForm>
      </Segment>
    );
  }
}

const UpdateOpportunityTypeFormContainer = withTracker(() => {
  const interests = Interests.find({}, { sort: { name: 1 } }).fetch();
  // const currentTermNumber = AcademicTerms.getCurrentAcademicTermDoc().termNumber;
  // const after = currentTermNumber - 8;
  // const before = currentTermNumber + 16;
  // console.log(currentTermNumber, after, before);
  const allTerms = AcademicTerms.find({}, { sort: { termNumber: 1 } }).fetch();
  // const terms = _.filter(allTerms, t => t.termNumber >= after && t.termNumber <= before);
  const terms = allTerms;
  // console.log(terms);
  const faculty = FacultyProfiles.find({}).fetch();
  const advisors = AdvisorProfiles.find({}).fetch();
  const sponsorDocs = _.union(faculty, advisors);
  const sponsors = _.sortBy(sponsorDocs, ['lastName', 'firstName']);
  const opportunityTypes = OpportunityTypes.find({}, { sort: { name: 1 } }).fetch();
  return {
    sponsors,
    terms,
    opportunityTypes,
    interests,
  };
})(UpdateOpportunityForm);

export default UpdateOpportunityTypeFormContainer;