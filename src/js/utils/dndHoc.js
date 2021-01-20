// 拖拽对象
const sourceSpec = {
  // 拖动开始时触发的事件
  beginDrag(props, monitor, component) {
      const {id, percentLeft, percentTop, isDrag} = props;
      return {id, percentLeft, percentTop, isDrag};
  },
  // 拖动结束时触发的事件
  endDrag(props, monitor, component){
    // ..
  },
  // 当前是否可以拖拽的事件
  canDrag(props, monitor) {
      const {id , hasDragJurisdiction} = props;
      if(!hasDragJurisdiction || (TkConstant.hasRole.roleStudent && !props.isDrag) || TkGlobal.isVideoStretch || TkGlobal.isVideoInFullscreen ) { //视频没有拽出并且是学生，或者寻课，或者没有上课，或者是视频拉伸，则不能拖拽
          return false;
      } else {
          return true;
      }
  },
  // 拖拽时触发的事件
  isDragging(props, monitor){
    // ..
  }
};

// 拖拽区域
const targetSpec = {
  // 组件放下时触发的事件
  drop(props, monitor, component) {
      let dragFinishEleCoordinate = monitor.getSourceClientOffset(); //拖拽后鼠标相对body的位置
      const item = monitor.getItem(); //拖拽的元素信息
      let {id} = item;
      const defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
      let dragEle = document.getElementById(id); //拖拽的元素
      let dragEleW = dragEle.clientWidth;
      let dragEleH = dragEle.clientHeight;
      let boundId = 'lc-full-vessel';
      if (TkGlobal.areaExchangeFlag) {
          let roomUers = ServiceRoom.getTkRoom().getUsers();  // N： 因为上台的用户并且是1V1情况下才会走到这里
          if (TkConstant.hasRole.roleChairman) {
              for (let [key,value] of Object.entries(roomUers)) {
                  if (value.role === TkConstant.role.roleStudent) {
                      boundId = value.id;
                  }
              }
          }else if (TkConstant.hasRole.roleStudent) {
              for (let [key,value] of Object.entries(roomUers)) {
                  if (value.role === TkConstant.role.roleChairman) {
                      boundId = value.id;
                  }
              }
          }
      }
      let content = document.getElementById(boundId) || document.getElementById('lc-full-vessel');//白板拖拽区域
      let contentW = content.clientWidth;
      let contentH = content.clientHeight;
      /*拖拽元素不能拖出白板区*/
      let dragEleOffsetLeft = dragFinishEleCoordinate.x;
      let dragEleOffsetTop = dragFinishEleCoordinate.y;
      let dragEleLeft,dragEleTop;
      if (TkGlobal.mainContainerFull || TkGlobal.isVideoInFullscreen) {//如果白板区全屏
          if (dragEleOffsetLeft < 0) {
              dragEleOffsetLeft = 0;
          }else if (dragEleOffsetLeft > (contentW-dragEleW)) {
              dragEleOffsetLeft = contentW-dragEleW;
          }
          if (dragEleOffsetTop < 0) {
              dragEleOffsetTop = 0;
          }else if (dragEleOffsetTop > (contentH - dragEleH)) {
              dragEleOffsetTop = contentH - dragEleH;
          }
          /*计算位置百分比*/
          dragEleLeft = dragEleOffsetLeft/(contentW - dragEleW);
          dragEleTop = dragEleOffsetTop/(contentH - dragEleH);
      }else {//白板区没有全屏
          if (dragEleOffsetLeft < TkGlobal.dragRange.left*defalutFontSize) {
              dragEleOffsetLeft = TkGlobal.dragRange.left*defalutFontSize;
          }else if (dragEleOffsetLeft > (TkGlobal.dragRange.left*defalutFontSize+contentW-dragEleW)) {
              dragEleOffsetLeft = TkGlobal.dragRange.left*defalutFontSize+contentW-dragEleW;
          }
          if (dragEleOffsetTop < TkGlobal.dragRange.top*defalutFontSize) {
              dragEleOffsetTop = TkGlobal.dragRange.top*defalutFontSize;
          }else if (dragEleOffsetTop > (TkGlobal.dragRange.top*defalutFontSize + contentH - dragEleH)) {
              dragEleOffsetTop = TkGlobal.dragRange.top*defalutFontSize + contentH - dragEleH;
          }
          /*计算位置百分比*/
          dragEleLeft = (dragEleOffsetLeft - TkGlobal.dragRange.left*defalutFontSize)/(contentW - dragEleW);
          dragEleTop = (dragEleOffsetTop - TkGlobal.dragRange.top*defalutFontSize)/(contentH - dragEleH);
      }
      dragEleLeft = (isNaN(dragEleLeft) || dragEleLeft === Infinity || dragEleLeft === null )?0:dragEleLeft;
      dragEleTop = (isNaN(dragEleTop) || dragEleTop === Infinity || dragEleTop === null )?0:dragEleTop;
      let dragEleStyle = { //相对白板区位置的百分比
          percentTop: dragEleTop,
          percentLeft: dragEleLeft,
          isDrag: true,
      };
      eventObjectDefine.CoreController.dispatchEvent({ //自己本地和通知别人改变拖拽的video位置
          type: 'changeOtherVideoStyle',
          message: {data: {style: dragEleStyle, id: id, item:item}, initiative:true},
      });
  },
  // 组件可以被放置时触发的事件
  canDrop(props, monitor) { //拖拽元素不能拖出白板区
      let {isDrag} = props;
      if (isDrag) {
          return true;
      }else {
          return false;
      }
  },
  // 组件在DropTarget上方时响应的事件
  hover(props, monitor, component){
    // ..
  },
};


function collect(connect, monitor) {
  return {
      connectDragSource: connect.dragSource(),
      isDragging: monitor.isDragging(),
      isCanDrag: monitor.canDrag(),
      getItem:monitor.getItem(),
  };
}
