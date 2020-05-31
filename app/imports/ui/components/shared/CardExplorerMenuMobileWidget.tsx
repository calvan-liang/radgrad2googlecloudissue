import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Dropdown, Responsive } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import * as Router from './RouterHelperFunctions';
import { Users } from '../../../api/user/UserCollection';
import { EXPLORER_TYPE } from '../../../startup/client/route-constants';
import ExplorerMenuMobileItem from './ExplorerMenuMobileItem';
import {
  ICardExplorerMenuWidgetProps,
  isType,
} from './explorer-helper-functions';

const CardExplorerMenuMobileWidget = (props: ICardExplorerMenuWidgetProps) => {
  const { menuAddedList, menuCareerList } = props;
  const isStudent = Router.isUrlRoleStudent(props.match);
  return (
    <React.Fragment>
      {/* ####### The Menu underneath the Dropdown for MOBILE ONLY ####### */}
      {/* The following components are rendered ONLY for STUDENTS: Academic Plans, Courses, and Opportunities. */}
      <Responsive {...Responsive.onlyMobile}>
        {(isType(EXPLORER_TYPE.ACADEMICPLANS, props) && isStudent) ?
          (
            <Dropdown className="selection" fluid text="Select Item" style={{ marginTop: '1rem' }}>
              <Dropdown.Menu>
                <Dropdown.Header as="h4">MY FAVORITE ACADEMIC PLANS</Dropdown.Header>
                <Dropdown.Divider />
                {
                  menuAddedList.map((listItem) => (
                    <ExplorerMenuMobileItem
                      type={EXPLORER_TYPE.ACADEMICPLANS}
                      listItem={listItem}
                      key={listItem.item._id}
                      match={props.match}
                    />
                  ))
                }
              </Dropdown.Menu>
            </Dropdown>
          )
          : ''}

        {
          isType(EXPLORER_TYPE.COURSES, props) ? (
            <React.Fragment>
              {
                  isStudent ? (
                    <Dropdown className="selection" fluid text="Select Item" style={{ marginTop: '1rem' }}>
                      <Dropdown.Menu>
                        <Dropdown.Header as="h4">FAVORITE COURSES</Dropdown.Header>
                        <Dropdown.Divider />
                        {
                            menuAddedList.map((listItem) => (
                              <ExplorerMenuMobileItem
                                type={EXPLORER_TYPE.COURSES}
                                listItem={listItem}
                                key={listItem.item._id}
                                match={props.match}
                              />
                            ))
                          }
                      </Dropdown.Menu>
                    </Dropdown>
                    )
                    : ''
                }
            </React.Fragment>
            )
            : ''
        }

        {
          isType(EXPLORER_TYPE.OPPORTUNITIES, props) ? (
            <React.Fragment>
              {
                  isStudent ? (
                    <Dropdown className="selection" fluid text="Select Item" style={{ marginTop: '1rem' }}>
                      <Dropdown.Menu>
                        <Dropdown.Header as="h4">FAVORITE OPPORTUNITIES</Dropdown.Header>
                        <Dropdown.Divider />
                        {
                            menuAddedList.map((listItem) => (
                              <ExplorerMenuMobileItem
                                type={EXPLORER_TYPE.OPPORTUNITIES}
                                listItem={listItem}
                                key={listItem.item._id}
                                match={props.match}
                              />
                            ))
                          }
                      </Dropdown.Menu>
                    </Dropdown>
                    )
                    : ''
                }
            </React.Fragment>
            )
            : ''
        }

        {/* Components renderable to STUDENTS, FACULTY, and MENTORS. */}
        {
          isType(EXPLORER_TYPE.INTERESTS, props) ? (
            <Dropdown className="selection" fluid text="Select Item" style={{ marginTop: '1rem' }}>
              <Dropdown.Menu>
                <Dropdown.Header as="h4">MY FAVORITE INTERESTS</Dropdown.Header>
                <Dropdown.Divider />
                {
                    menuAddedList.map((listItem) => (
                      <ExplorerMenuMobileItem
                        type={EXPLORER_TYPE.INTERESTS}
                        listItem={listItem}
                        key={listItem.item._id}
                        match={props.match}
                      />
                    ))
                  }

                <Dropdown.Header as="h4">SUGGESTED CAREER GOAL INTERESTS</Dropdown.Header>
                <Dropdown.Divider />
                {
                    menuCareerList.map((listItem) => (
                      <ExplorerMenuMobileItem
                        type={EXPLORER_TYPE.INTERESTS}
                        listItem={listItem}
                        key={listItem.item._id}
                        match={props.match}
                      />
                    ))
                  }
              </Dropdown.Menu>
            </Dropdown>
            )
            : ''
        }

        {
          isType(EXPLORER_TYPE.CAREERGOALS, props) ? (
            <Dropdown className="selection" fluid text="Select Item" style={{ marginTop: '1rem' }}>
              <Dropdown.Menu>
                <Dropdown.Header as="h4">MY FAVORITE CAREER GOALS</Dropdown.Header>
                <Dropdown.Divider />
                {
                    menuAddedList.map((listItem) => (
                      <ExplorerMenuMobileItem
                        type={EXPLORER_TYPE.CAREERGOALS}
                        listItem={listItem}
                        key={listItem.item._id}
                        match={props.match}
                      />
                    ))
                  }
              </Dropdown.Menu>
            </Dropdown>
            )
            : ''
        }
      </Responsive>
    </React.Fragment>
  );
};

export const CardExplorerMenuMobileWidgetCon = withTracker((props) => {
  const username = Router.getUsername(props.match);
  const profile = Users.getProfile(username);
  return {
    profile,
  };
})(CardExplorerMenuMobileWidget);
export const CardExplorerMenuMobileWidgetContainer = withRouter(CardExplorerMenuMobileWidgetCon);
export default CardExplorerMenuMobileWidgetContainer;
