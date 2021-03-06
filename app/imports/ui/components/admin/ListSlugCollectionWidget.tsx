import React from 'react';
import { connect } from 'react-redux';
import { Grid, Header, Segment } from 'semantic-ui-react';
import _ from 'lodash';
import { withTracker } from 'meteor/react-meteor-data';
import BaseCollection from '../../../api/base/BaseCollection';
import { IDescriptionPair } from '../../../typings/radgrad';
import AdminCollectionAccordion from './AdminCollectionAccordion';
import AdminPaginationWidget from './AdminPaginationWidget';
import { dataModelActions } from '../../../redux/admin/data-model';

interface IListSlugCollectionWidgetProps {
  collection: BaseCollection;
  findOptions?: object;
  descriptionPairs: (item) => IDescriptionPair[];
  handleOpenUpdate: (evt: any, id: any) => any;
  handleDelete: (evt: any, id: any) => any;
  items: any[];
  itemTitle: (item) => React.ReactNode;
  dispatch: any;
  pagination: any;
}

const mapStateToProps = (state) => ({
  pagination: state.admin.dataModel.pagination,
});

const ListSlugCollectionWidget = (props: IListSlugCollectionWidgetProps) => {
  // console.log('ListSlugCollectionWidget.render props=%o', props);
  const count = props.collection.count();
  const startIndex = props.pagination[props.collection.getCollectionName()].showIndex;
  const showCount = props.pagination[props.collection.getCollectionName()].showCount;
  const endIndex = startIndex + showCount;
  const items = _.slice(props.items, startIndex, endIndex);
  // console.log('startIndex=%o endIndex=%o items=%o', startIndex, endIndex, items);
  return (
    <Segment padded>
      <Header dividing>
        {props.collection.getCollectionName()} ({count})
      </Header>
      <Grid>
        <AdminPaginationWidget
          collection={props.collection}
          setShowIndex={dataModelActions.setCollectionShowIndex}
          setShowCount={dataModelActions.setCollectionShowCount}
        />
        {_.map(items, (item) => (
          <AdminCollectionAccordion
            key={item._id}
            id={item._id}
            title={props.itemTitle(item)}
            descriptionPairs={props.descriptionPairs(item)}
            updateDisabled
            deleteDisabled
            handleOpenUpdate={props.handleOpenUpdate}
            handleDelete={props.handleDelete}
          />
        ))}
      </Grid>
    </Segment>
  );
};

const ListSlugCollectionWidgetCon = connect(mapStateToProps)(ListSlugCollectionWidget);

const ListSlugCollectionWidgetContainer = withTracker((props) => {
  // console.log('ListSlugCollectionWidget withTracker props=%o', props);
  const items = props.collection.find({}, props.findOptions).fetch();
  // console.log('ListSlugCollectionWidget withTracker items=%o', items);
  return {
    items,
  };
})(ListSlugCollectionWidgetCon);
export default ListSlugCollectionWidgetContainer;
