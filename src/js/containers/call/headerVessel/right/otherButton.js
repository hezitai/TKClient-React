/**
 * 右侧头部-帮助按钮以及设置按钮
 * @module OtherButton
 * @description   承载帮助及设置按钮
 * @author Z'hiXiang
 * @date 2018/5/8
 */
'use strict';
import React from 'react';
import eventObjectDefine from "eventObjectDefine";
import TkConstant from "TkConstant";
import TkGlobal from "TkGlobal";
import ServiceRoom from "ServiceRoom";
import TKUtils from 'TkUtils'
import ServiceSignalling from 'ServiceSignalling';
import CoreController from "CoreController";

class OtherButton extends React.Component{
    constructor(props){
        super(props);
        this.state={
            settingActive:false,
            isClassOverLeave:false,
            actived: [],
            isFullScreen:false,
            classBegin: false,
            userList: false,
            courseware: false,
            toolKit: false,
            option:false,
            chat:false,
            help:false,
            canDraw: false,
            unReadMessages: 0,
            isHasHand: false,
            isShowTools:false,
        }
        this.listernerBackupid = new Date().getTime() + '_' + Math.random();

        this.exceptOpts = ['fullScreen']
    }
    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        const that = this ;
        eventObjectDefine.CoreController.addEventListener('changeSettingBtn', that.handlerChangeSettingBtn.bind(that), that.listernerBackupid); //改变设置按钮状态的事件：
        eventObjectDefine.CoreController.addEventListener('userListClose', that.triggerItem.bind(that, 'userList'), that.listernerBackupid); //改变设置按钮状态的事件：
        eventObjectDefine.CoreController.addEventListener('CoursewareRemove', that.triggerItem.bind(that, 'courseware'), that.listernerBackupid); //改变设置按钮状态的事件：
        eventObjectDefine.CoreController.addEventListener('colose_holdArr', that.triggerItem.bind(that, 'toolKit'), that.listernerBackupid); //改变设置按钮状态的事件：
        eventObjectDefine.CoreController.addEventListener('triggerControlPanelRecover', that.triggerItem.bind(that, 'option'), that.listernerBackupid); //改变设置按钮状态的事件：
        eventObjectDefine.CoreController.addEventListener('closeChatBox', that.triggerItem.bind(that, 'chat'), that.listernerBackupid); //改变设置按钮状态的事件：
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPubmsg, that.handlePummsg.bind(that), that.listernerBackupid); //roomDelmsg 事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDelmsg, that.handlerRoomDelmsg.bind(that), that.listernerBackupid); //roomDelmsg 事件
        eventObjectDefine.Window.addEventListener( TkConstant.EVENTTYPE.WindowEvent.onResize , this.onResize.bind(this) , this.listernerBackupid );
        eventObjectDefine.CoreController.addEventListener( "receive-msglist-ClassBegin" , this.classBegin.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener("updateAppPermissions_canDraw", this._changeCanDrawPermissions.bind(this), this.listernerBackupid); 
        eventObjectDefine.CoreController.addEventListener("isholdAllShow", this.toolKitShow.bind(this), this.listernerBackupid); 
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomTextMessage, that.handleMessage.bind(that)  , that.listernerBackupid);//监听服务器的广播聊天消息
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomUserpropertyChanged , that.handlerRoomUserpropertyChanged.bind(that) , that.listernerBackupid); //room-userproperty-changed事件-收到参与者属性改变后执行
        eventObjectDefine.CoreController.addEventListener('isholdAllShow', that.handlerHoldAllShow.bind(that), that.listernerBackupid);
    };
    handlerChangeSettingBtn(){
        this.setState({settingActive:false})
    }
    handleMessage(e){
        if(!this.state.chat){
            this.setState({
                unReadMessages:this.state.unReadMessages+1
            })
        }
    }
    toolKitShow(event){
        if(event && event.message && event.message.isShowData){
            const data = event.message.isShowData

            if(Object.values(data).every(i=>i.isShow === false)){
                this.setState({toolKit:false})
            }
        }
    }
    /*处理room-userproperty-changed事件*/
    handlerRoomUserpropertyChanged(roomUserpropertyChangedEventData){
        let raisehand = roomUserpropertyChangedEventData.message.raisehand;
        if(raisehand !== undefined && raisehand !== null ){
            this.setState({
                isHasHand: this.state.userList ? false : raisehand
            })
        }
    };
    /*改变可画权限*/
    _changeCanDrawPermissions(){
        // let shareFlag = CoreController.handler.getAppPermissions('canDraw');
        // if(!shareFlag){
        //     let defaultWhiteboardToolViewRoot=document.getElementById('defaultWhiteboardToolViewRoot');
        //     defaultWhiteboardToolViewRoot.style.display='none';
        // }
        const canDraw = this.getCanDraw()
        this.setState({canDraw});
    };
    handlePummsg(recvEventData){
        let pubmsgData = recvEventData.message;
        switch(pubmsgData.name) {
            case "ClassBegin":
                this.classBegin()
                break;
            case 'ChatShow':
            if(TkConstant.hasRole.roleRecord || TkConstant.hasRole.rolePlayback){
                    this.setState({
                        chat: true,
                        unReadMessages:0
                    })
                    eventObjectDefine.CoreController.dispatchEvent({
                        type: 'CloseALLPanel'
                    })
                    eventObjectDefine.CoreController.dispatchEvent({
                        type: 'beyondTmplEvent',
                        message: {
                            key:'chat',
                        }
                    })
                }
                break;
        }
    }
    handlerHoldAllShow(recvEventData){
        let message = recvEventData.message;
        let flag = 0;
        for (let [key, value] of Object.entries(message.isShowData)) {
            if(value.isShow){
                flag++
            }
        }
        if(flag > 0 && TkGlobal.classBegin && CoreController.handler.getAppPermissions('canDraw')){
            this.setState({isShowTools:true})
        }else{
            this.setState({
                isShowTools: false
            })
        }
    } 
    classBegin(){
            eventObjectDefine.CoreController.dispatchEvent({
                type: 'CloseALLPanel'
            })
            const canDraw = this.getCanDraw()
            this.setState({
                classBegin:true,
                canDraw,
                isFullScreen:false
            })
            TKUtils.tool.exitFullscreen();
    }
    getCanDraw(){return CoreController.handler.getAppPermissions('canDraw')}
    onResize(e){
        //是否全屏
        let isFullscreen = document.fullscreenElement || document.msFullscreenElement ||  document.mozFullScreenElement || document.webkitFullscreenElement || false
        if(isFullscreen){
            this.setState({isFullScreen:true})
        }else{
            this.setState({isFullScreen:false})
        }
    }
    _openLoadDetectionDevice(){
        if(!this.state.settingActive){
            eventObjectDefine.CoreController.dispatchEvent( {type: "loadDetectionDevice"  , message:{check:false, main:true , bgImg:true} } );
        }
        this.setState({settingActive:true})
    }
    /*window.open(TkConstant.joinRoomInfo.jumpurl)*/
    _openHelpUrl(){
        if (!TkGlobal.isClient){
            window.open(TkConstant.joinRoomInfo.helpcallbackurl)
        } else if (TkGlobal.isClient && TkGlobal.clientversion >= 2018031000 && ServiceRoom.getNativeInterface().clientOpenBrowserUrl){
            window.GLOBAL.openUrl(TkConstant.joinRoomInfo.helpcallbackurl)
        }
    }
    openUrl(url){
        TkGlobal.isClient && ServiceRoom.getNativeInterface().clientOpenBrowserUrl(url);
    }
    handlerRoomDelmsg(recvEventData){
        let pubmsgData = recvEventData.message;
        switch(pubmsgData.name) {
            case "ClassBegin":
                eventObjectDefine.CoreController.dispatchEvent({
                    type: 'CloseALLPanel'
                })
                this.triggerItem('clear')
                let isLeave=true;
                if(!TkGlobal.classBegin && TkGlobal.endClassBegin && !TkConstant.hasRole.roleChairman && !TkConstant.joinRoomInfo.isClassOverNotLeave){
                    isLeave=true;
                }else{
                    isLeave=false;
                }
                this.setState({isClassOverLeave:isLeave,classBegin:false,canDraw: false})
                break;

            case 'ChatShow':
                if(TkConstant.hasRole.roleRecord || TkConstant.hasRole.rolePlayback){
                    this.setState({
                        chat: false
                    })
                    eventObjectDefine.CoreController.dispatchEvent({
                        type: 'CloseALLPanel'
                    })
                }
                break;
        }
    }
    buttonClick(key){
        switch (key) {
            case 'help':
                this.state.isFullScreen && this.setState({isFullScreen:false})
                this._openHelpUrl();
                return;
                break;

            case 'fullScreen':
                this.state.isFullScreen
                ? TKUtils.tool.exitFullscreen()
                : TKUtils.tool.launchFullscreen(
                    document.body
                )
                this.setState({isFullScreen:!this.state.isFullScreen})
                return;
                break;

            case 'setting':
                this._openLoadDetectionDevice()
                break;

            case 'chat':
                eventObjectDefine.CoreController.dispatchEvent({
                    type: 'CloseALLPanel'
                })
                break;
            
            case 'userList':
                this.setState({
                    isHasHand: false,
                })
                break;
        
            default:
                break;
        }
        eventObjectDefine.CoreController.dispatchEvent({
            type: 'beyondTmplEvent',
            message: {
                key,
            }
        })

        if(key === 'setting')return;

        this.triggerItem(key)
        
    }
    triggerItem(key, event){

        if(event && event.type){
            this.setState({[key]:false})
            if(TkConstant.hasRole.roleChairman && TkGlobal.classBegin && key === 'chat'){
                ServiceSignalling.sendChatShow(true)
            }
            return
        }

        if(this.state[key]){
            this.setState({[key]:false})
            if(TkConstant.hasRole.roleChairman && TkGlobal.classBegin && key === 'chat'){
                ServiceSignalling.sendChatShow(true)
            }
        }else{
            this.setState({[key]:true})
            if(key === 'chat')this.setState({unReadMessages:0})
            if(TkConstant.hasRole.roleChairman && TkGlobal.classBegin && key === 'chat'){
                ServiceSignalling.sendChatShow(false)
            }
        }
    }
    render(){
        let that=this;
        let {settingActive , isClassOverLeave, classBegin,isShowTools}=this.state;
        return(
            <div className="Tk-header-othericon">
                {
                    !isClassOverLeave && !TkGlobal.playback
                    ? (<button title={TkGlobal.language.languageData.toolContainer.toolIcon.userList.title}  className={`Tk-header-icon icon-roster ${this.state.userList?'active':''} ${this.state.isHasHand ? 'hand' : ''}`} onClick={this.buttonClick.bind(this,'userList')} style={{display:TkConstant.hasRole.roleStudent?'none':'block'}}></button>)
                    :null
                }
                {
                    !isClassOverLeave && !TkGlobal.playback
                    ? (<button title={TkGlobal.language.languageData.toolContainer.toolIcon.resourceLibrary.title}  className={`Tk-header-icon icon-courseware ${this.state.courseware?'active':''}`} onClick={this.buttonClick.bind(this,'courseware')} style={{display:CoreController.handler.getAppPermissions('loadCoursewarelist')?'block':'none'}}></button>)
                    :null
                }
                {
                    !isClassOverLeave && !TkGlobal.playback && isShowTools
                    ? (<button title={TkGlobal.language.languageData.toolCase.toolBox.text}  className={`Tk-header-icon icon-tools ${this.state.toolKit?'active':''}`} onClick={this.buttonClick.bind(this,'toolKit')} style={{display: classBegin && CoreController.handler.getAppPermissions('canDraw')?'block':'none'}}></button>)
                    :null
                }
                {
                    !isClassOverLeave && !TkConstant.hasRoomtype.oneToOne && !TkGlobal.playback
                    ? (<button title={TkGlobal.language.languageData.toolContainer.toolIcon.overallControl.title}  className={`Tk-header-icon icon-option ${this.state.option?'active':''}`} onClick={this.buttonClick.bind(this,'option')} style={{display: classBegin && (TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant) ?'block':'none'}}></button>)
                    :null
                }
                {
                    !TkGlobal.playback
                    ? (
                        <div className={`chat-icon-container`}>
                            <button title={TkGlobal.language.languageData.toolContainer.toolIcon.message.title} className={`Tk-header-icon icon-chat ${this.state.chat?'active':''}`}  onClick={this.buttonClick.bind(this,'chat')} style={{display: !isClassOverLeave? "block" : "none"}}></button>
                            <span style={{display: this.state.unReadMessages !== 0 && !this.state.chat? 'block':'none'}} className={`icon-chat-unread`}>
                                {this.state.unReadMessages}
                            </span>
                        </div>
                    )
                    :null
                }
                <button title={TkGlobal.language.languageData.toolContainer.toolIcon.seekHelp.title}  className="Tk-header-icon icon-help" onClick={this.buttonClick.bind(this, 'help')} style={{display: TkConstant.joinRoomInfo.helpcallbackurl && !isClassOverLeave && !TkGlobal.playback? "block" : "none"}}></button>

                <button title={TkGlobal.language.languageData.toolContainer.toolIcon.setting.title}  className={"Tk-header-icon icon-setting" + (settingActive ? ' active' : '')}
                        onClick={this.buttonClick.bind(this, 'setting')}
                        style={{"display": !TkConstant.hasRole.rolePatrol && !isClassOverLeave && !TkGlobal.playback? "block" : 'none'}}></button>
                {
                    !TkGlobal.isClient && !TkGlobal.playback
                    ? (<button title={TkGlobal.language.languageData.toolContainer.toolIcon.full.title} className={`Tk-header-icon icon-${this.state.isFullScreen?'reset':'f11'}`}  onClick={this.buttonClick.bind(this,'fullScreen')}></button>)
                    :null
                }
            </div>
        )
    }
}
export  default  OtherButton ;