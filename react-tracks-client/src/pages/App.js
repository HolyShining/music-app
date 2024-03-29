import React, {useState} from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import {Query} from "react-apollo";
import { gql } from 'apollo-boost';

import SearchTracks from '../components/Track/SearchTracks'
import TrackList from '../components/Track/TrackList';
import CreateTrack from '../components/Track/CreateTrack';
import Loading from '../components/Shared/Loading';
import Error from '../components/Shared/Error';

const App = ({ classes }) => {
  const [searchResults, setSearchResults] = useState(null);
  return (
    <div className={classes.container}>
      <SearchTracks setSearchResults={setSearchResults}/>
      <CreateTrack/>
      <Query query={GET_TRACKS_QUERY}>
        {({data, loading, error}) => {
          if (loading) return <Loading/>;
          if (error) return <Error error={error}/>;

          return <TrackList tracks={searchResults || data.tracks}/>
        }}
      </Query>
    </div>
  );
};

export const GET_TRACKS_QUERY = gql`
  query getTracksQuery {
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
`;

const styles = theme => ({
  container: {
    margin: "0 auto",
    maxWidth: 960,
    padding: theme.spacing.unit * 2
  }
});

export default withStyles(styles)(App);
