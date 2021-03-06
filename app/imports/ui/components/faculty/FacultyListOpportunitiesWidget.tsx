import React from 'react';
import { connect } from 'react-redux';
import { Grid, Header, Segment } from 'semantic-ui-react';
import _ from 'lodash';
import { withTracker } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router-dom';
import { ROLE } from '../../../api/role/Role';
import BaseCollection from '../../../api/base/BaseCollection';
import { IDescriptionPair } from '../../../typings/radgrad';
import AdminPaginationWidget from '../admin/AdminPaginationWidget';
import { Opportunities } from '../../../api/opportunity/OpportunityCollection';
import { Slugs } from '../../../api/slug/SlugCollection';
import AdminDataModelAccordion from '../admin/AdminDataModelAccordion';
import { dataModelActions } from '../../../redux/admin/data-model';
import { getUserIdFromRoute, IMatchProps } from '../shared/RouterHelperFunctions';
import { Users } from '../../../api/user/UserCollection';

interface IListOpportunitiesWidgetProps {
  collection: BaseCollection;
  findOptions?: object;
  descriptionPairs: (item) => IDescriptionPair[];
  handleOpenUpdate: (evt: any, id: any) => any;
  handleDelete: (evt: any, id: any) => any;
  items: any[];
  itemTitle: (item) => React.ReactNode;
  dispatch: any;
  pagination: any;
  match: IMatchProps;
}

const mapStateToProps = (state) => ({
  pagination: state.admin.dataModel.pagination,
});

const count = (props: IListOpportunitiesWidgetProps) => Opportunities.find({ sponsorID: { $ne: getUserIdFromRoute(props.match) } }).count();

const isInRole = (props: IListOpportunitiesWidgetProps) => {
  const userID = getUserIdFromRoute(props.match);
  const profile = Users.getProfile(userID);
  return profile.role === ROLE.FACULTY;
};

const facultyOpportunities = (props: IListOpportunitiesWidgetProps) => Opportunities.findNonRetired({ sponsorID: getUserIdFromRoute(props.match) }, { sort: { name: 1 } });

const facultyCount = (props: IListOpportunitiesWidgetProps) => facultyOpportunities(props).length;

const titleICE = (opportunity) => ` (ICE: ${opportunity.ice.i}/${opportunity.ice.c}/${opportunity.ice.e})`;

const slugName = (slugID) => ` (${Slugs.findDoc(slugID).name})`;

const ListOpportunitiesWidget = (props: IListOpportunitiesWidgetProps) => {
  // console.log('ListOpportunitiesWidget.render props=%o', props);
  const facultyCounter = facultyCount(props);
  const startIndex = props.pagination[props.collection.getCollectionName()].showIndex;
  const showCount = props.pagination[props.collection.getCollectionName()].showCount;
  const endIndex = startIndex + showCount;
  const items = _.slice(props.items, startIndex, endIndex);
  const factoryOpp = facultyOpportunities(props);
  // console.log('startIndex=%o endIndex=%o items=%o', startIndex, endIndex, items);
  return (
    <Segment padded>
      {
        isInRole(props) ? (
          <div>
            <Header dividing>
              {' '}
              YOUR OPPORTUNITIES (
              {facultyCounter}
              )
              {' '}
            </Header>
            {_.map(factoryOpp, (item) => (
              <AdminDataModelAccordion
                key={item._id}
                id={item._id}
                retired={item.retired}
                name={item.name}
                slug={slugName(item.slugID)}
                descriptionPairs={props.descriptionPairs(item)}
                updateDisabled={false}
                deleteDisabled={false}
                handleOpenUpdate={props.handleOpenUpdate}
                handleDelete={props.handleDelete}
                additionalTitleInfo={titleICE(item)}
              />
            ))}
            <Header dividing>
              {' '}
              ALL OTHER OPPORTUNITIES (
              {count(props)}
              )
            </Header>
            {' '}
            <br />
          </div>
        )
          : (
            <Header dividing>
              OPPORTUNITIES (
              {count}
              )
            </Header>
)
      }

      <Grid>
        <AdminPaginationWidget
          collection={props.collection}
          setShowIndex={dataModelActions.setCollectionShowIndex}
          setShowCount={dataModelActions.setCollectionShowCount}
        />
        {_.map(items, (item) => (
          <AdminDataModelAccordion
            key={item._id}
            id={item._id}
            retired={item.retired}
            name={item.name}
            slug={slugName(item.slugID)}
            descriptionPairs={props.descriptionPairs(item)}
            updateDisabled
            deleteDisabled
            handleOpenUpdate={props.handleOpenUpdate}
            handleDelete={props.handleDelete}
            additionalTitleInfo={titleICE(item)}
          />
        ))}
      </Grid>
    </Segment>
  );
};

const ListOpportunitiesWidgetCon = connect(mapStateToProps)(ListOpportunitiesWidget);

const ListOpportunitiesWidgetContainer = withTracker((props) => {
  // console.log('ListOpportunitiesWidget withTracker props=%o', props);
  const items = props.collection.find({}, props.findOptions).fetch();
  // console.log('ListOpportunitiesWidget withTracker items=%o', items);
  return {
    items,
  };
})(ListOpportunitiesWidgetCon);
export default withRouter(ListOpportunitiesWidgetContainer);
