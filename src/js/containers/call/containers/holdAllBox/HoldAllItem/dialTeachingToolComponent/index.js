/**
 * 教学工具箱 Smart组件
 * @module dialTeachingToolComponent
 * @description   转盘组件
 * @author liujianhang
 * @date 2017/09/20
 */
'use strict';
import "./static/css/index.css";
import "./static/css/index_black.css";
import React from 'react';
import TkGlobal from 'TkGlobal' ;
import TkConstant from 'TkConstant' ;
import eventObjectDefine from 'eventObjectDefine';
import ServiceSignalling from 'ServiceSignalling' ;
import TkUtils from 'TkUtils';
import ReactDrag from 'reactDrag';
import styled from "styled-components";

const ContentButton = styled.button.attrs({
    className: "dial-teachComponent-pointer-button",
    alt : "pointer"
})``

const ContentStudentDiv = styled.div.attrs({
    className: TkConstant.hasRole.rolePatrol ? "patrolDialCloseP" : "dialCloseP",
})`
    display: ${props => props.dialIconClose ? "Block" : "none"}
`

class DialTeachingToolSmart extends React.Component {
    constructor(props){
        super(props);
        this.state={
            dialIsShow:false,
            dialIconClose:false,
            turnTableDeg:'rotate(0)',
            resizeInfo:{
                width:0,
                height:0,
            },
        };
        this.deg = 50;
        this.num = 0;
        this.numdeg = 0;
        this.isClick = false;
        this.msgDeg = false ;
        this.isSetDefaultPosition = false;
        this.listernerBackupid =  new Date().getTime()+'_'+Math.random();

    };
    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        const that = this ;
        eventObjectDefine.CoreController.addEventListener( "receive-msglist-dial" , that.handlerMsglistDialShow.bind(that), that.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPubmsg ,that.handlerRoomPubmsg.bind(that)  ,  that.listernerBackupid ) ;//room-pubmsg事件
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomDelmsg , that.handlerRoomDelmsg.bind(that), that.listernerBackupid); //roomDelmsg事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPlaybackClearAllFromPlaybackController,that.handlerRoomPlaybackClearAll.bind(that) , that.listernerBackupid); //roomPlaybackClearAll 事件：回放清除所有信令
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDisconnected,this.handlerRoomDisconnected.bind(this) , this.listernerBackupid); //Disconnected事件：失去连接事件
    };
    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        let that = this ;
        eventObjectDefine.CoreController.removeBackupListerner(that.listernerBackupid);
    };
    /*在组件完成更新后立即调用,在初始化时不会被调用*/
    componentDidUpdate(prevProps , prevState){
        if (prevState.dialIsShow !== this.state.dialIsShow && this.state.dialIsShow && this.isSetDefaultPosition) {
            this.isSetDefaultPosition = false;
            this.setDefaultPosition();
        }
        this.updateResize();
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
    };
    handlerRoomDisconnected(){
        this._clearDataHanler();
    }
    /*转盘的msglist*/
    handlerMsglistDialShow(recvEventData){
        const that = this;
        this.msgDeg = true;
        for(let message of recvEventData.message.dialShowArr){
            that.handlerDisplayTeachTool(message)
        }
    };

    handlerRoomPubmsg(recvEventData){
        const that = this;
        let pubmsgData = recvEventData.message;
        switch (pubmsgData.name) {
            case "dial":
                that.handlerDisplayTeachTool(pubmsgData);
                break;
        }
    }
    handlerRoomDelmsg(recvEventData){
        const that = this;
        let pubmsgData = recvEventData.message;
        switch (pubmsgData.name) {
            case "dial":
            case "ClassBegin":
                that._clearDataHanler();
                break;
        }
    }

    /*清除数据*/
    _clearDataHanler(){
        this.deg = 50;
        this.num = 0;
        this.numdeg = 0;
        this.isClick = false;
        this.msgDeg = false ;
        this.isSetDefaultPosition = false;
        this.setState({
            dialIsShow: false,
            dialIconClose:false,
            turnTableDeg: 'rotate(0)',
        });
    }

    handlerDisplayTeachTool(recvEventData){
        const that = this;
        that.isSetDefaultPosition = true;
        that.refs.turnTable.style.transform = 'rotate(0)';
        that.refs.turnTable.style.transition = 'transform 0s ease';
       	if(!TkConstant.hasRole.roleStudent){
            that.refs.turnTable.style.transition = 'transform 4s ease';
       	    if (recvEventData.data.isShow) {
	            that.setState({
                    dialIsShow: true,
	                turnTableDeg: that.state.turnTableDeg,
	                dialIconClose: true
	            });
	        }else{
                this.msgDeg = false;
                that.setState({
                    turnTableDeg: recvEventData.data.rotationAngle,
                    dialIconClose: false,
                    dialIsShow: true,
                });
                setTimeout(function () {
                    that.setState({dialIconClose: true});
                    that.isClick = false;
                }, 4000)
            }
	    }else{
            that.refs.turnTable.style.transition = 'transform 4s ease';
       	    if (recvEventData.data.isShow) {
	            that.setState({
                    dialIsShow: true,
	                turnTableDeg: 'rotate(0)',
	                dialIconClose: false
	            });
	        }else{
                that.setState({
                    turnTableDeg: recvEventData.data.rotationAngle,
                    dialIconClose: false,
                    dialIsShow: true,
                });
            }
	    }
    };

    handlerRoomPlaybackClearAll(){
        if(!TkGlobal.playback){L.Logger.error('No playback environment, no execution event[roomPlaybackClearAll] handler ') ;return ;};
        this._clearDataHanler();
    };

    /*开始*/
    clickBeginHandle(){
        if (TkConstant.hasRole.roleStudent || this.isClick === true || TkConstant.hasRole.rolePatrol) {
            return false;
        }
        if(this.msgDeg){
			this.setState({turnTableDeg:'rotate(0)'})
		};
        let index = Math.floor(Math.random() * 5+1); //得到0-7随机数
        this.num = index + this.num; //得到本次位置
        this.numdeg += index * this.deg + Math.floor(Math.random() * 2 + 3) * 360;
        if(this.numdeg.toString().substr(-2)===90 || this.numdeg.toString().substr(-2)===30 || this.numdeg.toString().substr(-2)===10 || this.numdeg.toString().substr(-2)===50 || this.numdeg.toString().substr(-2)===70){
       		this.numdeg=this.numdeg+30
       	};
        this.isClick = true;
        this.msgDeg = false;
        let data={
                rotationAngle:'rotate('+ this.numdeg +'deg)',
                isShow:false,
            };
        ServiceSignalling.sendSignallingDialToStudent(data);
    };

    /*关闭*/
    dialCloseHandle(){
        if(TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant){
	        let data={};
	        let isDelMsg=true;
	        ServiceSignalling.sendSignallingDialToStudent(data , isDelMsg);
        }
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
    render(){
        const {id, dialDrag, draggableData} = this.props;
        let {resizeInfo}=this.state;
        let dialDragStyle = {
            width:TkConstant.hasRole.roleStudent?'3.2rem':'3.4rem',
            height:TkConstant.hasRole.roleStudent?'3.2rem':'3.4rem',
            position:'absolute',
            zIndex:130,
            display:this.state.dialIsShow?'block':'none',
            left:0,
            top:0,
        };
        let percentLeft = dialDrag.percentLeft;
        let percentTop = dialDrag.percentTop;
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
                <div id="dialDrag" style={dialDragStyle}>
                    <div className="dial-teachComponent-bg touch-select-select " style={{display:this.state.dialIsShow}}>
                        <ContentButton onClick={this.clickBeginHandle.bind(this)} />
                        <div 
                            className="dial-teachComponent-turntable" 
                            ref='turnTable' 
                            style={{transition: 'transform 4s ease',transform:this.state.turnTableDeg}}>
                        </div>
                        {TkConstant.hasRole.roleStudent 
                            ? undefined 
                            : <ContentStudentDiv
                                dialIconClose={this.state.dialIconClose}
                                onClick={this.dialCloseHandle.bind(this)} />}
                    </div>
                </div>
            </ReactDrag>
        )
    }
}

export default DialTeachingToolSmart;