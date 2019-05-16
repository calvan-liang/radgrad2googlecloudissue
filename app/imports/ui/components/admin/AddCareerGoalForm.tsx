import * as React from 'react';
import { _ } from 'meteor/erasaur:meteor-lodash';
import { Form, Header, Segment } from 'semantic-ui-react';
import AutoForm from 'uniforms-semantic/AutoForm';
import LongTextField from 'uniforms-semantic/LongTextField';
import SelectField from 'uniforms-semantic/SelectField';
import SubmitField from 'uniforms-semantic/SubmitField';
import TextField from 'uniforms-semantic/TextField';
import SimpleSchema from 'simpl-schema';
import { withTracker } from 'meteor/react-meteor-data';
import { Interests } from '../../../api/interest/InterestCollection';
import { IInterest } from '../../../typings/radgrad'; // eslint-disable-line
import { docToName } from '../shared/AdminDataModelHelperFunctions';

interface IAddCareerGoalFormProps {
  interests: IInterest[];
  formRef: any;
  handleAdd: (doc) => any;
}

class AddCareerGoalForm extends React.Component<IAddCareerGoalFormProps> {
  constructor(props) {
    super(props);
    // console.log('AddCareerGoalForm props=%o', props);
  }

  public render(): React.ReactElement<any> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
    // console.log(this.props);
    const interestNames = _.map(this.props.interests, docToName);
    const schema = new SimpleSchema({
      name: String,
      slug: String,
      description: String,
      interests: {
        type: Array,
      },
      'interests.$': {
        type: String,
        allowedValues: interestNames,
      },
    });
    return (
      <Segment padded={true}>
        <Header dividing={true}>Add Career Goal</Header>
        <AutoForm schema={schema} onSubmit={this.props.handleAdd} ref={this.props.formRef} showInlineError={true}>
          <Form.Group widths="equal">
            <TextField name="name"/>
            <TextField name="slug"/>
          </Form.Group>
          <LongTextField name="description"/>
          <SelectField name="interests"/>
          <SubmitField/>
        </AutoForm>
      </Segment>
    );
  }
}

const AddCareerGoalFormContainer = withTracker(() => {
  const interests = Interests.find({}, { sort: { name: 1 } }).fetch();
  return {
    interests,
  };
})(AddCareerGoalForm);

export default AddCareerGoalFormContainer;