/**
 * 头部容器-右侧头部Smart模块
 * @module RightHeaderSmart
 * @description   承载头部的左侧所有组件
 * @date 2018/11/20
 */


'use strict';
import React from 'react';
import TkGlobal from 'TkGlobal';
import TkConstant from 'TkConstant';
import ServiceRoom from "ServiceRoom";
import eventObjectDefine from 'eventObjectDefine';
import ClassbeginAndRaiseSmart from "../classBeginAndRaise";
import ClockTimeSmart from "../timer";
import HeaderIConButton from "../headerIconButton";
import ClassBroFunctions from "ClassBroFunctions";
// import animate from 'animate.css';

class RightHeaderSmart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            notClockTimeClass: '',
            dialogOnoff: false, 
            time: 10, 
            showTime:false,
            audioliu:'',
            time2:10,
        };
        this.listernerBackupid = new Date().getTime() + '_' + Math.random();
        this.mouseMoveEvent = this.mouseMoveEvent.bind(this);
        this.mouseOutEvent = this.mouseOutEvent.bind(this);
    };
    
    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        const that = this;
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPubmsg, that.handlerRoomPubmsg.bind(that), that.listernerBackupid); //room-pubmsg事件：
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDelmsg, that.handlerRoomDelmsg.bind(that), that.listernerBackupid);
    };
    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
    };
    
    // 倒计时器--ByTyr
    timeDialog(){
        this.setState({
            time: 8, 
            dialogOnoff: true,
            showTime:true,
        });
        this.time();
        // this.timeToEndClass();
    }

    handlerRoomPubmsg(recvEventData) {
        const that = this;
        let message = recvEventData.message;
        if(TkConstant.hasRole.roleChairman == true){ // 身份为老师
            if(message.name === "ClassBegin" ){
                that.timeDialog();
                // this.timeToEndClass();
            }
        }
    }
    handlerRoomDelmsg(recvEventData) {
        const that = this;
    }
    classbeginAndRaiseShowButtonCallback(showButton) {
        if (!showButton) {
            if (this.state.notClockTimeClass !== 'only-clock') {
                this.setState({
                    notClockTimeClass: 'only-clock'
                });
            }
        } else {
            if (this.state.notClockTimeClass !== '') {
                this.setState({
                    notClockTimeClass: ''
                });
            }
        }
    };

    time = () => {
        // 清除可能存在的定时器
        clearInterval(this.timer);
        // 创建（重新赋值）定时器
        this.timer = setInterval(()=>{
            // 当前时间回显-1
            this.setState({
                time:this.state.time-1
            },()=>{
                // 判断修改后时间是否小于1达到最小时间
                if(this.state.time <= 0){
                    // 清除定时器
                    this.setState({
                        showTime:false,
                        dialogOnoff: false,
                    });
                    clearInterval(this.timer)
                    // 结束定时器循环
                    return
                }
                // 循环自调用
                this.time()
            })
        },1000)
    }

    mouseMoveEvent(ev) {
        this.setState({
            showTime:false,
            dialogOnoff: true,
        });
    }
    mouseOutEvent(ev) {
        clearInterval(this.timer);
        this.setState({
            showTime:false,
            dialogOnoff: false,
        });
    }

    render() {
        let that = this;
        return (
            <article style={{position:'relative'}} className={"h-right-wrap clear-float add-fr "+that.state.notClockTimeClass} id="header_right" >
                <div className="tipsBehandClassEnd" style={{display:(this.state.dialogOnoff == true)?'block':'none',position:'absolute',top:'0.35rem',left:'-2.86rem',width:'4rem'}}>
                    <img src="https://classbro-oss.oss-cn-hongkong.aliyuncs.com/statice-resource/20190130/55e2a05e334e4d3abecbdf3052c131f6.png" alt=""/>
                    <p style={{display:(this.state.showTime == true)?'block':'none',padding:'0',color:'#ccc',lineHeight: '.001rem'}}>{that.state.time}秒后关闭</p>
                </div>

                <div style={{display:(TkConstant.hasRole.roleStudent == true)?'none':'block',width:'.22rem',height:'.22rem',marginTop:'.02rem'}}>
                    <img onMouseEnter={this.mouseMoveEvent.bind(this)} onMouseOut={this.mouseOutEvent.bind(this)} style={{width:'100%', height:'auto'}} src="https://classbro-oss.oss-cn-hongkong.aliyuncs.com/statice-resource/20190129/8194875f3c224924b1aa82609c37b9ea.png" alt=""/>
                </div>
                < HeaderIConButton/>
                { TkGlobal.playback || (TkConstant.hasRole.rolePatrol && TkConstant.joinRoomInfo.tourCancelBtn) ? undefined :  < ClassbeginAndRaiseSmart classbeginAndRaiseShowButtonCallback={that.classbeginAndRaiseShowButtonCallback.bind(that) } /> }
            </article>
        )
    };
};
export default RightHeaderSmart;