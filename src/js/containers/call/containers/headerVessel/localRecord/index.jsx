/**
 * 本地录制时间组件
 * @module LocalRecordSmart
 * @description   本地录制的时间组件
 * @date 2018/11/19
 */
'use strict';
import React from 'react';
import TkGlobal from 'TkGlobal';
import CoreController from 'CoreController';
import eventObjectDefine from 'eventObjectDefine';
import ServiceRoom from 'ServiceRoom';
import TkUtils from 'TkUtils';

import "./static/css/beyond.css";
import "./static/css/black.css";
class LocalRecordSmart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show:CoreController.handler.getAppPermissions('localRecord') ,
            recordState:'notStart' , //notStart、recording、recordPaused
            selectedRecord:!L.Utils.localStorage.getItem("notSelectedRecord")  ,
        };
        this.listernerBackupid =  new Date().getTime()+'_'+Math.random();
    };

    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        eventObjectDefine.Window.addEventListener( TkConstant.EVENTTYPE.WindowEvent.onBeforeUnload , this.handlerOnBeforeUnload.bind(this) , this.listernerBackupid  ) ;
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomPubmsg , this.handlerRoomPubmsg.bind(this) , this.listernerBackupid  ) ;
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomDelmsg , this.handlerRoomDelmsg.bind(this) , this.listernerBackupid  ) ;
        eventObjectDefine.CoreController.addEventListener(  'receive-msglist-ClassBegin' , this.handlerReceiveMsglistClassBegin.bind(this) , this.listernerBackupid  ) ;
        eventObjectDefine.CoreController.addEventListener("initAppPermissions", this.handlerInitAppPermissions.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener("receive-msglist-not-ClassBegin", this.handlerReceiveMsglistNotClassBegin.bind(this), this.listernerBackupid);
    };

    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        eventObjectDefine.Window.removeBackupListerner(this.listernerBackupid);
        eventObjectDefine.CoreController.removeBackupListerner(this.listernerBackupid);
    };

    handlerInitAppPermissions(){
        this.setState({show:CoreController.handler.getAppPermissions('localRecord')});
    }
    handlerOnBeforeUnload(){ //离开页面停止录制
        if(this.state.recordState !== 'notStart'){
            this._stopLocalRecord();
        }
        this._setNotSelectedRecordToLocalStorage();
    };

    handlerReceiveMsglistNotClassBegin(){
        this._setNotSelectedRecordToLocalStorage();
        this.setState({ selectedRecord:!L.Utils.localStorage.getItem("notSelectedRecord") }) ;
    };

    handlerRoomPubmsg(recvEventData){
        let message = recvEventData.message ;
        if(message.name === "ClassBegin" ){
            if(this.state.selectedRecord){
                if(this.state.recordState === 'notStart'){
                    this._startLocalRecord();
                }
            }
        }
    };
    handlerRoomDelmsg(recvEventData){
        let message = recvEventData.message ;
        if(message.name === "ClassBegin" ){
            if(this.state.recordState !== 'notStart'){
                this._stopLocalRecord();
                this._setNotSelectedRecordToLocalStorage();
            }
        }
    };
    handlerReceiveMsglistClassBegin(recvEventData){
        if(recvEventData.source === 'room-msglist' && recvEventData.message){
            if(this.state.selectedRecord){
                if(this.state.recordState === 'notStart'){
                    this._startLocalRecord();
                }
            }
        }
    };
    selectRecordOnChange(event){
        this.setState({selectedRecord:!this.state.selectedRecord});
        /*   if(event){
               event.preventDefault();
               event.stopPropagation();
           }*/
        return false ;
    }

    startOrStopRecordOnClick(event){
        if(this.state.recordState === 'notStart'){
            this._startLocalRecord();
        }else{
            this._stopLocalRecord();
        }
        if(event){
            event.preventDefault();
            event.stopPropagation();
        }
        return false ;
    };

    playOrPauseRecordOnClick(event){
        if(this.state.recordState !== 'notStart'){
            if(this.state.recordState === 'recordPaused'){
                this._pauseOrPlayLocalRecord(false);
            }else{
                this._pauseOrPlayLocalRecord(true);
            }
        }
        if(event){
            event.preventDefault();
            event.stopPropagation();
        }
        return false ;
    };

    _startLocalRecord( ){
        if(!CoreController.handler.getAppPermissions('localRecord')){return ;}
        if( !TkGlobal.isMacClient && ServiceRoom.getNativeInterface() ){
            var filename = 'TK_'+TkConstant.joinRoomInfo.serial+'_'+ TkConstant.joinRoomInfo.localRecordInfo.localrecordtype+'_'+ TkUtils.dateFormat( new Date()  , 'yyyy-MM-dd_HH_mm_ss_S'  ) ;
            if( TkConstant.joinRoomInfo.localRecordInfo.localrecordtype === 'mp3' ){
                ServiceRoom.getNativeInterface().startRecordAudio({
                    forcepath:false ,
                    filename:filename
                },(args)=>{
                    if(args.action === 'Recording'){
                        TkGlobal.localRecording = true ;
                        TkGlobal.localRecordPath = args.filename ;
                        this.setState({recordState:'recording'});
                    }
                });
            }else{
                ServiceRoom.getNativeInterface().startRecordScreen({
                    forcepath:false ,
                    filename:filename
                },(args)=>{
                    if(args.action === 'Recording'){
                        TkGlobal.localRecording = true ;
                        TkGlobal.localRecordPath = args.filename ;
                        this.setState({recordState:'recording'});
                    }
                });
            }
        }
    };
    _stopLocalRecord(){
        if(!CoreController.handler.getAppPermissions('localRecord')){return ;}
        if( !TkGlobal.isMacClient && ServiceRoom.getNativeInterface() ){
            if(TkConstant.joinRoomInfo.localRecordInfo.localrecordtype === 'mp3'){
                ServiceRoom.getNativeInterface().stopRecordAudio();
            }else{
                ServiceRoom.getNativeInterface().stopRecordScreen();
            }
            TkGlobal.localRecording = false ;
            this.setState({recordState:'notStart'});
        }
    };

    _pauseOrPlayLocalRecord(bPause){
        if(!CoreController.handler.getAppPermissions('localRecord')){return ;}
        if( !TkGlobal.isMacClient && ServiceRoom.getNativeInterface() ){
            if(TkConstant.joinRoomInfo.localRecordInfo.localrecordtype === 'mp3'){
                ServiceRoom.getNativeInterface().pauseRecordAudio(bPause, (args)=>{
                    if(args.action === 'Recording'){
                        this.setState({recordState:'recording'});
                    }else if(args.action === 'Paused'){
                        this.setState({recordState:'recordPaused'});
                    }
                });
            }else{
                ServiceRoom.getNativeInterface().pauseRecordScreen(bPause, (args)=>{
                    if(args.action === 'Recording'){
                        this.setState({recordState:'recording'});
                    }else if(args.action === 'Paused'){
                        this.setState({recordState:'recordPaused'});
                    }
                });
            }
        }
    }

    _setNotSelectedRecordToLocalStorage(){
        if(!CoreController.handler.getAppPermissions('localRecord')){return ;}
        if(!this.state.selectedRecord && TkGlobal.classBegin){
            L.Utils.localStorage.setItem("notSelectedRecord" , true );
        }else{
            L.Utils.localStorage.setItem("notSelectedRecord" , "" );
        }
    }

    render() {
        TkGlobal.selectedRecord = this.state.selectedRecord ;
        return (
            <div className="local-recording-container add-fl clear-float"  style={{display:!this.state.show?'none':''}} >
                {/* <input style={{display:TkGlobal.classBegin?'none':undefined}}  className="checkbox add-fl" type="checkbox" name="recording"  onChange={this.selectRecordOnChange.bind(this)}  checked={this.state.selectedRecord}  /> */}
                <button style={{display:TkGlobal.classBegin ? 'none':undefined}} className={"checkbox "+(this.state.selectedRecord ? 'on':'off')} onClick={this.selectRecordOnChange.bind(this)} ></button>
                <button disabled={!TkGlobal.classBegin}  style={{display:this.state.recordState === 'notStart'?'none':'block' }} title={TkGlobal.language.languageData.localRecord.title[this.state.recordState === 'recordPaused'?'playRecord':'pauseRecord']} onClick={this.playOrPauseRecordOnClick.bind(this)} className={"play-pause-record add-fl user-select-none " + this.state.recordState} />
                <button disabled={!TkGlobal.classBegin} title={TkGlobal.language.languageData.localRecord.title[this.state.recordState === 'notStart'?'startRecord':'stopRecord']}  onClick={this.startOrStopRecordOnClick.bind(this)} className={"start-stop-record add-fl user-select-none " + this.state.recordState} />
                <span className={"text add-fl user-select-none " + this.state.recordState}>{TkGlobal.language.languageData.localRecord.recordState[this.state.recordState]}</span>
            </div>
        )
    };
};
export default  LocalRecordSmart;