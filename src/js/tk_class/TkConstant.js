/**
 * TK常量类
 * @class TkConstant
 * @description   提供 TK系统所需的常量
 * @author QiuShao
 * @date 2017/7/21
 */
'use strict';
import TkUtils from 'TkUtils';
import eventObjectDefine from 'eventObjectDefine';
import TkGlobal from 'TkGlobal';
import ServiceRoom from 'ServiceRoom';

const TkConstant = {} ;
/*版本号*/
let VERSIONS  =  'v3.2.0' , VERSIONSTIME = '2018102520' ,  DEV = false ;
try{
    VERSIONS = __VERSIONS__ ;
    VERSIONSTIME = __VERSIONSTIME__ ;
    DEV =  __DEV__ ;
}catch (e){
    L.Logger.warning('There is no configuration version number and version time[__VERSIONS__ , __VERSIONSTIME__]!');
    L.Logger.warning('There is no configuration dev mark[__DEV__]!');
}
TkConstant.VERSIONS = VERSIONS ; //系统版本号
TkConstant.VERSIONSTIME = VERSIONSTIME ; //系统版本号更新时间
TkConstant.newpptVersions = 2017091401 ; //动态ppt的版本
TkConstant.remoteNewpptUpdateTime = 2018032113 ; //远程动态PPT文件更新时间
TkConstant.debugFromAddress = TkUtils.getUrlParams('debug') ? TkUtils.getUrlParams('debug') != "" : false  ; //从地址栏设置系统为debug状态
TkConstant.DEV = DEV ||  TkConstant.debugFromAddress; //系统是否处于开发者状态
/*角色对象*/
TkConstant.role = {};
Object.defineProperties(TkConstant.role, {
    //0：主讲  1：助教    2: 学员   3：直播用户 4:巡检员　10:系统管理员　11:企业管理员　12:管理员 , -1:回放者
    roleChairman: {
        value: 0,
        writable: false,
    },
    roleTeachingAssistant: {
        value: 1,
        writable: false,
    },
    roleStudent: {
        value: 2,
        writable: false,
    },
    roleAudit: {
        value: 3,
        writable: false,
    },
    rolePatrol: {
        value: 4,
        writable: false,
    },
    rolePlayback:{
        value: -1,
        writable: false,
    },
    roleRecord:{
        value:88,
        writable:false
    }
});

const RoomEvent = {};//房间事件
Object.defineProperties(RoomEvent, {
    roomConnected: { //room-connected 房间连接成功事件
        value: 'room-connected',
        writable: false,
        enumerable: true,
    },
    roomConnectFail: { //room-connect-fail 房间连接失败事件
        value: 'room-connect-fail',
        writable: false,
        enumerable: true,
    },
    roomCheckroom: { //room-checkroom 房间检测事件
        value: 'room-checkroom',
        writable: false,
        enumerable: true,
    },
    roomCheckroomPlayback: { //room-checkroom-playback 回放的checkroom事件
        value: 'room-checkroom-playback',
        writable: false,
        enumerable: true,
    },
    roomParticipantJoin: { //room-participant_join 参与者加入房间事件
        value: 'room-participant_join',
        writable: false,
        enumerable: true,
    },
    roomAudiovideostateSwitched: { //room-audiovideostate-switched 纯音频房间切换事件
        value: 'room-audiovideostate-switched',
        writable: false,
        enumerable: true,
    },
    roomModeChanged: { //room-mode-changed 房间模式切换
        value: 'room-mode-changed',
        writable: false,
        enumerable: true,
    },
    roomUsernetworkstateChanged: { //room-usernetworkstate-changed 用户网络状态改变
        value: 'room-usernetworkstate-changed',
        writable: false,
        enumerable: true,
    },
    roomUserscreenstateChanged: { //room-userscreenstate-changed 桌面区域共享事件
        value: 'room-userscreenstate-changed',
        writable: false,
        enumerable: true,
    },
    roomParticipantLeave: {  //room-participant_leave  参与者离开房间事件
        value: 'room-participant_leave',
        writable: false,
        enumerable: true,
    },
    roomParticipantEvicted: {  //room-participant_evicted 参与者被踢事件
        value: 'room-participant_evicted',
        writable: false,
        enumerable: true,
    },
    roomTextMessage: { //	room-text-message 聊天消息事件
        value: 'room-text-message',
        writable: false,
        enumerable: true,
    },
    roomPubmsg: {  //room-pubmsg pubMsg消息事件
        value: 'room-pubmsg',
        writable: false,
        enumerable: true,
    },
    roomDelmsg: {  //room-delmsg delMsg消息事件
        value: 'room-delmsg',
        writable: false,
        enumerable: true,
    },
    roomMsglist: {  //room-msglist msglist消息事件
        value: 'room-msglist',
        writable: false,
        enumerable: true,
    },
    roomUserpropertyChanged: {  //room-userproperty-changed setProperty消息事件
        value: 'room-userproperty-changed',
        writable: false,
        enumerable: true,
    },
    roomUservideostateChanged: {  //room-uservideostate-changed 用户视频发布状态改变
        value: 'room-uservideostate-changed',
        writable: false,
        enumerable: true,
    },
    roomUseraudiostateChanged: {  //room-useraudiostate-changed 用户音频发布状态改变
        value: 'room-useraudiostate-changed',
        writable: false,
        enumerable: true,
    },
    roomFiles: {  //room-files 房间文件消息事件
        value: 'room-files',
        writable: false,
        enumerable: true,
    },
    roomAddFile: {  //room-add-file 房间增加文件的事件
        value: 'room-add-file',
        writable: false,
        enumerable: true,
    },
    roomDeleteFile: {  //room-delete-file 房间删除文件的事件
        value: 'room-delete-file',
        writable: false,
        enumerable: true,
    },
    roomUpdateFile: {  //room-update-file 房间更新文件的事件
        value: 'room-update-file',
        writable: false,
        enumerable: true,
    },
    roomDisconnected: {  // room-disconnected 房间失去连接事件
        value: 'room-disconnected',
        writable: false,
        enumerable: true,
    },
    roomLeaveroom: {  //room-leaveroom：sockit断开
        value: 'room-leaveroom',
        writable: false,
        enumerable: true,
    },
    roomPlaybackClearAll:{//room-playback-clear_all：回放清除所有信令生成的数据
        value: 'room-playback-clear_all',
        writable: false,
        enumerable: true,
    },
    roomPlaybackDuration:{//room-playback-duration：回放的开始和结束时间
        value: 'room-playback-duration',
        writable: false,
        enumerable: true,
    },
    roomPlaybackPlaybackEnd:{//room-playback-playbackEnd：服务器回放播放结束，收到的通知消息
        value: 'room-playback-playbackEnd',
        writable: false,
        enumerable: true,
    },
    roomPlaybackPlaybackUpdatetime:{//room-playback-playback_updatetime：服务器回放的播放时间更新
        value: 'room-playback-playback_updatetime',
        writable: false,
        enumerable: true,
    },
    roomPlaybackClearAllFromPlaybackController:{//room-playback-clear_all-from-playback-controller：回放清除所有信令生成的数据(来自于回放控制器触发)
        value: 'room-playback-clear_all-from-playback-controller',
        writable: false,
        enumerable: true,
    },
    //TODO ...
    getUserMediaFailure:{//getUserMedia_failure：getUserMeida失败的事件通知
        value: 'getUserMedia_failure',
        writable: false,
        enumerable: true,
    },
    roomServeraddressUpdate:{ //roomServeraddressUpdate 更新服务器地址信息
        value: 'room-serveraddress-update',
        writable: false,
        enumerable: true,
    },
    roomNativeNotification:{ //room-native-notification 客户端推送的通知消息
        value: 'room-native-notification',
        writable: false,
        enumerable: true,
    },
    roomErrorNotice:{ //room-error-notice 错误消息通知
        value: 'room-error-notice',
        writable: false,
        enumerable: true,
    },
    deviceNotAvailable:{ //device-not-available 媒体设备不可用
        value: 'device-not-available',
        writable: false,
        enumerable: true,
    },
    accessAccepted:{ //access-accepted 音频设备或视频设备可以（开始）采集数据。如：麦克风不可用，摄像头可用，仍会发送该事件。//todo 多流sdk已取消此事件
        value: 'access-accepted',
        writable: false,
        enumerable: true,
    },
    accessDenied:{ //access-denied 媒体设备不可用//todo 多流sdk已取消此事件
        value: 'access-denied',
        writable: false,
        enumerable: true,
    },
});
const StreamEvent = {};//数据流事件
Object.defineProperties(StreamEvent, {
    accessAccepted: { //getUserMedia 接受（成功）---access-accepted事件
        value: 'access-accepted',
        writable: false,
        enumerable: true,
    },
    accessDenied: {  //getUserMedia 拒绝（失败）--- access-denied事件
        value: 'access-denied',
        writable: false,
        enumerable: true,
    },
    streamEnded: {  //track结束（通过track的onended事件监听来触发）--- stream-ended事件
        value: 'stream-ended',
        writable: false,
    },
});
const WindowEvent = {};//window事件
Object.defineProperties(WindowEvent, {
    onResize: { //onResize 窗口改变事件
        value: 'onResize',
        writable: false,
    },
    onMessage: { //message
        value: 'onMessage',
        writable: false,
    },
    onBeforeUnload: { //onBeforeUnload 浏览器离开事件
        value: 'onBeforeUnload',
        writable: false,
    },
});


const DocumentEvent = {};//document事件
Object.defineProperties(DocumentEvent, {
    onKeydown: { //onKeydown 键盘按下事件
        value: 'onKeydown',
        writable: false,
    },
    onFullscreenchange:{ //onFullscreenchange 全屏状态改变事件
        value: 'onFullscreenchange',
        writable: false,
    }
});
const WebDaoEvent = {};//web接口操作事件
Object.defineProperties(WebDaoEvent, {
    getGiftInfo: { //获取礼物接口后触发的事件
        value: 'get-gift-info',
        writable: false,
        enumerable: true,
    },
    sendGift: { //发送礼物接口后触发的事件
        value: 'send-gift',
        writable: false,
        enumerable: true,
    },
    roomStart: { //上课发送的web接口roomstart后触发的事件
        value: 'room-start',
        writable: false,
        enumerable: true,
    },
    roomOver: { //下课发送的web接口roomover后触发的事件
        value: 'room-over',
        writable: false,
        enumerable: true,
    },
});
const OtherEvent = {};//其它事件
Object.defineProperties(OtherEvent, {
    initSystemStyleJson:{
        value: 'init-system-style-json',
        writable: false,
    },
    updateSystemStyleJson:{
        value: 'update-system-style-json',
        writable: false,
    },
});

/*事件类型*/
TkConstant.EVENTTYPE = {};
Object.defineProperties(TkConstant.EVENTTYPE, {
    RoomEvent:{
        value: RoomEvent,
        writable: false,
    },
    StreamEvent:{
        value: StreamEvent,
        writable: false,
    },
    WindowEvent:{
        value: WindowEvent,
        writable: false,
    },
    DocumentEvent:{
        value: DocumentEvent,
        writable: false,
    },
    WebDaoEvent:{
        value: WebDaoEvent,
        writable: false,
    },
    OtherEvent:{
        value: OtherEvent,
        writable: false,
    }
});

/*房间类型*/
TkConstant.ROOMTYPE = {};
Object.defineProperties(TkConstant.ROOMTYPE, {
    //1：1 ， 1：6 ， 1：多 , 大讲堂（直播）
    oneToOne: { //1对1
        value: 0,
        writable: false,
    },
  /*  oneToSix: {//1对6
        value: 1,
        writable: false,
    },
    oneToMore: { //1对多
        value: 3,
        writable: false,
    },
    liveBroadcast: { // 大讲堂（直播）
        value: 10,
        writable: false,
    }*/
});

/*服务器信息*/
TkConstant.SERVICEINFO = {};
TkConstant.bindServiceinfoToTkConstant = ({protocol , web_host , web_port , doc_host , doc_port , backup_doc_host , backup_doc_port , isInit=true} = {} )=>{
    protocol = protocol ||  window.location.protocol?window.location.protocol.replace(/:/g,""):"https" ;
    let hostnameBackup = ( TkUtils.getUrlParams("host") ||  window.location.hostname ) ; //备选hostname
    if(TkGlobal.logintype !== 88){
        let tkLocalstorageServerName = L.Utils.localStorage.getItem('tkLocalstorageServerName') ;
        if( tkLocalstorageServerName && tkLocalstorageServerName !== undefined && tkLocalstorageServerName!==null && tkLocalstorageServerName!=='undefined' && tkLocalstorageServerName !=='null' ){
            let firstDotIndex = hostnameBackup.indexOf('.') ;
            if(firstDotIndex > 0 ){
                let replaceStr = hostnameBackup.substring(0 , firstDotIndex );
                let regExp = new RegExp(replaceStr);
                hostnameBackup = hostnameBackup.replace(regExp , tkLocalstorageServerName) ;
            }
        }
    }
    let hostname = web_host ||  hostnameBackup ;
    let port = web_port || (protocol === 'http') ? 80 : 443 ;
    let serviceinfo = {
        webProtocol:protocol ,
        webHostname:hostname ,
        webPort:port,
        sdkPort:TkGlobal.logintype === 88 ? 80 : 443 ,
        webProtocolAndHostname: protocol+"://"+hostname,
        webAddress:protocol+"://"+hostname+":"+port,
    };
    if(isInit){
        serviceinfo.joinUrl = TkUtils.encrypt( window.location.href ) ;
    }
    Object.customAssign(TkConstant.SERVICEINFO , serviceinfo ) ;
    if(isInit){
        console.info('encrypt_tk_info:\n' ,TkConstant.SERVICEINFO.joinUrl);
    }
    if( eventObjectDefine && eventObjectDefine.CoreController && eventObjectDefine.CoreController.dispatchEvent ){
        eventObjectDefine.CoreController.dispatchEvent({type:"bindServiceinfoToTkConstant" , message:{SERVICEINFO:TkConstant.SERVICEINFO}});
    }
};
TkConstant.bindServiceinfoToTkConstant();

/*发布状态*/
TkConstant.PUBLISHSTATE = {};
Object.defineProperties(TkConstant.PUBLISHSTATE  , {
    PUBLISH_STATE_NONE: {
        value: TK.PUBLISH_STATE_NONE , //下台,
        writable: false,
    },
    PUBLISH_STATE_AUDIOONLY: {
        value: TK.PUBLISH_STATE_AUDIOONLY , //只发布音频,
        writable: false,
    },
    PUBLISH_STATE_VIDEOONLY: {
        value: TK.PUBLISH_STATE_VIDEOONLY , //只发布视频,
        writable: false,
    },
    PUBLISH_STATE_BOTH: {
        value: TK.PUBLISH_STATE_BOTH , //音视频都发布,
        writable: false,
    },
    PUBLISH_STATE_MUTEALL: {
        value: TK.PUBLISH_STATE_MUTEALL , //音视频都关闭,
        writable: false,
    },
});

/*rem 基准大小*/
TkConstant.STANDARDSIZE = 19.2 ;


/*上传文件的类型*/
let imgFileListAccpetArr = ['bmp','jpg','jpeg','png','gif']; //图片类型
let documentFileListAccpetArr = ['xls','xlsx','ppt','pptx','doc','docx','txt','pdf'].concat(imgFileListAccpetArr) ; //普通文件类型数组
let mediaFileListAccpetArr = ['mp3','mp4'] ; //媒体文件类型数组
let h5DocumentFileListAccpetArr = ['zip'] ; //H5文件类型数组  //xgd 2017-09-21
TkConstant.FILETYPE = {
    imgFileListAccpetArr:imgFileListAccpetArr ,
    documentFileListAccpetArr:documentFileListAccpetArr ,
    mediaFileListAccpetArr:mediaFileListAccpetArr ,
    h5DocumentFileListAccpetArr:h5DocumentFileListAccpetArr ,           //xgd 2017-09-21
    imgFileListAccpet:"."+imgFileListAccpetArr.join(',.')  ,
    documentFileListAccpet:"."+documentFileListAccpetArr.join(',.') ,
    mediaFileListAccpet:"."+mediaFileListAccpetArr.join(',.')  ,
    h5DocumentFileListAccpet:"."+h5DocumentFileListAccpetArr.join(',.') ,  //xgd 2017-09-21
};


/*输出日志等级*/
TkConstant.LOGLEVEL = {};
Object.defineProperties(TkConstant.LOGLEVEL  , {
    DEBUG: {
        value: 0 ,
        writable: false,
    },
    TRACE: {
        value: 1 ,
        writable: false,
    },
    INFO: {
        value: 2 ,
        writable: false,
    },
    WARNING: {
        value: 3 ,
        writable: false,
    },
    ERROR: {
        value: 4 ,
        writable: false,
    },
    NONE: {
        value: 5 ,
        writable: false,
    },
});

/*改变上传文件的类型*/
TkConstant.changeDocumentFileListAccpetArr = (addDocumentFileType , addMediaFileType  , addH5FileType )=> {
    if(addDocumentFileType){
        if( TkUtils.isArray(addDocumentFileType) ){
            for(let value of addDocumentFileType){
                documentFileListAccpetArr.push(value);
            }
        }else if( typeof addDocumentFileType === 'string'){
            documentFileListAccpetArr.push(addDocumentFileType)
        }
    }
    if(addMediaFileType){
        if( TkUtils.isArray(addMediaFileType) ){
            for(let value of addMediaFileType){
                mediaFileListAccpetArr.push(value);
            }
        }else if( typeof addMediaFileType === 'string'){
            mediaFileListAccpetArr.push(addMediaFileType)
        }
    }
    if(addH5FileType){
        if( TkUtils.isArray(addH5FileType) ){
            for(let value of addH5FileType){
                h5DocumentFileListAccpetArr.push(value);
            }
        }else if( typeof addH5FileType === 'string'){
            h5DocumentFileListAccpetArr.push(addH5FileType)
        }
    }
    TkConstant.FILETYPE = {
        documentFileListAccpetArr:documentFileListAccpetArr ,
        mediaFileListAccpetArr:mediaFileListAccpetArr ,
        h5DocumentFileListAccpetArr:h5DocumentFileListAccpetArr ,           //xgd 2017-09-21
        documentFileListAccpet:"."+documentFileListAccpetArr.join(',.') ,
        mediaFileListAccpet:"."+mediaFileListAccpetArr.join(',.')  ,
        h5DocumentFileListAccpet:"."+h5DocumentFileListAccpetArr.join(',.') ,  //xgd 2017-09-21
    };
    eventObjectDefine.CoreController.dispatchEvent({type:'changeDocumentFileListAccpetArr'}) ;
};

/*绑定房间信息到TkConstant*/
TkConstant.joinRoomInfo = {} ;
TkConstant.bindRoomInfoToTkConstant = (joinRoomInfo)=>{
    if(!joinRoomInfo){L.Logger.error('joinRoomInfo is not exist!');return ;};
    L.Logger.debug('joinRoomInfo:' , joinRoomInfo);
    TkConstant.joinRoomInfo = joinRoomInfo ;
    eventObjectDefine.CoreController.dispatchEvent({type:"bindRoomInfoToTkConstant" , message:{joinRoomInfo:TkConstant.joinRoomInfo}});
};

/*绑定当前登录对象事是否拥有指定角色到TkConstant
 * @method bindParticipantRoleToHasRole
 * @description  [TkConstant.joinRoomInfo:加入房间的信息 , ]*/
TkConstant.hasRole = {};
TkConstant.bindParticipantHasRoleToTkConstant = ()=> {
    if(!TkConstant.joinRoomInfo){L.Logger.error('TkConstant.joinRoomInfo is not exist!');return ;};
    Object.defineProperties( TkConstant.hasRole , {
        //0：主讲  1：助教    2: 学员   3：直播用户 4:巡检员　10:系统管理员　11:企业管理员　12:管理员 , -1:回放者
        roleChairman: {
            value:TkConstant.joinRoomInfo && TkConstant.joinRoomInfo.roomrole === TkConstant.role.roleChairman ,
            writable: false ,
        },
        roleTeachingAssistant: {
            value:TkConstant.joinRoomInfo &&  TkConstant.joinRoomInfo.roomrole === TkConstant.role.roleTeachingAssistant  ,
            writable: false ,
        },
        roleStudent: {
            value:TkConstant.joinRoomInfo &&  TkConstant.joinRoomInfo.roomrole === TkConstant.role.roleStudent ,
            writable: false ,
        },
        roleAudit:{
            value:TkConstant.joinRoomInfo &&  TkConstant.joinRoomInfo.roomrole === TkConstant.role.roleAudit ,
            writable: false ,
        } ,
        rolePatrol:{
            value:TkConstant.joinRoomInfo && TkConstant.joinRoomInfo.roomrole === TkConstant.role.rolePatrol ,
            writable: false ,
        } ,
        rolePlayback:{
            value:TkConstant.joinRoomInfo && TkConstant.joinRoomInfo.roomrole === TkConstant.role.rolePlayback ,
            writable: false ,
        } ,
        roleRecord:{
            value:TkConstant.joinRoomInfo && TkConstant.joinRoomInfo.roomrole === TkConstant.role.roleRecord ,
            writable: false ,
        }

    });
    eventObjectDefine.CoreController.dispatchEvent({type:"bindParticipantHasRoleToTkConstant" , message:{hasRole:TkConstant.hasRole}});
};

/*绑定当前登录对象事是否拥有指定教室到TkConstant*/
TkConstant.hasRoomtype = {};
TkConstant.bindParticipantHasRoomtypeToTkConstant = ()=> {
    if(!TkConstant.joinRoomInfo){L.Logger.error('TkConstant.joinRoomInfo is not exist!');return ;};
    Object.defineProperties(TkConstant.hasRoomtype, {
        //1：1 ， 1：6 ， 1：多 , 大讲堂（直播）
        oneToOne: { //1对1
            value: TkConstant.joinRoomInfo && TkConstant.joinRoomInfo.roomtype === TkConstant.ROOMTYPE.oneToOne,
            writable: false,
        },
      /*  oneToSix: {//1对6
            value: TkConstant.joinRoomInfo && TkConstant.joinRoomInfo.roomtype === TkConstant.ROOMTYPE.oneToSix ,
            writable: false,
        },
        oneToMore: { //1对多
            value: TkConstant.joinRoomInfo && TkConstant.joinRoomInfo.roomtype === TkConstant.ROOMTYPE.oneToMore ,
            writable: false,
        },
        liveBroadcast: { // 大讲堂（直播）
            value: TkConstant.joinRoomInfo && TkConstant.joinRoomInfo.roomtype === TkConstant.ROOMTYPE.liveBroadcast,
            writable: false,
        }*/
    });
    eventObjectDefine.CoreController.dispatchEvent({type:"bindParticipantHasRoomtypeToTkConstant" , message:{hasRoomtype:TkConstant.hasRoomtype}});
};

/*数据流发布失败的信令StreamFailure的failuretype的值*/
TkConstant.streamFailureType = {};
Object.defineProperties(TkConstant.streamFailureType  , {//failuretype = 1 udp不通 2 publishvideo失败（除去人数超限） 3 人数超限 4 home键了 5 udp中途断掉 6 取消发布成功但是流不属于远程流
    udpNotOnceSuccess: {
        value: 1 ,
        writable: false,
    },
    publishvideoFailure_notOverrun: {
        value: 2 ,
        writable: false,
    },
    publishvideoFailure_overrun: {
        value: 3 ,
        writable: false,
    },
    mobileHome: {
        value: 4 ,
        writable: false,
    },
    udpMidwayDisconnected: {
        value: 5 ,
        writable: false,
    },
    unpublishStreamNotBelongremoteStreams:{
        value: 6,
        writable: false,
    },
});

/*添加css皮肤到界面中*/
const appendCssSkinToLink = () =>{
    switch ( TkConstant.skin ){
        case 'skin_beyond_default': //超越版默认皮肤
            if( document.getElementById('skinContainer') && !/beyond.css/.test( document.getElementById('skinContainer').href ) ){
                try{
                    document.head.removeChild( document.getElementById('skinContainer') );
                }catch (e){
                    L.Logger.error(e);
                }
            }
            if( !document.getElementById('skinContainer') ){
                $(document.head).append('<link id="skinContainer" rel="stylesheet" href="./cssTemplate/beyond.css"/>');
            }
            if($('body').hasClass('skin_black')){
                $('body').removeClass('skin_black');
            }
            break;
        case 'skin_black': //超越版默认皮肤
            if( document.getElementById('skinContainer') && !/beyond.css/.test( document.getElementById('skinContainer').href ) ){
                try{
                    document.head.removeChild( document.getElementById('skinContainer') );
                }catch (e){
                    L.Logger.error(e);
                }
            }
            if( !document.getElementById('skinContainer') ){
                $(document.head).append('<link id="skinContainer" rel="stylesheet" href="./cssTemplate/beyond.css"/>');
            }
            if ($('body').hasClass('skin_beyond_default')) {
                $('body').removeClass('skin_beyond_default');
            }
            break;
    }
};

//模板
// let templates = ['template_default' , 'template_classic','template_beyond'];
// let templateId = TkUtils.getUrlParams('tplId') ;
// if( templateId ){
//     templateId = 'template_'+templateId ;
//     for(let templateName of templates){
//         if( templateId === templateName ){
//             TkConstant.template = templateId;
//         }
//     }
// }
// TkConstant.template = TkConstant.template || 'template_beyond'; //模板(默认为template_default)
TkConstant.template = 'template_beyond';
// TkConstant.testTemplate = 'template_beyond';
/*
     template_default:默认
     template_classic:原结构模板
     template_beyond:进取版模板
*/

TkConstant.updateTemplate = (template)=> {
    let templateCopy = TkConstant.template;
    // for(let templateName of templates){
    //     if( template === templateName ){
    //         TkConstant.template = template;
    //     }
    // }
    // for(let templateName of templates){
    //     $(document.body).removeClass(templateName);
    // }
    $(document.body).removeClass(templateCopy + " " + TkConstant.template + " " + (TkGlobal.isClient?'clientApp':'webpageApp') ).addClass(TkConstant.template+" "+ (TkGlobal.isClient?'clientApp':'webpageApp') ).attr("tkcustomdatatemplate", TkConstant.template);
    eventObjectDefine.CoreController.dispatchEvent({type: TkConstant.EVENTTYPE.OtherEvent.initSystemStyleJson});
    eventObjectDefine.CoreController.dispatchEvent({type: "updateTemplate", message: {template: TkConstant.template}});
};


//  skinId 写死
// let skinId = TkUtils.getUrlParams('skinId') ;
let skinId ='beyond'
if( skinId ){
    TkConstant.skin = 'skin_'+skinId ;
}
TkConstant.skin = TkConstant.skin || 'skin_beyond_default'; //皮肤(默认为skin_default)
// TkConstant.testSkin = 'skin_black';

/*
 skin_default:默认
 skin_black:黑色严肃皮肤，适用于default模板
 skin_origin:黑色标准版皮肤，适用于classic模板
 skin_beyond_default:进取版默认皮肤，适用于beyond模板
 */

/*更新皮肤*/
TkConstant.updateSkin = (skin)=>{
    let skinCopy = TkConstant.skin ;
    if(skin === 'skin_default'|| skin === 'skin_purple' || skin === 'skin_beyond_default'){
        skin = 'skin_beyond_default';
    }
    TkConstant.skin = skin ;
    appendCssSkinToLink();
    $(document.body).removeClass('skin_beyond_default' ).removeClass('skin_black').addClass(TkConstant.skin+" " ).attr("tkcustomdataskin", TkConstant.skin);
    eventObjectDefine.CoreController.dispatchEvent({type: "updateSkin", message: {skin: TkConstant.skin}});
};

/**
 * layout   1 视频在上   2视频在下
 */
let layoutId = TkUtils.getUrlParams('layout') ;
if( layoutId ){
    TkConstant.layout = 'layout_'+layoutId ;
}
TkConstant.layout = TkConstant.layout || 'layout_1'; 

window.TkConstant = TkConstant ;
export  default TkConstant ;
