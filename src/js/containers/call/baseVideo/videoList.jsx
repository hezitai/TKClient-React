/**
 * 视频显示部分-底部和右侧所有视频组件的Smart模块
 * @module BaseVideoSmart
 * @description   承载左侧部分-底部所有组件
 * @author xiagd
 * @date 2017/08/11
 */

import React from 'react';
import ReactDom from 'react-dom';
import ServiceRoom from 'ServiceRoom';
import TkUtils from 'TkUtils';
import TkGlobal from 'TkGlobal';
import TkConstant from "TkConstant";
import eventObjectDefine from 'eventObjectDefine';
import CoreController from 'CoreController';
import ServiceSignalling from 'ServiceSignalling';
import CommonVideoSmart from "./commonVideoSmart";
import VVideoContainer from "./VVideoContainer";
import SplitScreen from './SplitScreen';
import { Flex, Box } from "reflexbox";

class VideoList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            streams: [],
            pictureInPictureClassnameFromTeacherStream: undefined,
            pictureInPictureClassnameFromStudentStream: undefined,
            isHasCloseBtn: false,   //是否拥有关闭按钮
            otherVideoStyle: {},     // 原拖拽缩放样式
            otherVideoSize: {},      // 原拖拽缩放样式
            videoScreenId: undefined,   //全屏的视频id
            thisVideoFullStyle: null,
            nowLayout: null
        };
        this.videoControl = false;
        this.publishUserIdObj = {};
        this.maxVideoNumber = undefined;
        this.listernerBackupid = new Date().getTime() + '_' + Math.random();
        this.streamNumber = 0; //流的个数
        this.asyncRenderBoard = true;
        this.elementId = "hvideo_container";
    };

    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomUservideostateChanged, this._controlRemoteStreamFlag.bind(this, 'Video'), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomUseraudiostateChanged, this._controlRemoteStreamFlag.bind(this, 'Audio'), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomConnected, this.handlerRoomConnected.bind(this), this.listernerBackupid); //Room-Connected事件：房间连接事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDisconnected, this.handlerRoomDisconnected.bind(this), this.listernerBackupid); //Disconnected事件：失去连接事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDelmsg, this.handlerRoomDelmsg.bind(this), this.listernerBackupid); //roomDelmsg事件 下课事件 classBegin
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPubmsg, this.handlerRoomPubmsg.bind(this), this.listernerBackupid);//room-pubmsg事件：拖拽动作处理
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomUserpropertyChanged, this.handlerRoomUserpropertyChanged.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomParticipantLeave, this.handlerRoomParticipantLeave.bind(this), this.listernerBackupid); //room-participant_leave事件-收到有参与者离开房间
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPlaybackClearAllFromPlaybackController, this.handlerRoomPlaybackClearAll.bind(this), this.listernerBackupid); //roomPlaybackClearAll 事件：回放清除所有信令
        eventObjectDefine.CoreController.addEventListener("receive-msglist-ClassBegin", this.handlerReceiveMsglistClassBegin.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener('endClassbeginShowLocalStream', this.handlerEndClassbeginShowLocalStream.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener("receive-msglist-FullScreen", this.handlerReceiveMsglistFullScreen.bind(this), this.listernerBackupid); //处理断线重连全屏信令
        eventObjectDefine.CoreController.addEventListener('SwitchLayout', this.handleSwitchLayout.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener("receive-msglist-SwitchLayout", this.handleMsgListSwitchLayout.bind(this), this.listernerBackupid); //监听断线重连切换布局信令
        eventObjectDefine.CoreController.addEventListener(
            'receive-msglist-doubleClickVideo',
            this.handlerReceiveVideoDoubleClick.bind(this),
            this.listernerBackupid
        )
        if (this.props.stream && this.props.stream.length) {
            this.updateStreams(this.props.stream)
        }

        eventObjectDefine.Window.addEventListener(TkConstant.EVENTTYPE.WindowEvent.onResize, this.handlerOnResize.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener('changeOtherVideoStyle', this.changeOtherVideoStyle.bind(this), this.listernerBackupid); //更新底部视频的位置
        eventObjectDefine.CoreController.addEventListener('oneKeyRecovery', this.handlerOneKeyRecovery.bind(this), this.listernerBackupid); //分屏初始化
        // eventObjectDefine.CoreController.addEventListener('changeMainContentVesselSmartSize' , this.changeMainContentVesselSmartSize.bind(this)  , this.listernerBackupid) ; //改变视频框占底部的ul的高度的事件
        // eventObjectDefine.CoreController.addEventListener('receive-msglist-VideoSplitScreen' , this.handleReceiveMsglistVideoSplitScreen.bind(this)  , this.listernerBackupid) ; // 分屏msglist改变时的事件分发
        eventObjectDefine.CoreController.addEventListener('handleVideoDragListData', this.handleVideoDragListData.bind(this), this.listernerBackupid); // 分屏msglist改变时的事件分发
        eventObjectDefine.CoreController.addEventListener('handleVideoSizeListData', this.handleVideoSizeListData.bind(this), this.listernerBackupid); // 分屏msglist改变时的事件分发
        //eventObjectDefine.CoreController.addEventListener('fullScreen',this.handlerFullScreen.bind(this), this.listernerBackupid);   //本地全屏事件
        if(this.props.layoutName && this.props.layoutName != this.state.nowLayout ){
            this.setState({
                nowLayout: this.props.layoutName,
            })
        }
    };

    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        if (!TkGlobal.playback&&this.props.streamChange){
            this.props.streamChange(this.state.streams);
        }
        eventObjectDefine.CoreController.dispatchEvent({ type: "saveSwicthVideoStream", streams: this.state.streams });
        eventObjectDefine.CoreController.removeBackupListerner(this.listernerBackupid);
        eventObjectDefine.Window.removeBackupListerner(this.listernerBackupid);
    };

    componentDidUpdate(prevProps, prevState) {//每次render结束后会触发
        if ((this.state.streams && this.state.streams.length !== this.streamNumber)) {
            this.streamNumber = this.state.streams.length;
            // this._updateSystemStyleJsonValueByInnerKey();
        }
        if (prevProps.stream && this.props.stream && prevProps.stream.length != this.props.stream.length) {
            this.updateStreams(this.props.stream)
        }
    };
    handleMsgListSwitchLayout(data) {
        if (data.message.nowLayout) {
            this._setNowLayout(data.message.nowLayout);
        }
    }
    handleSwitchLayout(data) {
        this._setNowLayout(data.nowLayout);
    }
    _setNowLayout(nowLayout){
        this.setState({nowLayout:nowLayout});
        this.setState({videoScreenId:null});
        TkGlobal.isVideoDrag=false;
        this._calcVideoFullWhiteBoard();
        this.videoControl = true;
    }
    handlerReceiveVideoDoubleClick(recvEventData) {
        let { doubleId, isScreen } = recvEventData.message;
        this.switchVideoDoubleClick(doubleId, isScreen);
    }
    getVideoSize(layoutName) {    //根据布局计算视频宽高
        let videoWidth = null, videoHeight = null;
        const videoScale = TkConstant.joinRoomInfo.roomVideoHeight / TkConstant.joinRoomInfo.roomVideoWidth;
        if(layoutName !== null && layoutName !== undefined){
            switch (layoutName) {
                case "CoursewareDown": //课件置底
                    //hzt
                    videoWidth = this.props.isTeacher ? 100 / 4 : 100 * 0.75 / 6;
                    break;
                case "VideoDown": //视频置底
                    videoWidth = 100 / 7;
                    break;
                case "Encompassment": //围绕型
                    videoWidth = this.props.isTeacher ? 100 / 4 : 100 * 0.75 / 6;
                    break;
                case "Bilateral": //左右排列
                    videoWidth = this.props.isTeacher ? 100 / 4 : 100 / 8.28;
                    break;
                case "MorePeople": //超多人课堂
                    if(this.state.streams.length>3){
                        videoWidth = 100 / 8.28;
                    }else{
                        videoWidth = 100 / 8.28*2;
                    }
                    break;
                default:

                    break;
            }
        }else{
            videoWidth = 100 / 7;
        }
        videoHeight = videoWidth * videoScale;
        return { videoWidth, videoHeight };
    }
    //动态计算视频在白板上的大小
    _calcVideoFullWhiteBoard() {
        const defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
        let width = $("#lc-full-vessel").width();
        let height = $("#lc-full-vessel").height();
        let timer = setInterval(() => {
            let offset = $("#lc-full-vessel").offset();
            if (width == $("#lc-full-vessel").width() || height == $("#lc-full-vessel").height()) {
                clearInterval(timer);
                this.setState({
                    thisVideoFullStyle: {
                        position: 'absolute',
                        top: `${offset.top / defalutFontSize}rem`,
                        left: `${offset.left / defalutFontSize}rem`,
                        width: `${$("#lc-full-vessel").width() / defalutFontSize}rem`,
                        height: `${$("#lc-full-vessel").height() / defalutFontSize}rem`,
                        zIndex: '349'
                    }
                })
            }
        }, 100);
    }
    switchVideoDoubleClick(doubleId, blooean) {
        TkGlobal.isVideoDrag = blooean ? true : false;
        this._OneKeyReset();
        this._calcVideoFullWhiteBoard();
        this.setState({
            videoScreenId: blooean ? doubleId : undefined
        })
    }
    _OneKeyReset() {
        eventObjectDefine.CoreController.dispatchEvent({
          //初始化视频框的位置（拖拽和分屏）
          type: "oneKeyRecovery",
          message: {}
        });
      }
    // 处理本地全屏事件
    handlerFullScreen(msg) {
        let { isFullScreen, fullScreenType } = msg.message;
        if ((fullScreenType === 'courseware_file' || fullScreenType === 'stream_media') && !TkConstant.hasRoomtype.oneToOne) { //如果是课件全屏或者mp4全屏不进行响应
            // if(isFullScreen){
            //     let fullScreenData = {  //模拟的FullScreen信令数据
            //         data:{
            //             fullScreenType:fullScreenType ,
            //             needPictureInPictureSmall:true 
            //         }
            //     };
            //     this._handlerSignallingFullScreen(fullScreenData);
            // }else{
            //     this.setState({pictureInPictureClassnameFromTeacherStream:undefined,isHasCloseBtn:false});
            //     this.setState({pictureInPictureClassnameFromStudentStream:undefined});
            // }

        }
    }

    handlerEndClassbeginShowLocalStream() {
        if (TkConstant.joinRoomInfo.isClassOverNotLeave || (!TkConstant.joinRoomInfo.isClassOverNotLeave && TkConstant.joinRoomInfo.isBeforeClassReleaseVideo)) {
            return;
        }
        if (!TkConstant.hasRoomtype.oneToOne) {
            setTimeout(() => {
                if (CoreController.handler.getAppPermissions('endClassbeginShowLocalStream')) { //是否拥有下课后显示本地视频权限,并且是老师
                    if (this.state.streams.length === 0) {
                        this._addLocalStreamToVideoContainer();
                    }
                }
            }, 250);
        }
    };
    handlerReceiveMsglistFullScreen(recvEventData) {
        let { FullScreenArray } = recvEventData.message;
        this._handlerSignallingFullScreen(FullScreenArray[0]);
    };
    handlerOnResize() {
        for (let [key, value] of Object.entries(this.state.otherVideoSize)) {
            //限制视频大小,不能超出白板范围
            this.state.otherVideoSize[key] = this.limitVideoSize(value.videoWidth, value.videoHeight);
        }
        this.setState({
            otherVideoSize: this.state.otherVideoSize,
            otherVideoStyle: this.state.otherVideoStyle
        });
    };
    handlerRoomPubmsg(pubmsgDataEvent) {
        let pubmsgData = pubmsgDataEvent.message;
        switch (pubmsgData.name) {
            case "ClassBegin": {
                if (TkGlobal.playback) {//是直播或者回放不需要移除数据流
                    return;
                }
                //上课要删除本地流
                this._removeLocalStreamToVideoContainer();
                break;
            }
            case "LowConsume":
                this.maxVideoNumber = Number(pubmsgData.data.maxvideo);
                break;
            case "FullScreen":
                this._handlerSignallingFullScreen(pubmsgData);
                break;
            case "videoDraghandle":
                if (TkGlobal.playback && TkGlobal.roomlayout === '0') {
                    return;
                }
                if (pubmsgData.data.otherVideoStyle) {
                    for (let [key, value] of Object.entries(pubmsgData.data.otherVideoStyle)) {//兼容以前版本
                        let percentLeft = pubmsgData.data.otherVideoStyle[key].percentLeft;
                        let percentTop = pubmsgData.data.otherVideoStyle[key].percentTop;
                        if (value.left || value.top) {
                            percentLeft = value.left;
                            percentTop = value.top;
                            delete pubmsgData.data.otherVideoStyle[key].left;
                            delete pubmsgData.data.otherVideoStyle[key].top;
                        }
                        pubmsgData.data.otherVideoStyle[key].percentLeft = percentLeft < 0 ? 0 : (percentLeft > 1 ? 1 : percentLeft);
                        pubmsgData.data.otherVideoStyle[key].percentTop = percentTop < 0 ? 0 : (percentTop > 1 ? 1 : percentTop);
                    }
                    let otherVideoStyleCopy = Object.customAssign({}, this.state.otherVideoStyle);
                    otherVideoStyleCopy = Object.customAssign(otherVideoStyleCopy, pubmsgData.data.otherVideoStyle);
                    this.setState({
                        otherVideoStyle: otherVideoStyleCopy,
                    });
                }
                break;
            case "VideoChangeSize":
                if (TkGlobal.playback && TkGlobal.roomlayout === '0') {
                    return;
                }
                let { initVideoWidth, initVideoHeight } = this._getInitVideoSize();
                if (pubmsgData.data.ScaleVideoData) {
                    let { ScaleVideoData } = pubmsgData.data;
                    for (let [key, value] of Object.entries(ScaleVideoData)) {
                        this.state.otherVideoSize[key] = {
                            videoWidth: value.scale * initVideoWidth,
                            videoHeight: value.scale * initVideoWidth / TkGlobal.videoScale,
                        };
                    }
                } else if (pubmsgData.data.otherVideoSize) {//兼容以前版本
                    this.state.otherVideoSize = pubmsgData.data.otherVideoSize;
                } else {
                    return;
                }
                for (let [key, value] of Object.entries(this.state.otherVideoSize)) {
                    //限制视频大小,不能超出白板范围
                    this.state.otherVideoSize[key] = this.limitVideoSize(value.videoWidth, value.videoHeight);
                }
                this.setState({ otherVideoSize: this.state.otherVideoSize });
                break;
            case 'doubleClickVideo':
                this.switchVideoDoubleClick(pubmsgData.data.doubleId, pubmsgData.data.isScreen)
                break;
            case "switchLayout":
                this._setNowLayout(pubmsgData.data.nowLayout)
                break;
        }
    };
    handlerRoomParticipantLeave(handleData) {//用户离开房间时，删除该视频框的样式
        let id = handleData.user.id;
        // //其他人离开房间将他的视频样式和流数据删除
        // 拷贝
        let otherVideoStyle = { ...this.state.otherVideoStyle },
        otherVideoSize = { ...this.state.otherVideoSize },
        streams = [...this.state.streams]

        // 删除
        delete otherVideoStyle[id];
        delete otherVideoSize[id];
        streams = streams.filter(item => item.extensionId !== id)

        // 更新
        this.setState({
            otherVideoStyle,
            otherVideoSize
        });
        this.updateStreams(streams)
    };
    handleVideoDragListData(handleData) {//msglist视频拖拽
        let otherVideoStyle = handleData.message.data.otherVideoStyle;
        this.setState({ otherVideoStyle: otherVideoStyle, });
    };
    handleVideoSizeListData(handleData) {//msglist视频大小
        let { initVideoWidth, initVideoHeight } = this._getInitVideoSize();
        let ScaleVideoData = handleData.message.data.ScaleVideoData;
        for (let [key, value] of Object.entries(ScaleVideoData)) {
            this.state.otherVideoSize[key] = {
                videoWidth: value.scale * initVideoWidth,
                videoHeight: value.scale * initVideoWidth / TkGlobal.videoScale
            };
        }
        for (let [key, value] of Object.entries(this.state.otherVideoSize)) {
            //限制视频大小,不能超出白板范围
            this.state.otherVideoSize[key] = this.limitVideoSize(value.videoWidth, value.videoHeight);
        }
        this.setState({ otherVideoSize: this.state.otherVideoSize });
    };

    handlerRoomUserpropertyChanged(recvEventData) {//用户属性改变的时候
        let user = recvEventData.user;
        let changeUserproperty = recvEventData.message;
        let fromID = recvEventData.fromID;
        for (let [key, value] of Object.entries(changeUserproperty)) {
            this._calcVideoFullWhiteBoard();
            //如果是下台状态，才可以发删除该视频框的样式信令
            if (key === "publishstate" && (value === TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE)) {
                //其他人下台将他的视频样式数据删除
                let otherVideoStyleCopy = {};
                if (this.state.streams) {
                    this.state.streams.map((item, index) => {
                        if (this.state.otherVideoStyle[item.extensionId]) {
                            otherVideoStyleCopy[item.extensionId] = this.state.otherVideoStyle[item.extensionId];
                        }
                    });
                }
                delete otherVideoStyleCopy[user.id];
                delete this.state.otherVideoSize[user.id];
                let streams = this.state.streams
                const tempStreams = streams.filter((stream) => {
                    return stream.extensionId != user.id
                })
                this.setState({
                    otherVideoStyle: otherVideoStyleCopy,
                    otherVideoSize: this.state.otherVideoSize
                });
                this.updateStreams(tempStreams)
                let data = { otherVideoStyle: otherVideoStyleCopy };
                ServiceSignalling.sendSignallingFromVideoDraghandle(data);
            }
        }
    };

    /*初始化视频拖拽位置*/
    initOtherVideoDragByUserid(id) {
        this._initVideoSizeByUserid(this.props.videoWidth, this.props.videoHeight, id); //初始化视频的大小
        this.sendSignallingOfVideoSize();//发送视频大小信令
        let videoStyle = { percentLeft: 0, percentTop: 0, isDrag: false, };
        let handleData = { message: { data: { style: videoStyle, id: id }, initiative: true }, };
        this.changeOtherVideoStyle(handleData);
    }
    /*拖拽改变视频位置或分屏*/
    changeOtherVideoStyle(handleData) {
        let extensionId = handleData.message.data.id;
        let item = {}
        if (handleData.message.data.item) {
            item = handleData.message.data.item
        }
        let itemLength = Object.keys(item);
        let otherVideoStyleCopy = {};
        if (this.state.streams) {
            this.state.streams.map((item, index) => {
                if (this.state.otherVideoStyle[item.extensionId]) {
                    otherVideoStyleCopy[item.extensionId] = this.state.otherVideoStyle[item.extensionId];
                }
            });
        }
        // let otherVideoStyleCopy = Object.customAssign({} , this.state.otherVideoStyle) ;
        otherVideoStyleCopy[extensionId] = handleData.message.data.style;
        this.setState({//自己本地改变拖拽的video样式
            otherVideoStyle: otherVideoStyleCopy,
        });
        //通知其他人改变拖拽的video位置,是老师或助教，并且是主动的才发信令
        if (handleData.message.initiative && TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant) {
            let data = { otherVideoStyle: otherVideoStyleCopy };
            ServiceSignalling.sendSignallingFromVideoDraghandle(data, '__all');
        }
        if (otherVideoStyleCopy[extensionId].isDrag && itemLength.length !== 0 && !item.isDrag) {
            let user = ServiceRoom.getTkRoom().getUser(extensionId);
            if (user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_MUTEALL) {// 根据用户的发布状态
                ServiceSignalling.changeUserPublish(extensionId, TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY);
            } else if (user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_VIDEOONLY) {// 根据用户的发布状态
                ServiceSignalling.changeUserPublish(extensionId, TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH);
            }
        }
        this.setContentVesselOffset();
        eventObjectDefine.CoreController.dispatchEvent({ type: 'triggerControlPanelOneKeyReset', message: { count: 1 } });
    };

    /*设置主体区域的偏移位置 copy rightContentVessel method update: zxb*/
    setContentVesselOffset() {
        const defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
        let offset = $("#lc-full-vessel").offset();
        Object.customAssign(TkGlobal.dragRange, {
            left: offset.left / defalutFontSize,
            top: offset.top / defalutFontSize,
            bottom: (TkGlobal.windowInnerHeight - $("#lc-full-vessel").height() - offset.top) / defalutFontSize,
            right: (TkGlobal.windowInnerWidth - $("#lc-full-vessel").width() - offset.left) / defalutFontSize
        });
    };
    /* End copy rightContentVessel method update: zxb */

    changeMainContentVesselSmartSize(data) {
        this.setState({ changeMainContentVesselSmartSizeNumber: (this.state.changeMainContentVesselSmartSizeNumber + 1) });
        this.handlerOnResize();
    }

    handlerReceiveMsglistClassBegin(recvEventData) {
        if (TkGlobal.playback) {//是直播或者回放不需要移除数据流
            return;
        }
        this._removeLocalStreamToVideoContainer();
    }

    //判断用户是否是老师
    isTeacher(userID) {
        let user = this.getUser(userID);
        if (!user) { L.Logger.warning('[hv->isTeacher]user is not exist  , user id:' + userID + '!'); };
        if (user && user.role === TkConstant.role.roleChairman) {
            return true;
        }
        return false;
    }

    // 将所有的stream修改都集中到updateStreams方法中
    updateStreams(streams) {
        if (streams !== undefined) {
            this.setState({
                streams: streams
            }, () => {
                // 如果父级传了需要监听流变化的props  就更新父级stream的值
                if (this.props.streamChange && !TkGlobal.playback) {
                  this.props.streamChange(this.state.streams);
                }
            });
        }
        eventObjectDefine.CoreController.dispatchEvent({ type: 'updateStreams'});// 解决刷新页面小白板尺寸不对的bug
    }

    findStream(stream) {
        let streams = this.state.streams;
        for (let i = 0; i < streams.length; i++) {
            let st = streams[i];
            if (stream.extensionId === st.extensionId) {
                return true;
            }
        }
        return false;
    }

    delCommonStreams(streams, stream) {
        for (let i = streams.length - 1; i >= 0; i--) {
            let st = streams[i];
            if (stream.extensionId === st.extensionId) {
                streams.splice(i, 1);
            }
        }
        return streams;
    };

    addStream(stream) {
        if (TkConstant.hasRoomtype.oneToOne) {
            return;
        }
        let streams = this.state.streams;
        //将自己放到第一个
        let chairmanStreamIndex = -1;
        for (let i = 0; i < streams.length; i++) {
            let stream = streams[i];
            if (this.getUser(stream.extensionId) && this.getUser(stream.extensionId).role === TkConstant.role.roleChairman) {
                chairmanStreamIndex = i;
            } else {
                break;
            }
        }
        if (!this.findStream(stream)) {
            if (this.getUser(stream.extensionId) && this.getUser(stream.extensionId).role === TkConstant.role.roleChairman) {
                streams.unshift(stream);
            } else {
                if (stream.extensionId == ServiceRoom.getTkRoom().getMySelf().id) {
                    streams.splice(chairmanStreamIndex + 1, 0, stream);
                } else {
                    streams.push(stream);
                }
            }
        } else {
            /*this.delCommonStreams(streams , stream );*/
            if (this.getUser(stream.extensionId) && this.getUser(stream.extensionId).role === TkConstant.role.roleChairman) {
                streams.unshift(stream);
            } else {
                if (stream.extensionId == ServiceRoom.getTkRoom().getMySelf().id) {
                    streams.splice(chairmanStreamIndex + 1, 0, stream);
                } else {
                    streams.push(stream);
                }
            }
        }
        return streams;
    }

    removeStream(stream) {
        let streams = this.state.streams;
        return this.delCommonStreams(streams, stream);
    }

    handlerRoomConnected(roomEvent) {//房间连接时
        if (TkGlobal.classBegin || (!TkGlobal.classBegin && TkConstant.joinRoomInfo.autoClassBegin && TkConstant.hasRole.roleChairman && CoreController.handler.getAppPermissions('autoClassBegin'))) { //如果上课了或者自动上课，不生成本地流
            return;
        }
        if (!TkConstant.hasRoomtype.oneToOne) {//如果不是一对一
            if (CoreController.handler.getAppPermissions('localStream') && (TkConstant.hasRole.roleStudent || TkConstant.hasRole.roleTeachingAssistant || TkConstant.hasRole.roleChairman)) {
                this._addLocalStreamToVideoContainer();
            }
        } else if (TkConstant.hasRoomtype.oneToOne) {
            if (CoreController.handler.getAppPermissions('localStream') && TkConstant.hasRole.roleTeachingAssistant) {
                this._addLocalStreamToVideoContainer();
            }
        }
    }
    /*I 修改*/
    IChange(oldAry, oldFlag, changeFlag, changetype, changeVal) {
        let oldAryIndex = oldAry.findIndex((item) => {
            return item[oldFlag] === changeFlag
        });
        if (oldAryIndex === -1) { return oldAryIndex }
        if (!changetype) { return oldAryIndex }
        let cloneAry = JSON.parse(JSON.stringify(oldAry));
        if (cloneAry[oldAryIndex]['mediaFlagObj'][changetype] === undefined) {
            L.Logger.warning('IChange ,Possible unknowns');
        }
        cloneAry[oldAryIndex]['mediaFlagObj'][changetype] = changeVal;
        return cloneAry
    }

    /*改变音视频是否发布*/
    _controlRemoteStreamFlag(or, event) {
        let { message } = event;
        if (message.type !== 'video') { return; }
        if (!this.publishUserIdObj.hasOwnProperty(message.userId)) {
            this.publishUserIdObj[message.userId] = { videoFlag: false, audioFlag: false }
        }
        if (or === 'Video') {
            this.publishUserIdObj[message.userId].videoFlag = message.published
        } else if (or === 'Audio') {
            this.publishUserIdObj[message.userId].audioFlag = message.published
        }

        if (or === 'Video') {
            let PossibleAry = this.IChange(this.state.streams, 'extensionId', message.userId, 'videoFlag', message.published);
            if (PossibleAry === -1) {
                if (message.publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE && message.publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY) {
                    this.updateStreams(this.addStream({ extensionId: message.userId, mediaFlagObj: Object.customAssign({}, this.publishUserIdObj[message.userId]), type: message.type }));
                }
            } else {
                this.setState({
                    streams: PossibleAry
                }, () => {
                    this.updateStreams(this.state.streams)
                    this.upDateChange(message);
                })
            }
        } else if (or === 'Audio') {
            let PossibleAry = this.IChange(this.state.streams, 'extensionId', message.userId, 'audioFlag', message.published);
            if (PossibleAry === -1) {
                if (message.publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE && message.publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_VIDEOONLY) {
                    this.updateStreams(this.addStream({
                        extensionId: message.userId,
                        mediaFlagObj: Object.customAssign({}, this.publishUserIdObj[message.userId]),
                        type: message.type
                    }));
                }
            } else {
                this.setState({
                    streams: PossibleAry
                }, () => {
                    this.updateStreams(this.state.streams)
                    this.upDateChange(message);
                })
            }
        }
    }

    upDateChange(message) {
        let _index = this.IChange(this.state.streams, 'extensionId', message.userId);
        if (_index !== -1 && this.state.streams[_index].mediaFlagObj.videoFlag === false && this.state.streams[_index].mediaFlagObj.audioFlag === false) {
            if (!ServiceRoom.getTkRoom().getUser(message.userId) || (ServiceRoom.getTkRoom().getUser(message.userId) && (ServiceRoom.getTkRoom().getUser(message.userId).publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_MUTEALL))) {
                this.updateStreams(this.state.streams.filter((item, index) => index !== _index))
                delete this.publishUserIdObj[message.userId]
            }
        }
    }

    handlerStreamRemoved(streamEvent) {
        let stream = streamEvent.stream;
        if (stream) {
            //视频停止播放
            stream.hide();
            let streams = this.removeStream(stream);
            this.updateStreams(streams);
        }
    };

    handlerRoomPlaybackClearAll() {
        if (!TkGlobal.playback) {
            L.Logger.error('No playback environment, no execution event[roomPlaybackClearAll] handler ');
            return false;
        }
    };

    handlerRoomDisconnected(recvEventData) {
        this._clearAllStreamArray();
    }

    // /*限制视频大小,不能超出白板范围*/
    limitVideoSize(videoWidth, videoHeight) {
        //获取白板区域宽高：
        const defalutFontSize = window.innerWidth / TkConstant.STANDARDSIZE;
        let content = document.getElementById('lc-full-vessel');
        let contentW = content.clientWidth;
        let contentH = content.clientHeight;
        let { initVideoWidth, initVideoHeight } = this._getInitVideoSize();

        if (videoWidth < initVideoWidth || videoHeight < initVideoHeight) {
            videoWidth = initVideoWidth;
            videoHeight = initVideoHeight;
        }
        if (videoWidth >= contentW / defalutFontSize || videoHeight >= contentH / defalutFontSize) {
            if (TkGlobal.videoScale > contentW / contentH) {
                videoWidth = contentW / defalutFontSize;
                videoHeight = videoWidth / TkGlobal.videoScale;
            } else {
                videoHeight = contentH / defalutFontSize;
                videoWidth = videoHeight * TkGlobal.videoScale;
            }
        }
        return { videoWidth, videoHeight };
    };
    /*改变视频大小*/
    changeVideoSize(newVideoWidth, newVideoHeight, id) {
        // 限制视频,不能超出白板范围并且不小于原有大小
        const otherVideoSize = this.limitVideoSize(newVideoWidth, newVideoHeight);
        this.state.otherVideoSize[id] = otherVideoSize;
        this.setState({
            otherVideoSize: this.state.otherVideoSize
        })
    }
    /*发送视频大小信令*/
    sendSignallingOfVideoSize() {
        let { initVideoWidth, initVideoHeight } = this._getInitVideoSize();
        let data = {
            ScaleVideoData: {},
        };
        for (let [key, value] of Object.entries(this.state.otherVideoSize)) {
            data.ScaleVideoData[key] = {
                scale: value.videoWidth / initVideoWidth,
            }
        }
        ServiceSignalling.sendSignallingFromVideoChangeSize(data, "__all");
    }

    /*获取初始化视频的大小*/
    _getInitVideoSize() {
        const defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE
        const { videoWidth, videoHeight } = this.props
        let initVideoWidth = videoWidth * window.GLOBAL.windowInnerWidth / 100 / defalutFontSize
        let initVideoHeight = videoHeight * window.GLOBAL.windowInnerWidth / 100 / defalutFontSize
        return { initVideoWidth, initVideoHeight }
    }

    /*初始化视频大小*/
    _initVideoSizeByUserid(width, height, extensionId) {
        const defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE
        this.state.otherVideoSize[extensionId] = {
            videoWidth: width * window.GLOBAL.windowInnerWidth / 100 / defalutFontSize,
            videoHeight: height * window.GLOBAL.windowInnerWidth / 100 / defalutFontSize,
        };
    }

    /*按照对象的某个key值排序*/
    keySort(propertyName) {
        return function (object1, object2) {
            var value1 = object1[propertyName].toLowerCase();
            var value2 = object2[propertyName].toLowerCase();
            if (value1 < value2) {
                return -1;
            } else if (value1 > value2) {
                return 1;
            } else {
                return 0;
            }
        }
    }

    _loadHVideoComponentArray(streams,videoControl) {
        let studentVideoArray = [];
        let teacherVideoArray = [];
        let copyStreams = streams;
        if (TkConstant.joinRoomInfo.VideosSequence && copyStreams.length > 2) {
            let ChairmanStreams = copyStreams.shift();
            copyStreams.sort(this.keySort('extensionId'));
            copyStreams.unshift(ChairmanStreams);
        }
        for (let [i,stream] of Object.entries(copyStreams)) {
            
            if (this.asyncRenderBoard) { // 首次视频渲染出现后加载白板
                eventObjectDefine.CoreController.dispatchEvent({ type: "asyncRenderBoard" });
                this.asyncRenderBoard = false
            }
            if (stream) {
                let extensionId = stream.extensionId;
                if (this.state.otherVideoStyle && !this.state.otherVideoStyle[extensionId]) {//设置初始值
                    this.state.otherVideoStyle[extensionId] = {
                        percentTop: 0,
                        percentLeft: 0,
                        isDrag: false,
                    };
                }
                if(videoControl){
                    if (this.state.nowLayout) {
                        let { videoWidth, videoHeight } = this.getVideoSize(this.state.nowLayout);
                        this._initVideoSizeByUserid(videoWidth, videoHeight, extensionId);
                    }
                    this.videoControl = false;
                }
               
                if (this.state.otherVideoSize && !this.state.otherVideoSize[extensionId]) {//设置宽高初始值
                    this._initVideoSizeByUserid(this.props.videoWidth, this.props.videoHeight, extensionId);
                }
                let { otherVideoStyle, otherVideoSize } = this.state;
                let userRole = null;
                if (ServiceRoom.getTkRoom().getUser(extensionId)) {
                    userRole = ServiceRoom.getTkRoom().getUser(extensionId).role;
                }
                if (!this.isTeacher(extensionId)) {
                    studentVideoArray.push({
                        index:i,
                        fatherId: this.elementId,
                        id: extensionId,
                        stream: stream,
                        videoDumbClassName: "hvideo",
                        otherVideoStyle: { ...otherVideoStyle[extensionId] },
                        otherVideoSize: { ...otherVideoSize[extensionId] }
                    });
                } else {
                    teacherVideoArray.push({
                        fatherId: this.elementId,
                        id: extensionId,
                        stream: stream,
                        videoDumbClassName: "hvideo",
                        otherVideoStyle: { ...otherVideoStyle[extensionId] },
                        otherVideoSize: { ...otherVideoSize[extensionId] }
                    })
                }
            }
        }
        return {
            studentVideoArray: studentVideoArray,
            teacherVideoArray: teacherVideoArray
        };
    };

    getUser(userid) {
        if (!ServiceRoom.getTkRoom()) {
            return undefined;
        }
        return ServiceRoom.getTkRoom().getUser(userid);
    }

    handlerRoomDelmsg(recvEventData) {
        let pubmsgData = recvEventData.message;
        switch (pubmsgData.name) {
            case "ClassBegin":
                if (TkConstant.joinRoomInfo.isClassOverNotLeave || (!TkConstant.joinRoomInfo.isClassOverNotLeave && TkConstant.joinRoomInfo.isBeforeClassReleaseVideo)) {
                    return;
                }
                this._clearAllStreamArray();
                if (!TkConstant.joinRoomInfo.isBeforeClassReleaseVideo && !TkConstant.joinRoomInfo.isClassOverNotLeave) {//上课前不发布音视频，并且下课后离开
                    this._addLocalStreamToVideoContainer()
                }
                break;
            case "FullScreen":
                this.setState({ pictureInPictureClassnameFromTeacherStream: undefined, isHasCloseBtn: false });
                this.setState({ pictureInPictureClassnameFromStudentStream: undefined });
                break;
        }
    }

    /*一键还原*/
    handlerOneKeyRecovery(send = true) {
        this.initOtherVideoStyle(send);
        this.initOtherVideoSize(send);

    }

    /*初始化所有的拖拽数据*/
    initOtherVideoStyle(send = false) {
        let otherVideoStyleCopy = {};
        if (this.state.streams) {
            this.state.streams.map((item, index) => {
                if (this.state.otherVideoStyle[item.extensionId]) {
                    otherVideoStyleCopy[item.extensionId] = this.state.otherVideoStyle[item.extensionId];
                }
            });
        }
        for (let key of Object.keys(otherVideoStyleCopy)) {
            otherVideoStyleCopy[key] = {
                percentTop: 0,
                percentLeft: 0,
                isDrag: false,
            }
        }
        this.setState({ otherVideoStyle: otherVideoStyleCopy });
        if (send) {
            ServiceSignalling.sendSignallingFromVideoDraghandle({ otherVideoStyle: otherVideoStyleCopy });
        }
        eventObjectDefine.CoreController.dispatchEvent({ type: 'triggerControlPanelOneKeyReset', message: { count: 0 } });
    };

    /*初始化所有的视频大小数据*/
    initOtherVideoSize(send = false) {
        let sendOtherVideoSizeData = { ScaleVideoData: {} };
        for (let key of Object.keys(this.state.otherVideoSize)) {
            sendOtherVideoSizeData.ScaleVideoData[key] = {
                scale: 1,
            };
            this._initVideoSizeByUserid(this.props.videoWidth, this.props.videoHeight, key);
        }
        this.setState({ otherVideoSize: this.state.otherVideoSize });
        if (send) {
            ServiceSignalling.sendSignallingFromVideoChangeSize(sendOtherVideoSizeData);
        }
    }


    /*清空数据流数组*/
    _clearAllStreamArray() {
        this.state.streams.length = 0;//清空数组
        this.updateStreams(this.state.streams)
    };

    /*添加本地数据流到容器中*/
    _addLocalStreamToVideoContainer() {
        if (TkGlobal.isLeaveRoom) {
            return;
        }
        if (CoreController.handler.getAppPermissions('localStream')) {
            let streams = this.addStream({ extensionId: ServiceRoom.getTkRoom().getMySelf().id, mediaFlagObj: Object.customAssign({}, { videoFlag: true, audioFlag: true }), type: 'video' });
            this.updateStreams(streams);
        }
    };

    /*移除本地数据流到容器中*/
    _removeLocalStreamToVideoContainer() {
        let _index = this.IChange(this.state.streams, 'extensionId', ServiceRoom.getTkRoom().getMySelf().id);
        this.updateStreams(this.state.streams.filter((item, index) => index !== _index))
    };
    /*处理信令FullScreen*/
    _handlerSignallingFullScreen(pubmsgData) {
        if (TkConstant.hasRoomtype.oneToOne) {    // 一对多视频组件，如果是一对一课堂不处理
            return;
        }
        let { fullScreenType, needPictureInPictureSmall } = pubmsgData.data;
        if ((fullScreenType === 'courseware_file' || fullScreenType === 'stream_media') && TkConstant.joinRoomInfo.videoInFullScreen) {  // 如果是课件或者MP4全屏并且有课件全屏同步配置项
            this.setState({
                pictureInPictureClassnameFromStudentStream: undefined,
                pictureInPictureClassnameFromTeacherStream: 'pictureInPicture small ' + fullScreenType,
                isHasCloseBtn: true,
            });
        }
        if((fullScreenType === 'courseware_file' || fullScreenType === 'stream_media') && TkGlobal.playback){
            this.setState({
                pictureInPictureClassnameFromStudentStream: undefined,
                pictureInPictureClassnameFromTeacherStream: 'pictureInPicture small ' + fullScreenType,
                isHasCloseBtn: true,
            });
        }
        // if(TkConstant.hasRoomtype.oneToOne){
        // 此文件是一对多视频区 所以一对一不进行响应
        // switch (pubmsgData.data.fullScreenType){
        //     case 'stream_video':
        //         if(TkConstant.hasRole.roleStudent){
        //             this.setState({pictureInPictureClassnameFromTeacherStream:'pictureInPicture big '+pubmsgData.data.fullScreenType});
        //             this.setState({pictureInPictureClassnameFromStudentStream:undefined});
        //         }else{
        //             if(pubmsgData.data.mainPictureInPictureStreamRoleStreamRole === TkConstant.role.roleChairman){
        //                 this.setState({pictureInPictureClassnameFromTeacherStream:'pictureInPicture big '+pubmsgData.data.fullScreenType});
        //                 if(pubmsgData.data.needPictureInPictureSmall){
        //                     this.setState({pictureInPictureClassnameFromStudentStream:'pictureInPicture small '+pubmsgData.data.fullScreenType});
        //                 }else{
        //                     this.setState({pictureInPictureClassnameFromStudentStream:undefined});
        //                 }
        //             }else if( pubmsgData.data.mainPictureInPictureStreamRoleStreamRole === TkConstant.role.roleStudent ){
        //                 this.setState({pictureInPictureClassnameFromStudentStream:'pictureInPicture big '+pubmsgData.data.fullScreenType});
        //                 if(pubmsgData.data.needPictureInPictureSmall){
        //                     this.setState({pictureInPictureClassnameFromTeacherStream:'pictureInPicture small '+pubmsgData.data.fullScreenType,isHasCloseBtn:true});
        //                 }else{
        //                     this.setState({pictureInPictureClassnameFromTeacherStream:undefined,isHasCloseBtn:false});
        //                 }
        //             }
        //         }
        //         break;
        //     default:
        //         if(pubmsgData.data.needPictureInPictureSmall){
        //             if(TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant){
        //                 this.setState({pictureInPictureClassnameFromTeacherStream:undefined,isHasCloseBtn:false});
        //                 this.setState({pictureInPictureClassnameFromStudentStream:'pictureInPicture small '+pubmsgData.data.fullScreenType});
        //             }else{
        //                 this.setState({pictureInPictureClassnameFromStudentStream:undefined});
        //                 this.setState({pictureInPictureClassnameFromTeacherStream:'pictureInPicture small '+pubmsgData.data.fullScreenType,isHasCloseBtn:true});
        //             }
        //         }else{
        //             let fullElement = document.getElementById("all_root");
        //             TkUtils.tool.launchFullscreen( fullElement );
        //         }
        //         break;
        // }
        // }else{
        //     if(pubmsgData.data.needPictureInPictureSmall){
        //         this.setState({pictureInPictureClassnameFromTeacherStream:'pictureInPicture small ' + pubmsgData.data.fullScreenType,isHasCloseBtn:true});
        //     }else{
        //         let fullElement = document.getElementById("all_root");
        //         TkUtils.tool.launchFullscreen( fullElement );
        //     }
        // }

    };

    // 隐藏课件全屏之后的视频
    closeFullScreenVideo() {
        this.setState({ pictureInPictureClassnameFromTeacherStream: undefined, isHasCloseBtn: false });
    }


    render() {
        const { studentVideoArray, teacherVideoArray } = this._loadHVideoComponentArray(this.state.streams,this.videoControl);
        // console.error(this._loadHVideoComponentArray(this.state.streams,this.videoControl));
        const videoList = this.props.isTeacher ? teacherVideoArray : studentVideoArray;
        const videoHandlers = () => {
            return {
                sendSignallingOfVideoSize: this.sendSignallingOfVideoSize.bind(this),
                changeVideoSize: this.changeVideoSize.bind(this),
                initOtherVideoDragByUserid: this.initOtherVideoDragByUserid.bind(this)
            }
        }
        const { otherVideoStyle, otherVideoSize } = this.state;
        const { videoWidth, videoHeight } =  this.getVideoSize(this.state.nowLayout);
        return (
            <React.Fragment>
                {videoList.map(video => (
                    //   <Box key={video.id} w={this.props.width} style={this.props.videoStyle} >

                    <Box className={(this.props.isTeacher ? `teacher ` : `student studName` + video.index + ` `) + `${this.props.layoutName}`} key={video.id}>
                        <CommonVideoSmart
                            thisVideoFullStyle={this.state.thisVideoFullStyle}
                            {...videoHandlers()}
                            {...otherVideoStyle[video.id]}
                            {...otherVideoSize[video.id]}
                            fatherId={video.elementId}
                            hasDragJurisdiction={CoreController.handler.getAppPermissions('isCanDragVideo')}
                            videoDumbClassName={"hvideo"}
                            id={video.id}
                            key={video.key}
                            initVideoWidth={videoWidth}
                            initVideoHeight={videoHeight}
                            stream={video.stream}
                            videoDumbClassName={video.videoDumbClassName}
                            hasDragJurisdiction={CoreController.handler.getAppPermissions('isCanDragVideo')}
                            isHasCloseBtn={this.state.isHasCloseBtn}
                            pictureInPictureClassname={this.props.isTeacher ? this.state.pictureInPictureClassnameFromTeacherStream : this.state.pictureInPictureClassnameFromStudentStream}
                            className={this.props.isTeacher ? "video-chairman-wrap" : ''}
                            closeFullScreenVideo={this.closeFullScreenVideo.bind(this)}
                            videoScreenId={this.state.videoScreenId}
                        />
                    </Box>
                ))}
            </React.Fragment>
        );
    }
}

function isTeacherVideo(WrappedComponent, isTeacher) {
    return class isTeacherVideo extends React.Component {

        getVideoSize(layoutName) {    //根据布局计算视频宽高
            let videoWidth = null, videoHeight = null;
            const videoScale = TkConstant.joinRoomInfo.roomVideoHeight / TkConstant.joinRoomInfo.roomVideoWidth;
            switch (layoutName) {
                case "CoursewareDown": //课件置底
                case "VideoDown": //视频置底
                    videoWidth = 100 / 7;
                    break;
                case "Encompassment": //围绕型
                    videoWidth = isTeacher ? 100 / 4 : 100 * 0.75 / 6;
                    break;
                case "Bilateral": //左右排列
                    videoWidth = isTeacher ? 100 / 4 : 100 / 8.28;
                    break;
                case "MorePeople": //超多人课堂
                    videoWidth = 100 / 8.28;
                    break;
                default:
                    break;
            }
            videoHeight = videoWidth * videoScale;
            return { videoWidth, videoHeight };
        }

        render() {
            const { videoWidth, videoHeight } = this.getVideoSize(this.props.layoutName);
            const props = Object.assign({}, this.props, {
                isTeacher: isTeacher,
                videoHeight: videoHeight,
                videoWidth: videoWidth
            })
            return <WrappedComponent {...props} />
        }
    }
}

const StudentVideoList = isTeacherVideo(VideoList, false);
const TeacherVideoList = isTeacherVideo(VideoList, true);
export { StudentVideoList, TeacherVideoList };
