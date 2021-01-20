/**
 * 工具箱 白板组件
 * @module MoreBlackboardSmart
 * @description   小白板组件
 * @author QiuShao
 * @date 2017/7/27
 */
'use strict';
import "./static/css/index.css";
import "./static/css/index_black.css";
import React from 'react';
import eventObjectDefine from 'eventObjectDefine';
import TkConstant from 'TkConstant';
import TkGlobal from 'TkGlobal';
import TkUtils from 'TkUtils';
import CoreController from 'CoreController';
import ServiceSignalling from 'ServiceSignalling';
import ServiceRoom from 'ServiceRoom';
import BlackboardSmart from '../whiteboard';
import ReactDrag from 'reactDrag';
import TkSliderDumb from 'TkSliderDumb';
import ColorPicker from "../../../../components/colorPicker/index"

class MoreBlackboardSmart extends React.Component{
    constructor(props){
        super(props);
        this.listernerBackupid = new Date().getTime()+'_'+Math.random();
        this.state = Object.customAssign({} , this._getDefaultState() , {
            show:false ,
            moreBlackboardDrag:{
                pagingToolLeft:"",
                pagingToolTop:"",
            },
            isClickSetButton:false,
            useToolColor:undefined,
            resizeInfo:{
                width:0,
                height:0,
            },
            selectBlackboardFontSizeId:'font-36' ,
            isColorPickerShow:false,
            isTextColorPickerShow:false,
            isEraserShow:false,
            isTextShow:false,
            eraserIsDisabled:true,
            num:0
        });
        this.containerWidthAndHeight = {};
        this.isSetDefaultPosition = false;
        this.isMsglist = false;
        this.countNotice=0;
        this.msglist_BlackBoard_recvEventData={};
        this.blackboardCanvasBackgroundColor = this.props.blackboardCanvasBackgroundColor || "#ffffff";
        this.blackboardThumbnailImageId = this.props.blackboardThumbnailImageId ||  'blackboardThumbnailImageId';
        this.associatedMsgID = 'BlackBoard_new';
        this.currentTapKey = undefined ;
        this.whiteboardMagnification = 16 /9 ;
        this.maxBlackboardNumber = 8 ; //超过7个后显示左右按钮
        this.studentBlackboardList={};//小白板的学生数据
        this.hasNewBlackBoard=false; //是否开启开启小白板
        this.hasUserNewBlackBoard = false ; //是否用户自己拥有小白板
        this.titleContainerHeight = undefined;
        this.blackboardToolContainerHeight = undefined;
    };
    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        let that = this ;
        eventObjectDefine.Window.addEventListener(TkConstant.EVENTTYPE.WindowEvent.onResize , that.handlerOnResize.bind(that)   , that.listernerBackupid); //window.resize事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPubmsg ,that.handlerRoomPubmsg.bind(that) , that.listernerBackupid ); //roomPubmsg 事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDelmsg ,that.handlerRoomDelmsg.bind(that) , that.listernerBackupid ); //roomPubmsg 事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomParticipantJoin ,that.handlerRoomParticipantJoin.bind(that) , that.listernerBackupid ); //roomParticipantJoin 事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomParticipantLeave ,that.handlerRoomParticipantLeave.bind(that) , that.listernerBackupid ); //roomParticipantLeave 事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDisconnected ,that.handlerRoomDisconnected.bind(that) , that.listernerBackupid ); //roomDisconnected 事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPlaybackClearAllFromPlaybackController ,that.handlerRoomPlaybackClearAll.bind(that) , that.listernerBackupid );
        eventObjectDefine.CoreController.addEventListener('receive-msglist-NewBlackBoard' ,that.handlerReceive_msglist_NewBlackBoard.bind(that)  , that.listernerBackupid );
        eventObjectDefine.CoreController.addEventListener('receive-msglist-MoreUsers' ,that.handlerReceive_msglist_MoreUsers.bind(that)  , that.listernerBackupid );
        eventObjectDefine.CoreController.addEventListener("resizeHandler" ,that.handlerResizeHandler.bind(that) , that.listernerBackupid); //接收resizeHandler事件执行resizeHandler
        eventObjectDefine.CoreController.addEventListener("isSendSignallingFromBlackBoardDrag" ,that.handlerBlackBoardDrag.bind(that) , that.listernerBackupid); //接收小黑板的拖拽信息
        eventObjectDefine.CoreController.addEventListener('receive-msglist-UserHasNewBlackBoard' ,that.handlerReceive_msglist_UserHasNewBlackBoard.bind(that)  , that.listernerBackupid );
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomUserpropertyChanged , this.handlerRoomUserpropertyChanged.bind(this) , this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener('callAllWrapOnClick', that.handlerCallAllWrapOnClick.bind(that), that.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener('SwitchLayout' ,that.handlerSwitchLayout.bind(that)  , that.listernerBackupid );
        eventObjectDefine.CoreController.addEventListener('changeSize' ,that.handlerSwitchLayout.bind(that)  , that.listernerBackupid );
        this._init();
    };

    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        let that = this ;
        clearTimeout( this.disabledBlackboardToolBtnTimer ) ;
        eventObjectDefine.Window.removeBackupListerner(that.listernerBackupid);
        eventObjectDefine.CoreController.removeBackupListerner(that.listernerBackupid);
    };

    componentDidUpdate(prevProps , prevState){ //在组件完成更新后立即调用,在初始化时不会被调用
        if(prevState.show !== this.state.show && this.state.show){
            this._updateContainerWidthAndHeight();
            if (this.isSetDefaultPosition) {
                this.isSetDefaultPosition = false;
                this.setDefaultPosition();
            }
        }
        if(prevState.blackBoardState !== this.state.blackBoardState){
            this._updateBlackBoardDescListByBlackBoardState();
            this._updateContainerWidthAndHeight();
        }
        this.updateResize();
    };
    /*更新大小*/
    updateResize () {
        let {id} = this.props;
        let dragNode = document.getElementById(id);
        if (dragNode) {
            const defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
            let width = dragNode.offsetWidth/defalutFontSize;
            let height = dragNode.offsetHeight/defalutFontSize;
            if (this.state.resizeInfo && (!Object.is(this.state.resizeInfo.width, width ) || !Object.is(this.state.resizeInfo.height, height))) {
                this.state.resizeInfo={
                    width,
                    height,
                };
                this.setState({resizeInfo:this.state.resizeInfo});
            }
        }
    }
    /*设置初始位置*/
    setDefaultPosition() {
        let {id,draggableData} = this.props;
        let dragNode = document.getElementById(id);
        let boundNode = document.querySelector(draggableData.bounds);
        if (dragNode && boundNode) {
            if (draggableData.changePosition && typeof draggableData.changePosition === "function") {
                let isSendSignalling = false;
                draggableData.changePosition(id, {percentLeft:0.5,percentTop:0.5,isDrag:false}, isSendSignalling);
            }
        }
    }

    handlerSwitchLayout(){
        const that = this;
        setTimeout(function(){
            that._updateContainerWidthAndHeight();
        },100)
    }

    handlerRoomPlaybackClearAll(){
        TkGlobal.isMoreUsers=false;
        this._recoverDedaultState();
    };

    handlerRoomDisconnected(){
        this._recoverDedaultState();
    };

    handlerRoomParticipantJoin(){
        this._updateBlackBoardDescListByBlackBoardState();
    };
    handlerRoomUserpropertyChanged(recvEventData){
        let {message , user}=recvEventData;
        if(message.publishstate && this.hasNewBlackBoard){
            if(message.publishstate!==0 && user.role===2 && user.id===ServiceRoom.getTkRoom().getMySelf().id){
                if(!TkGlobal.playback && !this.hasUserNewBlackBoard && TkConstant.hasRole.roleStudent && (!(TkGlobal.isMoreUsers || TkGlobal.HeightConcurrence) || (message.publishstate!==0 && (TkGlobal.isMoreUsers || TkGlobal.HeightConcurrence)))){
                    let data = {//应该是发一次？,之前的有白班的也要还有！！ 只有学生，还么有发过
                        id: ServiceRoom.getTkRoom().getMySelf().id,
                        nickname: ServiceRoom.getTkRoom().getMySelf().nickname ,
                        role:ServiceRoom.getTkRoom().getMySelf().role ,
                    } ;
                    ServiceSignalling.sendSignallingFromUserHasNewBlackBoard(data);
                }
            }
        }
    }
    handlerRoomParticipantLeave(){
        this._updateBlackBoardDescListByBlackBoardState();
    };

    handlerOnResize(){
        this._updateContainerWidthAndHeight();
    };

    handlerResizeHandler(recvEventData){
        this._updateContainerWidthAndHeight();
    };

    handlerReceive_msglist_NewBlackBoard(recvEventData){
        this.isMsglist = true;
        this.handlerRoomPubmsg(recvEventData);
    };
    handlerReceive_msglist_MoreUsers(recvEventData){
        this.handlerRoomPubmsg(recvEventData);
    };
    handlerReceive_msglist_UserHasNewBlackBoard(recvEventData){
        let message=recvEventData.message;
        for (let value of message) {
            let data={};
            data.message=value;
            this.handlerRoomPubmsg(data);
        }
    }
    handleCloseWhiteBoardNotice(){
        this.setState({show:false});
    }
    /*视频标注白板的返回*/
    receiveVideoWhiteboardSDKAction(recvEvent){
        let {action,cmd} = recvEvent;
        if(action === 'viewStateUpdate'){
            let eraserIsDisabled = cmd.viewState.tool['tool_eraser'].disabled;
            this.setState({eraserIsDisabled:eraserIsDisabled});
        }
    }
    handlerRoomPubmsg(recvEventData){
        let pubmsgData = recvEventData.message;
        switch (pubmsgData.name) {
            case "switchLayout":
                this.handlerSwitchLayout();
                break;
            case "UserHasNewBlackBoard":
                if(pubmsgData.data.id===ServiceRoom.getTkRoom().getMySelf().id){
                    this.hasUserNewBlackBoard=true
                }
                this._getstudentBlackboardList(pubmsgData.data , 'add');
                this._updateBlackBoardDescListByBlackBoardState();
                break;
            case "MoreUsers":
                if(pubmsgData.data.hasMoreUser){
                     TkGlobal.isMoreUsers=true;
                }else{
                     if(TkGlobal.playback){
                        TkGlobal.isMoreUsers=false;
                     }
                }
                this._updateBlackBoardDescListByBlackBoardState();
                break;
            case "BlackBoard_new":
            if(!TkGlobal.HeightConcurrence || !TkGlobal.isMoreUsers){
                this.hasNewBlackBoard=true
            }else{
                this.hasNewBlackBoard=false
            }
                if(!this.hasUserNewBlackBoard && TkConstant.hasRole.roleStudent && ServiceRoom.getTkRoom().getMySelf().publishstate===0 && (TkGlobal.isMoreUsers || TkGlobal.HeightConcurrence) && (pubmsgData.data.blackBoardState === '_dispenseed' || pubmsgData.data.blackBoardState === '_againDispenseed'|| pubmsgData.data.blackBoardState === '_recycle') ){
                    this.handleCloseWhiteBoardNotice();
                }else{
                    if( (TkConstant.hasRole.roleChairman ||  TkConstant.hasRole.roleTeachingAssistant) && this.state.useToolColor  === undefined ){
                        this.setState({
                            useToolColor:'#ED3E3A'
                        });
                    }else if( !(TkConstant.hasRole.roleChairman ||  TkConstant.hasRole.roleTeachingAssistant) && this.state.useToolColor  === undefined ){
                        this.setState({
                            useToolColor:'#000000'
                        });
                    }
                    if( ( (TkConstant.hasRole.roleChairman ||  TkConstant.hasRole.roleTeachingAssistant ||  TkConstant.hasRole.rolePatrol || TkConstant.hasRole.roleRecord || TkConstant.hasRole.rolePlayback ) && pubmsgData.data.blackBoardState !== '_none' )
                        || (pubmsgData.data.blackBoardState === '_dispenseed' || pubmsgData.data.blackBoardState === '_recycle' || pubmsgData.data.blackBoardState === '_againDispenseed') ){
                        if (this.isMsglist === false) {
                            this.isSetDefaultPosition = true;
                        }
                        if(!TkGlobal.playback && TkConstant.hasRole.roleStudent && !this.hasUserNewBlackBoard && (!(TkGlobal.isMoreUsers || TkGlobal.HeightConcurrence) || (ServiceRoom.getTkRoom().getMySelf().publishstate!==0 && (TkGlobal.isMoreUsers || TkGlobal.HeightConcurrence)))){
                            let data = {//应该是发一次？,之前的有白班的也要还有！！ 只有学生，还么有发过
                                id: ServiceRoom.getTkRoom().getMySelf().id,
                                nickname: ServiceRoom.getTkRoom().getMySelf().nickname ,
                                role:ServiceRoom.getTkRoom().getMySelf().role ,
                                publishstate:ServiceRoom.getTkRoom().getMySelf().publishstate ,
                            } ;
                            ServiceSignalling.sendSignallingFromUserHasNewBlackBoard(data);
                        }
                        this.setState({
                            show:true
                        });
                    }
                    let currentTapKey = this.currentTapKey ;
                    let blackBoardState = this.state.blackBoardState  ;
                    if(pubmsgData.data.currentTapKey !== undefined){
                        this.currentTapKey = pubmsgData.data.currentTapKey ;
                    }
                    if(pubmsgData.data.currentTapPage !== undefined && this.state.currentTapPage !== pubmsgData.data.currentTapPage ){
                        this.state.currentTapPage = pubmsgData.data.currentTapPage ;
                    }
                    this.setState({
                            blackBoardState:pubmsgData.data.blackBoardState ,
                            updateState:!this.state.updateState ,
                            currentTapPage:this.state.currentTapPage ,
                    });
                    if( blackBoardState === pubmsgData.data.blackBoardState && currentTapKey !== pubmsgData.data.currentTapKey){
                        if(  !(TkConstant.hasRole.roleStudent && ( pubmsgData.data.blackBoardState === '_dispenseed'  || pubmsgData.data.blackBoardState === '_againDispenseed'  ) )  ){
                            this._updateBlackBoardDescListByBlackBoardState();
                        }
                    }
                }

                break;
        }
    };

    handlerRoomDelmsg(recvEventData){
        let delmsgData = recvEventData.message;
        switch (delmsgData.name) {
            case "BlackBoard_new":
                this._recoverDedaultState();
                break;
            case "ClassBegin":
                this._recoverDedaultState();
                break;
            case "UserHasNewBlackBoard":
                this._getstudentBlackboardList(delmsgData.data , "delete");
                this._updateBlackBoardDescListByBlackBoardState();
                break;
        }
    };

    handlerBlackBoardDrag(handleData) {//接收小黑板的拖拽信息
        if(TkGlobal.playback && TkGlobal.roomlayout === '0'){
            return;
        }
        let BlackBoardDragInfo = handleData.message.data;
        if (this.state.blackBoardState === '_recycle') {//小黑板处于回收状态
            ServiceSignalling.sendSignallingFromBlackBoardDrag(BlackBoardDragInfo);
        }
    };

    handlerCloseClick(){
        let isDelMsg = true , data = {} ;
        let {id} = this.props;
        ServiceSignalling.sendSignallingFromNewBlackBoard(data , isDelMsg);

        //关闭小白板，启用工具箱按钮
        eventObjectDefine.CoreController.dispatchEvent({
            type:'colse-holdAll-item' ,
            message: {
                type: 'blackboard'
            }
        });
        for( let [key , value] of Object.entries(TkGlobal.minimizedDragAndDropArry) ){
            for( let [keys , values] of Object.entries(value) ){
                if(keys === id){
                    TkGlobal.minimizedDragAndDropArry.splice(key,1);
                }
            }
        }
    };

    handlerBlackBoardDispatchClick(){
        let blackBoardState = undefined;
        let {id , moreBlackboardDrag} = this.props;
        let data = {
            percentLeft:moreBlackboardDrag.percentLeft,
            percentTop:moreBlackboardDrag.percentTop,
            isDrag:true
        };
        if( this.state.blackBoardState === '_prepareing'){
            ServiceSignalling.sendSignallingFromBlackBoardDrag(data);//变成分发状态时同步小黑板位置
            blackBoardState = '_dispenseed' ;
        }else if( this.state.blackBoardState === '_dispenseed'){
            ServiceSignalling.sendSignallingFromBlackBoardDrag(data);//点击再次分发时同步小黑板位置
            blackBoardState = '_recycle';
        }else if( this.state.blackBoardState === '_recycle'){
            blackBoardState = '_againDispenseed';
        }else if( this.state.blackBoardState === '_againDispenseed'){
            ServiceSignalling.sendSignallingFromBlackBoardDrag(data);//点击再次分发时同步小黑板位置
            blackBoardState = '_recycle';
        }else  if( this.state.blackBoardState === '_none'){
            L.Logger.error('current blackBoardState is _none , can\'t execute blackBoardDispatchClick!');
            return ;
        }
        if(blackBoardState){
            let isDelMsg = false , data = {
                blackBoardState,  //_none:无 , _prepareing:准备中 , _dispenseed:分发 , _recycle:回收分发 , _againDispenseed:再次分发
                currentTapKey:this.currentTapKey ,
                currentTapPage:this.state.currentTapPage ,
            } ;
            ServiceSignalling.sendSignallingFromNewBlackBoard(data , isDelMsg);
        }
        this.setState({
            disabledBlackboardToolBtn:true
        });
        clearTimeout( this.disabledBlackboardToolBtnTimer ) ;
        this.disabledBlackboardToolBtnTimer = setTimeout(  () => {
            this.setState({
                disabledBlackboardToolBtn:false
            });
        } , 300);
    };

    handlerTabClick(instanceId){
        if(instanceId !== undefined){
            let isDelMsg = false , data = {
                blackBoardState:this.state.blackBoardState,  //_none:无 , _prepareing:准备中 , _dispenseed:分发 , _recycle:回收分发 , _againDispenseed:再次分发
                currentTapKey:instanceId ,
                currentTapPage:this.state.currentTapPage ,
            } ;
            ServiceSignalling.sendSignallingFromNewBlackBoard(data , isDelMsg);
        };
    };

    handleToolClick(toolKey){
        if(toolKey==="tool_pencil"){
            this.setState({
                useToolKey:toolKey,
                isClickSetButton:false,
                isColorPickerShow:!this.state.isColorPickerShow,
                isTextShow:false,
                isEraserShow:false
            })
        }
        if(toolKey==="tool_text"){
            this.setState({
                useToolKey:toolKey,
                isClickSetButton:false,
                isTextShow:!this.state.isTextShow,
                isColorPickerShow:false,
                isEraserShow:false,
            })
        }
        if(toolKey==="tool_eraser"){
            if(this.state.eraserIsDisabled){
                return
            }
            this.setState({
                useToolKey:toolKey,
                isClickSetButton:false,
                isEraserShow:!this.state.isEraserShow,
                isColorPickerShow:false,
                isTextShow:false
            })
        }
    };

    changeStrokeColorClick(colorValue){
        this.setState({
            useToolColor:colorValue ,
            isClickSetButton:false
        });
    };

    onTapPrevOrNextClick(type , send=false){
        let blackboardNumber = Object.keys(this.state.blackBoardDescList).length;
        let totalPage = Math.ceil( blackboardNumber / (this.maxBlackboardNumber-1)) ;
        switch (type){
            case 'prev':
                this.state.currentTapPage--;
                break;
            case 'next':
                this.state.currentTapPage++;
                break ;
        }
        if(this.state.currentTapPage<1){
            this.state.currentTapPage = 1 ;
        }else if(this.state.currentTapPage  > totalPage){
            this.state.currentTapPage = totalPage;
        }
        if(send){
            let isDelMsg = false , data = {
                blackBoardState:this.state.blackBoardState ,  //_none:无 , _prepareing:准备中 , _dispenseed:分发 , _recycle:回收分发 , _againDispenseed:再次分发
                currentTapKey:this.currentTapKey ,
                currentTapPage:this.state.currentTapPage ,
            } ;
            // ServiceSignalling.sendSignallingFromNewBlackBoard(data , isDelMsg);
        };
        this.setState({
            currentTapPage:this.state.currentTapPage
        });
    };

    _init(){
        this._updateContainerWidthAndHeight();
    };

    _updateContainerWidthAndHeight(){
        let moreBlackboardEle = document.getElementById('big_literally_wrap');
        let titleContainer = document.getElementsByClassName('title-container')[0];
        let blackboardToolContainer = document.getElementById('blackboard-tool-container');
        let titleContainerHeight = titleContainer&&titleContainer.clientHeight === 0 ? this.titleContainerHeight : titleContainer.clientHeight;
        let blackboardToolContainerHeight = blackboardToolContainer&&blackboardToolContainer.clientHeight === 0 ? this.blackboardToolContainerHeight : blackboardToolContainer.clientHeight;
        if(moreBlackboardEle){
            let height = Math.floor(moreBlackboardEle.clientHeight*0.9) ;
            let width = Math.floor((height - titleContainerHeight - blackboardToolContainerHeight)*16/9 +16) ;
            if(width < moreBlackboardEle.clientWidth && height < moreBlackboardEle.clientHeight){ //正常比例模式
                this.state.containerWidthAndHeight.height = height ;
                this.state.containerWidthAndHeight.width = width;
                this.setState({
                    containerWidthAndHeight:this.state.containerWidthAndHeight,
                });
                this.containerWidthAndHeight.height = Math.floor(moreBlackboardEle.clientHeight*0.9 - titleContainerHeight - blackboardToolContainerHeight);
                this.containerWidthAndHeight.width = Math.floor(this.containerWidthAndHeight.height*16/9);
            }else if(width > moreBlackboardEle.clientWidth && height < moreBlackboardEle.clientHeight){ //横向缩放模式
                this.containerWidthAndHeight.height = Math.floor((moreBlackboardEle.clientWidth - 16) *9/16);
                this.containerWidthAndHeight.width = Math.floor(moreBlackboardEle.clientWidth - 16);
                this.state.containerWidthAndHeight.width = Math.floor(moreBlackboardEle.clientWidth) ;
                this.state.containerWidthAndHeight.height = Math.floor((moreBlackboardEle.clientWidth - 16)*9/16 + titleContainerHeight + blackboardToolContainerHeight) ;
                this.setState({
                    containerWidthAndHeight:this.state.containerWidthAndHeight ,
                });
            }
        }
        this.forceUpdate();
    };
    _getUser(id){
        let hasUser=false;
        for(let [key,user] of Object.entries( this.studentBlackboardList ) ){
            if(key===id){
                hasUser={}
                hasUser=user;
                break;
            }
        }
        return hasUser
    }
    _updateBlackBoardDescListByBlackBoardState(){
        if(ServiceRoom.getTkRoom()){
            let blackBoardDescList = this.state.blackBoardDescList;
            // if( this.currentTapKey !== 'blackBoardCommon' &&  !ServiceRoom.getTkRoom().getUser(this.currentTapKey) ){ /*NN:看过*/ //users里面没有currentTapKey
            if( this.currentTapKey !== 'blackBoardCommon' &&  !this._getUser(this.currentTapKey) ){ /*NN:看过*/ //users里面没有currentTapKey
                this.currentTapKey = 'blackBoardCommon' ;
            }
            if( this.state.blackBoardState === '_prepareing'){
                if(TkConstant.hasRole.roleChairman ||  TkConstant.hasRole.roleTeachingAssistant ||  TkConstant.hasRole.rolePatrol || TkConstant.hasRole.roleRecord   || TkConstant.hasRole.rolePlayback ){
                    this.currentTapKey = 'blackBoardCommon' ;
                }
                blackBoardDescList = Object.customAssign({} , this._getBlackBoardCommon());
            }else if( this.state.blackBoardState === '_dispenseed' ||  this.state.blackBoardState === '_againDispenseed'){
                if(TkConstant.hasRole.roleStudent){
                    this.currentTapKey = ServiceRoom.getTkRoom().getMySelf().id ;
                }
                blackBoardDescList = Object.customAssign({} , this._getBlackBoardCommon() , this._getStudentBlackboard() );
            }else if( this.state.blackBoardState === '_recycle'){
                blackBoardDescList = Object.customAssign({} , this._getBlackBoardCommon() , this._getStudentBlackboard() );
            }else  if( this.state.blackBoardState === '_none'){
                blackBoardDescList = {} ;
            }
            let blackboardNumber = Object.keys(blackBoardDescList).length;
            let totalPage = Math.ceil( blackboardNumber / (this.maxBlackboardNumber-1)) ;
            if(this.state.currentTapPage<1){
                this.state.currentTapPage = 1 ;
            }else if(this.state.currentTapPage  > totalPage){
                this.state.currentTapPage = totalPage;
            }
            this.setState({
                blackBoardDescList:blackBoardDescList,
                currentTapPage:this.state.currentTapPage
            });
        }
    };
    _getstudentBlackboardList(data , type){
        if(type==='add'){
            if(data.role===2){
                this.studentBlackboardList[data.id] = data;
            }
        }else{
            delete this.studentBlackboardList[data.id]
        }
    }
    _getStudentBlackboard(){
        let studentBlackboardList = {} ;
        /* N： 高并发台上的人才有小白板 */
        for(let [key,user] of Object.entries( this.studentBlackboardList ) ){
            // // if(user.playbackLeaved || (user.publishstate===0 && (TkGlobal.isMoreUsers || TkGlobal.HeightConcurrence))){
            // if(user.publishstate===0 && (TkGlobal.isMoreUsers || TkGlobal.HeightConcurrence)){
            //     continue;
            // } ; //|| user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE

            studentBlackboardList[key] = {
                instanceId:key ,
                show:this.currentTapKey === key ,
                isBaseboard:false ,
                deawPermission: false ,
                dependenceBaseboardWhiteboardID:'blackBoardCommon' ,
                needLooadBaseboard:true ,
                saveImage:false ,
                nickname:user.nickname ,
            };
            if( TkConstant.role.roleStudent && (this.state.blackBoardState === '_dispenseed' || this.state.blackBoardState === '_againDispenseed' ) && ServiceRoom.getTkRoom().getMySelf().id ===  key ){
                studentBlackboardList[key]['deawPermission'] = true ;
            }
            if(  this.state.blackBoardState === '_recycle' &&  (TkConstant.hasRole.roleChairman ||  TkConstant.hasRole.roleTeachingAssistant) ){
                studentBlackboardList[key]['deawPermission'] = true ;
            }
        }
        return studentBlackboardList ;
    };

    _getBlackBoardCommon(extraJson){
        let blackBoardCommon = {
            blackBoardCommon:{
                instanceId:'blackBoardCommon' ,
                show:this.currentTapKey === 'blackBoardCommon' ,
                isBaseboard:this.state.blackBoardState === '_prepareing' ,
                deawPermission:TkConstant.hasRole.roleChairman ||  TkConstant.hasRole.roleTeachingAssistant ,
                dependenceBaseboardWhiteboardID:undefined ,
                needLooadBaseboard:false ,
                saveImage:false ,
                nickname:'blackBoardCommon' ,
            }
        };
        if(extraJson && typeof extraJson === 'object'){
            Object.customAssign(blackBoardCommon.blackBoardCommon ,extraJson ) ;
        }
        return blackBoardCommon  ;
    };

    _getDefaultState(){
        let defaultState = {
            blackBoardState:'_none' , //_none:无 , _prepareing:准备中 , _dispenseed:分发 , _recycle:回收分发 , _againDispenseed:再次分发
            disabledBlackboardToolBtn: false ,
            blackBoardDescList:{} ,
            useToolKey:'tool_pencil' ,
            useToolColor: TkConstant.hasRole.roleChairman === undefined ? undefined : ( (TkConstant.hasRole.roleChairman ||  TkConstant.hasRole.roleTeachingAssistant) ? '#ED3E3A' :  '#000000' ) ,
            containerWidthAndHeight:{
                width:0 ,
                height:0
            } ,
            updateState:false ,
            currentTapPage:1 ,
            blackboardToolsInfo:TK.SDKTYPE !== 'mobile'?{pencil:5 , text:18 , eraser:30} : {pencil:5 , text:45 , eraser:150}   ,
            selectBlackboardToolSizeId:'blackboard_size_small' ,
            blackboardThumbnailImage:undefined ,
        };
        return defaultState ;
    };

    _loadBlackBoardElementArray(blackBoardDescList){
        let users = undefined ;
        let tabContentBlackBoardElementArray = [] ;
        let tabBlackBoardElementArray = [] ;
        let useWidth = this.state.useToolKey ===  'tool_eraser' ? this.state.blackboardToolsInfo.eraser : this.state.blackboardToolsInfo.pencil ;
        let fontSize = this.state.blackboardToolsInfo.text ;
        let descArray = [];
        let blackBoardCommonDesc = undefined ;
        for( let desc of Object.values(blackBoardDescList) ){
            if(desc.instanceId !==  'blackBoardCommon'){
                descArray.push(desc);
            }else{
                blackBoardCommonDesc = desc ;
            }
        }
        descArray.sort(function(obj1, obj2){
            if (obj1 === undefined || !obj1.hasOwnProperty('instanceId') || obj2 === undefined || !obj2.hasOwnProperty('instanceId'))
                return 0;
            if ( obj1.instanceId  < obj2.instanceId) {
                return -1;
            } else if ( obj1.instanceId >  obj2.instanceId) {
                return 1;
            } else {
                return 0;
            }
        });
        if(blackBoardCommonDesc){
            descArray.unshift(blackBoardCommonDesc);
        }
        let blackboardNumber = Object.keys(blackBoardDescList).length;
        let optionTapWidth =  undefined ;
        let marginLeft = undefined ;
        let totalPage = Math.ceil( blackboardNumber / (this.maxBlackboardNumber-1) )  ;
        if(totalPage>1){
            optionTapWidth =  100 / (this.maxBlackboardNumber-1) ;
            if(totalPage === 1 || this.state.currentTapPage < totalPage){
                marginLeft = (this.state.currentTapPage-1)*(this.maxBlackboardNumber-1)*optionTapWidth ;
            }else{
                let difference = totalPage*(this.maxBlackboardNumber-1)-blackboardNumber ;
                marginLeft = ( (this.state.currentTapPage-1)*(this.maxBlackboardNumber-1) - difference )* optionTapWidth ;
            }
        }
        descArray.forEach( (value , index) => {
            if( value.instanceId === 'blackBoardCommon' || (value.instanceId !== 'blackBoardCommon' && ServiceRoom.getTkRoom() && this._getUser(value.instanceId) ) ){  /*NN:EMM*/
                let associatedUserID = undefined ;
                // let associatedUserID = value.instanceId!=='blackBoardCommon'?value.instanceId:undefined ;
                tabContentBlackBoardElementArray.push(
                    <li className="tab-content-option "  key={value.instanceId} style={{display:value.show?'block':'none'}} >
                        <BlackboardSmart containerWidthAndHeight={this.containerWidthAndHeight}  instanceId={value.instanceId}
                                         show={value.show} isBaseboard={value.isBaseboard}  deawPermission={value.deawPermission} dependenceBaseboardWhiteboardID={value.dependenceBaseboardWhiteboardID}
                                         associatedMsgID={this.associatedMsgID} associatedUserID={associatedUserID} needLooadBaseboard={value.needLooadBaseboard}  saveImage={value.saveImage}
                                         nickname={value.nickname} useToolKey={this.state.useToolKey} fontSize={fontSize} useToolColor={this.state.useToolColor}  pencilWidth={useWidth}
                                         saveRedoStack={TkConstant.hasRole.roleChairman || TkConstant.joinRoomInfo.shapeUndoRedoClear} undoRedoClearToMySelf={TkConstant.hasRole.roleStudent && TkConstant.joinRoomInfo.shapeUndoRedoClear} imageThumbnailId={value.show?this.state.blackboardThumbnailImage : undefined}  backgroundColor={this.blackboardCanvasBackgroundColor}
                                         imageThumbnailTipContent={TkGlobal.language.languageData.header.tool.blackBoard.content.blackboardHeadTitle} showShapeAuthor={false}  receiveVideoWhiteboardSDKAction={this.receiveVideoWhiteboardSDKAction.bind(this)}
                        />
                    </li>
                );
                tabBlackBoardElementArray.push(
                    <li style={{marginLeft:index===0?(marginLeft!==undefined?(-marginLeft)+'%':undefined) : undefined ,
                                width:optionTapWidth!==undefined?(optionTapWidth+'%'):undefined ,
                                maxWidth:optionTapWidth!==undefined?(optionTapWidth+'%'):undefined ,
                                minWidth:optionTapWidth!==undefined?(optionTapWidth+'%'):undefined }} className={"tap-option add-nowrap "+(value.show?'active':'') +( !(TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant )?' disabled':' '  ) }
                                key={value.instanceId} onClick={ TK.SDKTYPE !== 'mobile' && (TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant )? this.handlerTabClick.bind(this , value.instanceId) : undefined}
                                onTouchStart={  TK.SDKTYPE === 'mobile' && (TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant )? this.handlerTabClick.bind(this , value.instanceId) : undefined} >
                        <span className="text add-nowrap">{value.instanceId === 'blackBoardCommon'?TkGlobal.language.languageData.header.tool.blackBoard.toolBtn.commonTeacher  :  this._getUser(value.instanceId).nickname }</span>  {/*NN：高并发台上的人才有*/}
                    </li>
                );
            }
        });

        return{
            tabContentBlackBoardElementArray:tabContentBlackBoardElementArray ,
            tabBlackBoardElementArray:tabBlackBoardElementArray
        }
    };

    _loadToolColorsElementArray(){
        let colorsArray = [];
        let colors =  ["#5AC9FA" , "#FFCC00" , "#ED3E3A" , "#4740D2" , "#007BFF" , "#09C62B" ,
            "#000000" , "#EDEDED"] ;
        colors.forEach(  (item , index) => {
            let reactElement = TK.SDKTYPE !== 'mobile' ?
                (<li className={"color-option " + ("color_"+this._colorFilter(item) )+ " " + (this.state.useToolColor === item ? ' active' : '') }  key={index}  onClick={this.changeStrokeColorClick.bind( this , item )}   id={"blackboard_color_"+this._colorFilter(item)} ></li>) :
                (<li key={index} className="blackboard-tool-option-mobile" >
                    <button id={"blackboard_color_"+this._colorFilter(item)} className={"color-option " + ("color_"+this._colorFilter(item) )+ " " + (this.state.useToolColor === item ? ' active' : '') }     onTouchStart={this.changeStrokeColorClick.bind( this , item )} ></button>
                </li>);
            colorsArray.push(reactElement);
        });
        return{
            toolColorsArray:colorsArray
        }
    };

    _colorFilter(text){
        return text.replace(/#/g,"");
    };

    _recoverDedaultState(){
        this.studentBlackboardList={};//小白板的学生数据
        this.hasNewBlackBoard=false; //是否开启开启小白板
        this.hasUserNewBlackBoard = false ;
        clearTimeout( this.disabledBlackboardToolBtnTimer ) ;
        let defaultState = this._getDefaultState();
        this.currentTapKey = undefined ;
        this.setState( Object.customAssign({} , defaultState , {
            show:false ,selectBlackboardFontSizeId:'font-36',
        }));
    };

    /*改变大小的点击事件*/
    _changeStrokeSizeClick(selectBlackboardToolSizeId , strokeJson ){
        this.setState({
            selectBlackboardToolSizeId:selectBlackboardToolSizeId ,
            blackboardToolsInfo:Object.customAssign(this.state.blackboardToolsInfo ,strokeJson ) ,
        });
    };
    handleToolClickSet(){
        let isClickSetButton = this.state.isClickSetButton;
        isClickSetButton = !isClickSetButton;
        this.setState({
            isClickSetButton:isClickSetButton,
        })
    }
    _colorsContainerMouseOver(){
        this.setState({isClickSetButton:true})
    }
    _colorsContainerMouseLeave(){
        this.setState({isClickSetButton:false})
    }
    mouseLeave() {
        this.setState({
            isColorPickerShow: false,
            isEraserShow: false,
            isTextShow: false
        });
    }
    onAfterChangeEraserWidth(value){
        let useToolInfoCopy = {...this.state.blackboardToolsInfo};
        if (value === 0){ value=1}
        useToolInfoCopy.eraser = value;
        this.setState({blackboardToolsInfo:useToolInfoCopy})
    };
    /*改变字体大小的点击事件*/
    _changeFontSizeClick(selectBlackboardFontSizeId , strokeJson ){
        this.setState({
            selectBlackboardFontSizeId:selectBlackboardFontSizeId ,
            blackboardToolsInfo:Object.customAssign(this.state.blackboardToolsInfo ,strokeJson ) ,
        });
    };

    changeFontSize(value){
        if (value === 0){value=1}
        let  testValue = Math.ceil(Number(value))
        let blackboardToolsInfo = {
            pencil:this.state.blackboardToolsInfo.pencil ,
            text:testValue ,
            eraser:this.state.blackboardToolsInfo.eraser
        }
        this.setState({
            blackboardToolsInfo
        })
    }

    onAfterChangePencilWidth(value){
        this.setState({
            num:value
        })
        let useToolInfoCopy = {...this.state.blackboardToolsInfo};
        if (value === 0 ){value=1}
        useToolInfoCopy.pencil = value;
        this.setState({blackboardToolsInfo:useToolInfoCopy})
    }

    afterChange(hexColor){
        if(hexColor){
            this.setState({
                useToolColor:hexColor
            })
        }
    }
    handlerCallAllWrapOnClick(recvEventData){
        let {event} = recvEventData.message ;
        if( !(event.target.className === "blackboard-tool-option") && this.state.isColorPickerShow ){
            this.setState({
                isColorPickerShow:false
            })
            
        }
        if( !(event.target.className === "blackboard-tool-option") && this.state.isTextShow ){
            this.setState({
                isTextShow:false
            })
            
        }
        if( !(event.target.className === "blackboard-tool-option") && this.state.isEraserShow ){
            this.setState({
                isEraserShow:false
            })
            
        }
    }

    stop(e){
        e.stopPropagation();
    }

    render(){
        let that = this ;
        let {blackBoardState , show , blackBoardDescList , containerWidthAndHeight , useToolKey  , blackboardThumbnailImage , resizeInfo , isClickSetButton , selectBlackboardFontSizeId} = that.state ;
        let {id, draggableData, moreBlackboardDrag} = this.props;
        let percentLeft = moreBlackboardDrag.percentLeft;
        let percentTop = moreBlackboardDrag.percentTop;
        if (percentLeft != 0 && !percentLeft) {
            percentLeft = 0.5;
        }
        if (percentTop != 0 && !percentTop) {
            percentTop = 0.5;
        }
        let DraggableData = Object.customAssign({
            id:id,
            handle: '.title-container',
            disabled:!(TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant || ((TkConstant.hasRole.roleStudent|| TkConstant.hasRole.rolePatrol || TkConstant.hasRole.roleRecord) && blackBoardState !== '_recycle')),
            size:resizeInfo,
            percentPosition:{
                percentLeft, percentTop
            },
        },draggableData);
        let blackboardToolBtnText =  (blackBoardState !== '_none') ? (
            (blackBoardState === '_prepareing') ?  TkGlobal.language.languageData.header.tool.blackBoard.toolBtn.dispenseed : (
                (blackBoardState === '_dispenseed') ? TkGlobal.language.languageData.header.tool.blackBoard.toolBtn.recycle  : (
                    (blackBoardState === '_recycle') ? TkGlobal.language.languageData.header.tool.blackBoard.toolBtn.againDispenseed  : (
                        (blackBoardState === '_againDispenseed') ?  TkGlobal.language.languageData.header.tool.blackBoard.toolBtn.recycle : ''
                    )
                )
            )
        ): '' ;
        let {tabContentBlackBoardElementArray , tabBlackBoardElementArray} = that._loadBlackBoardElementArray(blackBoardDescList);
        let {toolColorsArray} = that._loadToolColorsElementArray();
        let blackboardNumber = Object.keys(blackBoardDescList).length;
        let totalPage = Math.ceil( blackboardNumber / (that.maxBlackboardNumber-1) )  ;
        let hideTap = !(blackBoardState === '_recycle' || ( (blackBoardState === '_dispenseed' || blackBoardState === '_againDispenseed' ) &&   (TkConstant.hasRole.roleChairman ||  TkConstant.hasRole.roleTeachingAssistant || TkConstant.hasRole.rolePatrol|| TkConstant.hasRole.roleRecord || TkConstant.hasRole.rolePlayback)  )  ) ;
        let hideBottom = TK.SDKTYPE === 'mobile' &&  TkGlobal.mobileDeviceType === 'phone' ?
            ( !(TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant || TkConstant.hasRole.rolePatrol) && ( TkConstant.hasRole.rolePlayback || TkConstant.hasRole.rolePatrol  || ( TkConstant.hasRole.roleStudent && !(blackBoardState === '_dispenseed' || blackBoardState === '_againDispenseed' ) ) )  ) :
            ( TkConstant.hasRole.rolePlayback || TkConstant.hasRole.rolePatrol  || ( TkConstant.hasRole.roleStudent && !(blackBoardState === '_dispenseed' || blackBoardState === '_againDispenseed' ) ) ) ;
        let hideTitle = TK.SDKTYPE === 'mobile' &&  TkGlobal.mobileDeviceType === 'phone' ;
        if(TK.SDKTYPE === 'mobile'){
            let ohterContentHeightRem = 0 ;
            if(TkGlobal.mobileDeviceType === 'pad'){  //0.8:title , 1.15:bottom , tap:0.8
                if(!hideTitle){
                    ohterContentHeightRem+=0.8;
                }
                if(!hideTap){
                    ohterContentHeightRem+=0.8;
                }
                if(!hideBottom){
                    ohterContentHeightRem+=1.15;
                }
            }else if(TkGlobal.mobileDeviceType === 'phone'){
                if(!hideTap){
                    ohterContentHeightRem+=0.8;
                }
            }
        }
        let tabContentContainerStyle ={
            width:this.containerWidthAndHeight.width,
            height:this.containerWidthAndHeight.height,
            marginLeft:(this.state.containerWidthAndHeight.width-this.containerWidthAndHeight.width)?(this.state.containerWidthAndHeight.width-this.containerWidthAndHeight.width)/2:0
        }
        return (
            <ReactDrag {...DraggableData}>
                <div id={id} style={{display:show?'block':'none',position:'absolute',left:0,top:0 ,width:this.state.containerWidthAndHeight.width ,height:this.state.containerWidthAndHeight.height,zIndex:112}} >
                    <section  className={"black-board-container " +(hideBottom?' hideBottom':' ') +(hideTap?' hideTap':' ')  +(hideTitle?' hideTitle':' ')  }  
                            style={{display:'block', opacity:(blackboardThumbnailImage === undefined ? undefined: 0 )  , zIndex:(blackboardThumbnailImage === undefined ? undefined: -999 )  ,width:this.state.containerWidthAndHeight.width ,height:this.state.containerWidthAndHeight.height}} >
                        <article className="title-container" style={{cursor: ((TkConstant.hasRole.roleStudent|| TkConstant.hasRole.rolePatrol) && blackBoardState === '_recycle')?'default':'move' ,width:'100%' }}>
                            <article className="tap-container clear-float"   style={{display:hideTap?'none':''}}  >
                                <ul className="tap add-fl clear-float"  >
                                    {tabBlackBoardElementArray}
                                </ul>
                                <button className={"prev add-fl "+(that.state.currentTapPage<=1?'disabled':'')}  disabled={that.state.currentTapPage<=1}  style={{display: blackboardNumber < that.maxBlackboardNumber ?'none':''}}   title={TkGlobal.language.languageData.header.tool.blackBoard.title.prev} onClick={(!(that.state.currentTapPage<=1))?that.onTapPrevOrNextClick.bind(that , 'prev' , true):undefined}  ></button>
                                <button className={"next add-fr "+(that.state.currentTapPage>=totalPage?'disabled':'')} disabled={that.state.currentTapPage>=totalPage} style={{display: blackboardNumber < that.maxBlackboardNumber ?'none':''}}   title={TkGlobal.language.languageData.header.tool.blackBoard.title.next} onClick={(!(that.state.currentTapPage>=totalPage))?that.onTapPrevOrNextClick.bind(that , 'next' , true):undefined}   ></button>
                            </article>
                            <div className={'minimize-and-close-wrap-div'}>
                                {/* <button className="blackboard-thumbnail-image" onClick={that.blackboardThumbnailImageClick.bind(that , {action:'shrink'})}  title={TkGlobal.language.languageData.header.tool.blackBoard.title.shrink}  ></button> */}
                                <button  style={{display:!(TkConstant.hasRole.roleChairman ||  TkConstant.hasRole.roleTeachingAssistant)?'none':''}}   className={'blackboard-close-image' } disabled={this.state.disabledBlackboardToolBtn}  onClick={that.handlerCloseClick.bind(that)} title={TkGlobal.language.languageData.header.tool.blackBoard.title.close}></button>
                            </div>
                        </article>
                        <article className="tab-content-container"  id="blackboardContentBox"  style={tabContentContainerStyle} onMouseDown={(e)=>{e.stopPropagation()}}>
                            <ul  className="tab-content clear-float overflow-hidden" style={{width:'100%',height:'100%'}}>
                                {tabContentBlackBoardElementArray}
                            </ul>
                        </article>

                        <article id="blackboard-tool-container" className="blackboard-tool-container clear-float" style={{ width:this.containerWidthAndHeight.width, marginLeft: tabContentContainerStyle.marginLeft}}  >
                            <ul className="blackboard-tool clear-float"   style={{display: ( TkConstant.hasRole.rolePlayback || TkConstant.hasRole.rolePatrol  || ( TkConstant.hasRole.roleStudent && !(blackBoardState === '_dispenseed' || blackBoardState === '_againDispenseed' ) ) )?'none':''}}   >
                                <li className="blackboard-tool-option" >
                                    <button id="blackboard_tool_vessel_pencil" className={"tool-btn pencil-icon " + (useToolKey ===  'tool_pencil' ? ' active':'')} title={TkGlobal.language.languageData.header.tool.blackBoard.boardTool.pen }  onClick={that.handleToolClick.bind(that , 'tool_pencil')}  ></button>
                                    <div style={{ display: this.state.isColorPickerShow ? 'block' : 'none' }} className='pen_colorPicker' onClick={this.stop.bind(this)} onMouseLeave={this.mouseLeave.bind(this)}>
                                        <ColorPicker afterChange = {this.afterChange.bind(this)} color={this.state.useToolColor}/>
                                        <div className='tkSliderDumb-container-wrap'>
                                            <p className = 'line-width-p'>{TkGlobal.language.languageData.whiteboardSetSize.lineWidth}</p>
                                            <div className='tkSliderDumb-container' onMouseMove={this.stop.bind(this)} onMouseDown={this.stop.bind(this)} >
                                                <TkSliderDumb onAfterChange = {this.onAfterChangePencilWidth.bind(this)} value={this.state.blackboardToolsInfo.pencil}/>
                                            </div>
                                            <div className='pencil_val'>{this.state.blackboardToolsInfo.pencil}</div>
                                        </div>
                                        <div className="pencil_sharp_corner"></div>
                                    </div>
                                </li>
                                <li className="blackboard-tool-option" >
                                    <button id="blackboard_tool_vessel_text" className={"tool-btn text-icon"+ (useToolKey ===  'tool_text' ? ' active':'')}   title={TkGlobal.language.languageData.header.tool.blackBoard.boardTool.text }  onClick={that.handleToolClick.bind(that , 'tool_text')}  ></button>
                                    <div style={{ display: this.state.isTextShow ? 'block' : 'none' }} className='text_size' onClick={this.stop.bind(this)} onMouseLeave={this.mouseLeave.bind(this)}>
                                        <ColorPicker afterChange = {this.afterChange.bind(this)} color={this.state.useToolColor}/>
                                        <div className='tkSliderDumb-container-wrap-text'>
                                            <p className='line-width-p'>{TkGlobal.language.languageData.whiteboardSetSize.textWidth}</p>
                                            <div className='tkSliderDumb-container' onMouseMove={this.stop.bind(this)} onMouseDown={this.stop.bind(this)} >
                                                <TkSliderDumb onAfterChange = {this.changeFontSize.bind(this)} value={this.state.blackboardToolsInfo.text}/>
                                            </div>
                                            <div className='pencil_val'>{this.state.blackboardToolsInfo.text}</div>
                                            <div className='text_sharp_corner'></div>
                                        </div>
                                    </div>
                                </li>
                                <li className="blackboard-tool-option" >
                                    <button id="blackboard_tool_vessel_eraser" className={"tool-btn eraser-icon"+ (useToolKey ===  'tool_eraser' ? ' active':'') +(this.state.eraserIsDisabled?' disable':'')}    title={TkGlobal.language.languageData.header.tool.blackBoard.boardTool.eraser }  onClick={that.handleToolClick.bind(that , 'tool_eraser')}  ></button>
                                    <div style={{ display: this.state.isEraserShow ? 'block' : 'none' }} className='eraser_size' onClick={this.stop.bind(this)} onMouseLeave={this.mouseLeave.bind(this)}>
                                        <div className='tkSliderDumb-container-wrap-eraser'>
                                            <p className='line-width-p'>{TkGlobal.language.languageData.whiteboardSetSize.eraserWidth}</p>
                                            <div className='tkSliderDumb-container' onMouseMove={this.stop.bind(this)} onMouseDown={this.stop.bind(this)}>
                                                <TkSliderDumb onAfterChange = {this.onAfterChangeEraserWidth.bind(this)} value={this.state.blackboardToolsInfo.eraser}/>
                                            </div>
                                            <div className='pencil_val'>{this.state.blackboardToolsInfo.eraser}</div>
                                            <div className='eraser_sharp_corner'></div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            <span className="blackboard-function-btn-container">
                                <button  style={{display:!(TkConstant.hasRole.roleChairman ||  TkConstant.hasRole.roleTeachingAssistant)?'none':''}}   className={"blackboard-send-btn " + (this.state.disabledBlackboardToolBtn ? 'disabled':'' ) } disabled={this.state.disabledBlackboardToolBtn}  onClick={that.handlerBlackBoardDispatchClick.bind(that)} >{blackboardToolBtnText}</button>
                            </span>
                        </article>
                    </section>
                </div>
            </ReactDrag>
        )
    };
};
export default MoreBlackboardSmart;


