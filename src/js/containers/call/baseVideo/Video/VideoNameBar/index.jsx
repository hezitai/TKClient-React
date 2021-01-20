import React from "react";
import styled from "styled-components";

const VideoNameBarSpan = styled.span`
  display: ${props => (props.stream ? undefined : "none")};
`;
export default class VideoNameBar extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { stream, user } = this.props;
    return (
      <VideoNameBarSpan
        stream={stream}
        className={"v-name add-nowrmp add-fl user-select-none "}
      >
        <label>{user.nickname}</label>
      </VideoNameBarSpan>
    );
  }
}
