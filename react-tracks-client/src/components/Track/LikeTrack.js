import React, {useContext, useState} from "react";
import {Mutation} from "react-apollo";
import {gql} from 'apollo-boost';
import withStyles from "@material-ui/core/styles/withStyles";
import IconButton from "@material-ui/core/IconButton";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import {GET_TRACKS_QUERY} from "../../pages/App";
import {UserContext} from "../../Root";

const LikeTrack = ({ classes, trackId, likeCount }) => {
  const user = useContext(UserContext);
  const handleLike = () => {
    console.log(user);
    const likedTracks = user.likeSet;
    return likedTracks.findIndex(({track}) => track.id === trackId) > -1;
  };

  const [liked, setLike] = useState(handleLike());

  return (
    <Mutation mutation={!liked ? LIKE_MUTATION : UNLIKE_MUTATION }
              variables={{trackId}}
              refetchQueries={() => [{query: GET_TRACKS_QUERY}]}>
      {createLike => (
        <IconButton
          className={classes.iconButton}
          color={liked ? 'primary':'default'}
          onClick={event => {event.stopPropagation(); createLike(); setLike(!liked)}}>
          {likeCount}
          <ThumbUpIcon className={classes.icon}/>
        </IconButton>)}
    </Mutation>);
};

const LIKE_MUTATION = gql`
  mutation($trackId: Int!){
    createLike(trackId: $trackId){
      track{
        id
        likeSet{
          id
        }
      }
    }
  }
`;

const UNLIKE_MUTATION = gql`
  mutation($trackId: Int!){
    deleteLike(trackId: $trackId){
      status
    }
  }
`;

const styles = theme => ({
  // iconButton: {
  //   color: "deeppink"
  // },
  icon: {
    marginLeft: theme.spacing.unit / 2
  }
});

export default withStyles(styles)(LikeTrack);
