import * as React from 'react';
import { _ } from 'meteor/erasaur:meteor-lodash';
import { Form, Header, Segment } from 'semantic-ui-react';
import { SimpleSchema2Bridge } from 'uniforms-bridge-simple-schema-2'; // eslint-disable-line no-unused-vars
import AutoForm from 'uniforms-semantic/AutoForm';
import BoolField from 'uniforms-semantic/BoolField';
import LongTextField from 'uniforms-semantic/LongTextField';
import NumberField from 'uniforms-semantic/NumField';
import SelectField from 'uniforms-semantic/SelectField';
import SubmitField from 'uniforms-semantic/SubmitField';
import TextField from 'uniforms-semantic/TextField';
import SimpleSchema from 'simpl-schema';
import { withTracker } from 'meteor/react-meteor-data';
import { Interests } from '../../../api/interest/InterestCollection';
import { IAcademicPlan, IAcademicTerm, ICareerGoal, IInterest } from '../../../typings/radgrad'; // eslint-disable-line
import { CareerGoals } from '../../../api/career/CareerGoalCollection';
import { ROLE } from '../../../api/role/Role';
import { AcademicTerms } from '../../../api/academic-term/AcademicTermCollection';
import { AcademicPlans } from '../../../api/degree-plan/AcademicPlanCollection';
import { academicTermToName, docToName } from '../shared/AdminDataModelHelperFunctions';
import MultiSelectField from '../shared/MultiSelectField';

interface IAddUserProps {
  interests: IInterest[];
  careerGoals: ICareerGoal[];
  academicTerms: IAcademicTerm[];
  academicPlans: IAcademicPlan[];
  formRef: any;
  handleAdd: (doc) => any;
}

interface IAddUserState {
  role: string;
}

class AddUserForm extends React.Component<IAddUserProps, IAddUserState> {
  constructor(props) {
    super(props);
    // console.log('AddUserForm props=%o', props);
    this.state = { role: '' };
  }

  private handleModelChange = (model) => {
    // console.log('change %o', model);
    const role = model.role;
    this.setState({ role });
  }

  public render(): React.ReactElement<any> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
    // console.log(this.props);
    const interestNames = _.map(this.props.interests, docToName);
    const careerGoalNames = _.map(this.props.careerGoals, docToName);
    const academicTermNames = _.map(this.props.academicTerms, academicTermToName);
    const academicPlanNames = _.map(this.props.academicPlans, docToName);
    const roles = [ROLE.ADVISOR, ROLE.FACULTY, ROLE.MENTOR, ROLE.STUDENT];
    // console.log(academicTermNames);
    const schema = new SimpleSchema({
      username: String,
      firstName: String,
      lastName: String,
      role: {
        type: String,
        allowedValues: roles,
        defaultValue: roles[3],
      },
      picture: { type: String, optional: true },
      website: { type: String, optional: true },
      interests: { type: Array, optional: true },
      'interests.$': {
        type: String,
        allowedValues: interestNames,
      },
      careerGoals: { type: Array, optional: true },
      'careerGoals.$': {
        type: String,
        allowedValues: careerGoalNames,
      },
      retired: { type: Boolean, optional: true },
    });
    const mentorSchema = new SimpleSchema({
      company: { type: String, optional: true },
      career: { type: String, optional: true },
      location: { type: String, optional: true },
      linkedin: { type: String, optional: true },
      motivation: { type: String, optional: true },
    });
    const studentSchema = new SimpleSchema({
      level: { type: SimpleSchema.Integer, optional: true, min: 1, max: 6 },
      declaredAcademicTerm: {
        type: String,
        optional: true,
        allowedValues: academicTermNames,
      },
      academicPlan: {
        type: String,
        optional: true,
        allowedValues: academicPlanNames,
      },
      shareUsername: { type: Boolean, optional: true },
      sharePicture: { type: Boolean, optional: true },
      shareWebsite: { type: Boolean, optional: true },
      shareInterests: { type: Boolean, optional: true },
      shareCareerGoals: { type: Boolean, optional: true },
      shareAcademicPlan: { type: Boolean, optional: true },
      shareOpportunities: { type: Boolean, optional: true },
      shareCourses: { type: Boolean, optional: true },
      shareLevel: { type: Boolean, optional: true },
      isAlumni: { type: Boolean, optional: true },
    });
    if (this.state.role === ROLE.MENTOR) {
      schema.extend(mentorSchema);
    }
    if (this.state.role === ROLE.STUDENT) {
      schema.extend(studentSchema);
    }
    // console.log(schema);
    return (
      <Segment padded={true}>
        <Header dividing={true}>Add User</Header>
        <AutoForm schema={schema} onSubmit={this.props.handleAdd} ref={this.props.formRef} showInlineError={true}
                  onChangeModel={this.handleModelChange}>
          <Form.Group widths="equal">
            <TextField name="username" placeholder="johndoe@foo.edu"/>
            <SelectField name="role"/>
          </Form.Group>
          <Form.Group widths="equal">
            <TextField name="firstName" placeholder="John"/>
            <TextField name="lastName" placeholder="Doe"/>
          </Form.Group>
          <Header dividing={true} as="h4">Optional fields (all users)</Header>
          <Form.Group widths="equal">
            <TextField name="picture" placeholder="http://johndoe.github.io/images/johndoe.jpg"/>
            <TextField name="website" placeholder="http://johndoe.github.io/"/>
          </Form.Group>
          <Form.Group widths="equal">
            <MultiSelectField name="interests"/>
            <MultiSelectField name="careerGoals"/>
          </Form.Group>
          <BoolField name="retired"/>
          {this.state.role === ROLE.MENTOR ? (
            <div>
              <Header dividing={true} as="h4">Mentor fields</Header>
              <Form.Group widths="equal">
                <TextField name="company"/>
                <TextField name="career" label="Title"/>
              </Form.Group>
              <Form.Group widths="equal">
                <TextField name="location"/>
                <TextField name="linkedin" label="LinkedIn"/>
              </Form.Group>
              <LongTextField name="motivation"/>
            </div>
          ) : ''}
          {this.state.role === ROLE.STUDENT ? (
            <div>
              <Header dividing={true} as="h4">Student fields</Header>
              <Form.Group widths="equal">
                <NumberField name="level"/>
                <SelectField name="declaredAcademicTerm"/>
                <SelectField name="academicPlan"/>
              </Form.Group>
              <Form.Group widths="equal">
                <BoolField name="shareUsername"/>
                <BoolField name="sharePicture"/>
                <BoolField name="shareWebsite"/>
                <BoolField name="shareInterests"/>
                <BoolField name="shareCareerGoals"/>
                <BoolField name="shareAcademicPlan"/>
                <BoolField name="shareOpportunities"/>
                <BoolField name="shareCourses"/>
                <BoolField name="shareLevel"/>
                <BoolField name="isAlumni"/>
              </Form.Group>
            </div>
          ) : ''}
          <SubmitField className="basic green" value="Add"/>
        </AutoForm>
      </Segment>
    );
  }
}

const AddUserFormContainter = withTracker(() => {
  const interests = Interests.find({}, { sort: { name: 1 } }).fetch();
  const careerGoals = CareerGoals.find({}, { sort: { name: 1 } }).fetch();
  let academicTerms = AcademicTerms.find({}, { sort: { termNumber: 1 } }).fetch();
  const currentTerm = AcademicTerms.getCurrentAcademicTermDoc();
  academicTerms = _.filter(academicTerms, (term) => (term.termNumber <= currentTerm.termNumber && term.termNumber > currentTerm.termNumber - 8));
  // console.log(academicTerms, currentTerm);
  const academicPlans = AcademicPlans.getLatestPlans();
  return {
    interests,
    careerGoals,
    academicTerms,
    academicPlans,
  };
})(AddUserForm);

export default AddUserFormContainter;
