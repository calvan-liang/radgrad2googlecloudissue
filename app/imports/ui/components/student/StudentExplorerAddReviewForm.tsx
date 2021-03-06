import React, { useState } from 'react';
import Swal from 'sweetalert2';
import SimpleSchema from 'simpl-schema';
import { AutoForm, LongTextField, SelectField, SubmitField } from 'uniforms-semantic/';
import { Accordion, Form, Icon } from 'semantic-ui-react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { Reviews } from '../../../api/review/ReviewCollection';
import RatingField from '../shared/RatingField';
import { CourseInstances } from '../../../api/course/CourseInstanceCollection';
import { OpportunityInstances } from '../../../api/opportunity/OpportunityInstanceCollection';
import { AcademicTerms } from '../../../api/academic-term/AcademicTermCollection';
import { defineMethod } from '../../../api/base/BaseCollection.methods';
import { IAcademicTerm, IReviewDefine } from '../../../typings/radgrad';
import { UserInteractionsDataType, UserInteractionsTypes } from '../../../api/analytic/UserInteractionsTypes';
import { userInteractionDefineMethod } from '../../../api/analytic/UserInteractionCollection.methods';
import { getUserIdFromRoute, getUsername } from '../shared/RouterHelperFunctions';
import { Courses } from '../../../api/course/CourseCollection';
import { Opportunities } from '../../../api/opportunity/OpportunityCollection';
import { ReviewTypes } from '../../../api/review/ReviewTypes';

interface IStudentExplorerAddReviewFormProps {
  event: {
    [key: string]: any;
  }
  reviewType: string;
  match: {
    isExact: boolean;
    path: string;
    url: string;
    params: {
      username: string;
      course: string;
    }
  };
}

const collection = Reviews;

const StudentExplorerAddReviewForm = (props: IStudentExplorerAddReviewFormProps) => {
  const formRef = React.createRef();
  const [activeState, setActive] = useState(false);

  const handleAccordionClick = (e: any) => {
    e.preventDefault();
    setActive(!activeState);
  };

  const handleAdd = (doc: IReviewDefine): void => {
    const collectionName = collection.getCollectionName();
    const { match, reviewType, event } = props;
    const username = getUsername(match);
    const academicTermDoc = AcademicTerms.getAcademicTermFromToString(doc.academicTerm);
    const academicTermSlug = AcademicTerms.findSlugByID(academicTermDoc._id);
    const definitionData: IReviewDefine = doc;
    definitionData.academicTerm = academicTermSlug;
    definitionData.student = username;
    definitionData.reviewType = reviewType as ReviewTypes;
    definitionData.reviewee = event._id;
    defineMethod.call({ collectionName, definitionData }, (error) => {
      if (error) {
        Swal.fire({
          title: 'Add Failed',
          text: error.message,
          icon: 'error',
        });
      } else {
        Swal.fire({
          title: 'Review Added',
          icon: 'success',
          text: 'Your review was successfully added.',
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false,
        });
        let slug: string;
        const reviewee = definitionData.reviewee;
        if (reviewType === ReviewTypes.COURSE) {
          const revieweeID = Courses.getID(reviewee);
          slug = Courses.findSlugByID(revieweeID);
        } else if (reviewType === ReviewTypes.OPPORTUNITY) {
          const revieweeID = Opportunities.getID(reviewee);
          slug = Opportunities.findSlugByID(revieweeID);
        }
        const interactionData: UserInteractionsDataType = {
          username,
          type: UserInteractionsTypes.ADDREVIEW,
          typeData: [`${reviewType}:${academicTermSlug}-${slug}`],
        };
        userInteractionDefineMethod.call(interactionData, (userInteractionError) => {
          if (userInteractionError) {
            console.log('Error creating UserInteraction.', userInteractionError);
          }
        });
        // this.formRef.current.reset();
      }
    });
  };

  const academicTerm = (): IAcademicTerm[] => {
    const { match, event, reviewType } = props;
    const academicTerms = [];
    let instances;
    if (reviewType === 'course') {
      const course = event;
      instances = CourseInstances.find({
        studentID: getUserIdFromRoute(match),
        courseID: course._id,
      }).fetch();
    } else {
      const opportunity = event;
      instances = OpportunityInstances.find({
        studentID: getUserIdFromRoute(match),
        opportunityID: opportunity._id,
      }).fetch();
    }
    _.forEach(instances, (instance) => {
      const term = AcademicTerms.findDoc(instance.termID);
      if (term.termNumber <= AcademicTerms.getCurrentAcademicTermDoc().termNumber) {
        academicTerms.push(AcademicTerms.findDoc(instance.termID));
      }
    });
    return academicTerms;
  };

  const accordionTitleStyle = {
    textAlign: 'center',
    color: '#38840F',
  };
  const paddedContainerStyle = { paddingBottom: '1.5em' };


  const terms = academicTerm();
  const academicTermNames = _.map(terms, (term) => `${term.term} ${term.year}`);
  const schema = new SimpleSchema({
    academicTerm: {
      type: String,
      label: 'Academic Term',
      allowedValues: academicTermNames,
      defaultValue: academicTermNames[0],
    },
    rating: {
      type: Number,
      label: 'Rating',
      min: 0,
      max: 5,
      optional: true,
    },
    comments: {
      type: String,
      label: 'Comments',
    },
  });
  return (
    <Accordion>
      <Accordion.Title style={accordionTitleStyle} active={activeState} onClick={handleAccordionClick}>
        <Icon name="dropdown" />
        <a>Add Review </a>
      </Accordion.Title>

      <Accordion.Content active={activeState}>
        <div className="ui padded container" style={paddedContainerStyle}>
          <AutoForm schema={schema} onSubmit={handleAdd} ref={formRef}>
            <Form.Group widths="equal">
              <SelectField name="academicTerm" />
              <RatingField name="rating" />
            </Form.Group>

            <LongTextField placeholder="Explain the reasoning behind your rating here." name="comments" />

            <SubmitField className="green basic mini" value="ADD" inputRef={undefined} disabled={false} />
          </AutoForm>
        </div>
      </Accordion.Content>
    </Accordion>
  );
};

const StudentExplorerAddReviewFormContainer = withRouter(StudentExplorerAddReviewForm);

export default StudentExplorerAddReviewFormContainer;
