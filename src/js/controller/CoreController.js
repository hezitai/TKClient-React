/**
 * UI-总控制中心
 * @module CoreController
 * @description  用于控制页面组件的通信
 * @author QiuShao
 * @date 2017/7/5
 */
'use strict';
import eventObjectDefine from 'eventObjectDefine';
import RoomHandler from 'RoomHandler';
import RoleHandler from 'RoleHandler';
import TkConstant from 'TkConstant';
import TkGlobal from 'TkGlobal';
import TkUtils from 'TkUtils';
import TkAppPermissions from 'TkAppPermissions';
import ServiceTools from  'ServiceTools' ;
import ServiceRoom from  'ServiceRoom' ;
import ServiceSignalling from  'ServiceSignalling' ;
import handlerCoreController from  './handlerCoreController' ;
import handlerIframeMessage from  './handlerIframeMessage' ;

const coreController = TK.EventDispatcher( {} ) ;
eventObjectDefine.CoreController = coreController ;
coreController.handler = {};
/*加载系统所需的信息
* @method loadSystemRequiredInfo*/
coreController.handler.loadSystemRequiredInfo = () => {

    ServiceTools.getAppLanguageInfo(function (languageInfo) { //加载语言包
        TkGlobal.language = languageInfo ;
    });

     //初始化
    if( TK.Initialize ){
        if(TkGlobal.isClient&&TkGlobal.isMacClient){
            TK.Initialize( TkGlobal.isClient , !TkGlobal.isMacClient );//xiagd 17-10-17
        }else{
            TK.Initialize( TkGlobal.isClient , TkGlobal.isMacClient );//xiagd 17-10-17
        }
    }

    TK.notStopVideoTrack = (TkGlobal.playback || TkGlobal.logintype === 88) ? false : true; //不能停止视频轨道，默认为false
    TK.notStopAudioTrack = (TkGlobal.playback || TkGlobal.logintype === 88) ? false : true; //不能停止音频轨道，默认为false
    ServiceRoom.setTkRoom( TK.Room() ) ;
    if( ServiceRoom.getTkRoom() &&   ServiceRoom.getTkRoom().setLogIsDebug ){
        ServiceRoom.getTkRoom().setLogIsDebug(TkConstant.DEV);
    }
    if(TkGlobal.playback){
        ServiceRoom.getTkRoom().setAutoProcessDeviceChangeEvent(false);
    }else{
        ServiceRoom.getTkRoom().setAutoProcessDeviceChangeEvent(true);
    }
    RoomHandler.registerEventToRoom();
    let isInner = true;
    let room = undefined;
    let sdkReceiveActionCommand = undefined;
    let whiteboardManager = new window.TKWhiteBoardManager(room,sdkReceiveActionCommand,isInner);
    ServiceRoom.setTkWhiteBoardManager(whiteboardManager);
    ServiceRoom.getTkRoom().registerRoomWhiteBoardDelegate(whiteboardManager); // 白板实例化关联房间
    if(!(TkGlobal.isClient || TkGlobal.playback) ){
        if(TK.DeviceMgr.addDeviceChangeListener){
            TK.DeviceMgr.addDeviceChangeListener(()=>{
                eventObjectDefine.CoreController.dispatchEvent({
                    type:"deviceChange"
                })
            })
        }
    }
};

/*执行joinroom*/
coreController.handler.joinRoom = () => {
    RoomHandler.joinRoom();//进入房间
};

/*执行joinPlaybackRoom*/
coreController.handler.joinPlaybackRoom = () => {
    if(!TkGlobal.playback){L.Logger.error('No playback environment!');return;} ;
    RoomHandler.joinPlaybackRoom();
};

/*核心控制器操控系统权限-更新和获取以及初始化权限*/
coreController.handler.setAppPermissions = ( appPermissionsKey ,appPermissionsValue )=> {
    TkAppPermissions.setAppPermissions(appPermissionsKey ,appPermissionsValue);
};
coreController.handler.getAppPermissions = ( appPermissionsKey  )=> {
   return TkAppPermissions.getAppPermissions(appPermissionsKey );
};
coreController.handler.initAppPermissions = ( initAppPermissionsJson)=> {
    TkAppPermissions.initAppPermissions(initAppPermissionsJson);
};
coreController.handler.checkRoleConflict = (user , isEvictUser) => {
    return RoleHandler.checkRoleConflict(user , isEvictUser);
};
coreController.handler.handlerOnMessage = (event) => {
    return handlerIframeMessage.handlerOnMessage(event);
};
coreController.handler.updateSystemStyleJsonValueByInnerKey = (StyleJsonKey , innerKey ,innerValue)=>{
    handlerCoreController.updateSystemStyleJsonValueByInnerKey(StyleJsonKey , innerKey ,innerValue);
};
coreController.handler.updateSystemStyleJson = (StyleJsonKey , StyleJsonValue)=>{
    handlerCoreController.updateSystemStyleJson(StyleJsonKey , StyleJsonValue);
};

coreController.handler.refreshSystemStyleJson = () => {
    handlerCoreController.refreshSystemStyleJson();
};

coreController.handler.updateLoadModuleJson = (key , value)=>{
    if(TkGlobal.loadModuleJson[key] !== value ){
        TkGlobal.loadModuleJson[key] =  value;
        handlerCoreController.refreshSystemStyleJson();
    }
};

coreController.handler.addEventListenerOnCoreController = () => {
    RoomHandler.addEventListenerToRoomHandler();
    handlerIframeMessage.addEventListener();

    /*禁止浏览器右键*/
    document.oncontextmenu = null ;
    document.oncontextmenu = function() {return false;};

    window.onbeforeunload = null ;
    window.onbeforeunload = function () { //onbeforeunload 事件在即将离开当前页面（刷新或关闭）时触发
        if(ServiceRoom.getTkRoom()){
            if(TkConstant.hasRole.roleChairman){
                RoomHandler.rtmpStopBroadcast();
            }

            eventObjectDefine.Window.dispatchEvent({type:TkConstant.EVENTTYPE.WindowEvent.onBeforeUnload});
            ServiceRoom.getTkRoom().leaveroom(true);
            ServiceRoom.getTkRoom().uninit();
        }
    };

    /*todo 禁止选中文字（暂时去掉）
      $(document).off("selectstart");
     $(document).bind("selectstart", function () { return true; });*/

    /*处理窗口大小改变事件*/
    const _handlerWindowResize =  () =>{
        let tkAppElement = document.getElementById('tk_app') ;
        if(tkAppElement){
            TkGlobal.windowInnerWidth = document.getElementById('tk_app').clientWidth ;
            TkGlobal.windowInnerHeight = document.getElementById('tk_app').clientHeight ;
        }else{
            TkGlobal.windowInnerWidth = window.innerWidth ;
            TkGlobal.windowInnerHeight = window.innerHeight ;
        }
        let defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE ;  //5rem = defalutFontSize*'5px' ;
        let rootElement = document.getElementById('all_root') ||  document.getElementsByTagName('html') ;
        if(rootElement){
            let rootEle = TkUtils.isArray(rootElement) ? rootElement[0] : rootElement ;
            if(rootEle && rootEle.style){
                rootEle.style.fontSize = defalutFontSize+ 'px';
            }
        }
        eventObjectDefine.Window.dispatchEvent({ type:TkConstant.EVENTTYPE.WindowEvent.onResize , message:{defalutFontSize:defalutFontSize} });
    };
    $(window).off("resize");
    $(window).resize(function () { //窗口resize事件监听
        _handlerWindowResize();
    });
    $(window).resize();

    let {state, visibilityChange} = TkUtils.handleVisibilityChangeCompatibility();
    /*监听浏览器窗口是否可见（最小化）*/
    TkUtils.tool.addEvent(document , visibilityChange, function() {
        if (document[state] === 'visible') {
            setTimeout(()=> {
                _handlerWindowResize();
            },50);
        }
    }, false );


    /*接收IFrame框架的消息*/
    const _eventHandler_windowMessage = (event) => {
        if(coreController.handler.handlerOnMessage){
            let isReturn =  coreController.handler.handlerOnMessage(event);
            if(isReturn){
                return ;
            }
        }
        eventObjectDefine.Window.dispatchEvent({ type:TkConstant.EVENTTYPE.WindowEvent.onMessage , message:{event:event} });
    };
    TkUtils.tool.removeEvent(window ,'message' , _eventHandler_windowMessage ) ;
    TkUtils.tool.addEvent(window ,'message' , _eventHandler_windowMessage , false  ); //给当前window建立message监听函数


    $(document).off("keydown");
    $(document).keydown(function(event){
        event = event || window.event ;
        switch (event.keyCode){
            case 27:
                if( (coreController.handler.getAppPermissions('pictureInPicture') || coreController.handler.getAppPermissions('isHandleVideoInFullScreen') ) && TkGlobal.isVideoInFullscreen ){//添加智课禁止sc退出
                    if(TkGlobal.isVideoPlayerInFullscreen){
                        let data = {
                            fullScreenType:'stream_media',//'stream_video','courseware_file','stream_media'
                            needPictureInPictureSmall:false,
                        };
                        TkGlobal.isVideoPlayerInFullscreen=false;
                        ServiceSignalling.sendSignallingFromFullScreen(data , true);
                    }else{
                        ServiceSignalling.sendSignallingFromFullScreen({} , true);
                    }
                }
                if(  TkUtils.tool.isFullScreenStatus() ){
                    TkUtils.tool.exitFullscreen();
                }
                break;
        }
        eventObjectDefine.Document.dispatchEvent({ type:TkConstant.EVENTTYPE.DocumentEvent.onKeydown , message:{keyCode:event.keyCode} });
        eventObjectDefine.CoreController.dispatchEvent({ type:TkConstant.EVENTTYPE.DocumentEvent.onKeydown , message:{keyCode:event.keyCode} });
    });

    const _eventHandler_addFullscreenchange = (event) => {
        eventObjectDefine.CoreController.dispatchEvent({type:'resizeHandler'});
        TkGlobal.mainContainerFull = TkUtils.tool.getFullscreenElement() && TkUtils.tool.getFullscreenElement().id == "lc-full-vessel" ;//主体区域是否全屏
        eventObjectDefine.Document.dispatchEvent({ type:TkConstant.EVENTTYPE.DocumentEvent.onFullscreenchange , message:{event:event} });
    };
    TkUtils.tool.removeFullscreenchange(_eventHandler_addFullscreenchange);
    TkUtils.tool.addFullscreenchange( _eventHandler_addFullscreenchange ) ;

    /*initSystemStyleJson事件*/
    eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.OtherEvent.initSystemStyleJson , function () {
        handlerCoreController.initSystemStyleJson( );
    });
};
coreController.handler.addEventListenerOnCoreController();

export default coreController ;
