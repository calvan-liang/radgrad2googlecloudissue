import React, { useState } from 'react';
import { Confirm, Grid, Icon } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import AdminPageMenuWidget from '../../components/admin/AdminPageMenuWidget';
import AdminDataModelMenu from '../../components/admin/AdminDataModelMenu';
import ListCollectionWidget from '../../components/admin/ListCollectionWidget';
import { IDescriptionPair } from '../../../typings/radgrad';
import { defineMethod, removeItMethod, updateMethod } from '../../../api/base/BaseCollection.methods';
import { MentorAnswers } from '../../../api/mentor/MentorAnswerCollection';
import { Users } from '../../../api/user/UserCollection';
import { MentorProfiles } from '../../../api/user/MentorProfileCollection';
import { MentorQuestions } from '../../../api/mentor/MentorQuestionCollection';
import AddMentorAnswerForm from '../../components/admin/AddMentorAnswerForm';
import { mentorQuestionToSlug, profileNameToUsername } from '../../components/shared/data-model-helper-functions';
import UpdateMentorAnswerForm from '../../components/admin/UpdateMentorAnswerForm';
import BackToTopButton from '../../components/shared/BackToTopButton';
import { dataModelActions } from '../../../redux/admin/data-model';

const collection = MentorAnswers; // the collection to use.

/**
 * Returns an array of Description pairs used in the ListCollectionWidget.
 * @param item an item from the collection.
 */
const descriptionPairs = (item: any): IDescriptionPair[] => [
  { label: 'Mentor', value: Users.getFullName(MentorProfiles.getProfile(item.mentorID).username) },
  { label: 'Answer', value: item.text },
  { label: 'Retired', value: item.retired ? 'True' : 'False' },
];

/**
 * Returns the title string for the item. Used in the ListCollectionWidget.
 * @param item an item from the collection.
 */
const itemTitleString = (item: any): string => {
  const question = MentorQuestions.findDoc(item.questionID);
  const fullName = Users.getFullName(MentorProfiles.getProfile(item.mentorID).username);
  return `${question.question} (${fullName})`;
};

/**
 * Returns the ReactNode used in the ListCollectionWidget. By default we indicate if the item is retired.
 * @param item an item from the collection.
 */
const itemTitle = (item: any): React.ReactNode => (
  <React.Fragment>
    {item.retired ? <Icon name="eye slash" /> : ''}
    <Icon name="dropdown" />
    {itemTitleString(item)}
  </React.Fragment>
);

const AdminDataModelMentorAnswerPage = () => {
  const formRef = React.createRef();
  const [confirmOpenState, setConfirmOpen] = useState(false);
  const [idState, setId] = useState('');
  const [showUpdateFormState, setShowUpdateForm] = useState(false);

  const handleAdd = (doc) => {
    // console.log('MentorAnswer.handleAdd(%o)', doc);
    const collectionName = collection.getCollectionName();
    const definitionData = doc;
    definitionData.question = mentorQuestionToSlug(doc.question);
    definitionData.mentor = profileNameToUsername(doc.mentor);
    // console.log(collectionName, definitionData);
    defineMethod.call({ collectionName, definitionData }, (error) => {
      if (error) {
        Swal.fire({
          title: 'Add failed',
          text: error.message,
          icon: 'error',
        });
      } else {
        Swal.fire({
          title: 'Add succeeded',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
        });
        // @ts-ignore
        formRef.current.reset();
      }
    });
  };

  const handleCancel = (event) => {
    event.preventDefault();
    setShowUpdateForm(false);
    setId('');
    setConfirmOpen(false);
  };

  const handleDelete = (event, inst) => {
    event.preventDefault();
    // console.log('handleDelete inst=%o', inst);
    setConfirmOpen(true);
    setId(inst.id);
  };

  const handleConfirmDelete = () => {
    const collectionName = collection.getCollectionName();
    const instance = idState;
    removeItMethod.call({ collectionName, instance }, (error) => {
      if (error) {
        Swal.fire({
          title: 'Delete failed',
          text: error.message,
          icon: 'error',
        });
        console.error('Error deleting. %o', error);
      } else {
        Swal.fire({
          title: 'Delete succeeded',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
        });
      }
      setShowUpdateForm(false);
      setId('');
      setConfirmOpen(false);
    });
  };

  const handleOpenUpdate = (evt, inst) => {
    evt.preventDefault();
    // console.log('handleOpenUpdate inst=%o', evt, inst);
    setShowUpdateForm(true);
    setId(inst.id);
  };

  const handleUpdate = (doc) => {
    // console.log('MentorAnswer.handleUpdate doc=%o', doc);
    const collectionName = collection.getCollectionName();
    const updateData = doc; // create the updateData object from the doc.
    updateData.id = doc._id;
    updateMethod.call({ collectionName, updateData }, (error) => {
      if (error) {
        Swal.fire({
          title: 'Update failed',
          text: error.message,
          icon: 'error',
        });
        console.error('Error in updating. %o', error);
      } else {
        Swal.fire({
          title: 'Update succeeded',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
        });
        setShowUpdateForm(false);
        setId('');
      }
    });
  };

  const paddedStyle = {
    paddingTop: 20,
  };
  const findOptions = {
    sort: { name: 1 }, // determine how you want to sort the items in the list
  };
  return (
    <div>
      <AdminPageMenuWidget />
      <Grid container stackable style={paddedStyle}>

        <Grid.Column width={3}>
          <AdminDataModelMenu />
        </Grid.Column>

        <Grid.Column width={13}>
          {showUpdateFormState ? (
            <UpdateMentorAnswerForm
              collection={collection}
              id={idState}
              formRef={formRef}
              handleUpdate={handleUpdate}
              handleCancel={handleCancel}
              itemTitleString={itemTitleString}
            />
          ) : (
            <AddMentorAnswerForm formRef={formRef} handleAdd={handleAdd} />
          )}
          <ListCollectionWidget
            collection={collection}
            findOptions={findOptions}
            descriptionPairs={descriptionPairs}
            itemTitle={itemTitle}
            handleOpenUpdate={handleOpenUpdate}
            handleDelete={handleDelete}
            setShowIndex={dataModelActions.setCollectionShowIndex}
            setShowCount={dataModelActions.setCollectionShowCount}
          />
        </Grid.Column>
      </Grid>
      <Confirm
        open={confirmOpenState}
        onCancel={handleCancel}
        onConfirm={handleConfirmDelete}
        header="Delete Mentor Answer?"
      />

      <BackToTopButton />
    </div>
  );
};

export default AdminDataModelMentorAnswerPage;
