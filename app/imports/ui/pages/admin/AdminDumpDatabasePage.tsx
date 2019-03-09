import * as React from 'react';
import { connect } from 'react-redux';
import { Button, Form, Grid, Message } from 'semantic-ui-react';
import { moment } from 'meteor/momentjs:moment';
import { ZipZap } from 'meteor/udondan:zipzap';
import withGlobalSubscription from '../../layouts/shared/GlobalSubscriptionsHOC';
import AdminPageMenuWidget from '../../components/admin/AdminPageMenuWidget';
import AdminDatabaseMenuContainer from '../../components/admin/AdminDatabaseMenu';
import { dumpDatabaseMethod } from '../../../api/base/BaseCollection.methods';
import { generateStudentEmailsMethod } from '../../../api/user/UserCollection.methods';
import AdminDatabaseAccordion from '../../components/admin/AdminDatabaseAccordion';
import {
  dumpDatabaseDone, getStudentEmailsDone,
  startDumpDatabase, startGetStudentEmails,
} from '../../../redux/actions/actions';

interface Icollection {
  name?: string;
  contents?: string[];
}

interface IAdminDumpDatabasePageState {
  isError: boolean;
  results: Icollection[];
}

interface IAdminDumpDatabasePageProps {
  startDumpDatabase: () => any;
  dumpDatabaseDone: () => any;
  dumpDatabaseWorking?: boolean;
  startGetStudentEmails: () => any;
  getStudentEmailsDone: () => any;
  getStudentEmailsWorking?: boolean;
}

export const databaseFileDateFormat = 'YYYY-MM-DD-HH-mm-ss';

const mapStateToProps = (state) => {
  return {
    dumpDatabaseWorking: state.radgradWorking.dumpDatabase,
    getStudentEmailsWorking: state.radgradWorking.getStudentEmails,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    startDumpDatabase: () => dispatch(startDumpDatabase()),
    dumpDatabaseDone: () => dispatch(dumpDatabaseDone()),
    startGetStudentEmails: () => dispatch(startGetStudentEmails()),
    getStudentEmailsDone: () => dispatch(getStudentEmailsDone()),
  };
};

class AdminDumpDatabasePage extends React.Component<IAdminDumpDatabasePageProps, IAdminDumpDatabasePageState> {
  constructor(props) {
    super(props);
    this.clickDump = this.clickDump.bind(this);
    this.clickEmails = this.clickEmails.bind(this);
    this.state = {
      isError: false,
      results: [],
    };
  }

  private clickDump() {
    this.props.startDumpDatabase();
    dumpDatabaseMethod.call(null, (error, result) => {
      if (error) {
        this.setState({ isError: true });
      }
      this.setState({
        results: result.collections,
      });
      const zip = new ZipZap();
      const dir = 'radgrad-db';
      const fileName = `${dir}/${moment(result.timestamp).format(databaseFileDateFormat)}.json`;
      zip.file(fileName, JSON.stringify(result, null, 2));
      zip.saveAs(`${dir}.zip`);
      this.props.dumpDatabaseDone();
    });
  }

  private clickEmails() {
    this.props.startGetStudentEmails();
    generateStudentEmailsMethod.call(null, (error, result) => {
      if (error) {
        this.setState({ isError: true });
      }
      // console.log(error, result);
      const data: Icollection = {};
      data.name = 'Students';
      data.contents = result.students;
      this.setState({
        results: [data],
      });
      const zip = new ZipZap();
      const now = moment().format(databaseFileDateFormat);
      const dir = `radgrad-students${now}`;
      const fileName = `${dir}/Students.txt`;
      zip.file(fileName, result.students.join('\n'));
      zip.saveAs(`${dir}.zip`);
      this.props.getStudentEmailsDone();
    });
  }

  public render() {
    const paddedStyle = {
      paddingTop: 20,
    };
    const errorCondition = this.state.isError;
    const showMessage = this.state.results.length > 0;
    const dumpWorking = this.props.dumpDatabaseWorking;
    const getWorking = this.props.getStudentEmailsWorking;
    return (
      <div>
        <AdminPageMenuWidget/>
        <Grid container={true} stackable={true} style={paddedStyle}>

          <Grid.Column width={5}>
            <AdminDatabaseMenuContainer/>
          </Grid.Column>

          <Grid.Column width={11}>
            <Form>
              <Button color="green" loading={dumpWorking} basic={true} type="submit" onClick={this.clickDump}>Dump Database</Button>
              <Button color="green" loading={getWorking} basic={true} type="submit" onClick={this.clickEmails}>Get Student Emails</Button>
            </Form>
            {showMessage ? (
              <Grid stackable={true} style={paddedStyle}>
                <Message positive={!errorCondition} error={errorCondition}>
                  {this.state.results.map((item, index) => {
                    return (<AdminDatabaseAccordion key={index} index={index} name={item.name} contents={item.contents}/>);
                  })}
                </Message>
              </Grid>
            ) : ''}
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

const AdminDumpDatabasePageCon = withGlobalSubscription(AdminDumpDatabasePage);
const AdminDumpDatabasePageContainer = connect(mapStateToProps, mapDispatchToProps)(AdminDumpDatabasePageCon);
export default AdminDumpDatabasePageContainer;
