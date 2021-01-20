/**
 * TK全局变量类
 * @class TkGlobal
 * @description   提供 TK系统所需的全局变量
 * @author QiuShao
 * @date 2017/7/21
 */
'use strict';
import TkUtils from 'TkUtils';
import TkConstant from "TkConstant";

window.GLOBAL = window.GLOBAL || {} ;
const TkGlobal = window.GLOBAL ;
TkGlobal.participantGiftNumberJson = TkGlobal.participantGiftNumberJson || {} ; //参与者拥有没有存储到参与者属性的礼物个数Json集合（注：没有存储到参与者属性中的礼物）
TkGlobal.classBegin = false ; //是否已经上课
TkGlobal.endClassBegin = false ; //结束上课
TkGlobal.routeName = undefined ; //路由的位置
TkGlobal.playback = /index.html#\/(replay|playback)/g.test( window.location.href)  ; //是否回放
TkGlobal.playPptVideoing = false ; //是否正在播放PPT视频
TkGlobal.playMediaFileing = false ; //是否正在播放媒体文件
TkGlobal.isVideoDrag = false ; //视频是否可以拖拽
TkGlobal.serviceTime = undefined ; //服务器的时间
TkGlobal.firstGetServiceTime = false ; //是否是第一次获取服务器的时间
TkGlobal.isHandleMsglist = false ; //是否已经处理msglist数据
TkGlobal.remindServiceTime = undefined ; //remind用的服务器的时间
TkGlobal.classBeginTime = undefined ; //上课的时间
TkGlobal.isSkipPageing = false ; //是否正在输入跳转页
TkGlobal.roomChange = false ; //是否修改房间信息
TkGlobal.projectPublishDirAddress = window.location.protocol + "//"+window.location.host + window.location.pathname; //发布目录的路径地址
let projectPublishDirAddressIndex = TkGlobal.projectPublishDirAddress.indexOf('index.html') ;
if( projectPublishDirAddressIndex !== -1 ){
    TkGlobal.projectPublishDirAddress = TkGlobal.projectPublishDirAddress.substring(0 , projectPublishDirAddressIndex ) ;
}
TkGlobal.osType = TkUtils.detectOS(); //操作系统类型
let endtypeUrlParams = TkUtils.getUrlParams("endtype") ;
let endtype = undefined ;
let clientversion = undefined ;
if(TK.NativeInfo){
    let nativeInfo = TK.NativeInfo() ;
    if(nativeInfo &&  typeof  nativeInfo === 'object'){
        endtype = Number(  nativeInfo.endtype );
        clientversion = Number(  nativeInfo.clientversion );
    }else if(endtypeUrlParams !== ""){
        endtype =  Number( endtypeUrlParams ) ;
        clientversion = TkUtils.getUrlParams("clientversion") !=="" ? Number(TkUtils.getUrlParams('clientversion') ) : TkUtils.getUrlParams('clientversion') ; //客户端的版本
    }
}else if(endtypeUrlParams !== ""){
    endtype =  Number( endtypeUrlParams ) ;
    clientversion = TkUtils.getUrlParams("clientversion") !=="" ? Number(TkUtils.getUrlParams('clientversion') ) : TkUtils.getUrlParams('clientversion') ; //客户端的版本
}
TkGlobal.isClient =  TkGlobal.playback ? false : (endtype === 1 || endtype === 2); //是否客户端
TkGlobal.isMacClient =  TkGlobal.playback ? false : (endtype === 2) ;
TkGlobal.clientversion =  TkGlobal.playback ? undefined :  clientversion ; //客户端的版本
let browserInfo = TkUtils.getBrowserInfo();
TkGlobal.isMobile = browserInfo.versions.mobile || browserInfo.versions.ios || browserInfo.versions.android ||  browserInfo.versions.iPhone || browserInfo.versions.iPad; //是否是移动端
L.Logger.info("浏览器 browserInfo:" +JSON.stringify(browserInfo) ,' isClient is '+TkGlobal.isClient+ ' , isMacClient is '+TkGlobal.isMacClient+'  , isBroadcast is '+TkGlobal.isBroadcast + ' , isMobile is '+TkGlobal.isMobile + ' , osType is' + TkGlobal.osType + ( TkGlobal.isClient ?  (' , clientVersion is ' + TkGlobal.clientversion) : '' )  );
// TkGlobal.languageName = browserInfo.language && browserInfo.language.toLowerCase().match(/zh/g) ? (browserInfo.language.toLowerCase().match(/tw/g) ? 'complex':  'chinese' ): 'english' ;
TkGlobal.languageName = browserInfo.language && (browserInfo.language.toLowerCase().match(/zh/g) ?  'chinese' : (browserInfo.language.toLowerCase().match(/ja/g) ? 'japan':'english')) ;
TkGlobal.isVideoStretch = false;//是否是视频拉伸
TkGlobal.changeVideoSizeEventName = null;//鼠标移动触发事件的名字（视频拉伸中用到）
TkGlobal.changeVideoSizeMouseUpEventName = null;//鼠标抬起触发事件的名字（视频拉伸中用到）
TkGlobal.needDetectioned = undefined ; //是否进行了设备检测
TkGlobal.videoScale = 4/3 ;   //视频比例
TkGlobal.HeightConcurrence = false; //是否是高并发模式
TkGlobal.isVideoInTop = true; // 视频是否在顶部
TkGlobal.videoNum = TkGlobal.isVideoInTop?7:6; // 正常可放视频数量
TkGlobal.specificUsers = {};
TkGlobal.isOnlyAudioRoom = false; //是否是纯音频教室
TkGlobal.defaultFileInfo = {
    "fileid": 0 ,
    "companyid":'',
    "filename": 'White Board' ,
    "uploaduserid": '' ,
    "uploadusername": '' ,
    "downloadpath":'',
    "swfpath": '',
    "isContentDocument": 0,
    "filetype": 'whiteboard' ,
    "currpage": 1 ,
    "pagenum": 1 ,
    "dynamicppt": 0 ,
    "filecategory": 0 , //0:课堂 ， 1：系统
    "fileprop": 0 , //0：普通文档 ， 1-2：动态ppt(1-旧版，2-新版) ， 3：h5文档
} ; //默认的文件信息
TkGlobal.numAA=0;
TkGlobal.msglist = {//视频拖拽和视频拉伸和分屏的msglist保存的数据
    videoDragArray: null,
    videoChangeSize: null,
    VideoSplitScreenArray: null,
};
TkGlobal.isSplitScreen = false;
TkGlobal.systemStyleJson = {} ;
TkGlobal.dragRange = {left:0 , top:0};
TkGlobal.windowInnerWidth = window.innerWidth  ;
TkGlobal.windowInnerHeight = window.innerHeight ;
TkGlobal.loadModuleJson = {
    LeftToolBarVesselSmart:true ,
};
TkGlobal.doubleScreen = false; //是否是多屏幕 bobo的
TkGlobal.showShapeAuthor = false ;  //是否显示远程画笔提示内容
TkGlobal.playbackControllerHeight = '0rem' ;
TkGlobal.mainContainerFull = false ; //主体区域是否全屏
TkGlobal.isVideoInFullscreen = false ; //是否处于画中画（课件全屏video在右下角）
TkGlobal.isVideoPlayerInFullscreen = false ; //是否处于画中画（MP4全屏video在右下角）
TkGlobal.localRecording = false ; //正在本地录制
TkGlobal.selectedRecord = false ; //是否选中本地录制
TkGlobal.localRecordPath = "" ; //正在本地文件保存路径
TkGlobal.extradata =  TkUtils.getUrlParams('extradata') ;
TkGlobal.logintype = TkUtils.getUrlParams("logintype")  && Number( TkUtils.getUrlParams("logintype") ) ;
TkGlobal.isVideoMirror = false ; //是否启用镜像翻转
TkGlobal.switchScreen = false; //是否开启主副屏切换
TkGlobal.isLeaveRoom = false ; //是否离开教室
TkGlobal.clientComponent = false ; //是否是客户端组件
TkGlobal.areaExchangeFlag = false ; //是否进行了区域交换
TkGlobal.appConnected = false ; //是否房间连接成功
TkGlobal.isMoreUsers = false ; //是否人数超过50人
TkGlobal.userCount=50;//人数限制为50人
TkGlobal.customWhiteboardColorArry = ["ffffff","000000","415646","ffc973","5d4245","9ad0ea","756691","558289"]; //可选的白板底色
TkGlobal.reloadFileShowReloadNumber = true ; //重新加载文档，是否显示重连次数
TkGlobal.isStartRtml = false;   //是否已经开始rtmp推流
TkGlobal.minimizedDragAndDropArry = [];
TkGlobal.roomlayout = undefined; //TODO 暂时  该变量用于回放不响应拖拽
TkGlobal.isAutoGetCandraw = false;
TkGlobal.hasPrivateFile = false;
TkGlobal.isMovieSharePlay = false;
TkGlobal.movieShareStatus = false;

export  default TkGlobal ;
