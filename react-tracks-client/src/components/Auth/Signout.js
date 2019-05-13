import React from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import ExitToApp from "@material-ui/icons/ExitToApp";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import {ApolloConsumer} from "react-apollo";

const Signout = ({ classes }) => {
  const handleSignout  = client => {
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    client.writeData({data: {isLoggedIn: false}});
  };
  return (
    <ApolloConsumer>
      {client => (
      <Button onClick={() => handleSignout(client)}>
        <Typography variant="body1" className={classes.buttonText} color='secondary'>Sign out</Typography>
        <ExitToApp className={classes.buttonIcon} color='secondary'/>
      </Button>)}
    </ApolloConsumer>);
};

const styles = {
  root: {
    cursor: "pointer",
    display: "flex"
  },
  buttonIcon: {
    marginLeft: "5px"
  }
};

export default withStyles(styles)(Signout);
