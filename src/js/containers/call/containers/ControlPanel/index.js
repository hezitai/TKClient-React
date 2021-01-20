/**
 * 全体控制组件
 * @description 全体控制组件
 * @author Ks
 * @date 2018/05/09
 */

'use strict';
import "./static/css/index.css";
import "./static/css/index_black.css";
import React, { Component } from 'react';
import TkGlobal from 'TkGlobal';
import TkConstant from 'TkConstant';
import eventObjectDefine from 'eventObjectDefine';
import CoreController from "CoreController";
import ServiceRoom from "ServiceRoom";
import WebAjaxInterface from "WebAjaxInterface";
import ServiceSignalling from "ServiceSignalling";
import TkUtils from 'TkUtils' ;

export default class ControlPanel extends Component{
    constructor(){
        super();
        this.listernerBackupid = new Date().getTime()+'_'+Math.random();
        this.state={
            isAdministration : false,
            isDim:true,
            allMuteDisabled:true ,
            allSpeakingDisabled:true,
            allTrophy:0,
            allRecover:0,
        }
    }

    componentDidMount(){
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomUserpropertyChanged ,this.handlerroomUserpropertyChanged.bind(this) , this.listernerBackupid ); //roomUserpropertyChanged事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomUseraudiostateChanged ,this._checkRoomIsAllParticipantMute.bind(this) , this.listernerBackupid );
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomUservideostateChanged ,this._checkRoomIsAllParticipantMute.bind(this) , this.listernerBackupid );
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomParticipantJoin ,this._checkRoomIsAllParticipantMute.bind(this) , this.listernerBackupid ); // 有人加入房间
         eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomParticipantLeave ,this._checkRoomIsAllParticipantMute.bind(this) , this.listernerBackupid ); // 有人离开房间
         eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomParticipantEvicted ,this._checkRoomIsAllParticipantMute.bind(this) , this.listernerBackupid ); // 有人离开房间
         eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomConnected ,this._checkRoomIsAllParticipantMute.bind(this) , this.listernerBackupid ); // 房间连接成功
        eventObjectDefine.CoreController.addEventListener( "triggerControlPanel" , this.ShowControlPanel.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener( "recoverPanelBeforeStarting" , this.close.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener( "CloseControlPanel" , this.triggerClose.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener( "CloseALLPanel" , this.close.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener( "triggerControlPanelOneKeyReset" , this.triggerControlPanelOneKeyReset.bind(this), this.listernerBackupid);
    }

    componentWillUnmount() {
        eventObjectDefine.CoreController.removeBackupListerner(this.listernerBackupid);
    };

    ShowControlPanel(){
        this.setState({
            isAdministration:true
        },()=>{

        })
    }

    close(){
        this.setState({
            isAdministration:false
        });
        eventObjectDefine.CoreController.dispatchEvent({
            type:'triggerControlPanelRecover'
        });
    }
    triggerClose(){
        this.setState({
            isAdministration:false
        });
    }

    /*一键恢复按钮状态控制*/
    triggerControlPanelOneKeyReset(Event){
        this.setState({
            allRecover:Event.message.count
        })
    }

    /*一键还原的函数*/
    handlerOneKeyReset(){
        eventObjectDefine.CoreController.dispatchEvent({//初始化视频框的位置（拖拽和分屏）
            type:'oneKeyRecovery',
            message: {}
        });
        this.close();
    }
    /*全体发送礼物*/
    sendGiftGiveAllUserClick(){
        if( CoreController.handler.getAppPermissions('giveAllUserSendGift') ){
            let userIdJson = {};
            let users = ServiceRoom.getTkRoom().getUsers(); // N：如果是大班课 就不应该走到这里了
            for (let user of Object.values(users)) {
                if(user.role === TkConstant.role.roleStudent){ //如果是学生，则发送礼物
                    let userId = user.id;
                    let userNickname = user.nickname ;
                    userIdJson[userId] = userNickname ;
                }
            }
            if(TkConstant.joinRoomInfo.customTrophys && TkConstant.joinRoomInfo.customTrophysVoice  && TkConstant.joinRoomInfo.customTrophys.length>1){
                eventObjectDefine.CoreController.dispatchEvent({
                    type:'loadCustomTrophyItem',
                    message: {type:'all',userIdJson:userIdJson}
                });
            }else{
                if(TkConstant.joinRoomInfo.customTrophys && TkConstant.joinRoomInfo.customTrophys.length==1){
                    let customTrophysOne={
                        trophyname:TkConstant.joinRoomInfo.customTrophys[0].trophyname,
                        trophyeffect:TkConstant.joinRoomInfo.customTrophys[0].trophyeffect,
                        trophyimg:TkConstant.joinRoomInfo.customTrophys[0].trophyimg,
                        trophyvoice:TkConstant.joinRoomInfo.customTrophys[0].trophyvoice
                    };
                    WebAjaxInterface.sendGift(userIdJson,customTrophysOne);
                }else{
                    WebAjaxInterface.sendGift(userIdJson);
                }
            }
            this.close();
        }else{
            L.Logger.error('do not have permission:giveAllUserSendGift')
        }
    };
    /*全体静音*/
    allUserMuteClick(){
        if( CoreController.handler.getAppPermissions('allUserMute') ){
            let users = ServiceRoom.getTkRoom().getUsers();    // N: 本来实际控制的也是台上的用户
            for(let user of Object.values(users) ){
                if(user.role !== TkConstant.role.roleChairman && user.role !== TkConstant.role.roleTeachingAssistant && user.publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE ){
                    if(user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY ){
                        ServiceSignalling.changeUserPublish(user.id , TkConstant.PUBLISHSTATE.PUBLISH_STATE_MUTEALL );
                    }else if( user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH){
                        ServiceSignalling.changeUserPublish(user.id , TkConstant.PUBLISHSTATE.PUBLISH_STATE_VIDEOONLY );
                    }
                }
            }
            this.setState({
                isDim:false
            });
            this.close();
        }else{
            L.Logger.error('do not have permission:allUserMute')
        }
    };
    /*全体发言*/
    allSpeakingClick(e) {
        if( CoreController.handler.getAppPermissions('hasAllSpeaking') ){
            let users = ServiceRoom.getTkRoom().getUsers();  // N: 本来实际控制的也是台上的用户
            for(let user of Object.values(users) ){
                if(user.role !== TkConstant.role.roleChairman && user.role !== TkConstant.role.roleTeachingAssistant && user.publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE ){
                    if(user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_MUTEALL){
                        ServiceSignalling.changeUserPublish(user.id ,TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY);
                    }else if( user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_VIDEOONLY){
                        ServiceSignalling.changeUserPublish(user.id , TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH );
                    }
                }
            }
            this.setState({
                isDim:true
            });
            this.close();
        }else{
            L.Logger.error('do not have permission: hasAllSpeaking')
        }
    }

    /*控制奖杯按钮*/
    trophyPrime(){
        let users = TkUtils.getSpecifyRoleList(TkConstant.role.roleStudent,ServiceRoom.getTkRoom().getUsers()) ; // N: 本来实际控制的也是台上的用户
        let count = 0 ;
        for(let user of Object.values(users) ){
            if(user.publishstate>0){
                count += 1;
            }else{
                count += 0;
            }
        };
        this.setState({
            allTrophy:count
        })
    }

    /*控制全部恢复按钮*/
    _checkRoomIsAllParticipantMute(){
        this.trophyPrime();
        const that = this ;
        let users = ServiceRoom.getTkRoom().getUsers() ; // N: 本来实际控制的也是台上的用户
        let muteUserSize = 0 ;
        let speakingUserSize = 0;
        for(let user of Object.values(users) ){
            if(user && user.role === TkConstant.role.roleStudent ){
                if (user.publishstate == TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY || user.publishstate == TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH) {//状态为1和3的时候
                    muteUserSize++ ;
                }else if(user.publishstate == TkConstant.PUBLISHSTATE.PUBLISH_STATE_VIDEOONLY || user.publishstate == TkConstant.PUBLISHSTATE.PUBLISH_STATE_MUTEALL) {//状态为2和4的时候
                    speakingUserSize++;
                }
            }
        }
        let allMute = (muteUserSize === 0 )  ;
        let allSpeaking = (speakingUserSize === 0 )  ;
        if( that.state.allMuteDisabled !== allMute ){
            that.setState({allMuteDisabled: allMute });
        }
        if (that.state.allSpeakingDisabled !== allSpeaking) {
            that.setState({allSpeakingDisabled: allSpeaking});
        }
        return allMute ;
    };
    // 用户属性改变
    handlerroomUserpropertyChanged(roomUserpropertyChangedEventData){
        if(TkGlobal.HeightConcurrence){
            //TODO
        }else{
            const that = this ;
            const changePropertyJson  = roomUserpropertyChangedEventData.message ;
            const user  = roomUserpropertyChangedEventData.user ;
            for( let key of Object.keys(changePropertyJson) ){
                if( key === 'publishstate' ){
                    that._checkRoomIsAllParticipantMute();
                }
            }
            this.trophyPrime();
        }
        
    };

    //阻止点击关闭弹框
    _stopPreventClick(e){
        e.preventDefault();
        e.stopPropagation();
    }

    render(){
        const {id } = this.props;
        return(
            <div id={id} className={"ControlPanel-main"} style={{display:this.state.isAdministration?'block':'none'}} onClick={this._stopPreventClick.bind(this) }>
                <ul className={"ControlPanel-main-ul"}>
                    <li className={"ControlPanel-li" + (this.state.allMuteDisabled?' disabled':'')} onClick={this.allUserMuteClick.bind(this)}>
                        <button 
                            title={TkGlobal.language.languageData.header.tool.allMute.title.no} 
                            className={"S-all_mute_btn "} >
                        </button>
                        <span className="S-all_mute_btn_span"> 
                            {TkGlobal.language.languageData.header.tool.allMute.title.no}
                        </span>
                    </li>
                    <li className={"ControlPanel-li" + (this.state.allSpeakingDisabled?' disabled':'')} onClick={this.allSpeakingClick.bind(this)}>
                        <button 
                            title={TkGlobal.language.languageData.header.tool.allMute.title.yes} 
                            className={"S-all_speaking "} >
                        </button>
                        <span className="S-all_mute_btn_span">
                            {TkGlobal.language.languageData.header.tool.allMute.title.yes}
                        </span>
                    </li>
                    {TkConstant.hasRole.roleTeachingAssistant || TkGlobal.HeightConcurrence 
                        ?null
                        :<li className={"ControlPanel-li" + (!this.state.allTrophy?' disabled':'')} onClick={this.sendGiftGiveAllUserClick.bind(this)}>
                            <button 
                                title={TkGlobal.language.languageData.header.tool.allGift.title.yes} 
                                className={"S-tool-img-wrap "} >
                            </button>
                            <span className="S-all_mute_btn_span">
                                {TkGlobal.language.languageData.header.tool.allGift.title.giftText}
                            </span>
                        </li>
                    }
                    {TkConstant.hasRole.roleTeachingAssistant
                        ?null
                        :<li className={"ControlPanel-li" + (!this.state.allRecover?' disabled':'')}  onClick={this.handlerOneKeyReset.bind(this)}>
                            <button 
                                title={TkGlobal.language.languageData.otherVideoContainer.button.oneKeyReset.text} 
                                className={"S-oneKeyReset-btn "}>
                            </button>
                            <span className="S-all_mute_btn_span">
                                {TkGlobal.language.languageData.otherVideoContainer.button.oneKeyReset.text}
                            </span>
                        </li>
                    }
                </ul>
            </div>
        )
    }
}