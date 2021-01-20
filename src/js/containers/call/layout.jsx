import React from "react";
import { ReflexProvider, Flex, Box } from "reflexbox";
import RightContentVesselSmart from "./mainVessel/leftVessel/rightContentVessel/rightContentVessel";
import eventObjectDefine from "eventObjectDefine";
import ServiceSignalling from "ServiceSignalling";
import TkConstant from "TkConstant";
import TkGlobal from "TkGlobal";
import RightVesselSmart from "./mainVessel/rightVessel/rightVessel";
import { StudentVideoList, TeacherVideoList } from "./baseVideo/videoList";


import './layout.css';
import RightChatBox from './containers/Chat/rightChartBox';
const space = [0, 0, 0, 0, 0];
const percent = 1 / 7;
const widthPercent = 1 / 4;

class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    //   videoOrder: 0,
    //   blackBroadOrder: 1,
    //   videoWidth: 1,
    //   blackBroadWidth: 1,
    //   teacherVideoWidth: percent,
    //   column: true,
    //   videoWrap: false,
    //   showChatVessel: false,
    //   pureVideoMod: false,
    //   fullScreen: false,
    //   layoutName: 'CoursewareDown',
        column: false,
        blackBroadOrder: 0,
        videoOrder: 1,
        videoWidth: widthPercent,
        blackBroadWidth: 1 - widthPercent,
        videoWrap: true,
        teacherVideoWidth: 1,
        showChatVessel: true,
        pureVideoMod: false,
        layoutName: 'Encompassment',

        areaExchangeFlag: false, //视频交换
        streams: [], //做切换视频流缓存
        isVideoLoad: false //视频组件是否加载完成，用于给白板区添加自适应高度
    };
    this.areaExchangeStyle = {};
  }
  componentDidMount() {
    eventObjectDefine.CoreController.addEventListener(
      "SwitchLayout",
      this.handleSwitchLayout.bind(this),
      this.listernerBackupid
    ); //监听切换布局的事件
    eventObjectDefine.CoreController.addEventListener(
      TkConstant.EVENTTYPE.RoomEvent.roomPubmsg,
      this.handlerRoomPubmsg.bind(this),
      this.listernerBackupid
    );
    eventObjectDefine.CoreController.addEventListener(
      "receive-msglist-SwitchLayout",
      this.handleMsgListSwitchLayout.bind(this),
      this.listernerBackupid
    ); //监听断线重连切换布局信令
    eventObjectDefine.CoreController.addEventListener(
      "asyncRenderBoard",
      this.handleAsyncRenderBoard.bind(this),
      this.listernerBackupid
    );
    eventObjectDefine.CoreController.addEventListener(
      "saveSwicthVideoStream",
      this.saveSwicthVideoStream.bind(this),
      this.listernerBackupid
    ); // 区域交换事件监听
    // eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDelmsg, this.handlerRoomDelmsg.bind(this), this.listernerBackupid); //roomDelmsg事件

    const layoutParams = {
      'layout_1': 'CoursewareDown',
      'layout_2': 'VideoDown',
      'layout_3': 'Encompassment',
      'layout_4': 'Bilateral',
      'layout_5': 'MorePeople',
    }
    eventObjectDefine.CoreController.dispatchEvent({ type: "SwitchLayout", nowLayout: layoutParams[TkConstant.layout] })  //派发切换布局事件
  }

  componentDidUpdate() {
    // 切换布局后更新白板偏移量TkGlobal.dragRange
    eventObjectDefine.CoreController.dispatchEvent({
      type: "SwitchLayoutAfter",
      message: {}
    });
  }
  //处理断线重连切换布局信令
  handleMsgListSwitchLayout(data) {
    if (data.message.nowLayout) {
      this._SwitchLayout(data.message.nowLayout);
    }
  }
  handlerRoomPubmsg(recvEventData) {
    let pubmsgData = recvEventData.message;
    switch (pubmsgData.name) {
      case "switchLayout":
        this._SwitchLayout(pubmsgData.data.nowLayout);
        break;
      // case "FullScreen":
      //   if(!pubmsgData.data.needPictureInPictureSmall){
      //     this._SwitchLayout("FullScreen");
      //   }
      //   break;
    }
  }

  // handlerRoomDelmsg(recvEventData) {
  //   let pubmsgData = recvEventData.message;
  //   switch(pubmsgData.name){
  //     case "FullScreen":
  //       this._SwitchLayout("FullScreen");
  //     break;
  //   }
  // }

  //处理监听视频组件加载
  handleAsyncRenderBoard(data) {
    //由于渲染速度的原因，只能延时改变状态达到切换的效果
    setTimeout(() => {
      this.setState({ isVideoLoad: true });
    }, 100);
  }

  //处理监听切换布局的事件
  handleSwitchLayout(data) {
    let {
      nowLayout, //当前布局
      isSynStudent //是否同步学生端
    } = data;
    eventObjectDefine.CoreController.dispatchEvent({
      //初始化视频框的位置（拖拽和分屏）
      type: "oneKeyRecovery",
      message: {}
    });
    if (isSynStudent) {
      ServiceSignalling.sendSignllingSwitchLayout({ nowLayout });
    } else {
      //如果不同步学生端就分发事件
      eventObjectDefine.CoreController.dispatchEvent({
        type: "togo_layout",
        message: {
          nowLayout
        }
      });
    }
    this._SwitchLayout(nowLayout);
  }

  saveSwicthVideoStream(data) {
    this.setState({
      streams: data.streams
    });
  }

  // 更新流的变化
  streamChange(streams) {
    this.setState({
      streams
    });
    if ((this.layoutName !== "MorePeople" || this.layoutName !== "Bilateral") && streams.length > 7) { // 视频列表超出7路切换成多人视频模式
      this._SwitchLayout("MorePeople");
      eventObjectDefine.CoreController.dispatchEvent({ type: "SwitchLayout", nowLayout: "MorePeople" })  //派发切换布局事件
    }
  }

  //切换布局执行方法
  _SwitchLayout(nowLayout) {
    // if (nowLayout === 'FullScreen') {
    //   this.methods().method7();
    //   return false;
    // }
    // if (videosLength >= 8 && (nowLayout !== 4 || nowLayout !== 5)) {
    //   alert("8人以上只能切换4，5方法");
    //   return false;
    // }
    switch (nowLayout) {
      case "CoursewareDown": //课件置底
        this.methods().method3();
        break;
      case "VideoDown": //视频置底
        this.methods().method2();
        break;
      case "Encompassment": //围绕型
        this.methods().method3();
        break;
      case "Bilateral": //主讲模式
        this.methods().method5();
        break;
      case "MorePeople": //多人模式
        this.methods().method4();
        break;
      case "OnlyVideo": //纯视频
        this.methods().method6();
        break;
      default:
        break;
    }
    TkGlobal.isVideoInFullscreen = false
  }

  methods() {
    const method1 = () => {
      this.setState({
        column: true,
        blackBroadOrder: 1,
        videoOrder: 0,
        videoWidth: 1,
        blackBroadWidth: 1,
        videoWrap: false,
        teacherVideoWidth: percent,
        showChatVessel: false,
        pureVideoMod: false,
        layoutName: 'CoursewareDown'
      });
    };
    const method2 = () => {
      this.setState({
        column: true,
        blackBroadOrder: 0,
        videoOrder: 1,
        videoWidth: 1,
        blackBroadWidth: 1,
        videoWrap: false,
        teacherVideoWidth: percent,
        showChatVessel: false,
        pureVideoMod: false,
        layoutName: 'VideoDown'
      });
    };
    const method3 = () => {
      this.setState({
        column: false,
        blackBroadOrder: 0,
        videoOrder: 1,
        videoWidth: widthPercent,
        blackBroadWidth: 1 - widthPercent,
        videoWrap: true,
        teacherVideoWidth: 1,
        showChatVessel: true,
        pureVideoMod: false,
        layoutName: 'Encompassment'
      });
    };
    const method4 = () => {
      this.setState({
        column: false,
        blackBroadOrder: 0,
        videoOrder: 1,
        videoWidth: widthPercent,
        blackBroadWidth: 1 - widthPercent,
        videoWrap: true,
        teacherVideoWidth: 1 / 2,
        showChatVessel: false,
        pureVideoMod: false,
        layoutName: 'MorePeople'
      });
    };
    const method5 = () => {
      this.setState({
        column: false,
        blackBroadOrder: 0,
        videoOrder: 1,
        videoWidth: widthPercent,
        blackBroadWidth: 1 - widthPercent,
        videoWrap: true,
        teacherVideoWidth: 1,
        showChatVessel: false,
        pureVideoMod: false,
        layoutName: 'Bilateral'
      });
    };
    const method6 = () => {
      this.setState({
        column: true,
        blackBroadOrder: 0,
        videoOrder: 1,
        videoWidth: 1,
        blackBroadWidth: 1,
        videoWrap: false,
        teacherVideoWidth: percent,
        showChatVessel: false,
        pureVideoMod: true,
        layoutName: 'OnlyVideo'
      });
    };
    const method7 = () => {
      const fullScreen = this.state.fullScreen;
      this.setState({
        fullScreen: !fullScreen,
        pureVideoMod: false
      });
    };

    return {
      method1: method1,
      method2: method2,
      method3: method3,
      method4: method4,
      method5: method5,
      method6: method6,
      method7: method7
    };
  }
  BrowserCheck() {
    var N = navigator.appName, ua = navigator.userAgent, tem;
    var M = ua.match(/(opera|chrome|safari|firefox|msie|trident)\/?\s*(\.?\d+(\.\d+)*)/i);
    if (M && (tem = ua.match(/version\/([\.\d]+)/i)) != null) { M[2] = tem[1]; }
    M = M ? [M[1], M[2]] : [N, navigator.appVersion, '-?'];
    return M;
  }


  render() {
    const {
      videoOrder,
      blackBroadOrder,
      videoWidth,
      blackBroadWidth,
      teacherVideoWidth,
      column,
      videoWrap,
      showChatVessel,
      pureVideoMod,
      fullScreen
    } = this.state;
    let info = this.BrowserCheck()
    let version = info[1].split('.');
    let isChrome49 = info[0] == "Chrome" && +version[0] <= 51;
    // return (
    //   <div style={{ height: "calc( 100% - 0.42rem)" }}>
    //     {/* {fullScreen ? (
    //       <FullScreen {...this.state} percent={percent} videos={videos}></FullScreen>
    //     ) : ( */}
    //     <ReflexProvider space={space} style={{ height: "100%" }}>
    //       <Flex column={column} style={{ height: "100%" }}>
    //         {/* 视频列表 */}
    //         {/* <Box style={videoListStyle} w={videoWidth} order={videoOrder} className={`videoListBox ${this.state.layoutName}`}> */}
    //         {/* 右侧视频&聊天框 */}
    //         <Flex order={videoOrder} className={`videoListBox ${this.state.layoutName}`} justify={column ? "center" : null} p={0} wrap={videoWrap} style={showChatVessel ? { flexDirection: 'column', flex: column ? 1 : 'unset', height: '100%', width: "25%" } : { alignContent: "flex-start" , maxWidth: !column ? '25%' : '100%' }} >
    //           <TeacherVideoList className={`teacherList ${this.state.layoutName}`} layoutName={this.state.layoutName} />
    //           {!showChatVessel ? (
    //             <StudentVideoList
    //               className={`studentList ${this.state.layoutName}`}
    //               layoutName={this.state.layoutName}
    //               stream={this.state.streams}
    //               streamChange={this.streamChange.bind(this)}
    //             />
    //           ) : (
    //               <Flex style={{ flex: 1, position: 'relative' }} w={teacherVideoWidth} p={0}>
    //                 <RightChatBox isChrome49={isChrome49} />
    //               </Flex>
    //             )}
    //         </Flex>
    //         {/* </Box> */}
    //         {/* 白板区 */}

    //         <Flex style={isChrome49 ? { position: 'relative', width: '100%', flex: '1' } : { width: '100%', flex: '1' }} order={blackBroadOrder} >
    //             <Flex column justify={"center"} style={isChrome49 ? this.state.layoutName == 'Encompassment' ? { position: 'relative', width: '100%' } : { height: "100%", width: '100%', position: 'absolute' } : { height: "100%", width: '100%' }}>
                    
    //                 {showChatVessel ? ( 
    //                     <Flex w={1} justify={'center'} style={isChrome49 ? { position: 'absolute', bottom: '0' } : {}}>
    //                         <StudentVideoList stream={this.state.streams} layoutName={this.state.layoutName} streamChange={this.streamChange.bind(this)}></StudentVideoList>
    //                     </Flex>
    //                 ) : null}
    //                 {/* atTyr -- xuaiugai */}
    //                 {pureVideoMod ? ( 
    //                     <Box> 
    //                         <TeacherVideoList />  
    //                     </Box> 
    //                 ) : (
    //                     <Box style={!showChatVessel ? { height: "100%" } : isChrome49 ? { height: "100%", width: '100%', position: 'absolute', top: '0', paddingBottom: '2rem' } : { flex: 1 }}>
    //                         <RightContentVesselSmart areaExchangeFlag={this.state.areaExchangeFlag} />
    //                         {/*主体内容区域*/}
    //                     </Box>
    //                 )}
    //             </Flex>
    //         </Flex>
    //       </Flex>
    //     </ReflexProvider>
    //     {/* )} */}
    //   </div>
    // );
    return (
        <div style={{ height: "calc( 100% - 0.42rem)" }}>
          {/* {fullScreen ? (
            <FullScreen {...this.state} percent={percent} videos={videos}></FullScreen>
          ) : ( */}
          <ReflexProvider space={space} style={{ height: "100%" }}>
            <Flex column={column} style={{ height: "100%" }}>
              {/* 视频列表 */}
              {/* <Box style={videoListStyle} w={videoWidth} order={videoOrder} className={`videoListBox ${this.state.layoutName}`}> */}
              <Flex order={videoOrder} className={`videoListBox ${this.state.layoutName}`} justify={column ? "center" : null} p={0} wrap={videoWrap} style={showChatVessel ? { flexDirection: 'column', flex: column ? 1 : 'unset', height: '100%', width: "25%" } : { alignContent: "flex-start" , maxWidth: !column ? '25%' : '100%' }} >
                <TeacherVideoList className={`teacherList ${this.state.layoutName}`} layoutName={this.state.layoutName} />
                {!showChatVessel ? (
                  <StudentVideoList
                    className={`studentList ${this.state.layoutName}`}
                    layoutName={this.state.layoutName}
                    stream={this.state.streams}
                    streamChange={this.streamChange.bind(this)}
                  />
                ) : (
                    <Flex style={{ flex: 1, position: 'relative' }} w={teacherVideoWidth} p={0}>
                      <RightChatBox isChrome49={isChrome49} />
                    </Flex>
                  )}
              </Flex>
              {/* </Box> */}
              {/* 白板区 */}
  
              <Flex
                style={isChrome49 ? { position: 'relative', width: '100%', flex: '1' } : { width: '100%', flex: '1' }}
                order={blackBroadOrder}
              >
                <Flex column justify={"center"} style={isChrome49 ? this.state.layoutName == 'Encompassment' ? { position: 'relative', width: '100%' } : { height: "100%", width: '100%', position: 'absolute' } : { height: "100%", width: '100%' }}>
                  {pureVideoMod ? (
                    <Box>
                      <TeacherVideoList />
                    </Box>
                  ) : (
                      <Box style={!showChatVessel ? { height: "100%" } : isChrome49 ? { height: "100%", width: '100%', position: 'absolute', top: '0', paddingBottom: '2rem' } : { flex: 1 }}>
                        <RightContentVesselSmart
                          areaExchangeFlag={this.state.areaExchangeFlag}
                        />
                        {/*主体内容区域*/}
                      </Box>
                    )}
  
                  {showChatVessel ? (
                    <Flex w={1} justify={'center'} style={isChrome49 ? { position: 'absolute', bottom: '0' } : {}}>
                      <StudentVideoList stream={this.state.streams} layoutName={this.state.layoutName} streamChange={this.streamChange.bind(this)}></StudentVideoList>
                    </Flex>
                  ) : null}
                </Flex>
              </Flex>
            </Flex>
          </ReflexProvider>
          {/* )} */}
        </div>
      );
  }
}

export default Layout;
