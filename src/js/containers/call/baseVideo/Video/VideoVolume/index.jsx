import React from "react";
import styled from "styled-components";
import TkConstant from "TkConstant";
import Audiochange from "../../../../from/Audiochange";

class VideoVolume extends React.Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { stream, user, userInfoIconArray } = this.props;
    return (
      <div className="device-wrap">
        {(user.publishstate ===
          TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY ||
          user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH) &&
        user.hasaudio ? (
          <div className="Audiochangew">
            {<div className="Audiochangewlogo" />}
            {stream ? <Audiochange user={user} stream={stream} /> : null}
          </div>
        ) : (
          <div className="audio_close_icon" />
        )}
        <span className="v-device-open-close">{userInfoIconArray}</span>
      </div>
    );
  }
}

export default VideoVolume;
