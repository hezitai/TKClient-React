/**
 * 房间相关处理类
 * @class RoomHandler
 * @description   提供 房间相关的处理功能
 * @author QiuShao
 * @date 2017/7/21
 */
'use strict';
import eventObjectDefine from 'eventObjectDefine';
import TkConstant from 'TkConstant' ;
import TkUtils from 'TkUtils' ;
import RoleHandler from 'RoleHandler' ;
import CoreController from 'CoreController' ;
import ServiceTooltip from 'ServiceTooltip' ;
import TkGlobal from "TkGlobal" ;
import WebAjaxInterface from "WebAjaxInterface" ;
import ServiceRoom from "ServiceRoom" ;
import ServiceSignalling from "ServiceSignalling" ;
import ServiceTools from "ServiceTools" ;
import TkAppPermissions from 'TkAppPermissions';
import ClassBroFunctions from 'ClassBroFunctions';

class RoomHandler{
    constructor(room){
        this.room = room ;
        this.awitTextMsgs = [] ; //等待处理的聊天信息数组
        this.maxAwitTextMsgs = 50 ; //最大的等待处理的聊天信息个数
        this.awitParticipantJoinOrLeaves = [] ; //等待处理的参与者加入或者离开信息数组
        this.maxAwitParticipantJoinOrLeaves = 50 ; //最大的等待处理的参与者加入或者离开信息个数
    } ;

    /*注册事件给room，与底层相关
    * @method  registerEventToRoom*/
    registerEventToRoom(){
        /**@description Room类-RoomEvent的相关事件**/
        for(let eventKey in TkConstant.EVENTTYPE.RoomEvent ){
            ServiceRoom.getTkRoom().addEventListener(TkConstant.EVENTTYPE.RoomEvent[eventKey], function(recvEventData) {
                let isLog = true ;
                if(recvEventData.type === 'room-usernetworkstate-changed'){
                    isLog = false ;
                }
                if(isLog){
                    L.Logger.debug(TkConstant.EVENTTYPE.RoomEvent[eventKey]+" event:" , recvEventData );
                }
                eventObjectDefine.Room.dispatchEvent(recvEventData , false);
            });
        }
    };

    /*初始化回放参数，模拟checkroomx
    * @method joinPlaybackRoom */
    joinPlaybackRoom(){
        if(!TkGlobal.playback){
            L.Logger.error('No playback environment, no execution joinPlaybackRoom!');
            return;
        }else{ //回放走的流程
            let playbackParams = {
                roomtype:TkUtils.getUrlParams('type'),
                serial:TkUtils.getUrlParams('serial'),
                recordfilepath:"http://"+ ( /\//g.test( TkUtils.getUrlParams('path').charAt(TkUtils.getUrlParams('path').length-1) ) ?  TkUtils.getUrlParams('path') : TkUtils.getUrlParams('path')+'/' ),
                domain:TkUtils.getUrlParams('domain'),
                host:TkUtils.getUrlParams('host'),
            };
            TkGlobal.recordfilepath = playbackParams.recordfilepath ;
            ServiceRoom.getTkRoom().init('talkcloudAppKey', () => {
                ServiceRoom.getTkRoom().joinPlaybackRoom(TkConstant.SERVICEINFO.webHostname, TkConstant.SERVICEINFO.sdkPort, playbackParams);
            }, (errorinfo) =>{
                L.Logger.error('room init fail,fail info:',errorinfo    );
            },!(TkGlobal.playback || TkGlobal.logintype === 88 ),{
                isGetFileList:false , //是否获取文件列表
                isInnerVersions:true, //是否是内部版本
                tk_invalidappkey:true,//init方法的options传tk_invalidappkey为true，则不验证企业key
                useHttpProtocol:TkGlobal.logintype === 88,    //是否使用http
                useServerScreenRecording:TkGlobal.logintype === 88    //是否开启离屏录制
            });

        }
    };

    /*进入房间的方法*/
    joinRoom(){
        let browserInfo = TkUtils.getBrowserInfo() ;
        let userJsonOptions = {
            raisehand : false,//是否举手-默认不举手
            giftnumber : 0 ,//礼物的个数-默认0
            candraw : CoreController.handler.getAppPermissions('canDraw')  || false, //是否可画-老师以及助教默认可画
            disablevideo : false , //视频设备是否禁用,默认不禁用
            disableaudio : false , //音频设备是否禁用
            pointerstate : false ,//教鞭状态
            disablechat : false, //用户是否禁言-默认不禁言
            primaryColor : "#000000",  //用户画笔颜色，默认#000000
            devicetype : this._userLoginDeviceType(),
            systemversion : TkGlobal.isClient && TkGlobal.clientversion ?  TkGlobal.clientversion  : browserInfo.info.browserName + " " +  browserInfo.info.browserVersion,
            version : TkConstant.VERSIONS,
            appType : 'webpageApp',
            volume : 100,
            codeVersion : 2, //代码版本
        };
        let href =   TkUtils.decrypt(TkConstant.SERVICEINFO.joinUrl)  || window.location.href;
        let urlAdd = decodeURIComponent(href);
        let urlIndex = urlAdd.indexOf("?");
        let host = TkConstant.SERVICEINFO.webHostname;
        let port = TkConstant.SERVICEINFO.sdkPort;
        let urlSearch = urlAdd.substring(urlIndex + 1);
        let userid = TkUtils.getUrlParams('refresh_thirdid') ;
        let autoServer = true ;
        let tkLocalstorageServerName = L.Utils.localStorage.getItem('tkLocalstorageServerName') ;
        if( tkLocalstorageServerName && tkLocalstorageServerName !== undefined && tkLocalstorageServerName!==null && tkLocalstorageServerName!=='undefined' && tkLocalstorageServerName !=='null' ){
            autoServer = false ;
        }

        let awitConnectRoomCallback = (actionCallback) => {
            //awitConnectRoomCallback:等待连接房间的回调，回掉参数为加入房间的动作回调actionCallback【注：等待执行完一些列等待逻辑后调用actionCallback()即可继续加入房间】
            let hasDefaultDynamicPpt = false;

            //判断学生是否被踢出超过三分钟
            let nowTime = new Date().getTime();
            let evictedTime = Number(window.localStorage.evictedTime);
            let evictedId = window.localStorage.evicteid;
            let newTime = nowTime - evictedTime;
            // if(evictedId === ServiceRoom.getTkRoom().getMySelf().id && TkConstant.joinRoomInfo.serial === window.localStorage.serial && parseInt((newTime/1000)/60) < 3){
            if(TkConstant.joinRoomInfo.serial === window.localStorage.serial && parseInt((newTime/1000)/60) < 3){
                ServiceTooltip.showPrompt(TkGlobal.language.languageData.alertWin.login.register.eventListener.participantEvicted.noJoin.text);
                eventObjectDefine.CoreController.dispatchEvent({type:'leave_room'});
                ServiceRoom.getTkRoom().leaveroom();
            }else{
                if (TkConstant.joinRoomInfo.preLoading){
                    let fileList = ServiceRoom.getTkRoom().getFileList();
                    for(let item of fileList){
                        if (Number(item.type) === 1 && (Number(item.fileprop) === 1 || Number(item.fileprop) === 2)){
                            hasDefaultDynamicPpt = true;
                            break;
                        }
                    }
                    if(hasDefaultDynamicPpt){
                        eventObjectDefine.CoreController.dispatchEvent({type:'room_preload'});
                        eventObjectDefine.CoreController.addEventListener( "room_noPreload" , actionCallback)
                    }else{
                        if( L.Utils.isFunction(actionCallback) ){
                            actionCallback();
                        }
                    }
                }else {
                    if( L.Utils.isFunction(actionCallback) ){
                        actionCallback();
                        // all();
                    }
                }
            }
        };

        ServiceRoom.getTkRoom().init('talkcloudAppKey', () => {
            ServiceRoom.getTkRoom().joinroom(host,port,undefined,userid || undefined,{
                checkroomParamsUrl:urlSearch,
                autoServer:autoServer,
                awitConnectRoomCallback:awitConnectRoomCallback
            },userJsonOptions);
        }, (errorinfo) =>{
            L.Logger.error('room init fail,fail info:',errorinfo    );
        },!(TkGlobal.playback || TkGlobal.logintype === 88 ),{
            isGetFileList:true , //是否获取文件列表
            isInnerVersions:true, //是否是内部版本
            tk_invalidappkey:true,//init方法的options传tk_invalidappkey为true，则不验证企业key
            useHttpProtocol:TkGlobal.logintype === 88 ,
            useServerScreenRecording:TkGlobal.logintype === 88  
        });
    };

    /*添加事件监听到Room*/
    addEventListenerToRoomHandler(){
        let that = this ;
        /**@description Room类-RoomEvent的相关事件**/
        for(let eventKey in TkConstant.EVENTTYPE.RoomEvent ){
            eventObjectDefine.Room.addEventListener(TkConstant.EVENTTYPE.RoomEvent[eventKey] , function (recvEventData) {
                if(that['handler'+TkUtils.replaceFirstUper(eventKey) ] && typeof  that['handler'+TkUtils.replaceFirstUper(eventKey) ]  === "function" ){
                    let isReturn =  that[ 'handler'+TkUtils.replaceFirstUper(eventKey) ](recvEventData);
                    if(isReturn){return;}; //是否直接return，不做后面的事件再次分发
                }
                let isLog = true ;
                if(recvEventData.type === 'room-usernetworkstate-changed'){
                    isLog = false ;
                }
                eventObjectDefine.CoreController.dispatchEvent(recvEventData , isLog);
            });
        }
    };
    handlerRoomLeaveroom(recvEventData){
        TkGlobal.isLeaveRoom = true ;
    }
    handlerRoomServeraddressUpdate(recvEventData){
        let { web_host , doc_host , backup_doc_host } = recvEventData.message ;
        TkConstant.bindServiceinfoToTkConstant({
            web_host:web_host ,
            doc_host:doc_host ,
            backup_doc_host:backup_doc_host ,
            isInit:false
        });
        return true ;
    };

    handlerRoomMsglist(recvEventData){
        let {message}=recvEventData
        this._msglistOnConnected(message,"roomMsglist")
    }

    handlerRoomPubmsg(recvEventData){//处理room-pubmsg事件
        const that = this ;
        if(recvEventData.message && typeof recvEventData.message == "string") {
            recvEventData.message = JSON.parse(recvEventData.message);
        }
        if(recvEventData.message.data && typeof recvEventData.message.data == "string") {
            recvEventData.message.data = JSON.parse(recvEventData.message.data);
        }
        let pubmsgData = recvEventData.message ;
        if(TkGlobal.signallingMessageList && TkGlobal.signallingMessageList.length>0 && (pubmsgData.name !== "UpdateTime" && pubmsgData.name !== "LowConsume" &&  pubmsgData.name !== "StreamFailure" ) ){
            for(let index = TkGlobal.signallingMessageList.length - 1 ; index>=0 ; index-- ){
                if(TkGlobal.signallingMessageList[index].id === pubmsgData.id){
                    TkGlobal.signallingMessageList.splice(index,1);
                }
            }
            TkGlobal.signallingMessageList.push(pubmsgData);
            return true ;
        }else{
            if(!TkGlobal.serviceTime){
                TkGlobal.serviceTime = pubmsgData.ts * 1000;
                TkGlobal.remindServiceTime = pubmsgData.ts * 1000;
            }
            switch(pubmsgData.name) {
                case "ClassBegin": //上课
                    TkGlobal.serviceTime = !TkUtils.isMillisecondClass( pubmsgData.ts ) ? pubmsgData.ts * 1000 :  pubmsgData.ts; //服务器时间
                    TkGlobal.remindServiceTime = !TkUtils.isMillisecondClass( pubmsgData.ts )? pubmsgData.ts * 1000 :  pubmsgData.ts;//remind的服务器时间
                    that._classBeginStartHandler(pubmsgData); //上课之后的处理函数
                    if(TkConstant.hasRole.roleChairman){
                        this.rtmpStartBroadcast();
                    }
                    break;
                case "UpdateTime": //更新服务器时间
                    TkGlobal.serviceTime =  pubmsgData.ts * 1000; //服务器时间
                    TkGlobal.remindServiceTime = pubmsgData.ts * 1000;//remind的服务器时间
                    if(!TkGlobal.firstGetServiceTime && !TkGlobal.isHandleMsglistFromRoomPubmsg && TkGlobal.signallingMessageList  ){
                        TkGlobal.firstGetServiceTime = true;
                        if(!TkGlobal.classBegin){
                            this._msglistOnConnected(TkGlobal.signallingMessageList, 'roomConnected');
                        }
                        this._msglistOnConnected(TkGlobal.signallingMessageList, 'roomPubmsg');
                        TkGlobal.signallingMessageList = null;
                        delete TkGlobal.signallingMessageList ;
                    }
                    break;
                case "StreamFailure":
                    L.Logger.info('StreamFailure signalling:'+JSON.stringify(pubmsgData) );
                    let userid = pubmsgData.data.studentId ;
                    let failuretype = pubmsgData.data.failuretype ;
                    const _handlerStreamFailureInner = (user)=>{
                        switch (failuretype) {
                            case TkConstant.streamFailureType.udpNotOnceSuccess:
                                ServiceTooltip.showPrompt(
                                    TkGlobal.language.languageData.alertWin.call.prompt.remoteStreamFailure.udpNotOnceSuccess.one
                                    + user.nickname
                                    + TkGlobal.language.languageData.alertWin.call.prompt.remoteStreamFailure.udpNotOnceSuccess.two
                                );
                                break;
                            case TkConstant.streamFailureType.udpMidwayDisconnected:
                                ServiceTooltip.showPrompt(
                                    TkGlobal.language.languageData.alertWin.call.prompt.remoteStreamFailure.udpMidwayDisconnected.one
                                    + user.nickname
                                    + TkGlobal.language.languageData.alertWin.call.prompt.remoteStreamFailure.udpMidwayDisconnected.two
                                );
                                break;
                            case TkConstant.streamFailureType.publishvideoFailure_notOverrun:
                                ServiceTooltip.showPrompt(
                                    TkGlobal.language.languageData.alertWin.call.prompt.remoteStreamFailure.publishvideoFailure_notOverrun.one
                                    + user.nickname
                                    + TkGlobal.language.languageData.alertWin.call.prompt.remoteStreamFailure.publishvideoFailure_notOverrun.two
                                );
                                break;
                            case TkConstant.streamFailureType.publishvideoFailure_overrun:
                                ServiceTooltip.showPrompt(
                                    TkGlobal.language.languageData.alertWin.call.prompt.remoteStreamFailure.publishvideoFailure_overrun.one
                                );
                                break;
                            case TkConstant.streamFailureType.mobileHome:
                                ServiceTooltip.showPrompt(
                                    user.nickname
                                    + TkGlobal.language.languageData.alertWin.call.prompt.remoteStreamFailure.mobileHome.two
                                );
                                break;
                        }
                    };
                    if(TkGlobal.HeightConcurrence){
                        if(TkGlobal.specificUsers[userid]) {
                            ServiceRoom.getTkRoom().getRoomUser(userid, (user) => {
                                if (!user) {
                                    L.Logger.error('user is not exist , userid is ' + userid + '!');
                                    return;
                                }
                                delete TkGlobal.specificUsers[userid];
                                _handlerStreamFailureInner(user)

                            }, (e) => {
                                L.Logger.error('getRoomUser Failure' + e + '!');
                            });
                        }
                    }else{
                        if(TkGlobal.specificUsers[userid]){
                            let user =  ServiceRoom.getTkRoom().getUser(userid) ;  //NN: 小班课无妨
                            if(!user){ L.Logger.error('user is not exist , userid is '+userid+'!'); return;}
                            delete TkGlobal.specificUsers[userid];
                            _handlerStreamFailureInner(user)
                        }
                    }
                    break;
                case "LowConsume":
                    if(pubmsgData.data && pubmsgData.data.maxvideo !== undefined ){
                        TkConstant.joinRoomInfo.maxvideo =  Number(pubmsgData.data.maxvideo);
                    }
                    break;
                case "RemoteControl":
                    switch (pubmsgData.data.action){
                        case 'refresh':
                            if(pubmsgData.toID === ServiceRoom.getTkRoom().getMySelf().id){
                                eventObjectDefine.CoreController.dispatchEvent({type: 'loadSupernatantPrompt' , message:{show:true , content:TkGlobal.language.languageData.loadSupernatantPrompt.refreshing }  });
                                window.location.reload(true);
                                //window.location.href = TkUtils.decrypt( TkConstant.joinRoomInfo.joinUrl );
                                return true ;
                            }
                            break ;
                        case 'areaSelection':
                            if(pubmsgData.toID === ServiceRoom.getTkRoom().getMySelf().id){
                                if (pubmsgData.data.type === 'getServerListInfo'){
                                    ServiceRoom.getTkRoom().requestServerList(TkConstant.SERVICEINFO.webHostname , TkConstant.SERVICEINFO.sdkPort ,function (serverList , code) {
                                        let serverName = ServiceRoom.getTkRoom().getMySelf().servername;
                                        let serverListCopy = undefined;
                                        if(serverList && typeof serverList === 'object'){
                                            serverListCopy = {} ;
                                            for(let [key,value] of Object.entries(serverList) ){
                                                serverListCopy[key] = Object.customAssign({} , value);
                                            }
                                        }else{
                                            serverListCopy = serverList;
                                        }
                                        let data = {
                                            action:'areaSelection' ,
                                            type:'sendServerListInfo' ,
                                            serverData:{serverList:serverListCopy , serverName:serverName} ,
                                        };
                                        let fromID = pubmsgData.fromID ;
                                        ServiceSignalling.sendSignallingFromRemoteControl(fromID , data);
                                    });
                                    return true ;
                                }
                            }
                            break ;
                        case 'deviceManagement':
                            if(pubmsgData.toID === ServiceRoom.getTkRoom().getMySelf().id){
                                if (pubmsgData.data.type === 'getDeviceInfo'){
                                    /*枚举设备信息*/
                                    let paramsJson = {isSetlocalStorage: false} ;
                                    TK.DeviceMgr.getDevices(function (deviceInfo) {
                                        let data = {
                                            action:'deviceManagement' ,
                                            type:'sendDeviceInfo' ,
                                            deviceData:{deviceInfo:deviceInfo} ,
                                        };
                                        let fromID = pubmsgData.fromID ;
                                        ServiceSignalling.sendSignallingFromRemoteControl(fromID , data);
                                    }, paramsJson);
                                    return true ;
                                }else if(pubmsgData.data.type === 'changeDeviceInfo'){
                                    let {selectDeviceInfo} = pubmsgData.data.changeData  ;
                                    TK.DeviceMgr.setDevices(selectDeviceInfo, function() {
                                        L.Logger.error('set devices failed')
                                    });
                                 eventObjectDefine.CoreController.dispatchEvent({ type:"remotecontrol_deviceManagement_changeDeviceInfo" , message:{selectDeviceInfo:selectDeviceInfo} }) ;
                                }
                            }
                            break ;
                        case 'nowSomeoneCdnIp':
                            ServiceSignalling.sendSignallingFromRemoteControl(pubmsgData.fromID , {
                                action: 'callCdnIp',
                                serverInfo: {
                                    serverKey: window.WBGlobal.docAddressKey,
                                }
                            });
                            break;
                        case 'changeCdnIp':
                            let ipKey = pubmsgData.data.key ;
                            ServiceRoom.getTkWhiteBoardManager().switchDocAddress(ipKey, true);
                            L.Logger.info('change cdn , cdn key is '+ window.WBGlobal.docAddressKey + ', address is ' + window.WBGlobal.nowUseDocAddress);
                            break;
                    }
                    break;
                case "FullScreen":
                    TkGlobal.isVideoInFullscreen = true;
                    // if( TkUtils.tool.isFullScreenStatus() ) {
                    //     TkUtils.tool.exitFullscreen();
                    // }
                    break;
            }
        }
    };
    handlerRoomDelmsg(recvEventData){//处理room-delmsg事件
        const that = this ;
        let delmsgData = recvEventData.message ;
        if(recvEventData.message && typeof recvEventData.message == "string") {
            recvEventData.message = JSON.parse(recvEventData.message);
        }
        if(recvEventData.message.data && typeof recvEventData.message.data == "string") {
            recvEventData.message.data = JSON.parse(recvEventData.message.data);
        }
        if(TkGlobal.signallingMessageList && TkGlobal.signallingMessageList.length>0 ){
            for(let i=TkGlobal.signallingMessageList.length-1 ; i>=0 ; i--){
                if(TkGlobal.signallingMessageList[i].id === delmsgData.id || TkGlobal.signallingMessageList[i].associatedMsgID === delmsgData.id){
                    TkGlobal.signallingMessageList.splice(i,1);
                }
            }
            return true ;
        }else{
            switch(delmsgData.name) {
                case "ClassBegin": //删除上课（也就是下课了）
                    // 单独派发一个事件出去，未以后单独的恢复功能做铺垫
                    eventObjectDefine.CoreController.dispatchEvent({type:'recoverPanelBeforeStarting'});
                    let isDispatchEvent_endClassbeginShowLocalStream = that._classBeginEndHandler(delmsgData); //下课之后的处理函数
                    ServiceTooltip.showPrompt(TkGlobal.language.languageData.alertWin.login.register.eventListener.roomDelClassBegin.text , ()=>{
                        if(TkConstant.joinRoomInfo.classBeginEndCloseClient && TkGlobal.isClient &&  !TkGlobal.isMacClient && ServiceRoom.getNativeInterface().shutdownNativeClient ){
                            ServiceRoom.getNativeInterface().shutdownNativeClient();
                        }
                        if(TkConstant.joinRoomInfo.classBeginEndCloseClient && TkGlobal.isMacClient) {
                            window.close()
                        }
                        if(isDispatchEvent_endClassbeginShowLocalStream){
                            if(!TkConstant.joinRoomInfo.isClassOverNotLeave){
                                eventObjectDefine.CoreController.dispatchEvent({type:'endClassbeginShowLocalStream'}); //触发下课后显示本地视频
                            }
                        }else{
                            if(TkConstant.joinRoomInfo && TkConstant.joinRoomInfo.jumpurl && TkConstant.hasRole.roleStudent){
                                window.location.href = TkConstant.joinRoomInfo.jumpurl ;
                            }
                        }
                    });
                    if(TkConstant.hasRole.roleChairman){
                        this.rtmpStopBroadcast();
                    }
                    break;
                case "FullScreen":
                    TkGlobal.isVideoInFullscreen = false;
                    break;
            }
        }
    };
    handlerRoomConnected(roomConnectedEventData){  //处理room-connected事件
        const that = this ;
        TkGlobal.isStartRtml = false ;
        TkGlobal.isLeaveRoom = false ;
        that._compareDocServerSpeedSwitchCND();
        ServiceRoom.getTkWhiteBoardManager().changeWhiteBoardConfigration({ //改变主白板配置项（房间连接成功，但是没有处理上没上课）
            languageType:TkGlobal.language.name === 'chinese' ? 'ch' : ( TkGlobal.language.name === 'complex' ? 'tw' : (TkGlobal.language.name === 'japan' ?'ja':'en') ) , //语言类型，默认ch ,  languageType的值有 ch / tw / en  , ch:简体中文，tw:繁体中文 ， en:英文 , ja:日文
            mediaShareToID:ServiceRoom.getTkRoom().getMySelf().id , //未上课，媒体文件共享给自己
            // clientMediaShare:TkGlobal.isClient && TkGlobal.clientversion >= 2018031000 && !TkGlobal.isMacClient  ,//是否是客户端共享媒体
            clientMediaShare:false  ,//是否是客户端共享媒体 TODO 因爲學生動態PPT本地電影共享導致老師那邊無法關閉，先用媒體共享
            synchronization:false , //是否同步给其它用户,没上课不同步
            canDraw:ServiceRoom.getTkRoom().getMySelf().candraw , //可画权限 , 授权可画
            canPage:ServiceRoom.getTkRoom().getMySelf().candraw || (TkConstant.hasRole.roleTeachingAssistant ||TkConstant.hasRole.roleChairman ) || ( TkConstant.hasRole.roleStudent && TkConstant.joinRoomInfo.isSupportPageTrun ) , //翻页权限 , 如果有授权或者是学生且有支持翻页的配置项则能翻页
            actionClick:ServiceRoom.getTkRoom().getMySelf().candraw , //动态PPT、H5文档等动作点击权限 , 授权可点
            isMobile:TK.SDKTYPE === 'mobile' , //是否是移动端
            addPage:false , //加页权限，默认true(注：加页权限和翻页权限同时为true时才能加页)
            pptVolumeSynchronization:false, //PPT音量是否同步
        });
        if(TkGlobal.isClient || TkGlobal.playback ){
            if(TK.DeviceMgr.removeDeviceChangeListener){
                TK.DeviceMgr.removeDeviceChangeListener();
            }
        }

        TkGlobal.firstGetServiceTime = false;
        TkGlobal.isHandleMsglistFromRoomPubmsg = false;
        TkGlobal.appConnected = true ; //房间连接成功

        if(ServiceRoom.getTkRoom().getMySelf().role === TkConstant.role.roleStudent){
            //TODO 20180722:qiu 这里高并发情况下会导致每个人都请求PHP拿礼物数,并且每个人都会修改用户属性
            WebAjaxInterface.getGiftInfo(ServiceRoom.getTkRoom().getMySelf().id,(response)=>{
                if(response.result == 0) {
                    let giftInfoList = response.giftinfo;
                    for(let giftInfo of giftInfoList){
                        let participantId = giftInfo.receiveid;
                        TkGlobal.participantGiftNumberJson[participantId] = TkGlobal.participantGiftNumberJson[participantId] || 0;
                        TkGlobal.participantGiftNumberJson[participantId] += Number(giftInfo.giftnumber); //从web接口中获取礼物数
                    }
                    let giftnumber = ServiceRoom.getTkRoom().getMySelf().giftnumber || 0;
                    giftnumber += ( TkGlobal.participantGiftNumberJson[ServiceRoom.getTkRoom().getMySelf().id]|| 0);
                    if(giftnumber !== ServiceRoom.getTkRoom().getMySelf().giftnumber){
                        ServiceSignalling.setParticipantPropertyToAll(ServiceRoom.getTkRoom().getMySelf().id , {giftnumber:giftnumber});
                    }
                }
            }); //获取教室礼物信息，当前登录者的礼物
        }
        let roleHasDefalutAppPermissionsJson =  RoleHandler.getRoleHasDefalutAppPermissions();   //获取角色默认权限
        TkAppPermissions.initAppPermissions(roleHasDefalutAppPermissionsJson);
        let signallingMessageList =  roomConnectedEventData.message ; //信令list数据
        TkGlobal.signallingMessageList = signallingMessageList ;
        let users = ServiceRoom.getTkRoom().getUsers() ; // N：用户还在该集合里
        for(let key in users){
            let user = users[key];
            RoleHandler.checkRoleConflict(user , true) ;
        }
        this._msglistOnConnected(TkGlobal.signallingMessageList, 'roomConnected');
        if(TkConstant.joinRoomInfo.isBeforeClassReleaseVideo && !TkGlobal.classBegin){  // 未上课发布音视频
            that._BeforeClassAutoPublishAV();
        }
        if(TkGlobal.serviceTime &&  !TkGlobal.firstGetServiceTime && !TkGlobal.isHandleMsglistFromRoomPubmsg && TkGlobal.signallingMessageList  ){
            TkGlobal.firstGetServiceTime = true ;
            this._msglistOnConnected(TkGlobal.signallingMessageList, 'roomPubmsg');
            TkGlobal.signallingMessageList = null;
            delete TkGlobal.signallingMessageList ;
        }
        if( !TkGlobal.classBegin && ServiceRoom.getTkRoom().getMySelf().candraw !== CoreController.handler.getAppPermissions('canDraw') ){
            ServiceSignalling.setParticipantPropertyToAll( ServiceRoom.getTkRoom().getMySelf().id , {candraw:CoreController.handler.getAppPermissions('canDraw') } );
        };
        if(!TkGlobal.firstGetServiceTime){ //没有获取第一次服务器时间
            ServiceSignalling.sendSignallingFromUpdateTime( ServiceRoom.getTkRoom().getMySelf().id );
        }
        CoreController.handler.refreshSystemStyleJson();
        eventObjectDefine.CoreController.dispatchEvent({type: 'loadSupernatantPrompt' , message:{show:false , content:undefined}  });
        //调用客户端方法设置音量
        if( TkGlobal.isClifent && TK.isTkNative && TK.subscribe_from_native && ServiceRoom.getTkRoom().getDeviceMgr && ServiceRoom.getTkRoom().getDeviceMgr()&& ServiceRoom.getTkRoom().getDeviceMgr().setSpeakerVolume){
            if(  ServiceRoom.getTkRoom() && ServiceRoom.getTkRoom().getMySelf() ){
                ServiceRoom.getTkRoom().getDeviceMgr().setSpeakerVolume(ServiceRoom.getTkRoom().getMySelf().volume);
            }
        }
        if(!TkConstant.joinRoomInfo.isHasVideo && !TkGlobal.isOnlyAudioRoom && !TkGlobal.playback){ //纯音频房间且教室不是纯音频的，则切换成纯音频
            ServiceRoom.getTkRoom().switchOnlyAudioRoom(true);
        }
        $(window).resize();
    };
    handlerRoomDisconnected(roomDisconnectedEventData){
        TkGlobal.appConnected = false;
        TkGlobal.classBegin = false;
        TkGlobal.serviceTime = undefined ;
        TkGlobal.remindServiceTime = undefined;
        TkGlobal.signallingMessageList = null;
        delete TkGlobal.signallingMessageList ;
        TkGlobal.isHandleMsglistFromRoomPubmsg = false ;
        TkGlobal.participantGiftNumberJson = {} ;
        //TkAppPermissions.resetDefaultAppPermissions(true); //恢复默认权限
        ServiceRoom.getTkRoom().getMySelf().giftnumber = 0;
        if(ServiceRoom.getTkRoom().getMySelf().role === TkConstant.role.roleStudent){
            ServiceRoom.getTkRoom().getMySelf().pointerstate = false;  //断网后，将自己的教鞭状态重置false
        }
    };
    handlerRoomParticipantJoin(roomParticipantJoinEventData){//处理room-participant_join 事件
    };
    handlerRoomModeChanged(roomModeEventData){
        if(roomModeEventData.message.roomMode === TK.ROOM_MODE.BIG_ROOM){
            TkGlobal.HeightConcurrence = true ;
        }else if(roomModeEventData.message.roomMode  === TK.ROOM_MODE.NORMAL_ROOM){
            TkGlobal.HeightConcurrence = false ;
        }
    }
    handlerRoomTextMessage(roomTextMessageEventData) {
        if (roomTextMessageEventData && roomTextMessageEventData.message && typeof roomTextMessageEventData.message === 'string') {
            roomTextMessageEventData.message = JSON.parse(roomTextMessageEventData.message);
        }
        if( TkGlobal.HeightConcurrence ) { //大教室，则启用大教室聊天消息列表存储机制
            let nowTime = new Date().getTime();
            const _dispatchTestMessageList = () => {
                this.oldHandleTextMsgListTime = nowTime ;
                clearTimeout( this.awitTextMsgTimer );
                this.awitTextMsgTimer = undefined ;
                if( this.awitTextMsgs.length ){
                    eventObjectDefine.CoreController.dispatchEvent({type:'room-text-message-list' ,  message:[...this.awitTextMsgs]});
                    this.awitTextMsgs.length = 0 ;
                }
            };
            /*  if( this.awitTextMsgs.length > this.maxAwitTextMsgs  ){ //等待处理的个数大于最大等待个数，则派发聊天列表
                  this.awitTextMsgs.push( roomTextMessageEventData );
                  _dispatchTestMessageList();
              }else{//下面的代码}*/
            if( this.oldTextMsgTime !== undefined && this.oldHandleTextMsgListTime !== undefined ){
                if( nowTime - this.oldTextMsgTime > 500 ){ //两条聊天消息的时间差大于500ms则派发聊天列表
                    this.awitTextMsgs.push( roomTextMessageEventData );
                    _dispatchTestMessageList();
                }else{
                    if( nowTime - this.oldHandleTextMsgListTime > 1000 ){ //两次处理等待列表的时间差大于1s则派发聊天列表
                        this.awitTextMsgs.push( roomTextMessageEventData );
                        _dispatchTestMessageList();
                    }else{
                        this.awitTextMsgs.push( roomTextMessageEventData );
                        if( !this.awitTextMsgTimer ){
                            clearTimeout( this.awitTextMsgTimer );
                            this.awitTextMsgTimer =  setTimeout( ()=> {
                                _dispatchTestMessageList();
                            } , 1000 );
                        }
                    }
                }
            }else{ //时间没有初始化过，则直接处理（即：第1条聊天消息）
                this.awitTextMsgs.push( roomTextMessageEventData );
                _dispatchTestMessageList();
            }
            this.oldTextMsgTime = nowTime ;
            return true ; //阻止分发单个的聊天消息
        }
    };
    handlerRoomUserpropertyChanged(roomUserpropertyChangedEventData){
        const changePropertyJson  = roomUserpropertyChangedEventData.message ;
        const user  = roomUserpropertyChangedEventData.user ;
        for( let [key , value] of Object.entries(changePropertyJson) ){
            if(user.id === ServiceRoom.getTkRoom().getMySelf().id){
                switch ( key ){
                    case 'servername':
                        L.Utils.localStorage.setItem('tkLocalstorageServerName' , value ) ;
                        break;
                }
                if( key === 'candraw' ){
                    ServiceRoom.getTkWhiteBoardManager().changeWhiteBoardConfigration({ //改变主白板配置项（授权更新后）
                        canDraw:value, //可画权限 , 授权可画
                        canPage:value ||  ( TkConstant.hasRole.roleStudent && TkConstant.joinRoomInfo.isSupportPageTrun ) , //翻页权限 , 如果有授权或者是学生且有支持翻页的配置项则能翻页
                        actionClick:value , //动态PPT、H5文档等动作点击权限 , 授权可点
                        synchronization:value,
                    });
                    TkAppPermissions.setAppPermissions('sendWhiteboardMarkTool' , value);//发送标注工具信令权限
                    TkAppPermissions.setAppPermissions('h5DocumentActionClick' , value);//h5课件点击动作的权限
                    TkAppPermissions.setAppPermissions('dynamicPptActionClick' , value);//动态PPT点击动作的权限
                    TkAppPermissions.setAppPermissions('publishDynamicPptMediaPermission_video' , value);//发布动态PPT视频的权限
                    TkAppPermissions.setAppPermissions('unpublishMediaStream' , value);//取消发布媒体文件流的权限
                    TkAppPermissions.setAppPermissions('publishMediaStream' , value);//发布媒体文件流的权限
                    TkAppPermissions.setAppPermissions('canDraw' , value);//画笔权限
                    TkAppPermissions.setAppPermissions('isCanDragVideo' , value);//能否拖拽视频框的权限
                    TkAppPermissions.setAppPermissions('isChangeVideoSize' , value);//能否拉伸视频框的权限
                    TkAppPermissions.setAppPermissions('canDragCaptureImg' , value);//能否拖拽截屏图片的权限
                    TkAppPermissions.setAppPermissions('canResizeCaptureImg' , value);//能否拉伸截屏图片的权限
                    TkAppPermissions.setAppPermissions('isQrCode' , value);//能否拉伸截屏图片的权限
                    //TkAppPermissions.setAppPermissions('isCapture' ,  TkGlobal.clientversion && TkGlobal.clientversion>=2018010200 && TkGlobal.isClient && value );//能否截屏的权限

                    if(TkConstant.hasRole.roleStudent){
                        TkAppPermissions.setAppPermissions('whiteboardPagingPage' , value ? value : TkConstant.joinRoomInfo.isSupportPageTrun);//白板翻页权限
                        TkAppPermissions.setAppPermissions('newpptPagingPage' , value ? value : TkConstant.joinRoomInfo.isSupportPageTrun);//动态ppt翻页权限
                        TkAppPermissions.setAppPermissions('h5DocumentPagingPage' , value ? value : TkConstant.joinRoomInfo.isSupportPageTrun);//h5课件翻页权限
                        TkAppPermissions.setAppPermissions('jumpPage' , value ? value : TkConstant.joinRoomInfo.isSupportPageTrun);//h5课件翻页权限
                        TkAppPermissions.setAppPermissions('Asharing' , value);//  学生是否显示共享
                    }
                }
                if(key === 'volume'){
                    //调用客户端方法设置音量
                    if( TkGlobal.isClient && TK.isTkNative && TK.subscribe_from_native && ServiceRoom.getTkRoom().getDeviceMgr && ServiceRoom.getTkRoom().getDeviceMgr().setSpeakerVolume){
                        ServiceRoom.getTkRoom().getDeviceMgr().setSpeakerVolume(value);
                    }
                }
                if(key === 'publishstate'){
                    if( (TkConstant.joinRoomInfo.isSupportCandraw && TkConstant.hasRoomtype.oneToOne && TkConstant.hasRole.roleStudent && value !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE && TkGlobal.classBegin && !TkGlobal.isAutoGetCandraw ) || (TkConstant.joinRoomInfo.isSupportCandraw && ( !TkConstant.hasRoomtype.oneToOne && TkGlobal.roomChange ) && TkConstant.hasRole.roleStudent  && value !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE && TkGlobal.classBegin && !TkGlobal.isAutoGetCandraw ) ){
                        if( !ServiceRoom.getTkRoom().getMySelf().candraw ){
                            TkGlobal.isAutoGetCandraw = true;
                            ServiceSignalling.setParticipantPropertyToAll( ServiceRoom.getTkRoom().getMySelf().id , {candraw:!ServiceRoom.getTkRoom().getMySelf().candraw} );
                        }
                    }
                }
            }
            if(  key === 'giftnumber'){
                TkGlobal.participantGiftNumberJson[user.id] = undefined ;
                delete TkGlobal.participantGiftNumberJson[user.id];
            }
        }
    };
    handlerRoomFiles(roomFilesEventData){
        let filesArray = roomFilesEventData.message;
        let defaultFileInfo = undefined ;
        let jsonDefaultFileInfo = {};
        for(let fileInfo of filesArray){
            if(Number(fileInfo.type) === 1 &&   !(TkUtils.getFiletyeByFilesuffix(fileInfo.filetype) === 'mp4' ||   TkUtils.getFiletyeByFilesuffix(fileInfo.filetype) === 'mp3' )  ){
                defaultFileInfo = fileInfo ;
                break;
            }else if( !(TkUtils.getFiletyeByFilesuffix(fileInfo.filetype) === 'mp4' ||   TkUtils.getFiletyeByFilesuffix(fileInfo.filetype) === 'mp3' )  && !defaultFileInfo){
                if(!defaultFileInfo){
                    defaultFileInfo = fileInfo ;
                }
                /*if(jsonDefaultFileInfo['filecategory_'+fileInfo.filecategory] === undefined){//filecategory-->0：教室  1：系统
                    jsonDefaultFileInfo['filecategory_'+fileInfo.filecategory]= fileInfo ; //取最早上传的文件显示
                }*/
            }
        }
        /*if(!defaultFileInfo){
            if(jsonDefaultFileInfo['filecategory_'+0] !== undefined){ //有教室文件夹则以教室文件夹作为默认文件
                defaultFileInfo = jsonDefaultFileInfo['filecategory_'+0] ;
            }else if(jsonDefaultFileInfo['filecategory_'+1] !== undefined){//没有教室文件夹但有系统则以系统文件夹作为默认文件
                defaultFileInfo = jsonDefaultFileInfo['filecategory_'+1] ;
            }
        }*/
        TkGlobal.defaultFileInfo = defaultFileInfo || TkGlobal.defaultFileInfo;
    };
    handlerRoomParticipantEvicted(roomParticipantEvictedEventData){
        TkAppPermissions.resetDefaultAppPermissions(true);
        if(roomParticipantEvictedEventData.message && roomParticipantEvictedEventData.message.reason === 1){
            //学生被踢出后，在本地添加时间点
            if(TkConstant.hasRole.roleStudent){
                window.localStorage['evictedTime'] = new Date().getTime();
                window.localStorage['serial'] = TkConstant.joinRoomInfo.serial;
                window.localStorage['evicteid'] = roomParticipantEvictedEventData.message.id;
            }
            ServiceTooltip.showPrompt(TkGlobal.language.languageData.alertWin.login.register.eventListener.participantEvicted.kick.text);
        }else{
            ServiceTooltip.showPrompt(TkGlobal.language.languageData.alertWin.login.register.eventListener.participantEvicted.roleConflict.text);
            if(TkGlobal && TkGlobal.isClient && !TkGlobal.isMacClient){//销毁客户端区域共享绿框
                ServiceRoom.getNativeInterface().destroyShareScreenWindow()
            }
        }
    };
    handlerRoomAudiovideostateSwitched(roomSwitchEventData){
        let {message} = roomSwitchEventData;
        TkGlobal.isOnlyAudioRoom = message.onlyAudio;
        eventObjectDefine.CoreController.dispatchEvent({type:'isOnlyAudioRoom',onlyAudio:message.onlyAudio}) ;
    }
    handlerRoomCheckroom(checkRoomEventData){
        let {ret, roominfo} = checkRoomEventData.message || {} ;
        this._handlerCheckroomOrInitPlaybackInfo(ret, roominfo);
    }
    handlerRoomCheckroomPlayback(checkRoomEventData){
        let {ret, roominfo} = checkRoomEventData.message || {} ;
        this._handlerCheckroomOrInitPlaybackInfo(ret, roominfo);
    }
    handlerRoomErrorNotice(roomErrorNoticeEventData){
        let { errorCode , message={} } = roomErrorNoticeEventData;
        let myId = ServiceRoom.getTkRoom().getMySelf().id;
        let {userId,type,causeCode} = message;
        if(myId !== userId || type !== 'video'){
            return ;
        }
        let streamFailureJson = {};
        switch (errorCode){
            case TK.ERROR_NOTICE.PUBLISH_AUDIO_VIDEO_FAILURE:
                L.Logger.warning('my stream is not publish success , publish failure info is '+JSON.stringify(roomErrorNoticeEventData)+' , my user id is '+myId);
                streamFailureJson.failuretype = Number(causeCode) === 2 ? TkConstant.streamFailureType.publishvideoFailure_overrun : TkConstant.streamFailureType.publishvideoFailure_notOverrun ;
                ServiceSignalling.sendSignallingFromStreamFailure(myId , streamFailureJson);
                break;
            case TK.ERROR_NOTICE.UDP_CONNECTION_FAILED:
                streamFailureJson.failuretype = TkConstant.streamFailureType.udpNotOnceSuccess ;
                ServiceTooltip.showPrompt(TkGlobal.language.languageData.alertWin.call.prompt.streamConnectFailed.notSuccess.text);
                ServiceSignalling.sendSignallingFromStreamFailure(myId , streamFailureJson);
                break;
            case TK.ERROR_NOTICE.UDP_CONNECTION_INTERRUPT:
                streamFailureJson.failuretype = TkConstant.streamFailureType.udpMidwayDisconnected ;
                ServiceTooltip.showPrompt(TkGlobal.language.languageData.alertWin.call.prompt.streamConnectFailed.onceSuccessed.text);
                ServiceSignalling.sendSignallingFromStreamFailure(myId , streamFailureJson);
                break;
        }
    }
    handlerAccessAccepted(accessAcceptedEventData){ //处理access-accepted事件
        //TODO 采集设备成功的提示信息，SDK需要制定规范
        if(TkGlobal.playback){
            return ;
        }
        if(accessAcceptedEventData.message && accessAcceptedEventData.message.getUserMediaFailureCode !== undefined ){
            if( accessAcceptedEventData.message.getUserMediaFailureCode === L.Constant.getUserMedia.FAILURE_USERMEDIA_AGAIN_ONLY_GET_AUDIO ){
                ServiceTooltip.showPrompt(TkGlobal.language.languageData.getUserMedia.accessAccepted.getUserMediaFailure_reGetAudio );
            }else  if( accessAcceptedEventData.message.getUserMediaFailureCode === L.Constant.getUserMedia.FAILURE_USERMEDIA_AGAIN_ONLY_GET_VIDEO ){
                ServiceTooltip.showPrompt(TkGlobal.language.languageData.getUserMedia.accessAccepted.getUserMediaFailure_reGetVideo );
            }
        }
    };
    handlerAccessDenied(accessDeniedEventData){ //处理access-denied事件
        //TODO 采集设备失败的提示信息，SDK需要制定规范
        if(TkGlobal.playback){
            return ;
        }
        let errormsg = undefined ;
        let {code} = accessDeniedEventData.message ;
        let isShowPrompt = false ;
        switch (code){
            case L.Constant.accessDenied.streamFail://获取流失败
                errormsg = TkGlobal.language.languageData.getUserMedia.accessDenied.streamFail ;
                isShowPrompt = true ;
                break;
            case L.Constant.accessDenied.notAudioAndVideo: //没有音视频设备
                errormsg = TkGlobal.language.languageData.getUserMedia.accessDenied.notAudioAndVideo ;
                isShowPrompt = true ;
                break;
        }
        if(isShowPrompt && TkGlobal.needDetectioned === false){  ServiceTooltip.showPrompt(errormsg); }
    };

    /*处理msglist数据*/
    _msglistOnConnected(signallingMessageList , source){
        const that = this ;
        const _msglistInner = (messageListData , source , ignoreSignallingJson) => { //room-msglist处理函数
            let tmpSignallingData =  {};
            for(let x in messageListData) {
                if(ignoreSignallingJson && ignoreSignallingJson[messageListData[x].name]){ //如果有忽略的信令，则跳出本次循环
                    continue;
                }
                if(messageListData[x].data && typeof messageListData[x].data == "string") {
                    messageListData[x].data = JSON.parse(messageListData[x].data);
                }
                if (/outIframe/.test(messageListData[x].name)) {
                    eventObjectDefine.CoreController.dispatchEvent({type:'outIframe-msglist' , message:{signallingData:messageListData[x]}}) ;
                }else if(tmpSignallingData[messageListData[x].name] == null || tmpSignallingData[messageListData[x].name] == undefined) {
                    tmpSignallingData[messageListData[x].name] = [];
                    tmpSignallingData[messageListData[x].name].push(messageListData[x]);
                } else {
                    tmpSignallingData[messageListData[x].name].push(messageListData[x]);
                }
            };
            if(source === 'roomConnected'){
                /*上课数据*/
                let classBeginArr = tmpSignallingData["ClassBegin"];
                if(classBeginArr != null && classBeginArr != undefined && classBeginArr.length > 0) {
                    if(classBeginArr[classBeginArr.length - 1].name == "ClassBegin") {
                        that._classBeginStartHandler(classBeginArr[classBeginArr.length - 1]);
                        eventObjectDefine.CoreController.dispatchEvent({
                            type:'receive-msglist-ClassBegin' ,
                            source:'room-msglist' ,
                            message:classBeginArr[classBeginArr.length - 1]
                        });
                        // if(TkConstant.hasRole.roleChairman){
                        //     this.rtmpStartBroadcast();
                        // }
                    }
                }else{
                    eventObjectDefine.CoreController.dispatchEvent({
                        type:'receive-msglist-not-ClassBegin' ,
                        source:'room-msglist' ,
                        message:{}
                    });
                    if(TkConstant.joinRoomInfo.autoClassBegin && TkConstant.hasRole.roleChairman && TkAppPermissions.getAppPermissions('autoClassBegin') ){
                        if(!TkGlobal.classBegin){
                            if(TkConstant.joinRoomInfo.hiddenClassBegin){ //隐藏上下课按钮
                                if( !TkAppPermissions.getAppPermissions('hiddenClassBeginAutoClassBegin') ){ return ; } ;
                                WebAjaxInterface.roomStart(); //发送上课信令
                            }else{
                                if( !TkAppPermissions.getAppPermissions('startClassBegin') ){ return ; } ;
                                WebAjaxInterface.roomStart(); //发送上课信令
                            }
                        }
                    }
                }
                tmpSignallingData["ClassBegin"] = null;
            }else if(source === 'roomPubmsg' || source === 'roomMsglist'){
                /*性能指标信令（适应IOS配置）*/
                let lowconsumeArr = tmpSignallingData["LowConsume"];
                if(lowconsumeArr !== null && lowconsumeArr !== undefined && lowconsumeArr.length > 0) {
                    if(TkConstant.hasRole.roleChairman){
                        ServiceSignalling.sendSignallingFromLowConsume( TkConstant.joinRoomInfo.maxvideo );
                    }else{
                        if(lowconsumeArr[lowconsumeArr.length-1].data && lowconsumeArr[lowconsumeArr.length-1].data.maxvideo !== undefined  ){
                            TkConstant.joinRoomInfo.maxvideo = Number(lowconsumeArr[lowconsumeArr.length-1].data.maxvideo) ;
                        }
                    }
                }else{
                    if(source === 'roomPubmsg' ){
                        if(TkConstant.hasRole.roleChairman){
                            ServiceSignalling.sendSignallingFromLowConsume( TkConstant.joinRoomInfo.maxvideo );
                        }
                    }
                }
                tmpSignallingData["LowConsume"] = null;

                /*视频拖拽的动作*/
                let videoDragArr = tmpSignallingData["videoDraghandle"];
                if(videoDragArr !== null && videoDragArr !== undefined && videoDragArr.length > 0) {
                    let otherVideoStyle = videoDragArr[videoDragArr.length - 1].data.otherVideoStyle;
                    if (otherVideoStyle) {
                        let user = ServiceRoom.getTkRoom().getMySelf();
                        //刚进入房间时将自己的视频框位置初始化
                        // if (!TkConstant.hasRole.roleChairman && !TkConstant.hasRole.roleTeachingAssistant) {
                        if (otherVideoStyle[user.id]) {
                            otherVideoStyle[user.id] = {
                                percentTop:0,
                                percentLeft:0,
                                isDrag:false,
                            };
                            let data = {otherVideoStyle:otherVideoStyle};
                            ServiceSignalling.sendSignallingFromVideoDraghandle(data);
                        }
                        // }
                        eventObjectDefine.CoreController.dispatchEvent({
                            type: 'handleVideoDragListData',
                            message: {data: {otherVideoStyle:otherVideoStyle,}},
                        });
                    }
                }
                tmpSignallingData["videoDraghandle"] = null;

                /*分屏数据*/
                let VideoSplitScreenArr = tmpSignallingData["VideoSplitScreen"];
                if(VideoSplitScreenArr !== null && VideoSplitScreenArr !== undefined && VideoSplitScreenArr.length > 0) {
                    eventObjectDefine.CoreController.dispatchEvent({
                        type: 'receive-msglist-VideoSplitScreen',
                        message: VideoSplitScreenArr[VideoSplitScreenArr.length - 1],
                    });
                }
                tmpSignallingData["VideoSplitScreen"] = null;

                /*视频拉伸的动作*/
                let VideoChangeSizeArr = tmpSignallingData["VideoChangeSize"];
                if (VideoChangeSizeArr !== null && VideoChangeSizeArr !== undefined && VideoChangeSizeArr.length > 0) {
                    if (VideoChangeSizeArr[0].data.ScaleVideoData) {
                        let user = ServiceRoom.getTkRoom().getMySelf();
                        //刚进入房间时将自己的视频大小初始化
                        // if (!TkConstant.hasRole.roleChairman && !TkConstant.hasRole.roleTeachingAssistant) {
                        if (VideoChangeSizeArr[0].data.ScaleVideoData[user.id]) {
                            VideoChangeSizeArr[0].data.ScaleVideoData[user.id] = {
                                scale:1,
                            };
                            let data = {ScaleVideoData:VideoChangeSizeArr[0].data.ScaleVideoData};
                            ServiceSignalling.sendSignallingFromVideoChangeSize(data);
                        }
                        // }
                        eventObjectDefine.CoreController.dispatchEvent({
                            type: 'handleVideoSizeListData',
                            message: {data: {ScaleVideoData:VideoChangeSizeArr[0].data.ScaleVideoData,}},
                        });
                    }
                }
                tmpSignallingData["VideoChangeSize"] = null;

                /*截屏图片的动作*/
                let CaptureImgArr = tmpSignallingData["CaptureImg"];
                if (CaptureImgArr !== null && CaptureImgArr !== undefined && CaptureImgArr.length > 0) {
                    eventObjectDefine.CoreController.dispatchEvent({
                        type: 'receive-msglist-CaptureImg',
                        message: {CaptureImgArray: CaptureImgArr}
                    });
                }
                tmpSignallingData["CaptureImg"] = null;

                /*截屏图片拖拽的动作*/
                let CaptureImgDragArr = tmpSignallingData["CaptureImgDrag"];
                if (CaptureImgDragArr !== null && CaptureImgDragArr !== undefined && CaptureImgDragArr.length > 0) {
                    eventObjectDefine.CoreController.dispatchEvent({
                        type: 'receive-msglist-CaptureImgDrag',
                        message: {CaptureImgDragArray: CaptureImgDragArr}
                    });
                }
                tmpSignallingData["CaptureImgDrag"] = null;

                /*截屏图片缩放的动作*/
                let CaptureImgResizeArr = tmpSignallingData["CaptureImgResize"];
                if (CaptureImgResizeArr !== null && CaptureImgResizeArr !== undefined && CaptureImgResizeArr.length > 0) {
                    eventObjectDefine.CoreController.dispatchEvent({
                        type: 'receive-msglist-CaptureImgResize',
                        message: {CaptureImgResizeArray: CaptureImgResizeArr}
                    });
                }
                tmpSignallingData["CaptureImgResize"] = null;

                /*课件全屏之后video在右下角*/
                let FullScreenArr = tmpSignallingData["FullScreen"];
                if (FullScreenArr !== null && FullScreenArr !== undefined && FullScreenArr.length > 0) {
                    TkGlobal.isVideoInFullscreen = true;
                    eventObjectDefine.CoreController.dispatchEvent({
                        type: 'receive-msglist-FullScreen',
                        message: {FullScreenArray: FullScreenArr}
                    });
                }
                tmpSignallingData["FullScreen"] = null;

                /*视频标注*/
                let VideoWhiteboardArr = tmpSignallingData["VideoWhiteboard"];
                if (VideoWhiteboardArr !== null && VideoWhiteboardArr !== undefined && VideoWhiteboardArr.length > 0) {
                    eventObjectDefine.CoreController.dispatchEvent({
                        type: 'receive-msglist-VideoWhiteboard',
                        message: {VideoWhiteboardArray: VideoWhiteboardArr}
                    });
                }
                tmpSignallingData["VideoWhiteboard"] = null;

                /*倒计时数据*/
                let timerShowArr = tmpSignallingData["timer"];
                if(timerShowArr != null && timerShowArr != undefined && timerShowArr.length > 0) {
                    if(timerShowArr[timerShowArr.length - 1].name == "timer") {
                        eventObjectDefine.CoreController.dispatchEvent({
                            type:'receive-msglist-timer' ,
                            source:'room-msglist' ,
                            message:{ timerShowArr:timerShowArr }
                        });
                    }
                }
                tmpSignallingData["timer"] = null;

                /*计时器拖拽的动作*/
                let TimerDragArr = tmpSignallingData["TimerDrag"];
                if (TimerDragArr !== null && TimerDragArr !== undefined && TimerDragArr.length > 0) {
                    eventObjectDefine.CoreController.dispatchEvent({
                        type: 'receive-msglist-TimerDrag',
                        message: {TimerDragArray: TimerDragArr}
                    });
                }
                tmpSignallingData["TimerDrag"] = null;

                /*转盘数据*/
                let dialShowArr = tmpSignallingData["dial"];
                if(dialShowArr != null && dialShowArr != undefined && dialShowArr.length > 0) {
                    if(dialShowArr[dialShowArr.length - 1].name == "dial") {
                        eventObjectDefine.CoreController.dispatchEvent({
                            type:'receive-msglist-dial' ,
                            source:'room-msglist' ,
                            message:{ dialShowArr:dialShowArr }
                        });
                    }
                }
                tmpSignallingData["dial"] = null;

                /*转盘拖拽的动作*/
                let DialDragArr = tmpSignallingData["DialDrag"];
                if (DialDragArr !== null && DialDragArr !== undefined && DialDragArr.length > 0) {
                    eventObjectDefine.CoreController.dispatchEvent({
                        type: 'receive-msglist-DialDrag',
                        message: {DialDragArray: DialDragArr}
                    });
                }
                tmpSignallingData["DialDrag"] = null;

                /*答题卡数据*/
                let answerShowArr = tmpSignallingData["answer"];
                if(answerShowArr != null && answerShowArr != undefined && answerShowArr.length > 0) {
                    if(answerShowArr[answerShowArr.length - 1].name == "answer") {
                        eventObjectDefine.CoreController.dispatchEvent({
                            type:'receive-msglist-answer' ,
                            source:'room-msglist' ,
                            message:{ answerShowArr:answerShowArr }
                        });
                    }
                }
                tmpSignallingData["answer"] = null;

                /*高并发答题器*/
                let questionArr = tmpSignallingData["Question"];
                if(questionArr != null && questionArr != undefined && questionArr.length > 0) {
                    if(questionArr[questionArr.length - 1].name == "Question") {
                        eventObjectDefine.CoreController.dispatchEvent({
                            type:'receive-msglist-question' ,
                            source:'room-msglist' ,
                            message:{ data:questionArr[0] }
                        });
                    }
                }
                tmpSignallingData["Question"] = null;

                /*公布结果*/
                let publishArr = tmpSignallingData["PublishResult"];
                if(publishArr != null && publishArr != undefined && publishArr.length > 0) {
                    if(publishArr[publishArr.length - 1].name == "PublishResult") {
                        eventObjectDefine.CoreController.dispatchEvent({
                            type:'receive-msglist-publishResult' ,
                            source:'room-msglist' ,
                            message:{ data:publishArr[0] }
                        });
                    }
                }
                tmpSignallingData["PublishResult"] = null;

                /*答题卡拖拽的动作*/
                let AnswerDragArr = tmpSignallingData["AnswerDrag"];
                if (AnswerDragArr !== null && AnswerDragArr !== undefined && AnswerDragArr.length > 0) {
                    eventObjectDefine.CoreController.dispatchEvent({
                        type: 'receive-msglist-AnswerDrag',
                        message: {AnswerDragArray: AnswerDragArr}
                    });
                }
                tmpSignallingData["AnswerDrag"] = null;

                /*抢答器数据*/
                let qiangDaQiArr = tmpSignallingData["qiangDaQi"];
                if(qiangDaQiArr != null && qiangDaQiArr != undefined && qiangDaQiArr.length > 0) {
                    if(qiangDaQiArr[qiangDaQiArr.length - 1].name == "qiangDaQi") {
                        eventObjectDefine.CoreController.dispatchEvent({
                            type:'receive-msglist-qiangDaQi' ,
                            source:'room-msglist' ,
                            message:{ qiangDaQiArr:qiangDaQiArr }
                        });
                    }
                }
                tmpSignallingData["qiangDaQi"] = null;
                /*抢答者数据*/
                let QiangDaZheArr = tmpSignallingData["QiangDaZhe"];
                if(QiangDaZheArr != null && QiangDaZheArr != undefined && QiangDaZheArr.length > 0) {
                    if(QiangDaZheArr[QiangDaZheArr.length - 1].name == "QiangDaZhe") {
                        eventObjectDefine.CoreController.dispatchEvent({
                            type:'receive-msglist-QiangDaZhe' ,
                            source:'room-msglist' ,
                            message:{ QiangDaZheArr:QiangDaZheArr }
                        });
                    }
                }
                tmpSignallingData["QiangDaZhe"] = null;

                /*抢答器拖拽的动作*/
                let ResponderDragArr = tmpSignallingData["ResponderDrag"];
                if (ResponderDragArr !== null && ResponderDragArr !== undefined && ResponderDragArr.length > 0) {
                    eventObjectDefine.CoreController.dispatchEvent({
                        type: 'receive-msglist-ResponderDrag',
                        message: {ResponderDragArray: ResponderDragArr}
                    });
                }
                tmpSignallingData["ResponderDrag"] = null;

                /*课堂人数超过13数据*/
                let MoreUsersArr = tmpSignallingData["MoreUsers"];
                if(MoreUsersArr != null && MoreUsersArr != undefined && MoreUsersArr.length > 0) {
                    if(MoreUsersArr[MoreUsersArr.length - 1].name == "MoreUsers") {
                        TkGlobal.isMoreUsers=true
                        eventObjectDefine.CoreController.dispatchEvent({
                            type:'receive-msglist-MoreUsers' ,
                            source:'room-msglist' ,
                            message:MoreUsersArr[MoreUsersArr.length - 1]
                        });
                    }

                }else{
                    if(source === 'roomPubmsg' ){
                        if(Object.keys( ServiceRoom.getTkRoom().getUsers() ).length > TkGlobal.userCount && !TkGlobal.HeightConcurrence){   /*NN:看过*/
                            let isMoreUsers=true;
                            let isDelMsgMoreUser = false;
                            let dataMoreUser = {
                                hasMoreUser:isMoreUsers,
                            };
                            TkGlobal.isMoreUsers=true
                            ServiceSignalling.sendSignallingFromMoreUsers(dataMoreUser , isDelMsgMoreUser);
                        }
                    }
                }
                tmpSignallingData["MoreUsers"] = null;

                /*小白板数据*/
                let blackBoardArr = tmpSignallingData["BlackBoard"];
                if(blackBoardArr != null && blackBoardArr != undefined && blackBoardArr.length > 0) {
                    if(blackBoardArr[blackBoardArr.length - 1].name == "BlackBoard") {
                        eventObjectDefine.CoreController.dispatchEvent({
                            type:'receive-msglist-BlackBoard' ,
                            source:'room-msglist' ,
                            message:blackBoardArr[blackBoardArr.length - 1]
                        });
                    }
                }
                tmpSignallingData["BlackBoard"] = null;

                /*新小白板数据*/
                let NewblackBoardArr = tmpSignallingData["BlackBoard_new"];
                if(NewblackBoardArr != null && NewblackBoardArr != undefined && NewblackBoardArr.length > 0) {
                    if(NewblackBoardArr[NewblackBoardArr.length - 1].name == "BlackBoard_new") {
                        eventObjectDefine.CoreController.dispatchEvent({
                            type:'receive-msglist-NewBlackBoard' ,
                            source:'room-msglist' ,
                            message:NewblackBoardArr[NewblackBoardArr.length - 1]
                        });
                    }
                }
                tmpSignallingData["BlackBoard_new"] = null;

                /*用户是否有有小白板*/
                let UserHasNewBlackBoardArr = tmpSignallingData["UserHasNewBlackBoard"];
                if(UserHasNewBlackBoardArr != null && UserHasNewBlackBoardArr != undefined && UserHasNewBlackBoardArr.length > 0) {
                    if(UserHasNewBlackBoardArr[UserHasNewBlackBoardArr.length - 1].name == "UserHasNewBlackBoard") {
                        eventObjectDefine.CoreController.dispatchEvent({
                            type:'receive-msglist-UserHasNewBlackBoard' ,
                            source:'room-msglist' ,
                            message:UserHasNewBlackBoardArr
                        });
                    }
                }
                tmpSignallingData["UserHasNewBlackBoard"] = null;

                /*小白板拖拽的动作*/
                let BlackBoardDragArr = tmpSignallingData["BlackBoardDrag"];
                if (BlackBoardDragArr !== null && BlackBoardDragArr !== undefined && BlackBoardDragArr.length > 0) {
                    eventObjectDefine.CoreController.dispatchEvent({
                        type: 'receive-msglist-BlackBoardDrag',
                        message: {BlackBoardDragArray: BlackBoardDragArr}
                    });
                }
                tmpSignallingData["BlackBoardDrag"] = null;

                //最后打开的文档文件和媒体文件
                let showPageArr = tmpSignallingData["ShowPage"];
                if( source === 'roomPubmsg' && !( showPageArr !== null && showPageArr !== undefined && showPageArr.length > 0 ) && !TkGlobal.playback ) { //没有ShowPage则打开默认文档
                    L.Logger.debug('openDefaultDoucmentFile info:' , TkGlobal.defaultFileInfo );
                    let fileid = TkGlobal.defaultFileInfo.fileid ;
                    ServiceRoom.getTkWhiteBoardManager().changeDocument( fileid ); //打开默认文档
                };
                tmpSignallingData["ShowPage"] = null;

                /*全体禁言*/
                let EveryoneBanChatArr = tmpSignallingData["EveryoneBanChat"];
                if(EveryoneBanChatArr != null && EveryoneBanChatArr != undefined && EveryoneBanChatArr.length > 0) {
                    if(EveryoneBanChatArr[EveryoneBanChatArr.length - 1].name == "EveryoneBanChat") {
                        const user = ServiceRoom.getTkRoom().getMySelf();
                        if(!user){ L.Logger.error('user is not exist , userid is '+user.id+'!'); return;}
                        if(user.role === TkConstant.role.roleStudent ){
                            let data = {
                                disablechat:true,
                            };
                            ServiceSignalling.setParticipantPropertyToAll(user.id, data);
                        }
                        eventObjectDefine.CoreController.dispatchEvent({
                            type:'receive-msglist-EveryoneBanChat' ,
                            source:'room-msglist' ,
                            message:{ EveryoneBanChatArr:EveryoneBanChatArr }
                        });
                    }
                };
                tmpSignallingData["EveryoneBanChatArr"] = null;


                /*切换布局 */
                let SwitchLayoutArr = tmpSignallingData["switchLayout"];
                if(SwitchLayoutArr != null && SwitchLayoutArr != undefined && SwitchLayoutArr.length > 0) {
                    if(SwitchLayoutArr[SwitchLayoutArr.length - 1].name == "switchLayout") {
                        eventObjectDefine.CoreController.dispatchEvent({
                            type:'receive-msglist-SwitchLayout' ,
                            source:'room-msglist' ,
                            message:SwitchLayoutArr[0].data
                        });
                    }
                };
                tmpSignallingData["SwitchLayoutArr"] = null;

                //双击视频同步
                let doubleClickVideoArr = tmpSignallingData["doubleClickVideo"];
                if(doubleClickVideoArr != null && doubleClickVideoArr != undefined && doubleClickVideoArr.length > 0) {
                    if(doubleClickVideoArr[doubleClickVideoArr.length - 1].name == "doubleClickVideo") {
                        eventObjectDefine.CoreController.dispatchEvent({
                            type:'receive-msglist-doubleClickVideo' ,
                            source:'room-msglist' ,
                            message:doubleClickVideoArr[0].data
                        });
                    }
                };
                tmpSignallingData["doubleClickVideoArr"] = null;


                if( source === 'roomPubmsg' && TkConstant.hasRole.roleChairman && !TkGlobal.isStartRtml && TkGlobal.classBegin){
                    this.rtmpStartBroadcast();
                }

                TkGlobal.isHandleMsglistFromRoomPubmsg = true;
            }
        };

        let ignoreSignallingJson = {} ;
        _msglistInner(signallingMessageList , source , ignoreSignallingJson);
        return true ;
    } ;

    /*自动发布音视频*/
    _autoPublishAV(){
          if( (TkConstant.joinRoomInfo.autoStartAV || TkConstant.hasRole.roleChairman ) &&  TkAppPermissions.getAppPermissions('autoPublishAV')  ) {
              let localUser = ServiceRoom.getTkRoom().getMySelf() ;
              let publishstate = localUser.hasvideo ?
                  (localUser.hasaudio ? TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH : TkConstant.PUBLISHSTATE.PUBLISH_STATE_VIDEOONLY ):
                  ( localUser.hasaudio ? TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY  : TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE ) ;//自动发布
              ServiceSignalling.changeUserPublish(localUser.id , TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE);
              if(TkGlobal.isOnlyAudioRoom){
                  ServiceSignalling.changeUserPublish(localUser.id , TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY);
              }else{
                  ServiceSignalling.changeUserPublish(localUser.id , publishstate);
              }
          }else{ //没有自动开启音视频的，则取消之前的发布
            //   if( ServiceRoom.getTkRoom().getMySelf().publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE){
                  ServiceSignalling.changeUserPublish( ServiceRoom.getTkRoom().getMySelf().id , TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE );
            //   }
          }
    };

    /*上课前自动发布音视频 ljh*/
    _BeforeClassAutoPublishAV(){
        if(TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleStudent ){
            const usersNum = ServiceRoom.getTkRoom().getUsers(); 
            if(usersNum>TkConstant.joinRoomInfo.maxvideo){
                return false;
            }
            if(!TkConstant.joinRoomInfo.isHasVideo){
                let localUser = ServiceRoom.getTkRoom().getMySelf() ;
                ServiceSignalling.changeUserPublish(localUser.id , TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY);
            }else{
                let localUser = ServiceRoom.getTkRoom().getMySelf() ;
                let publishstate = localUser.hasvideo ? (localUser.hasaudio ? TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH : TkConstant.PUBLISHSTATE.PUBLISH_STATE_VIDEOONLY ): ( localUser.hasaudio ? TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY  : TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE   ) ;//自动发布
                ServiceSignalling.changeUserPublish(localUser.id , publishstate);
            }
        }
    };

    /*保存登录地址到sessionStorage*/
    _saveAddressToSession(timestamp){
        if( TkConstant.joinRoomInfo &&  TkConstant.joinRoomInfo.thirdid  ){
            //将地址存入本地session,time为key值
            let time = timestamp ||  TkUtils.getUrlParams('timestamp' , window.location.href );
            let joinUrl = TkUtils.decrypt( TkConstant.joinRoomInfo.joinUrl ) ;
            let refresh_thirdid_index = joinUrl.indexOf('&refresh_thirdid') ;
            if( refresh_thirdid_index !== -1 ){
                joinUrl = joinUrl.substring(0 , refresh_thirdid_index);
            }
            joinUrl += ('&refresh_thirdid='+TkConstant.joinRoomInfo.thirdid) ;
            //L.Utils.sessionStorage.setItem("thirdid",TkConstant.joinRoomInfo.thirdid);
            L.Utils.sessionStorage.setItem(time, TkUtils.encrypt(joinUrl) );
        }
    };

    /*用户登录设备类型*/
    _userLoginDeviceType(){
    	if(TkGlobal.isClient){
    		if(TkGlobal.isMacClient){
    			return 'MacClient';
    		}else{
    			return "WindowClient" ;
    		}
    	}else if(TkGlobal.isMobile){
    		return "Mobile";
    	}else{
    		if(TkGlobal.osType=="Mac"){
    			return 'MacPC';
    		}else{
    			return "WindowPC" ;
    		}
    	}
    }

    /*上课之后的处理函数*/
    _classBeginStartHandler(pubmsgData){
        const that = this ;
        TkGlobal.classBeginTime = !TkUtils.isMillisecondClass( pubmsgData.ts ) ? pubmsgData.ts * 1000 : pubmsgData.ts ; //上课的时间
        TkGlobal.classBegin = true ;//已经上课
        
        ClassBroFunctions._teacherAloneAndCountDownAlert();
        // console.error(window.GLOBAL.isClassBegin);
        // if(!document.getElementsByClassName('videoing')[0]){
        //     let videoing = document.createElement('div');
        //     videoing.setAttribute('class','videoing');
        //     videoing.style.display = 'none';
        //     let videoimg = document.createElement('img');
        //     videoimg.setAttribute('src','https://classbro-oss.oss-cn-hongkong.aliyuncs.com/statice-resource/20190319/cc438308d1064962b15e5a9ec1a11339.png')
        //     videoing.appendChild(videoimg);
        //     document.getElementsByTagName('body')[0].appendChild(videoing);
        // }
        
        if(window.GLOBAL.classBegin == true){
            document.getElementsByClassName('videoing')[0].style.display = 'block';
        }
        

        ServiceRoom.getTkWhiteBoardManager().changeWhiteBoardConfigration({ //改变主白板配置项（上课后）
            mediaShareToID:"__all" , //上课，媒体文件共享给所有人
            synchronization:TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant?true:ServiceRoom.getTkRoom().getMySelf().candraw, //是否同步给其它用户,上课同步
            addPage:TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant, //加页权限，默认true(注：加页权限和翻页权限同时为true时才能加页)
            pptVolumeSynchronization:TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant, //PPT音量是否同步
        });
        let roleHasDefalutAppPermissionsJson =  RoleHandler.getRoleHasDefalutAppPermissions();
        TkAppPermissions.initAppPermissions(roleHasDefalutAppPermissionsJson);
        ServiceTools.stopAllMediaShare(true); //取消自己发布的所有媒体流
        that._autoPublishAV();  //自动发布音视频
        if( (TkConstant.joinRoomInfo.isSupportCandraw && TkConstant.hasRoomtype.oneToOne && TkConstant.hasRole.roleStudent) || (TkConstant.joinRoomInfo.isSupportCandraw && ( !TkConstant.hasRoomtype.oneToOne && TkGlobal.roomChange ) && TkConstant.hasRole.roleStudent) ){ //1对1,根据配置项决定是否给予画笔权限(学生)
            if( !ServiceRoom.getTkRoom().getMySelf().candraw && ServiceRoom.getTkRoom().getMySelf().publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE ){
                ServiceSignalling.setParticipantPropertyToAll( ServiceRoom.getTkRoom().getMySelf().id , {candraw:!ServiceRoom.getTkRoom().getMySelf().candraw} );
            }else{
                if( ServiceRoom.getTkRoom().getMySelf().candraw !== CoreController.handler.getAppPermissions('canDraw') ){
                    CoreController.handler.setAppPermissions('canDraw' , ServiceRoom.getTkRoom().getMySelf().candraw ) ;
                }
            }
        }else{
            if( ServiceRoom.getTkRoom().getMySelf().candraw !== CoreController.handler.getAppPermissions('canDraw') ){
                ServiceSignalling.setParticipantPropertyToAll( ServiceRoom.getTkRoom().getMySelf().id , {candraw:CoreController.handler.getAppPermissions('canDraw') } );
            }
        }
    };

    /*下课之后的处理函数*/
    _classBeginEndHandler(delmsgData){
        let that = this;
        TkGlobal.classBegin = false; //下课状态
        TkGlobal.endClassBegin = true ; //已经下课
        window.GLOBAL.isClassBegin = false;
        // if(window.GLOBAL.isClassBegin == false){
        document.getElementsByClassName('videoing')[0].style.display = 'none';
        // }
        // that._classBeginStartHandler().clearInterval(this.timer2);
        let isDispatchEvent_endClassbeginShowLocalStream = false ;
        ServiceRoom.getTkWhiteBoardManager().useWhiteboardTool('tool_mouse');
        ServiceRoom.getTkWhiteBoardManager().changeWhiteBoardConfigration({ //改变主白板配置项（下课后）
            mediaShareToID:undefined , //下课，媒体文件不共享给所有人
            synchronization:false , //是否同步给其它用户,上课同步
            addPage:false , //加页权限，默认true(注：加页权限和翻页权限同时为true时才能加页)
            pptVolumeSynchronization:false, //PPT音量是否同步
        });
        if(ServiceRoom.getTkRoom().getMySelf().pointerstate){
            ServiceSignalling.setParticipantPropertyToAll(ServiceRoom.getTkRoom().getMySelf().id,{pointerstate: false});
        }
        if(TkConstant.joinRoomInfo.isBeforeClassReleaseVideo && !TkConstant.joinRoomInfo.isClassOverNotLeave && TkConstant.hasRole.roleChairman ){ //上课前发布音视频，并且下课后离开
            if( ServiceRoom.getTkRoom().getMySelf().publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH ){
                ServiceSignalling.changeUserPublish(ServiceRoom.getTkRoom().getMySelf().id , TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH); //改变用户的发布状态
            }
        }
        if(  !( TkConstant.joinRoomInfo.isClassOverNotLeave || ( !TkConstant.joinRoomInfo.isClassOverNotLeave && TkConstant.joinRoomInfo.isBeforeClassReleaseVideo )  ) ){ //下课后不离开教室或者下课后离开教室且上课前发布音视频保持现状
            if( ServiceRoom.getTkRoom().getMySelf().publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE){ //用户的发布状态不是下台
                ServiceSignalling.changeUserPublish(ServiceRoom.getTkRoom().getMySelf().id , TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE); //改变用户的发布状态
            }
        }
        let roleHasDefalutAppPermissionsJson =  RoleHandler.getRoleHasDefalutAppPermissions();
        TkAppPermissions.initAppPermissions(roleHasDefalutAppPermissionsJson);

        if( TkConstant.joinRoomInfo.hiddenClassBegin ){ //隐藏上下课就离开教室
            ServiceRoom.getTkRoom().leaveroom(true);
            isDispatchEvent_endClassbeginShowLocalStream = false ;
            setTimeout(()=>{
                ServiceRoom.getTkRoom().uninit();
            },300);
        }else{
            if( TkConstant.joinRoomInfo.isClassOverNotLeave ){ //下课后不离开教室
                ServiceTools.stopAllMediaShare(true);
                if(TkConstant.hasRole.roleStudent && ServiceRoom.getTkRoom().getMySelf().candraw !== false){
                    ServiceSignalling.setParticipantPropertyToAll(ServiceRoom.getTkRoom().getMySelf().id , {candraw:false});
                }
                eventObjectDefine.CoreController.dispatchEvent({type:'revertToStartupLayout_endClassbegin'}); //触发下课恢复原始界面的事件
                isDispatchEvent_endClassbeginShowLocalStream = true ;
            }else{
                if( !TkConstant.hasRole.roleChairman ){ //不是老师就离开教室，否则恢复页面能再次上课
                    ServiceRoom.getTkRoom().leaveroom(true);
                    isDispatchEvent_endClassbeginShowLocalStream = false ;
                    setTimeout(()=>{
                        ServiceRoom.getTkRoom().uninit();
                    },300);
                }else{
                    ServiceTools.stopAllMediaShare(true);
                    ServiceSignalling.delmsgTo__AllAll();//老师调用清除所有信令消息
                    eventObjectDefine.CoreController.dispatchEvent({type:'revertToStartupLayout_endClassbegin'}); //触发下课恢复原始界面的事件
                    isDispatchEvent_endClassbeginShowLocalStream = true ;
                }
            }
        }
        return isDispatchEvent_endClassbeginShowLocalStream ;
    };

    /*处理checkroom或者nitPlaybackInfo*/
    _handlerCheckroomOrInitPlaybackInfo(ret, roominfo){
        if (ret != 0) {
            L.Logger.error('checkroom error', ret);
            switch(ret) {
                case -1:
                    ServiceTooltip.showError(TkGlobal.language.languageData.alertWin.login.func.checkMeeting.status_minus_1.text);
                    break;
                case 3001:
                    ServiceTooltip.showError(TkGlobal.language.languageData.alertWin.login.func.checkMeeting.status_3001.text);
                    break;
                case 3002:
                    ServiceTooltip.showError(TkGlobal.language.languageData.alertWin.login.func.checkMeeting.status_3002.text);
                    break;
                case 3003:
                    ServiceTooltip.showError(TkGlobal.language.languageData.alertWin.login.func.checkMeeting.status_3003.text);
                    break;
                case 4007:
                    ServiceTooltip.showError(TkGlobal.language.languageData.alertWin.login.func.checkMeeting.status_4007.text);
                    break;
                case 4008:
                    ServiceTooltip.showError(TkGlobal.language.languageData.alertWin.login.func.checkMeeting.status_4008.text);
                    break;
                case 4110:
                    ServiceTooltip.showError(TkGlobal.language.languageData.alertWin.login.func.checkMeeting.status_4110.text);
                    break;
                case 4109:
                    ServiceTooltip.showError(TkGlobal.language.languageData.alertWin.login.func.checkMeeting.status_4109.text);
                    break;
                case 4103:
                    ServiceTooltip.showError(TkGlobal.language.languageData.alertWin.login.func.checkMeeting.status_4103.text);
                    break;
                case 4112:
                    ServiceTooltip.showError(TkGlobal.language.languageData.alertWin.login.func.checkMeeting.status_4112.text);
                    break;
                default:
                    ServiceTooltip.showError(TkGlobal.language.languageData.alertWin.login.func.checkMeeting.status_defalut.text);
                    break;
            }
        } else {
            L.Logger.debug('checkroom  roominfo:' , roominfo);
            let href =   TkUtils.decrypt( TkConstant.SERVICEINFO.joinUrl)  || window.location.href;
            let chairmancontrol = ServiceRoom.getTkRoom().getRoomProperties().chairmancontrol ;
            let template = undefined ;
            let skin = undefined ;
            if( TkGlobal.playback ){
                if(TK.SDKTYPE === 'mobile' && TK.global && TK.global.fakeJsSdkInitInfo.mobileInfo.clientType !== undefined ){
                    if(roominfo.skins && typeof roominfo.skins[TK.global.fakeJsSdkInitInfo.mobileInfo.clientType] === 'object' ){
                        template = roominfo.skins[TK.global.fakeJsSdkInitInfo.mobileInfo.clientType].tplId ;
                        skin = roominfo.skins[TK.global.fakeJsSdkInitInfo.mobileInfo.clientType].skinId ;
                    }
                }else{
                    if(roominfo.skins && typeof roominfo.skins.pc === 'object' ){
                        template = roominfo.skins.pc.tplId ;
                        if(roominfo.room.colourid === '0'){
                            skin = roominfo.skins.pc.skinId ;
                        }else{
                            skin = roominfo.room.colourid ;
                        }
                    }
                }
            }else{
                if( roominfo.room && typeof roominfo.room === 'object' ){
                    template = roominfo.room.tplId ;
                    if(roominfo.room.colourid === '0'){
                        skin = roominfo.room.skinId ;
                    }else{
                        skin = roominfo.room.colourid ;
                    }
                }
            }
            if(TkGlobal.playback && !skin){
                TkConstant.layout = 'layout_3';
                const layoutParams = {
                    'layout_1': 'CoursewareDown',
                    // 'layout_1':'Encompassment',
                    'layout_2': 'VideoDown',
                    'layout_3': 'Encompassment',
                    'layout_4': 'Bilateral',
                    'layout_5': 'MorePeople',
                }
                eventObjectDefine.CoreController.dispatchEvent({type:"SwitchLayout",nowLayout:layoutParams[TkConstant.layout]})  //派发切换布局事件
                skin = 'purple';
            }
            let RoomVideoObj = ServiceRoom.getTkRoom().getVideoProfile()
            let joinRoomInfo = {
                starttime : ServiceRoom.getTkRoom().getRoomProperties().starttime,
                endtime : ServiceRoom.getTkRoom().getRoomProperties().endtime,
                nickname:ServiceRoom.getTkRoom().getMySelf().nickname,
                thirdid: ServiceRoom.getTkRoom().getMySelf().id ,
                joinUrl: TkUtils.encrypt( href ) ,
                serial: ServiceRoom.getTkRoom().getRoomProperties().serial,
                roomrole: Number(ServiceRoom.getTkRoom().getMySelf().role),
                roomtype: Number(ServiceRoom.getTkRoom().getRoomProperties().roomtype),
                companyid:Number( ServiceRoom.getTkRoom().getRoomProperties().companyid ),
                maxvideo:Number( ServiceRoom.getTkRoom().getRoomProperties().maxvideo ), //最大视频数 Number( ServiceRoom.getTkRoom().getRoomProperties().maxvideo )
                isLivebypass:ServiceRoom.getTkRoom().getRoomProperties().livebypass !== undefined && ServiceRoom.getTkRoom().getRoomProperties().livebypass !== null ? Number( ServiceRoom.getTkRoom().getRoomProperties().livebypass ) === 1 : false ,
                autoStartAV:!TkGlobal.playback &&  (chairmancontrol? Number(chairmancontrol.substr(23, 1) ) === 1 : false) , //自动发布音视频
                autoClassBegin:!TkGlobal.playback && (chairmancontrol?  Number(chairmancontrol.substr(32, 1) ) === 1 : false) , //自动上课
                studentCloseMyseftAV:!TkGlobal.playback &&  (chairmancontrol? Number(chairmancontrol.substr(33, 1) ) === 1 :false), //学生能否关闭自己音视频
                hiddenClassBegin:!TkGlobal.playback &&  (chairmancontrol? Number(chairmancontrol.substr(34, 1) ) === 1 : false) , //隐藏上下课
                isUploadH5Document:!TkGlobal.playback &&  chairmancontrol? Number(chairmancontrol.substr(35, 1) ) === 1 : false , //是否上传H5课件           //xgd 17-09-14
                // assistantOpenMyseftAV:!TkGlobal.playback &&  chairmancontrol? Number(chairmancontrol.substr(36, 1) ) === 1 : false , //助教是否开启音视频   //xgd 17-09-14
                assistantOpenMyseftAV: chairmancontrol? Number(chairmancontrol.substr(36, 1) ) === 1 : false , //助教是否开启音视频   //xgd 17-09-14
                isSupportCandraw:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(37, 1) ) === 1 : false , //是否支持上课就拥有画笔权限
                isSupportPageTrun:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(38, 1) ) === 1 : false , //是否支持学生未授权就可以文档翻页
                isShowTheAnswer:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(42, 1) ) === 1 : false , //答题卡结束是否公布答案  ljh
                hasCoursewareRemarks:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(43, 1) ) === 1 : false , //是否有课件备注
                isDoubleScreenDisplay:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(39, 1) ) === 1 : false , //是否允许双屏显示  ljh
                isBeforeClassReleaseVideo:!TkGlobal.playback &&chairmancontrol? Number(chairmancontrol.substr(41, 1) ) === 1 : false , //:上课前是否发布音视频  ljh
                isClassOverNotLeave:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(47, 1) ) === 1 : false , //:下课不离开教室  ljh
                videoWhiteboardDraw: !TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(48, 1) ) === 1 : false , //视频标注
                localRecord:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(49, 1) ) === 1 : false , //本地录制
                videoInFullScreen:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(50, 1) ) === 1 : false , //课件或MP4全屏后video放置右下角(课件全屏同步)
                pictureInPicture:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(51, 1) ) === 1 : false , //视频全屏后采用画中画配置
                pauseWhenOver:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(52, 1) ) === 1 : false , //MP4播放结束后，停止在最后一帧，并且不自动关闭视频播放器
                classBeginEndCloseClient:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(54, 1) ) === 1 : false  , //下课后关闭客户端
                chatSendImg:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(53, 1) ) === 1 : false  , //聊天发送图片
                isDocumentClassification:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(56, 1) ) === 1 : false  , //文档是否按照文件夹区分
                brushName:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(58, 1) ) === 1 : false ,//画笔落笔显示名字
				hasCaptureImg:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(59, 1) ) === 1 : false  , //是否有截屏
                pushflow:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(60, 1) ) === 1 : false ,//rtmp推流是否配置
                qrCode:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(69, 1) ) === 1 : false ,//二维码拍照上传
                shapeUndoRedoClear:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(68, 1) ) === 1 : false ,//学生撤销、恢复、删除配置
                isMoviesShare: chairmancontrol? Number(chairmancontrol.substr(70, 1) ) === 1 : false ,//播放本地媒体文件(电影共享)配置
                isDoubleShare: chairmancontrol? Number(chairmancontrol.substr(72, 1) ) === 1 : false ,//双向共享
                endOfClassHoursIsClassOver:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(71, 1) ) === 1 : false ,//按下课时间结束课堂
                customTrophysVoice: chairmancontrol? Number(chairmancontrol.substr(44, 1) ) === 1 : false ,//自定义奖杯声音
                pointerReminder: chairmancontrol? Number(chairmancontrol.substr(73, 1) ) === 1 : false ,//教鞭
                areaExchange:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(74, 1) ) === 1 : false ,//本地区域交换
                tourCancelBtn:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(78, 1) ) === 1 : false ,//巡课取消点击下课
                isHasVideo:chairmancontrol? Number(chairmancontrol.substr(1, 1) ) === 1 : false ,//是否有视频，用来判断该房间是否是纯音频房间
				customWhiteboardBackground:chairmancontrol? Number(chairmancontrol.substr(81, 1) ) === 1 : false ,//自定义白板底色
                createOnlyAudioRoom:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(80, 1) ) === 1 : false ,//建立纯音频房间
                isConfigVideoMirror:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(55, 1) ) === 1 : false ,//视频镜像
                sharedMouseLocus:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(97, 1) ) === 1 : false , //共享鼠标轨迹
                preLoading:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(102, 1) ) === 1 : false,//文件预加载
                toolBox:{
                    answer:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(61, 1) ) === 1 : false ,//答题器
                    turnplate:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(62, 1) ) === 1 : false ,//转盘
                    timer:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(63, 1) ) === 1 : false ,//计时器
                    responder:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(64, 1) ) === 1 : false ,//抢答器
                    moreBlackboard:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(65, 1) ) === 1 : false ,//小白板
                    destTopShare:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(66, 1) ) === 1 : false ,//屏幕共享
                },
                isHandsUpOnStage:true , //上台后是否允许举手 /*isHandsUpOnStage:chairmancontrol? Number(chairmancontrol.substr(40, 1) ) == 1 : false , //上台后是否允许举手  ljh  产品要求先注释掉，默认写成固定值*/
                pptpagingoptions: !TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(112, 1) ) === 1 : false, //动态PPT文档时，学生端隐藏翻页按钮
                mouseoptions: !TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(113, 1) ) === 1 : false, //是否不显示涂鸦工具无鼠标 
                shapeoptions: !TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(114, 1) ) === 1 : false, //是否不显示工具无形状工具 
                fontoptions: !TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(115, 1) ) === 1 : false, //是否不显示无字体字号的选择，仅可选择颜色
                VideosSequence:!TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(116, 1) ) === 1 : false,//各成员看到的学生视频顺序一致
                networkstate: !TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(117, 1) ) === 1 : false, //是否不显示网络状态     
                issearchwrapper: !TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(118, 1) ) === 1 : false, //是否不显示花名册搜索框
                isJapaneseTranslate: !TkGlobal.playback && chairmancontrol? Number(chairmancontrol.substr(122, 1) ) === 1 : false, //是否开启中日翻译
                isJoinRoomTip: !TkGlobal.playback && chairmancontrol ? Number(chairmancontrol.substr(90, 1)) === 1 : false, //助教进教室不提醒
                jumpurl:TkGlobal.playback?'':TkUtils.getUrlParams("jumpurl"), //跳转地址
                roomname:ServiceRoom.getTkRoom().getRoomProperties().roomname, //房间名字
                pullConfigure:ServiceRoom.getTkRoom().getRoomProperties().pullConfigure , //拉流配置
                pushConfigure:ServiceRoom.getTkRoom().getRoomProperties().pushConfigure, //推流配置
                pushUrl:ServiceRoom.getTkRoom().getRoomProperties().pullid,//目前为空
                helpcallbackurl:roominfo.helpcallbackurl,
                classRoomLogoUrl: roominfo.room.classroomlogo ?  roominfo.room.classroomlogo : undefined,
                whiteboardcolor:TkGlobal.playback ?( //XXX 这里默认值是1合适吗？
                    ServiceRoom.getTkRoom().getRoomProperties().whiteboardcolor !== undefined ? ( Number( ServiceRoom.getTkRoom().getRoomProperties().whiteboardcolor) - 1 ) : 0
                ):(
                    roominfo.room.whiteboardcolor !== undefined ? ( Number(roominfo.room.whiteboardcolor) - 1 ) : 0
                ), //白板颜色
                template: TkConstant.testTemplate ? TkConstant.testTemplate :( template && !/^\d*$/g.test(template) ?  'template_'+template : TkConstant.template ) , //模板
                skin: TkConstant.testSkin ? TkConstant.testSkin :( skin && !/^\d*$/g.test(skin) ?  'skin_'+skin : TkConstant.skin ) , //皮肤
                localRecordInfo:{ //本地录制信息
                    recorduploadaddr:ServiceRoom.getTkRoom().getRoomProperties().recorduploadaddr , //本地录制文件上传地址 TODO 暂时用不到
                    localrecordtype:ServiceRoom.getTkRoom().getRoomProperties().localrecordtype , //本地录制的类型
                },
                foregroundpic:ServiceRoom.getTkRoom().getRoomProperties().foregroundpic , //视频前景图
                voicefileUrl:ServiceRoom.getTkRoom().getRoomProperties().voicefile , //自定义奖杯声音
                customTrophys:ServiceRoom.getTkRoom().getRoomProperties().trophy ? ServiceRoom.getTkRoom().getRoomProperties().trophy: undefined ,//自定义多钟奖杯
                pushflowaddr:ServiceRoom.getTkRoom().getRoomProperties().pushflowaddr ? ServiceRoom.getTkRoom().getRoomProperties().pushflowaddr: undefined , //rtmp推流地址
                roomVideoWidth:RoomVideoObj.width , //房间视频的宽度
                roomVideoHeight:RoomVideoObj.height  , //房间视频的高度
            };
            // Object.customAssign(joinRoomInfo , { //todo 测试数据
            // });
            if(joinRoomInfo.isLivebypass && TkGlobal.isClient && TkConstant.joinRoomInfo.pushflowaddr){ //todo 旁路直播且客户端，则不启用桌面共享
                joinRoomInfo.toolBox.destTopShare = false ;
            }
            if( (joinRoomInfo.roomtype === TkConstant.ROOMTYPE.oneToOne && (chairmancontrol? Number(chairmancontrol.substr(36, 1) ) === 1 : false) )   ){ //todo 如果是1对1且助教允许上台，则进行数据串改，串改为1对多
                joinRoomInfo.roomtype = 3 ;
                TkGlobal.roomChange=true;
            }
            ServiceRoom.setRoomName(ServiceRoom.getTkRoom().getRoomProperties().roomname);
            ServiceRoom.setUserName(ServiceRoom.getTkRoom().getMySelf().nickname);
            ServiceRoom.setUserThirdid(ServiceRoom.getTkRoom().getMySelf().id);
            document.head.getElementsByTagName('title')[0].innerHTML = ServiceRoom.getRoomName(); //设置title为房间名字
            TkConstant.bindRoomInfoToTkConstant(joinRoomInfo); //绑定房间信息到TkConstant
            TkConstant.bindParticipantHasRoleToTkConstant(); //绑定当前登录对象事是否拥有指定角色到TkConstant
            TkConstant.bindParticipantHasRoomtypeToTkConstant(); //绑定当前登录对象事是否拥有指定教室到TkConstant
            // TkConstant.updateTemplate(joinRoomInfo.template);
            TkConstant.updateTemplate("template_beyond") // 写死模板
            TkConstant.updateSkin(joinRoomInfo.skin);
            TkGlobal.videoScale = TkConstant.joinRoomInfo.roomVideoWidth / TkConstant.joinRoomInfo.roomVideoHeight  ;  //视频比例
            if( TkGlobal.isClient && !TkGlobal.isMacClient && ServiceRoom.getNativeInterface() ){
                ServiceRoom.getNativeInterface().getMonitorCount((moinitorCount) => { //多屏幕 bobo的 判断是否有企业配置项并且是否多屏幕
                    if (moinitorCount >1 && TkConstant.joinRoomInfo.isDoubleScreenDisplay) {
                        TkGlobal.doubleScreen = true;
                        ServiceRoom.getNativeInterface().enableViceMonitor(); //启用副显示屏（启用双屏模式）
                    }
                });
            }

            TkGlobal.showShapeAuthor = TkConstant.joinRoomInfo.brushName && !TkGlobal.playback;

            ServiceRoom.getTkWhiteBoardManager().changeWhiteBoardConfigration({ //改变主白板配置项（checkroom完成修改相关配置项）
                mediaSharePauseWhenOver: TkConstant.joinRoomInfo.pauseWhenOver , //是否播放结束暂停不自动关闭
                isLoadDocumentRemark:TkConstant.joinRoomInfo.hasCoursewareRemarks ,  //是否加载课件备注
                canRemark:TkConstant.joinRoomInfo.hasCoursewareRemarks ,  //获取课件备注权限
                showShapeAuthor:TkGlobal.showShapeAuthor , //是否显示画笔的操作者name，默认false
                isOnlyUndoRedoClearMyselfShape:TkConstant.hasRole.roleStudent && TkConstant.joinRoomInfo.shapeUndoRedoClear , //是否只撤销、恢复、清除自己的画笔,默认false
                documentToolBarConfig:{
                    isLoadRemark:TkConstant.joinRoomInfo.hasCoursewareRemarks ,  //是否加载文档备注,翻页工具上
                },
                whiteboardToolBarConfig:{
                    loadWhiteboardTools:{//加载白板标注工具集合
                        laser:TkConstant.hasRole.roleChairman , //激光笔
                        clear:TkConstant.hasRole.roleChairman  || ( (TkConstant.hasRole.roleStudent || TkConstant.hasRole.roleTeachingAssistant) && TkConstant.joinRoomInfo.shapeUndoRedoClear ) , //清除
                        undo:TkConstant.hasRole.roleChairman  || ( (TkConstant.hasRole.roleStudent || TkConstant.hasRole.roleTeachingAssistant) && TkConstant.joinRoomInfo.shapeUndoRedoClear ) , //撤销操作
                        redo:TkConstant.hasRole.roleChairman  || ( (TkConstant.hasRole.roleStudent || TkConstant.hasRole.roleTeachingAssistant) && TkConstant.joinRoomInfo.shapeUndoRedoClear ) , //恢复操作
                    }
                }
            });
            if(!TkGlobal.playback){
                /*跳转call*/
                let timestamp = new Date().getTime() ;
                this._saveAddressToSession(timestamp);/!*保存登录地址到sessionStorage*!/

                window.location.hash = 'call?timestamp='+ timestamp+'&tplId='+( TkConstant.template.replace(/template_/g , '') )+'&skinId='+( TkConstant.skin.replace(/skin_/g , '') ) ;

            }
        }
    };

    /*rtmp 推流*/
    rtmpStartBroadcast(){
        if(TkGlobal.isClient && TkConstant.hasRole.roleChairman && (TkConstant.joinRoomInfo.pushflow || TkConstant.joinRoomInfo.isLivebypass) && TkConstant.joinRoomInfo.pushflowaddr){
            TkGlobal.isStartRtml = true;
            let {wsSecret,wsTime} =  TkUtils.createBurglarChain('/live'+TkConstant.joinRoomInfo.pushflowaddr.split("live")[1], TkGlobal.serviceTime / 1000 );
            console.info( 'rtmp TkUtils.createBurglarChain resulut wsTime  is  '+ wsTime );
            let liveUrl = TkConstant.joinRoomInfo.pushflowaddr + '?wsSecret='+ wsSecret + '&wsTime=' + wsTime;
            // ServiceRoom.getNativeInterface().initBroadcast(TkConstant.joinRoomInfo.pushflowaddr,10,2,1920,1080);
            ServiceRoom.getNativeInterface().initBroadcast(liveUrl,10,2,1920,1080);
            let eid='';
            if(TkGlobal.rtmpStream && TkGlobal.rtmpStream.destroy){
                TkGlobal.rtmpStream.destroy();
                TkGlobal.rtmpStream = undefined ;
            }

            // if(TkConstant.joinRoomInfo.isLivebypass){
            //     eid = ServiceRoom.getTkRoom().getMySelf().id
            //     TkGlobal.rtmpStream = ServiceRoom.getLocalStream();
            // }else if(TkConstant.joinRoomInfo.pushflow){
                eid = ServiceRoom.getTkRoom().getMySelf().id + ":screen";
                TkGlobal.rtmpStream = TK.Stream({
                    audio: true,
                    video: true,
                    screen: true,
                    data: false,
                    extensionId: eid,
                    attributes: {type: 'screen'},
                },true);
            // }
            TkGlobal.rtmpStream.create();
            ServiceRoom.getNativeInterface().startBroadcast(eid);
        }
    }

    /*停止rtmp推流*/
    rtmpStopBroadcast(){
        if(TkGlobal.isClient && TkConstant.hasRole.roleChairman && (TkConstant.joinRoomInfo.pushflow ||  TkConstant.joinRoomInfo.isLivebypass) && TkConstant.joinRoomInfo.pushflowaddr){
            ServiceRoom.getNativeInterface().stopBroadcast();
            ServiceRoom.getNativeInterface().uninitBroadcast();
            if(TkGlobal.rtmpStream && TkGlobal.rtmpStream.destroy){
                TkGlobal.rtmpStream.destroy();
                TkGlobal.rtmpStream = undefined ;
            }
        }
    }

     /*比较文档服务器，切换cdn*/
    _compareDocServerSpeedSwitchCND(){
        const _getLocalStorageItem = (  key , callback )=>{
            if( typeof callback === 'function' ){
                if( TK.SDKTYPE === 'mobile' ){
                    if( ServiceRoom.getTkRoom() && typeof ServiceRoom.getTkRoom().getLocalStorageItem === 'function' ){
                        try{
                            ServiceRoom.getTkRoom().getLocalStorageItem( key  , (docAddressKey) => {
                                callback( docAddressKey );
                            }) ;
                        }catch (e){
                            L.Logger.error('getLocalStorageItem error:' , e);
                            callback( '' );
                        }
                    }
                }else{
                    callback( L.Utils.localStorage.getItem("tkDocAddressKey") );
                }
            }
        };
        _getLocalStorageItem( 'tkDocAddressKey' , ( docAddressKey1 )=> {
            if (!docAddressKey1) {// 如果本地存储没有 tkDocAddressKey，需要执行自动优选cdn
                let backupDocAddressDelayTimer = undefined;
                let nowIndex = 1;
                let allIp = [];
                let isSting = false;

                const _getCDNResponseTime = (cdnImgUrl, callback, index, item, main) => {
                    let response = {};
                    let start_time = new Date().getTime();
                    let imgSrc = cdnImgUrl + "/speed.bmp" + "?ts=" + start_time;
                    let testIMG = new Image();
                    testIMG.onload = function () {
                        let end_time = new Date().getTime();
                        response = {
                            code: 0,
                            loadingTime: main ? (end_time - start_time) - 50 : end_time - start_time,
                        };
                        typeof callback === 'function' && callback(response, index, item);
                    };
                    testIMG.onerror = function () {
                        response = {
                            code: -1,
                            loadingTime: undefined,
                        };
                        typeof callback === 'function' && callback(response, index, item);
                    };
                    testIMG.src = imgSrc;
                };

                const _switchCDN = (docAddressKey) => {
                    _getLocalStorageItem('tkDocAddressKey', (docAddressKey2) => {
                        if (!docAddressKey2) { //本地存储中没有存储文档服务器地址索引
                            if (docAddressKey !== window.WBGlobal.docAddressKey) {
                                //  自动选择线路不保存本地
                                ServiceRoom.getTkWhiteBoardManager().switchDocAddress(docAddressKey, false);
                                L.Logger.info('auto switch cdn , cdn key is '+ window.WBGlobal.docAddressKey + ', address is ' + window.WBGlobal.nowUseDocAddress);
                            }
                        }
                    });
                };

                let findId = (ary, findNum) => {
                    return ary.filter((item, index) => {
                        return (nowIndex - 1) * findNum <= index && index < nowIndex * findNum
                    });
                };

                let cdnConnect = (a, b, c) => {
                    return a + '://' + b + ':' + c;
                };

                let sortCDN = () => {
                    let allError = [], arySpeed = [];
                    findId(window.WBGlobal.docAddressList, 3).forEach((item, index) => {
                        _getCDNResponseTime(cdnConnect(item.protocol, item.hostname, item.port), (docResponse, _index, _item) => {
                            L.Logger.info('load backup document cdn  speed.bmp ,cdn address is '+cdnConnect(_item.protocol, _item.hostname, _item.port)+' , response is ' + L.Utils.toJsonStringify(docResponse));
                            if (docResponse.code === 0 && docResponse.loadingTime) { ///备份cdn文档服务器加载正常，失败则不切换
                                if (!isSting) {
                                    arySpeed.push({
                                        hostname: _item.hostname,
                                        speed: docResponse.loadingTime
                                    });
                                    clearTimeout(backupDocAddressDelayTimer);
                                    backupDocAddressDelayTimer = setTimeout(() => {
                                        if (arySpeed.length > 1) {
                                            let quick = arySpeed.sort((a, b) => {
                                                return a.speed - b.speed
                                            });
                                            _switchCDN(quick[0].hostname);
                                        } else {
                                            _switchCDN(_item.hostname);
                                        }
                                        isSting = true
                                    }, 100);
                                }
                            } else {
                                allError.push(1);
                                allIp.push(1);
                            }
                            if (allIp.length === window.WBGlobal.docAddressList.length) {
                                _switchCDN(window.WBGlobal.docAddressList[0].hostname)
                            } else {
                                if (allError.length === 3) {
                                    sortCDN();
                                }
                            }
                        }, index, item, (nowIndex === 1 && index === 0) ? true : false)
                    });
                    nowIndex += 1;
                };
                sortCDN();
            }
        } );
    }

};


const  RoomHandlerInstance = new RoomHandler() ;
//RoomHandlerInstance.addEventListenerToRoomHandler();
export default RoomHandlerInstance ;
