/**
 * 头部容器Smart模块
 * @module HeaderVesselSmart
 * @description   承载头部的所有组件
 * @date 2018/11/19
 */


'use strict';
import React from 'react';
import TkGlobal from "TkGlobal";
import LeftHeaderSmart from "./leftHeaderSmart";
import RightHeaderSmart from "./rightHeaderSmart";
import eventObjectDefine from 'eventObjectDefine';
import "./static/css/index.css";
import "./static/css/index_black.css";


class HeaderVesselSmart extends React.Component{
    constructor(props){
        super(props);
        this.state={
            isShow:true
        }
    };
    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDelmsg , this.handlerRoomDelmsg.bind(this), this.listernerBackupid); //roomDelmsg事件 下课事件 classBegin
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPubmsg ,this.handlerRoomPubmsg.bind(this)  ,  this.listernerBackupid ) ;//room-pubmsg事件：拖拽动作处理
        eventObjectDefine.CoreController.addEventListener('fullScreen',this.handlerFullScreen.bind(this), this.listernerBackupid);   //本地全屏事件
        eventObjectDefine.CoreController.addEventListener( "receive-msglist-FullScreen" , this.handlerReceiveMsglistFullScreen.bind(this), this.listernerBackupid);
    };
    handlerRoomPubmsg(recvEventData){
        let pubmsgData = recvEventData.message ;
        switch (pubmsgData.name) {
            case 'FullScreen':
                this.setState({isShow:false});
                break
        }
    }
    handlerRoomDelmsg(recvEventData){
        let delmsgData = recvEventData.message ;
        switch (delmsgData.name) {
            case 'FullScreen':
                this.setState({isShow:true})
                break
        }
    }
    // 处理本地全屏事件
    handlerFullScreen(msg){
        let {isFullScreen , fullScreenType} = msg.message;
        this.setState({isShow:!isFullScreen})
    }
    handlerReceiveMsglistFullScreen(recvEventData){
        this.setState({isShow:false});
    }
    render(){
        let {styleJson} = this.props ;
        let styles = Object.customAssign({display:this.state.isShow?'block':'none'},styleJson);
        return (
            <header id="header" style={styles}>
                <section className="header-wrap clear-float"  id="header_container" >
                    <LeftHeaderSmart /> {/*左侧组件*/}
                    <RightHeaderSmart />{/*右侧组件*/}
                </section>
            </header>
        )
    };
};
export default  HeaderVesselSmart;

