/**
 * CommonVideoSmart 组件
 * @module CommonVideoSmart
 * @description   提供 CommonVideoSmart组件
 * @author xiagd
 * @date 2017/12/13
 */

"use strict";
import React from "react";
import ReactDOM from "react-dom";
import ServiceRoom from "ServiceRoom";
import TkConstant from "TkConstant";
import CoreController from "CoreController";
import ServiceSignalling from "ServiceSignalling";
import eventObjectDefine from "eventObjectDefine";
import TkGlobal from "TkGlobal";
import WebAjaxInterface from "WebAjaxInterface";
import VideoDumb from "../../../components/video/realVideo";
import { DragSource, DropTarget } from "react-dnd";
import Audiochange from "../../from/Audiochange";
import ServiceTooltip from "ServiceTooltip";
import TkUtils from "TkUtils";
import ReactDrag from "reactDrag";
import Video from "./Video";
import { Box } from "reflexbox";

const specSource = {
  beginDrag(props, monitor, component) {
    const { id, percentLeft, percentTop, isDrag } = props;
    return { id, percentLeft, percentTop, isDrag };
  },
  canDrag(props, monitor) {
    const { id, hasDragJurisdiction, isHasCloseBtn } = props;
    if (
      !hasDragJurisdiction ||
      (TkConstant.hasRole.roleStudent && !props.isDrag) ||
      TkGlobal.isVideoStretch ||

      TkGlobal.isVideoInFullscreen || TkGlobal.isVideoDrag ||
      isHasCloseBtn
    ) {
      //视频没有拽出并且是学生，或者寻课，或者没有上课，或者是视频拉伸，则不能拖拽
      return false;
    } else {
      return true;
    }
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
    isCanDrag: monitor.canDrag(),
    getItem: monitor.getItem()
  };
}

const specTarget = {
  drop(props, monitor, component) {
    let dragFinishEleCoordinate = monitor.getSourceClientOffset(); //拖拽后鼠标相对body的位置
    const item = monitor.getItem(); //拖拽的元素信息
    let { id } = item;
    const defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
    let dragEle = document.getElementById(id); //拖拽的元素
    let dragEleW = dragEle.clientWidth;
    let dragEleH = dragEle.clientHeight;
    let boundId = "lc-full-vessel";
    if (TkGlobal.areaExchangeFlag) {
      let roomUers = ServiceRoom.getTkRoom().getUsers(); // N： 因为上台的用户并且是1V1情况下才会走到这里
      if (TkConstant.hasRole.roleChairman) {
        for (let [key, value] of Object.entries(roomUers)) {
          if (value.role === TkConstant.role.roleStudent) {
            boundId = value.id;
          }
        }
      } else if (TkConstant.hasRole.roleStudent) {
        for (let [key, value] of Object.entries(roomUers)) {
          if (value.role === TkConstant.role.roleChairman) {
            boundId = value.id;
          }
        }
      }
    }
    let content =
      document.getElementById(boundId) ||
      document.getElementById("lc-full-vessel"); //白板拖拽区域
    let contentW = content.clientWidth;
    let contentH = content.clientHeight;
    /*拖拽元素不能拖出白板区*/
    let dragEleOffsetLeft = dragFinishEleCoordinate.x;
    let dragEleOffsetTop = dragFinishEleCoordinate.y;
    let dragEleLeft, dragEleTop;
    if (TkGlobal.mainContainerFull || TkGlobal.isVideoInFullscreen) {
      //如果白板区全屏
      if (dragEleOffsetLeft < 0) {
        dragEleOffsetLeft = 0;
      } else if (dragEleOffsetLeft > contentW - dragEleW) {
        dragEleOffsetLeft = contentW - dragEleW;
      }
      if (dragEleOffsetTop < 0) {
        dragEleOffsetTop = 0;
      } else if (dragEleOffsetTop > contentH - dragEleH) {
        dragEleOffsetTop = contentH - dragEleH;
      }
      /*计算位置百分比*/
      dragEleLeft = dragEleOffsetLeft / (contentW - dragEleW);
      dragEleTop = dragEleOffsetTop / (contentH - dragEleH);
    } else {
      //白板区没有全屏
      if (dragEleOffsetLeft < TkGlobal.dragRange.left * defalutFontSize) {
        dragEleOffsetLeft = TkGlobal.dragRange.left * defalutFontSize;
      } else if (
        dragEleOffsetLeft >
        TkGlobal.dragRange.left * defalutFontSize + contentW - dragEleW
      ) {
        dragEleOffsetLeft =
          TkGlobal.dragRange.left * defalutFontSize + contentW - dragEleW;
      }
      if (dragEleOffsetTop < TkGlobal.dragRange.top * defalutFontSize) {
        dragEleOffsetTop = TkGlobal.dragRange.top * defalutFontSize;
      } else if (
        dragEleOffsetTop >
        TkGlobal.dragRange.top * defalutFontSize + contentH - dragEleH
      ) {
        dragEleOffsetTop =
          TkGlobal.dragRange.top * defalutFontSize + contentH - dragEleH;
      }
      /*计算位置百分比*/
      dragEleLeft =
        (dragEleOffsetLeft - TkGlobal.dragRange.left * defalutFontSize) /
        (contentW - dragEleW);
      dragEleTop =
        (dragEleOffsetTop - TkGlobal.dragRange.top * defalutFontSize) /
        (contentH - dragEleH);
    }
    dragEleLeft =
      isNaN(dragEleLeft) || dragEleLeft === Infinity || dragEleLeft === null
        ? 0
        : dragEleLeft;
    dragEleTop =
      isNaN(dragEleTop) || dragEleTop === Infinity || dragEleTop === null
        ? 0
        : dragEleTop;
    let dragEleStyle = {
      //相对白板区位置的百分比
      percentTop: dragEleTop,
      percentLeft: dragEleLeft,
      isDrag: true
    };
    eventObjectDefine.CoreController.dispatchEvent({
      //自己本地和通知别人改变拖拽的video位置
      type: "changeOtherVideoStyle",
      message: {
        data: { style: dragEleStyle, id: id, item: item },
        initiative: true
      }
    });
  },
  canDrop(props, monitor) {
    //拖拽元素不能拖出白板区
    let { isDrag } = props;
    if (isDrag) {
      return true;
    } else {
      return false;
    }
  }
};

class CommonVideoSmart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isVideoMirror:
        L.Utils.localStorage.getItem("isVideoMirror") &&
        L.Utils.localStorage.getItem("isVideoMirror") !== "false"
          ? L.Utils.localStorage.getItem("isVideoMirror")
          : false,
      updateState: false,
      customTrophyShow: false,
      areaExchangeFlag: false,
      areastyle: {},
      areaExchangeBtn: false,
      isOnlyAudioRoom: false,
      loader: false,
      mode: TK_VIDEO_MODE.ASPECT_RATIO_COVER,
      isMediaClassName: false,
      // isDoubleClick:false   //是否双击视频
    };
    this.lastVideoDragStyle = {}; //保存拉伸视频前一次的位置百分比
    this.listernerBackupid = new Date().getTime() + "_" + Math.random();
    this.maxVideoNumber = undefined;
    this.moveVideoTargetArr = []
  }

  componentDidMount() {
    //真实的DOM被渲染出来后调用
    let { id } = this.props;
     //room-userproperty-changed事件-收到参与者属性改变后执行更新
    eventObjectDefine.CoreController.addEventListener(
      TkConstant.EVENTTYPE.RoomEvent.roomUserpropertyChanged,
      this.handlerRoomUserpropertyChanged.bind(this),
      this.listernerBackupid
    );
    eventObjectDefine.CoreController.addEventListener(
      id + "_mouseMove",
      this.videoChangeSize.bind(this),
      this.listernerBackupid
    );
    eventObjectDefine.CoreController.addEventListener(
      id + "_mouseUp",
      this.videoMouseUp.bind(this),
      this.listernerBackupid
    );
    eventObjectDefine.CoreController.addEventListener(
      "videoMirroring",
      this.videoMirroringHandle.bind(this),
      this.listernerBackupid
    );
    eventObjectDefine.CoreController.addEventListener(
      "isOnlyAudioRoom",
      this.isOnlyAudioRoomHandle.bind(this),
      this.listernerBackupid
    );
    eventObjectDefine.CoreController.addEventListener(
      "receiveWhiteboardSDKAction",
      this.handlerReceiveWhiteboardSDKAction.bind(this),
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
    //每次render结束后会触发

    if (prevState.areaExchangeFlag !== this.state.areaExchangeFlag) {
      ServiceRoom.getTkWhiteBoardManager().updateWhiteboardSize();
      ServiceRoom.getTkWhiteBoardManager().updateWhiteboardSize(
        "videoDrawBoard"
      );
      eventObjectDefine.CoreController.dispatchEvent({ type: "resizeHandler" });
    }
    if (
      this.props.BottomVesselSmartStyleJson !==
        prevProps.BottomVesselSmartStyleJson &&
      this.state.areaExchangeFlag
    ) {
      let height = this.props.BottomVesselSmartStyleJson.height;
      let areastyle = {
        position: "fixed",
        top: ".38rem",
        left: ".5rem",
        height: "calc(100%" + " - " + height + " - " + "0.48rem)",
        width: "calc(100% - 4.4rem)"
      };
      this.setState({ areastyle: areastyle });
    }
  }
  
  handlerReceiveWhiteboardSDKAction(recvEventData) {
    switch (recvEventData.message.action) {
      case "mediaPlayerNotice":
        if (
          recvEventData.message.cmd.playerType === "videoPlayer" ||
          recvEventData.message.cmd.playerType === "audioPlayer"
        ) {
          if (recvEventData.message.cmd.type === "end") {
            this.setState({
              isMediaClassName: false
            });
          } else {
            this.setState({
              isMediaClassName: true
            });
          }
        }
        break;
    }
  }


  /*处理room-userproperty-changed事件*/
  handlerRoomUserpropertyChanged(roomUserpropertyChangedEventData) {
    if (
      this.props.stream &&
      this.props.stream.extensionId === roomUserpropertyChangedEventData.userId
    ) {
      this.setState({
        updateState: !this.state.updateState
      });
    } else {
      if (
        roomUserpropertyChangedEventData.message &&
        roomUserpropertyChangedEventData.message.volume !== undefined
      ) {
        this.setState({
          updateState: !this.state.updateState
        });
      }
    }
  }

  isOnlyAudioRoomHandle(){
      this.forceUpdate();
  }
  /*改变用户的画笔权限*/
  changeUserCandraw(user, isCandraw) {
    ServiceSignalling.changeUserCandraw(user);
  }

  /*用户功能-上下讲台信令的发送*/
  userPlatformUpOrDown(user, userRole) {
    ServiceSignalling.userPlatformUpOrDown(user);
  }

  /*用户功能-打开关闭音频*/
  userAudioOpenOrClose(user) {
    ServiceSignalling.userAudioOpenOrClose(user);
  }

  /*用户功能-打开关闭视频*/
  userVideoOpenOrClose(user) {
    ServiceSignalling.userVideoOpenOrClose(user);
  }

  /*恢复拖拽位置*/
  restoreVideoDrag() {
    let { id, isDrag } = this.props;
    if (isDrag) {
      if (
        this.props.initOtherVideoDragByUserid &&
        typeof this.props.initOtherVideoDragByUserid === "function"
      ) {
        this.props.initOtherVideoDragByUserid(id);
      }
    }
  }

  //给学生发送礼物
  sendGiftToStudent(user) {
    if (
      user &&
      CoreController.handler.getAppPermissions("giveAloneUserSendGift")
    ) {
      let userIdJson = {};
      if (user.role === TkConstant.role.roleStudent) {
        //如果是学生，则发送礼物
        let userId = user.id;
        let userNickname = user.nickname;
        userIdJson[userId] = userNickname;

        if ( TkConstant.joinRoomInfo.customTrophys && TkConstant.joinRoomInfo.customTrophys.length > 1 && TkConstant.joinRoomInfo.customTrophysVoice) {
          eventObjectDefine.CoreController.dispatchEvent({
            type: "loadCustomTrophyItem",
            message: { type: "one", userIdJson: userIdJson }
          });
        } else {
          if ( TkConstant.joinRoomInfo.customTrophys && TkConstant.joinRoomInfo.customTrophys.length == 1 ) {
            let customTrophysOne = {
              trophyname: TkConstant.joinRoomInfo.customTrophys[0].trophyname,
              trophyeffect:
                TkConstant.joinRoomInfo.customTrophys[0].trophyeffect,
              trophyimg: TkConstant.joinRoomInfo.customTrophys[0].trophyimg,
              trophyvoice: TkConstant.joinRoomInfo.customTrophys[0].trophyvoice
            };
            WebAjaxInterface.sendGift(userIdJson, customTrophysOne);
          } else {
            WebAjaxInterface.sendGift(userIdJson);
          }
        }
      }
    }
  }

  /*根据是否正在拖拽显示或隐藏ppt上的浮层*/
  layerIsShowOfIsDraging(isDragging, isVideoStretch, getItem) {
    let { id } = this.props;
    if (isDragging || isVideoStretch) {
      let mainContentLayer = document.getElementById("mainContentLayer");
      if (mainContentLayer) {
        mainContentLayer.style.display = "block";
      }
    } else {
      if (getItem === null || (getItem && getItem.id === id)) {
        let mainContentLayer = document.getElementById("mainContentLayer");
        if (mainContentLayer) {
          mainContentLayer.style.display = "none";
        }
      }
    }
  }

  handlerAreaExchange(user) {
    let areaExchangeFlag = !this.state.areaExchangeFlag;
    eventObjectDefine.CoreController.dispatchEvent({
      //本地区域交换
      type: "areaExchange",
      message: {
        hasExchange: areaExchangeFlag,
        user: user
      }
    });
    TkGlobal.areaExchangeFlag = areaExchangeFlag;
    this.setState({
      areaExchangeFlag: areaExchangeFlag
    });
  }

  /*一键还原的函数*/
  handlerOneKeyReset() {
    eventObjectDefine.CoreController.dispatchEvent({
      //初始化视频框的位置（拖拽和分屏）
      type: "oneKeyRecovery",
      message: {}
    });
  }

  /*缩放后发送位置*/
  sendDragOfChangeVideoSize(id) {
    const defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
    let dragEle = document.getElementById(id); //拖拽的元素
    let dragEleW = dragEle.clientWidth;
    let dragEleH = dragEle.clientHeight;
    let content = document.getElementById("lc-full-vessel"); //白板拖拽区域
    let contentW = content.clientWidth;
    let contentH = content.clientHeight;
    /*计算位置百分比*/
    let dragEleLeft =
      (dragEle.offsetLeft - TkGlobal.dragRange.left * defalutFontSize) /
      (contentW - dragEleW);
    let dragEleTop =
      (dragEle.offsetTop - TkGlobal.dragRange.top * defalutFontSize) /
      (contentH - dragEleH);
    // dragEleLeft = (isNaN(dragEleLeft) || dragEleLeft === Infinity || dragEleLeft === null)?0:dragEleLeft;
    // dragEleTop = (isNaN(dragEleTop) || dragEleTop === Infinity || dragEleTop === null)?0:dragEleTop;
    if (contentW === dragEleW) {
      dragEleLeft = this.lastVideoDragStyle
        ? this.lastVideoDragStyle.percentLeft
        : 0;
    } else if (isNaN(dragEleLeft) || dragEleLeft === null) {
      dragEleLeft = 0;
    }
    if (contentH === dragEleH) {
      dragEleTop = this.lastVideoDragStyle
        ? this.lastVideoDragStyle.percentTop
        : 0;
    } else if (isNaN(dragEleTop) || dragEleTop === null) {
      dragEleTop = 0;
    }
    let dragEleStyle = {
      //相对白板区位置的百分比
      percentTop: dragEleTop,
      percentLeft: dragEleLeft,
      isDrag: true
    };
    eventObjectDefine.CoreController.dispatchEvent({
      //自己本地和通知别人改变拖拽的video位置
      type: "changeOtherVideoStyle",
      message: { data: { style: dragEleStyle, id: id }, initiative: true }
    });
  }

  /*鼠标在视频框上按下时*/
  mouseDown(event) {
    if (!CoreController.handler.getAppPermissions("isChangeVideoSize")) {
      return;
    }
    let {
      id,
      isDrag,
      percentLeft,
      percentTop,
      videoWidth,
      videoHeight
    } = this.props;
    if (isDrag) {
      const defalutFontSize =
        TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
      const videoWidthPX = videoWidth * defalutFontSize;
      const videoHeightPX = videoHeight * defalutFontSize;
      //获取视频框相对白板的位置：
      let { videoLeft, videoTop } = this._percentageChangeToRem(
        percentLeft,
        percentTop,
        videoWidthPX,
        videoHeightPX
      );
      //获取视频框相对body的位置：
      let videoLeftOfbody =
        (videoLeft + TkGlobal.dragRange.left) * defalutFontSize;
      let videoTopOfbody =
        (videoTop + TkGlobal.dragRange.top) * defalutFontSize;
      //获取鼠标相对body的位置：
      let mouseLeft = event.pageX;
      let mouseTop = event.pageY;
      // let videoWidthPX = videoWidth * defalutFontSize
      // let videoHeightPX = videoHeight * defalutFontSize
      //根据鼠标按下的位置判断是否可以拉伸：
      if (
        mouseLeft >= videoLeftOfbody + videoWidthPX - 7 &&
        mouseLeft < videoLeftOfbody + videoWidthPX &&
        (mouseTop >= videoTopOfbody &&
          mouseTop < videoTopOfbody + videoHeightPX - 7)
      ) {
        TkGlobal.isVideoStretch = true; //是否是拉伸
        TkGlobal.changeVideoSizeMouseUpEventName = id + "_mouseUp";
      } else if (
        mouseTop >= videoTopOfbody + videoHeightPX - 7 &&
        mouseTop < videoTopOfbody + videoHeightPX &&
        (mouseLeft >= videoLeftOfbody &&
          mouseLeft < videoLeftOfbody + videoWidthPX - 7)
      ) {
        TkGlobal.isVideoStretch = true; //是否是拉伸
        TkGlobal.changeVideoSizeMouseUpEventName = id + "_mouseUp";
      } else if (
        mouseTop < videoTopOfbody + videoHeightPX &&
        mouseTop >= videoTopOfbody + videoHeightPX - 7 &&
        (mouseLeft < videoLeftOfbody + videoWidthPX &&
          mouseLeft >= videoLeftOfbody + videoWidthPX - 7)
      ) {
        TkGlobal.isVideoStretch = true; //是否是拉伸
        TkGlobal.changeVideoSizeMouseUpEventName = id + "_mouseUp";
      }
      this.lastVideoDragStyle = {
        //保存拉伸视频前一次的位置百分比
        percentLeft: percentLeft,
        percentTop: percentTop
      };
    }
  }

  /*鼠标在白板区抬起时*/
  videoMouseUp(handleData) {
    let { id, isDrag } = this.props;
    if (isDrag) {
      let event = handleData.message.data.event;
      if (TkGlobal.isVideoStretch === true) {
        if (
          this.props.sendSignallingOfVideoSize &&
          typeof this.props.sendSignallingOfVideoSize === "function"
        ) {
          this.props.sendSignallingOfVideoSize(); //发送缩放信令
          this.sendDragOfChangeVideoSize(id); //缩放后发送位置信令
        }
        this.lastVideoDragStyle = {
          //初始化鼠标按下时保存的百分比
          percentLeft: 0,
          percentTop: 0
        };
        TkGlobal.isVideoStretch = false; //是否是拉伸
        this.layerIsShowOfIsDraging(false, TkGlobal.isVideoStretch);
        event.onmousemove = null;
        event.target.style.cursor = ""; //在页面上鼠标的样式初始化
        TkGlobal.changeVideoSizeEventName = null; //在页面上鼠标移动时触发的事件名制空
        TkGlobal.changeVideoSizeMouseUpEventName = null; //在页面上鼠标抬起时触发的事件名制空
        this.setState({ updateState: !this.state.updateState }); //强制render
      }
    }
  }

  /*鼠标在白板区移动时*/
  videoChangeSize(handleData) {
    let event = handleData.message.data.event;
    let {
      id,
      isDrag,
      percentLeft,
      percentTop,
      videoWidth,
      videoHeight
    } = this.props;
    if (isDrag) {
      const defalutFontSize =
        TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
      //获取视频框相对body的位置：
      const videoWidthPX = videoWidth * defalutFontSize;
      const videoHeightPX = videoHeight * defalutFontSize;
      let { videoLeft, videoTop } = this._percentageChangeToRem(
        percentLeft,
        percentTop,
        videoWidthPX,
        videoHeightPX
      );
      let videoLeftOfbody =
        (videoLeft + TkGlobal.dragRange.left) * defalutFontSize;
      let videoTopOfbody =
        (videoTop + TkGlobal.dragRange.top) * defalutFontSize;
      //获取鼠标相对body的位置：
      let mouseLeft = event.pageX;
      let mouseTop = event.pageY;
      //改变鼠标的样式
      if (!TkGlobal.isVideoStretch) {
        if (
          mouseLeft >= videoLeftOfbody + videoWidthPX - 7 &&
          mouseLeft <= videoLeftOfbody + videoWidthPX &&
          (mouseTop >= videoTopOfbody &&
            mouseTop < videoTopOfbody + videoHeightPX - 7)
        ) {
          event.target.style.cursor = "w-resize";
          this.stretchDirection = "w";
          if (!this.moveVideoTargetArr.includes(event.target)) {
            this.moveVideoTargetArr.push(event.target);
          }
        } else if (
          mouseTop >= videoTopOfbody + videoHeightPX - 7 &&
          mouseTop <= videoTopOfbody + videoHeightPX &&
          (mouseLeft >= videoLeftOfbody &&
            mouseLeft < videoLeftOfbody + videoWidthPX - 7)
        ) {
          event.target.style.cursor = "s-resize";
          this.stretchDirection = "s";
          if (!this.moveVideoTargetArr.includes(event.target)) {
            this.moveVideoTargetArr.push(event.target);
          }
        } else if (
          mouseTop < videoTopOfbody + videoHeightPX &&
          mouseTop >= videoTopOfbody + videoHeightPX - 7 &&
          (mouseLeft < videoLeftOfbody + videoWidthPX &&
            mouseLeft >= videoLeftOfbody + videoWidthPX - 7)
        ) {
          event.target.style.cursor = "se-resize";
          this.stretchDirection = "se";
          if (!this.moveVideoTargetArr.includes(event.target)) {
            this.moveVideoTargetArr.push(event.target);
          }
        } else {
          this.initVideoCursorStyle()
        }
      } else {
        this.initVideoCursorStyle()
      }
      //改变视频框的大小
      let newVideoWidth, newVideoHeight;
      if (
        TkGlobal.isVideoStretch &&
        (this.stretchDirection === "w" || this.stretchDirection === "se")
      ) {
        newVideoWidth = Math.abs(mouseLeft - videoLeftOfbody) / defalutFontSize;
        newVideoHeight = newVideoWidth / TkGlobal.videoScale;
        if (
          mouseLeft < TkGlobal.dragRange.left * defalutFontSize ||
          mouseLeft < videoLeftOfbody
        ) {
          newVideoWidth = (this.props.initVideoWidth * window.GLOBAL.windowInnerWidth) / 100 / defalutFontSize;
          newVideoHeight = newVideoWidth / TkGlobal.videoScale;
        }
        if (
          this.props.changeVideoSize &&
          typeof this.props.changeVideoSize === "function"
        ) {
          this.props.changeVideoSize(newVideoWidth, newVideoHeight, id);
        }
      } else if (TkGlobal.isVideoStretch && this.stretchDirection === "s") {
        newVideoHeight = Math.abs(mouseTop - videoTopOfbody) / defalutFontSize;
        newVideoWidth = newVideoHeight * TkGlobal.videoScale;
        if (
          mouseTop < TkGlobal.dragRange.top * defalutFontSize ||
          mouseTop < videoTopOfbody
        ) {
          newVideoWidth =  (this.props.initVideoWidth * window.GLOBAL.windowInnerWidth) / 100 / defalutFontSize;
          newVideoHeight = newVideoWidth / TkGlobal.videoScale;
        }
        if (
          this.props.changeVideoSize &&
          typeof this.props.changeVideoSize === "function"
        ) {
          this.props.changeVideoSize(newVideoWidth, newVideoHeight, id);
        }
      }
    }
  }

  /*初始化视频上的鼠标样式*/
  initVideoCursorStyle() {
    this.moveVideoTargetArr.forEach((moveVideoTarget, index) => {
      moveVideoTarget.style.cursor = "";
    })
    this.moveVideoTargetArr = []
  }

  /*鼠标在视频框上移动时*/
  mouseMove() {
    if (!CoreController.handler.getAppPermissions("isChangeVideoSize")) {
      return;
    }
    let { id, isDrag } = this.props;
    if (
      TkGlobal.changeVideoSizeEventName !== id + "_mouseMove" &&
      TkGlobal.changeVideoSizeMouseUpEventName !== id + "_mouseUp" &&
      !TkGlobal.isVideoStretch &&
      isDrag
    ) {
      TkGlobal.changeVideoSizeEventName = id + "_mouseMove"; //以id作为改变视频大小事件的名字
      TkGlobal.changeVideoSizeMouseUpEventName = id + "_mouseUp";
    }
  }

  _getUser(userid) {
    let user = undefined;
    if (ServiceRoom.getTkRoom()) {
      user = ServiceRoom.getTkRoom().getUser(userid); /* NN：台上用戶*/
    }
    return user;
  }

  _loadStreamInfo(stream) {
    let user = undefined,
      afterElementArray = [];
    if (stream && stream.extensionId !== undefined && ServiceRoom.getTkRoom()) {
      user = this._getUser(stream.extensionId);
    }
    return {
      user,
      afterElementArray
    };
  }

  _loadUserInfoIconArray(user) {
    let that = this;
    let userInfoIconArray = [];
    /*if( user.role === TkConstant.role.roleChairman){
        return userInfoIconArray ;
        }*/
    let userInfoIconDesc = [
      {
        disabled: true,
        isShow: user.raisehand,
        type: "v-raisehand",
        // TkConstant.template === "template_beyond" && user.raisehand 超越版没有模板的概念了  暂时注释保留
        className: "v-raisehand",
        primaryColor: undefined
      },
      {
        disabled: true,
        // isShow:user.hasaudio,
        type: "v-device-microphone",
        isShow: true,
        className:
          "v-device-microphone" +
          ((user.publishstate ===
            TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY ||
            user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH) &&
          user.hasaudio
            ? " on"
            : " off") +
          " " +
          (user.disableaudio ? " disableaudio" : ""),
        primaryColor: undefined
      },
      {
        disabled: true,
        // isShow: user.hasvideo,
        type: "v-device-video",
        isShow: false,
        className:
          "v-device-video" +
          (user.publishstate ===
            TkConstant.PUBLISHSTATE.PUBLISH_STATE_VIDEOONLY ||
          user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH
            ? " on"
            : " off") +
          " " +
          (user.disablevideo ? " disablevideo" : ""),
        primaryColor: undefined
      },
      {
        disabled: true,
        // isShow: user.role !==  TkConstant.role.roleChairman,
        isShow: true,
        type: "v-user-pen",
        className: "v-user-pen" + (user.candraw&&TkGlobal.classBegin ? " on" : " off"),
        primaryColor: user.primaryColor
      }
    ];
    userInfoIconDesc.map((item, index) => {
      let { disabled, isShow, className, primaryColor, type } = item;
      if (isShow) {
        userInfoIconArray.push(
          <button
            key={index}
            className={(className || "") + " " + (disabled ? " disabled " : " ") + (type == "v-user-pen" ? " icon-pen":" ")}
            disabled={disabled}
            style={{color:primaryColor}}
          >

          </button>
        );
      }
    });
    return userInfoIconArray;
  }

  _colorFilter(text) {
    if (text === undefined) {
      return;
    }
    return text.replace(/#/g, "");
  }

  _loadActionButtonArray(user) {
    let actionButtonArray = [];
    let actionButtonDesc = [];
    if (TkGlobal.playback) {
      //回放 不显示按钮
      return actionButtonArray;
    }
    let isMyself = user.id === ServiceRoom.getTkRoom().getMySelf().id;
    let closeMyseftAV = CoreController.handler.getAppPermissions(
      "closeMyseftAV"
    );
    let controlOtherVideo = CoreController.handler.getAppPermissions(
      "controlOtherVideo"
    );
    /*if( (!isMyself && !controlOtherVideo) || (isMyself && !closeMyseftAV) || (!isMyself && controlOtherVideo && user.role === TkConstant.role.roleChairman) ){
        return actionButtonArray ;
        }*/
    let loadActionBtn = {};
    if (!TkGlobal.classBegin) {
      if (TkConstant.joinRoomInfo.isBeforeClassReleaseVideo) {
        loadActionBtn = {
          scrawl: false, //画笔
          platform: false, //上下台
          audio: closeMyseftAV && isMyself, //音频
          video: closeMyseftAV && isMyself, //视频
          gift: false, //送礼物
          restoreDrag: false, //恢复位置
          areaExchange: false, //区域交换
          oneKeyReset: false, //一键恢复
          onlyAudio: false //纯音频
        };
      } else {
        //上课前且上课前不发布音视频，则不显示按钮
        return actionButtonArray;
      }
    } else {
      if (TkConstant.hasRole.roleStudent) {
        loadActionBtn = {
          scrawl: false, //画笔
          platform: false, //上下台
          audio: closeMyseftAV && isMyself, //音频
          video: closeMyseftAV && isMyself, //视频
          gift: false, //送礼物
          // 学生不能恢复位置
          restoreDrag: false, // 恢复位置
          areaExchange: isMyself
            ? false
            : TkConstant.joinRoomInfo.areaExchange &&
              TkConstant.hasRoomtype.oneToOne &&
              user.role === TkConstant.role.roleChairman &&
              TkConstant.hasRole.roleStudent, //区域交换
          oneKeyReset: false //一键恢复
        };
      } else if (TkConstant.hasRole.roleChairman) {
        loadActionBtn = {
          scrawl: !isMyself,
          platform: !isMyself,
          audio: true,
          video: true,
          gift: !isMyself,
          restoreDrag: CoreController.handler.getAppPermissions(
            "isCanDragVideo"
          ),
          areaExchange: isMyself
            ? false
            : TkConstant.joinRoomInfo.areaExchange &&
              TkConstant.hasRoomtype.oneToOne &&
              user.role === TkConstant.role.roleStudent &&
              TkConstant.hasRole.roleChairman,
          oneKeyReset: isMyself,
          onlyAudio: isMyself, //纯音频
          pointerReminder:
            TkConstant.joinRoomInfo.pointerReminder &&
            (user.role !== TkConstant.role.roleChairman &&
              user.role !== TkConstant.role.roleTeachingAssistant) //教鞭
        };
      } else if (TkConstant.hasRole.roleTeachingAssistant) {
        loadActionBtn = {
          scrawl: isMyself ? false : user.role !== TkConstant.role.roleChairman,
          platform: isMyself
            ? false
            : user.role !== TkConstant.role.roleChairman,
          audio: isMyself ? true : user.role !== TkConstant.role.roleChairman,
          video: isMyself ? true : user.role !== TkConstant.role.roleChairman,
          gift: false,
          restoreDrag: CoreController.handler.getAppPermissions(
            "isCanDragVideo"
          ),
          areaExchange: false,
          oneKeyReset: false,
          onlyAudio: false, //纯音频
          pointerReminder:
            TkConstant.joinRoomInfo.pointerReminder &&
            (user.role !== TkConstant.role.roleChairman &&
              user.role !== TkConstant.role.roleTeachingAssistant) //教鞭
        };
      } else if (TkConstant.hasRole.rolePatrol) {
        loadActionBtn = {
          scrawl: false,
          platform: false,
          audio: false,
          video: false,
          gift: false,
          restoreDrag: false,
          areaExchange: false,
          oneKeyReset: false
        };
      }
    }
    let actionBtnJson = {
      scrawl: {
        disabled: false,
        languageKeyText: user.candraw ? "no" : "yes",
        className: "scrawl-btn " + (user.candraw ? "no" : "yes"),
        onClick: this.changeUserCandraw.bind(this, user),
        title: user.candraw
          ? TkGlobal.language.languageData.toolContainer.toolIcon.userList
              .button.Scrawl.on.title
          : TkGlobal.language.languageData.toolContainer.toolIcon.userList
              .button.Scrawl.off.title,
        isShow:
          !this.props.isSplitScreenFromStream &&
          (isMyself ? false : user.role === TkConstant.role.roleStudent) //不是学生（并且不处于分屏下）则隐藏
      },
      platform: {
        disabled: false,
        languageKeyText:
          user.publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE
            ? "no"
            : "yes",
        className:
          "platform-btn " +
          (user.publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE
            ? "no"
            : "yes"),
        onClick: this.userPlatformUpOrDown.bind(this, user, user.role),
        title:
          user.publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE
            ? TkGlobal.language.languageData.toolContainer.toolIcon.userList
                .button.update.up.title
            : TkGlobal.language.languageData.toolContainer.toolIcon.userList
                .button.update.down.title,
        isShow: isMyself
          ? false
          : user.role === TkConstant.role.roleStudent ||
            user.role === TkConstant.role.roleTeachingAssistant
          ? true
          : !this.props.isDrag
      },
      audio: {
        disabled: false,
        languageKeyText:
          user.publishstate ===
            TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY ||
          user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH
            ? "no"
            : "yes",
        className:
          "audio-btn " +
          (user.publishstate ===
            TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY ||
          user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH
            ? "no"
            : "yes"),
        onClick: this.userAudioOpenOrClose.bind(this, user),
        title: user.disableaudio
          ? TkGlobal.language.languageData.toolContainer.toolIcon.userList
              .button.audio.disabled.title
          : user.publishstate ===
              TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY ||
            user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH
          ? TkGlobal.language.languageData.toolContainer.toolIcon.userList
              .button.audio.on.title
          : TkGlobal.language.languageData.toolContainer.toolIcon.userList
              .button.audio.off.title,
        isShow: user.hasaudio
      },
      video: {
        disabled: false,
        languageKeyText:
          user.publishstate ===
            TkConstant.PUBLISHSTATE.PUBLISH_STATE_VIDEOONLY ||
          user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH
            ? "no"
            : "yes",
        className:
          "video-btn " +
          (user.publishstate ===
            TkConstant.PUBLISHSTATE.PUBLISH_STATE_VIDEOONLY ||
          user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH
            ? "no"
            : "yes"),
        onClick: this.userVideoOpenOrClose.bind(this, user),
        title: user.disablevideo
          ? TkGlobal.language.languageData.toolContainer.toolIcon.userList
              .button.video.disabled.title
          : user.publishstate ===
              TkConstant.PUBLISHSTATE.PUBLISH_STATE_VIDEOONLY ||
            user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH
          ? TkGlobal.language.languageData.toolContainer.toolIcon.userList
              .button.video.on.title
          : TkGlobal.language.languageData.toolContainer.toolIcon.userList
              .button.video.off.title,
        isShow: TkGlobal.isOnlyAudioRoom ? false : user.hasvideo
      },
      gift: {
        disabled: false,
        languageKeyText: "yes",
        className: "gift-btn",
        onClick: this.sendGiftToStudent.bind(this, user),
        title:
          TkGlobal.language.languageData.otherVideoContainer.button.gift.yes,
        isShow: isMyself
          ? false
          : user.role === TkConstant.role.roleStudent &&
            TkConstant.hasRole.roleChairman
      },
      restoreDrag: {
        disabled: false,
        languageKeyText: "text",
        className: "restoreDrag-btn",
        onClick: this.restoreVideoDrag.bind(this, user.id),
        title:
          TkGlobal.language.languageData.otherVideoContainer.button.restoreDrag
            .text,
        isShow:
          (TkGlobal.isSplitScreen ? false : this.props.isDrag) &&
          !TkGlobal.isVideoInFullscreen
      },
      areaExchange: {
        disabled: false,
        languageKeyText: "text",
        className: "areaExchange-btn",
        onClick: this.handlerAreaExchange.bind(this, user),
        title:
          TkGlobal.language.languageData.otherVideoContainer.button.areaExchange
            .text,
        isShow:
          !isMyself &&
          TkConstant.joinRoomInfo.areaExchange &&
          TkConstant.hasRoomtype.oneToOne &&
          !this.state.areaExchangeBtn
      },

      /* 恢复全部 */
      oneKeyReset: {
        disabled: false,
        languageKeyText: "text",
        className: "oneKeyReset-btn",
        onClick: this.handlerOneKeyReset.bind(this),
        title: undefined,
        isShow:
          TkConstant.hasRole.roleChairman &&
          isMyself &&
          !TkConstant.isBaseboard &&
          !TkConstant.hasRoomtype.oneToOne &&
          !TkGlobal.isVideoInFullscreen
      },
      onlyAudio: {
        disabled: false,
        languageKeyText: TkGlobal.isOnlyAudioRoom ? "yes" : "no",
        className:
          "onlyAudio-btn" + (TkGlobal.isOnlyAudioRoom ? " yes" : " no"),
        onClick: this.setOnlyAudioClassRoomHandle.bind(this),
        title: undefined,
        isShow:
          TkConstant.hasRole.roleChairman &&
          TkConstant.joinRoomInfo.isHasVideo &&
          TkConstant.joinRoomInfo.createOnlyAudioRoom
      },
      pointerReminder: {
        disabled: false,
        languageKeyText: "text",
        className: "pointerReminder-btn " + (user.pointerstate ? "yes" : "no"),
        onClick: this.handlerPointerReminder.bind(this, user),
        title:
          TkGlobal.language.languageData.otherVideoContainer.button
            .pointerReminder.text,
        isShow:
          (TkConstant.hasRole.roleChairman ||
            TkConstant.hasRole.roleTeachingAssistant) &&
            !TkConstant.hasRoomtype.oneToOne &&  
            // !TkConstant.joinRoomInfo.assistantOpenMyseftAV&&
          TkConstant.joinRoomInfo.pointerReminder &&
          (user.role !== TkConstant.role.roleChairman &&
            user.role !== TkConstant.role.roleTeachingAssistant) //配置项
        // isShow:false, //配置项
      }
    };
    for (let key of Object.keys(actionBtnJson)) {
      if (loadActionBtn[key]) {
        actionButtonDesc.push(actionBtnJson[key]);
      }
    }
    if (TkGlobal.isVideoInFullscreen) {
      actionButtonArray.length = 0;
    } else {
      actionButtonDesc.map((item, index) => {
        let {
          disabled,
          languageKeyText,
          className,
          onClick,
          title,
          isShow
        } = item;
        if (isShow) {
          let buttonName = className.split("-");
          actionButtonArray.push(
            <button
              key={index}
              className={
                "" + (className || "") + " " + (disabled ? " disabled " : " ")
              }
              onClick={
                onClick && typeof onClick === "function" ? onClick : undefined
              }
              disabled={disabled ? disabled : undefined}
              onDoubleClick={(e)=>{e.stopPropagation();e.preventDefault();}}
              style={{ display: !isShow ? "none" : "block" }}
              title={
                TkGlobal.language.languageData.otherVideoContainer.button[
                  buttonName[0]
                ][languageKeyText]
                  ? TkGlobal.language.languageData.otherVideoContainer.button[
                      buttonName[0]
                    ][languageKeyText]
                  : undefined
              }
            />
          );
        }
      });
    }

    return actionButtonArray;
  }

  _percentageChangeToRem(percentLeft, percentTop, videoWidth, videoHeight) {
    // 如果是一对一 则不走下面方法  直接返回  ~~过度
    if(TkConstant.hasRoomtype.oneToOne || TkGlobal.playback) return {videoLeft:0, videoTop:0 }
    let videoLeft = 0;
    let videoTop = 0;
    let defalutFontSize =
      window.GLOBAL.windowInnerWidth / TkConstant.STANDARDSIZE;
    //获取拖拽区域宽高：
    let boundId = "lc-full-vessel";
    if (TkGlobal.areaExchangeFlag) {
      let roomUers = ServiceRoom.getTkRoom().getUsers(); // N:因为上台的用户并且是1V1情况下才会走到这里
      if (TkConstant.hasRole.roleChairman) {
        for (let [key, value] of Object.entries(roomUers)) {
          if (value.role === TkConstant.role.roleStudent) {
            boundId = value.id;
          }
        }
      } else if (TkConstant.hasRole.roleStudent) {
        for (let [key, value] of Object.entries(roomUers)) {
          if (value.role === TkConstant.role.roleChairman) {
            boundId = value.id;
          }
        }
      }
    }
    let boundsEle =
      document.getElementById(boundId) ||
      document.getElementById("lc-full-vessel");
    let boundsEleW = boundsEle.clientWidth;
    let boundsEleH = boundsEle.clientHeight;
    //计算白板区工具相对白板的位置：
    videoLeft = (percentLeft * (boundsEleW - videoWidth)) / defalutFontSize;

    videoTop = (percentTop * (boundsEleH - videoHeight)) / defalutFontSize;
    return { videoLeft, videoTop };
  }

  /*视频镜像*/
  videoMirroringHandle(handleData) {
    this.state.isVideoMirror = handleData.message.isVideoMirroring;
    this.setState({ isVideoMirror: this.state.isVideoMirror });
  }

  /*纯音频教室*/
  setOnlyAudioClassRoomHandle() {
    let isOnlyAudio = !TkGlobal.isOnlyAudioRoom;
    const that = this;
    if (isOnlyAudio) {
      ServiceTooltip.showConfirm(
        TkGlobal.language.languageData.otherVideoContainer.button.onlyAudio
          .create,
        function(answer) {
          if (answer) {
            ServiceRoom.getTkRoom().switchOnlyAudioRoom(true);
          }
        }
      );
    } else {
      ServiceTooltip.showConfirm(
        TkGlobal.language.languageData.otherVideoContainer.button.onlyAudio
          .cancel,
        function(answer) {
          if (answer) {
            ServiceRoom.getTkRoom().switchOnlyAudioRoom(false);
          }
        }
      );
    }
  }

  /*教鞭提醒*/
  handlerPointerReminder(user) {
    if (user) {
      let pointerstate = user.pointerstate;
      let data = {
        pointerstate: !pointerstate
      };
      ServiceSignalling.setParticipantPropertyToAll(user.id, data);
    }
  }

  VideoClassName(props) {
    return `
    ${
      props.user.role === TkConstant.role.roleChairman
        ? "teacher-border"
        : "student-border"
    } 
    ${props.videoDumbClassName + "-option-container"} 
    ${props.className || " "} 
    ${TkGlobal.isOnlyAudioRoom ? " " : props.pictureInPictureClassname} 
    ${props.isMediaClassName ? " stream_media" : ""} 
    ${props.areaExchangeFlag ? " areaExchange" : ""} 
    ${props.videoScaleClassName}`;
  }
  doubleClick(e){
    let doubleId = e.currentTarget.id;
    if(TkConstant.hasRoomtype.oneToOne){  // 如果是一对一
      this.props.videoOnDoubleClick(e);
      return;
    }
    let { user = {} } = this._loadStreamInfo(this.props.stream);
    let isDoubleClick = ( this.props.videoScreenId && ( this.props.videoScreenId === user.id || this.props.videoScreenId === this.props.id ) )
    if(this.props.isDrag || this.props.isHasCloseBtn){
      return;
    }
    if(TkGlobal.classBegin){
      if(!TkConstant.hasRole.roleStudent){
        ServiceSignalling.sendSignllingDoubleClickVideo({doubleId:doubleId,isScreen: !isDoubleClick},false);
      }
    }
  }

  render() {
    let {
      connectDropTarget,
      connectDragSource,
      getItem,
      isDragging,
      percentLeft,
      percentTop,
      id,
      isDrag,
      isCanDrag,
      videoWidth,
      videoHeight,
      height,
      isBigVideo,
      isSignallingScreen,
      foregroundpicUrl
    } = this.props;
    
    const defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
    const videoWidthPx = videoWidth * defalutFontSize;
    const videoHeightPx =  videoHeight * defalutFontSize;
    let { customTrophyShow, areaExchangeFlag, areastyle } = this.state;
    this.layerIsShowOfIsDraging(isDragging, TkGlobal.isVideoStretch, getItem);
    let { user = {} } = this._loadStreamInfo(this.props.stream);
    let userInfoIconArray = [];
    let actionButtonArray = [];
    

    if (user && Object.keys(user).length > 0) {
      userInfoIconArray = this._loadUserInfoIconArray(user);
      actionButtonArray = this._loadActionButtonArray(user);
    }

    let dragIsHide = this.props.hasDragJurisdiction ? !isCanDrag : false;
    let thisVideoDragStyle = undefined;

    let { videoLeft, videoTop } = this._percentageChangeToRem(
      percentLeft,
      percentTop,
      videoWidthPx,
      videoHeightPx
    );

    thisVideoDragStyle = {
      cursor: isCanDrag ? "move" : "default",
      top: videoTop + TkGlobal.dragRange.top + "rem",
      left: videoLeft + TkGlobal.dragRange.left + "rem",
      margin: isDrag ? 0 : undefined,
      position: isDrag ? "fixed" : "",
      width: videoWidth + "rem",
      height: videoHeight + "rem",
      zIndex: isDrag ? 300 : undefined
    };
    let isDoubleClick = ( this.props.videoScreenId && ( this.props.videoScreenId === user.id || this.props.videoScreenId === this.props.id ) )
    let videoSize = null
    if( !TkConstant.hasRoomtype.oneToOne && isDoubleClick){
      videoSize = this.props.thisVideoFullStyle
    }else if(TkConstant.hasRoomtype.oneToOne) {
      videoSize = null
    }else{

      videoSize={
        width: `${this.props.initVideoWidth}vw`,
        height: `${this.props.initVideoHeight}vw`
      }
    }
    const videoScale = TkConstant.joinRoomInfo.roomVideoHeight / TkConstant.joinRoomInfo.roomVideoWidth;
    let fullScreenVideoSize = {
      width: isBigVideo ? `100vw` : `${100/7}vw`,
      height: isBigVideo ? `${100 * videoScale}vw` :`${100/7*videoScale}vw`,
      display:`${TkGlobal.isOnlyAudioRoom || (user && user.publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_VIDEOONLY && user.publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH ) ?"none":"block"}` // 如果没视频就隐藏
    
    }
    const temp = { ...this.props, ...this.state };
    return connectDropTarget(
      connectDragSource(
        <div
          id={id || user.id}
          onMouseMove={this.mouseMove.bind(this)}
          onMouseDown={this.mouseDown.bind(this)}
          onDoubleClick={this.doubleClick.bind(this)}
          style = {this.props.isHasCloseBtn? fullScreenVideoSize : isDrag ? thisVideoDragStyle : videoSize}
          className={
            "video-permission-container clear-float video-container " +
            (this.props.videoDumbClassName + "-option-container ") +
            (this.props.className || " ") +
            " " +
            (this.props.pictureInPictureClassname || " ") +
            (this.state.isMediaClassName ? " stream_media" : "")+
            (isDoubleClick ? 'isFullWhiteBoard':null)
          }
        >
          {/* {this.props.isHasCloseBtn &&
          !TkConstant.joinRoomInfo.pictureInPicture ? (
            <span
              className={"video_fullScreen_close_btn"}
              onClick={
                this.props.closeFullScreenVideo
                  ? this.props.closeFullScreenVideo
                  : null
              }
            />
          ) : null} */}
          <div className="foregroundpic-container" 
              style={{display:TkConstant.hasRole.roleStudent && TkConstant.joinRoomInfo.foregroundpic && foregroundpicUrl && this.props.pictureInPictureClassname ? 'block':'none'  ,
              backgroundImage:TkConstant.hasRole.roleStudent && TkConstant.joinRoomInfo.foregroundpic && foregroundpicUrl && this.props.pictureInPictureClassname?'url('+(foregroundpicUrl)+')':undefined  }} />
          <Video
            {...temp}
            user={user}
            isDoubleClick={isDoubleClick}
            isHasCloseBtn={this.props.isHasCloseBtn}
            // videoScaleClassName={videoScaleClassName}
            restoreDrag={this.restoreVideoDrag.bind(this, user.id)}
            dragIsHide={dragIsHide}
            isClassBegin={TkGlobal.classBegin}
            actionButtonArray={actionButtonArray}
            userInfoIconArray={userInfoIconArray}
          />
        </div>
      )
    );
  }
}
const HVideoComponentDragSource = DragSource("talkDrag", specSource, collect)(
  CommonVideoSmart
);
export default DropTarget("talkDrag", specTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))(HVideoComponentDragSource);
