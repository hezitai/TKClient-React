/**
 * 网络延迟状态 模块
 * @module UserNetworkDelay
 * @description   提供 Video组件
 * @author mlh
 * @date 2018/11/20
 */

import React from "react";
import styled from "styled-components";
import eventObjectDefine from "eventObjectDefine";
import ServiceRoom from "ServiceRoom";

import TkGlobal from "TkGlobal";
import TkConstant from "TkConstant";

const UserNetworkDelayDiv = styled.div.attrs({
  className: "user-network-delay"
})`
  color: ${props => props.networkDelayColor};
  display: ${props =>
    TkGlobal.classBegin && props.hasNetworkState ? "none" : "none"};
`;

const UserNetworkDotSpan = styled.span.attrs({
  className: "user-network-dot"
})`
  backgroundcolor: ${props => props.networkDelayColor};
`;

class UserNetworkDelay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      networkDelay: 0,
      networkDelayColor: "#41BF33",
      hasNetworkState: true
    };
    this.listernerBackupid = new Date().getTime() + "_" + Math.random();
  }

  componentDidMount() {
    eventObjectDefine.CoreController.addEventListener(
      TkConstant.EVENTTYPE.RoomEvent.roomUsernetworkstateChanged,
      this.UsernetworkstateChanged.bind(this),
      this.listernerBackupid
    );
  }

  componentWillUnmount() {
    //组件被移除之前被调用，可以用于做一些清理工作
    eventObjectDefine.CoreController.removeBackupListerner(
      this.listernerBackupid
    );
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.stream !== prevProps.stream &&
      this.props.stream === undefined &&
      this.hasNetworkState
    ) {
      this.setState({
        hasNetworkState: false,
        networkDelay: 0,
        networkDelayColor: "#41BF33"
      });
    } else if (
      this.props.stream !== prevProps.stream &&
      prevProps.stream === undefined &&
      this.props.stream !== undefined &&
      !this.hasNetworkState
    ) {
      this.setState({
        hasNetworkState: true
      });
    }
  }

  UsernetworkstateChanged(recvEventData) {
    const { message } = recvEventData;
    if (message.userId === ServiceRoom.getTkRoom().getMySelf().id) {
      const { networkStatus } = message;
      const { packetsLost, currentDelay } =
        networkStatus.audio || networkStatus.video;
      this.state.networkDelay = currentDelay;
      if (packetsLost > 5 && packetsLost <= 10) {
        this.state.networkDelayColor = "#ff8b2b";
      } else if (packetsLost > 10) {
        this.state.networkDelayColor = "#ff021d";
      } else {
        this.state.networkDelayColor = "#41BF33";
      }
      this.setState({
        networkDelay: this.state.networkDelay,
        networkDelayColor: this.state.networkDelayColor,
        hasNetworkState: true
      });
    }
  }

  render() {
    return (
      <UserNetworkDelayDiv
        networkDelayColor={this.state.networkDelayColor}
        hasNetworkState={this.state.hasNetworkState}
      >
        <UserNetworkDotSpan networkDelayColor={this.state.networkDelayColor} />
        <span className="user-network-delay-num">
          {this.state.networkDelay + "ms"}
        </span>
      </UserNetworkDelayDiv>
    );
  }
}

export default UserNetworkDelay;
