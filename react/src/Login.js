import React from 'react';
import styled from 'styled-components';
import Peer from 'peerjs';

import peerConfig from './peerConfig.json';
import peerConfigProd from './peerConfigProd.json';
import axios from './axiosConfig';

const Flex = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 56px;
`;

const Container = styled.div`
  padding: 40px;
  background-color: #f2f2f2;
  border-radius: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
`;

const Submit = styled.input`
  width: 100%;
  background-color: var(--primary-color);
  color: white;
  padding: 14px 20px;
  margin: 8px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const Label = styled.label`
  float: left;
`;

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: '', pending: false, id: null };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    const peer = new Peer(
      process.env.NODE_ENV === 'production' ? peerConfigProd : peerConfig
    );
    peer.on('open', (id) => {
      console.log(`Id: ${id}`);
      axios
        .post('/session', { id })
        .then((response) => {
          if (response.data) {
            this.props.store.set({ name: response.data.name, id, peer });
            if (response.data.roomId === undefined) {
              this.props.history.push('/select');
            } else {
              this.props.store.set({
                ...this.props.store,
                roomId: response.data.roomId,
              });
              this.props.history.push('/share');
            }
          } else {
            this.setState({ id });
          }
        })
        .catch((_error) => {
          this.setState({ id });
        });
      this.props.store.set({ peer });
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.state.id === null) {
      console.error('Id is null!');
      return;
    }
    const name = this.state.value;
    if (name.length < 3) {
      console.error('Name must have at least 3 letters!');
      return;
    }
    axios
      .post('/login', {
        name,
        id: this.state.id,
      })
      .then(() => {
        this.props.store.set({ ...this.props.store, name });
        this.props.history.push('/select');
      })
      .catch((error) => {
        console.error(error);
        this.setState({ pending: false });
      });

    this.setState({ pending: true });
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <Flex>
          <Container>
            <Label>Name:</Label>
            <Input value={this.state.value} onChange={this.handleChange} />
            <Submit type='submit' value='Submit' />
          </Container>
        </Flex>
      </form>
    );
  }
}

export default Login;
