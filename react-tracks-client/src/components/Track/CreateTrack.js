import React, {useState} from "react";
import { Mutation} from "react-apollo";
import { gql } from "apollo-boost";
import withStyles from "@material-ui/core/styles/withStyles";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import AddIcon from "@material-ui/icons/Add";
import ClearIcon from "@material-ui/icons/Clear";
import LibraryMusicIcon from "@material-ui/icons/LibraryMusic";
import {FieldsOnCorrectType} from "graphql/validation/rules/FieldsOnCorrectType";
import axios from 'axios';
import {GET_TRACKS_QUERY} from "../../pages/App";

import Loading from '../Shared/Loading';
import Error from '../Shared/Error';

const CreateTrack = ({ classes }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fileError, setFileError] = useState('');

  const handleAudioChange = event => {
    const selectedFile = event.target.files[0];
    const filesizeLimit = 25000000;
    if (selectedFile && selectedFile.size > filesizeLimit){
      setFileError(`${selectedFile.name}: File size is to large`)
    } else {
      setFile(selectedFile);
      setFileError('');
    }
  };

  const handleAudioUpload = async () => {
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('resource_type', process.env.cloud_key);
      data.append('upload_preset', process.env.cloud_key);
      data.append('cloud_name', process.env.cloud_key);
      const response = await axios.post(`https://api.cloudinary.com/v1_1/${process.env.cloud_key}/raw/upload`, data);
      return response.data.url;
    } catch (e) {
      console.error('Error uploading file', e);
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event, createTrack) => {
    event.preventDefault();
    setSubmitting(true);
    const url = await handleAudioUpload();
    createTrack({variables:{
      title, description, url
    }});
  };

  const handleUpdateCache = (cache, { data: { createTrack }}) => {
    const data = cache.readQuery({ query: GET_TRACKS_QUERY});
    const tracksData = data.tracks.concat(createTrack.track);
    cache.writeQuery({query: GET_TRACKS_QUERY, data: { tracks: tracksData }});
  };

  return (<>
    <Button
      variant="fab"
      onClick={() => setOpen(true)}
      className={classes.fab}
      color='secondary'>
      <AddIcon/>
    </Button>

    <Mutation mutation={CREATE_TRACK_MUTATION}
    onCompleted={data => {
      console.log({data});
      setOpen(false);
      setSubmitting(false);
      setTitle(""); setDescription(""); setFile("");
    }}
      refetchQueries={() => [{query: GET_TRACKS_QUERY}]}
    // update={handleUpdateCache}
    >
      {(createTrack, {loading, error}) => {
        if (loading) return <Loading/>;
        if (error) return <Error error={error}/>;

        return (<Dialog
          open={open}
          className={classes.dialog}>
          <form onSubmit={event => handleSubmit(event, createTrack)}>
            <DialogTitle>Create Track</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Add a Title, Description & Audio File (Under 25 mb)
              </DialogContentText>
              <FormControl fullWidth>
                <TextField
                  label="Title"
                  placeholder="Add title"
                  value={title}
                  onChange={event => setTitle(event.target.value)}
                  className={classes.textField}/>
              </FormControl>
              <FormControl fullWidth>
                <TextField
                  label="Description"
                  placeholder="Add description"
                  multiline
                  rows="2"
                  value={description}
                  onChange={event => setDescription(event.target.value)}
                  className={classes.textField}/>
              </FormControl>
              <FormControl error={Boolean(fileError)}>
                <input
                  id="audio"
                  required
                  type="file"
                  accept="audio/*"
                  className={classes.input}
                  onChange={handleAudioChange}
                />
              </FormControl>
              <label htmlFor="audio">
                <Button variant='outlined'
                        color={file ? 'secondary' : 'inherit'}
                        component="span"
                        className={classes.button}>
                  Audio File <LibraryMusicIcon className={classes.icon}/>
                </Button>
                {file && file.name}
                <FormHelperText className={classes.error}>{fileError}</FormHelperText>
              </label>

            </DialogContent>
            <DialogActions>
              <Button
                className={classes.cancel}
                disabled={submitting}
                onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || !title.trim() || !description.trim() || !file}
                className={classes.save}>{submitting ? <CircularProgress className={classes.save} size={24}/>: "Save" }</Button>
            </DialogActions>
          </form>
        </Dialog>);
      }}
    </Mutation>

  </>);
};

const CREATE_TRACK_MUTATION = gql`
  mutation ($title: String!, $description: String!, $url: String!) {
    createTrack(title: $title, description: $description, url: $url){
      track {
        id
        title
      }
    }
  }
`;

const styles = theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  dialog: {
    margin: "0 auto",
    maxWidth: 550
  },
  textField: {
    margin: theme.spacing.unit
  },
  cancel: {
    color: "red"
  },
  error: {
    color: "red"
  },
  save: {
    color: "green"
  },
  button: {
    margin: theme.spacing.unit * 2
  },
  icon: {
    marginLeft: theme.spacing.unit
  },
  input: {
    display: "none"
  },
  fab: {
    position: "fixed",
    bottom: theme.spacing.unit * 2,
    right: theme.spacing.unit * 2,
    zIndex: "200"
  }
});

export default withStyles(styles)(CreateTrack);
