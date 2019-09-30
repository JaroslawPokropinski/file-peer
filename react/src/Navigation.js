import React, { useState } from 'react';
import styled from 'styled-components';
import axios from './axiosConfig';
import { withRouter } from 'react-router';

const NavContainer = styled.div`
  /* float: right; */
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
`;

const Button = styled.button`
  background-color: var(--secondary-color);
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;

  &:hover {
    background-color: var(--secondary-color2);
    cursor: pointer;
  }
`;

const ConditionalButton = (props) => {
  if (!props.condition) {
    return null;
  }
  return <Button onClick={props.onClick}>{props.text}</Button>;
};

const onLogOut = (props) => {
  axios.post(`/logout/`, {}).then(() => {
    if (props.store.peer) {
      props.store.peer.destroy();
    }
    props.store.set({ ...props.store, peer: null, name: null, id: -1 });
    props.history.push('/');
  });
};

const onLeave = (props) => {
  axios.post('/rooms/leave').then(() => {
    props.history.push('/select');
  });
  props.store.set({ ...props.store, roomId: null });
};

const StyledOverlay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background: rgba(0, 0, 0, 0.3);
`;

const RoomInvite = styled.div`
  background-color: white;
  padding: 40px;
  border-radius: 8px;
`;

const Overlay = (props) => {
  if (!props.visible) {
    return null;
  }
  return (
    <StyledOverlay
      onClick={(ev) => {
        if (ev.target === ev.currentTarget) {
          props.onClose();
        }
      }}
      {...props}
    >
      <RoomInvite>{props.roomId}</RoomInvite>
    </StyledOverlay>
  );
};

const Navigation = (props) => {
  const [state, setState] = useState(false);
  if (props.store.name === null) {
    return null;
  }
  return (
    <NavContainer>
      <ConditionalButton
        text='Invite'
        condition={props.store.roomId !== null}
        onClick={() => {
          setState(true);
        }}
      />
      <ConditionalButton
        text='Leave room'
        condition={props.store.roomId !== null}
        onClick={() => onLeave(props)}
      />
      <Button onClick={() => onLogOut(props)}>Log out</Button>

      <Overlay
        visible={state}
        onClose={() => setState(false)}
        roomId={props.store.roomId}
      />
    </NavContainer>
  );
};

export default withRouter(Navigation);
