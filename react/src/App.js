import React, { useState } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import styled from 'styled-components';

import Login from './Login';
import Share from './Share';
import Navigation from './Navigation';
import RoomSelect from './RoomSelect';

import './App.css';

const Container = styled.div`
  height: 100vh;
  overflow: hidden;
`;

function App() {
  const [state, setState] = useState({
    name: null,
    id: -1,
    peer: null,
    roomId: null,
    setName: (name) => setState({ ...state, name }),
    set: (data) => setState({ ...state, ...data }),
  });
  
  return (
    <Container className='App'>
      <Router basename='/app'>
        <Navigation store={state} />
        <Switch>
          <Route
            path={`/`}
            exact
            render={(props) => <Login {...props} store={state} />}
          />
          <Route
            path={`/share`}
            exact
            render={(props) => <Share {...props} store={state} />}
          />
          <Route
            path={`/select`}
            exact
            render={(props) => <RoomSelect {...props} store={state} />}
          />
          <Route
            path={`/share2`}
            exact
            render={(props) => <ShareComponent {...props} store={state} />}
          />
        </Switch>
      </Router>
    </Container>
  );
}

export default App;
