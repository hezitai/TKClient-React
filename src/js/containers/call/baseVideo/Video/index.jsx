import React from "react";
import ServiceRoom from "ServiceRoom";
import TkConstant from "TkConstant";
import TkGlobal from "TkGlobal";
import eventObjectDefine from "eventObjectDefine";
import VideoDumb from "../../../../components/video/realVideo";
import { DragSource, DropTarget } from "react-dnd";
import Audiochange from "../../../from/Audiochange";

import VideoNameBar from "./VideoNameBar";
import VideoTrophyCup from "./VideoTrophyCup";
import VideoVolume from "./VideoVolume";
import UserNetworkDelay from "./UserNetworkDelay";

import './static/css/beyond.css';
import "./static/css/black.css";
import styled from "styled-components";
import {
  VideoLi,
  VideoHoverContainerDiv,
  ForegroundPicDiv,
  PointerReminderStatusDiv
} from "./styles/componentStyle";
//
// let studnum = 0;
const showHasUserCSS = props => {
    //
    

  let initClass = `video-wrap video-participant-wrap video-other-wrap add-position-relative `;
  initClass += `${
    !(props.user && props.user.hasvideo) ? "not-video-device " : ""
  } `;
  initClass += `${
    !(props.user && props.user.hasaudio) ? "not-audio-device " : ""
  } `;
  initClass += `${props.videoScaleClassName} `;
  initClass += `${TkGlobal.isOnlyAudioRoom ? "only-audio-bg " : ""} `;
  initClass += `${props.actionButtonArray.length !== 0 && TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE != props.user.publishstate ? "isHover " : ""}`;
  return initClass;
};
const showUserNoneCSS = () => {
//   let classNum = `studNum` + studnum;
//   console.error(classNum);
  let initClass = `video-wrap video-participant-wrap video-other-wrap add-position-relative `;
//   studnum ++;
  return `${initClass} user `;
};
class Video extends React.Component {
  constructor(props) {
    super(props);
    this.mouseMove = this.props.mouseMove;
    this.mouseDown = this.props.mouseDown;
    this.videoOnDoubleClick = this.props.videoOnDoubleClick;
      this.listernerBackupid= new Date().getTime()+'_'+Math.random();
  }

  render() {
    let { restoreDrag, isCanDrag, isDrag, user } = this.props;
    let videoScaleClassName = " video-scale4-3 ";
    if (
      Math.abs(TkGlobal.videoScale - 4 / 3) >
      Math.abs(TkGlobal.videoScale - 16 / 9)
    ) {
      //计算当前是否应该采用16/9的视频窗口样式
      videoScaleClassName = " video-scale16-9 ";
    }
    // studnum++;
    return (
        // console.error(this.props.user),
      <div
        className={
          //  +
            (Object.keys(this.props.user).length > 0
                ? showHasUserCSS(this.props)
                : showUserNoneCSS())+ `${this.props.isClassBegin? " classBegin " : ""} ${TkGlobal.classBegin && !TkConstant.hasRoomtype.oneToOne ? "oneToMore " : ""}`
            
        }
        id={
          this.props.user.id
            ? "videoContainer_" + this.props.user.id
            : undefined
        }
        // style={{height:(100/7)*(3/4) +'vw',width:100/7+ 'vw'}}
        style={{height:'100%',width:'100%'}}
      >
        {TkConstant.joinRoomInfo.pointerReminder &&
        this.props.direction === "horizontal" &&
        (this.props.user.role !== TkConstant.role.roleChairman &&
          this.props.user.role !== TkConstant.role.roleTeachingAssistant) &&
        (TkConstant.hasRole.roleChairman ||
          TkConstant.hasRole.roleTeachingAssistant) || true ? (
          <PointerReminderStatusDiv {...this.props}/>
        ) : (
          undefined
        )}
        {this.props.stream ? (
          <VideoDumb
            loader={this.props.loader}
            mode={this.props.mode}
            isMirror={
              ServiceRoom.getTkRoom() &&
              ServiceRoom.getTkRoom().getMySelf() &&
              this.props.isVideoMirror &&
              this.props.user.id &&
              this.props.user &&
              this.props.user.id === ServiceRoom.getTkRoom().getMySelf().id
            }
            user={Object.customAssign({}, this.props.user)}
            myUserId={
              ServiceRoom.getTkRoom() && ServiceRoom.getTkRoom().getMySelf()
                ? ServiceRoom.getTkRoom().getMySelf().id
                : undefined
            }
            changeVolumeJurisdiction={
              !(TK.isNative && TK.subscribe_from_native)
            }
            volume={
              ServiceRoom.getTkRoom() && ServiceRoom.getTkRoom().getMySelf()
                ? ServiceRoom.getTkRoom().getMySelf().volume
                : 100
            }
            stream={this.props.stream}
            videoDumbElementIdPrefix={this.props.videoDumbClassName}
          />
        ) : (
          undefined
        )}
        <div className="video-tools-box" onDoubleClick={isCanDrag && isDrag && TkConstant.joinRoomInfo.roomrole !== TkConstant.role.roleStudent ? restoreDrag : () => {}} >
          {this.props.isDoubleClick || this.props.isHasCloseBtn? (
            undefined
          ) : (
            <div className="v-name-wrap">
              <div className="text-wrap">
                <VideoNameBar
                  stream={this.props.stream}
                  user={this.props.user}
                />
                <VideoTrophyCup
                  stream={this.props.stream}
                  user={this.props.user}
                />
              </div>
            </div>
          )}

          {this.props.isDoubleClick || this.props.isHasCloseBtn ? (
            undefined
          ) : (
            <VideoVolume
              stream={this.props.stream}
              user={this.props.user}
              userInfoIconArray={this.props.userInfoIconArray}
            />
          )}

          {/* <UserNetworkDelay stream = {this.props.stream} /> */}
            {this.props.isDoubleClick || this.props.isHasCloseBtn ? undefined:(
              <VideoHoverContainerDiv  {...this.props}>
              <span className="button-set role-student">
                {this.props.actionButtonArray}
              </span>
            </VideoHoverContainerDiv>
            )}
          

          <div className={"background-mode-float" }  style={{display:(TkGlobal.classBegin || TkConstant.joinRoomInfo.isBeforeClassReleaseVideo) && this.props.user.isInBackGround ? "block" : "none"}}>
            <p className="background-mode-prompt">
              {this.props.user.role === TkConstant.role.roleChairman
                ? TkGlobal.language.languageData.otherVideoContainer.prompt
                    .userText
                : TkGlobal.language.languageData.otherVideoContainer.prompt
                    .text}
            </p>
          </div>

          <ForegroundPicDiv {...this.props} />
        </div>
      </div>
    );
  }
}

export default Video;
