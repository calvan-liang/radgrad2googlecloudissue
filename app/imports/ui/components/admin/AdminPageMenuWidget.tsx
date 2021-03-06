import React from 'react';
import FirstMenuContainer from '../../pages/shared/FirstMenu';
import { Reviews } from '../../../api/review/ReviewCollection';
import { MentorQuestions } from '../../../api/mentor/MentorQuestionCollection';
import SecondMenu from '../../pages/shared/SecondMenu';

/** A simple static component to render some text for the landing page. */
const AdminPageMenuWidget = () => {
  const divStyle = { marginBottom: 30 };
  let numMod = 0;
  numMod += MentorQuestions.find({ moderated: false }).fetch().length;
  numMod += Reviews.find({ moderated: false }).fetch().length;
  let moderationLabel = 'Moderation';
  if (numMod > 0) {
    moderationLabel = `${moderationLabel} (${numMod})`;
  }
  const menuItems = [
    { label: 'Home', route: 'home', regex: 'home' },
    { label: 'Data Model', route: 'datamodel', regex: 'datamodel' },
    { label: 'Data Base', route: 'database', regex: 'database' },
    { label: moderationLabel, route: 'moderation', regex: 'moderation' },
    { label: 'Analytics', route: 'analytics', regex: 'analytics' },
    { label: 'Scoreboard', route: 'scoreboard', regex: 'scoreboard' },
  ];
  return (
    <div style={divStyle}>
      <FirstMenuContainer />
      <SecondMenu menuItems={menuItems} numItems={menuItems.length} />
    </div>
  );
};

export default AdminPageMenuWidget;
