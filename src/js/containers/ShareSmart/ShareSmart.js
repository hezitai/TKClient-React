/**
 * 桌面共享的Smart模块
 * @module DesktopShareSmart
 * @description   承载左边的所有组件
 * @author Ks
 * @date 2018/06/27
 */

'use strict';
import React, {Component} from 'react';
import TkConstant from 'TkConstant';
import TkGlobal from 'TkGlobal';
import eventObjectDefine from 'eventObjectDefine';
import ServiceRoom from 'ServiceRoom';
import DestTop from "../call/desktopShare/share";


export default class ShareSmart extends Component{
    constructor(props){
        super(props);
        this.state={
            isPlayFlag:false,
            isMe:false,
            screenStream:undefined,
            areaExchangeFlag:false,
            shareType:1,
        };
        this.areaExchangeStyle={};
        this.listernerBackupid =  new Date().getTime()+'_'+Math.random();
    }

    componentDidMount(){
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomUserscreenstateChanged,this.roomUserscreenstateChanged.bind(this),this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDisconnected,this.handlerRoomDisconnectedScreen.bind(this) , this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDelmsg , this.handlerRoomDelmsg.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener( 'areaExchange', this.handlerAreaExchange.bind(this) ,this.listernerBackupid  );
    }
    componentWillUnmount(){
        eventObjectDefine.CoreController.removeBackupListerner(this.listernerBackupid);
    }

    roomUserscreenstateChanged(event){
        let {message} = event;
        if(message.type === 'screen'){
            if(message.published){
                if(message.userId === ServiceRoom.getTkRoom().getMySelf().id){
                    this.setState({
                        isPlayFlag:true,
                        screenStream:undefined,
                        isMe:message.userId === ServiceRoom.getTkRoom().getMySelf().id
                    });
                }else{
                    this.setState({
                        isPlayFlag:true,
                        screenStream:{extensionId:message.userId,type:message.type},
                        isMe:message.userId === ServiceRoom.getTkRoom().getMySelf().id
                    });
                }
            } else{
                this.setState({
                    isPlayFlag:false,
                    screenStream:undefined,
                    isMe:message.userId === ServiceRoom.getTkRoom().getMySelf().id
                });
                //通过点击插件上按钮关闭共享，启用工具箱屏幕共享按钮
                eventObjectDefine.CoreController.dispatchEvent({
                    type:'colse-holdAll-item' ,
                    message: {
                        type: 'sharing'
                    }
                });
            }
        }
    }

    handlerRoomDisconnectedScreen(recvEventData){
        this.setState({
            isPlayFlag:false
        });
        eventObjectDefine.CoreController.dispatchEvent({
            type: 'DisconnectionRoom'
        });
        eventObjectDefine.CoreController.dispatchEvent({
            type: 'disabledSharing'
        });
        // if( TkConstant.hasRole.roleChairman ) {
        this.setState({
            screenStream:undefined
        });
    }

    handlerRoomDelmsg(recvEventData){
        let pubmsgData = recvEventData.message ;
        switch(pubmsgData.name)
        {
            case "ClassBegin":{
                if(this.state.isPlayFlag){//只有共享,才取消共享
                        this._unScreenSharing();
                }
                break;
            }
        }
    }

    _unScreenSharing() {
        this.setState({
            isPlayFlag:false
        });
        if(this.state.isMe  && ServiceRoom.getNativeInterface()) {
            ServiceRoom.getNativeInterface().stopShareScreen(this.shareFailure);
        }else if(!TkGlobal.isClient&&!TkGlobal.isMobile){
            // TK.Room().stopShareScreen();
            ServiceRoom.getTkRoom().stopShareScreen();
        }
        //关闭共享，启用工具箱按钮
        eventObjectDefine.CoreController.dispatchEvent({
            type:'colse-holdAll-item' ,
            message: {
                type: 'sharing'
            }
        });
        eventObjectDefine.CoreController.dispatchEvent({
            type: 'hasToolBox',
            message: {
                isHasToolBox: true
            }
        });
    }

    shareFailure(e){
        L.Logger.error('Share the failure'+e);
    }

    handlerAreaExchange(data){
        if(data.message.hasExchange && this.state.isPlayFlag){
            // let startStyle=data.message.startStyle;
            // this.areaExchangeStyle={
            //     position: 'fixed',
            //     left: startStyle.left,
            //     top: startStyle.top,
            //     width: startStyle.width,
            //     height: startStyle.height,
            //     zIndex: '249'
            // };
            this.setState({
                areaExchangeFlag:true,
            });
        }else{
            this.setState({
                areaExchangeFlag:false,
            });
        }

    }

    render(){
        return(
            <article style={this.state.isPlayFlag ? (this.state.areaExchangeFlag ? this.areaExchangeStyle:{display:"block"}):{display:"none"}} className={"desktop-share-container " + (this.state.areaExchangeFlag?'areaExchange':'')}  >
            {this.state.isPlayFlag && (this.state.isMe || this.state.screenStream !== undefined)?<DestTop isMe={this.state.isMe} isPlayFlag = {this.state.isPlayFlag} unScreenSharing = {this._unScreenSharing.bind(this) }  shareType={this.state.shareType} stream = {this.state.isMe? undefined :this.state.screenStream} />:undefined}
            </article>
        )
    }
}