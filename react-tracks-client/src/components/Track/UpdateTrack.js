import React, {useState, useContext} from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import IconButton from "@material-ui/core/IconButton";
import EditIcon from "@material-ui/icons/Edit";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import LibraryMusicIcon from "@material-ui/icons/LibraryMusic";
import axios from "axios";
import {Mutation} from "react-apollo";
import {gql} from 'apollo-boost';
import Loading from "../Shared/Loading";
import Error from "../Shared/Error";
import {UserContext} from "../../Root";

import {GET_TRACKS_QUERY} from "../../pages/App";

const UpdateTrack = ({ classes, track}) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(track.title);
  const [description, setDescription] = useState(track.description);
  const [file, setFile] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fileError, setFileError] = useState('');
  const currentUser = useContext(UserContext);
  const isCurrentUser = currentUser.id === track.postedBy.id;
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
      data.append('resource_type', 'raw');
      data.append('upload_preset', 'react-music');
      data.append('cloud_name', 'react-music');
      const response = await axios.post('https://api.cloudinary.com/v1_1/react-music/raw/upload', data);
      return response.data.url;
    } catch (e) {
      console.error('Error uploading file', e);
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event, updateTrack) => {
    event.preventDefault();
    setSubmitting(true);
    const url = await handleAudioUpload();
    updateTrack({variables:{
        title, description, url
      }});
  };

  return isCurrentUser && (<>
    <IconButton
      onClick={() => setOpen(true)}>
      <EditIcon/>
    </IconButton>

    <Mutation mutation={UPDATE_TRACK_MUTATION}
              onCompleted={data => {
                console.log({data});
                setOpen(false);
                setSubmitting(false);
                setTitle(""); setDescription(""); setFile("");
              }} refetchQueries={() => [{query: GET_TRACKS_QUERY}]}>
      {(updateTrack, {loading, error}) => {
        if (loading) return <Loading/>;
        if (error) return <Error error={error}/>;

        return (<Dialog
          open={open}
          className={classes.dialog}>
          <form onSubmit={event => handleSubmit(event, updateTrack)}>
            <DialogTitle>Update Track</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Update Track {track.title}
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
                className={classes.save}>{submitting ? <CircularProgress className={classes.save} size={24}/>: "Update" }</Button>
            </DialogActions>
          </form>
        </Dialog>);
      }}
    </Mutation>

  </>);
};

const UPDATE_TRACK_MUTATION = gql`
  mutation($trackId: Int!, $title: String, $desctiption: String, $url: String){
    updateTrack(trackId: $trackId, title: $title, description: $description, url: $url){
      tracks {
        id
        title
        description
        url
        likeSet{
          id
        }
        postedBy{
          id
          username
        }
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
  }
});

export default withStyles(styles)(UpdateTrack);
