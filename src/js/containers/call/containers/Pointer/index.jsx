/**
 * 教鞭组件
 * @module PointerReminderContentBar
 */
'use strict';
import React from 'react';
import ServiceRoom from 'ServiceRoom';
import TkConstant from 'TkConstant' ;
import ServiceSignalling from 'ServiceSignalling';
import eventObjectDefine from 'eventObjectDefine';
import CoreController from 'CoreController';
import TkGlobal from 'TkGlobal';


class PointerReminderContentBar extends React.Component{
    constructor (props){
        super(props);
        this.state = {
            show: false,
        };
    };
    componentDidMount(){
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomUserpropertyChanged, this.handlerRoomUserpropertyChanged.bind(this), this.listernerBackupid); //room-userproperty-changed事件-收到参与者属性改变后执行更新
    };
    componentWillUnmount(){

    };

    /*处理room-userproperty-changed事件*/
    handlerRoomUserpropertyChanged(roomUserpropertyChangedEventData) {
        const that = this;
        let mySelfId = ServiceRoom.getTkRoom().getMySelf().id;
        let messageData = roomUserpropertyChangedEventData.message;
        //判断messageData里是否有 pointerstate字段
        if(roomUserpropertyChangedEventData.userid === mySelfId && messageData.hasOwnProperty('pointerstate')){
            that.setState({show:messageData.pointerstate});
        }
    };
    requestToCancelPointer(){
        let mySelfId = ServiceRoom.getTkRoom().getMySelf().id;
        let data = {
            pointerstate: false
        };
        ServiceSignalling.setParticipantPropertyToAll(mySelfId,data);
    };

    render(){
        const that = this;
        let show = ServiceRoom.getTkRoom().getMySelf().pointerstate;
        return(<div className={"pointer-modal"} style={{display:show?"block":"none"}}>
            <button onClick={that.requestToCancelPointer.bind(that)} className={"request-close-pointer"}> </button>
        </div>);
    }
}

export  default PointerReminderContentBar;