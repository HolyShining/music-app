import React, {useContext} from "react";
import {Mutation} from "react-apollo";
import {gql} from 'apollo-boost';
import IconButton from "@material-ui/core/IconButton";
import TrashIcon from "@material-ui/icons/DeleteForeverOutlined";
import {UserContext} from "../../Root";
import {GET_TRACKS_QUERY} from "../../pages/App";

const DeleteTrack = ({track}) => {
  const user = useContext(UserContext);
  const isCorrectUser = user.id === track.postedBy.id;
  return isCorrectUser && (
    <Mutation mutation={DELETE_TRACK_MUTATION} variables={{trackId: track.id}} refetchQueries={() => [{query: GET_TRACKS_QUERY}]}>
      {(deleteTrack) => {
        console.log(track.id);
        return (
        <IconButton onClick={deleteTrack}>
        <TrashIcon/>
        </IconButton>);
      }
      }
    </Mutation>);
};

const DELETE_TRACK_MUTATION = gql`
  mutation($trackId: Int!){
    deleteTrack(trackId: $trackId){
      trackId
    }
  }
`;

export default DeleteTrack;
