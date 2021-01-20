import TkGlobal from "TkGlobal";
import TkConstant from "TkConstant";
import ServiceRoom from "ServiceRoom";

const BOUNDERID = "lc-full-vessel";
const LCVIDEOID = "other_video_container";
const defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;

const ChangeSizeUtil = function() {
  return {
    _calculateBounder: _calculateBounder,
    _calculateVideoSize: _calculateVideoSize,
    _getInitVideoSize: _getInitVideoSize
  };

  function _percentageChangeToRem(
    percentLeft,
    percentTop,
    videoWidth,
    videoHeight
  ) {
    let videoLeft = 0,
      videoTop = 0,
      boundId;
    //获取拖拽区域宽高：
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
    let boundsEle = document.getElementById(boundId) || document.getElementById(BOUNDERID);
    let boundsEleW = boundsEle.clientWidth;
    let boundsEleH = boundsEle.clientHeight;
    //计算白板区工具相对白板的位置：
    videoLeft =
      (percentLeft * (boundsEleW - videoWidth * defalutFontSize)) /
      defalutFontSize;
    videoTop =
      (percentTop * (boundsEleH - videoHeight * defalutFontSize)) /
      defalutFontSize;
    return { videoLeft, videoTop };
  }

  function _calculateMouseEvent(event, sharpsData) {
    let { percentLeft, percentTop, videoWidth, videoHeight } = sharpsData;
    let { videoLeft, videoTop } = _percentageChangeToRem(
      percentLeft,
      percentTop,
      videoWidth,
      videoHeight
    );
    let videoLeftOfbody =
      (videoLeft + TkGlobal.dragRange.left) * defalutFontSize;
    let videoTopOfbody = (videoTop + TkGlobal.dragRange.top) * defalutFontSize;
    //获取鼠标相对body的位置：
    let mouseLeft = event.pageX;
    let mouseTop = event.pageY;
    return { videoLeftOfbody, videoTopOfbody, mouseLeft, mouseTop };
  }

  function _calculateBounder(event, sharpsData, callbackArr) {
    let {
      videoLeftOfbody,
      videoTopOfbody,
      mouseLeft,
      mouseTop
    } = _calculateMouseEvent(event, sharpsData);
    let { videoWidth, videoHeight } = sharpsData;
    //根据鼠标按下的位置判断是否可以拉伸：
    if (
      mouseLeft >= videoLeftOfbody + videoWidth - 7 &&
      mouseLeft < videoLeftOfbody + videoWidth &&
      (mouseTop >= videoTopOfbody &&
        mouseTop < videoTopOfbody + videoHeight - 7)
    ) {
      callbackArr && callbackArr[0] && callbackArr && callbackArr[0]();
    } else if (
      mouseTop >= videoTopOfbody + videoHeight - 7 &&
      mouseTop < videoTopOfbody + videoHeight &&
      (mouseLeft >= videoLeftOfbody &&
        mouseLeft < videoLeftOfbody + videoWidth - 7)
    ) {
      callbackArr && callbackArr[1] && callbackArr && callbackArr[1]();
    } else if (
      mouseTop < videoTopOfbody + videoHeight &&
      mouseTop >= videoTopOfbody + videoHeight - 7 &&
      (mouseLeft < videoLeftOfbody + videoWidth &&
        mouseLeft >= videoLeftOfbody + videoWidth - 7)
    ) {
      callbackArr && callbackArr[2] && callbackArr && callbackArr[2]();
    }
    let i = 3;
    while (callbackArr[i]) {
      callbackArr[i]();
      i++;
    }
  }

  function _calculateVideoSize(
    id,
    event,
    sharpsData,
    stretchDirection,
    changeVideoSize
  ) {
    //改变视频框的大小
    let {
      videoLeftOfbody,
      videoTopOfbody,
      mouseLeft,
      mouseTop
    } = _calculateMouseEvent(event, sharpsData);
    let newVideoWidth, newVideoHeight;
    let lcVideoContainer = document.getElementById(LCVIDEOID);
    if (
      TkGlobal.isVideoStretch &&
      (stretchDirection === "w" || stretchDirection === "se")
    ) {
      newVideoWidth = Math.abs(mouseLeft - videoLeftOfbody) / defalutFontSize;
      newVideoHeight = newVideoWidth / TkGlobal.videoScale;
      if (
        mouseLeft < TkGlobal.dragRange.left * defalutFontSize ||
        mouseLeft < videoLeftOfbody
      ) {
        newVideoWidth =
          lcVideoContainer.clientWidth / defalutFontSize / TkGlobal.videoNum -
          0.1;
        newVideoHeight = newVideoWidth / TkGlobal.videoScale;
      }
    } else if (TkGlobal.isVideoStretch && stretchDirection === "s") {
      newVideoHeight = Math.abs(mouseTop - videoTopOfbody) / defalutFontSize;
      newVideoWidth = newVideoHeight * TkGlobal.videoScale;
      if (
        mouseTop < TkGlobal.dragRange.top * defalutFontSize ||
        mouseTop < videoTopOfbody
      ) {
        newVideoWidth =
          lcVideoContainer.clientWidth / defalutFontSize / TkGlobal.videoNum -
          0.1;
        newVideoHeight = newVideoWidth / TkGlobal.videoScale;
      }
    }
    if (changeVideoSize) {
      changeVideoSize(newVideoWidth, newVideoHeight, id);
    }
  }

  /*获取初始化视频的大小*/
  function _getInitVideoSize() {
    let lcVideoContainer = document.getElementById(LCVIDEOID);
    let initVideoWidth =
      lcVideoContainer.clientWidth / defalutFontSize / TkGlobal.videoNum - 0.15;
    let initVideoHeight = initVideoWidth / TkGlobal.videoScale;
    return { initVideoWidth, initVideoHeight };
  }
};

const ChangeVideoSizeHandle = function() {
  const changeSizeUtil = ChangeSizeUtil();
  let stretchDirection;
  let lastVideoDragStyle = {
    percentLeft: null,
    percentTop: null
  };

  return {
    mouseDown: mouseDown,
    mouseUp: mouseUp,
    mouseMove: mouseMove,
    changeSizeMove: changeSizeMove,
    limitVideoSize: limitVideoSize
  };

  function mouseDown(event, sharpsData) {
    let mouseDownEventArr = [
      () => {
        TkGlobal.isVideoStretch = true;
      },
      () => {
        TkGlobal.isVideoStretch = true;
      },
      () => {
        TkGlobal.isVideoStretch = true;
      }
    ];
    changeSizeUtil._calculateBounder(event, sharpsData, mouseDownEventArr);
    lastVideoDragStyle = {
      //保存拉伸视频前一次的位置百分比
      percentLeft: sharpsData.percentLeft,
      percentTop: sharpsData.percentTop
    };
  }

  function mouseUp(event, SignallingCallback) {
    if (TkGlobal.isVideoStretch === true) {
      if (SignallingCallback) {
        SignallingCallback();
      }
      lastVideoDragStyle = {
        //初始化鼠标按下时保存的百分比
        percentLeft: 0,
        percentTop: 0
      };
      TkGlobal.isVideoStretch = false; //是否是拉伸
      event.onmousemove = null;
      event.target.style.cursor = ""; //在页面上鼠标的样式初始化
      TkGlobal.changeVideoSizeEventName = null; //在页面上鼠标移动时触发的事件名制空
      TkGlobal.changeVideoSizeMouseUpEventName = null; //在页面上鼠标抬起时触发的事件名制空
    }
  }

  function mouseMove(id, isDrag) {
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

  function changeSizeMove(event, sharpsData, changeVideoSize, id) {
    const mouseMoveEventArr = [
      () => {
        event.target.style.cursor = "w-resize";
        stretchDirection = "w";
      },
      () => {
        event.target.style.cursor = "s-resize";
        stretchDirection = "s";
      },
      () => {
        event.target.style.cursor = "se-resize";
        stretchDirection = "se";
      },
      () => {
        event.target.style.cursor = "";
      }
    ];
    changeSizeUtil._calculateBounder(event, sharpsData, mouseMoveEventArr);
    changeSizeUtil._calculateVideoSize(
      id,
      event,
      sharpsData,
      stretchDirection,
      changeVideoSize
    );
  }

  /*限制视频大小,不能超出白板范围*/
  function limitVideoSize(videoWidth, videoHeight) {
    //获取白板区域宽高：
    let content = document.getElementById(BOUNDERID);
    let contentW = content.clientWidth;
    let contentH = content.clientHeight;
    let {
      initVideoWidth,
      initVideoHeight
    } = changeSizeUtil._getInitVideoSize();
    if (videoWidth < initVideoWidth || videoHeight < initVideoHeight) {
      videoWidth = initVideoWidth;
      videoHeight = initVideoHeight;
    }
    if (
      videoWidth >= contentW / defalutFontSize ||
      videoHeight >= contentH / defalutFontSize
    ) {
      if (TkGlobal.videoScale > contentW / contentH) {
        videoWidth = contentW / defalutFontSize;
        videoHeight = videoWidth / TkGlobal.videoScale;
      } else {
        videoHeight = contentH / defalutFontSize;
        videoWidth = videoHeight * TkGlobal.videoScale;
      }
    }
    return { videoWidth, videoHeight };
  }
};

export default ChangeVideoSizeHandle();
