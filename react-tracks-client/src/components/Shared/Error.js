import React, {useState} from "react";
import withStyles from "@material-ui/core/styles/withStyles";
import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from '@material-ui/icons/Close';
import ErrorIcon from '@material-ui/icons/Error';
import SnackbarContent from '@material-ui/core/SnackbarContent';

const Error = ({ classes, error }) => {
  const [open, setOpen] = useState(true);
  return (<Snackbar
    open={open}
    className={classes.snackbar}
  ><SnackbarContent
    className={classes.error}
    message={<span id="snackbar" className={classes.message}><ErrorIcon className={classes.icon}/>{error.message}</span>}
    action={<IconButton
      key="close"
      aria-label="Close"
      color="inherit"
      className={classes.close}
      onClick={() => setOpen(false)}
    >
      <CloseIcon className={classes.icon} />
    </IconButton>}
  /></Snackbar>);
};

const styles = theme => ({
  snackbar: {
    margin: theme.spacing.unit
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  icon: {
    fontSize: 20,
    marginRight: '20px',
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
});

export default withStyles(styles)(Error);
