/**
 * 检测设备-检测主界面的Smart组件(远程控制)
 * @module RemoteControlDetectionDeviceSmart
 * @description   提供检测设备-检测主界面的Smart组件(远程控制)
 * @author QiuShao
 * @date 2017/11/26
 */
'use strict';
import React from 'react';
import TkGlobal from 'TkGlobal';
import eventObjectDefine from 'eventObjectDefine';
import ServiceRoom from 'ServiceRoom' ;
import ServiceSignalling from 'ServiceSignalling' ;
import TkSliderDumb from "TkSliderDumb" ;
import SelectDumb from 'SelectDumb';

class RemoteControlDetectionDeviceSmart extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            updateState:false ,
            show:false ,
            loading:false ,
            loadShowOptionJson:{
                userAreaSelection:false ,
                deviceManagement:false ,
                userAreaAndDeviceManagement: false
            },
            // titleText:undefined ,
            titleText:{
                title: undefined,
                userName: undefined,
            } ,
            devicesDesc:{
                videoinput:{},
                audioinput:{},
                audiooutput:{}
            },
            selectDevice:{
                videoinput: undefined,
                audioinput: undefined,
                audiooutput: undefined
            },
            hasDetection:{
                videoinput: false,
                audioinput: false,
                audiooutput: false,
            },
            //xueln 添加
            isClient:TkGlobal.isClient,
            serverlist:{},
            audiooutputVolume:100,
        };
        this.backupServerList = {} ;
        this.backupDeviceInfo = {} ;
        this.oldUseServerName = '';
        this.useServerName = '';
        this.selectDevice = {
            videoinput: undefined,
            audioinput: undefined,
            audiooutput: undefined
        };
        this.deviceLabelMap = {
            videoinput:{
                default:TkGlobal.language.languageData.alertWin.settingWin.default.text ,
                defaultLabel:TkGlobal.language.languageData.alertWin.settingWin.videoInput.text ,
                notDevice:TkGlobal.language.languageData.login.language.detection.selectOption.noCam
            },
            audioinput:{
                default:TkGlobal.language.languageData.alertWin.settingWin.default.text ,
                defaultLabel:TkGlobal.language.languageData.alertWin.settingWin.audioInput.text ,
                notDevice:TkGlobal.language.languageData.login.language.detection.selectOption.noMicrophone
            },
            audiooutput:{
                default:TkGlobal.language.languageData.alertWin.settingWin.default.text ,
                defaultLabel:TkGlobal.language.languageData.alertWin.settingWin.audioOutput.text ,
                notDevice:TkGlobal.language.languageData.login.language.detection.selectOption.noEarphones
            },
        };
        this.listernerBackupid = new Date().getTime()+'_'+Math.random();
        this.nowUserName = '';
    };

    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        eventObjectDefine.CoreController.addEventListener( 'remoteControl_userAreaSelection' , this.handleRemoteControl_userAreaSelection.bind(this) , this.listernerBackupid); //remoteControl_userAreaSelection 事件
        eventObjectDefine.CoreController.addEventListener( 'remoteControl_deviceManagement' , this.handleRemoteControl_deviceManagement.bind(this) , this.listernerBackupid); //remoteControl_deviceManagement 事件
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomPubmsg , this.handlerRoomPubmsg.bind(this) , this.listernerBackupid); //roomPubmsg事件
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomUserpropertyChanged , this.handlerRoomUserpropertyChanged.bind(this) , this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomParticipantJoin , this.handlerRoomParticipantJoin.bind(this) , this.listernerBackupid);
    };
    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        eventObjectDefine.CoreController.removeBackupListerner(this.listernerBackupid);
    };
    handlerRoomParticipantJoin(recvEventData){
        if(this.state.loadShowOptionJson.userAreaSelection){
            let user  = recvEventData.user ;
            if(user && user.id === this.userid){
                this.changeServerClick( user.servername );
            }
        }
    };
    handlerRoomUserpropertyChanged(roomUserpropertyChangedEventData){
        if(this.state.loadShowOptionJson.userAreaSelection){
            let user = roomUserpropertyChangedEventData.user ;
            if(user && user.id === this.userid){
                let changePropertyJson  = roomUserpropertyChangedEventData.message ;
                for( let key of Object.keys(changePropertyJson) ){
                    if( key !== 'servername' ){
                        this.changeServerClick(changePropertyJson[key]);
                    }
                }
            }
        }
    };

    handlerRoomPubmsg(recvEventData){
        let pubmsgData = recvEventData.message ;
        let fromID = pubmsgData.fromID ;
        switch(pubmsgData.name) {
            case "RemoteControl":
                switch (pubmsgData.data.action){
                    case 'areaSelection':
                        if (this.state.loadShowOptionJson.userAreaSelection && pubmsgData.data.type === 'sendServerListInfo' && fromID === this.userid){
                            let { serverList , serverName } = pubmsgData.data.serverData;
                            this.useServerName = serverName ;
                            this.backupServerList = serverList && typeof serverList ==='object'? Object.customAssign({} , serverList) : {} ;
                            this.setState({serverlist:serverList , loading:false});
                        }else if(this.state.loadShowOptionJson.userAreaAndDeviceManagement && pubmsgData.data.type === 'sendServerListInfo' && fromID === this.userid ){
                            let { serverList , serverName } = pubmsgData.data.serverData;
                            this.useServerName = serverName ;
                            this.backupServerList = serverList && typeof serverList ==='object'? Object.customAssign({} , serverList) : {} ;
                            this.setState({serverlist:serverList , loading:false});
                        }
                        break ;
                    case 'deviceManagement':
                        if (this.state.loadShowOptionJson.deviceManagement && pubmsgData.data.type === 'sendDeviceInfo' && fromID === this.userid ){
                            let { deviceInfo } = pubmsgData.data.deviceData;
                            this.selectDevice = deviceInfo.useDevices && typeof deviceInfo.useDevices === 'object'? Object.customAssign({} , deviceInfo.useDevices )  : this.selectDevice ;
                            this.setState({selectDevice: deviceInfo.useDevices && typeof deviceInfo.useDevices === 'object'? Object.customAssign({} , deviceInfo.useDevices ) :  this.state.selectDevice });
                            this._changeDeviceElementDesc(deviceInfo);
                            this.backupDeviceInfo = deviceInfo && typeof deviceInfo ==='object'? Object.customAssign({} , deviceInfo) : {} ;
                            this.setState({loading:false});
                        }else if(this.state.loadShowOptionJson.userAreaAndDeviceManagement && pubmsgData.data.type === 'sendDeviceInfo' && fromID === this.userid ){
                            let { deviceInfo } = pubmsgData.data.deviceData;
                            this.selectDevice = deviceInfo.useDevices && typeof deviceInfo.useDevices === 'object'? Object.customAssign({} , deviceInfo.useDevices )  : this.selectDevice ;
                            this.setState({selectDevice: deviceInfo.useDevices && typeof deviceInfo.useDevices === 'object'? Object.customAssign({} , deviceInfo.useDevices ) :  this.state.selectDevice });
                            this._changeDeviceElementDesc(deviceInfo);
                            this.backupDeviceInfo = deviceInfo && typeof deviceInfo ==='object'? Object.customAssign({} , deviceInfo) : {} ;
                            this.setState({loading:false});
                        }
                        break ;
                }
                break;
        }
    };


    handleRemoteControl_deviceManagement(recvEventData){
        if(!recvEventData){return;}

        let {user} = recvEventData.message ;
        if( !user ){
            L.Logger.error('remoteControl_deviceManagement:user is not exist , user id is '+user.id+'!');
            return ;
        }
        this.userid = user.id ;
        for( let key of Object.keys(this.state.loadShowOptionJson) ){
            if(key === 'deviceManagement'){
                this.state.loadShowOptionJson[key] = true ;
            }else{
                this.state.loadShowOptionJson[key] = false ;
            }
        }


        // let titleText = TkGlobal.language.languageData.login.language.detection.deviceTestHeader.deviceSwitch.text + '('+user.nickname+')' ;
        let titleText = {
            title: TkGlobal.language.languageData.login.language.detection.deviceTestHeader.deviceSwitch.text,
            userName: user.nickname,
        }
        this.setState({
            show:true ,
            loadShowOptionJson:this.state.loadShowOptionJson ,
            loading:true ,
            titleText: titleText ,
            audiooutputVolume:user.volume!==undefined?user.volume:100,
        });

        this._getRemoteDeviceInfo(user.id);
    };

    handleRemoteControl_userAreaSelection(recvEventData){
        let {user} = recvEventData.message ;
        if( !user ){
            L.Logger.error('remoteControl_userAreaSelection:user is not exist , user id is '+user.id+'!');
            return ;
        }
        this.userid = user.id ;
        for( let key of Object.keys(this.state.loadShowOptionJson) ){
            if(key === 'userAreaSelection'){
                this.state.loadShowOptionJson[key] = true ;
            }else{
                this.state.loadShowOptionJson[key] = false ;
            }
        }
        // let titleText = TkGlobal.language.languageData.login.language.detection.deviceTestHeader.optimalServer.text + '('+user.nickname+')' ;
        let titleText = {
            title: TkGlobal.language.languageData.login.language.detection.deviceTestHeader.optimalServer.text,
            userName: user.nickname,
        }
        this.setState({show:true , loadShowOptionJson:this.state.loadShowOptionJson, loading:true , titleText:titleText});
        this._getRemoteServerListInfo(user.id);
    };


    changeServerClick(servername) {//选择服务器
        for (let key of Object.keys(this.state.serverlist)) {
            if (key === servername) {
                this.state.serverlist[key].isUseServer = true;
            }else {
                this.state.serverlist[key].isUseServer = false;
            }
        }
        this.setState({serverlist:this.state.serverlist});
    };

    /*确定按钮的点击事件*/
    okButtonOnClick(step){
        if(TkGlobal.HeightConcurrence){
            if(this.state.loadShowOptionJson.userAreaSelection){
                ServiceRoom.getTkRoom().getRoomUser(this.userid,(user)=>{
                    if(user && user.servername !== this.useServerName){
                        ServiceSignalling.setParticipantPropertyToAll(this.userid , {servername: this.useServerName});
                    }
                },(e)=>{
                    L.Logger.error('error:'+e)
                });
            }else if(this.state.loadShowOptionJson.deviceManagement){
                this._changeUserDeviceManagement(this.userid);
            }
            this._resetDefaultStateAndData();
        }else{
            if(this.state.loadShowOptionJson.userAreaSelection){
                let user = ServiceRoom.getTkRoom().getUser(this.userid);  /*NN ： 小班课才走*/
                if(user && user.servername !== this.useServerName){
                    ServiceSignalling.setParticipantPropertyToAll(this.userid , {servername: this.useServerName});
                }
            }else if(this.state.loadShowOptionJson.deviceManagement){
                this._changeUserDeviceManagement(this.userid);
            }
            this._resetDefaultStateAndData();
        }
    };
    closeButtonOnClick(step) {
        this._resetDefaultStateAndData();
    };

    /*改变选中的设备*/
    changeSelectDeviceOnChange(deviceKind , deviceId , index, event){
        const that = this ;
        //let deviceId =  event.target.value ;
        that._changeStateSelectDevice(deviceKind , deviceId);
    };

    /*处理音量改变事件*/
    handerVolumeOnAfterChange(volume){
        this.isVolumeDraging = false ;
        this.audiooutputVolume = undefined ;
        this.setState({audiooutputVolume:volume});
    };

    handerVolumeOnBeforeChange(volume){
        this.isVolumeDraging = true ;
        this.audiooutputVolume = volume ;
    };

    /*根据枚举设备信息更改设备的描述信息*/
    _changeDeviceElementDesc(deviceInfo){
        const that = this ;
        let { devices ,useDevices , hasdevice } = deviceInfo ;
        let devicesDesc = {
            videoinput:{},
            audioinput:{},
            audiooutput:{}
        };
        let deviceNumJson = {
            videoinput:0 ,
            audioinput:0 ,
            audiooutput:0
        };
        for( let [key , value] of Object.entries(devices) ){
            if (value.length === 0) {//是否存在设备
                that.state.hasDetection[key] = false;
            }else {
                that.state.hasDetection[key] = true;
            }
            that.setState({hasDetection:that.state.hasDetection});
            value.map( (device , index) => {
                devicesDesc[key][device.deviceId] = {
                    deviceId: device.deviceId ,
                    groupId: device.groupId ,
                    kind: device.kind ,
                    label: device.label || (  device.deviceId === "default" ? that.deviceLabelMap[key].default :  that.deviceLabelMap[key].defaultLabel + ( ++deviceNumJson[key] ) ) ,
                    select: that.selectDevice[key]=== device.deviceId ||  useDevices[key] === device.deviceId
                }
            });
        }
        that.setState({devicesDesc:devicesDesc});
    };

    /*加载设备的节点数组*/
    _loadDeviceElementByDeviceDescArray(devicesDesc){
        const that = this ;
        let devicesElementInfo = {
            audioinputElementArray:[] ,
            audiooutputElementArray:[] ,
            videoinputElementArray:[] ,
        };
        for(let [deviceKind,deviceDescJson] of Object.entries(devicesDesc) ){
            for(let  deviceDesc of Object.values(deviceDescJson) ){
                let { deviceId ,groupId , kind , label , select } = deviceDesc ;
                /*if(select){
                    that.selectDevice[kind] = deviceId ;
                }*/
                devicesElementInfo[deviceKind+'ElementArray'].push(
                    {value:deviceId,label:label}
                );
            }
        }
        for( let [key , value] of Object.entries(devicesElementInfo) ){
            if(value.length === 0){ //没有设备
                let  deviceId = undefined ,groupId = undefined , kind = key.replace(/ElementArray/g,'') , label = that.deviceLabelMap[kind].notDevice, select = true ;
                devicesElementInfo[key].push(
                    {value:deviceId,label:label}
                );
                switch (key){
                    case 'videoinputElementArray':
                        that.state.selectDevice.videoinput=devicesElementInfo.videoinputElementArray[0].value;
                        break ;
                    case 'audiooutputElementArray':
                        that.state.selectDevice.audiooutput=devicesElementInfo.audiooutputElementArray[0].value;
                        break ;
                    case 'audioinputElementArray':
                        that.state.selectDevice.audioinput=devicesElementInfo.audioinputElementArray[0].value;
                        break ;
                }
            }else{
                switch (key){
                    case 'videoinputElementArray':
                        that.state.selectDevice.videoinput=that.selectDevice.videoinput;
                        break ;
                    case 'audiooutputElementArray':
                        that.state.selectDevice.audiooutput=that.selectDevice.audiooutput;
                        break ;
                    case 'audioinputElementArray':
                        that.state.selectDevice.audioinput=that.selectDevice.audioinput;
                        break ;
                }
            }
        }
        return devicesElementInfo ;
    };

    _changeStateSelectDevice(deviceKind , deviceId) {
        const that = this;
        if (that.state.selectDevice[deviceKind] !== deviceId) {
            that.selectDevice[deviceKind] = deviceId;
            that.state.selectDevice[deviceKind] = deviceId;
            for (let [key, value] of Object.entries(that.state.devicesDesc[deviceKind])) {
                if (key === deviceId) {
                    value.select = true;
                } else {
                    value.select = false;
                }
            }
            that.setState({selectDevice: that.state.selectDevice, devicesDesc: that.state.devicesDesc});
        }

    };

    /*重置默认数据*/
    _resetDefaultStateAndData(){

        this.backupServerList = {} ;
        this.backupDeviceInfo = {} ;
        this.oldUseServerName = '';
        this.useServerName = '';
        this.selectDevice = {
            videoinput: undefined,
            audioinput: undefined,
            audiooutput: undefined
        };
        let changeState = {
            show:false ,
            loading:false ,
            loadShowOptionJson:{
                userAreaSelection:false ,
                deviceManagement:false ,
            },
            titleText:{} ,
            devicesDesc:{
                videoinput:{},
                audioinput:{},
                audiooutput:{}
            },
            selectDevice:{
                videoinput: undefined,
                audioinput: undefined,
                audiooutput: undefined
            },
            hasDetection:{
                videoinput: false,
                audioinput: false,
                audiooutput: false,
            },
            audiooutputVolume:100,
            //xueln 添加
            isClient:TkGlobal.isClient,
            serverlist:{},
        };
        this.setState( changeState ) ;
    };


    _getRemoteServerListInfo(userid){
       if(TkGlobal.HeightConcurrence){
           ServiceRoom.getTkRoom().requestServerList(TkConstant.SERVICEINFO.webHostname , TkConstant.SERVICEINFO.sdkPort ,(serverlist,res)=>{
                ServiceRoom.getTkRoom().getRoomUser(this.userid,(user)=>{
                    if(this.userid && user ){
                        let serverList = undefined ;
                        let serverName = user.servername ;
                        if(serverlist && typeof serverlist === 'object'){
                            serverList = {};
                            for(let [key,value] of Object.entries(serverlist) ){
                                serverList[key] = Object.customAssign({} , value);
                                if( serverList[key].serverareaname === serverName){
                                    serverList[key].isUseServer = true ;
                                }else {
                                    serverList[key].isUseServer = false ;
                                }
                            }
                        }else{
                            serverList = serverlist ;
                        }
                        this.useServerName = serverName ;
                        this.backupServerList = serverList && typeof serverList ==='object'? Object.customAssign({} , serverList) : {} ;
                        this.setState({serverlist:serverList , loading:false});
                    }else{
                        L.Logger.error('_getRemoteServerListInfo:user id not exist , user id is '+this.userid+"!");
                    }
                },(e)=>{
                    L.Logger.error('error:'+e)
                }) ;
           });
       }else{
           ServiceRoom.getTkRoom().requestServerList(TkConstant.SERVICEINFO.webHostname , TkConstant.SERVICEINFO.sdkPort ,(serverlist,res)=>{
               let user = ServiceRoom.getTkRoom().getUser(this.userid) ;            /*NN ： 小班课才走*/
               if(this.userid && ServiceRoom.getTkRoom().getUser(this.userid)){    /*NN ： 小班课才走*/
                   let serverList = undefined ;
                   let serverName = user.servername ;
                   if(serverlist && typeof serverlist === 'object'){
                       serverList = {};
                       for(let [key,value] of Object.entries(serverlist) ){
                           serverList[key] = Object.customAssign({} , value);
                           if( serverList[key].serverareaname === serverName){
                               serverList[key].isUseServer = true ;
                           }else {
                               serverList[key].isUseServer = false ;
                           }
                       }
                   }else{
                       serverList = serverlist ;
                   }
                   this.useServerName = serverName ;
                   this.backupServerList = serverList && typeof serverList ==='object'? Object.customAssign({} , serverList) : {} ;
                   this.setState({serverlist:serverList , loading:false});
               }else{
                   L.Logger.error('_getRemoteServerListInfo:user id not exist , user id is '+this.userid+"!");
               }
           });
       }
    }

    _getRemoteDeviceInfo(userid){
        let data = {
            action:'deviceManagement' ,
            type:'getDeviceInfo' ,
        };
        ServiceSignalling.sendSignallingFromRemoteControl(userid , data);
    }

    _changeUserDeviceManagement(userid){
        if( this.selectDevice  && typeof this.selectDevice === 'object'){
            let data = {
                action: 'deviceManagement',
                type: 'changeDeviceInfo',
                changeData:{selectDeviceInfo:this.selectDevice },
            };
            ServiceSignalling.sendSignallingFromRemoteControl(userid , data);
            ServiceSignalling.setParticipantPropertyToAll(userid, {volume:this.state.audiooutputVolume});

        }
    }

    _getServerListEle() {//创建服务器列表标签
        let that = this;
        let serverNameEleArr = [];
        let newObj = {};
        let keyArry = [];
        let chinaArr = [];
        if(that.state.serverlist && that.state.serverlist !== null && that.state.serverlist !== undefined){
            Object.keys(that.state.serverlist).sort().forEach(function (item,index) { //json数据排序
                if(that.state.serverlist[item].chinesedesc.indexOf("中国大陆")>=0){ //大陆放在数组头部
                    chinaArr.push(item);
                    chinaArr.sort();
                }else{//其他按照adcd排序下去
                    keyArry.push(item);
                }
            });
            keyArry = chinaArr.concat(keyArry);
            keyArry.forEach(function (item) {
                newObj[item] = that.state.serverlist[item];
            });
        }
        if (this.state.serverlist && this.state.serverlist !== null && this.state.serverlist !== undefined) {
            for (let [key, value] of Object.entries(this.state.serverlist)) {
                if (value.isUseServer=== true) {
                    that.useServerName = value.serverareaname;
                }
                serverNameEleArr.push(
                    <li key={key} className={(value.isUseServer ? "active" : '')}>
                        <span>
                            <input data-aaa={`${value.isUseServer}`} id={'srever_' + key} name="selectremotesrever" value={key} onChange={that.changeServerClick.bind(that, value.serverareaname)} type="radio" checked={value.isUseServer||''}/>
                        </span>
                        <span>
                            <label htmlFor={'srever_' + key}>{TkGlobal.language.name === 'chinese'?value.chinesedesc:(TkGlobal.language.name === 'japan'?value.japanesedesc:value.englishdesc)}</label>
                        </span>
                    </li>
                );
            }
        }
        return serverNameEleArr;
    };

    zhikeRemoteClick(checkStatus , event) {

        if(checkStatus === 1){
            this.state.loadShowOptionJson.deviceManagement = false;
            this.state.loadShowOptionJson.userAreaSelection = true;
        }else if(checkStatus === 0){
            this.state.loadShowOptionJson.deviceManagement = true;
            this.state.loadShowOptionJson.userAreaSelection = false;
        }

        this.setState({
            loadShowOptionJson:this.state.loadShowOptionJson
        });

        if(event){
            event.stopPropagation();
            event.preventDefault();
        }
        return;
    };

    render(){
        let that = this ;
        let { show   , devicesDesc   , loading , loadShowOptionJson  , titleText,audiooutputVolume} = that.state ;//音量加
        let { okText , backgroundColor } = that.props;
        let { audioinputElementArray ,  audiooutputElementArray , videoinputElementArray } = that._loadDeviceElementByDeviceDescArray(devicesDesc);
        let serverNameEleArr = this._getServerListEle() ;
        return (
            <section id="remote_control_all_start_remote_control" className="remote-control-container startdetection add-position-absolute-top0-left0 opcityBg" style={{display: !show ? 'none' : 'block'  , backgroundColor:backgroundColor }}>
                <article id="remote_control_main_detection_device" className="device-test smallBg" style={{display: !show ? 'none' : 'block'}}>
                    <div className="net-testing">
                        {/* <span className="device-test-header">{titleText || TkGlobal.language.languageData.login.language.detection.deviceTestHeader.device.text}</span> */}
                        <span className="device-test-header">{ ((titleText.title && titleText.userName ) ? <span>{"设备101"}(<span className="device-test-header-name" >{titleText.userName}</span>)</span> : TkGlobal.language.languageData.login.language.detection.deviceTestHeader.device.text) }</span>
                        <button id="remote_control_close-detection" className="close-detection" onClick={that.closeButtonOnClick.bind(that , -1)} style={{display:"block"}}></button>
                    </div>
                    <div className="testing-bot">
                        <div className={"testing-right en-testing-right" + (loadShowOptionJson.deviceManagement?' smallBg':' opcityBg')}>
                            <div className="network-right fixldy" id="remote_control_skip-network" style={{ display:loadShowOptionJson.userAreaSelection?'block ':' none'}} >
                                <div className="test-network-title">
                                    {/*<span className="network-title-select">{TkGlobal.language.languageData.login.language.detection.networkExtend.title.select}</span>
                                     <span className="network-title-server">{TkGlobal.language.languageData.login.language.detection.networkExtend.title.area}</span>*/}
                                    {/*<span className="network-title-delay">{TkGlobal.language.languageData.login.language.detection.networkExtend.title.delay}</span>*/}
                                    {TkGlobal.language.languageData.login.language.detection.networkExtend.title.text}
                                </div>
                                <ul className="test-network-box">
                                    {serverNameEleArr}
                                </ul>
                                <div className="network-button">
                                    <button className="detection-result-btn"  onClick={that.okButtonOnClick.bind(that , 4)} >{okText}</button>
                                    {/*<button onClick={this.testServerSpeedClick.bind(this)} className="test-server-btn detection-result-btn">{TkGlobal.language.languageData.login.language.detection.networkExtend.testBtn}</button>*/}
                                </div>
                            </div>
                            <div className="video-right fixldy opcityBg" id="remote_control_skip-video" style={{ display:loadShowOptionJson.deviceManagement?'block ': ' none '}} >
                                <div className="video-right-inside device-right-inside smallBg">
                                    <div className="camera-option-all clear-float smallBg">
                                        <span className="camera-option">{TkGlobal.language.languageData.login.language.detection.videoinputExtend.cameraOptionAll.cameraOption.text}</span>
                                        <div className="styled-select" id="remote_control_video-select" style={{zIndex:30}}>
                                            <SelectDumb
                                                maxH={true}
                                                id="remote_control_videoSource"
                                                className="dropDownBox"
                                                selectOptions={videoinputElementArray}
                                                currentValue={that.state.selectDevice.videoinput}
                                                disabled={false}
                                                onChange={that.changeSelectDeviceOnChange.bind(that ,'videoinput' ) }
                                            />
                                        </div>
                                    </div>
                                    <div className="camera-option-all clear-float smallBg">
                                        <span className="camera-option">{TkGlobal.language.languageData.login.language.detection.audioinputExtend.cameraOptionAll.cameraOption.text}</span>
                                        <div className="styled-select" style={{zIndex:20}}>
                                            <SelectDumb
                                                maxH={true}
                                                id="remote_control_audioSource"
                                                className="dropDownBox"
                                                selectOptions={audioinputElementArray}
                                                currentValue={that.state.selectDevice.audioinput}
                                                disabled={false}
                                                onChange={that.changeSelectDeviceOnChange.bind(that  ,'audioinput' ) }
                                            />
                                        </div>
                                    </div>
                                    <div className="camera-option-all clear-float smallBg">
                                        <span className="camera-option">{TkGlobal.language.languageData.login.language.detection.audioouputExtend.cameraOptionAll.cameraOption.text}</span>
                                        <div className="styled-select">
                                            <SelectDumb
                                                maxH={true}
                                                id="remote_control_audioOutput"
                                                className="dropDownBox"
                                                selectOptions={audiooutputElementArray}
                                                currentValue={that.state.selectDevice.audiooutput}
                                                disabled={false}
                                                onChange={that.changeSelectDeviceOnChange.bind(that  ,'audiooutput' ) }
                                            />
                                        </div>
                                    </div>
                                    <div className="camera-option-all clear-float smallBg">{/*耳机音量*/}
                                        <span className="camera-option">{TkGlobal.language.languageData.login.language.detection.audioouputExtend.cameraOptionAll.earphoneVolume.text}</span>
                                        <div className="styled-select voice">
                                            <div className="sound-vol earphone-vol">
                                                <div className="sound-btn icon_volume tk-img "></div>
                                                <TkSliderDumb className={"tk-slider tk-detection-device"}  value={this.audiooutputVolume !== undefined ?this.audiooutputVolume : audiooutputVolume}    onBeforeChange={that.handerVolumeOnBeforeChange.bind(that)}  onAfterChange={that.handerVolumeOnAfterChange.bind(that)}    />
                                                <span className="txtValue" >{audiooutputVolume}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="see-button" style={{display:"block"}}>
                                    <button className="can-see detection-result-btn" onClick={that.okButtonOnClick.bind(that , 4)} >{okText}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div  className="remote-control-loading add-position-absolute-top0-left0"  style={{display:loading?'block':'none'}} ></div>
                </article>
            </section>
        )
    };
};
export  default  RemoteControlDetectionDeviceSmart ;

