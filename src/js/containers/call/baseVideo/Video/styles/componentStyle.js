import React from "react";
import styled from "styled-components";
import TkGlobal from "TkGlobal";
import TkConstant from "TkConstant";

const VideoLi = styled.li.attrs({
  className: `video-permission-container clear-float`
});

const VideoHoverContainerDiv = styled.div.attrs({
  className: "video-hover-function-container"
})`
  display: ${props =>
    (props.actionButtonArray && props.actionButtonArray.length === 0) ||
    props.isCanDrag
      ? "none"
      : undefined};
`;
/*const BackgroundModeFloatDiv = styled.div.attrs({
  className: "background-mode-float"
});*/

const ForegroundPicDiv = styled.div.attrs({
  className: "foregroundpic-container"
})`
&&&&&&{ 
  display: ${props =>
    TkConstant.hasRole.roleStudent &&
    TkConstant.joinRoomInfo.foregroundpic &&
    props.foregroundpicUrl &&
    props.pictureInPictureClassname
      ? "block"
      : "none"};
  }
  background-image: ${props =>
    TkConstant.hasRole.roleStudent &&
    TkConstant.joinRoomInfo.foregroundpic &&
    props.foregroundpicUrl &&
    props.pictureInPictureClassname
      ? "url(" + props.foregroundpicUrl + ")"
      : undefined};
`;

const PointerReminderStatusDiv = styled.div.attrs({
  className: "pointerReminder-status"
})`
  display: ${props => props.user.pointerstate ? "block" : "none"}
`

export {
  VideoLi,
  VideoHoverContainerDiv,
  ForegroundPicDiv,
  PointerReminderStatusDiv
};
