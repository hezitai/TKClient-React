/**
 * 右侧头部-上下课以及举手等按钮功能Smart模块
 * @module ClassbeginAndRaiseSmart
 * @description   承载上下课以及举手等按钮功能Smart模块
 * @date 2018/11/19
 */
'use strict';
import React from 'react';
import TkGlobal from 'TkGlobal';
import TkConstant from 'TkConstant';
import eventObjectDefine from 'eventObjectDefine';
import ServiceSignalling from 'ServiceSignalling';
import ServiceTooltip from 'ServiceTooltip';
import ServiceRoom from 'ServiceRoom';
import CoreController from 'CoreController';
import WebAjaxInterface from 'WebAjaxInterface';
import styled from "styled-components";



const ClassbeginAndRaiseSmartDiv = styled.div`
  display: ${props =>
    !(props.classbeginInfo.show ||  props.raiseInfo.show)
        ? "none"
        : "''"};
`;
class ClassbeginAndRaiseSmart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            classbeginInfo:{
                show:false ,
                disabled:false ,
                classbegin:false
            } ,
            raiseInfo:{
                show:false ,
                disabled:false ,
                raisehand:false
            },
            muteJustLocal: true
        };
        this.listernerBackupid = new Date().getTime()+'_'+Math.random();
    };

    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        const that = this ;
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomPubmsg , that.handlerRoomPubmsg.bind(that) , that.listernerBackupid  ) ;
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomDelmsg , that.handlerRoomDelmsg.bind(that) , that.listernerBackupid  ) ;
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomUserpropertyChanged , that.handlerRoomUserpropertyChanged.bind(that) , that.listernerBackupid  ) ;
        eventObjectDefine.CoreController.addEventListener(  'receive-msglist-ClassBegin' , that.handlerReceiveMsglistClassBegin.bind(that) , that.listernerBackupid  ) ;
        eventObjectDefine.CoreController.addEventListener(  'initAppPermissions' , that.handlerInitAppPermissions.bind(that) , that.listernerBackupid  ) ;
        eventObjectDefine.CoreController.addEventListener("updateAppPermissions_classBtnIsDisableOfRemind" ,that.handlerUpdateAppPermissions_classBtnIsDisableOfRemind.bind(that)  ,  that.listernerBackupid); //h5点击动作权限的更新
    };

    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        const that = this ;
        eventObjectDefine.CoreController.removeBackupListerner(  that.listernerBackupid  ) ;
    };

    handlerRoomPubmsg(recvEventData){
        const that = this ;
        let message = recvEventData.message ;
        if(message.name === "ClassBegin" ){
            that._updateClassbeginInfo();
        }
        if(message.name === "RemoteControl" ){
            that.state.raiseInfo.show = false;
            that.setState({raiseInfo:that.state.raiseInfo})
        }
    };
    handlerRoomDelmsg(recvEventData){
        const that = this ;
        let message = recvEventData.message ;
        if(message.name === "ClassBegin" ){
            that._updateClassbeginInfo();
        }
    };
    handlerRoomUserpropertyChanged(recvEventData){
        const that = this ;
        let message = recvEventData.message ;
        let user = recvEventData.user ;
        if(user.id === ServiceRoom.getTkRoom().getMySelf().id){
            for( let key of Object.keys(message) ){
                if(key === 'raisehand' || key === 'publishstate' || key === 'disableaudio'){
                    that._updateRaiseInfo();
                }
            }
        }
    };
    handlerReceiveMsglistClassBegin(recvEventData){
        const that = this ;
        let message =  recvEventData.message ;
        if(recvEventData.source === 'room-msglist' && recvEventData.message){
            that._updateClassbeginInfo();
        }
    };
    handlerInitAppPermissions(recvEventData){
        const that = this ;
        that._updateClassbeginInfo();
        that._updateRaiseInfo();
    };

    classbeginOnClick(){
        if(!TkGlobal.classBegin){
            // alert('on')//上课
            // this.props.dislogon = true;
            if( TkGlobal.isLeaveRoom && TkConstant.joinRoomInfo.endOfClassHoursIsClassOver ){ //爱斑马 如果点击上课时服务器时间大于教室结束事件，执行弹窗并离开教室
                ServiceTooltip.showConfirm(TkGlobal.language.languageData.remind.time.readyEndAiBanMa.four);
            }else{
                if( !CoreController.handler.getAppPermissions('startClassBegin') ){return ;}
                if( CoreController.handler.getAppPermissions('localRecord') && !TkGlobal.selectedRecord  ){
                    ServiceTooltip.showConfirm( TkGlobal.language.languageData.alertWin.messageWin.winMessageText.classBeginStartNotSelectRecord.text , function (answer) {
                        if(answer){
                            //点击上课后取消全体禁言状态
                            ServiceSignalling.sendSignllingEveryoneBanChat({isAllBanSpeak:false},true);
                            ServiceSignalling.setParticipantPropertyToAllByoRole([TK.ROOM_ROLE.STUDENT],{disablechat:false});
                            WebAjaxInterface.roomStart(); //发送上课信令
                        }
                    });
                }else{
                    //点击上课后取消全体禁言状态
                    ServiceSignalling.sendSignllingEveryoneBanChat({isAllBanSpeak:false},true);
                    ServiceSignalling.setParticipantPropertyToAllByoRole([TK.ROOM_ROLE.STUDENT],{disablechat:false});
                    WebAjaxInterface.roomStart(); //发送上课信令
                }
            }
        }else{
            // alert('off')//下课
            if( !CoreController.handler.getAppPermissions('endClassBegin') ){return ;}
            let classBeginEndText = TkGlobal.language.languageData.alertWin.messageWin.winMessageText.classBeginEnd.text ;
            if( CoreController.handler.getAppPermissions('localRecord') && TkGlobal.localRecording ){
                classBeginEndText = <div>
                    <span  style={{display:'block' , textAlign:'center'}} >{TkGlobal.language.languageData.alertWin.messageWin.winMessageText.classBeginEnd.text}</span>
                    <span  style={{display:'block', textAlign:'center',fontSize:'0.12rem' , color:'#913706' , marginTop:'0.05rem' }} >{TkGlobal.language.languageData.alertWin.messageWin.winMessageText.classBeginEndLocalRecord.text}</span>
                    {!TkGlobal.localRecordPath?undefined:<span  style={{display:'block', textAlign:'center',fontSize:'0.12rem' , color:'#913706' , marginTop:'0.05rem' }} >{TkGlobal.localRecordPath?TkGlobal.localRecordPath.substring(0 , TkGlobal.localRecordPath.indexOf("TK_") ):undefined}</span>}
                </div> ;
            }
            ServiceTooltip.showConfirm( classBeginEndText , function (answer) {
                if(answer){
                    //下课后清除全体禁言
                    ServiceSignalling.sendSignllingEveryoneBanChat({isAllBanSpeak:false},true);
                    ServiceSignalling.setParticipantPropertyToAllByoRole([TK.ROOM_ROLE.STUDENT],{disablechat:false});
                    WebAjaxInterface.roomOver(); //发送下课信令
                }
            });
        }
    };
    raiseOnClick(){
        let users = ServiceRoom.getTkRoom().getMySelf();
        if( !CoreController.handler.getAppPermissions('raisehand') || (users.publishstate > 0 && TkConstant.joinRoomInfo.isHandsUpOnStage)){return ;}
        let { raiseInfo } = this.state ;
        raiseInfo.raisehand = !raiseInfo.raisehand;
        this.setState({raiseInfo:raiseInfo});
        ServiceSignalling.setParticipantPropertyToAll(ServiceRoom.getTkRoom().getMySelf().id , {raisehand:!ServiceRoom.getTkRoom().getMySelf().raisehand} );
    };
    handlerUpdateAppPermissions_classBtnIsDisableOfRemind() {
        this._updateClassbeginInfo();
    };
    /*更新classbegin的描述信息*/
    _updateClassbeginInfo(){
        const that = this ;

        let classbeginInfo = {
            show: CoreController.handler.getAppPermissions('forcedEndClassBegin') ||  ( !TkGlobal.classBegin?CoreController.handler.getAppPermissions('startClassBegin') : CoreController.handler.getAppPermissions('endClassBegin') ),
            disabled:(!TkGlobal.classBegin && TkConstant.joinRoomInfo.endOfClassHoursIsClassOver) ? false : ( ( CoreController.handler.getAppPermissions('forcedEndClassBegin') &&   !TkGlobal.classBegin ) ||  ( CoreController.handler.getAppPermissions('classBtnIsDisableOfRemind') ? true : false ) ) ,
            classbegin:TkGlobal.classBegin
        } ;

        Object.customAssign(that.state.classbeginInfo , classbeginInfo) ;
        that.setState({classbeginInfo:that.state.classbeginInfo}) ;
        let { raiseInfo } = that.state ;
        let {classbeginAndRaiseShowButtonCallback} = that.props ;
        if(classbeginAndRaiseShowButtonCallback && typeof classbeginAndRaiseShowButtonCallback === 'function'){
            classbeginAndRaiseShowButtonCallback( (classbeginInfo.show || raiseInfo.show)  );
        }
        /*if (TkGlobal.classBegin == true && TkGlobal.remindServiceTime - TkConstant.joinRoomInfo.endtime * 1000 < 0) {
            TkAppPermissions.setAppPermissions('classBtnIsDisableOfRemind' , true);
        }*/
    };
    /*更新classbegin的描述信息*/
    _updateRaiseInfo(){
        const that = this ;
        let localUser = ServiceRoom.getTkRoom().getMySelf() ;
        let  raiseInfo = {
            show:CoreController.handler.getAppPermissions('raisehand')  ,
//          disabled: TkConstant.joinRoomInfo.isHandsUpOnStage || CoreController.handler.getAppPermissions('raisehandDisable') || !localUser.hasaudio ||  !( !localUser.disableaudio &&  (localUser.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE ||  localUser.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_VIDEOONLY || localUser.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_MUTEALL  ) ) , //音频设备禁用或者音频已发布则不能点举手
            raisehand:ServiceRoom.getTkRoom().getMySelf().raisehand
        };
        Object.customAssign(that.state.raiseInfo , raiseInfo) ;
        that.setState({raiseInfo:that.state.raiseInfo}) ;
        let { classbeginInfo  } = that.state ;
        let {classbeginAndRaiseShowButtonCallback} = that.props ;
        if(classbeginAndRaiseShowButtonCallback && typeof classbeginAndRaiseShowButtonCallback === 'function'){
            classbeginAndRaiseShowButtonCallback( (classbeginInfo.show || raiseInfo.show)  );
        }
    };
    /*新版举手功能*/
    /*鼠标按下*/
    raiseOnMouseDown(){
        let { raiseInfo } = this.state ;
        raiseInfo.raisehand = true;
        ServiceSignalling.setParticipantPropertyToAll(ServiceRoom.getTkRoom().getMySelf().id , {raisehand:!ServiceRoom.getTkRoom().getMySelf().raisehand} );
        this.setState({raiseInfo:raiseInfo});
    };
    /*鼠标抬起*/
    raiseOnMouseUp(){
        let { raiseInfo } = this.state ;
        raiseInfo.raisehand = false;
        ServiceSignalling.setParticipantPropertyToAll(ServiceRoom.getTkRoom().getMySelf().id , {raisehand:false} );
        this.setState({raiseInfo:raiseInfo});
    }
    /*鼠标离开*/
    raiseOnMouseOut(){
        let { raiseInfo } = this.state ;
        raiseInfo.raisehand = false;
        ServiceSignalling.setParticipantPropertyToAll(ServiceRoom.getTkRoom().getMySelf().id , {raisehand:false} );
        this.setState({raiseInfo:raiseInfo});
    }

    render() {
        let that = this;
        let { classbeginInfo  , raiseInfo , muteJustLocal} = that.state ;
        let users = ServiceRoom.getTkRoom().getMySelf();
        return (
            <ClassbeginAndRaiseSmartDiv className="h-btn-wrap add-fl add-fr" id="room_controller_container"
                                        classbeginInfo={classbeginInfo}  raiseInfo={raiseInfo} >
                {
                    classbeginInfo.show  && !TkConstant.hasRole.roleTeachingAssistant && !TkConstant.joinRoomInfo.hiddenClassBegin? <button
                        className={"add-fl "+( classbeginInfo.disabled ?'disabled':'') +( !TkGlobal.classBegin && TkConstant.hasRole.rolePatrol?" prohibition":" " ) + ( (TkGlobal.classBegin  || CoreController.handler.getAppPermissions('forcedEndClassBegin') )? ' h-room-end':' h-room-start') }
                        disabled={classbeginInfo.disabled || undefined}  id="room_classBegin"
                        onClick={!classbeginInfo.disabled ? that.classbeginOnClick.bind(that): undefined } >
                        {
                            !classbeginInfo.classbegin && !CoreController.handler.getAppPermissions('forcedEndClassBegin') ?
                                TkGlobal.language.languageData.header.system.attend.text
                                :
                                TkGlobal.language.languageData.header.system.finish.text
                        }
                    </button> : undefined
                }

                {
                    raiseInfo.show?  <button className={"h-room-start h-room-raise add-fl  "+(raiseInfo.disabled?'disabled':'') + (!raiseInfo.raisehand ?' ':' handDown')}
                                             disabled={raiseInfo.disabled || undefined}  id="room_Raise"
                                             onClick={!raiseInfo.disabled ? that.raiseOnClick.bind(that): undefined }
                                             onMouseDown={!raiseInfo.disabled && users.publishstate > 0 && TkConstant.joinRoomInfo.isHandsUpOnStage? that.raiseOnMouseDown.bind(that): undefined}
                                             onMouseUp={!raiseInfo.disabled && users.publishstate > 0 && TkConstant.joinRoomInfo.isHandsUpOnStage? that.raiseOnMouseUp.bind(that): undefined}
                                             onMouseOut={!raiseInfo.disabled && users.publishstate > 0 && TkConstant.joinRoomInfo.isHandsUpOnStage? that.raiseOnMouseOut.bind(that): undefined}
                        /*style={{ opacity:raiseInfo.raisehand? "0.8":"1"}}*/>{!raiseInfo.raisehand?(users.publishstate > 0 && TkConstant.joinRoomInfo.isHandsUpOnStage ?TkGlobal.language.languageData.header.system.Raise.yesText:TkGlobal.language.languageData.header.system.Raise.yesText):(users.publishstate > 0 && TkConstant.joinRoomInfo.isHandsUpOnStage?TkGlobal.language.languageData.header.system.Raise.raisingHand:TkGlobal.language.languageData.header.system.Raise.noText)}</button>: undefined
                }
            </ClassbeginAndRaiseSmartDiv>
        )
    };
};
export default  ClassbeginAndRaiseSmart;

