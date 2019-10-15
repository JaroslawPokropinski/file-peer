import React from 'react';
import axios from './axiosConfig';
import styled from 'styled-components';
import uuidv1 from 'uuid/v1';
import autobind from 'class-autobind';

import PostList from './PostList';
import humanFileSize from './humanBytes';
import download from './download';

const Container = styled.div`
  height: 100%;
`;

const DropDiv = styled.div`
  height: 40px;
  background-color: var(--secondary-color);
  color: white;
  font-weight: bold;
  padding-top: 8px;
`;

class FileInfo {
  constructor(
    owner,
    name,
    id,
    size,
    date = null,
    ownerId = null,
    valid = null
  ) {
    this.owner = owner;
    this.name = name;
    this.id = id;
    this.size = size;
    this.date = date;
    this.ownerId = ownerId;
    this.valid = valid;
  }
}

class Share extends React.Component {
  constructor(props) {
    super(props);
    this.interval = null;
    this.eventSource = null;
    this.state = {
      fetching: false,
      peer: null,
      files: [],
      shared: [],
      downloadQueue: [],
    };
    autobind(this);
  }
  componentDidMount() {
    if (this.props.store.name === null) {
      this.props.history.push('/');
      return;
    }

    this.eventSource = new EventSource(`${process.env.REACT_APP_BACKEND_URL}/files/stream`, { withCredentials: true });
    this.eventSource.onmessage = (e) => {
      const files = JSON.parse(e.data);
      this.setState({ files, fetching: false });
      this.el.scrollIntoView(false, { behavior: 'smooth' });
    }
    const peer = this.props.store.peer;

    peer.on('connection', (conn) => {
      // send requested file
      conn.on('data', (data) => {
        // check if file with uuid=data is shared if so send it else send empty file
        const index = this.state.shared.map((v) => v.id).indexOf(data);
        // if file is not shared
        if (index === -1) {
          console.error("Requested file doesn't exist!");
          conn.send({ error: true });
          return;
        }
        let name = this.state.shared[index].file.name;
        this.state.shared[index].file
          .arrayBuffer()
          .then((buffer) => {
            conn.send({ name, buffer });
          })
          .catch((err) => {
            console.error(err);
            conn.close();
          });
      });

      conn.on('error', (error) => {
        conn.send({ error: error.toString() });
      });
    });
    this.setState({ fetching: true });
  }

  componentWillUnmount() {
    if (this.interval !== null) {
      clearInterval(this.interval);
    }
    if (this.eventSource !== null) {
      this.eventSource.close()
    }
  }

  downloadFile({ peer, peerId, fileId, fileSize }) {
    const conn = peer.connect(peerId, { reliable: true });
    conn.on('open', () => {
      conn.send(fileId);

      const oldOnMessage = conn.dataChannel.onmessage;
      let timeStamp = null;
      conn.dataChannel.onmessage = (ev) => {
        oldOnMessage(ev);
        if (timeStamp !== null) {
          const dt = ev.timeStamp - timeStamp;
          console.log(
            `Bytes: ${ev.data.byteLength}, Time: ${dt}, Speed: ${humanFileSize(
              ev.data.byteLength / dt
            )} /s`
          );
        }
        timeStamp = ev.timeStamp;
        const q = this.state.downloadQueue;
        if (q.length > 0 && q[0].fileId === fileId) {
          let newQueue = [...this.state.downloadQueue];
          newQueue[0].progress += ev.data.byteLength;
          console.log(`Progress: ${newQueue[0].progress} of ${fileSize}`);
          this.setState({ downloadQueue: newQueue });
        }
      };

      conn.on('data', (data) => {
        // pop queue and resume download
        let newQueue = this.state.downloadQueue.slice(1);
        if (newQueue.length > 0) {
          this.downloadFile(newQueue[0]);
        }
        this.setState({
          downloadQueue: newQueue,
        });
        console.log('got data');
        if (data.error) {
          console.error(data.error);
          conn.close();
          return;
        }
        // let url = window.URL.createObjectURL(
        //   new Blob([new Uint8Array(data.buffer, 0, data.buffer.length)])
        // );
        // let tempLink = document.createElement('a');
        // tempLink.href = url;
        // tempLink.setAttribute('download', data.name);
        // tempLink.click();
        download(data);
        conn.close();
      });
    });

    conn.on('error', (error) => {
      let newQueue = this.state.downloadQueue.slice(1);
      if (newQueue.length > 0) {
        this.downloadFile(newQueue[0]);
      }
      this.setState({
        downloadQueue: newQueue,
      });
      console.error(error);
      conn.close();
    });
  }

  getFile(peer, peerId, fileId, fileSize) {
    console.log(`File size: ${fileSize}`);
    console.log(peer, peerId, fileId, fileSize);
    if (peer !== null) {
      const fileToDownload = { peer, peerId, fileId, fileSize, progress: 0 };
      if (this.state.downloadQueue.length === 0) {
        this.downloadFile(fileToDownload);
        this.setState({
          downloadQueue: [fileToDownload],
        });
      }
      // Don't add to queue
      /* else {
        this.setState({
          downloadQueue: [...this.state.downloadQueue, fileToDownload],
        });
      }*/
    }
  }

  handleDrop(event) {
    event.preventDefault();
    let files = null;
    if (event.dataTransfer.items) {
      files = [];
      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        if (event.dataTransfer.items[i].kind === 'file') {
          files.push(event.dataTransfer.items[i].getAsFile());
        }
      }
    } else {
      files = event.dataTransfer.files;
    }
    this.shareFiles(files, this.props.store.name);
    files.forEach((element) => {
      console.log('file.name = ' + element.name);
    });
  }

  shareFiles(files, name) {
    let newShared = [...this.state.shared];
    files.forEach((file) => {
      let newShare = { file, id: uuidv1() };
      newShared.push(newShare);
      axios
        .post(`/files/`, new FileInfo(name, file.name, newShare.id, file.size))
        .then(() => {
          this.fetchFilesInfo();
        });
    });
    this.setState({ shared: newShared });
  }

  fetchFilesInfo() {
    axios
      .get(`/files/`)
      .then((res) => {
        this.setState({ files: res.data, fetching: false });
        this.el.scrollIntoView(false, { behavior: 'smooth' });
      })
      .catch((error) => {
        console.log(`Got error: ${error}`);
        this.setState({ fetching: false, error });
      });
  }

  handleDragOver(event) {
    event.preventDefault();
  }

  render() {
    return (
      <Container onDrop={this.handleDrop} onDragOver={this.handleDragOver}>
        {/* {this.state.fetching ? <h1>'Fetching'</h1> : null} */}
        <PostList
          getFile={(pid, fid, fsize) =>
            this.getFile(this.props.store.peer, pid, fid, fsize)
          }
          files={this.state.files}
          id={this.props.store.id}
          download={this.state.downloadQueue[0] || null}
        />
        <DropDiv
          ref={(el) => {
            this.el = el;
          }}
        >
          Drop files to upload
        </DropDiv>
      </Container>
    );
  }
}

export default Share;
