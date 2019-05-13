import React from "react";
import ReactDOM from "react-dom";
import Root from "./Root";
import Auth from './components/Auth';
import * as serviceWorker from "./serviceWorker";

import { ApolloProvider, Query } from "react-apollo";
import ApolloClient, { gql } from 'apollo-boost';

const getCookie = (cname) => {
  const name = cname + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
};

const client = new ApolloClient({
  uri: 'http://localhost:8000/graphql/',
  fetchOptions: {
    credentials: "include",
  },
  request: operation => {
    operation.setContext({
      headers: {
        'Authorization': `JWT ${getCookie('authToken')}`
      }
    })
  },
  clientState: {
    defaults: {
      isLoggedIn: getCookie('authToken'),
    }
  }
});

const IS_LOGGED_IN_QUERY = gql`
  query {
    isLoggedIn @client
  }
`;


ReactDOM.render(
  (<ApolloProvider client={client}>
    <Query query={IS_LOGGED_IN_QUERY}>
      {({ data }) => data.isLoggedIn ? <Root/> : <Auth/>}
    </Query>
  </ApolloProvider>), document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
