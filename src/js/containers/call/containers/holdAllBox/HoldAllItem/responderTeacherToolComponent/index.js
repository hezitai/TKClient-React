/**
 * 教学工具箱 Smart组件
 * @module responderTeachingToolComponent
 * @description   抢答器组件
 * @author liujianhang
 * @date 2017/09/20
 */
'use strict';
import "./static/css/index.css";
import "./static/css/index_black.css";
import React from 'react';
import ReactDOM from 'react-dom';
import TkGlobal from 'TkGlobal' ;
import rename from 'TkConstant';
import TkConstant from 'TkConstant' ;
import TkUtils from 'TkUtils';
import eventObjectDefine from 'eventObjectDefine';
import CoreController from 'CoreController';
import ServiceRoom from 'ServiceRoom';
import ServiceSignalling from 'ServiceSignalling' ;
import ReactDrag from 'reactDrag';

class ResponderTeachingToolSmart extends React.Component {
    constructor(props){
        super(props);
        let {id} = this.props;
        this.state={
            responderIsShow:false, //控制抢答器显隐
            answerText:'begin', //抢答器按钮的提示文字
            beginIsStatus:false, //是否开始
            firstUser:false, //是否有第一个抢答者
            responderMsgTitle:'clickTitle', //抢答器上小白板的提示文字
            translateMove:null,
            isHasTransition:false,
            resizeInfo:{
                width:0,
                height:0,
            },
            studentIsGifImg:false, //学生端的背景图是否为gif,
            startTime:0 , //回放开始的时间
            endTime:0 ,   //回放结束的时间
            playBackServerTime:0,//更新播放时间
        };
        this.userSort = {};
        this.userArry = [];
        this.isClick = false;
        this.timesRun = 3;
        this.isSetDefaultPosition = false;
        this.teacherTimeOut = null;
        this.isHasTransition = false;
        this.msglistData = null;
        this.intervals = undefined;
        this.timeOutIntervals = undefined;
        this.temporaryStyle = {
            percentLeft:null,
            percentTop:null
        };
        this.isRestart = false;
        this.getUserPublishState = null;
        this.responderBeginTsValue = 0 ;
        this.fastBackWard = false;
        this.listernerBackupid =  new Date().getTime()+'_'+Math.random();
        this.listernerBackupid =  new Date().getTime()+'_'+Math.random();
    };
    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        const that = this;
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDisconnected,that.handlerRoomDisconnected.bind(that) , that.listernerBackupid); //Disconnected事件：失去连接事件
        eventObjectDefine.CoreController.addEventListener( "receive-msglist-ResponderDrag" , that.handlerMsglistResponderDrag.bind(that), that.listernerBackupid);//msglist,后面进来的人收到抢答器的拖拽位置
        eventObjectDefine.CoreController.addEventListener( "receive-msglist-qiangDaQi" , that.handlerMsglistQiangDaQi.bind(that), that.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener( "receive-msglist-QiangDaZhe" , that.handlerMsglistQiangDaZhe.bind(that), that.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomPubmsg , that.handlerRoomPubmsg.bind(that), that.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomDelmsg , that.handlerRoomDelmsg.bind(that), that.listernerBackupid); //roomDelmsg事件
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomUserpropertyChanged , that.handlerRoomUserpropertyChanged.bind(that) , that.listernerBackupid );
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomConnected ,that.handlerRoomConnected.bind(that), that.listernerBackupid ) ;//roomConnected事件：白板处理
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomPlaybackPlaybackEnd , that.handlerRoomPlaybackPlaybackEnd.bind(that) , that.listernerBackupid );
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPlaybackClearAllFromPlaybackController,that.handlerRoomPlaybackClearAll.bind(that) , that.listernerBackupid); //roomPlaybackClearAll 事件：回放清除所有信令
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomPlaybackPlaybackUpdatetime , that.handlerRoomPlaybackPlaybackUpdatetime.bind(that) , that.listernerBackupid );//服务器回放的播放时间更新
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomPlaybackDuration , that.handlerRoomPlaybackDuration.bind(that) , that.listernerBackupid );//回放的开始时间和结束时间
    };
    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        let that = this ;
        eventObjectDefine.CoreController.removeBackupListerner(that.listernerBackupid);
    };
    //在组件完成更新后立即调用,在初始化时不会被调用
    componentDidUpdate(prevProps , prevState){
        if (prevState.isHasTransition !== this.state.isHasTransition && this.state.isHasTransition) {
            this.isHasTransition = false;
            this.setState({isHasTransition:false})
        }
        if (prevState.responderIsShow !== this.state.responderIsShow && this.state.responderIsShow && this.isSetDefaultPosition) {
            this.isSetDefaultPosition = false;
            this.setDefaultPosition();
        }
        // if (prevState.getUserPublishState !== this.state.getUserPublishState && this.state.getUserPublishState > 0 && this.msglistData) {
        //     for(let message of this.msglistData){
        //         this._teacherRecevedServiceQiangDaQiData(message);
        //     }
        //     this.msglistData = null;
        // }
        let  prevStatePlayBackServerTime = (prevState.playBackServerTime/1000).toFixed(0);
        let  nowPlayBackServerTime = (this.state.playBackServerTime/1000).toFixed(0);
        if(prevState.playBackServerTime !== this.state.playBackServerTime && Math.abs(nowPlayBackServerTime - prevStatePlayBackServerTime)>1 && this.responderBeginTsValue && this.state.playBackServerTime){
            this.fastBackWard = true;
            this.playBackResponderHandle();
        }
    };

    /*房间失去连接*/
    handlerRoomDisconnected(){
        this._clearDataHandle();
        this.setState({responderIsShow: false})
    };

    /*回放抢答器*/
    playBackResponderHandle(){
        const that = this;
        if(that.state.playBackServerTime && that.responderBeginTsValue){
            let currentTime = that._timeDifferenceToFormat(that.state.startTime,that.state.playBackServerTime);
            let timerBeginTime = that._timeDifferenceToFormat(that.state.startTime,that.responderBeginTsValue);
            if(currentTime<=timerBeginTime){
                // clearTimeout(this.state.beginTimeOut);
                clearTimeout(this.state.teacherTimeOut);
                that._clearDataHandle();
            }
            if(currentTime - timerBeginTime>=8){
                clearTimeout(that.state.teacherTimeOut);
                if(!that.state.firstUser) {
                    that.setState({
                        answerText: 'restart',
                        responderMsgTitle: 'noContest',
                    })
                } else {
                    that.setState({
                        answerText: that.state.answerText,
                        responderMsgTitle:that.state.responderMsgTitle,
                    })
                }
            }
            if(currentTime - timerBeginTime>0 && currentTime - timerBeginTime<8){
                let Times = currentTime - timerBeginTime;
                let setTimeoutTimes = (8 - Times)*1000;
                that.setState({
                    responderMsgTitle: 'inAnswerTitle',
                    answerText: 'inAnswerBtn',
                });
                that.state.teacherTimeOut = setTimeout(function() {
                    if(!that.state.firstUser ) {
                        that.setState({
                            answerText: 'restart',
                            responderMsgTitle: 'noContest',
                            beginIsStatus:false
                        })
                    } else {
                        that.setState({
                            answerText: that.state.answerText,
                            responderMsgTitle:that.state.responderMsgTitle,
                            beginIsStatus:false
                        })
                    }
                }, setTimeoutTimes);
            }
        }
    }
    /*回放结束*/
    handlerRoomPlaybackPlaybackEnd(){
        this._clearDataHandle();
        this.setState({responderIsShow:false})
    }
    /*回放清除所有的播放信令*/
    handlerRoomPlaybackClearAll(){
        if(!TkGlobal.playback){L.Logger.error('No playback environment, no execution event[roomPlaybackClearAll] handler ') ;return ;};
       this._clearDataHandle();
        this.setState({responderIsShow:false})
    }
    /*服务器更新回放的播放时间*/
    handlerRoomPlaybackPlaybackUpdatetime(recvEventData){
        const  that = this;
        let playBackServerTime = recvEventData.message.current;
        this.setState({playBackServerTime:playBackServerTime})
    }
    /*回放的开始时间和结束时间*/
    handlerRoomPlaybackDuration(recvEventData){
        const that = this ;
        let {startTime , endTime} = recvEventData.message ;
        that.setState({startTime:startTime , endTime:endTime });
    }
    /*格式化时间差*/
    _timeDifferenceToFormat(startTime , endTime){
        let clock = TkUtils.getTimeDifferenceToFormat(startTime , endTime) ;
        let timeStr = undefined ;
        if(clock){
            let {hh , mm , ss} = clock ;
            timeStr = Number(ss) + mm*60 + hh*360;
        }
        return timeStr ;
    }
    handlerMsglistResponderDrag(handleData) {//msglist,抢答器的拖拽位置
        let ResponderDragInfo = handleData.message.ResponderDragArray;
        ResponderDragInfo.map((item,index)=>{
            this.temporaryStyle.percentLeft = item.data.percentLeft;
            this.temporaryStyle.percentTop = item.data.percentTop;
        });
    };
    /*设置初始位置*/
    setDefaultPosition() {
        let {id,draggableData} = this.props;
        let dragNode = document.getElementById(id);
        let boundNode = document.querySelector(draggableData.bounds);
        if (dragNode && boundNode) {
            if (draggableData.changePosition && typeof draggableData.changePosition === "function") {
                let isSendSignalling = true;
                draggableData.changePosition(id, {percentLeft:0.5,percentTop:0.5,isDrag:false}, isSendSignalling);
            }
        }
    }
    handlerRoomConnected(){
       /* let  img = new Image();
        img.src = require('../../../../../../../../../img/new_template/responder/responder_bg.gif');
        img.onload;*/
    }
    handlerRoomPubmsg(recvEventData){
        const that = this;
        let pubmsgData = recvEventData.message;
        switch (pubmsgData.name) {
            case "qiangDaQi":
                if(!TkConstant.hasRole.roleStudent){
                    that._teacherRecevedServiceQiangDaQiData(pubmsgData);
                }else{
                    if(ServiceRoom.getTkRoom().getMySelf().publishstate>0){
                        that._studentRecevedServiceQiangDaQiData(pubmsgData)
                    }
                }
                break;
            case "QiangDaZhe":
                if(!TkConstant.hasRole.roleStudent){
                    that._teacherRecevedServiceQiangDaZheData(pubmsgData);
                }else{
                    that._studentRecevedServiceQiangDaZheData(pubmsgData)
                }
                break;
            case 'ResponderDrag'://抢答器的拖拽
            if(TkGlobal.playback && TkGlobal.roomlayout === '0'){
                return;
            }
                that.temporaryStyle.percentLeft = pubmsgData.data.percentLeft;
                that.temporaryStyle.percentTop = pubmsgData.data.percentTop;
                break;
        }
    };
    handlerRoomDelmsg(recvEventData){
        const that = this;
        let pubmsgData = recvEventData.message;
        switch (pubmsgData.name) {
            case "ClassBegin":
                that._clearDataHandle();
                that.setState({responderIsShow: false})
                break;
            case "qiangDaQi":
                if(!TkConstant.hasRole.roleStudent){
                    if(pubmsgData.data.isShow){//重新开始
                        that._clearDataHandle();
                        that.setState({responderIsShow: true})
                    }else{
                        that._clearDataHandle();
                        that.setState({responderIsShow: false})
                    }
                }else{
                    that._clearDataHandle();
                    that.setState({responderIsShow: false})
                }
                that.setState({responderIsShow: false})
                break;
        }
    };

    /*清除数据的函数*/
    _clearDataHandle(){
        clearTimeout(this.teacherTimeOut);
        clearInterval(this.intervals);
        clearTimeout(this.timeOutIntervals);
        this.setState({
            answerText:'begin',
            beginIsStatus:false,
            firstUser:false,
            responderMsgTitle:'clickTitle',
            translateMove:null,
            isHasTransition:false,
            resizeInfo:{
                width:0,
                height:0,
            },
        });
        this.isClick = false;
        this.userSort = {};
        this.userArry = [];
        this.isRestart = false;
        this.timesRun = 3;
        this.isSetDefaultPosition = false;
        this.teacherTimeOut = null;
        this.isHasTransition = false;
        this.msglistData = null;
        this.intervals = undefined;
        this.timeOutIntervals = undefined;
        this.getUserPublishState = null;
        this.temporaryStyle = {
            percentLeft:null,
            percentTop:null
        };
    }

    handlerRoomUserpropertyChanged(recvEventData){
        let user =ServiceRoom.getTkRoom().getMySelf();
        if(user.id === recvEventData.user.id && recvEventData.message.publishstate!==undefined){
            this.getUserPublishState = recvEventData.message.publishstate;
        }
    };

    handlerMsglistQiangDaQi(recvEventData){
        const that = this;
        for(let message of recvEventData.message.qiangDaQiArr){
            if(!TkConstant.hasRole.roleStudent){
                that._teacherRecevedServiceQiangDaQiData(message);
            }else{
                if(ServiceRoom.getTkRoom().getMySelf().publishstate>0){
                    that._studentRecevedServiceQiangDaQiData(message);
                }
            }
        }
    };

    handlerMsglistQiangDaZhe(recvEventData){
        const that = this;
        for(let message of recvEventData.message.QiangDaZheArr){
            if(!TkConstant.hasRole.roleStudent){
                that._teacherRecevedServiceQiangDaZheData(message);
            }else{
                that._studentRecevedServiceQiangDaZheData(message);
            }
        }
    };

    /*抢答题message-list*/
    _teacherRecevedServiceQiangDaQiData(recvEventData){
        const that = this;
        this.isSetDefaultPosition = true;
        let serviceTimeData = TkGlobal.serviceTime / 1000 - recvEventData.ts;
        if(recvEventData.data.isShow) {
            clearTimeout(that.teacherTimeOut);
            that.setState({
                responderIsShow: true,
                answerText:'begin'
            });
            if(recvEventData.data.begin) {
                this.setState({beginIsStatus:recvEventData.data.begin});
                this.isRestart = true;
                this.responderBeginTsValue = recvEventData.ts;
                if(serviceTimeData>=8){
                    clearTimeout(that.teacherTimeOut);
                    if(!that.state.firstUser ) {
                        that.setState({
                            answerText: 'restart',
                            responderMsgTitle: 'noContest',
                            beginIsStatus:false
                        });
                    } else {
                        that.setState({
                            answerText: that.state.answerText,
                            responderMsgTitle:that.state.responderMsgTitle,
                            beginIsStatus:false
                        })
                    }
                }else{
                    that.setState({
                        beginIsStatus: recvEventData.data.begin,
                        responderMsgTitle: 'inAnswerTitle',
                        answerText: 'inAnswerBtn',
                    });
                    that.teacherTimeOut = setTimeout(function() {
                        if(!that.state.firstUser ) {
                            that.setState({
                                answerText: 'restart',
                                responderMsgTitle: 'noContest',
                                beginIsStatus:false
                            })
                        } else {
                            that.setState({
                                answerText: that.state.answerText,
                                responderMsgTitle:that.state.responderMsgTitle,
                                beginIsStatus:false
                            })
                        }
                    }, 8000);
                }
            }
        }
    };

    /*老师接收到抢答者*/
    _teacherRecevedServiceQiangDaZheData(recvEventData){
        const that = this;
        if(recvEventData.data.isClick){
            clearTimeout(that.teacherTimeOut);
            that.userSort[recvEventData.fromID]={};
            that.userSort[recvEventData.fromID][recvEventData.seq]=recvEventData.data.userAdmin;
            that.userArry = [];
            for(let item in that.userSort){
                for(let i in that.userSort[item]){
                    that.userArry.push(i);
                    that.userArry= that.userArry.sort()
                    if(that.userSort[item][that.userArry[0]]!==undefined){
                        that.setState({
                            answerText:'somebodyTeacher',
                            responderMsgTitle:that.userSort[item][that.userArry[0]],
                        });
                    }
                }
            }

            this.isRestart = true;
            that.setState({
                firstUser:true,
                beginIsStatus:false
            });
        }
    };

    /*学生收到抢答器*/
    _studentRecevedServiceQiangDaQiData(pubmsgData){
        const that = this;
        let {id, draggableData} = that.props;
        let serviceTimeData = TkGlobal.serviceTime / 1000 - pubmsgData.ts;
        that.setState({
            responderMsgTitle: 'inAnswerStudent',
            answerText: 'inAnswerStudent',
            beginIsStatus: pubmsgData.data.begin,
        });
        if(pubmsgData.data.begin){
            if(serviceTimeData>=8){
                let percentLeft,percentTop;
                if (that.temporaryStyle.percentLeft === null) {
                    percentLeft = 0.5;
                    percentTop = 0;
                }else {
                    percentLeft = that.temporaryStyle.percentLeft;
                    percentTop = that.temporaryStyle.percentTop;
                }
                if (draggableData.changePosition && typeof draggableData.changePosition === "function") {
                    let isSendSignalling = false;
                    draggableData.changePosition(id, {percentLeft,percentTop,isDrag:true}, isSendSignalling);
                }
                that.setState({
                    beginIsStatus: false,
                    responderMsgTitle: 'noContest',
                    answerText: 'noContest',
                    studentIsGifImg:false
                });
            }else{
                that.intervals = setInterval(function () {
                    that.timesRun -= 1;
                    if (that.timesRun === 0) {
                        let percentLeft = 0.2;
                        let percentTop = 0.2;
                        if (draggableData.changePosition && typeof draggableData.changePosition === "function") {
                            let isSendSignalling = false;
                            draggableData.changePosition(id, {percentLeft,percentTop,isDrag:true}, isSendSignalling);
                        }
                    }
                    if (that.timesRun === 1) {
                        let percentLeft = 0.4;
                        let percentTop = 0.6;
                        if (draggableData.changePosition && typeof draggableData.changePosition === "function") {
                            let isSendSignalling = false;
                            draggableData.changePosition(id, {percentLeft,percentTop,isDrag:true}, isSendSignalling);
                        }
                    }
                    if (that.timesRun === 2) {
                        let percentLeft = 0.7;
                        let percentTop = 0.2;
                        if (draggableData.changePosition && typeof draggableData.changePosition === "function") {
                            let isSendSignalling = false;
                            draggableData.changePosition(id, {percentLeft,percentTop,isDrag:true}, isSendSignalling);
                        }
                    }
                    if (that.timesRun <= 0) {
                        clearInterval(that.intervals);
                        that.setState({
                            beginIsStatus: false,
                            studentIsGifImg:true,
                            responderMsgTitle: 'clickTitle',
                            answerText:'begin'
                        });
                        if (that.isClick === false) {
                            that.timeOutIntervals = setTimeout(function () {
                                let percentLeft,percentTop;
                                if (that.temporaryStyle.percentLeft === null) {
                                    percentLeft = 0.5;
                                    percentTop = 0;
                                }else {
                                    percentLeft = that.temporaryStyle.percentLeft;
                                    percentTop = that.temporaryStyle.percentTop;
                                }
                                that.isHasTransition = true;
                                if (draggableData.changePosition && typeof draggableData.changePosition === "function") {
                                    let isSendSignalling = false;
                                    draggableData.changePosition(id, {percentLeft,percentTop,isDrag:true}, isSendSignalling);
                                }
                                that.setState({
                                    isHasTransition: that.isHasTransition,
                                    responderMsgTitle: 'noContest',
                                    beginIsStatus: false,
                                    studentIsGifImg:false,
                                    answerText: 'noContest',
                                });
                            }, 4500)
                        }
                    }
                }, 1000);
            }
            that.setState({responderIsShow: true})
        }
    };

    /*学生收到抢答者*/
    _studentRecevedServiceQiangDaZheData(pubmsgData){
        const that = this;
        let {id, draggableData} = that.props;
        let userArry = [];
        if (pubmsgData.data.isClick) {
            that.userSort[pubmsgData.fromID] = {};
            that.userSort[pubmsgData.fromID][pubmsgData.seq] = pubmsgData.data.userAdmin;
            for (let item in that.userSort) {
                for (let i in that.userSort[item]) {
                    userArry.push(i);
                    that.userArry = userArry.sort()
                    if (that.userSort[item][that.userArry[0]] !== undefined) {
                        if(item === ServiceRoom.getTkRoom().getMySelf().id){
                            that.setState({
                                firstUser:true,
                                responderMsgTitle: 'my',
                                answerText: 'other',
                            });
                        }else{
                            that.setState({
                                firstUser:true,
                                responderMsgTitle: that.userSort[item][that.userArry[0]],
                                answerText:'other'
                            });
                        }
                    }
                }
            }
            clearInterval(that.intervals);
            clearTimeout(that.timeOutIntervals);
            let percentLeft,percentTop;
            if (that.temporaryStyle.percentLeft === null) {
                percentLeft = 0.5;
                percentTop = 0;
            }else {
                percentLeft = that.temporaryStyle.percentLeft;
                percentTop = that.temporaryStyle.percentTop;
            }
            if (draggableData.changePosition && typeof draggableData.changePosition === "function") {
                let isSendSignalling = false;
                draggableData.changePosition(id, {percentLeft,percentTop,isDrag:true}, isSendSignalling);
            }
            that.setState({
                responderMsgTitle: that.state.responderMsgTitle,
            });
            this.isClick = pubmsgData.data.isClick;
        }
    };

    /*开始抢答*/
    beginOrRestartResponder(){
        if(TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant ){
            if(!this.state.beginIsStatus && !this.isRestart){
                let data = {
                    isShow: this.state.responderIsShow,
                    begin: true,
                    userAdmin:''
                };
                let isDelMsg = false;
                ServiceSignalling.sendSignallingQiangDaQi(isDelMsg, data);
            }else if(!this.state.beginIsStatus && this.isRestart ){
                this.restartResponder();
            }
        }else if(TkConstant.hasRole.roleStudent){
            this.studentResponder();
        }
    };

    /*学生点击抢答*/
    studentResponder() {
        let users = ServiceRoom.getTkRoom().getMySelf();
        if (users.publishstate > 0 && TkConstant.hasRole.roleStudent && this.state.answerText === 'begin' && !this.isClick ) {
            this.isClick = true;
            let data = {
                userAdmin: users.nickname,
                isClick: true
            };
            let isDelMsg = false;
            ServiceSignalling.sendSignallingQiangDaZhe(isDelMsg, data);
        }
    };

    /*关闭抢答器*/
    closeResponder(){
        if(TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant) {
            const that = this;
            let data = {};
            let isDelMsg = true;
            ServiceSignalling.sendSignallingQiangDaQi(isDelMsg, data);

            //关闭抢答器，启用工具箱按钮
            eventObjectDefine.CoreController.dispatchEvent({
                type:'colse-holdAll-item' ,
                message: {
                    type: 'responder'
                }
            });
        }
    };

    /*重新开始抢答器*/
    restartResponder(){
        let data = {
            isShow: true,
            begin: false,
            userAdmin: ''
        };
        let isDelMsg = true;
        ServiceSignalling.sendSignallingQiangDaQi(isDelMsg, data);
        isDelMsg = false;
        ServiceSignalling.sendSignallingQiangDaQi(isDelMsg, data);
        let {id,responderDrag,draggableData} = this.props;
        if (draggableData.changePosition && typeof draggableData.changePosition === "function") {
            let isSendSignalling = true;
            draggableData.changePosition(id, responderDrag, isSendSignalling);
        }
    };

    render(){
        let that = this;
        let {id, responderDrag, draggableData} = that.props;
        let {answerText , responderMsgTitle , firstUser , beginIsStatus , studentIsGifImg} = that.state;
        let percentLeft = responderDrag.percentLeft;
        let percentTop = responderDrag.percentTop;
        if (percentLeft != 0 && !percentLeft) {
            percentLeft = 0.5;
        }
        if (percentTop != 0 && !percentTop) {
            percentTop = 0.5;
        }
        let responderDragStyle = {
            display:this.state.responderIsShow?"block":"none",
        };
        let DraggableData = Object.customAssign({
            id:id,
            percentPosition:{percentLeft, percentTop},
        },draggableData);
        return (
			<ReactDrag {...DraggableData}>
                <div id={id} style={responderDragStyle} className={'responder-wrap'+(TkConstant.hasRole.roleStudent?' student':' teacher')}>
                    <div className={"responder-lining"}>
                        <div  className={"responder-circle touch-select-select defalut-bg" + (TkConstant.hasRole.rolePatrol?' disabled':'') + (beginIsStatus || (TkConstant.hasRole.roleStudent && studentIsGifImg)?' gif-img':'')+(firstUser?" somebody-click":" nobody-click")} >
                            <div className={"responder-msg-title"}> 
                                {TkGlobal.language.languageData.responder[responderMsgTitle] && TkGlobal.language.languageData.responder[responderMsgTitle].text!==undefined?TkGlobal.language.languageData.responder[responderMsgTitle].text:responderMsgTitle}
                            </div>
                            <div 
                                className={"responder-begin-circle"+(beginIsStatus?' disabled':'')} 
                                onClick={this.beginOrRestartResponder.bind(this)}>
                                <p>{TkGlobal.language.languageData.responder[answerText]['text']}</p>
                            </div>
                            {TkConstant.hasRole.roleStudent
                                ?undefined:
                                <div className="responder-close-img" onClick={this.closeResponder.bind(this)} ></div>
                            }
                        </div>
                    </div>
                </div>
			</ReactDrag>
        )
    }
}

export default ResponderTeachingToolSmart;