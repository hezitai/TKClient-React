/**
 * 教学工具箱 Smart组件
 * @module timerTeachingToolComponent
 * @description   倒计时组件
 * @author liujianhang
 * @date 2017/09/20
 */
'use strict';
import "./static/css/index.css";
import "./static/css/index_black.css";
import React from 'react';
import ReactDOM from 'react-dom';
import TkGlobal from 'TkGlobal';
import TkConstant from 'TkConstant';
import TkUtils from 'TkUtils';
import eventObjectDefine from 'eventObjectDefine';
import CoreController from 'CoreController';
import ServiceRoom from 'ServiceRoom';
import ServiceSignalling from 'ServiceSignalling';
import ReactDrag from 'reactDrag';

class TimerTeachingToolSmart extends React.Component {
    constructor(props) {
        super(props);
        let {id} = this.props;
        this.state = {
            timeDescArray: [0, 5, 0, 0], //初始时间数组
            triangleStyle: 'visible', //调整时间的三角
            againBtnStyle: false, //重新开始按钮样式
            startBtnStyle: true, //开始按钮样式
            numContentBorder: false, //字体
            timerIsShow: false, //控制计时器显隐
            restarting: false,//是否点击重新开始
            startAndStop: false,//开始还是暂停
            startAndStopImg: false,  //学生端的暂停时图片是否展示
            againUnClickableStyle:true,//不可点击重新开始按钮样式
            stopUnClickableStyle:false,//暂停不可点击按钮样式
            resizeInfo:{
                width:0,
                height:0,
            },
            playBackServerTime:0
        };
        this.servicerTimes = 0;
        this.isSetDefaultPosition = false;
        this.stop = null;
        this.startTime = 0;
        this.endTime = 0;
        this.timerBeginTsValue = 0;
        this.speedOrBack = false;
        this.initTimerValue =[];
        this.listernerBackupid = new Date().getTime() + '_' + Math.random();
    };
    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        const that = this;
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDisconnected,that.handlerRoomDisconnected.bind(that) , that.listernerBackupid); //Disconnected事件：失去连接事件
        eventObjectDefine.CoreController.addEventListener("receive-msglist-timer", that.handlerMsglistTimerShow.bind(that), that.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener("playOrPausePlaybackTimer", that.handlerPlayOrPausePlaybackTimer.bind(that), that.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPubmsg, that.handlerRoomPubmsg.bind(that), that.listernerBackupid); //roomPubmsg事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDelmsg, that.handlerRoomDelmsg.bind(that), that.listernerBackupid); //roomDelmsg事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPlaybackClearAllFromPlaybackController,that.handlerRoomPlaybackClearAll.bind(that) , that.listernerBackupid); //roomPlaybackClearAll 事件：回放清除所有信令
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomPlaybackPlaybackEnd , that.handlerRoomPlaybackPlaybackEnd.bind(that) , that.listernerBackupid );
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomPlaybackPlaybackUpdatetime , that.handlerRoomPlaybackPlaybackUpdatetime.bind(that) , that.listernerBackupid );
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomPlaybackDuration , that.handlerRoomPlaybackDuration.bind(that) , that.listernerBackupid );
    };
    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        let that = this ;
        eventObjectDefine.CoreController.removeBackupListerner(that.listernerBackupid);
    };
    /*在组件完成更新后立即调用,在初始化时不会被调用*/
    componentDidUpdate(prevProps , prevState){
        if (prevState.timerIsShow !== this.state.timerIsShow && this.state.timerIsShow) {
            if (this.isSetDefaultPosition) {
                this.isSetDefaultPosition = false;
                this.setDefaultPosition();
            }
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

    /*房间失去连接*/
    handlerRoomDisconnected(){
        clearInterval(this.stop);
        this.setState({
            timerIsShow:false,
            startAndStopImg: false,
            timeDescArray: [0, 5, 0, 0],
            stopUnClickableStyle:false
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

    handlerRoomPlaybackPlaybackEnd(){
        const that = this;
        clearInterval(that.stop);
    }

    handlerPlayOrPausePlaybackTimer(recvEventData){
        if(!recvEventData.play){
            clearInterval(this.stop);
        }else{
            clearInterval(this.stop);
            this.stop = setInterval(this.timeReduce.bind(this), 1000);
        }
    }
    handlerRoomPlaybackDuration(recvEventData){
        const that = this ;
        let {startTime , endTime} = recvEventData.message ;
        that.startTime = startTime ;
        that.endTime = endTime ;
    }

    handlerRoomPlaybackPlaybackUpdatetime(recvEventData){
        let  playBackServerTime = Number((recvEventData.message.current).toFixed(0));
        let  prevStatePlayBackServerTime = Number((this.state.playBackServerTime).toFixed(0));
        let  nowPlayBackServerTime = Number((playBackServerTime).toFixed(0));
        let  value = (prevStatePlayBackServerTime-nowPlayBackServerTime)/1000
        if(prevStatePlayBackServerTime && nowPlayBackServerTime && Math.abs(value)>2 && this.timerBeginTsValue){
            let currentTime = this._timeDifferenceToFormat(this.startTime,nowPlayBackServerTime);
            let timerBeginTime = this._timeDifferenceToFormat(this.startTime,this.timerBeginTsValue);
            let [...initTimerValueArry] = this.initTimerValue;
            if(currentTime<=timerBeginTime){
                clearInterval(this.stop);
                this.timerBeginTsValue = 0;
                // this.stop = setInterval(this.timeReduce.bind(this), 1000);
                // this.state.timeDescArray = this.initTimerValue;
                // this.setState({timeDescArray:this.state.timeDescArray})
            }else {
                let allTimeValue = initTimerValueArry[0]*600 + initTimerValueArry[1]*60+initTimerValueArry[2]*10+initTimerValueArry[3]*1;
                let timesValue = allTimeValue- currentTime + timerBeginTime;
                if(timesValue<0){
                    clearInterval(this.stop);
                    this.setState({
                        timeDescArray: [0,0,0,0],
                    });
                    this.playAudioToAudiooutput('ring_audio' , true)
                }else{
                    clearInterval(this.stop);
                    this.stop = setInterval(()=>{
                        this.timeReduce()
                    }, 1000);
                    let m = (parseInt(timesValue/ 60) < 10 ? '0' + parseInt(timesValue / 60) : parseInt(timesValue / 60));
                    let n = (parseInt(timesValue % 60) < 10 ? '0' + parseInt(timesValue % 60) : parseInt(timesValue % 60));
                    let timeDescArray = [parseInt(m / 10),parseInt(m % 10),parseInt(n / 10), parseInt(n % 10)];
                    this.setState({
                        timeDescArray: timeDescArray,
                    });
                    if(this.state.timeDescArray[0]==0&&this.state.timeDescArray[1]==0&&this.state.timeDescArray[2]==0&&this.state.timeDescArray[3]==0){
                        this.playAudioToAudiooutput('ring_audio' , true)
                    }
                }
                
            }

        }
        this.setState({playBackServerTime:playBackServerTime})
    }

    /*格式化时间差*/
    _timeDifferenceToFormat(startTime , endTime){
        if(endTime === 0){
            return
        }
        let clock = TkUtils.getTimeDifferenceToFormat(startTime , endTime) ;
        let timeStr = undefined ;
        if(clock){
            let {hh , mm , ss} = clock ;
            timeStr = Number(ss) + mm*60 + hh*360;
        }
        return timeStr ;
    }

    handlerRoomPubmsg(recvEventData){
        const that = this;
        let pubmsgData = recvEventData.message;

        switch(pubmsgData.name) {
            case "timer":
                if(!TkConstant.hasRole.roleStudent){
                    that.handleTimerShow(pubmsgData);
                }else{
                    that.handelTmerShowStudent(pubmsgData);
                }
                break;
            case "UpdateTime":
                this.servicerTimes = pubmsgData.ts
                break;
        }
    }
    handlerRoomDelmsg(recvEventData){
        const that = this;
        let pubmsgData = recvEventData.message;

        switch(pubmsgData.name) {
            case "ClassBegin":
                that.setState({timerIsShow:false});
                break;
            case "timer":
                that.setState({
                    timerIsShow:false,
                    startAndStopImg: false,
                    timeDescArray: [0, 5, 0, 0],
                    stopUnClickableStyle:false
                });
                clearInterval(that.stop);
                that.timerBeginTsValue = 0;
                break;
        }
    };
    handlerMsglistTimerShow(recvEventData) {
        const that = this;
        let message = recvEventData.message.timerShowArr[0];
        if(!TkConstant.hasRole.roleStudent) {
            that.handleTimerShow(message);
        }else{
            that.handelTmerShowStudent(message);
        }

    }
    handelTmerShowStudent(pubmsgData){
        if(pubmsgData.data.isShow){
            return false;
        }
        let that = this;
        let serviceTimeData = TkGlobal.serviceTime / 1000 - pubmsgData.ts;
        that.setState({
            timeDescArray: pubmsgData.data.sutdentTimerArry,
            timerIsShow: true,
            triangleStyle:"hidden",
        });
        let timeArrAdd = that.state.timeDescArray[0] * 600 + that.state.timeDescArray[1] * 60 + that.state.timeDescArray[2] * 10 + that.state.timeDescArray[3] * 1;
        let timesValue = timeArrAdd - serviceTimeData;
        if(pubmsgData.data.isStatus) {
            clearInterval(that.stop);
            that.setState({
                startAndStopImg: false,
                numContentBorder: false
            })
            that.stop = setInterval(that.timeReduce.bind(that), 1000);
            if(timesValue > 0) {
                if(timesValue>timeArrAdd){
                    timesValue=timeArrAdd;
                }
                let m = (parseInt(timesValue / 60) < 10 ? '0' + parseInt(timesValue / 60) : parseInt(timesValue / 60));
                let n = (parseInt(timesValue % 60) < 10 ? '0' + parseInt(timesValue % 60) : parseInt(timesValue % 60));
                let timeDescArray = [parseInt(m / 10),parseInt(m % 10),parseInt(n / 10),parseInt(n % 10)]
                that.setState({
                    timeDescArray: timeDescArray
                });
            }else{
                clearInterval(that.stop);
                that.setState({
                    timeDescArray: [0,0,0,0],
                    numContentBorder:true,
                });
            }
        } else {

            that.setState({
                timeDescArray: pubmsgData.data.sutdentTimerArry ,
                startAndStopImg: true,
                numContentBorder:false
            });
            clearInterval(that.stop);
        }
    }
    handleTimerShow(pubmsgData) {
        let that = this;
        let serviceTimeData = undefined;
        let timesValue = undefined;
        that.setState({timeDescArray:pubmsgData.data.sutdentTimerArry});
        this.isSetDefaultPosition = true;
        let timeArrAdd = pubmsgData.data.sutdentTimerArry[0] * 600 + pubmsgData.data.sutdentTimerArry[1] * 60 + pubmsgData.data.sutdentTimerArry[2] * 10 + pubmsgData.data.sutdentTimerArry[3] * 1;
        if(TkGlobal.playback){
            clearInterval(that.stop);
            timesValue = timeArrAdd ;
        }else{
            serviceTimeData = TkGlobal.serviceTime / 1000 - pubmsgData.ts;
            timesValue = timeArrAdd - serviceTimeData;
        }
            if(pubmsgData.data.isShow) {
                that.setState({
                    timeDescArray:pubmsgData.data.sutdentTimerArry,
                    timerIsShow:true,
                    againUnClickableStyle: true,
                    startBtnStyle: true,
                    startAndStopImg:false,
                    againBtnStyle:false,
                    numContentBorder:false ,
                    triangleStyle:"visible",
                });
            } else {
                if(pubmsgData.data.isStatus) {
                    let [...dataArry] = pubmsgData.data.sutdentTimerArry;
                    that.initTimerValue = dataArry;
                    that.timerBeginTsValue = pubmsgData.ts;
                    clearInterval(that.stop);
                    that.setState({
                        startAndStopImg:true,
                        timerIsShow:true,
                        startBtnStyle:false,
                        numContentBorder:false,
                        againBtnStyle:true,
                        triangleStyle:"hidden",
                        againUnClickableStyle:false,
                    });
                    that.stop = setInterval(()=>{
                        this.timeReduce()
                    }, 1000);
                    if(timesValue > 0) {
                        if(timesValue>timeArrAdd){
                            timesValue=timeArrAdd
                        }
                        let m = (parseInt(timesValue / 60) < 10 ? '0' + parseInt(timesValue / 60) : parseInt(timesValue / 60));
                        let n = (parseInt(timesValue % 60) < 10 ? '0' + parseInt(timesValue % 60) : parseInt(timesValue % 60));
                        let timeArry = [parseInt(m / 10),parseInt(m % 10),parseInt(n / 10),parseInt(n % 10)]
                        that.setState({
                            timeDescArray: timeArry,
                        });
                    }else {
                        clearInterval(that.stop);
                        that.setState({
                            timeDescArray: [0,0,0,0],
                            numContentBorder:true,
                            stopUnClickableStyle:true
                        });
                    }
                } else {
                    if(pubmsgData.data.isRestart) {
                        clearInterval(that.stop);
                        that.setState({
                            timeDescArray: pubmsgData.data.sutdentTimerArry,
                            timerIsShow: true,
                            numContentBorder:false,
                            startAndStopImg:false,
                            startBtnStyle: true,
                            againBtnStyle: false,
                            triangleStyle: "visible",
                            startAndStop: false,
                            againUnClickableStyle: true,
                            stopUnClickableStyle:false
                        });
                    } else {
                        that.setState({
                            timeDescArray: pubmsgData.data.sutdentTimerArry,
                            timerIsShow: true,
                            numContentBorder:false,
                            startAndStopImg: false,
                            startBtnStyle: true,
                            againBtnStyle: true,
                            triangleStyle: "hidden",
                            startAndStop: false,
                            againUnClickableStyle: false
                        });
                        clearInterval(that.stop);
                    }
                }
            }
    };


    handlerRoomPlaybackClearAll(){
        if(!TkGlobal.playback){L.Logger.error('No playback environment, no execution event[roomPlaybackClearAll] handler ') ;return ;};
        const that = this ;
        that.setState({
            timeDescArray: [0, 5, 0, 0],
            triangleStyle: "visible",
            againBtnStyle: false,
            startBtnStyle: true,
            numContentBorder: false,
            timerIsShow: false,
            restarting: false,
            startAndStop: false,
            startAndStopImg: false,
            isShow:false,
            againUnClickableStyle:true,
            stopUnClickableStyle:false
        });
        this.stop = null;
    };

    /*内部方法*/
    _loadTimeDescArray(desc) {
        let beforeArray = [];
        let afterArray = [];
        desc.forEach((value, index) => {
            let a = <div  className="timer-teachTool-num-div" key={index}>
				<div className="timer-teachTool-triangle-top" style={{visibility:this.state.triangleStyle}} onClick={this.AddHandel.bind(this,index)}></div>
				<div className={"timer-teacher-num-content"+(this.state.numContentBorder?' timer-font-style-red':' timer-font-style-default')} >
                    {value}
				</div>
				<div className="timer-teachTool-triangle-down" style={{visibility:this.state.triangleStyle}} onClick={this.ReduceHandel.bind(this,index)}></div>
			</div>;
            if(index > 1) {
                afterArray.push(a);
            } else {
                beforeArray.push(a);
            }

        });
        return {
            afterArray: afterArray,
            beforeArray: beforeArray
        }
    };
    /*手动增加*/
    AddHandel(index, e) {
        if(TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant){
            if(index === 0) {
                e.target.nextSibling.textContent++;
                this.state.timeDescArray[0] = e.target.nextSibling.textContent;
                if(e.target.nextSibling.textContent > 9) {
                    e.target.nextSibling.textContent = 0;
                    this.state.timeDescArray[0] = e.target.nextSibling.textContent;

                }
            }
            if(index === 1) {
                e.target.nextSibling.textContent++;
                this.state.timeDescArray[1] = e.target.nextSibling.textContent;
                if(e.target.nextSibling.textContent > 9) {
                    e.target.nextSibling.textContent = 0;
                    this.state.timeDescArray[1] = e.target.nextSibling.textContent;
                }
            }
            if(index === 2) {
                e.target.nextSibling.textContent++;
                this.state.timeDescArray[2] = e.target.nextSibling.textContent;
                if(e.target.nextSibling.textContent > 5) {
                    e.target.nextSibling.textContent = 0;
                    this.state.timeDescArray[2] = e.target.nextSibling.textContent;
                }
            }
            if(index === 3) {
                e.target.nextSibling.textContent++;
                this.state.timeDescArray[3] = e.target.nextSibling.textContent;
                if(e.target.nextSibling.textContent > 9) {
                    e.target.nextSibling.textContent = 0;
                    this.state.timeDescArray[3] = e.target.nextSibling.textContent = 0;
                }
            }
            this.setState({
                timeDescArray: this.state.timeDescArray
            })
        }
    };
    /*手动减少*/
    ReduceHandel(index, e) {
        if(TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant){
            if(index === 0) {
                e.target.previousSibling.textContent--;
                this.state.timeDescArray[0] = e.target.previousSibling.textContent;
                if(e.target.previousSibling.textContent < 0) {
                    e.target.previousSibling.textContent = 9;
                    this.state.timeDescArray[0] = e.target.previousSibling.textContent;
                }
            }
            if(index === 1) {
                e.target.previousSibling.textContent--;
                this.state.timeDescArray[1] = e.target.previousSibling.textContent;
                if(e.target.previousSibling.textContent < 0) {
                    e.target.previousSibling.textContent = 9;
                    this.state.timeDescArray[1] = e.target.previousSibling.textContent;
                }
            }
            if(index === 2) {
                e.target.previousSibling.textContent--;
                this.state.timeDescArray[2] = e.target.previousSibling.textContent;
                if(e.target.previousSibling.textContent < 0) {
                    e.target.previousSibling.textContent = 5;
                    this.state.timeDescArray[2] = e.target.previousSibling.textContent;
                }
            }
            if(index === 3) {
                e.target.previousSibling.textContent--;
                this.state.timeDescArray[3] = e.target.previousSibling.textContent;
                if(e.target.previousSibling.textContent < 0) {
                    e.target.previousSibling.textContent = 9;
                    this.state.timeDescArray[3] = e.target.previousSibling.textContent;
                }
            }
            this.setState({
                timeDescArray: this.state.timeDescArray
            })
        }
    };
    /*倒计时*/
    timeReduce() {
        let that = this;
        that.state.timeDescArray[3]--;

        if(that.state.timeDescArray[3] < 0) {
            that.state.timeDescArray[3] = 9;
            that.state.timeDescArray[2]--;
        }
        if(that.state.timeDescArray[2] < 0) {
            that.state.timeDescArray[2] = 5;
            that.state.timeDescArray[1]--
        }
        if(that.state.timeDescArray[1] < 0) {
            that.state.timeDescArray[1] = 9;
            that.state.timeDescArray[0]--
        }if(that.state.timeDescArray[0]<0){
            that.state.timeDescArray = [0, 0, 0, 0];
            that.state.numContentBorder = 'red';
            clearInterval(that.stop);
            // that.playAudioToAudiooutput('ring_audio' , true);
            that.setState({stopUnClickableStyle:true})
        }
        if(that.state.timeDescArray[0] == 0 && that.state.timeDescArray[1] == 0 && that.state.timeDescArray[2] == 0 && that.state.timeDescArray[3] == 0) {
            that.state.timeDescArray = [0, 0, 0, 0];
            
            that.playAudioToAudiooutput('ring_audio' , true)
            that.state.numContentBorder = 'red';
            clearInterval(that.stop);
            that.setState({stopUnClickableStyle:true})
        }

        that.setState({
            timeDescArray: that.state.timeDescArray,
            numContentBorder: that.state.numContentBorder
        })

    };
    /*开始*/
    startBtnHandel(e) {
        if(TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant){
            if(this.state.stopUnClickableStyle){
                return
            }
            clearInterval(this.stop);
            let data = {
                isStatus:true, //是否开始，true开始， false 暂停
                sutdentTimerArry:this.state.timeDescArray, //当前时间的数组
                isShow:false, //是否显示计时器组件
                isRestart:false //是否重新开始
            };
            ServiceSignalling.sendSignallingTimerToStudent(data);
        }
    };
    /*暂停*/
    stopBtnHandel(){
        if(TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant){
            if(this.state.stopUnClickableStyle){
                return
            }
            clearInterval(this.stop);
            let data = {
                isStatus:false,
                sutdentTimerArry:this.state.timeDescArray,
                isShow:false,
                isRestart:false
            };
            ServiceSignalling.sendSignallingTimerToStudent(data);
        }
    };
    /*重新开始*/
    againBtnHandel() {
        if(TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant){
            clearInterval(this.stop);
            let data = {
                isStatus: false,
                sutdentTimerArry: [0,5,0,0],
                isShow:false,
                isRestart:true
            };
            ServiceSignalling.sendSignallingTimerToStudent(data);
        }
    };

    /*关闭*/
    timerCloseHandel() {
        if(TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant){
            clearInterval(this.stop);
            let data = {};
            let isDelMsg = true;
            ServiceSignalling.sendSignallingTimerToStudent(data, isDelMsg);
        }
    };
    /*播放音乐*/
    playAudioToAudiooutput(audioId = 'ring_audio', play = true){
        if(TK.SDKTYPE === 'mobile'){ //移动端
            let audioElement = document.getElementById('ring_audio');
            L.Utils.mediaPlay(audioElement);
        }else{
            if(TK.isTkNative && TK.subscribe_from_native){ //客户端
                let audioUrl = TkGlobal.projectPublishDirAddress + 'music/timer_default.wav' ;
                let action = play ? 'play' : 'destroy' ;
                let  options = {
                    localMediaFile:'timer_default.wav'
                } ;
                ServiceRoom.getNativeInterface().clientAudioMediaPlayer(audioUrl , action , options ) ;
            }else{// pc
                let $audio = $("#"+audioId) ;
                if($audio && $audio.length>0){
                    if(play){
                        L.Utils.mediaPlay($audio[0]);
                    }else{
                        L.Utils.mediaPause($audio[0]);
                    }
                }
            }
        }
    };
    render() {
        let that = this;
        let {timeDescArray,resizeInfo} = this.state;
        let {afterArray, beforeArray} = this._loadTimeDescArray(timeDescArray);

        let {id, draggableData, timerDrag} = that.props;
        let percentLeft = timerDrag.percentLeft;
        let percentTop = timerDrag.percentTop;
        if (percentLeft != 0 && !percentLeft) {
            percentLeft = 0.5;
        }
        if (percentTop != 0 && !percentTop) {
            percentTop = 0.5;
        }
        let DraggableData = Object.customAssign({
            id:id,
            size:resizeInfo,
            percentPosition:{percentLeft, percentTop},
        },draggableData);
        return (
			<ReactDrag {...DraggableData}>
                <div id={id} className={'timer-div'+(TkConstant.hasRole.roleStudent?' student t-student':' teacher')} style={{display:this.state.timerIsShow?'block':'none'}}>
				    <div className={"timer-teachTool-wrap touch-select-select "+ (TkConstant.hasRole.rolePatrol?' disabled':'') +(TkConstant.hasRole.roleStudent?'timer-sutdentTool-wraps':'')}>

                        <div className="timer-teachTool-header">
                            <span>{TkGlobal.language.languageData.timers.timerSetInterval.text}</span>
                            {TkConstant.hasRole.roleStudent
                                ? undefined
                                :<div className="timer-teacher-close-btn" onClick={this.timerCloseHandel.bind(this)}></div>
                            }
                        </div>

                        <div className="timer-teacher-content">
                            <div className = "timer-teacher-num" >
                                {beforeArray}
                                <div className="timer-teachTool-colon">:</div>
                                {afterArray}
                            </div>
                            <div className = "timer-teacher-btn" >
                                {/*  学生暂停按钮 */}
                                {TkConstant.hasRole.roleStudent
                                    ?<div 
                                        className="student-teachTool-stopBtn"  
                                        style={{display:this.state.startAndStopImg?'block':'none'}} 
                                        title={TkGlobal.language.languageData.timers.timerStop.text}>
                                      </div>
                                    : undefined
                                }
                                {/*  老师端按钮 */}
                                {!TkConstant.hasRole.roleStudent
                                    ?<div>
                                       { /* 开始计时*/ }
                                        <div 
                                            className="timer-teachTool-startNowBtn" 
                                            ref="timerStartBtn" 
                                            style={{display:this.state.startBtnStyle && (this.state.triangleStyle === 'visible')?'block':'none'}} 
                                            onClick={this.startBtnHandel.bind(this)} 
                                            title={TkGlobal.language.languageData.timers.startNowBtn.text}>{TkGlobal.language.languageData.timers.startNowBtn.text}
                                        </div>
                                        {/* 开始 */}
                                        <div 
                                            className="timer-teachTool-startBtn" 
                                            ref="timerStartBtn" 
                                            style={{display:this.state.startBtnStyle && (this.state.triangleStyle === 'hidden')?'block':'none'}} 
                                            onClick={this.startBtnHandel.bind(this)} 
                                            title={TkGlobal.language.languageData.timers.timerBegin.text}>
                                        </div>

                                        {/* 暂停置灰 */}
                                        <div 
                                            className = "timer-teachTool-stopBtn disabled"
                                            style={{display:!this.state.startBtnStyle && this.state.stopUnClickableStyle && (this.state.triangleStyle === 'hidden')?'block':'none'}} 
                                            title={TkGlobal.language.languageData.timers.timerStop.text}>
                                        </div>

                                        {/* 暂停 */}
                                        <div 
                                            className={(this.state.stopUnClickableStyle?'unclick-stopBtn':'timer-teachTool-stopBtn')}  
                                            style={{display:this.state.startAndStopImg && (this.state.triangleStyle === 'hidden')?'block':'none'}} 
                                            onClick={this.stopBtnHandel.bind(this)} 
                                            title={TkGlobal.language.languageData.timers.timerStop.text}>
                                        </div>
                                        {/* 重新开始 */}
                                        <div 
                                            className="timer-teachTool-againBtn" 
                                            style={{display:this.state.againBtnStyle && (this.state.triangleStyle === 'hidden')?'block':'none'}} 
                                            onClick={this.againBtnHandel.bind(this)} 
                                            title={TkGlobal.language.languageData.timers.again.text}>
                                        </div>
                                    </div>
                                    : undefined
                                }
                            </div>
                        </div>

                        {TK.SDKTYPE === 'mobile'
                            ? <audio id="ring_audio" src={"./music/ring.mp3?ts="+(this.listernerBackupid)} className="audio-play"></audio>
                            :(TK.isTkNative && TK.subscribe_from_native
                                ?undefined
                                :<audio id="ring_audio" src="./music/timer_default.wav" className="audio-play" />)}
				    </div>
                </div>
			</ReactDrag>
        )
    };
}
export default TimerTeachingToolSmart;