import React from 'react';
import styled from 'styled-components';
import axios from './axiosConfig';
import autobind from 'class-autobind';

const Flex = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 8px;
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

const LabelFlex = styled.div`
  display: flex;
  margin-top: ${(props) => (props.first) ? 4 : 40}px;
`;

const DividerContent = styled.span`
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  line-height: 22px;
  font-size: 14px;
  outline: 0;

  margin: 0;
  padding: 0;
  border: 0;
  width: 100%;
  font-weight: inherit;
  font-style: inherit;
  font-family: inherit;
  vertical-align: baseline;

  cursor: default;
  text-align: center;
  color: #72767d;

  &::before {
    right: 100%;
    margin-right: 8px;
    content: '';
    background-color: #72767d;
    height: 1px;
    -webkit-box-flex: 1;
    flex: 1 1 auto;
  }

  &::after {
    left: 100%;
    margin-left: 8px;
    content: '';
    background-color: #72767d;
    height: 1px;
    -webkit-box-flex: 1;
    flex: 1 1 auto;
  }
`;

const Label = (props) => {
  return (
    <LabelFlex first={props.first}>
      <DividerContent>{props.value}</DividerContent>
    </LabelFlex>
  );
};

class RoomSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };
    autobind(this);
  }

  onLogin(roomId) {
    this.props.store.set({ ...this.props.store, roomId });
    this.props.history.push('/share');
  }

  onJoin() {
    const roomId = this.state.value;
    axios
      .post('/rooms/join', { id: roomId })
      .then(() => {
        this.onLogin(roomId);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  onCreate() {
    axios
      .post('/rooms', {})
      .then((res) => {
        this.onLogin(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  render() {
    return (
      <form onSubmit={(e) => e.preventDefault()}>
        <Flex>
          <Container>
            <Label first={1} value='Join room' />
            <Input value={this.state.value} onChange={this.handleChange} />
            <Submit type='button' value='Join' onClick={this.onJoin} />
            <Label value='Or create one'>Or create one</Label>
            <Submit type='button' value='Create' onClick={this.onCreate} />
          </Container>
        </Flex>
      </form>
    );
  }
}

export default RoomSelect;
