import React from "react";
import TkGlobal from "TkGlobal";
import TkConstant from "TkConstant";
import {
  VideoLi,
  UserNetworkDelayDiv,
  UserNetworkDotSpan,
  VideoHoverContainerDiv,
  ForegroundPicDiv,
  BackgroundModeFloatDiv,
  PointerReminderStatusDiv
} from "./styles/componentStyle";


let initClass = `video-wrap video-participant-wrap video-other-wrap add-position-relative `;
const showHasUserCSS = props => {
  initClass += `${
    !(props.user && props.user.hasvideo) ? "not-video-device " : ""
  } `;
  initClass += `${
    !(props.user && props.user.hasaudio) ? "not-audio-device " : ""
  } `;
  initClass += `${TkGlobal.classBegin ? " classBegin " : ""} `;
  initClass += `${props.videoScaleClassName} `;
  initClass += `${TkGlobal.isOnlyAudioRoom ? "only-audio-bg " : ""} `;
  initClass += `${props.actionButtonArray.length !== 0 ? "isHover " : ""}`;
  return initClass;
};
const showUserNoneCSS = ` ${initClass} user `;

function ShowDeviceHOC(WrappedComponent) {
  return class VideoClass extends React.Component {
    render() {
      return (
        <div
          className={
            Object.keys(this.props.user).length > 0
              ? showHasUserCSS(this.props)
              : showUserNoneCSS
          }
          id={
            this.props.user.id
              ? "videoContainer_" + this.props.user.id
              : undefined
          }
        >
          <WrappedComponent {...this.props} />
        </div>
      );
    }
  };
}

export { ShowDeviceHOC };
