import React, { useState } from 'react';
import { Form } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import { AutoForm, SelectField, SubmitField } from 'uniforms-semantic';
import SimplSchema from 'simpl-schema';
import _ from 'lodash';
import { Users } from '../../../api/user/UserCollection';
import { AcademicPlans } from '../../../api/degree-plan/AcademicPlanCollection';
import AcademicPlanViewerWidget from './AcademicPlanViewerWidget';

interface IAcademicPlanViewerProps {
  match: {
    isExact: boolean;
    path: string;
    url: string;
    params: {
      username: string;
    }
  };
}

const ChooseSchema = new SimplSchema({
  year: Number,
  name: String,
});

const AcademicPlanViewer = (props: IAcademicPlanViewerProps) => {
  // console.log('AcademicPlanViewer', props);
  const username = props.match.params.username;
  const profile = Users.getProfile(username);
  let plan;
  if (AcademicPlans.isDefined(profile.academicPlanID)) {
    plan = AcademicPlans.findDoc(profile.academicPlanID);
  }
  const [planState, setPlan] = useState(plan);

  const submit = (data) => {
    const { name, year } = data;
    console.log('Got %o from submit', { name, year });
    // const academicPlan = AcademicPlans.find({ year, name }).fetch()[0];
  };

  const handleChangeYear = (data) => {
    // console.log('change year %o', data);
    const academicPlan = AcademicPlans.find({ year: data, name: planState.name }).fetch()[0];
    if (academicPlan) {
      setPlan(academicPlan);
    }
  };

  const handleChangeName = (data) => {
    // console.log('change name %o', data);
    const academicPlan = AcademicPlans.find({ year: planState.year, name: data }).fetch()[0];
    if (academicPlan) {
      setPlan(academicPlan);
    }
  };

  const planYears = AcademicPlans.getPlanYears();
  // console.log(planYears);
  const names = [];
  _.forEach(planYears, (year) => {
    const plans = AcademicPlans.find({ year }).fetch();
    _.forEach(plans, (p) => names.push(p.name));
  });
  const noBottomMargin = {
    marginBottom: 0,
  };
  return (
    <div>
      <AutoForm schema={ChooseSchema} onSubmit={submit} model={plan}>
        <Form.Group style={noBottomMargin}>
          <SelectField allowedValues={planYears} name="year" onChange={handleChangeYear} width={4} />
          <SelectField allowedValues={names} name="name" onChange={handleChangeName} width={12} />
        </Form.Group>
        <br />
        <SubmitField value="Choose this Plan" className="" disabled={false} inputRef={undefined} />
      </AutoForm>
      <hr />
      <p />
      <AcademicPlanViewerWidget academicPlan={planState} username={props.match.params.username} />
    </div>
  );
};

const AcademicPlanViewerContainer = withRouter(AcademicPlanViewer);
export default AcademicPlanViewerContainer;
