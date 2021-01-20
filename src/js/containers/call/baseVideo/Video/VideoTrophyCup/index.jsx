import React from "react";
import styled from "styled-components";

const VideoTrophyCupDiv = styled.div`
  display: ${props =>
    props.stream && props.user.role === TkConstant.role.roleStudent
      ? undefined
    : "none !important"};
`;

export default class VideoTrophyCup extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { stream, user } = this.props;
    return (
      <VideoTrophyCupDiv className="gift-show-container" stream = {stream} user= {user}>
        <span className="gift-icon" />
        <span className="gift-num">{user.giftnumber || 0}</span>
      </VideoTrophyCupDiv>
    );
  }
}
