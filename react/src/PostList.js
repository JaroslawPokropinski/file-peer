import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import humanFileSize from './humanBytes';
import downloadImg from './download.png';

const List = styled.ul`
  text-align: left;
  list-style: none;
  background: var(--primary-color);
  padding: 40px;
  margin: 0;
`;

const ListElement = styled.li`
  display: block;
  color: white;
`;

const Header = styled.div`
  margin-top: 12px;
`;

const Name = styled.span`
  font-weight: bold;
  margin-right: 8px;
`;

const StyledDate = styled.span`
  color: var(--secondary-color);
`;

const StyledFile = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  padding: 8px;
  background-color: var(--background-color);
  border-radius: 4px;
`;

const Img = styled.img`
  height: 2em;
  float: right;
  cursor: pointer;
  padding: 4px;
  border-radius: 2px;
  background-color: var(--secondary-color2);
`;

const FileSize = styled.div`
  color: white;
`;

const Info = styled.div`
  /* width: 50%; */
`;

function DownloadButton(props) {
  if (!props.file.valid || props.file.ownerId === props.id) {
    return null;
  }
  return (
    <Img
      src={downloadImg}
      alt={'Download'}
      onClick={() =>
        props.getFile(props.file.ownerId, props.file.id, props.file.size)
      }
    />
  );
}

const ProgressContainer = styled.div`
  height: 1.4em;
  margin-bottom: 0.5em;
  overflow: hidden;
  background-color: #e5e5e5;
  border-radius: 0.0725em;
  text-align: center;
`;

const ProgressBarStyle = styled.div`
  float: left;
  width: ${(props) => props.progress}%;
  height: 100%;
  color: #ffffff;
  background-color: #0088cc;
  box-sizing: border-box;
`;

function ProgressBar(props) {
  if (props.download && props.file.id === props.download.fileId) {
    const proc =
      Math.round(
        ((props.download.progress * 100.0) / props.download.fileSize) * 100
      ) / 100;
    return (
      <ProgressContainer>
        <ProgressBarStyle progress={proc}>
          Downloaded: {humanFileSize(props.download.progress)} of{' '}
          {humanFileSize(props.download.fileSize)} ({proc})%
        </ProgressBarStyle>
      </ProgressContainer>
    );
  }
  return null;
}

class PostList extends React.Component {
  getDate(rawDate) {
    return moment(rawDate).format('DD/MM/YYYY, H:mm:ss');
  }
  render() {
    return (
      <List>
        {this.props.files.map((file, index) => {
          return (
            <ListElement key={index}>
              <Header>
                <Name>{file.owner}</Name>
                <StyledDate>
                  {this.getDate(file.date)} {file.ownerId}
                </StyledDate>
              </Header>
              <StyledFile>
                <Info>
                  {file.name}
                  <FileSize>{humanFileSize(file.size)}</FileSize>
                </Info>
                <DownloadButton
                  getFile={this.props.getFile}
                  file={file}
                  id={this.props.id}
                />
              </StyledFile>
              <ProgressBar file={file} download={this.props.download} />
            </ListElement>
          );
        })}
      </List>
    );
  }
}

export default PostList;
