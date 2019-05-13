import React, {useState, useRef} from "react";
import {ApolloConsumer} from "react-apollo";
import {gql} from 'apollo-boost';

import withStyles from "@material-ui/core/styles/withStyles";
import TextField from "@material-ui/core/TextField";
import ClearIcon from "@material-ui/icons/Clear";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";

const SearchTracks = ({ classes, setSearchResults }) => {
  const [request, setRequest] = useState('');
  const inputEl = useRef();

  const handleChange = async (event, client) => {
    setRequest(event.target.value);
    if (event.target.value === '') {
      setSearchResults(null);
    } else {
      const response = await client.query({
        query: SEARCH_TRACKS_QUERY,
        variables: {
          request
        }
      });
      setSearchResults(response.data.tracks);
    }
  };

  return (
    <ApolloConsumer>
      {client => (
        <form>
          <Paper className={classes.root} elevation={1}>
            <IconButton onClick={() => {setRequest(''); setSearchResults(null); inputEl.current.focus();}}>
              <ClearIcon/>
            </IconButton>
            <TextField
              fullWidth
              placeholder="Search all tracks.."
              value={request}
              onChange={event => handleChange(event, client)}
              InputProps={{
                disableUnderline: true,
              }}
              inputRef={inputEl}
            />

            <IconButton
              type="submit">
              <SearchIcon/>
            </IconButton>
          </Paper>
        </form>)}
    </ApolloConsumer>);
};

const SEARCH_TRACKS_QUERY = gql`
  query searchTracksQuery($request: String!) {
    tracks(search: $request) {
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
`;

const styles = theme => ({
  root: {
    padding: "2px 4px",
    margin: theme.spacing.unit,
    display: "flex",
    alignItems: "center"
  }
});

export default withStyles(styles)(SearchTracks);
