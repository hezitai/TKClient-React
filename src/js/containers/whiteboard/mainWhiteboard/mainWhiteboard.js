/**
 * 白板以及动态 Smart模块
 * @module WhiteboardAndNewpptSmart
 * @description   整合白板以及动态PPT
 * @author QiuShao
 * @date 2017/7/27
 */

'use strict';
import React from 'react';
import CoreController from "CoreController";
import eventObjectDefine from 'eventObjectDefine';
import ServiceRoom from 'ServiceRoom';
import TkGlobal from 'TkGlobal' ;
import TkConstant from "TkConstant";
import ServiceSignalling from "ServiceSignalling";
import ServiceTooltip from 'ServiceTooltip';
import TKUtils from "TkUtils";
import ToolBar from '@/ToolsBar'

class MainWhiteboardSmart extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            fileTypeMark: 'general', //general 、 dynamicPPT 、 h5document
            literallyWrapClass:'' , //包裹正确的类
            literallyWrapStyle:{} , //包裹正确的样式
            isVideoWhiteboard:false ,
            hideWhiteboardToolbar:false ,
            isPageShow: false,
        };
        this.fatherContainerId = 'white_board_outer_layout'; // 父容器的id
        this.whiteboardContainerId = 'big_literally_wrap'; //白板容器的id
        this.sendMobileData = {
            page:{},
            zoom:{},
        }; // 发送给移动端的数据
        this.documentTypeIsPPT = false;
    };
    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        let that = this ;
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomConnected, that.handlerRoomConnected.bind(that)  , that.listernerBackupid ); //Room-Connected事件：房间连接事件
        eventObjectDefine.CoreController.addEventListener( 'resizeHandler' , this.handlerOnResize.bind(this) , this.listernerBackupid );
        eventObjectDefine.CoreController.addEventListener("initAppPermissions" ,that.handlerInitAppPermissions.bind(that) , that.listernerBackupid ); //initAppPermissions：白板可画权限更新
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPubmsg ,that.handlerRoomPubmsg.bind(that) , that.listernerBackupid );
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomDelmsg , that.handlerRoomDelmsg.bind(that), that.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPlaybackClearAllFromPlaybackController,this.handlerRoomPlaybackClearAll.bind(this) , this.listernerBackupid); //roomPlaybackClearAll 事件：回放清除所有信令
        if(window.TKWhiteBoardManager  && ServiceRoom.getTkRoom().registerRoomWhiteBoardDelegate){
            that._initWhiteboardDefault();
        }
    };
    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        let that = this ;
        ServiceRoom.getTkWhiteBoardManager().destroyMainWhiteboard() //销毁白板
    };

    handlerOnResize(){

        ServiceRoom.getTkWhiteBoardManager().updateWhiteboardSize('default');
    }

    /*接收动作*/
    _receiveActionCommand(action, cmd){
        L.Logger.info('receive whiteboard sdk action command（action,cmd）:', action, cmd);
        eventObjectDefine.CoreController.dispatchEvent({
            type:'receiveWhiteboardSDKAction' ,
            message:{action:action,cmd:cmd}
        });
        if(action === 'viewStateUpdate'){
            if(TkConstant.hasRole.roleStudent && TkConstant.joinRoomInfo.pptpagingoptions){
                    this.setState({ isPageShow:true })
            }
        }
        switch (action){
            case 'viewStateUpdate':
                for (let key in cmd.viewState) {
                    switch (key) {
                        case 'documentType': //文件类型：generalDocument（普通文件）、dynamicPPT（动态ppt）、h5Document(h5课件)
                            if (cmd.viewState[key].documentType === ' dynamicPPT ') {
                                document.getElementById('defaultTalkcloudVolume').style.display = 'block';
                            }
                            break;

                        case 'page':
                            this.sendMobileData.page = cmd.viewState[key];
                            break;
                        case 'zoom':
                            this.sendMobileData.zoom = cmd.viewState[key];
                            break;
                        case 'other':
                            if(ServiceRoom.getTkRoom().getMySelf().id  && ServiceRoom.getTkRoom().getMySelf().primaryColor !== cmd.viewState[key].primaryColor){
                                let userid = ServiceRoom.getTkRoom().getMySelf().id;
                                let data ={
                                    primaryColor:cmd.viewState[key].primaryColor
                                };
                                ServiceSignalling.setParticipantPropertyToAll(userid,data);
                            }
                            break;

                    }
                }
                break;
            case 'skipPageFailureBouncedNotice':
                if( cmd.type === 'overPageRange' ){
                    ServiceTooltip.showPrompt(TkGlobal.language.languageData.alertWin.call.fun.page.pageMax.text);
                }else if( cmd.type === 'pageTypeNotNumber' ){
                    ServiceTooltip.showPrompt(TkGlobal.language.languageData.alertWin.call.fun.page.pageInteger.text);
                }
                break;
            case 'mediaPlayerNotice':
                if(cmd.type==='end'){
                    this.setState({
                        hideWhiteboardToolbar:false
                    });
                }else{
                    this.setState({
                        hideWhiteboardToolbar:true
                    })
                }
                break;
        }
    }

    handlerRoomPlaybackClearAll(){
        ServiceRoom.getTkWhiteBoardManager().resetWhiteboardData();
    }

    /*初始化白板*/
    _initWhiteboardDefault(){
        const that = this;
        let parentNode = document.getElementById(that.whiteboardContainerId); //挂载白板的节点
        let whiteboardConfigration = {
            whiteboardToolBarConfig:{
                isDrag:true,
                initDragPosition: { //初始化拖拽位置（百分比）
                    left:100,
                    top:50
                },
            },
            documentToolBarConfig:{
                isDrag:true,
                isLoadFullScreen:true ,   //是否加载全屏，false
                isLoadRemark:TkConstant.joinRoomInfo.hasCoursewareRemarks && CoreController.handler.getAppPermissions('isShowCoursewareRemarks'),   //是否加载文档备注，false
                isLoadVolume:true ,   //是否加载动态ppt音量设置，false
                initDragPosition: { //初始化拖拽位置（百分比）
                    left:50,
                    top:100
                },
            },
            primaryColor:!TkConstant.hasRole.roleStudent?'#ED3E3A':'#000000',
            canDraw:CoreController.handler.getAppPermissions('canDraw'),
            canRemark:TkConstant.joinRoomInfo.hasCoursewareRemarks && CoreController.handler.getAppPermissions('isShowCoursewareRemarks'),
            isLoadDocumentRemark:TkConstant.joinRoomInfo.hasCoursewareRemarks && CoreController.handler.getAppPermissions('isShowCoursewareRemarks'),
            videoPlayerConfig:{
                controlCallback:{ //控制器的相关控制权限
                    pause:this.pauseMediaCallBackHandle ,
                },
                controlPermissions:{ //控制器的相关控制权限
                    hasPlayOrPause:TkConstant.hasRole.roleTeachingAssistant || TkConstant.hasRole.roleChairman , //播放暂停权限,默认true
                    hasChangeProgress:TkConstant.hasRole.roleTeachingAssistant || TkConstant.hasRole.roleChairman, //改变进度权限，默认true
                    hasClose:TkConstant.hasRole.roleTeachingAssistant || TkConstant.hasRole.roleChairman , //关闭权限，默认true
                },
            },
            audioPlayerConfig:{ //音频播放器配置
                isLoadControl:true , //是否加载控制器,默认true(注：不提供给用户，自己内部使用)
                controlPermissions:{ //控制器的相关控制权限
                    hasPlayOrPause:TkConstant.hasRole.roleTeachingAssistant || TkConstant.hasRole.roleChairman , //播放暂停权限,默认true
                    hasChangeProgress:TkConstant.hasRole.roleTeachingAssistant || TkConstant.hasRole.roleChairman, //改变进度权限，默认true
                    hasClose:TkConstant.hasRole.roleTeachingAssistant || TkConstant.hasRole.roleChairman , //关闭权限，默认true
                }
            },
        };
        ServiceRoom.getTkWhiteBoardManager().createMainWhiteboard( parentNode ,whiteboardConfigration  ,this._receiveActionCommand.bind(this));
    }
    handlerInitAppPermissions(){
       let whiteboardConfigration = {
            canDraw:CoreController.handler.getAppPermissions('canDraw'),
            documentToolBarConfig:{
                isLoadRemark:TkConstant.joinRoomInfo.hasCoursewareRemarks &&  CoreController.handler.getAppPermissions('isShowCoursewareRemarks'),   //是否加载文档备注，false
            },
            canRemark:TkConstant.joinRoomInfo.hasCoursewareRemarks && CoreController.handler.getAppPermissions('isShowCoursewareRemarks'),
            isLoadDocumentRemark:TkConstant.joinRoomInfo.hasCoursewareRemarks &&  CoreController.handler.getAppPermissions('isShowCoursewareRemarks'),
       };
        ServiceRoom.getTkWhiteBoardManager().changeWhiteBoardConfigration( whiteboardConfigration , 'default');
        // 黑模板 控制工具条
    }

    handlerRoomPubmsg(recvEventData) {
        let pubmsgData = recvEventData.message;
        switch (pubmsgData.name) {
            case "ClassBegin":
                if (TkConstant.joinRoomInfo.isClassOverNotLeave) {
                    ServiceRoom.getTkWhiteBoardManager().resetWhiteboardData();
                }
                TKUtils.tool.exitFullscreen();
                break;
            case "VideoWhiteboard":
                this.setState({isVideoWhiteboard:true});
                break;
        }
    }

    handlerRoomDelmsg(recvEventData) {
        let delmsgData = recvEventData.message;
        switch (delmsgData.name) {
            case "ClassBegin":
                if (!TkConstant.joinRoomInfo.isClassOverNotLeave) {
                    ServiceRoom.getTkWhiteBoardManager().resetWhiteboardData();
                }
                break;
            case "VideoWhiteboard":
                this.setState({isVideoWhiteboard:false});
                break;
        }
    }


    /*暂停视频的回调方法*/
    pauseMediaCallBackHandle(){
        eventObjectDefine.CoreController.dispatchEvent({
            type:'receivePauseMedia' ,
        });
    }
    /*房间连接成功*/
    handlerRoomConnected(){
        this._changeWhiteboardConfig(); //根据企业配置项目更改白板
    }

    /*颜色取反*/
    colorReverse(colorValue){
        let colorValues="0x"+colorValue.replace(/#/g,"");
        let str="000000"+(0xFFFFFF-colorValues).toString(16);
        return str.substring(str.length-6,str.length);
    }

    _changeWhiteboardConfig(){
        if(TkConstant.joinRoomInfo.customWhiteboardBackground){  //配置自定义白板底色
            let index = TkConstant.joinRoomInfo.whiteboardcolor;
            let whiteboardColor = "#"+TkGlobal.customWhiteboardColorArry[index];
            let reverseColor =''; //取反颜色
            let useStrokeColor = undefined;
            if( TkConstant.hasRole.roleChairman  ||  TkConstant.hasRole.roleTeachingAssistant){  //老师助教的画笔颜色取反
                if(TkGlobal.customWhiteboardColorArry[index] === 'ffffff'){ //白板是白色，老师是红色，学生是黑色，
                    reverseColor = 'ED3E3A'
                }else{
                    reverseColor = 'EDEDED'
                };
                useStrokeColor = '#'+reverseColor;
            }else{ //白板是黑色，老师是白色，学生是黄色
                let studentFontColor = undefined;
                if(TkGlobal.customWhiteboardColorArry[index] === '000000'){
                    studentFontColor = 'FFCC00';
                }else{
                    studentFontColor = '000000';
                };
                useStrokeColor = '#'+studentFontColor;
            }
            let whiteboardConfigration  = {
                primaryColor:useStrokeColor,//画笔颜色
                backgroundColor:whiteboardColor,//白板颜色
                secondaryColor:whiteboardColor,//填充颜色
            };
            ServiceRoom.getTkWhiteBoardManager().changeWhiteBoardConfigration( whiteboardConfigration   , 'default'); //更改白板配置项
        }
    }

    render(){
        
        // mp4 关闭按钮样式 ~~~三目太长 逻辑先提上来
        let closeClassName = ''
        // 如果是老师或者助教才有可能显示关闭按钮  
        if (TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant){
            closeClassName = this.state.isVideoWhiteboard ? ' big-literally-wrap-videowhiteboard' : ' show-video-close-btn'
        }

        let that = this ;
        let hideWhiteboardToolbar = this.state.hideWhiteboardToolbar?' hide-whiteboard-toolbar':'';
        // let { BottomToolsVesselJson={} } = TkGlobal.systemStyleJson
        const styleJson = that.props.styleJson; //区域交换不显示工具条
        return (
            <div id={that.fatherContainerId}  className={"white-board-outer-layout whiteboard-sdk-px-to-rem " + (TkGlobal.playback?" noToolBar":"" ) + (that.state.isPageShow?' noPageBar':'')} >  {/*白板最外层包裹 */}
                {/*白板和动态PPT*/}
                <div id={that.whiteboardContainerId} className={"big-literally-wrap " + this.state.literallyWrapClass + closeClassName + hideWhiteboardToolbar} > {/*白板内层包裹区域*/}
                </div>
                <ToolBar styleJson={styleJson}/>
            </div>
        )
    };
};

export default  MainWhiteboardSmart;

