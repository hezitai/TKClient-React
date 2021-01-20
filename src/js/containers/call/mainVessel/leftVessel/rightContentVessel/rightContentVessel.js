/**
 * 顶部部分-右侧内容Smart模块
 * @module RightContentVesselSmart
 * @description   承载顶部部分-右侧内容的承载容器
 * @author QiuShao
 * @date 2017/08/08
 */

'use strict';
import React from 'react';
import TkGlobal from 'TkGlobal' ;
import TkUtils from 'TkUtils' ;
import TkConstant from 'TkConstant' ;
import eventObjectDefine from 'eventObjectDefine';
import CoreController from 'CoreController';
import ServiceSignalling from 'ServiceSignalling';
import MainWhiteboardSmart from '../../../../whiteboard/mainWhiteboard/mainWhiteboard' ;
import FullScreenBtn from '@/FullScreenBtn' ;
import TimeRemind from '@/TimeRemind' ;
import MoreBlackboardSmart from '../../../../whiteboard/extendWhiteboard/moreWhiteBoard';
import CaptureImg from '@/CaptureImg';

import VideoDrawingBoard from '../../../../whiteboard/extendWhiteboard/videoDrawingBoard'
import ShareSmart from "../../../../ShareSmart/ShareSmart";
import DialTeachingToolSmart from '@/holdAllBox/HoldAllItem/dialTeachingToolComponent/index.js';
import BigRoomAnswerPanel from '@/holdAllBox/HoldAllItem/bigRoomAnswerPanel';
import BigRoomStudentAnswerPanel from '@/holdAllBox/HoldAllItem/bigRoomAnswerPanel/studentComponent';
import TimerTeachingToolSmart from '@/holdAllBox/HoldAllItem/timerTeachingToolComponent/index.js';
import QrCodeTeachingToolSmart from '@/holdAllBox/HoldAllItem/QrCodeTeachingToolComponent/index.js';
import ResponderTeachingToolSmart from '@/holdAllBox/HoldAllItem/responderTeacherToolComponent/index.js';
import ProgrammShareSmart from "@/holdAllBox/HoldAllItem/ProgrammShareSmart";
import PointerReminderContentBar from "@/Pointer"; // 教鞭


/*
 *页面内容层级规则：
 * 1.主要内容区域的浮层：110
 * 2.由工具条控制并在主要内容区域显示的工具，层级范围：111~139,(答题卡、转盘、计时器、抢答器、二维码、小白板、课件备注)
 * 3.两个工具条：140
 * 4.Mp4video：180/182
 * 5.左侧花名册列表：251
 *
 **/

class RightContentVesselSmart extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            loadTimeRemindSmart: false,
            informPanel: {  // 顶层通知栏
                text: undefined,
                href: undefined,
            },
            isVideoInFullscreenFile:false,
            mainContentLayerIsShow:false,
            selectMouse:true,
            captureImgInfos:{},//截图的图片信息
            eleResizeInfos:{},//保存截图元素大小
            useToolInfo:{
                useToolKey:"tool_pencil",
                useToolColor:'#ED3E3A',
                blackboardToolsInfo:{pencil:5 , text:18 , eraser:30, shape:5},//TK.SDKTYPE !== 'mobile'?
            },
            updateState:false ,
        };
        this.listCaptureImgResizeArray = null;
        this.eleInitResizeInfos = {};//保存元素初始大小
        this.listernerBackupid = new Date().getTime()+'_'+Math.random();
    };
    /*在完成首次渲染之前调用，此时仍可以修改组件的state*/
    componentWillMount() {
        this.initDragData();
    }
    /*在完成首次渲染之后调用,真实的DOM被渲染出来后调用，在该方法中可通过this.getDOMNode()访问到真实的DOM元素。*/
    componentDidMount() {
        const that = this;
        eventObjectDefine.Window.addEventListener(TkConstant.EVENTTYPE.WindowEvent.onResize, this.handlerOnResize.bind(this) , this.listernerBackupid  );
        eventObjectDefine.CoreController.addEventListener('resizeHandler', this.handlerOnResize.bind(this) , this.listernerBackupid  );
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomConnected, that.handlerRoomConnected.bind(that)  , that.listernerBackupid ); //Room-Connected事件：房间连接事件
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomPubmsg ,that.handlerRoomPubmsg.bind(that)  ,  that.listernerBackupid ) ;//room-pubmsg事件：拖拽动作处理
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomDelmsg , that.handlerRoomDelmsg.bind(that), that.listernerBackupid); //roomDelmsg事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPlaybackClearAllFromPlaybackController ,that.handlerRoomPlaybackClearAll.bind(that) , that.listernerBackupid );
        // eventObjectDefine.CoreController.addEventListener( "initDragEleTranstion" , that.initDragEleTranstion.bind(that), that.listernerBackupid);//初始化拖拽元素的位置 todo 暂时注释
        // eventObjectDefine.CoreController.addEventListener( "changeDragEleTranstion" , that.changeDragEleTranstion.bind(that), that.listernerBackupid);//改变拖拽元素的位置 todo 暂时注释
        eventObjectDefine.CoreController.addEventListener( "receive-msglist-BlackBoardDrag" , that.handlerMsglistBlackBoardDrag.bind(that), that.listernerBackupid);//msglist,后面进来的人收到小黑板的拖拽位置
        eventObjectDefine.CoreController.addEventListener( "receive-msglist-DialDrag" , that.handlerMsglistDialDrag.bind(that), that.listernerBackupid);//msglist,后面进来的人收到转盘的拖拽位置
        eventObjectDefine.CoreController.addEventListener( "receive-msglist-TimerDrag" , that.handlerMsglistTimerDrag.bind(that), that.listernerBackupid);//msglist,后面进来的人收到转盘的拖拽位置
        eventObjectDefine.CoreController.addEventListener( "receive-msglist-AnswerDrag" , that.handlerMsglistAnswerDrag.bind(that), that.listernerBackupid);//msglist,后面进来的人收到转盘的拖拽位置
        eventObjectDefine.CoreController.addEventListener( "receive-msglist-ResponderDrag" , that.handlerMsglistResponderDrag.bind(that), that.listernerBackupid);//msglist,后面进来的人收到抢答器的拖拽位置
        eventObjectDefine.CoreController.addEventListener( "receive-msglist-CaptureImg" , that.handlerMsglistCaptureImg.bind(that), that.listernerBackupid);//msglist,
        eventObjectDefine.CoreController.addEventListener( "receive-msglist-CaptureImgDrag" , that.handlerMsglistCaptureImgDrag.bind(that), that.listernerBackupid);//msglist,
        eventObjectDefine.CoreController.addEventListener( "receive-msglist-CaptureImgResize" , that.handlerMsglistCaptureImgResize.bind(that), that.listernerBackupid);//msglist,
        eventObjectDefine.CoreController.addEventListener('receive-msglist-FullScreen' , that.handlerMsglistFullScreen.bind(that)  , that.listernerBackupid);//msglist,处理课件全屏
        // eventObjectDefine.CoreController.addEventListener( "otherDropTarget" , that.handlerOtherDropTarget.bind(that), that.listernerBackupid);//监听其他拖放目标的拖放数据处理 todo 暂时注释
        eventObjectDefine.CoreController.addEventListener('changeLayerIsShow' ,this.handleLayerIsShow.bind(this)  , this.listernerBackupid ); //改变浮层是否显示
        eventObjectDefine.CoreController.addEventListener("receiveWhiteboardSDKAction" ,that.receiveWhiteboardSDKAction.bind(that) , that.listernerBackupid  ); //监听白板sdk的行为事件
        eventObjectDefine.CoreController.addEventListener('fullScreen',this.handlerFullScreen.bind(this), this.listernerBackupid);   //本地全屏事件
        eventObjectDefine.CoreController.addEventListener('SwitchLayoutAfter',this.handlerOnResize.bind(this),this.listernerBackupid);  //切换布局事件
        this.setContentVesselOffset();
    };
    /*组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器*/
    componentWillUnmount() {
        const that = this ;
        eventObjectDefine.Window.removeBackupListerner(that.listernerBackupid);
        eventObjectDefine.CoreController.removeBackupListerner( that.listernerBackupid );
    };
    /*在接收到新的props 或者 state，将要渲染之前调用。该方法在初始化渲染的时候不会调用*/
    /*shouldComponentUpdate(nextProps,nextState){
        return nextProps.styleJson.width !== this.props.styleJson.width;
    }*/
    /*在组件完成更新后立即调用,在初始化时不会被调用*/
    componentDidUpdate(prevProps , prevState){
        if( !TkUtils.lowclassCompareJsonIsCommon(prevProps.styleJson ,this.props.styleJson ) ){
            eventObjectDefine.CoreController.dispatchEvent({type:"resizeHandler"});
            eventObjectDefine.CoreController.dispatchEvent({type:"resizeMediaVideoHandler"});
            eventObjectDefine.CoreController.dispatchEvent({type:"changeMainContentVesselSmartSize" , message:{bottomVesselSmartHeightRem:this.props.bottomVesselSmartHeightRem}});
        }
    };
    // 处理本地全屏事件
    handlerFullScreen(msg){
        let {isFullScreen , fullScreenType} = msg.message;
        if (fullScreenType === 'courseware_file' || fullScreenType === 'stream_media' ) {                    
            this.setState({isVideoInFullscreenFile:isFullScreen});
            eventObjectDefine.CoreController.dispatchEvent({type:"resizeHandler"});
        }
    }
    handlerOnResize() {
        this.setContentVesselOffset();
    };
    /*设置主体区域的偏移位置*/
    setContentVesselOffset() {
        const defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
        let offset = $("#lc-full-vessel").offset();
        Object.customAssign( TkGlobal.dragRange,  {
            left:offset.left / defalutFontSize,
            top:offset.top / defalutFontSize,
            bottom: ( TkGlobal.windowInnerHeight - $("#lc-full-vessel").height() - offset.top ) / defalutFontSize,
            right: ( TkGlobal.windowInnerWidth - $("#lc-full-vessel").width() - offset.left )  / defalutFontSize
        });
    };

    handlerRoomConnected() {
        this.setState({ loadTimeRemindSmart:CoreController.handler.getAppPermissions('loadClassbeginRemind') });
    };

    handlerRoomPubmsg(recvEventData) {
        let pubmsgData = recvEventData.message;
        switch (pubmsgData.name) {
            case "ClassBegin":
                break;
            case 'BlackBoardDrag'://小白板的拖拽
                if(TkGlobal.playback && TkGlobal.roomlayout === '0'){
                    return;
                }
                Object.customAssign(this.state.moreBlackboardDrag, pubmsgData.data);
                // this.state.moreBlackboardDrag = pubmsgData.data;
                this.setState({moreBlackboardDrag:this.state.moreBlackboardDrag});
                break;
            case 'DialDrag'://转盘的拖拽
            if(TkGlobal.playback && TkGlobal.roomlayout === '0'){
                return;
            }
                this.setState({dialDrag: Object.customAssign({}, this.state.dialDrag, pubmsgData.data)});
                break;
            case 'TimerDrag'://计时器的拖拽
            if(TkGlobal.playback && TkGlobal.roomlayout === '0'){
                return;
            }
                Object.customAssign(this.state.timerDrag, pubmsgData.data);
                this.setState({
                    timerDrag:this.state.timerDrag,
                });
                break;
            case 'AnswerDrag'://答题卡的拖拽
            if(TkGlobal.playback && TkGlobal.roomlayout === '0'){
                return;
            }
                Object.customAssign(this.state.answerDrag, pubmsgData.data);
                Object.customAssign(this.state.answerDragS, pubmsgData.data);
                this.setState({
                    answerDrag:this.state.answerDrag,
                    answerDragS:this.state.answerDragS,
                });
                break;
            case 'ResponderDrag'://抢答器的拖拽
            if(TkGlobal.playback && TkGlobal.roomlayout === '0'){
                return;
            }
                Object.customAssign(this.state.responderDrag, pubmsgData.data);
                this.setState({
                    responderDrag:this.state.responderDrag,
                });
                break;
            case 'CaptureImgDrag'://截屏图片的拖拽
            if(TkGlobal.playback && TkGlobal.roomlayout === '0'){
                return;
            }
                if (pubmsgData.data.position && pubmsgData.data.id) {
                    if (this.state[pubmsgData.data.id]) {
                        Object.customAssign(this.state[pubmsgData.data.id],pubmsgData.data.position);
                        this.setState({[pubmsgData.data.id]:this.state[pubmsgData.data.id]});
                    }
                }
                break;
            case 'CaptureImgResize'://截屏图片的缩放
                if (pubmsgData.data.scale && pubmsgData.data.id) {
                    let scale = pubmsgData.data.scale;
                    if (this.state.eleResizeInfos && this.eleInitResizeInfos) {
                        let {width:initWidth,height:initHeight} = this.eleInitResizeInfos[pubmsgData.data.id];
                        let newWidth = initWidth*scale;
                        let newHeight = initHeight*scale;
                        this.state.eleResizeInfos[pubmsgData.data.id] = {width:newWidth, height:newHeight};
                        this.setState({
                            eleResizeInfos: this.state.eleResizeInfos,
                        });
                    }
                }
                break;
            case "CaptureImg"://截屏的图片信令
                if (pubmsgData.data.captureImgInfo && pubmsgData.data.remSize) {
                    let captureImgInfo = pubmsgData.data.captureImgInfo;
                    this.handleCaptureImg(captureImgInfo);
                    const defalutFontSize = window.innerWidth / TkConstant.STANDARDSIZE;
                    let remSize = pubmsgData.data.remSize;
                    let id = "captureImg_" + pubmsgData.data.captureImgInfo.fileid;
                    let data = {
                        width:remSize.width*defalutFontSize,
                        height:remSize.height*defalutFontSize,
                    };
                    let borderSize = 0.04;
                    this.setInitResize(id, data, borderSize);
                }
                break;
            case "FullScreen"://全屏同步
                if (pubmsgData.data.fullScreenType === 'courseware_file' || pubmsgData.data.fullScreenType === 'stream_media' ) {                    
                    this.setState({isVideoInFullscreenFile:true});
                    eventObjectDefine.CoreController.dispatchEvent({type:"resizeHandler"});
                }else{
                    this.setState({isVideoInFullscreenFile:false});
                }
                break;
        }
    };
    handlerRoomDelmsg(recvEventData) {
        const that = this;
        let pubmsgData = recvEventData.message;
        switch(pubmsgData.name) {
            case "FullScreen":
                if (this.state.isVideoInFullscreenFile) {
                    this.setState({isVideoInFullscreenFile:false});
                    eventObjectDefine.CoreController.dispatchEvent({type:"resizeHandler"});
                }
                break;
            case "CaptureImg"://截屏的图片信令
                if (pubmsgData.id.startsWith("CaptureImg_")) {
                    let fileId = pubmsgData.id.split('_')[1];
                    let copyCaptureImgInfos = {...this.state.captureImgInfos};//复制截屏信息对象
                    delete copyCaptureImgInfos[fileId];//保存截屏的图片信息
                    this.setState({
                        captureImgInfos:copyCaptureImgInfos,
                    });
                }
                break;
            case "ClassBegin"://下课
                /*下课清除截屏的图片*/
                this.setState({captureImgInfos:{},});
                break;
        }
    };
    /*--msglist--start*/
    handlerMsglistBlackBoardDrag(handleData) {//msglist,小黑板的拖拽位置
        let blackBoardDragInfo = handleData.message.BlackBoardDragArray;
        blackBoardDragInfo.map((item,index)=>{
            Object.customAssign(this.state.moreBlackboardDrag, item.data);
            // this.state.moreBlackboardDrag = item.data;
            this.setState({moreBlackboardDrag:this.state.moreBlackboardDrag});
        });
    };
    handlerMsglistDialDrag(handleData) {//msglist,转盘的拖拽位置
        let DialDragInfo = handleData.message.DialDragArray;
        DialDragInfo.map((item,index)=>{
            this.setState({dialDrag: Object.customAssign({}, this.state.dialDrag, item.data)});
        });
    };
    handlerMsglistTimerDrag(handleData) {//msglist,计时器的拖拽位置
        let TimerDragInfo = handleData.message.TimerDragArray;
        TimerDragInfo.map((item,index)=>{
            Object.customAssign(this.state.timerDrag, item.data);
            this.setState({
                timerDrag:this.state.timerDrag,
            });
        });
    };
    handlerMsglistAnswerDrag(handleData) {//msglist,答题卡的拖拽位置
        let AnswerDragInfo = handleData.message.AnswerDragArray;
        AnswerDragInfo.map((item,index)=>{
            Object.customAssign(this.state.answerDragS, item.data);
            Object.customAssign(this.state.answerDrag, item.data);
            this.setState({
                answerDragS:this.state.answerDragS,
                answerDrag:this.state.answerDrag,
            });
        });
    };
    handlerMsglistResponderDrag(handleData) {//msglist,抢答器的拖拽位置
        let ResponderDragInfo = handleData.message.ResponderDragArray;
        ResponderDragInfo.map((item,index)=>{
            Object.customAssign(this.state.responderDrag, item.data);
            this.setState({
                responderDrag:this.state.responderDrag,
            });
        });
    };
    handlerMsglistFullScreen(handleData) {//msglist,文档全屏画中画
        let data = handleData.message.FullScreenArray[0].data;
        if (data.fullScreenType === 'courseware_file' || data.fullScreenType === 'stream_media') {
            this.setState({isVideoInFullscreenFile:true});
            eventObjectDefine.CoreController.dispatchEvent({type:"resizeHandler"});
        }
    }
    handlerMsglistCaptureImg(handleData) {//msglist,截屏图片
        let CaptureImgArray = handleData.message.CaptureImgArray;
        let captureImgInfos = {};
        CaptureImgArray.map((item,index)=>{
            if (item.data.captureImgInfo) {
                let captureImgInfo = item.data.captureImgInfo;
                let captrreImgId = captureImgInfo.fileid;
                captureImgInfos[captrreImgId] = captureImgInfo;//保存截屏的图片信息
                this.setState({
                    captureImgInfos:captureImgInfos,
                });
                const defalutFontSize = window.innerWidth / TkConstant.STANDARDSIZE;
                let remSize = item.data.remSize;
                let id = "captureImg_" + item.data.captureImgInfo.fileid;
                let data = {
                    width:remSize.width*defalutFontSize,
                    height:remSize.height*defalutFontSize,
                };
                let borderSize = 0.04;
                this.setInitResize(id, data, borderSize);
            }
        });
    }
    handlerMsglistCaptureImgDrag(handleData) {//msglist,截屏图片的拖拽
        let CaptureImgDragArray = handleData.message.CaptureImgDragArray;
        CaptureImgDragArray.map((item,index)=>{
            if (item.data.position && item.data.id) {
                if (this.state[item.data.id]) {
                    Object.customAssign(this.state[item.data.id],item.data.position);
                    this.setState({[item.data.id]:this.state[item.data.id]});
                }
            }
        });
    };
    handlerMsglistCaptureImgResize(handleData) {//msglist,截屏图片的缩放
        //先保存，白板返回初始值，等设置完初始值后再处理
        let listCaptureImgResizeArray = handleData.message.CaptureImgResizeArray;
        if (listCaptureImgResizeArray) {//处理msglist的缩放数据
            const defalutFontSize = window.innerWidth / TkConstant.STANDARDSIZE;
            listCaptureImgResizeArray.map((item,index)=>{
                if (item.data.scale && item.data.id) {
                    let scale = item.data.scale;
                    if (this.state.eleResizeInfos && this.eleInitResizeInfos) {
                        let {width:initWidth,height:initHeight} = this.eleInitResizeInfos[item.data.id];
                        let newWidth = initWidth*scale;
                        let newHeight = initHeight*scale;
                        this.state.eleResizeInfos[item.data.id] = {width:newWidth, height:newHeight};
                        this.setState({
                            eleResizeInfos: this.state.eleResizeInfos,
                        });
                    }
                }
            });
        }
    };
    /*--msglist--end*/
    /*选择的标注工具是否是鼠标*/
    receiveWhiteboardSDKAction(recvEventData){
        let {action , cmd} = recvEventData.message ;
        let useToolInfo = {...this.state.useToolInfo};
        switch (action) {
            case 'viewStateUpdate':
                for (let key in cmd.viewState) {
                    switch (key) {
                        case 'other':
                            useToolInfo.blackboardToolsInfo.pencilWidth = cmd.viewState.other.pencilWidth;
                            useToolInfo.blackboardToolsInfo.shapeWidth = cmd.viewState.other.shapeWidth;
                            useToolInfo.blackboardToolsInfo.eraserWidth = cmd.viewState.other.eraserWidth;
                            useToolInfo.blackboardToolsInfo.fontSize = cmd.viewState.other.fontSize;
                            useToolInfo.useToolColor = cmd.viewState.other.primaryColor;
                            this.setState({useToolInfo:useToolInfo});
                            break;
                        case 'tool':
                            let updateTool=cmd.viewState[key];
                            for (let [keys, value] of Object.entries(updateTool)) {
                                if(keys === 'tool_mouse'){
                                    this.setState({selectMouse:updateTool[keys].isUse});
                                }
                                if(value.isUse){
                                    useToolInfo.useToolKey = keys
                                    this.setState({useToolInfo:useToolInfo});
                                }
                            }
                            break;
                    }
                }
        }
    }


    /*回放清除所有信息*/
    handlerRoomPlaybackClearAll() {
        for (let [key,value] of Object.entries(this.state.captureImgInfos)) {
            if (this.state["captureImg_"+key]) {
                delete this.state["captureImg_"+key];
            }
        }
        this.initDragData(true);
        this.setState({
            captureImgInfos:{},//保存截屏的图片信息
            dragPosition:{},//保存拖拽位置
            eleResizeInfos:{},//保存元素大小
        });
        this.eleInitResizeInfos = {};//保存元素初始大小
    };
    /*保存截屏的图片信息*/
    handleCaptureImg(captureImgInfo) {
        let captrreImgId = captureImgInfo.fileid;
        let copyCaptureImgInfos = {...this.state.captureImgInfos};//复制截屏信息对象
        copyCaptureImgInfos[captrreImgId] = captureImgInfo;//保存截屏的图片信息
        this.setState({
            captureImgInfos:copyCaptureImgInfos,
        });
    }
    /*获取截屏图片的数组标签*/
    _getCaptureImgEleArr (captureImgInfos) {
        let captureImgEleArr = [];
        let draggableData = {
            onStopDrag: this.onStopDrag.bind(this),//拖拽结束
            changePosition:this.changePosition.bind(this),//改变位置
        };
        for (let [key,value] of Object.entries(captureImgInfos)) {
            if (!this.state["captureImg_"+key]) {
                this.state["captureImg_"+key] = {
                    left:0,
                    top:0,
                    percentLeft:0.5,
                    percentTop:0.5,
                    isDrag:false,
                };
            }
            if (this.state.eleResizeInfos && !this.state.eleResizeInfos["captureImg_"+key]) {
                this.state.eleResizeInfos["captureImg_"+key] = {
                    width:0,
                    height:0,
                };
            }
            if (this.eleInitResizeInfos && !this.eleInitResizeInfos["captureImg_"+key]) {
                this.eleInitResizeInfos["captureImg_"+key] = {
                    width:0,
                    height:0,
                    originalResizeScale:1,
                };
            }
            captureImgEleArr.push(<CaptureImg key={key} position={this.state["captureImg_"+key]} id={"captureImg_"+key} captureImgInfo={value}
                                              draggableData={draggableData} resizeInfo={this.state.eleResizeInfos["captureImg_"+key]}
                                              useToolInfo={this.state.useToolInfo} sendSignallingOfResize={this.sendSignallingOfResize.bind(this)}
                                              sendSignallingOfDrag={this.sendSignallingOfDrag.bind(this)} changeEleReSize={this.changeEleReSize.bind(this)}
                                              eleInitResizeInfos={this.eleInitResizeInfos["captureImg_"+key]} changeLayerIsShow={this.changeLayerIsShow.bind(this)}
                                              selectMouse={this.state.selectMouse}/>)
        }
        return captureImgEleArr;
    };

    handleLayerIsShow(handledata){
        this.changeLayerIsShow(handledata.data.mainContentLayerIsShow)
    }
    /*改变浮层是否显示*/
    changeLayerIsShow(mainContentLayerIsShow) {
        this.setState({mainContentLayerIsShow:mainContentLayerIsShow,});
    };
    /*获取初始大小*/
    setInitResize(id, data, borderSize) {
        let originalResize = {...data};
        let originalResizeScale = originalResize.width/originalResize.height;
        const defalutFontSize = window.innerWidth / TkConstant.STANDARDSIZE;
        //获取白板区域宽高：
        let boundsEleW,boundsEleH;
        if (TK.SDKTYPE === 'pc') {
            let boundsEle = document.getElementById('lc-full-vessel');
            boundsEleW = boundsEle.clientWidth;
            boundsEleH = boundsEle.clientHeight;
        }else {
            boundsEleW = TkGlobal.windowInnerWidth;
            boundsEleH = TkGlobal.windowInnerHeight;
        }
        if (originalResize.width > boundsEleW - borderSize*2*defalutFontSize || originalResize.height > boundsEleH - borderSize*2*defalutFontSize) {
            if (originalResizeScale > boundsEleW/boundsEleH) {
                originalResize.width = boundsEleW - borderSize*2*defalutFontSize;
                originalResize.height = originalResize.width/originalResizeScale;
            }else {
                originalResize.height = boundsEleH - borderSize*2*defalutFontSize;
                originalResize.width = originalResize.height*originalResizeScale;
            }
        }
        this.eleInitResizeInfos[id] = {
            width:originalResize.width/defalutFontSize,
            height:originalResize.height/defalutFontSize,
            originalResizeScale:originalResizeScale,
        };
        this.state.eleResizeInfos[id] = {
            width:originalResize.width/defalutFontSize,
            height:originalResize.height/defalutFontSize,
        };
        this.setState({eleResizeInfos:this.state.eleResizeInfos});
        return originalResize;
    };
    /*发送组件缩放的信令*/
    sendSignallingOfResize(id) {
        if (id.startsWith('captureImg_')) {
            let fileId = id.split('_')[1];
            let data = {
                id:id,
                scale:this.state.eleResizeInfos[id].width/this.eleInitResizeInfos[id].width,
            };
            let signallingId = 'CaptureImgResize_' + fileId;
            let associatedMsgID = 'CaptureImg_' + fileId;
            ServiceSignalling.sendSignallingFromCaptureImgResize(data, signallingId, associatedMsgID);
        }
    };
    /*设置组件大小*/
    changeEleReSize(id, newSize) {//newWidth单位为rem
        this.state.eleResizeInfos[id] = newSize;
        this.setState({
            eleResizeInfos: this.state.eleResizeInfos,
        });
    };
    /*初始化拖拽数据*/
    initDragData(isPlaybackClear) {
        let dragDataArrSync = ['moreBlackboardDrag','timerDrag', 'dialDrag', 'answerDrag',
            'answerDragS','responderDrag'];
        let dragDataArr = ['page_wrap', 'lc_tool_container', 'coursewareRemarks', 'qrCodeDrag',
            'customTrophy', 'programmShare'];
        let dragDataSync = {};
        dragDataArrSync.map((item,index)=>{
            dragDataSync[item] = {
                left:0,
                top:0,
                percentLeft:0,
                percentTop:0,
                isDrag:false,
            };
        });
        this.setState(dragDataSync);
        if (isPlaybackClear) {return}
        let dragData = {};
        dragDataArr.map((item,index)=>{
            dragData[item] = {
                left:0,
                top:0,
                percentLeft:0,
                percentTop:0,
                isDrag:false,
            };
        });
        this.setState(dragData);
    };
    /*开始拖拽*/
    onStartDrag(e,dragData) {
        /*if (e.target.nodeName === 'BUTTON') {
            return false;
        }*/
    };
    /*拖拽结束*/
    onStopDrag(event, dragData, percentPosition) {
        let id = dragData.node.id;
        if (id && id !== '' && (this.state[id].left !== dragData.x || this.state[id].top !== dragData.y)) {
            this.state[id].left = dragData.x;
            this.state[id].top = dragData.y;
            this.state[id].isDrag = true;
            Object.customAssign(this.state[id], percentPosition);//保存百分比
            this.setState({
                [id]:this.state[id],
            });
            this.sendSignallingOfDrag(id);
        }
    };
    /*修改拖拽的位置*/
    changePosition(id, position, isSendSignalling) {
        if (position && id) {
            Object.customAssign(this.state[id], position);
            this.setState({[id]:this.state[id]});
            if (isSendSignalling) {
                this.sendSignallingOfDrag(id);
            }
        }
    };

    /*发送组件拖拽的信令*/
    sendSignallingOfDrag(id) {
        let {percentLeft,percentTop} = this.state[id];
        let position = {
            percentLeft:percentLeft,
            percentTop:percentTop,
            isDrag:true
        };
        if (id.startsWith('captureImg_')) {
            let fileId = id.split('_')[1];
            let data = {
                id:id,
                position:position,
            };
            let signallingId = 'CaptureImgDrag_' + fileId;
            let associatedMsgID = 'CaptureImg_' + fileId;
            ServiceSignalling.sendSignallingFromCaptureImgDrag(data, signallingId, associatedMsgID);
        }else {
            if(TkGlobal.playback && TkGlobal.roomlayout === '0'){
                return;
            }
            switch (id) {
                case 'timerDrag'://抢答器的拖拽
                    ServiceSignalling.sendSignallingFromTimerDrag(position);
                    break;
                case 'moreBlackboardDrag'://小黑板
                    eventObjectDefine.CoreController.dispatchEvent({type:'isSendSignallingFromBlackBoardDrag', message:{data:position}});
                    break;
                case 'dialDrag'://转盘
                    ServiceSignalling.sendSignallingFromDialDrag(position);
                    break;
                case 'responderDrag'://抢答器
                    ServiceSignalling.sendSignallingFromResponderDrag(position);
                    break;
                case 'answerDrag'://答题卡
                    ServiceSignalling.sendSignallingFromAnswerDrag(position);
                    break;
            }
        }
    }

    render(){
        let that = this ;
        let {loadTimeRemindSmart,isVideoInFullscreenFile,captureImgInfos, mainContentLayerIsShow , isPauseMedia} = that.state ;
        let { areaExchangeFlag ,styleJson} = that.props;
        let draggableData = {
            bounds:TK.SDKTYPE === 'pc'?'#lc-full-vessel':'#tk_app',
            onStartDrag: this.onStartDrag.bind(this),//开始拖拽
            onStopDrag: this.onStopDrag.bind(this),//拖拽结束
            changePosition:this.changePosition.bind(this),//改变位置
            changeLayerIsShow:this.changeLayerIsShow.bind(this),//改变浮层是否显示
        };
        let fullBtm={
            height: '0.4rem',
            width: '0.4rem',
            marginLeft:'0.2rem',
            display:'none'
        }
        return (
            <article id="content" className={"lc-container add-fl "+ (areaExchangeFlag ? 'areaExchange':'') + (isVideoInFullscreenFile?" zIndexBig":"")} style={areaExchangeFlag ? this.areaExchangeStyle : styleJson}>
            {/*白板以及动态PPT等区域*/}
                <div className={"add-position-relative lc-full-vessel " + (isVideoInFullscreenFile?" pictureInPicture big":"")}  >
                    <div style={{width:'100%' , height:'100%',position:'relative'}} id="lc-full-vessel"  >
                        <MainWhiteboardSmart styleJson={styleJson} /> {/*主白板*/}
                        <VideoDrawingBoard />
                        <MoreBlackboardSmart id="moreBlackboardDrag"  blackboardThumbnailImageId={"blackboardThumbnailImageId"} blackboardCanvasBackgroundColor={"#ffffff"} moreBlackboardDrag={that.state.moreBlackboardDrag} draggableData = {draggableData}/>{/*多黑板组件*/}
                        { (!TkGlobal.playback && loadTimeRemindSmart ) ? <TimeRemind roomConnected={loadTimeRemindSmart} /> : undefined  } {/*提示信息*/}
                        <TimerTeachingToolSmart id="timerDrag" timerDrag={that.state.timerDrag} draggableData = {draggableData}/>
                        <QrCodeTeachingToolSmart id="qrCodeDrag"  qrCodeDrag={that.state.qrCodeDrag} draggableData = {draggableData}/>
                        <DialTeachingToolSmart id="dialDrag" dialDrag={that.state.dialDrag} draggableData={draggableData}/>
                        <ResponderTeachingToolSmart id="responderDrag" responderDrag={that.state.responderDrag} draggableData={draggableData}/>
                        {this._getCaptureImgEleArr(captureImgInfos)}{/*截屏图片的数组标签*/}
                        <div id="mainContentLayer" style={{display:mainContentLayerIsShow?'block':'none'}} className="main-content-layer" />{/*主要内容区的浮层，目前用于拖拽时显示*/}
                        {TkGlobal.isOnlyAudioRoom? undefined:<ProgrammShareSmart  id="programmShare" programmShareDrag={that.state.programmShare} draggableData={draggableData}/>}
                        {TkGlobal.isOnlyAudioRoom? undefined:<ShareSmart/>}
                        {TkConstant.joinRoomInfo.pointerReminder && TkConstant.hasRole.roleStudent ? <PointerReminderContentBar /> : undefined}{/*教鞭组件*/}
                        <FullScreenBtn id="full_btn_wrap" fullBtm={fullBtm}/>
                        {!TkGlobal.playback?<BigRoomAnswerPanel id="answerDrag" answerDrag={that.state.answerDrag} draggableData={draggableData}/>:undefined}{/*todo 回放暂时隐去答题卡*/}
                        {!TkGlobal.playback?<BigRoomStudentAnswerPanel  id="answerDragS" answerDragS={that.state.answerDragS} draggableData={draggableData}/>:undefined}{/*todo 回放暂时隐去答题卡*/}
                    </div>
                </div>
                <div style={{position: 'fixed', zIndex: '999999', top: '30%', left: 0, color: '#999', background: 'greenyellow', borderRadius: '5px'}}>
                </div>
            </article>
        )
    };
}
RightContentVesselSmart.defaultProps = {
    systemHideTime:0 ,
};
/*export default  DropTarget('talkDrag', specTarget, connect => ({
    connectDropTarget: connect.dropTarget(),
}))(RightContentVesselSmart);*/

export default RightContentVesselSmart;