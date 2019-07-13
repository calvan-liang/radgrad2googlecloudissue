import * as React from 'react';
import { Form, Grid } from 'semantic-ui-react';
import Swal from 'sweetalert2';
import { updateMethod } from '../../../api/base/BaseCollection.methods';

interface IStudentAboutMeUpdateWebsiteFormProps {
  username: string;
  website: string;
  docID: string;
  collectionName: string;
}

class StudentAboutMeUpdateWebsiteForm extends React.Component<IStudentAboutMeUpdateWebsiteFormProps> {
  state = { website: this.props.website };

  private prePopulateForm = (picture) => {
    this.setState({ picture: picture });
  }

  private handleFormChange = (e, { value }) => this.setState({ website: value });

  private handleUpdatePicture = (e): void => {
    e.preventDefault();
    const collectionName = this.props.collectionName;
    const updateData = { id: this.props.docID, website: this.state.website };

    updateMethod.call({ collectionName, updateData }, (error) => {
      if (error) {
        Swal.fire({
          title: 'Update Failed',
          text: error.message,
          type: 'error',
        });
      } else {
        Swal.fire({
          title: 'Update Succeeded',
          type: 'success',
          text: 'Your website link has been successfully updated.',
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false,
        });
      }
    });
  }

  componentDidUpdate(prevProps: Readonly<IStudentAboutMeUpdateWebsiteFormProps>): void {
    const prop = this.props.website;
    if (prop !== prevProps.website) this.prePopulateForm(this.props.website);
  }

  public render(): React.ReactElement<any> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
    const { website } = this.state;
    return (
      <React.Fragment>
        <Grid.Column width={2}><b>Website</b></Grid.Column>
        <Grid.Column width={6}>
          <Form onSubmit={this.handleUpdatePicture}>
            <Form.Group>
              <Form.Input onChange={this.handleFormChange}
                          value={website}/>
              <Form.Button basic={true} color="green"> Update</Form.Button>
            </Form.Group>
          </Form>
        </Grid.Column>
      </React.Fragment>
    );
  }
}

export default StudentAboutMeUpdateWebsiteForm;
