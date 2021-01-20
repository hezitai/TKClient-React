/**
 * 检测设备-检测主界面的Smart组件
 * @module MainDetectionDeviceSmart
 * @description   提供检测设备-检测主界面的Smart组件
 * @author QiuShao
 * @date 2017/08/18
 */


'use strict';
import React from 'react';
import TkGlobal from 'TkGlobal';
import eventObjectDefine from 'eventObjectDefine';
import HandlerDetectionDevice from "./handler/handlerDetectionDevice" ;
import TkSliderDumb from "TkSliderDumb" ;
import ServiceRoom from 'ServiceRoom' ;
import TkUtils from 'TkUtils';
import SelectDumb from 'SelectDumb'
import ServiceSignalling from "ServiceSignalling";
import TkConstant from "TkConstant";

class MainDetectionDeviceSmart extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            isVideoMirror:L.Utils.localStorage.getItem("isVideoMirror") && L.Utils.localStorage.getItem("isVideoMirror")!=='false' ?L.Utils.localStorage.getItem("isVideoMirror"):false,
            updateState:false ,
            show:false ,
            selectShow:{
                networkinput:false,
                videoinput:false ,
                audioinput:false ,
                audiooutput:false,
                systemInfo:false,
                result:false,
                changeScreen:false,
            },
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
            audiooutputVolume:100 ,
            testSystemInfo:{
                currentUser:"",//当前用户：
                operatingSystem:"",//操作系统
                // processor:"----",//处理器：
                // RAM:"----",//内存：
                // serverName:"----",//服务器名称：
                IPAddress:"----",//IP地址：
                LoginDevice:"----",//登入设备
                networkDelay:"----",//网络延时：
                packetLoss:"----",//丢包率：
                browser:"----",//浏览器：
                roomNumber:"----",//房间号：
                versionNumber:"----",//版本号
                // uploadSpeed:"----",//上传速度：
                // downloadSpeed:"----",//下载速度：
            },
            // serverSpeed:{},
            serverlist:{},
            switchScreen:false, //默认为false
        };
        this.oldUseServerName = '';
        this.useServerName = '';
        this.useServerRealName = '';
        this.systemInfoLanguage = {
            currentUser:TkGlobal.language.languageData.login.language.detection.systemInfo.currentUser,//当前用户：
            operatingSystem:TkGlobal.language.languageData.login.language.detection.systemInfo.operatingSystem,//操作系统：
            // processor:TkGlobal.language.languageData.login.language.detection.systemInfo.processor,//处理器：
            // RAM:TkGlobal.language.languageData.login.language.detection.systemInfo.RAM,//内存：
            // serverName:TkGlobal.language.languageData.login.language.detection.systemInfo.serverName,//服务器名称：
            // IPAddress:TkGlobal.language.languageData.login.language.detection.systemInfo.IPAddress,//IP地址：
            LoginDevice:TkGlobal.language.languageData.login.language.detection.systemInfo.LoginDevice,//登入设备：
            mediaServer:TkGlobal.language.languageData.login.language.detection.systemInfo.MediaServer,//媒体服务器：
            coursewareServer:TkGlobal.language.languageData.login.language.detection.systemInfo.CoursewareServer,//课件库服务器：
            // networkDelay:TkGlobal.language.languageData.login.language.detection.systemInfo.networkDelay,//网络延时：todo 暂时隐藏掉
            packetLoss:TkGlobal.language.languageData.login.language.detection.systemInfo.packetLoss,//丢包率：
            browser:TkGlobal.language.languageData.login.language.detection.systemInfo.browser,//浏览器：
            roomNumber:TkGlobal.language.languageData.login.language.detection.systemInfo.roomNumber,//房间号：
            versionNumber:TkGlobal.language.languageData.login.language.detection.systemInfo.versionNumber,//版本号：
            // uploadSpeed:TkGlobal.language.languageData.login.language.detection.systemInfo.uploadSpeed,//上传速度：
            // downloadSpeed:TkGlobal.language.languageData.login.language.detection.systemInfo.downloadSpeed,//下载速度：
        };
        this.detectionResult = {
            whichServer:false,
            canSee:false,
            canListen:false,
            canSpeak:false,
        };
       
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
        this.isVideoMirror = false;
        this.isVolumeDraging = false ; //拖动音量过程中
        this.listernerBackupid = new Date().getTime()+'_'+Math.random();

    };

    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        let that = this;
        that._initVideoMirroring();
        // 监听设备变化
        eventObjectDefine.CoreController.addEventListener( "deviceChange" , that.handlerDeviceChange.bind(that) ,  that.listernerBackupid   );
        eventObjectDefine.CoreController.addEventListener( "welcomeDetectionDevice" , that.handlerWelcomeDetectionDevice.bind(that) , that.listernerBackupid );
        //注册执行检测界面的事件，调用检测界面的方法detectionDeviceHandlerExecute()
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomConnected, that.handlerRoomConnected.bind(that)  , that.listernerBackupid ); //Room-Connected事件：房间连接事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPubmsg, that.handlerRoomPubmsg.bind(that)  , that.listernerBackupid ); //Room-Connected事件：房间连接事件
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomUserpropertyChanged , this.handlerRoomUserpropertyChanged.bind(this) , this.listernerBackupid);
        // 监听当前组件显示事件
        eventObjectDefine.CoreController.addEventListener( "mainDetectionDevice" , that.handlerMainDetectionDevice.bind(that) ,  that.listernerBackupid   );
        eventObjectDefine.CoreController.addEventListener( "handleTestSystemInfo" , that.handleTestSystemInfo.bind(that) ,  that.listernerBackupid   );
        eventObjectDefine.CoreController.addEventListener( "remotecontrol_deviceManagement_changeDeviceInfo" , that.handleRemotecontrol_deviceManagement_changeDeviceInfo.bind(that) ,  that.listernerBackupid   );
        // 纯音频房间切换事件
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomAudiovideostateSwitched , that.handlerRoomAudiovideostateSwitched.bind(that) ,  that.listernerBackupid   );
    };
    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        let that = this;
        that._stepExecuteStopOrClear(3);
        eventObjectDefine.CoreController.removeBackupListerner(that.listernerBackupid);
    };

    // 镜像
    _initVideoMirroring(){
        let videoMirroring = document.getElementById("srever_mirroring");
        if(videoMirroring){
            if(!this.state.isVideoMirror || this.state.isVideoMirror === 'false'){
                videoMirroring.checked = false;
            }else{
                videoMirroring.checked = true;
            }
        }
    }
    handlerRoomPubmsg(recvEventData){
        let that=this;
        let pubmsgData = recvEventData.message;
        switch(pubmsgData.name) {
            case "RemoteControl": //助教远程控制其他人设备、网络
                switch (pubmsgData.data.action){
                    case 'changeLine': //切换线路
                        that.getSystemInfo();//获取用户系统信息
                        that.systemInfoEleArr(that.systemInfoLanguage);
                        break;
                }
                break;

        }
    }

    // 纯音频房间切换事件
    handlerRoomAudiovideostateSwitched(roomSwitchEventData){
        if (TkGlobal.isOnlyAudioRoom) {
            this._loadSelectShow('audiooutput', true);
        } else {
            this._loadSelectShow('videoinput', true);
        }
    }

    // 监听用户属性改变
    handlerRoomUserpropertyChanged(roomUserpropertyChangedEventData) {
        let user = roomUserpropertyChangedEventData.user;
        if (user && user.id === ServiceRoom.getTkRoom().getMySelf().id) {
            let changePropertyJson = roomUserpropertyChangedEventData.message;
            for (let key of Object.keys(changePropertyJson)) {
                if (key === 'servername') {
                    this.changeServerClick(changePropertyJson[key]);
                    this.getSystemInfo();//获取用户系统信息
                    this.systemInfoEleArr(this.systemInfoLanguage);
                }
            }
        }
    }
    handlerWelcomeDetectionDevice(){
        if(!TkConstant.joinRoomInfo.isHasVideo){
            this._loadSelectShow('audiooutput' , true);
        }
    }
    handlerRoomConnected() {
        ServiceRoom.getTkRoom().requestServerList(TkConstant.SERVICEINFO.webHostname,TkConstant.SERVICEINFO.sdkPort,(serverlist,res)=>{
            let serverlistCopy = undefined ;
            if(serverlist && typeof serverlist === 'object'){
                serverlistCopy = {} ;
                for(let [key,value] of Object.entries(serverlist) ){
                    serverlistCopy[key] = Object.customAssign({} , value);
                }
            }else{
                serverlistCopy = serverlist;
            }
            this.setState({serverlist:serverlistCopy});
        });

    }
    handleTestSystemInfo(handleData) {//处理网络延时和丢包率
        let networkStatus = handleData.message.data.networkStatus;
        let show = handleData.message.data.show;
        if (show === true) {
            this.state.testSystemInfo.networkDelay = networkStatus.rtt+"ms";
            this.state.testSystemInfo.packetLoss = networkStatus.packetsLost+"%";
        }else {
            this.state.testSystemInfo.networkDelay = "----";
            this.state.testSystemInfo.packetLoss = "----";
        }
        this.setState({testSystemInfo:this.state.testSystemInfo});
    }

    // 监听设备发生改变
    handlerDeviceChange(){
        // 判断教室是否是连接状态
        if( TkGlobal.appConnected ){
            // TK.DeviceMgr.getDevices 用来获取设备列表和默认选中设备
            TK.DeviceMgr.getDevices(function (deviceInfo) {
                let data = {
                    action:'deviceManagement' ,
                    type:'sendDeviceInfo' ,
                    deviceData:{deviceInfo:deviceInfo} ,
                };
                for(let user of Object.values( TkUtils.getSpecifyRoleList(TkConstant.role.roleTeachingAssistant,ServiceRoom.getTkRoom().getUsers()) ) ){ // N:不用修改 该部分人选仍在
                    ServiceSignalling.sendSignallingFromRemoteControl( user.id , data);
                }
            });
        }
        this._enumerateDevices();
    };

    changeServerClick(servername) {//选择服务器
        for (let [key,value] of Object.entries(this.state.serverlist)) {
            if (key === servername) {
                value.isUseServer = true;
                this.useServerName =value.serverareaname;
                this.useServerRealName = TkGlobal.language.name === 'chinese'?value.chinesedesc:(TkGlobal.language.name === 'japan'?value.japanesedesc:value.englishdesc);
            }else {
                value.isUseServer = false;
            }
        }
        this.setState({serverlist:this.state.serverlist});
    };

    // 显示该页面时触发
    handlerMainDetectionDevice(recvEventData) {
        const that = this;
        let {isEnter} = this.props;
        this.isVideoMirror=L.Utils.localStorage.getItem("isVideoMirror") && L.Utils.localStorage.getItem("isVideoMirror")!=='false' ? L.Utils.localStorage.getItem("isVideoMirror") : false;
        this.changeServerClick( ServiceRoom.getTkRoom().getMySelf().servername );
        this.getSystemInfo();//获取用户系统信息
        this.systemInfoEleArr(this.systemInfoLanguage);
        that.oldUseServerName = ServiceRoom.getTkRoom().getMySelf().servername;
        // 如果该组件父级是从call调用  而且不是助教身份
        if (isEnter || !TkConstant.hasRole.roleTeachingAssistant) {
            /*todo 暂时mac客户端在课堂里不显示视频检测*/
            if (TkGlobal.isOnlyAudioRoom) {
                this._loadSelectShow('audiooutput', true);
            } else {
                this._loadSelectShow('videoinput', true);
            }
        } else {
            that._loadSelectShow('networkinput', true);
        }

        that.setState({show: true});
        that._enumerateDevices();
        if (TK.isTkNative && TK.subscribe_from_native) {
            if (TK.DeviceMgr && TK.DeviceMgr.setSpeakerVolume) {
                TK.DeviceMgr.setSpeakerVolume(this.state.volume || 100);
            }
        }
    };

    /*下一步按钮的点击事件*/
    nextButtonOnClick(selectKey , selectValue = true , step ,detection, isIntact){
        const that = this ;
        that._stepExecuteStopOrClear(step);
        that._loadSelectShow(selectKey , selectValue) ;
        that._detectionResultSave(detection,isIntact);
    };
    _detectionResultSave(detection,isIntact) {
        switch (detection) {
            case 'video'://视频
                this.detectionResult.canSee = isIntact;
                break;
            case 'telephone'://话筒
                this.detectionResult.canListen = isIntact;
                break;
            case 'voiceTube'://听筒
                this.detectionResult.canSpeak = isIntact;
                break;
        }
    };

    /*确定按钮的点击事件*/
    okButtonOnClick(step){
        const that = this ;
        if(TK.isTkNative && TK.subscribe_from_native){
            TK.DeviceMgr.setDevices();
            let volume = ServiceRoom.getTkRoom() && ServiceRoom.getTkRoom().getMySelf()?(ServiceRoom.getTkRoom().getMySelf().volume!==undefined?ServiceRoom.getTkRoom().getMySelf().volume:100):100 ;
            if(TK.DeviceMgr && TK.DeviceMgr.setSpeakerVolume){
                TK.DeviceMgr.setSpeakerVolume(volume);
            }
        }
        let {handlerOkCallback , saveLocalStorage=true} = that.props ;
        that._stepExecuteStopOrClear(step);
        if(saveLocalStorage){
            for(let [deviceKind,deviceId] of Object.entries(that.selectDevice)){
                L.Utils.localStorage.setItem(L.Constant.deviceStorage[deviceKind],deviceId);
            }
        }
        eventObjectDefine.CoreController.dispatchEvent({type:'detectionDeviceFinsh' , message:{clearFinsh:that.props.clearFinsh}});
        eventObjectDefine.CoreController.dispatchEvent({type:'changeSettingBtn' , message:{changeBtn:true}});
        if(handlerOkCallback && typeof handlerOkCallback === 'function'){
            handlerOkCallback({selectDeviceInfo:that.selectDevice});
        }
        if (that.oldUseServerName !== that.useServerName && TkConstant.hasRole.roleTeachingAssistant) {//选择的服务器名与当前使用的不相等时
            ServiceRoom.getTkRoom().switchServerByName(that.useServerName);
            L.Utils.localStorage.setItem('tkLocalstorageServerName' , that.useServerName ) ;
        }
        this.isClick = false;
        TkGlobal.isVideoMirror = this.isVideoMirror;
        L.Utils.localStorage.setItem("isVideoMirror",TkGlobal.isVideoMirror);
        eventObjectDefine.CoreController.dispatchEvent({type:'videoMirroring' , message:{isVideoMirroring:TkGlobal.isVideoMirror}}) ;
        that._resetDefaultStateAndData();
    };
    closeButtonOnClick(step) {
        const that = this ;
        if(TK.isTkNative && TK.subscribe_from_native){
            TK.DeviceMgr.setDevices();
            let volume = ServiceRoom.getTkRoom() && ServiceRoom.getTkRoom().getMySelf()?(ServiceRoom.getTkRoom().getMySelf().volume!==undefined?ServiceRoom.getTkRoom().getMySelf().volume:100):100 ;
            if(TK.DeviceMgr && TK.DeviceMgr.setSpeakerVolume){
                TK.DeviceMgr.setSpeakerVolume(volume);
            }
        }
        that._stepExecuteStopOrClear(step);
        eventObjectDefine.CoreController.dispatchEvent({type:'detectionDeviceFinsh' , message:{clearFinsh:that.props.clearFinsh}});
        eventObjectDefine.CoreController.dispatchEvent({type:'changeSettingBtn' , message:{changeBtn:true}});
        that._resetDefaultStateAndData();
        if(this.isClick){
            let videoMirroring = document.getElementById("srever_mirroring");
            TkGlobal.isVideoMirror = !this.state.isVideoMirror;
            videoMirroring.checked = TkGlobal.isVideoMirror;
            this.setState({isVideoMirror:TkGlobal.isVideoMirror});
            this.isClick = false ;
        }
        if(this.isSwitch){
            let mainMinorBtn = document.querySelector('#mainMinorChange-btn');
            TkGlobal.switchScreen  = !TkGlobal.switchScreen;
            this.state.switchScreen = TkGlobal.switchScreen;
            mainMinorBtn.checked = this.state.switchScreen;
            this.setState({switchScreen:TkGlobal.switchScreen});
            this.isSwitch = false;
        }

    };
    
    /*播放音乐*/
    playAudioToAudiooutput(audioId = 'music_audio', play = true){
        if(TkGlobal.isClient && TK.subscribe_from_native){
            let audioUrl = TkGlobal.projectPublishDirAddress + 'music/detectionDevice_default.wav' ;
            if(this.state.selectDevice.audiooutput && play){
                TK.DeviceMgr.startSpeakerTest(this.state.selectDevice.audiooutput,audioUrl);
            }
        }else{
            let $audio = $("#"+audioId) ;
            if($audio && $audio.length>0){
                if(play){
                    $audio[0].currentTime = 0 ;
                    L.Utils.mediaPause( $audio[0])
                    L.Utils.mediaPlay( $audio[0])
                }else{
                    L.Utils.mediaPause( $audio[0])
                }
            }
        }
    };
	
    /**
     * 监听选择框改变状态
     * @param {String} deviceKind 
     * @param {*} deviceId 
     * @param {*} index 
     * @param {Document} event 
     */
    changeSelectDeviceOnChange(deviceKind, deviceId , index, event){
    	const that = this ;
        // let deviceId =  event.target.value ;
        that._changeStateSelectDevice(deviceKind , deviceId);
        that._deviceSwitch(deviceKind);
        if(event){
            event.preventDefault();
            event.stopPropagation();
        }
        return false ;
    };
    /**
     * 处理音量改变事件
     * @param {Number} volume 要修改的音量
     */
    handerVolumeOnAfterChange(volume){
        this.isVolumeDraging = false ;
        this.audiooutputVolume = undefined ;
        if(TK.isTkNative && TK.subscribe_from_native){
            if(TK.DeviceMgr && TK.DeviceMgr.setSpeakerVolume){
                TK.DeviceMgr.setSpeakerVolume(volume);
            }
        }else{
            document.getElementById('music_audio').volume = volume/100 ;
        }
        this.setState({audiooutputVolume:volume});
    };

    handerVolumeOnBeforeChange(volume){
        this.isVolumeDraging = true ;
        this.audiooutputVolume = volume ;
    };

    handleRemotecontrol_deviceManagement_changeDeviceInfo(recvEventData){
        if( this.state.show ){
            let {selectDeviceInfo} = recvEventData.message ;
            this.selectDevice = selectDeviceInfo && typeof selectDeviceInfo === 'object' ? Object.customAssign({} , selectDeviceInfo ) : this.selectDevice ;
            this._selectShowToDeviceSwitch();
            this._checkSelectDevice();
        }
    };

    /*加载选中的检测界面显示*/
    _loadSelectShow(selectKey , selectValue){
        for( let key of Object.keys(this.state.selectShow) ){
            if(key === selectKey ){
                this.state.selectShow[key] = selectValue ;
            }else{
                this.state.selectShow[key] = false ;
            }
        }
        this._checkSelectDevice();
        this.setState({selectShow:this.state.selectShow});
        this._deviceSwitch(selectKey);
    };

    _enumerateDevices(){
        const that = this ;
        HandlerDetectionDevice.enumerateDevices( (deviceInfo) => {
            that._changeDeviceElementDesc(deviceInfo);
            that._selectShowToDeviceSwitch();
            that._checkSelectDevice();
        });
    };

    //创建服务器列表标签
    _getServerListEle() {
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
                // if (value.isUseServer=== true) {
                //     that.useServerName =value.serverareaname;
                //     that.useServerRealName = TkGlobal.language.name === 'chinese'?value.chinesedesc:value.englishdesc;
                // }
                serverNameEleArr.push(
                    <li key={key} className={(value.isUseServer ? "active" : '')}>
                    <span>
                        <input id={'srever_' + key} name="selectServer" value={key} onChange={that.changeServerClick.bind(that, value.serverareaname)} type="radio" checked={value.isUseServer||''}/>
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
                if(TkGlobal.isClient && TK.subscribe_from_native){
                    TK.DeviceMgr.stopSpeakerTest();
                }
                TK.DeviceMgr.stopMicrophoneTest();
                TK.DeviceMgr.stopCameraTest();
            }else {
                that.state.hasDetection[key] = true;
            }
            that.setState({hasDetection:that.state.hasDetection});
            value.map( (device , index) => {
                if(that.selectDevice[key] !== device.deviceId &&  useDevices[key] === device.deviceId ){
                    that.selectDevice[key] = device.deviceId ;
                }
                devicesDesc[key][device.deviceId] = {
                    deviceId: device.deviceId ,
                    groupId: device.groupId ,
                    kind: device.kind ,
                    label: device.label || (  device.deviceId === "default" ? that.deviceLabelMap[key].default :  that.deviceLabelMap[key].defaultLabel + ( ++deviceNumJson[key] ) ) ,
                    // select: that.selectDevice[key]=== device.deviceId ||  useDevices[key] === device.deviceId
                    select: that.selectDevice[key]=== device.deviceId
                }
            });
            // that.selectDevice[key] = (value[0] || { deviceId: ''}).deviceId || ''
            // 兼容sdk不返回设备默认值时的操作
            if (typeof that.selectDevice[key] === 'undefined'){
                if (value.length) that.selectDevice[key] = value[0].deviceId
            }
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
                // if(select){
                //     that.selectDevice[kind] = deviceId ;
                // }
                devicesElementInfo[deviceKind+'ElementArray'].push(
                    {value:deviceId,label:label}
                );
            }
        }
        for( let [key , value] of Object.entries(devicesElementInfo) ){
            if(value.length === 0){ //没有设备
                let  deviceId = undefined ,groupId = undefined , kind = key.replace(/ElementArray/g,'') , label = that.deviceLabelMap[kind].notDevice, select = true ;
                /*if(select){
                    that.selectDevice[kind] = deviceId ;
                }*/
                /*devicesElementInfo[key].push(
                    <option key={key}    tkcustomdatadeviceid={deviceId} tkcustomdatagroupid={groupId}  tkcustomdatakind={kind}  tkcustomdatalabel={label} value={deviceId}  > {label} </option>
                );*/
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
            }
        }
        return devicesElementInfo ;
    };

    _selectShowToDeviceSwitch(){ 
        const that = this ;
        for(let [key , value] of  Object.entries(that.state.selectShow) ){
            if(value){
                that._deviceSwitch(key);
            }
        }
    };

    _deviceSwitch(deviceKind){
        const that = this ;
        if(!that.selectDevice[deviceKind]){
            L.Logger.info('deviceSwitch deviceId is not exist from selectDevice , deviceKind is '+deviceKind+'!');
            return ;
        }
        if(!that.state.selectShow[deviceKind]){
            L.Logger.info('deviceSwitch deviceId is not exist from selectShow , deviceKind is '+deviceKind+'!');
            return;
        }
        switch (deviceKind){
            case 'videoinput':
                if( TkGlobal.isMacClient && !that.props.isEnter ){ // todo mac客户端暂时不做处理
                    return;
                }
                TK.DeviceMgr.stopCameraTest();
                TK.DeviceMgr.startCameraTest(that.selectDevice[deviceKind],"videoinput_video_stream");
                break;
            case 'audioinput':
                TK.DeviceMgr.stopMicrophoneTest();
            	HandlerDetectionDevice.audioSourceChangeHandlerFrom({deviceId:that.selectDevice[deviceKind]  , audioinputAudioElementId:'audioinput_audio_stream'   , audioinputVolumeContainerId:'volume_audioinput_container' });
                break;
            case 'audiooutput':
            	if(TkGlobal.isClient && TK.subscribe_from_native){
                    TK.DeviceMgr.stopSpeakerTest();
                }else{
                	HandlerDetectionDevice.audioOutputChangeHandler({deviceId:that.selectDevice[deviceKind]  , setSinkIdParentElementId:'main_detection_device' });
				}
                break;
        }

    };

    _stepExecuteStopOrClear(step){
        const that = this ;
        if(step!=undefined){
            switch (step){
                case -1:
                    if(TkConstant.joinRoomInfo.isDoubleScreenDisplay && TkGlobal.isClient){
                        //关闭按钮，应保留上一次状态
                        this.setState({switchScreen:TkGlobal.switchScreen});
                    }
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                	if(TkGlobal.isClient && TK.subscribe_from_native){
                        TK.DeviceMgr.stopSpeakerTest();
	            	}
                    TK.DeviceMgr.stopMicrophoneTest();
                    TK.DeviceMgr.stopCameraTest();
                    that.playAudioToAudiooutput('music_audio' , false);
                    break;
                case 6:
                    if(TkConstant.joinRoomInfo.isDoubleScreenDisplay && TkGlobal.isClient){
                        if(TkGlobal.switchScreen !== this.state.switchScreen){
                            TkGlobal.switchScreen = !TkGlobal.switchScreen;
                            this.setState({switchScreen:TkGlobal.switchScreen});
                            ServiceRoom.getNativeInterface().switchMainViceMonitor();
                        }
                    }
                    break;
            }
        }
    };

    _changeStateSelectDevice(deviceKind , deviceId){
        const that = this ;
        if( that.state.selectDevice[deviceKind] !== deviceId){
            that.selectDevice[deviceKind] = deviceId ;
            that.state.selectDevice[deviceKind] = deviceId ;
            for( let [key , value] of Object.entries( that.state.devicesDesc[deviceKind]) ){
                if(key === deviceId){
                    value.select = true ;
                }else{
                    value.select = false ;
                }
            }
            that.setState({selectDevice:that.state.selectDevice , devicesDesc: that.state.devicesDesc});
        }
    };

    /*检测选中的设备是否和状态中的设备相等*/
    _checkSelectDevice(){
        for(let deviceKind of Object.keys(this.selectDevice) ){
            if( this.selectDevice[deviceKind] !== this.state.selectDevice[deviceKind] ){
                this._changeStateSelectDevice(deviceKind , this.selectDevice[deviceKind]  );
            }
        }
    };

    // 切换设备检测选项  如果是来自tklogin的调用 则不让切换
    _cutDetectionItem(isEnter , step , selectKey , selectValue = true , e) {
        const that = this ;
    	if (isEnter) {
    		return false;
    	}
    	that._stepExecuteStopOrClear(step);
        that._loadSelectShow(selectKey , selectValue) ;
    };

    /*重置默认数据*/
    _resetDefaultStateAndData(){
        let changeState = {
            show:false ,
            selectShow:{
                networkinput:false,
                videoinput:false ,
                audioinput:false ,
                audiooutput:false,
                systemInfo:false,
                result:false,
                changeScreen: false,
            },
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
            audiooutputVolume:100 ,
            //xueln 添加
            isClient:TkGlobal.isClient,
            // serverSpeed:{},
            // serverlist:{},
        };
        this.selectDevice = {
            videoinput: undefined,
            audioinput: undefined,
            audiooutput: undefined
        };
        this.oldUseServerName = '';
        // this.useServerName = '';
        this.setState( changeState ) ;
    };

    //获取用户系统信息，进入教室后的设置
    getSystemInfo() {
        let mySelfInfo = ServiceRoom.getTkRoom().getMySelf();
        let operatingSystem = TkGlobal.osType;
        this.state.testSystemInfo.currentUser = mySelfInfo.nickname;//当前用户：
        this.state.testSystemInfo.operatingSystem = operatingSystem;//操作系统
        // this.state.testSystemInfo.IPAddress = TkConstant.SERVICEINFO.webHostname;//IP地址：
        this.state.testSystemInfo.LoginDevice = mySelfInfo.devicetype;//登入设备
        this.state.testSystemInfo.mediaServer = this.useServerRealName;//媒体服务器
        this.state.testSystemInfo.coursewareServer = window.WBGlobal.docAddressKey;//文件服务器
        this.state.testSystemInfo.browser = TkUtils.getBrowserInfo().info.browserName+" "+TkUtils.getBrowserInfo().info.browserVersion;//浏览器：
        this.state.testSystemInfo.roomNumber = TkConstant.joinRoomInfo.serial;//房间号：
        this.state.testSystemInfo.versionNumber = mySelfInfo.version;//版本号
        this.setState({testSystemInfo:this.state.testSystemInfo});
    }

    // 获取设备信息数组
    systemInfoEleArr (systemInfoLanguage) {
        let networkEles = [];
        if (Object.keys(systemInfoLanguage).length > 0) {
            for (let [key,value] of Object.entries(systemInfoLanguage)) {
                networkEles.push(<li key={networkEles.length}><span>{value}</span><span>{this.state.testSystemInfo[key]}</span></li>);
            }
        }
        return networkEles;
    };

    /*镜像*/
    videoMirroringHandle(){
        this.isClick = true;
        let videoMirroring = document.getElementById("srever_mirroring");
        this.isVideoMirror=!this.isVideoMirror;
        videoMirroring.checked =this.isVideoMirror;
        this.setState({isVideoMirror:this.isVideoMirror});
    }

    /*主副屏幕切换*/
    _mainMinorChange(){
        this.setState({switchScreen:!this.state.switchScreen});
        return false;
    }

    render(){
        let that = this ;
        let { show  , selectShow , devicesDesc  , audiooutputVolume } = that.state ;
        let {isEnter, titleText , okText , hasBgImg} = that.props;
        let { audioinputElementArray ,  audiooutputElementArray , videoinputElementArray } = that._loadDeviceElementByDeviceDescArray(devicesDesc);
        let serverNameEleArr = this._getServerListEle() ;
        let audiooutputVolumeItemArray = [];
        for(let i=0 ; i< 16 ; i++){
            audiooutputVolumeItemArray.push(
                <li key={i} className="audiooutput-volume-item" ></li>
            );
        }
        let isVideoMirror = this.state.isVideoMirror === 'true' || this.state.isVideoMirror === true;
        // let isLoadVideoMirror =  TkConstant.joinRoomInfo.isConfigVideoMirror &&!( TkConstant.joinRoomInfo.isDoubleScreenDisplay && TkGlobal.isClient ); //是否加载视频镜像 ， TODO 双屏模式暂时隐藏 镜像模式
        return (
            <article id="main_detection_device" className={"device-test all-children-user-select-none" + (hasBgImg?' opcityBg':'')} style={{display: !show ? 'none' : 'block'}}>
                <div className="testing-bot">
                    {hasBgImg ? <div className="net-testing">
                        <span className="device-test-header">{titleText || TkGlobal.language.languageData.login.language.detection.deviceTestHeader.device.text}</span>
                        <button id="close-detection" className="close-detection" onClick={that.closeButtonOnClick.bind(that , -1)} style={{display:isEnter?"none":"block"}}></button>
                    </div>:undefined}
                    <div className={"testing-left en-testing-left"+(hasBgImg?' opcityBg':'')}>
                        <ul id="testing_box" className="testing-box">
                            <li className={"network-pic testing-option" + (selectShow.networkinput?' active':'') + (hasBgImg?' opcityBg':'')}  style={{ display:(isEnter || !TkConstant.hasRole.roleTeachingAssistant)?'none':'block'}} onClick={that._cutDetectionItem.bind(that,isEnter , 1 , 'networkinput')}>
                                <div className="networkpic" style={{'display':hasBgImg?'none':'block'}}></div>
                                <span className="en-pic">{TkGlobal.language.languageData.login.language.detection.deviceTestHeader.optimalServer.text}</span>
                                <span className="green-video tk-img  icon_right" />
                                <span className="red-video tk-img  icon_warn" />
                            </li>
                            {/*todo 暂时mac客户端在课堂里显示视频检测,但是隐藏视频框*/}
                            {
                                /*!this.props.isEnter && TkGlobal.isMacClient ? undefined :*/
                                    <li className={"video-pic testing-option" + (selectShow.videoinput ? ' active' : '') + ( !selectShow.videoinput && (selectShow.audiooutput || selectShow.audioinput || selectShow.result)  && !hasBgImg ?" yes":"") + (hasBgImg?' opcityBg':'') }
                                        onClick={that._cutDetectionItem.bind(that, isEnter, 2, 'videoinput')} style={{display:this.props.isEnter?'block':((TkGlobal.isOnlyAudioRoom || !TkConstant.joinRoomInfo.isHasVideo)?"none":"")}}>
                                        <div className="videopic" style={{'display':hasBgImg?'none':'block'}}>
                                            {hasBgImg ? undefined : <span className="line"></span>}
                                        </div>

                                        <span className="en-pic">{TkGlobal.language.languageData.login.language.detection.deviceTestHeader.videoinput.text}</span>
                                        <span className="green-video tk-img  icon_right"></span>
                                        <span className="red-video tk-img  icon_warn"></span>
                                    </li>
                            }
                            <li className={"listen-pic testing-option"+ (selectShow.audiooutput?' active':'') + ( !selectShow.audiooutput  && (selectShow.audioinput || selectShow.result) && !hasBgImg ?" yes":"") + (hasBgImg?' opcityBg':'') } onClick={that._cutDetectionItem.bind(that,isEnter,3, 'audiooutput')}>
                                <div className="listenpic" style={{'display':hasBgImg?'none':'block'}}>
                                    {hasBgImg ? undefined : <span className="line"></span>}
                                </div>
                                <span className="en-pic">{TkGlobal.language.languageData.login.language.detection.deviceTestHeader.audioouput.text}</span>
                                <span className="green-listen tk-img  icon_right "></span>
                                <span className="red-listen tk-img  icon_warn "></span>
                            </li>

                            <li className={"speak-pic testing-option"+ (selectShow.audioinput?' active':'') + ( !selectShow.audioinput && (selectShow.result) && !hasBgImg ?" yes":"")  + (hasBgImg?' opcityBg':'') } onClick={that._cutDetectionItem.bind(that,isEnter,4, 'audioinput')}>
                                <div className="speakpic" style={{'display':hasBgImg?'none':'block'}}>
                                    {hasBgImg ? undefined : <span className="line"></span>}
                                </div>
                                <span className="en-pic">{TkGlobal.language.languageData.login.language.detection.deviceTestHeader.audioinput.text}</span>
                                <span className="green-speak tk-img  icon_right "></span>
                                <span className="red-speak tk-img  icon_warn "></span>
                            </li>
                            <li className={"result-pic testing-option"+ (selectShow.result?' active':'')} style={{ display:isEnter?'block':'none'}}>
                                <div className="resultpic" style={{'display':hasBgImg?'none':'block'}}></div>
                                <span className="en-pic">{TkGlobal.language.languageData.login.language.detection.deviceTestHeader.detectionResult.text}</span>
                            </li>
                            {/*{双屏设置新界面暂时隐藏*/}
                                {/*TkConstant.joinRoomInfo.isDoubleScreenDisplay  && TkGlobal.isClient ?*/}
                                {/*<li className={"change-screen testing-option"+ (selectShow.changeScreen?' active':'')} style={{ display:isEnter?'none':'block'}} onClick={that._cutDetectionItem.bind(that,isEnter,0, 'changeScreen')}>*/}
                                    {/*<span className="changeScreen en-pic">{TkGlobal.language.languageData.login.language.detection.deviceTestHeader.changeScreen.text}</span>*/}
                                {/*</li>*/}
                                {/*: undefined*/}
                            {/*}*/}
							<li className={"systemInfo-pic testing-option"+ (selectShow.systemInfo?' active':'') + (hasBgImg?' opcityBg':'')} style={{ display:isEnter?'none':'block'}} onClick={that._cutDetectionItem.bind(that,isEnter,5, 'systemInfo')}>
                                <div className="systemInfoPic" style={{'display':hasBgImg?'none':'block'}}></div>
                                <span className="en-pic">{TkGlobal.language.languageData.login.language.detection.deviceTestHeader.systemInfo.text}</span>
                            </li>

                        </ul>
                    </div>
                    <div className={"testing-right  en-testing-right"+(hasBgImg?' opcityBg':'')}>
                            <div className="network-right fixldy" id="skip-network" style={{ display:(isEnter && !TkConstant.hasRole.roleTeachingAssistant)?'none':(selectShow.networkinput?'block':'none')}} >
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
					   {/*todo 暂时mac客户端在课堂里显示视频检测 但是隐藏视频框*/}
                       {
                           /*!this.props.isEnter && TkGlobal.isMacClient ? undefined :*/
                               <div className="video-right fixldy" id="skip-video" style={{ display:this.props.isEnter && selectShow.videoinput?'block':(selectShow.videoinput && !TkGlobal.isOnlyAudioRoom?'block':'none' )}} >
                                <div className="video-right-inside device-right-inside">
                                    <div className="camera-option-all clear-float">
                                        <span className="camera-option">{TkGlobal.language.languageData.login.language.detection.videoinputExtend.cameraOptionAll.cameraOption.text}</span>
                                        <div className="styled-select" id="video-select">
                                            {/*<select id="videoSource" value={that.state.selectDevice.videoinput} className="no-camera-option" onChange={that.changeSelectDeviceOnChange.bind(that ,'videoinput' ) } >
                                                {videoinputElementArray}
                                            </select>*/}
                                            <SelectDumb
                                                id="videoSource"
                                                className="dropDownBox"
                                                selectOptions={videoinputElementArray}
                                                currentValue={that.state.selectDevice.videoinput}
                                                disabled={false}
                                                onChange={that.changeSelectDeviceOnChange.bind(that ,'videoinput' ) }
                                            />
                                        </div>
                                    </div>
                                    <div className="notice-red">
                                        {TkGlobal.language.languageData.login.language.detection.videoinputExtend.cameraOptionAll.noticeRed.text}
                                    </div>
                                    <div className={"camera-black" + (!this.props.isEnter && TkGlobal.isMacClient?' hide-video':'')} id="camera-black">
                                        <div className={'videoinput_video_stream '+(isVideoMirror?"video-mirror ":" ")} id="videoinput_video_stream" />
                                    </div>
                                    <div className="mirroring-Mode">
                                         <span className="mirroring-mode-text">{TkGlobal.language.languageData.login.language.detection.mirrorMode.text}</span>
                                         <input type="radio" id="srever_mirroring" name="selectMirroring"  onClick={that.videoMirroringHandle.bind(that)}  value={"cn"}/>
                                         {/*<button onClick={that.setOnlyAudioClassRoomHandle.bind(that)}>纯音频教室</button>*/}
                                    </div>
                                    <div className="notice-carmera">
                                        <p>{TkGlobal.language.languageData.login.language.detection.videoinputExtend.noticeCarmera.one}</p>
                                        <p>{TkGlobal.language.languageData.login.language.detection.videoinputExtend.noticeCarmera.two}</p>
                                        <p >{TkGlobal.language.languageData.login.language.detection.videoinputExtend.noticeCarmera.three}</p>
                                        <p >{TkGlobal.language.languageData.login.language.detection.videoinputExtend.noticeCarmera.four}</p>
                                        <p>{TkGlobal.language.languageData.login.language.detection.videoinputExtend.noticeCarmera.five}</p>
                                        <p>{TkGlobal.language.languageData.login.language.detection.videoinputExtend.noticeCarmera.six}</p>
                                        <p>{TkGlobal.language.languageData.login.language.detection.videoinputExtend.noticeCarmera.seven}</p>

                                    </div>
                                </div>
                                <div className="see-button" style={{display:isEnter?"none":"block"}}>
                                    <button className="can-see detection-result-btn" onClick={that.okButtonOnClick.bind(that , 4)} >{okText}</button>
                                </div>
                                <div className="detection-result" style={{display:isEnter?"flex":"none"}}>
                                    <button className="not-see detection-result-btn" onClick={that.nextButtonOnClick.bind(that , 'audiooutput' , true , 2 ,'video',false)} >{TkGlobal.language.languageData.login.language.detection.button.notSee.text}</button>
                                    <button className="can-see detection-result-btn" style={{display:this.state.hasDetection.videoinput?'block':'none'}} onClick={that.nextButtonOnClick.bind(that , 'audiooutput' , true , 2 ,'video',true)} >{TkGlobal.language.languageData.login.language.detection.button.canSee.text}</button>
                                </div>

                                {/*<div className="see-button">
                                 <button className="can-see detection-result-btn"  onClick={isEnter?that.nextButtonOnClick.bind(that , 'audiooutput' , true , 2 ):that.okButtonOnClick.bind(that , 4)} >{isEnter?TkGlobal.language.languageData.login.language.detection.button.next.text:okText}</button>
                                 </div>*/}

                            </div>
                       }

                            <div className="listen-right fixldy" id="skip-listen" style={{ display:selectShow.audiooutput?'block':'none' }} >
                                <div className="listen-right-inside device-right-inside">
                                    <div className="camera-option-all clear-float">
                                        <span className="camera-option">{TkGlobal.language.languageData.login.language.detection.audioouputExtend.cameraOptionAll.cameraOption.text}</span>
                                        <div className="styled-select">
                                            {/*<select id="audioOutput" value={that.state.selectDevice.audiooutput} className="no-camera-option" onChange={that.changeSelectDeviceOnChange.bind(that  ,'audiooutput' ) } >
                                                {audiooutputElementArray}
                                            </select>*/}
                                            <SelectDumb
                                                id="audioOutput"
                                                className="dropDownBox"
                                                selectOptions={audiooutputElementArray}
                                                currentValue={that.state.selectDevice.audiooutput}
                                                disabled={false}
                                                onChange={that.changeSelectDeviceOnChange.bind(that  ,'audiooutput' ) }
                                            />
                                        </div>
                                    </div>
                                    <div className="click-music clear-float">
                                        <ul className="music-play">
                                            {/*<li><span className="clickmusic">{TkGlobal.language.languageData.login.language.detection.audioouputExtend.cameraOptionAll.clickmusic.one}</span>*/}
                                            {/*</li>*/}

                                            <li className="listen-sure">
                                                <span >{TkGlobal.language.languageData.login.language.detection.audioouputExtend.cameraOptionAll.clickmusic.one}</span>
                                            </li>
                                            <li className="musicplay-pic">
                                                <button className="play-music"  onClick={that.playAudioToAudiooutput.bind(that , 'music_audio' , true ) } >{TkGlobal.language.languageData.login.language.detection.audioouputExtend.cameraOptionAll.playMusic}</button>
                                                {TK.isTkNative && TK.subscribe_from_native?undefined:<audio id="music_audio" src="./music/detectionDevice_default.wav" className="audio-play" />}
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="sound-vol">
                                        <div className="sound-btn icon_volume tk-img "></div>
                                        <TkSliderDumb className={"tk-slider tk-detection-device"} value={this.audiooutputVolume !== undefined ?this.audiooutputVolume : audiooutputVolume}   onBeforeChange={that.handerVolumeOnBeforeChange.bind(that)}  onAfterChange={that.handerVolumeOnAfterChange.bind(that)}    />
                                        <span className="txtValue" >{audiooutputVolume}</span>
                                    </div>
                                    <div className="notice-carmera">
                                        <p>{TkGlobal.language.languageData.login.language.detection.audioouputExtend.noticeCarmera.one}</p>
                                        <p>{TkGlobal.language.languageData.login.language.detection.audioouputExtend.noticeCarmera.two}</p>
                                        <p >{TkGlobal.language.languageData.login.language.detection.audioouputExtend.noticeCarmera.three}</p>
                                        <p >{TkGlobal.language.languageData.login.language.detection.audioouputExtend.noticeCarmera.four}</p>
                                        <p>{TkGlobal.language.languageData.login.language.detection.audioouputExtend.noticeCarmera.five}</p>
                                        <p>{TkGlobal.language.languageData.login.language.detection.audioouputExtend.noticeCarmera.six}</p>
                                        <p>{TkGlobal.language.languageData.login.language.detection.audioouputExtend.noticeCarmera.seven}</p>
                                    </div>
                                </div>
                                <div className="listen-button"  style={{display:isEnter?"none":"block"}}>
                                    <button className="can-listen detection-result-btn" onClick={that.okButtonOnClick.bind(that , 4) }>{okText}</button>
                                </div>
                                <div className="detection-result" style={{display:isEnter?"flex":"none"}}>
                                    <button className="not-listen detection-result-btn" onClick={that.nextButtonOnClick.bind(that , 'audioinput' , true , 3 ,'telephone',false)}>{TkGlobal.language.languageData.login.language.detection.button.notListen.text}</button>
                                    <button className="can-listen detection-result-btn" style={{display:this.state.hasDetection.audiooutput?'block':'none'}} onClick={that.nextButtonOnClick.bind(that , 'audioinput' , true , 3 ,'telephone',true)}>{TkGlobal.language.languageData.login.language.detection.button.canListen.text}</button>
                                </div>

                                {/*<div className="listen-button">
                                 <button className="can-listen detection-result-btn"   onClick={isEnter?that.nextButtonOnClick.bind(that , 'audioinput' , true , 3 ):that.okButtonOnClick.bind(that , 4) }   >{isEnter?TkGlobal.language.languageData.login.language.detection.button.next.text:okText}</button>
                                 </div>*/}

                            </div>

                            <div className="speak-right fixldy" id="skip-speak" style={{ display:selectShow.audioinput?'block':'none' }} >
                                <div className="speak-right-inside device-right-inside">
                                    <div className="camera-option-all clear-float ">
                                        <span className="camera-option">{TkGlobal.language.languageData.login.language.detection.audioinputExtend.cameraOptionAll.cameraOption.text}</span>
                                        <div className="styled-select">
                                            {/*<select id="audioSource" className="no-camera-option" value={that.state.selectDevice.audioinput}  onChange={that.changeSelectDeviceOnChange.bind(that  ,'audioinput' ) } >
                                                {audioinputElementArray}
                                            </select>*/}
                                            <SelectDumb
                                                id="audioSource"
                                                className="dropDownBox"
                                                selectOptions={audioinputElementArray}
                                                currentValue={that.state.selectDevice.audioinput}
                                                disabled={false}
                                                onChange={that.changeSelectDeviceOnChange.bind(that  ,'audioinput' ) }
                                            />
                                        </div>
                                    </div>
                                    <div className="notice-red">
                                        {TkGlobal.language.languageData.login.language.detection.audioinputExtend.cameraOptionAll.noticeRed.text}
                                    </div>
                                    <div  id="audioinput_audio_stream"  className="audioinput-audio-detection add-display-none" />
                                    <div className="speak-sound">
                                        {TkGlobal.language.languageData.login.language.detection.audioinputExtend.cameraOptionAll.speakSound.text}
                                    </div>
                                    <div className="sound-green">
                                        <ul id="volume_audioinput_container">
                                            {audiooutputVolumeItemArray}
                                        </ul>
                                    </div>
                                    <div className="notice-carmera">
                                        <p>{TkGlobal.language.languageData.login.language.detection.audioinputExtend.noticeCarmera.one}</p>
                                        <p>{TkGlobal.language.languageData.login.language.detection.audioinputExtend.noticeCarmera.two}</p>
                                        <p>{TkGlobal.language.languageData.login.language.detection.audioinputExtend.noticeCarmera.three}</p>
                                        <p>{TkGlobal.language.languageData.login.language.detection.audioinputExtend.noticeCarmera.four}</p>
                                        <p>{TkGlobal.language.languageData.login.language.detection.audioinputExtend.noticeCarmera.five}</p>
                                        <p>{TkGlobal.language.languageData.login.language.detection.audioinputExtend.noticeCarmera.six}</p>
                                        <p>{TkGlobal.language.languageData.login.language.detection.audioinputExtend.noticeCarmera.seven}</p>
                                    </div>
                                </div>
                                <div className="speak-button" style={{display:isEnter?"none":"block"}}>
                                    <button className="can-speak detection-result-btn" onClick={that.okButtonOnClick.bind(that , 4)}  >{okText}</button>
                                </div>
                                <div className="detection-result" style={{display:isEnter?"flex":"none"}}>
                                    <button className="not-speak detection-result-btn" onClick={that.nextButtonOnClick.bind(that , 'result' , true , 4 ,'voiceTube',false)}  >{TkGlobal.language.languageData.login.language.detection.button.notSpeak.text}</button>
                                    <button className="can-speak detection-result-btn" style={{display:this.state.hasDetection.audioinput?'block':'none'}} onClick={that.nextButtonOnClick.bind(that , 'result' , true , 4 ,'voiceTube',true)}  >{TkGlobal.language.languageData.login.language.detection.button.canSpeak.text}</button>
                                </div>

                                {/*<div className="other-button">
                                 <button className="can-other detection-result-btn"   onClick={that.okButtonOnClick.bind(that , 4)}  >{okText || TkGlobal.language.languageData.login.language.detection.button.join.text}</button>
                                 </div>*/}

                            </div>
                            <div className="systemInfo-right fixldy" id="skip-SystemInfo" style={{ display:isEnter?'none':(selectShow.systemInfo?'block':'none') }} >
                                <div className="network-right-inside device-right-inside">
                                    <ul className="systemInfo-content">
                                        {this.systemInfoEleArr(this.systemInfoLanguage)}
                                    </ul>
                                </div>
                                <div className="systemInfo-button">
                                    <button className="detection-result-btn" onClick={that.okButtonOnClick.bind(that , 4)}  >{okText}</button>
                                </div>
                            </div>

                            <div className="result-right fixldy" id="skip-result" style={{ display:isEnter?(selectShow.result?'block':'none'):'none' }} >
                                <div className="result-right-inside device-right-inside">
                                    {/*<h3 className="result-head">{TkGlobal.language.languageData.login.language.detection.resultExtend.head.text}</h3>*/}
                                    <dl className="result-box">
                                        <dt>
                                            <span>{TkGlobal.language.languageData.login.language.detection.resultExtend.item1.text}</span>
                                            <span>{TkGlobal.language.languageData.login.language.detection.resultExtend.item2.text}</span>
                                            <span>{TkGlobal.language.languageData.login.language.detection.resultExtend.item3.text}</span>
                                        </dt>
                                        <dd className={this.detectionResult.canSee?"colorGreen":"colorRed"}>
                                            <span >{TkGlobal.language.languageData.login.language.detection.deviceTestHeader.videoinput.text}</span>
                                            <span>{this.detectionResult.canSee?TkGlobal.language.languageData.login.language.detection.resultExtend.item2.content.normal:TkGlobal.language.languageData.login.language.detection.resultExtend.item2.content.abnormal}</span>
                                            <span>{this.detectionResult.canSee?TkGlobal.language.languageData.login.language.detection.resultExtend.item4.content.video:TkGlobal.language.languageData.login.language.detection.resultExtend.item3.content.video}</span>
                                        </dd>
                                        <dd className={this.detectionResult.canListen?"colorGreen":"colorRed"}>
                                            <span >{TkGlobal.language.languageData.login.language.detection.deviceTestHeader.audioouput.text}</span>
                                            <span>{this.detectionResult.canListen?TkGlobal.language.languageData.login.language.detection.resultExtend.item2.content.normal:TkGlobal.language.languageData.login.language.detection.resultExtend.item2.content.abnormal}</span>
                                            <span>{this.detectionResult.canListen?TkGlobal.language.languageData.login.language.detection.resultExtend.item4.content.listen:TkGlobal.language.languageData.login.language.detection.resultExtend.item3.content.listen}</span>
                                        </dd>
                                        <dd className={this.detectionResult.canSpeak?"colorGreen":"colorRed"}>
                                            <span >{TkGlobal.language.languageData.login.language.detection.deviceTestHeader.audioinput.text}</span>
                                            <span>{this.detectionResult.canSpeak?TkGlobal.language.languageData.login.language.detection.resultExtend.item2.content.normal:TkGlobal.language.languageData.login.language.detection.resultExtend.item2.content.abnormal}</span>
                                            <span>{this.detectionResult.canSpeak?TkGlobal.language.languageData.login.language.detection.resultExtend.item4.content.speak:TkGlobal.language.languageData.login.language.detection.resultExtend.item3.content.speak}</span>
                                        </dd>
                                    </dl>
                                </div>
                                <div className="detection-result" >
                                    <button className="check-back detection-result-btn" onClick={that.nextButtonOnClick.bind(that , 'videoinput' , true , 1 )}  >{TkGlobal.language.languageData.login.language.detection.button.checkBack.text}</button>
                                    <button className="join-room detection-result-btn" onClick={that.okButtonOnClick.bind(that , 4)}  >{TkGlobal.language.languageData.login.language.detection.button.joinRoom.text}</button>
                                </div>
                            </div>

                       {
                           TkConstant.joinRoomInfo.isDoubleScreenDisplay && TkGlobal.isClient?
                               <div className="changeScreen-content fixldy" style={{display: (selectShow.changeScreen?'block':'none')}}>
                                   <div className="changeScreen-right">
                                       <span className="switchScreen-desc">{TkGlobal.language.languageData.login.language.detection.deviceTestHeader.MainMinorChange.text}</span>
                                       <input type="checkbox" name="switch-screen" id="mainMinorChange-btn" onChange={that._mainMinorChange.bind(that)} checked={that.state.switchScreen}/>
                                       <div className={TkGlobal.switchScreen?"switch-content show":"switch-content "}> </div>
                                       <button className="switch-screen detection-result-btn" onClick={that.okButtonOnClick.bind(that , 6)}  >{okText}</button>
                                   </div>
                               </div> : undefined
                       }

                        </div>
                </div>
            </article>
        )
    };
};
export  default  MainDetectionDeviceSmart ;

