/**
 * 主体容器-右边所有组件的Smart模块
 * @module RightVesselSmart
 * @description   承载一对一视频区域
 * @author QiuShao
 * @date 2017/08/08
 */


'use strict';
import React from 'react';
import ReactDom from 'react-dom';
import eventObjectDefine from 'eventObjectDefine';
import TkConstant from 'TkConstant';
import TkGlobal from "TkGlobal";
import VVideoContainer from "../../baseVideo/VVideoContainer1v1";
import ChatBox from '@/Chat';

class RightVesselSmart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            videoContainerHeightRem: 0,
            areaExchangeFlag: false,
            updateState: false,
            isVideoFullScreen: false,
            isTeacherVideoFullScreen: false,
            isStudentVideoFullScreen: false,
        };
        this.listernerBackupid = new Date().getTime() + '_' + Math.random();
    };
    /*在完成首次渲染之前调用，此时仍可以修改组件的state*/
    componentDidMount() {
        const that = this;
        eventObjectDefine.Window.addEventListener(TkConstant.EVENTTYPE.WindowEvent.onResize, that.handlerOnResize.bind(that), that.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener('resizeHandler', this.handlerOnResize.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomConnected, that.handlerRoomConnected.bind(that), that.listernerBackupid); //Room-Connected事件：房间连接事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDelmsg, that.handlerRoomDelmsg.bind(that), that.listernerBackupid); //roomDelmsg事件 下课事件 classBegin
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPubmsg, that.handlerRoomPubmsg.bind(that), that.listernerBackupid); //roomPubmsg事件  上课事件 classBegin
        eventObjectDefine.CoreController.addEventListener("receive-msglist-FullScreen", this.handlerReceiveMsglistFullScreen.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener('fullScreen',this.handlerFullScreen.bind(this), this.listernerBackupid);   //本地全屏事件
        this._updateVideoContainerHeightRem();
    };
    /*组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器*/
    componentWillUnmount() {
        const that = this;
        eventObjectDefine.Window.removeBackupListerner(that.listernerBackupid);
        eventObjectDefine.CoreController.removeBackupListerner(that.listernerBackupid);
    };
    /*在组件完成更新后立即调用。在初始化时不会被调用*/
    componentDidUpdate(prevProps, prevState) {
        const that = this;
        if (that.updateChairmanDefaultVideo || that.updateVideoFromPullUrl || that.updateVVideoContainerl) {
            that.updateChairmanDefaultVideo = that.updateChairmanDefaultVideo ? false : that.updateChairmanDefaultVideo;
            that.updateVideoFromPullUrl = that.updateVideoFromPullUrl ? false : that.updateVideoFromPullUrl;
            that.updateVVideoContainerl = that.updateVVideoContainerl ? false : that.updateVVideoContainerl;
        }
    };
    // 处理本地全屏事件
    handlerFullScreen(msg){
        let {isFullScreen , fullScreenType} = msg.message;
        if (fullScreenType === 'courseware_file' || fullScreenType === 'stream_media' && TkConstant.hasRoomtype.oneToOne ) { //如果是课件全屏或者mp4全屏进行响应
            if(isFullScreen){
                if(TkConstant.hasRole.roleStudent){
                    this.setState({
                        isVideoFullScreen: true,
                        isTeacherVideoFullScreen: true,
                        isStudentVideoFullScreen: false,
                    })
                }else{
                    this.setState({
                        isVideoFullScreen: true,
                        isTeacherVideoFullScreen: false,
                        isStudentVideoFullScreen: true,
                    })
                }
            }else{
                this.setState({
                    isVideoFullScreen: false,
                    isTeacherVideoFullScreen: false,
                    isStudentVideoFullScreen: false,
                })
            } 
        }else if(fullScreenType === 'stream_video' && TkConstant.hasRoomtype.oneToOne){
            let {needPictureInPictureSmall, isTeacher} = msg.message;
            if(needPictureInPictureSmall){
                if(TkConstant.hasRole.roleStudent){
                    if(msg.message.isTeacher){
                        this.setState({
                            isTeacherVideoFullScreen: true,
                            isStudentVideoFullScreen: false,
                        })
                    }else{
                        this.setState({
                            isTeacherVideoFullScreen: false,
                            isStudentVideoFullScreen: true,
                        })
                    }
                }else{
                    if(msg.message.isTeacher){
                        this.setState({
                            isTeacherVideoFullScreen: true,
                            isStudentVideoFullScreen: false,
                        })
                    }else{
                        this.setState({
                            isTeacherVideoFullScreen: false,
                            isStudentVideoFullScreen: true,
                        })
                    }
                    
                }
            }else{
                this.setState({
                    isTeacherVideoFullScreen: false,
                    isStudentVideoFullScreen: false,
                })
            }
            
        }   
    }
    handlerRoomConnected(roomEvent) {
        this._updateVideoContainerHeightRem();
    }

    handlerReceiveMsglistFullScreen(msg) {
        let msgData = msg.message.FullScreenArray[0];
        let {fullScreenType} = msgData.data;
        if ( (fullScreenType === 'courseware_file' || fullScreenType === 'stream_media') && TkConstant.hasRoomtype.oneToOne ) { //如果是课件全屏或者mp4全屏进行响应
            this.setState({
                isVideoFullScreen: true,
            })
            if(TkConstant.hasRole.roleStudent){
                this.setState({
                    isVideoFullScreen: true,
                    isTeacherVideoFullScreen: true,
                    isStudentVideoFullScreen: false,
                })
            }else{
                this.setState({
                    isVideoFullScreen: true,
                    isTeacherVideoFullScreen: false,
                    isStudentVideoFullScreen: true,
                })
            }
        }else if(fullScreenType === 'stream_video' && TkConstant.hasRoomtype.oneToOne){
            if(TkConstant.hasRole.roleStudent){
                if(msgData.data.isTeacher){
                    this.setState({
                        isTeacherVideoFullScreen: true,
                        isStudentVideoFullScreen: false,
                    })
                }
            }else{
                if(msgData.data.isTeacher){
                    this.setState({
                        isTeacherVideoFullScreen: true,
                        isStudentVideoFullScreen: false,
                    })
                }else{
                    this.setState({
                        isTeacherVideoFullScreen: false,
                        isStudentVideoFullScreen: true,
                    })
                }
                
            }
        }     
    };

    handlerRoomPubmsg(recvEventData) {
        const that = this;
        let pubmsgData = recvEventData.message
        switch (pubmsgData.name) {
            case "FullScreen":
                let {fullScreenType} = pubmsgData.data;
                if ( (fullScreenType === 'courseware_file' || fullScreenType === 'stream_media') && TkConstant.hasRoomtype.oneToOne ) { //如果是课件全屏或者mp4全屏进行响应
                    this.setState({
                        isVideoFullScreen: true,
                    })
                    if(TkConstant.hasRole.roleStudent){
                        this.setState({
                            isVideoFullScreen: true,
                            isTeacherVideoFullScreen: true,
                            isStudentVideoFullScreen: false,
                        })
                    }else{
                        this.setState({
                            isVideoFullScreen: true,
                            isTeacherVideoFullScreen: false,
                            isStudentVideoFullScreen: true,
                        })
                    }
                }else if(fullScreenType === 'stream_video' && TkConstant.hasRoomtype.oneToOne){
                    if(TkConstant.hasRole.roleStudent){
                        if(pubmsgData.data.isTeacher){
                            this.setState({
                                isTeacherVideoFullScreen: true,
                                isStudentVideoFullScreen: false,
                            })
                        }
                    }else{
                        if(pubmsgData.data.isTeacher){
                            this.setState({
                                isTeacherVideoFullScreen: true,
                                isStudentVideoFullScreen: false,
                            })
                        }else{
                            this.setState({
                                isTeacherVideoFullScreen: false,
                                isStudentVideoFullScreen: true,
                            })
                        }
                        
                    }
                }              
                break;
        }

    };

    handlerRoomDelmsg(recvEventData) {
        const that = this;
        let pubmsgData = recvEventData.message;
        switch (pubmsgData.name) {
            case "FullScreen":
                if(this.state.isVideoFullScreen || this.state.isTeacherVideoFullScreen || this.state.isStudentVideoFullScreen){
                    this.setState({
                        isVideoFullScreen: false,
                        isTeacherVideoFullScreen: false,
                        isStudentVideoFullScreen: false,
                    })
                }
                break;
        }

    }

    handlerOnResize(recvEvent) {
        this._updateVideoContainerHeightRem();
    };

    _loadVideoComponent() {
        let that = this;
        let videoComponent = undefined;
        videoComponent = <VVideoContainer
            ref="rightVVideoContainerElement"
            id={'participants'}
            isTeacher={this.props.isTeacher}
            RightContentVesselSmartStyleJson={this.props.RightContentVesselSmartStyleJson} />;
        if (that.updateVVideoContainerl == undefined) {
            that.updateVVideoContainerl = true;
        }
        return {
            videoComponent: videoComponent
        }
    }

    _updateVideoContainerHeightRem() {
        if (this.refs.verticalVideoContainerRef !== undefined && ReactDom.findDOMNode(this.refs.verticalVideoContainerRef)) {
            let verticalVideoContainerElement = ReactDom.findDOMNode(this.refs.verticalVideoContainerRef);
            if (verticalVideoContainerElement) {
                let defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
                let videoContainerHeight = verticalVideoContainerElement.clientHeight / defalutFontSize;
                if (videoContainerHeight) {
                    videoContainerHeight += 0.1;
                }
                this.setState({ videoContainerHeightRem: videoContainerHeight });
            }
        }
    }

    render() {
        let { videoComponent } = this._loadVideoComponent();
        let { styleJson } = this.props;
        styleJson = {...styleJson}
        if(this.state.isVideoFullScreen){   //如果是全屏
            if(this.state.isTeacherVideoFullScreen){
                if(this.props.isTeacher){
                    styleJson.zIndex= 900;
                    styleJson.width = 0;
                    styleJson.height = 0;
                }
            }
            if(this.state.isStudentVideoFullScreen){
                if(!this.props.isTeacher){
                    styleJson.zIndex= 900;
                    styleJson.width = 0;
                    styleJson.height = 0;
                }
            }
        }
        if(this.state.isTeacherVideoFullScreen && !this.state.isStudentVideoFullScreen && !this.state.isVideoFullScreen){
            if(this.props.isTeacher){
                styleJson.zIndex= 900;
                styleJson.width = 0;
                styleJson.height = 0;
            }else{
                if(TkConstant.joinRoomInfo.pictureInPicture){
                    styleJson.zIndex= 901;
                    styleJson.width = 0;
                    styleJson.height = 0;
                }
               
            }
            
        }
        if(!this.state.isTeacherVideoFullScreen && this.state.isStudentVideoFullScreen && !this.state.isVideoFullScreen){
            if(this.props.isTeacher){
                if(TkConstant.joinRoomInfo.pictureInPicture){
                    styleJson.zIndex= 901;
                    styleJson.width = 0;
                    styleJson.height = 0;
                }
            }else{
                styleJson.zIndex= 900;
                styleJson.width = 0;
                styleJson.height = 0;
            }
        }
        return (
            <article style={TkConstant.hasRoomtype.oneToOne ? styleJson : { width: '100%', height: '2.25rem' }}
                id="video_chat_container"
                className={"video-container add-position-relative add-fr " + (TkGlobal.isVideoInFullscreen ? 'videoInFullscreen' : '')} >
                {/*视频区域*/}
                <div
                    className="vertical-video-container"
                    id="verticalVideoContainer"
                    ref="verticalVideoContainerRef" >
                    {videoComponent}
                </div>
            </article>
        )
    };
};
export default RightVesselSmart;

