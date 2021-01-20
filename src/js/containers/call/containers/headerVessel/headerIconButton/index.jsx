/**
 * 右侧头部- 头部图标按钮
 * @module HeaderIConButton
 * @description  头部图标按钮
 * @date 2018/11/19
 */

"use strict";
import React from "react";
import eventObjectDefine from "eventObjectDefine";
import TkConstant from "TkConstant";
import TkGlobal from "TkGlobal";
import ServiceRoom from "ServiceRoom";
import TKUtils from "TkUtils";
import ServiceSignalling from "ServiceSignalling";
import CoreController from "CoreController";
import ToolIConUserList from "../toolIconUserList";
import ToolIconResourceLibrary from "@/headerVessel/toolIconResourceLibrary";
import ToolIconMessage from "@/headerVessel/toolIconMessage";
import ToolIconToolBox from "@/headerVessel/toolIconToolBox";
import ToolIconOverall from "@/headerVessel/toolIconOverallControl";
import ToolIconSeekHelp from "@/headerVessel/toolIconSeekHelp";
import ToolIconSetting from "@/headerVessel/toolIconSetting";
import SwitchLayoutBtn from '@/headerVessel/SwitchLayoutBtn';
import ToolIconFull from "@/headerVessel/toolIconFull";
import TkUtils from 'TkUtils';

class HeaderIConButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      layoutActive: false, //切换布局按钮是否被点击
      settingActive: false,
      isClassOverLeave: false,
      actived: [],
      isFullScreen: false,
      classBegin: false,
      userList: false,
      courseware: false,
      toolKit: false,
      option: false,
      chat: false,
      help: false,
      canDraw: false,
      unReadMessages: 0,
      isHasHand: false,
      isShowTools: false,
      handShow: false,
      // 当时是否在媒体库中的MP4是否在播放中
      isCourseMp4Play: false,
      nowLayout: undefined,
      isHasToolBox: true
    };
    this.listernerBackupid = new Date().getTime() + "_" + Math.random();

    this.exceptOpts = ["fullScreen"];
  }

  componentDidMount() {
    TkUtils.tool.addFullscreenchange(this.handleFullScreenChange.bind(this));
    //在完成首次渲染之前调用，此时仍可以修改组件的state
    const that = this;
    eventObjectDefine.CoreController.addEventListener(
      "beyondTmplEvent",
      this.beyondTmplHandler.bind(this),
      this.listernerBackupid
    ); // 呼出花名册，课件库，工具箱，全体控制
    eventObjectDefine.CoreController.addEventListener(
      "changeSettingBtn",
      that.handlerChangeSettingBtn.bind(that),
      that.listernerBackupid
    ); //改变设置按钮状态的事件：
    eventObjectDefine.CoreController.addEventListener(
      "userListClose",
      that.triggerItem.bind(that, "userList", "close"),
      that.listernerBackupid
    ); //改变设置按钮状态的事件：
    eventObjectDefine.CoreController.addEventListener(
      "CoursewareRemove",
      that.triggerItem.bind(that, "courseware", "close"),
      that.listernerBackupid
    ); //改变设置按钮状态的事件：
    eventObjectDefine.CoreController.addEventListener(
      "colose_holdArr",
      that.triggerItem.bind(that, "toolKit", "close"),
      that.listernerBackupid
    ); //改变设置按钮状态的事件：
    eventObjectDefine.CoreController.addEventListener(
      "triggerControlPanelRecover",
      that.triggerItem.bind(that, "option", "close"),
      that.listernerBackupid
    ); //改变设置按钮状态的事件：
    eventObjectDefine.CoreController.addEventListener(
      "closeChatBox",
      that.triggerItem.bind(that, "chat", "close"),
      that.listernerBackupid
    ); //改变设置按钮状态的事件：
    eventObjectDefine.CoreController.addEventListener(
      TkConstant.EVENTTYPE.RoomEvent.roomPubmsg,
      that.handlePummsg.bind(that),
      that.listernerBackupid
    ); //roomDelmsg 事件
    eventObjectDefine.CoreController.addEventListener(
      TkConstant.EVENTTYPE.RoomEvent.roomDelmsg,
      that.handlerRoomDelmsg.bind(that),
      that.listernerBackupid
    ); //roomDelmsg 事件
    eventObjectDefine.CoreController.addEventListener(
      "receive-msglist-ClassBegin",
      this.classBegin.bind(this),
      this.listernerBackupid
    );
    eventObjectDefine.CoreController.addEventListener(
      "updateAppPermissions_canDraw",
      this._changeCanDrawPermissions.bind(this),
      this.listernerBackupid
    );
    eventObjectDefine.CoreController.addEventListener(
      "isholdAllShow",
      this.toolKitShow.bind(this),
      this.listernerBackupid
    );
    eventObjectDefine.CoreController.addEventListener(
      TkConstant.EVENTTYPE.RoomEvent.roomTextMessage,
      that.handleMessage.bind(that),
      that.listernerBackupid
    ); //监听服务器的广播聊天消息
    eventObjectDefine.CoreController.addEventListener(
      TkConstant.EVENTTYPE.RoomEvent.roomUserpropertyChanged,
      that.handlerRoomUserpropertyChanged.bind(that),
      that.listernerBackupid
    ); //room-userproperty-changed事件-收到参与者属性改变后执行
    eventObjectDefine.CoreController.addEventListener(
      "isholdAllShow",
      that.handlerHoldAllShow.bind(that),
      that.listernerBackupid
    );

    eventObjectDefine.CoreController.addEventListener(
      "receiveWhiteboardSDKAction",
      this.courseMp4Play.bind(this),
      this.listernerBackupid
    );

    eventObjectDefine.CoreController.addEventListener(
      "triggerSwitchLayout",
      that.beyondTmplHandler.bind(that),
      that.listernerBackupid
    );
    eventObjectDefine.CoreController.addEventListener(
      "receive-msglist-SwitchLayout",
      that.handleMsgListSwitchLayout.bind(that),
      that.listernerBackupid
    ); //监听断线重连切换布局信令
    eventObjectDefine.CoreController.addEventListener(
      "togo_layout",
      that.handlerTogoLayout.bind(that),
      that.listernerBackupid
    ); //本地切换布局
    eventObjectDefine.CoreController.addEventListener(
      "room-text-message-list",
      that.handlerRoomTextMessageList.bind(that),
      that.listernerBackupid
    ); //批量处理聊天消息的添加
    eventObjectDefine.CoreController.addEventListener(
      "hasToolBox",
      that.handlerHasToolBox.bind(that),
      that.listernerBackupid
    );//是否显示工具箱
    eventObjectDefine.CoreController.addEventListener(
       TkConstant.EVENTTYPE.RoomEvent.roomUserscreenstateChanged,
       this.roomUserscreenstateChanged.bind(this),
       this.listernerBackupid
    );//桌面共享工具栏状态
  }

  handlerHasToolBox(data) {
    let { isHasToolBox } = data.message;
    this.setState({
      isHasToolBox: isHasToolBox
    })
  }

  handleFullScreenChange(){
      this.setState({
        isFullScreen:TkUtils.tool.isFullScreenStatus()
      })
  }

    roomUserscreenstateChanged(event) {
        let {message} = event;
        if (message && message.type === 'screen') {
            TkGlobal.shareToolsBarShow = !message.published;
            this.setState({
                isHasToolBox: TkGlobal.shareToolsBarShow
            })
            if (!message.published) {
                eventObjectDefine.CoreController.dispatchEvent({
                    type: 'colse-holdAll-item',
                    message: {
                        type: 'sharing'
                    }
                });
            }
        }

    }



    // 播放媒体库MP4时  隐藏工具箱按钮
  courseMp4Play(data) {
    const { message } = data || {};
    let state = false;
    if (message.cmd && message.cmd.streamType && message.cmd.type) {
      state =
        message.cmd.playerType === "videoPlayer" &&
        (message.cmd.streamType === "media"|| message.cmd.streamType === "file") &&
        (message.cmd.type === "start" || message.cmd.type === "play");   
    } 
    if (TkGlobal.isMovieSharePlay && message.cmd.playerType === "videoPlayer"){
      if (message.cmd && message.cmd.type === "pause") {
        TkGlobal.movieShareStatus = false;
      } else if (message.cmd && message.cmd.type === "play") {
        TkGlobal.movieShareStatus = true;
      } else if (message.cmd && message.cmd.type === "end") {
        TkGlobal.isMovieSharePlay = false;
      }
    }
    
    this.setState({
      isCourseMp4Play: state
    });
  }

  //处理本地切换布局
  handlerTogoLayout(data) {
    let that = this;
    let { nowLayout } = data.message;
    if (nowLayout === "Encompassment") {
      this.setState({
        unReadMessages: 0,
        nowLayout: nowLayout
      });
      if (this.state.chat) {
        //如果聊天框已经开启就关闭聊天框
        this.buttonClick("chat");
      }
    } else {
      this.setState({
        nowLayout: nowLayout
      });
    }
  }
  //处理断线重连切换布局
  handleMsgListSwitchLayout(data) {
    if (data.message.nowLayout === "Encompassment") {
      this.setState({
        unReadMessages: 0,
        nowLayout: data.message.nowLayout
      });
      // if(this.state.chat){  //如果聊天框已经开启就关闭聊天框
      //   this.buttonClick("chat");
      // }
    } else {
      this.setState({
        nowLayout: data.message.nowLayout
      });
    }
  }
  handlerChangeSettingBtn() {
    this.setState({ settingActive: false });
  }

  /* 未读消息 大并发 */
  handlerRoomTextMessageList(roomTextMessageListDate){
    let that = this;
    let messageList = roomTextMessageListDate.message;
    if (!this.state.chat && this.state.nowLayout !== "Encompassment" && Array.isArray(messageList) && messageList.length) {
      this.setState({
        unReadMessages:
          parseInt(this.state.unReadMessages + parseInt(messageList.length) ) < 99 ? parseInt(this.state.unReadMessages + parseInt(messageList.length) ) : parseInt(this.state.unReadMessages + parseInt(messageList.length) ) + '+'
      });
    }
  }

  /* 未读消息 */
  handleMessage(e) {
    if (!this.state.chat && this.state.nowLayout !== "Encompassment") {
      this.setState({
        unReadMessages: parseInt(this.state.unReadMessages + 1) < 99 ? parseInt(this.state.unReadMessages + 1) : parseInt(this.state.unReadMessages + 1) + '+'
      });
    }
  }

  toolKitShow(event) {
    if (event && event.message && event.message.isShowData) {
      const data = event.message.isShowData;

      if (Object.values(data).every(i => i.isShow === false)) {
        this.setState({ toolKit: false });
      }
    }
  }

  /*处理room-userproperty-changed事件*/
  handlerRoomUserpropertyChanged(roomUserpropertyChangedEventData) {
    let raisehand = roomUserpropertyChangedEventData.message.raisehand;
    if (raisehand !== undefined && raisehand !== null) {
      this.setState({
        isHasHand: this.state.userList ? false : raisehand,
        handShow: this.state.userList ? false : raisehand,
      });
      if (raisehand) {
        let handShowTimer = setTimeout(() => {
          clearTimeout(handShowTimer);
          this.setState({
            handShow: false,
          });
        }, 3000);
      }
    }
  }

  /*改变可画权限*/
  _changeCanDrawPermissions() {
    // let shareFlag = CoreController.handler.getAppPermissions('canDraw');
    // if(!shareFlag){
    //     let defaultWhiteboardToolViewRoot=document.getElementById('defaultWhiteboardToolViewRoot');
    //     defaultWhiteboardToolViewRoot.style.display='none';
    // }
    const canDraw = this.getCanDraw();
    this.setState({ canDraw });
  }

  handlePummsg(recvEventData) {
    let pubmsgData = recvEventData.message;
    switch (pubmsgData.name) {
      case "ClassBegin":
        this.classBegin();
        break;
      case "ChatShow":
        if (TkConstant.hasRole.roleRecord || TkConstant.hasRole.rolePlayback) {
          this.setState({
            chat: true,
            unReadMessages: 0
          });
          eventObjectDefine.CoreController.dispatchEvent({
            type: "CloseALLPanel"
          });
          eventObjectDefine.CoreController.dispatchEvent({
            type: "beyondTmplEvent",
            message: {
              key: "chat"
            }
          });
        }
        break;
      case "switchLayout":
        let nowLayout = pubmsgData.data.nowLayout;
        if (pubmsgData.data.nowLayout === "Encompassment") {
          this.setState({
            unReadMessages: 0,
            nowLayout: nowLayout,
            chat: false
          });
          // if(this.state.chat){  //如果聊天框已经开启就关闭聊天框
          //   this.buttonClick("chat");
          // }
        } else {
          this.setState({
            nowLayout: nowLayout
          });
        }
        break;
    }
  }

  handlerHoldAllShow(recvEventData) {
    let message = recvEventData.message;
    let flag = 0;
    for (let i in message.isShowData) {
      if (message.isShowData[i].isShow) {
        flag++;
      }
    }
    if (
      flag > 0 &&
      TkGlobal.classBegin &&
      CoreController.handler.getAppPermissions("canDraw")
    ) {
      this.setState({ isShowTools: true });
    } else {
      this.setState({
        isShowTools: false
      });
    }
  }

  classBegin() {
    eventObjectDefine.CoreController.dispatchEvent({
      type: "CloseALLPanel"
    });
    const canDraw = this.getCanDraw();
    this.setState({
      classBegin: true,
      canDraw
    });
  }

  getCanDraw() {
    return CoreController.handler.getAppPermissions("canDraw");
  }

  onResize(e) {
    //是否全屏
    let isFullscreen =
      document.fullscreenElement ||
      document.msFullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement ||
      false;
    if (isFullscreen) {
      this.setState({ isFullScreen: true });
    } else {
      this.setState({ isFullScreen: false });
    }
  }

  _openLoadDetectionDevice() {
    if (!this.state.settingActive) {
      eventObjectDefine.CoreController.dispatchEvent({
        type: "loadDetectionDevice",
        message: { check: false, main: true, bgImg: true }
      });
    }
    this.setState({ settingActive: true });
  }

  /*window.open(TkConstant.joinRoomInfo.jumpurl)*/
  _openHelpUrl() {
    if (!TkGlobal.isClient) {
      window.open(TkConstant.joinRoomInfo.helpcallbackurl);
    } else if (
      TkGlobal.isClient &&
      TkGlobal.clientversion >= 2018031000 &&
      ServiceRoom.getNativeInterface().clientOpenBrowserUrl
    ) {
      window.GLOBAL.openUrl(TkConstant.joinRoomInfo.helpcallbackurl);
    }
  }

  openUrl(url) {
    TkGlobal.isClient &&
      ServiceRoom.getNativeInterface().clientOpenBrowserUrl(url);
  }

  handlerRoomDelmsg(recvEventData) {
    let pubmsgData = recvEventData.message;
    switch (pubmsgData.name) {
      case "ClassBegin":
        eventObjectDefine.CoreController.dispatchEvent({
          type: "CloseALLPanel"
        });
        this.triggerItem("clear");
        let isLeave = true;
        if (
          !TkGlobal.classBegin &&
          TkGlobal.endClassBegin &&
          !TkConstant.hasRole.roleChairman &&
          !TkConstant.joinRoomInfo.isClassOverNotLeave
        ) {
          isLeave = true;
        } else {
          isLeave = false;
        }
        this.setState({
          isClassOverLeave: isLeave,
          classBegin: false,
          canDraw: false
        });
        break;

      case "ChatShow":
        if (TkConstant.hasRole.roleRecord || TkConstant.hasRole.rolePlayback) {
          this.setState({
            chat: false
          });
          eventObjectDefine.CoreController.dispatchEvent({
            type: "CloseALLPanel"
          });
        }
        break;
    }
  }

  buttonClick(key) {
    switch (key) {
      case "help":
        this.state.isFullScreen && this.setState({ isFullScreen: false });
        this._openHelpUrl();
        return;
        break;

      case "fullScreen":
        this.state.isFullScreen
          ? TKUtils.tool.exitFullscreen()
          : TKUtils.tool.launchFullscreen(document.body);
        // this.setState({ isFullScreen: !this.state.isFullScreen });
        return;
        break;

      case "setting":
        this._openLoadDetectionDevice();
        break;

      case "chat":
        eventObjectDefine.CoreController.dispatchEvent({
          type: "CloseALLPanel"
        });
        break;

      case "userList":
        this.setState({
          isHasHand: false,
        });
        break;

      default:
        break;
    }
    eventObjectDefine.CoreController.dispatchEvent({
      type: "beyondTmplEvent",
      message: {
        key
      }
    });

    if (key === "setting") return;

    this.triggerItem(key);
  }

  triggerItem(key, type, event) {
    if (event && event.type) {
      this.setState({ [key]: false });
      if (type) {
        this.isMoodUserLishPanel = false;
        this.isMoodControlPanel = false;
        this.setState({
          chat: false
        });
        this.setState({
          isLibraryActive: false
        });
        this.setState({
          isHoldAllShow: false
        });
      }
      if (
        TkConstant.hasRole.roleChairman &&
        TkGlobal.classBegin &&
        key === "chat"
      ) {
        ServiceSignalling.sendChatShow(true);
      }
      return;
    }
    if (this.state[key]) {
      this.setState({ [key]: false });
      if (
        TkConstant.hasRole.roleChairman &&
        TkGlobal.classBegin &&
        key === "chat"
      ) {
        ServiceSignalling.sendChatShow(true);
      }
    } else {
      this.setState({ [key]: true });
      if (key === "chat") this.setState({ unReadMessages: 0 });
      if (
        TkConstant.hasRole.roleChairman &&
        TkGlobal.classBegin &&
        key === "chat"
      ) {
        ServiceSignalling.sendChatShow(false);
      }
    }
  }

  beyondTmplHandler(e) {
    if (e.message) {
      const { key } = e.message;
      if (key !== "switchLayout") {
        this.closeSwitchLayout();
      }

      switch (key) {
        case "toolKit":
          this.togoHoldAll();
          break;

        case "userList":
          this.triggerUserListPanel();
          break;

        // case "courseware":
        //   this.handlerCoursewareClick();
        //   break;

        case "option":
          this.triggerControlPanel();
          break;

        case "switchLayout":
          this.triggerSwitchLayout();
          break;

        case "courseware":
          this.handlercourseListClick();
          break;

        default:
          break;
      }
    }
  }

  closeSwitchLayout() {
    this.setState({ layoutActive: false });
    eventObjectDefine.CoreController.dispatchEvent({
      type: "triggerSwitchLayout",
      layoutActive: false
    });
  }

  triggerSwitchLayout() {
    this.setState({ layoutActive: !this.state.layoutActive });
    eventObjectDefine.CoreController.dispatchEvent({
      type: "triggerSwitchLayout",
      layoutActive: !this.state.layoutActive
    });
    eventObjectDefine.CoreController.dispatchEvent({ type: "CloseALLPanel" }); //派发关闭所有面板的事件
  }

  //切换工具箱状态
  togoHoldAll() {
    eventObjectDefine.CoreController.dispatchEvent({ type: "CloseALLPanel" });
    let that = this;
    let isHoldAllShow = !that.state.isHoldAllShow;
    eventObjectDefine.CoreController.dispatchEvent({
      type: "togo_holdArr",
      isShow: isHoldAllShow
    });
    that.setState({
      isHoldAllShow: isHoldAllShow
    });
  }

  // 触发用户列表面板
  triggerUserListPanel() {
    if (this.isMoodUserLishPanel) {
      eventObjectDefine.CoreController.dispatchEvent({
        type: "CloseUserListPanel"
      });
      this.setState({
        isSincereUserListActive: false,
        isNoticeHands: false
      });
      this.isMoodUserLishPanel = false;
    } else {
      eventObjectDefine.CoreController.dispatchEvent({ type: "CloseALLPanel" });
      eventObjectDefine.CoreController.dispatchEvent({type: "triggerUserListPanel"});
      this.setState({
        isSincereUserListActive: true,
        isNoticeHands: false
      });
      this.isMoodUserLishPanel = true;
    }
  }

  // // 触发课件库
  // handlerCoursewareClick() {
  //   if (this.state.isLibraryActive) {
  //     eventObjectDefine.CoreController.dispatchEvent({ type: "CloseLibrary" });
  //     this.setState({
  //       isLibraryActive: false
  //     });
  //   } else {
  //     eventObjectDefine.CoreController.dispatchEvent({ type: "CloseALLPanel" });
  //     eventObjectDefine.CoreController.dispatchEvent({
  //       type: "CoursewareClick"
  //     });
  //     this.setState({
  //       isLibraryActive: true
  //     });
  //   }
  // }

  handlercourseListClick() {
    if (this.state.isLibraryActive) {
      eventObjectDefine.CoreController.dispatchEvent({ type: "CloseLibrary" });
      this.setState({
        isLibraryActive: false
      });
    } else {
      eventObjectDefine.CoreController.dispatchEvent({ type: "CloseALLPanel" });
      eventObjectDefine.CoreController.dispatchEvent({
        type: "CourseListClick"
      });
      this.setState({
        isLibraryActive: true
      });
    }
  }

  triggerControlPanel() {
    if (this.isMoodControlPanel) {
      eventObjectDefine.CoreController.dispatchEvent({
        type: "CloseControlPanel"
      });
      this.setState({
        isSincereActive: false
      });
      this.isMoodControlPanel = false;
    } else {
      eventObjectDefine.CoreController.dispatchEvent({ type: "CloseALLPanel" });
      eventObjectDefine.CoreController.dispatchEvent({
        type: "triggerControlPanel"
      });
      this.setState({
        isSincereActive: true
      });
      this.isMoodControlPanel = true;
    }
  }

  render() {
    const {
      settingActive,
      layoutActive,
      isClassOverLeave,
      classBegin,
      isFullScreen,
      userList,
      courseware,
      toolKit,
      option,
      isHasHand,
      handShow,
      chat,
      unReadMessages,
      isCourseMp4Play,
      nowLayout,
      isShowTools,
      isHasToolBox
    } = this.state;
    return (

        <div className="Tk-header-othericon" style={{display: isHasToolBox ? '' : 'none'}}>
            {isHasHand && !TkConstant.hasRole.roleStudent && handShow ?(
                <div className={`showHand`}>{TkGlobal.language.languageData.header.system.Raise.hashand}</div>)
                : null}

            {!isClassOverLeave && !TkGlobal.playback && !TkConstant.hasRole.roleStudent ? (
              <ToolIConUserList
                userList={userList}
                isHasHand={isHasHand}
                buttonClick={this.buttonClick.bind(this, "userList")}
              />
            ) : null}
        {!isClassOverLeave && !TkGlobal.playback && CoreController.handler.getAppPermissions("loadCoursewarelist") || (TkConstant.hasRole.roleStudent && !TkGlobal.classBegin)? (
              <ToolIconResourceLibrary
                courseware={courseware}
                isCourseMp4Play={isCourseMp4Play}
                buttonClick={this.buttonClick.bind(this, "courseware")}
              />
            ) : null}
            {!isClassOverLeave && !TkGlobal.playback  ? (
              <ToolIconToolBox
                isShowTools={isShowTools}
                toolKit={toolKit}
                classBegin={classBegin}
                isCourseMp4Play={!isCourseMp4Play}
                buttonClick={this.buttonClick.bind(this, "toolKit")}
              />
            ) : null}
            {!isClassOverLeave && !TkConstant.hasRoomtype.oneToOne && !TkGlobal.playback ? (
              <ToolIconOverall
                option={option}
                classBegin={classBegin}
                buttonClick={this.buttonClick.bind(this, "option")}
              />
            ) : null}
            {/* {!TkGlobal.playback ? (
              <ToolIconMessage
                chat={chat}
                buttonClick={this.buttonClick.bind(this, "chat")}
                isClassOverLeave={isClassOverLeave}
                unReadMessages={unReadMessages}
                isEncompassment={nowLayout === "Encompassment"}
              />
            ) : null} */}
            {/* {!TkConstant.hasRole.roleStudent && !TkConstant.hasRole.rolePatrol && !TkGlobal.playback && !TkConstant.hasRoomtype.oneToOne && (!TkConstant.hasRoomtype.oneToOne && !TkGlobal.roomChange) ? (
                <SwitchLayoutBtn
                    buttonClick={this.buttonClick.bind(this, "switchLayout")}
                    layoutActive={layoutActive}
                />
            ) : null} */}
            {TkConstant.joinRoomInfo.helpcallbackurl && !isClassOverLeave && !TkGlobal.playback ? (
              <ToolIconSeekHelp buttonClick={this.buttonClick.bind(this, "help")} />
            ) : null}
            {!TkConstant.hasRole.rolePatrol && !isClassOverLeave && !TkGlobal.playback ? (
              <ToolIconSetting
                buttonClick={this.buttonClick.bind(this, "setting")}
                settingActive={settingActive}
              />
            ) : null}



            {/* {!TkGlobal.isClient && !TkGlobal.playback ? (
              <ToolIconFull
                buttonClick={this.buttonClick.bind(this, "fullScreen")}
                isFullScreen={isFullScreen}
              />
            ) : null} */}
        </div>
    );
  }
}

export default HeaderIConButton;
