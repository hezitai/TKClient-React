/**
 * 承载底部-全屏按钮Smart组件
 * @module FullScreenBtn
 * @description   承载底部-全屏按钮Smart组件
 * @author like
 * @date 2018/05/20
 */
'use strict';
import React from 'react';
import TkGlobal from 'TkGlobal';
import TkConstant from 'TkConstant';
import TkUtils from 'TkUtils';
import eventObjectDefine from 'eventObjectDefine';
import CoreController from 'CoreController';
import ServiceRoom from 'ServiceRoom';
import ServiceSignalling from 'ServiceSignalling';

class FullScreenBtn extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isFullScreen: false,
            isVideoInFullscreenFile: false,
        };
        this.WhiteboardTool = '';
        this.listernerBackupid = new Date().getTime() + '_' + Math.random();
    }
    componentDidMount() { //在完成首次渲染之后调用，此时仍可以修改组件的state
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPubmsg, this.handlerRoomPubmsg.bind(this), this.listernerBackupid);//room-pubmsg事件：动态ppt处理
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDelmsg, this.handlerRoomDelmsg.bind(this), this.listernerBackupid); //roomDelmsg事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.DocumentEvent.onKeydown, this.onKeydown.bind(this), this.listernerBackupid);//room-delmsg事件
        // eventObjectDefine.Document.addEventListener(TkConstant.EVENTTYPE.DocumentEvent.onFullscreenchange, this.handlerOnFullscreenchange.bind(this), this.listernerBackupid); //document.onFullscreenchange事件
        eventObjectDefine.CoreController.addEventListener('receive-msglist-FullScreen', this.handlerMsglistFullScreen.bind(this), this.listernerBackupid);//msglist,处理课件全屏
        eventObjectDefine.CoreController.addEventListener("receiveWhiteboardSDKAction", this.receiveWhiteboardSDKAction.bind(this), this.listernerBackupid); //监听白板sdk的行为事件
        let defaultDocumentToolViewRoot = document.getElementById('defaultDocumentToolViewRoot');
        let defaultTalkcloudFullScreen = document.getElementById('defaultTalkcloudFullScreen');
        let defaultTalkcloudVolume = document.getElementById('defaultTalkcloudVolume');
        let defaultTalkcloudRemark = defaultDocumentToolViewRoot.querySelector('#defaultTalkcloudRemark');
        defaultDocumentToolViewRoot.appendChild(defaultTalkcloudFullScreen);
        defaultDocumentToolViewRoot.appendChild(defaultTalkcloudVolume);
        defaultDocumentToolViewRoot.appendChild(defaultTalkcloudRemark);
        defaultTalkcloudFullScreen.onclick = () => {
            CoreController.handler.getAppPermissions('isHandleVideoInFullScreen') ? this.handleVideoInFullScreen() : this.fullScreenClick();
        }
    }
    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        eventObjectDefine.CoreController.removeBackupListerner(this.listernerBackupid);
        eventObjectDefine.Document.removeBackupListerner(this.listernerBackupid);
        eventObjectDefine.Window.removeBackupListerner(this.listernerBackupid);
    }
    receiveWhiteboardSDKAction(recvEventData) {
        if (recvEventData.message) {
            let { cmd, action } = recvEventData.message;
            if (action === "mediaPlayerNotice" && cmd.playerType === "videoPlayer") {
                let defaultTalkcloudFullScreen = document.getElementById('defaultTalkcloudFullScreen');
                let defaultVideoPlayerControl = document.getElementById('defaultVideoPlayerTalkMediaPlayerTotalControl');
                let mp4FullBtn = defaultVideoPlayerControl.querySelector('.full-screen-btn.add-cursor-pointer.add-fl')
                if (CoreController.handler.getAppPermissions('isHandleVideoInFullScreen')) {
                    mp4FullBtn.onclick = () => { this.handleVideoInFullScreenOnClick() }
                } else {
                    mp4FullBtn.onclick = () => { this.handlermp4FullBtn() }
                }
                if (cmd.type === "play" || cmd.type === "pause") {
                    defaultTalkcloudFullScreen.disabled = true;
                } else if (cmd.type === "end") {
                    defaultTalkcloudFullScreen.disabled = false;
                    if (CoreController.handler.getAppPermissions('isHandleVideoInFullScreen') && TkGlobal.isVideoPlayerInFullscreen) {
                        let isDelMsg = true;
                        let data = {
                            fullScreenType: 'stream_media',//'stream_video','courseware_file','stream_media'
                            needPictureInPictureSmall: false,
                        };
                        TkGlobal.isVideoPlayerInFullscreen = false;
                        ServiceSignalling.sendSignallingFromFullScreen(data, isDelMsg);   //TODO 20180722:qiu 这里会导致每个人都发送一次
                    } else {
                        if (TkGlobal.mainContainerFull) {
                            TkGlobal.mainContainerFull = false;
                            // TkUtils.tool.exitFullscreen();
                            eventObjectDefine.CoreController.dispatchEvent({type:'fullScreen',message:{fullScreenType:'stream_media',isFullScreen:false}});
                        }
                    }
                }
            }
        }
    }
    //视频全屏
    handlermp4FullBtn() {
        let defaultVideoPlayerControl = document.getElementById('defaultVideoPlayerTalkMediaPlayerTotalControl');
        let mp4FullBtn = defaultVideoPlayerControl.querySelector('.full-screen-btn.add-cursor-pointer.add-fl');
        if (TkGlobal.mainContainerFull) {
            TkGlobal.mainContainerFull = false;
            mp4FullBtn.classList.remove('exit');
            // TkUtils.tool.exitFullscreen();
            eventObjectDefine.CoreController.dispatchEvent({type:'fullScreen',message:{fullScreenType:'stream_media',isFullScreen:false}});
        } else {
            TkGlobal.mainContainerFull = true;
            // let ele = document.getElementById("lc-full-vessel");
            mp4FullBtn.classList.add('exit');
            // TkUtils.tool.launchFullscreen(ele);
            eventObjectDefine.CoreController.dispatchEvent({type:'fullScreen',message:{fullScreenType:'stream_media',isFullScreen:true}});
        }
    }
    //点击空格退出全屏
    onKeydown(recvEvent) {
        if (recvEvent.message.keyCode === 32) {
            let data = {
                fullScreenType: 'courseware_file',//'stream_video','courseware_file','stream_media'
                needPictureInPictureSmall: false,
            };
            let isDelMsg = true;
            ServiceSignalling.sendSignallingFromFullScreen(data, isDelMsg);
        }
    }
    handlerRoomPubmsg(recvEventData) {
        let pubmsgData = recvEventData.message;
        switch (pubmsgData.name) {
            case "FullScreen":
                let defaultTalkcloudFullScreen = document.getElementById('defaultTalkcloudFullScreen');
                if (pubmsgData.data.fullScreenType === 'courseware_file') {
                    defaultTalkcloudFullScreen.classList.add('isScreen')
                    if (TkConstant.hasRole.roleStudent || TkConstant.hasRole.rolePatrol) {
                        defaultTalkcloudFullScreen.disabled = true;
                    }
                    this.setState({ isVideoInFullscreenFile: true });
                } else if (pubmsgData.data.fullScreenType === 'stream_media') {
                    let defaultVideoPlayerControl = document.getElementById('defaultVideoPlayerTalkMediaPlayerTotalControl');
                    let mp4FullBtn = defaultVideoPlayerControl.querySelector('.full-screen-btn.add-cursor-pointer.add-fl');
                    mp4FullBtn.classList.add('exit');
                    if (TkConstant.hasRole.roleStudent || TkConstant.hasRole.rolePatrol) {
                        mp4FullBtn.style.display = 'none';
                    }
                    this.setState({ isVideoInFullscreenFile: true });
                }
                break;
        }
    };

    handlerRoomDelmsg(recvEventData) {
        let pubmsgData = recvEventData.message;
        switch (pubmsgData.name) {
            case "FullScreen":
                if (pubmsgData.data.fullScreenType === 'stream_media') {
                    let defaultVideoPlayerControl = document.getElementById('defaultVideoPlayerTalkMediaPlayerTotalControl');
                    let mp4FullBtn = defaultVideoPlayerControl.querySelector('.full-screen-btn.add-cursor-pointer.add-fl');
                    mp4FullBtn.classList.remove('exit');
                    mp4FullBtn.style.display = 'block';
                    this.setState({ isVideoInFullscreenFile: false });
                } else {
                    let defaultTalkcloudFullScreen = document.getElementById('defaultTalkcloudFullScreen');
                    defaultTalkcloudFullScreen.classList.remove('isScreen')
                    defaultTalkcloudFullScreen.disabled = false;
                    this.setState({
                        isVideoInFullscreenFile: false,
                    });
                }
                break;
        }
    };
    /*处理接收画中画的事件*/
    handlerMsglistFullScreen(handleData) {
        let data = handleData.message.FullScreenArray[0].data;
        if (data.fullScreenType === 'courseware_file') {
            let defaultTalkcloudFullScreen = document.getElementById('defaultTalkcloudFullScreen');
            defaultTalkcloudFullScreen.classList.add('isScreen')
            if (TkConstant.hasRole.roleStudent || TkConstant.hasRole.rolePatrol) {
                defaultTalkcloudFullScreen.disabled = true;
            }
            this.setState({ isVideoInFullscreenFile: true });
        } else if (data.fullScreenType === 'stream_media') {
            let defaultVideoPlayerControl = document.getElementById('defaultVideoPlayerTalkMediaPlayerTotalControl');
            let mp4FullBtn = defaultVideoPlayerControl.querySelector('.full-screen-btn.add-cursor-pointer.add-fl');
            mp4FullBtn.classList.add('exit');
            if (TkConstant.hasRole.roleStudent || TkConstant.hasRole.rolePatrol) {
                mp4FullBtn.style.display = 'none';
            }
            this.setState({ isVideoInFullscreenFile: true });
        }
    }
    /*处理课件全屏点击事件*/
    handleVideoInFullScreen() {
        if (this.state.isVideoInFullscreenFile) {
            let data = {
                fullScreenType: 'courseware_file',//'stream_video','courseware_file','stream_media'
                needPictureInPictureSmall: false,
                // isDisableStudent: false,
            };
            let isDelMsg = true;
            ServiceSignalling.sendSignallingFromFullScreen(data, isDelMsg);
        } else {
            let data = {
                fullScreenType: 'courseware_file',//'stream_video','courseware_file','stream_media'
                needPictureInPictureSmall: true,
                // isDisableStudent: false,
            };
            ServiceSignalling.sendSignallingFromFullScreen(data);
        }
    }
    /*处理画中画的mp4全屏点击事件*/
    handleVideoInFullScreenOnClick() {
        if (TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant) {
            if (TkGlobal.isVideoInFullscreen) {
                let isDelMsg = true;
                let data = {
                    fullScreenType: 'stream_media',//'stream_video','courseware_file','stream_media'
                    needPictureInPictureSmall: false,
                };
                TkGlobal.isVideoPlayerInFullscreen = false
                ServiceSignalling.sendSignallingFromFullScreen(data, isDelMsg);
            } else {
                let data = {
                    fullScreenType: 'stream_media',//'stream_video','courseware_file','stream_media'
                    needPictureInPictureSmall: true,
                };
                TkGlobal.isVideoPlayerInFullscreen = true
                ServiceSignalling.sendSignallingFromFullScreen(data);
            }
        }
    }
    /*添加全屏监测处理函数*/
    // handlerOnFullscreenchange() {
    //     if (TK.SDKTYPE !== 'mobile') {
    //         if (!(TkUtils.tool.getFullscreenElement() && TkUtils.tool.getFullscreenElement().id === "lc-full-vessel")) {
    //             let ele = document.getElementById("lc-full-vessel");
    //             let defaultTalkcloudFullScreen = document.getElementById('defaultTalkcloudFullScreen');
    //             if (this.state.isFullScreen && !this.state.isVideoInFullscreenFile) {
    //                 let defaultVideoPlayerControl = document.getElementById('defaultVideoPlayerTalkMediaPlayerTotalControl');
    //                 let mp4FullBtn = defaultVideoPlayerControl.querySelector('.full-screen-btn.add-cursor-pointer.add-fl');
    //                 if (mp4FullBtn.classList.contains("exit")) {
    //                     mp4FullBtn.classList.remove('exit');
    //                 }
    //                 ele.classList.remove('isFullscreen');
    //                 defaultTalkcloudFullScreen.classList.remove('isScreen');
    //                 defaultTalkcloudFullScreen.setAttribute('disabled', true);
    //                 this.timerFull = setTimeout(() => {
    //                     defaultTalkcloudFullScreen.removeAttribute('disabled');
    //                     clearTimeout(this.timerFull)
    //                 }, 1000)
    //             }
    //         }
    //         this.setState({ isFullScreen: TkUtils.tool.getFullscreenElement() && TkUtils.tool.getFullscreenElement().id === "lc-full-vessel" });
    //     }
    // };
    //点击全屏
    fullScreenClick(event) {
        if (TK.SDKTYPE === 'mobile') {
            let isFullScreen = !this.state.isFullScreen;
            ServiceRoom.getTkRoom().changeWebPageFullScreen(isFullScreen);
        } else {
            let ele = document.getElementById("lc-full-vessel");
            let defaultTalkcloudFullScreen = document.getElementById('defaultTalkcloudFullScreen');
            if (this.state.isFullScreen) {
                // setTimeout(() => {
                //     ele.classList.remove('isFullscreen');
                // }, 10);
                defaultTalkcloudFullScreen.classList.remove('isScreen');
                // TkUtils.tool.exitFullscreen();
                eventObjectDefine.CoreController.dispatchEvent({type:'fullScreen',message:{fullScreenType:'courseware_file',isFullScreen:false}});

            } else {
                // ele.classList.add('isFullscreen');
                defaultTalkcloudFullScreen.classList.add('isScreen');
                // TkUtils.tool.launchFullscreen(ele);
                eventObjectDefine.CoreController.dispatchEvent({type:'fullScreen',message:{fullScreenType:'courseware_file',isFullScreen:true}});
            }
            this.setState({isFullScreen:!this.state.isFullScreen})
        }
    };
    render() {
        let { id, fullBtm } = this.props;
        return (
            <div id={id} style={fullBtm} > {/*全屏按钮*/}
                
            </div>
        )
    };
};
export default FullScreenBtn;