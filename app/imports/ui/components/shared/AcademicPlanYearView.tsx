import * as React from 'react';
import { Header } from 'semantic-ui-react';
import { IAcademicPlan } from '../../../typings/radgrad';
import { getPlanChoices } from '../../../api/degree-plan/AcademicPlanUtilities';
import AcademicPlanTermView from './AcademicPlanTermView';
import { Users } from '../../../api/user/UserCollection';

interface IAcademicPlanYearViewProps {
  yearNumber: number;
  academicPlan: IAcademicPlan;
  username: string;
  takenSlugs: string[];
}

const AcademicPlanYearView = (props: IAcademicPlanYearViewProps) => {
  const quarter = props.academicPlan.coursesPerAcademicTerm.length % 4 === 0;
  let termNum = quarter ? props.yearNumber * 4 : props.yearNumber * 3;
  const studentID = Users.getID(props.username);
  return (
    <div>
      <Header>Year {props.yearNumber + 1}</Header>
      <AcademicPlanTermView title="Fall" id={`Fall-${props.yearNumber * 10 + termNum}`}
                            choices={getPlanChoices(props.academicPlan, termNum++)} studentID={studentID}
                            takenSlugs={props.takenSlugs}/>
      {quarter ? (<AcademicPlanTermView title="Winter" id={`Winter-${props.yearNumber * 10 + termNum}`}
                                        choices={getPlanChoices(props.academicPlan, termNum++)}
                                        studentID={studentID} takenSlugs={props.takenSlugs}/>) : ''}
      <AcademicPlanTermView title="Spring" id={`Spring-${props.yearNumber * 10 + termNum}`}
                            choices={getPlanChoices(props.academicPlan, termNum++)} studentID={studentID}
                            takenSlugs={props.takenSlugs}/>
      <AcademicPlanTermView title="Summer" id={`Summer-${props.yearNumber * 10 + termNum}`}
                            choices={getPlanChoices(props.academicPlan, termNum++)} studentID={studentID}
                            takenSlugs={props.takenSlugs}/>

    </div>
  );
};

export default AcademicPlanYearView;
