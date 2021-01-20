/**
 * 信令服务
 * @module ServiceSignalling
 * @description  提供 信令相关的功能服务
 * @author QiuShao
 * @date 2017/08/12
 */
import SignallingInterface from 'SignallingInterface' ;
import ServiceRoom from 'ServiceRoom' ;
import TkUtils from 'TkUtils' ;
import TkConstant from 'TkConstant' ;
import TkGlobal from 'TkGlobal' ;
import CoreController from 'CoreController' ;

class ServiceSignalling extends SignallingInterface {
    constructor() {
        super();
    }
    /**
     @class sendSignallingFromLowConsume
     @param maxvideo {Number} 最大的视频数
     */
    /*发送LowConsume信令*/
    sendSignallingFromLowConsume(maxvideo){
        if( !CoreController.handler.getAppPermissions('sendSignallingFromLowConsume') ){return ;} ;
        const that = this ;
        if(maxvideo === undefined || maxvideo === null){L.Logger.error('sendSignallingFromLowConsume maxvideo is not exist!') ; return ;} ;
        let id , data = {lowconsume:false , maxvideo: Number(maxvideo) } , name = "LowConsume" , toID = "__all"  , expiresabs = undefined , isDelMsg = false , do_not_save = undefined ;
        id = name  ;
        that.sendSignallingDataToParticipant( isDelMsg , name ,id , toID ,  data , do_not_save  , expiresabs);
    };

    /*发送上下课信令
     * method sendSignallingFromClassBegin
     * params [isDelMsg:boolean(true-上课,false-下课) ,  toID:string ,do_not_save:boolean ] */
    sendSignallingFromClassBegin(isDelMsg  , do_not_save){
        if( !CoreController.handler.getAppPermissions('sendSignallingFromClassBegin') ){return ;} ;
        const that = this ;
        if(!isDelMsg){
            L.Utils.localStorage.setItem("notSelectedRecord" , "" );
            that.delmsgTo__AllAll();//清除所有信令消息
        }
        let id , data = {} , name = "ClassBegin" , toID = "__all"  , expiresabs = undefined;
        //if(TkConstant.joinRoomInfo && TkConstant.joinRoomInfo.endtime){
            //expiresabs =  Number(TkConstant.joinRoomInfo.endtime) + 5*60;//服务器自动下课时间
        //}
        id = name  ;
        data.recordchat = true ; //录制聊天消息
         if(TkConstant.joinRoomInfo.isClassAudioRemix){ //todo 支持教室音频混音录制 ljh 2017-12-14  , 疑问：isClassAudioRemix从那里赋值的？
        	data.recordtype = 2 ; 
         }
        that.sendSignallingDataToParticipant( isDelMsg , name ,id , toID ,  data , do_not_save  , expiresabs);
    };

    /*老师端教学组件倒计时的发送到学生端的信令*/
    sendSignallingTimerToStudent(data , isDelMsg = false){
        if(!CoreController.handler.getAppPermissions('sendSignallingTimerToStudent') ){return false;};
        const that = this ;
        let id="timerMesg" , name = "timer" , toID = "__all" ;
        that.sendSignallingDataToParticipant( isDelMsg , name ,id , toID ,  data );
    };

    /*发送信令扩展*/
    sendSignallingFromExtendSignalling(data , isDelMsg = false,toID){
        if(!CoreController.handler.getAppPermissions('sendSignallingFromExtendSignalling') ){return false;};
        const that = this ;
        let id="ExtendSignalling" , name = "ExtendSignalling" ;
        toID = toID ||"__all" ;
        that.sendSignallingDataToParticipant( isDelMsg , name ,id , toID ,  data );
    };

    /*全员禁言 */
    sendSignllingEveryoneBanChat(data,isDelMsg=false){
        if(!CoreController.handler.getAppPermissions('sendSignllingEveryoneBanChat') ){return false;};
        const that=this;
        let id="EveryoneBanChat",signallingName="EveryoneBanChat",toID="__all",dot_not_save = false;
        that.sendSignallingDataToParticipant( isDelMsg , signallingName ,id , toID ,  data , dot_not_save );
    }
    
    /*双击视频同步*/
    sendSignllingDoubleClickVideo(data,isDelMsg=false){
        if(!CoreController.handler.getAppPermissions('doubleClickVideo') ){return false;};
        let id="doubleClickVideo",signallingName="doubleClickVideo",toID="__all",dot_not_save = false;
        this.sendSignallingDataToParticipant( isDelMsg , signallingName ,id , toID ,  data , dot_not_save );
    }
    
    //切换布局
    sendSignllingSwitchLayout(data,isDelMsg=false){
        if(!CoreController.handler.getAppPermissions('switchLayout') ){return false;};
        const that=this;
        let id="switchLayout",signallingName="switchLayout",toID="__all",dot_not_save = false;
        that.sendSignallingDataToParticipant( isDelMsg , signallingName ,id , toID ,  data , dot_not_save );
    }

    /*老师助教端转盘组件的发送到学生端的信令*/
    sendSignallingDialToStudent(data,  isDelMsg = false){
        if(!CoreController.handler.getAppPermissions('sendSignallingDialToStudent') ){return false;};
        const that = this ;
        let id="dialMesg" , name = "dial" , toID = "__all"  ;
        that.sendSignallingDataToParticipant( isDelMsg , name ,id , toID ,  data );
    };

    /*抢答器*/
    sendSignallingQiangDaQi(isDelMsg ,data){
        if(!CoreController.handler.getAppPermissions('sendSignallingQiangDaQi') ){return false;};
        const that = this ;
        let   name = "qiangDaQi" , toID = "__all"  ,id="qiangDaQiMesg" ;
        that.sendSignallingDataToParticipant( isDelMsg , name ,id , toID ,  data );
    };

    /*抢答者*/
    sendSignallingQiangDaZhe(isDelMsg ,data){
        if(!CoreController.handler.getAppPermissions('sendSignallingQiangDaZhe') ){return false;};
        const that = this ;
        let   name = "QiangDaZhe" , toID = "__all"  ,associatedMsgID="qiangDaQiMesg" ;
        let id = "QiangDaZhe_"+ServiceRoom.getTkRoom().getMySelf().id;
        that.sendSignallingDataToParticipant( isDelMsg , name ,id , toID ,  data , undefined , undefined  , associatedMsgID );
    };

     /* method sendSignallingFromUpdateTime */
    sendSignallingFromUpdateTime(toParticipantID){
        if( !CoreController.handler.getAppPermissions('sendSignallingFromUpdateTime') ){return ;} ;
        const that = this ;
        let isDelMsg = false  , id = "UpdateTime" , toID= toParticipantID || "__all" , data = {} , name = "UpdateTime"   , do_not_save = true ;
        that.sendSignallingDataToParticipant(isDelMsg , name ,id , toID ,  data , do_not_save);
    };

    /* 发送远程控制信令 */
    sendSignallingFromRemoteControl(toParticipantID , data){
        if( !CoreController.handler.getAppPermissions('sendSignallingFromRemoteControl') ){return ;} ;
        let isDelMsg = false  , id = "RemoteControl" , toID= toParticipantID || "__all" , name = "RemoteControl"   , do_not_save = true ;
        this.sendSignallingDataToParticipant(isDelMsg , name ,id , toID ,  data , do_not_save);
    };

    /*视频标注的相关信令*/
    sendSignallingFromVideoWhiteboard(isDelMsg,data) {
        if( !(CoreController.handler.getAppPermissions('isSendSignallingFromVideoWhiteboard') && TkConstant.joinRoomInfo.videoWhiteboardDraw) ){return ;} ;
        const that = this;
        let name = "VideoWhiteboard" , id = "VideoWhiteboard" , toID="__all"  , dot_not_save = false;
        isDelMsg = isDelMsg || false;
        data = data || {};
        that.sendSignallingDataToParticipant(isDelMsg , name ,id , toID ,  data , dot_not_save) ;
    };

    /*视频框拖拽的动作相关信令*/
    sendSignallingFromVideoDraghandle(data , toID) {
        if( !CoreController.handler.getAppPermissions('sendSignallingFromVideoDraghandle') ){return ;} ;
        const that = this;
        let name = "videoDraghandle" , id = "videoDraghandle"  , isDelMsg = false , dot_not_save = false;
        toID= toID || "__allExceptSender";
        that.sendSignallingDataToParticipant(isDelMsg , name ,id , toID ,  data , dot_not_save) ;
    };

    /*视频框拉伸的相关信令*/
    sendSignallingFromVideoChangeSize(data , toID) {
        if( !CoreController.handler.getAppPermissions('isSendSignallingFromVideoChangeSize') ){return ;} ;
        const that = this;
        let name = "VideoChangeSize" , id = "VideoChangeSize"  , isDelMsg = false , dot_not_save = false;
        toID= toID || "__allExceptSender";
        that.sendSignallingDataToParticipant(isDelMsg , name ,id , toID ,  data , dot_not_save) ;
    };

    /*演讲模式双击视频分屏的动作相关信令*/
    sendSignallingFromVideoSplitScreen(data, isDelMsg ,toID) {
        if( !CoreController.handler.getAppPermissions('sendSignallingFromVideoSplitScreen') ){return ;} ;
        const that = this;
        let name = "VideoSplitScreen" , id = "VideoSplitScreen", dot_not_save = false;
        isDelMsg = isDelMsg || false;
        toID = toID || "__allExceptSender";
        that.sendSignallingDataToParticipant(isDelMsg , name ,id , toID ,  data , dot_not_save) ;
    };
    
    /*小黑板拖拽的动作相关信令*/
    sendSignallingFromBlackBoardDrag(data , toID) {
        if( !CoreController.handler.getAppPermissions('sendSignallingFromBlackBoardDrag') ){return ;} ;
        const that = this;
        let name = "BlackBoardDrag" ,
            id = "BlackBoardDrag"  ,
            isDelMsg = false ,
            dot_not_save = false,
            associatedMsgID = "BlackBoard_new";
        toID= toID || "__allExceptSender";
        that.sendSignallingDataToParticipant(isDelMsg , name ,id , toID ,  data , dot_not_save, undefined  , associatedMsgID) ;
    };

    /*转盘拖拽的动作相关信令*/
    sendSignallingFromDialDrag(data , toID) {
        if( !CoreController.handler.getAppPermissions('sendSignallingFromDialDrag') ){return ;} ;
        const that = this;
        let name = "DialDrag" ,
            id = "DialDrag"  ,
            isDelMsg = false ,
            dot_not_save = false,
            associatedMsgID = "dialMesg";
        toID= toID || "__allExceptSender";
        that.sendSignallingDataToParticipant(isDelMsg , name ,id , toID ,  data , dot_not_save, undefined  , associatedMsgID) ;
    };

    /*计时器拖拽的动作相关信令*/
    sendSignallingFromTimerDrag(data , toID) {
        if( !CoreController.handler.getAppPermissions('isSendSignallingFromTimerDrag') ){return ;} ;
        const that = this;
        let name = "TimerDrag" ,
            id = "TimerDrag"  ,
            isDelMsg = false ,
            dot_not_save = false,
            associatedMsgID = "timerMesg";
        toID= toID || "__allExceptSender";
        that.sendSignallingDataToParticipant(isDelMsg , name ,id , toID ,  data , dot_not_save, undefined  , associatedMsgID) ;
    };

    /*答题卡拖拽的动作相关信令*/
    sendSignallingFromAnswerDrag(data , toID) {
        if( !CoreController.handler.getAppPermissions('isSendSignallingFromAnswerDrag') ){return ;} ;
        const that = this;
        let name = "AnswerDrag" ,
            id = "AnswerDrag"  ,
            isDelMsg = false ,
            dot_not_save = false,
            associatedMsgID = `Question_${TkConstant.joinRoomInfo["serial"]}`;
        toID= toID || "__allExceptSender";
        that.sendSignallingDataToParticipant(isDelMsg , name ,id , toID ,  data , dot_not_save, undefined  , associatedMsgID) ;
    };

    /*抢答器拖拽的相关信令*/
    sendSignallingFromResponderDrag(data , toID) {
        if( !CoreController.handler.getAppPermissions('isSendSignallingFromResponderDrag') ){return ;} ;
        const that = this;
        let name = "ResponderDrag" ,
            id = "ResponderDrag"  ,
            isDelMsg = false ,
            dot_not_save = false,
            associatedMsgID = "qiangDaQiMesg";
        toID= toID || "__allExceptSender";
        that.sendSignallingDataToParticipant(isDelMsg , name ,id , toID ,  data , dot_not_save, undefined  , associatedMsgID) ;
    };

    /*发送课件全屏的信令*/
    sendSignallingFromFullScreen(data,isDelMsg) {
        if( !CoreController.handler.getAppPermissions('isSendSignallingFromFullScreen') ){return ;} ;
        const that = this;
        let name = "FullScreen" ,
            id = "FullScreen"  ,
            dot_not_save = false,
            toID= "__all";
        isDelMsg = isDelMsg || false;
        data = data || {};//fullScreenType:'stream_video','courseware_file','stream_media'
        that.sendSignallingDataToParticipant(isDelMsg , name ,id , toID ,  data , dot_not_save) ;
    };

    /*截屏图片的相关信令*/
    sendSignallingFromCaptureImg(id, data , isDelMsg) {
        if( !CoreController.handler.getAppPermissions('isSendSignallingFromCaptureImg') ){return ;} ;
        const that = this;
        let name = "CaptureImg" , dot_not_save = false, toID= "__all";
        isDelMsg = isDelMsg || false ;
        that.sendSignallingDataToParticipant(isDelMsg , name ,id , toID ,  data , dot_not_save) ;
    };

    /*截屏图片的拖拽信令*/
    sendSignallingFromCaptureImgDrag(data, id, associatedMsgID) {
        if( !CoreController.handler.getAppPermissions('isSendSignallingFromCaptureImgDrag') ){return ;} ;
        const that = this;
        let name = "CaptureImgDrag" ,
            isDelMsg = false ,
            dot_not_save = false,
            toID= "__allExceptSender";
        that.sendSignallingDataToParticipant(isDelMsg , name ,id , toID ,  data , dot_not_save, undefined  , associatedMsgID) ;
    };

    /*截屏图片的缩放信令*/
    sendSignallingFromCaptureImgResize(data, id, associatedMsgID) {
        if( !CoreController.handler.getAppPermissions('isSendCaptureImgResize') ){return ;} ;
        const that = this;
        let name = "CaptureImgResize" ,
            isDelMsg = false ,
            dot_not_save = false,
            toID= "__allExceptSender";
        that.sendSignallingDataToParticipant(isDelMsg , name ,id , toID ,  data , dot_not_save, undefined  , associatedMsgID) ;
    };

    /*与父框架通信的相关信令*/
    sendSignallingToParentIframe(sendDataWrap) {
        const that = this;
        let {id , name , toID = '__all' , data , source , save = true ,  delmsg = false } = sendDataWrap ;
        id = id || name ;
        name = "outIframe_" + name;
        that.sendSignallingDataToParticipant(delmsg , name ,id , toID ,  sendDataWrap , !save) ;
    }

    /*发送文档上传或者删除相关的信令DocumentChange
     *@method  sendSignallingFromDocumentChange */
    sendSignallingFromDocumentChange(data , toID){
        if( !CoreController.handler.getAppPermissions('sendSignallingFromDocumentChange') ){return ;} ;
        const that = this ;
        let name = "DocumentChange";
        let id = name;
        let do_not_save = true;
        let isDelMsg = false;
        toID = toID || "__allExceptSender";
        that.sendSignallingDataToParticipant(isDelMsg , name ,id , toID ,  data , do_not_save );
    }

    /*数据流失败后发送信令StreamFailure
    * @method sendSignallingFromStreamFailure*/
    sendSignallingFromStreamFailure(failStreamUserid , streamFailureJson){
        if( !CoreController.handler.getAppPermissions('sendSignallingFromStreamFailure') ){return ;} ;
        const that = this ;
        if(!failStreamUserid){ L.Logger.error( 'sendSignallingFromStreamFailure stream extensionId is not exist!' ) } ;
        if( failStreamUserid === ServiceRoom.getTkRoom().getMySelf().id ){
            let name = "StreamFailure" ;
            let id = name , toID='__allSuperUsers'  , do_not_save = true , isDelMsg = false , data = {studentId:failStreamUserid};
            if(streamFailureJson && typeof streamFailureJson === 'object'){
                Object.customAssign(data , streamFailureJson ) ;
            }
            that.sendSignallingDataToParticipant(isDelMsg , name ,id , toID ,  data , do_not_save );
        }
    };

    /*用户功能-上下讲台信令的发送
    * @method userPlatformUpOrDown*/
    userPlatformUpOrDown(user){
        if( !CoreController.handler.getAppPermissions('userPlatformUpOrDown') ){return ;} ;
        const that = this ;
        if(!user){ L.Logger.error("not user , id:"+user.id); }
        let publishstate = undefined;
        //如果用户属性状态为非零（上台状态）则变为零（下台），若为下台状态则根据是否有音视频设备赋值属性：
        if((TkConstant.joinRoomInfo.createOnlyAudioRoom || !TkConstant.joinRoomInfo.isHasVideo) && TkGlobal.isOnlyAudioRoom){
            publishstate = user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE ? TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY : TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE ;
            let logData = {socure:'userPlatformUpOrDown_01',logType:'changeUserPublish', myUserId:ServiceRoom.getTkRoom().getMySelf().id, userId:user.id, publishstate:publishstate}; //TODO:问题日志，问题修复后删除
            L.Logger.info('Bug Log:',JSON.stringify(logData));
            if(TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant){
                this.sendLogToServer(logData);
            }
            that.changeUserPublish(user.id , publishstate) ;//改变用户的发布状态
        }else{
            publishstate = user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE ? (
                user.hasvideo ? (user.hasaudio ? TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH : TkConstant.PUBLISHSTATE.PUBLISH_STATE_VIDEOONLY )
                : ( user.hasaudio ? TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY : TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE   )
            ) : TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE ;
            let logData = {socure:'userPlatformUpOrDown_02',logType:'changeUserPublish', myUserId:ServiceRoom.getTkRoom().getMySelf().id, userId:user.id, publishstate:publishstate}; //TODO:问题日志，问题修复后删除
            L.Logger.info('Bug Log:',JSON.stringify(logData));
            if(TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant){
                this.sendLogToServer(logData);
            }
            that.changeUserPublish(user.id , publishstate) ;//改变用户的发布状态
            if(publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE){ //XXX 这块流程不该在这写，邱广生提问
                that.setParticipantPropertyToAll(user.id,{pointerstate: false}); //下台关闭教鞭
            }
        }
        let userPropertyData = {} ;
        if(user.role !== TkConstant.role.roleTeachingAssistant && user.role !== TkConstant.role.roleChairman ){ //如果不是助教和老师
            if( publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE &&  user.candraw ){ //如果下台并且当前可画,则设置不可画
                userPropertyData.candraw= false ;
            }
            if(user.raisehand){ //如果举手则置为不举手
                userPropertyData.raisehand = false ;
            }
        }
        if(!TkUtils.isEmpty(userPropertyData)){//userPropertyData如果不是空对象
            that.setParticipantPropertyToAll( user.id , userPropertyData);
        }
    };

    /*用户功能-打开关闭音频
    * @method userAudioOpenOrClose*/
    userAudioOpenOrClose(user){
        if( !CoreController.handler.getAppPermissions('userAudioOpenOrClose') ){return ;} ;
        const that = this ;
        if(!user){ L.Logger.error("not user , id:"+user.id); } ;
        let data = {} ;
        let isSet = false ;
        if(user.raisehand){ 
            data.raisehand = false;
        }
        if(user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY ){  //之前状态为1 ==>变为4
            data.publishstate = TkConstant.PUBLISHSTATE.PUBLISH_STATE_MUTEALL;
            isSet = true ;
        }else if(user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_VIDEOONLY ){  //之前状态为2 ==>变为3
            data.publishstate =TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH ;
            isSet = true ;
        }else if(user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH ){  //之前状态为3 ==>变为2
            data.publishstate =TkConstant.PUBLISHSTATE.PUBLISH_STATE_VIDEOONLY ;
            isSet = true ;
        }else if(user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_MUTEALL ){  //之前状态为4 ==>变为1
            data.publishstate =TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY ;
            isSet = true ;
        }else if(user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE ){  //之前状态为0 ==>变为1
            data.publishstate =TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY ;
            isSet = true ;
        }
        if(isSet){
            if(data.publishstate !== undefined){
                let logData = {socure:'userAudioOpenOrClose',logType:'setParticipantPropertyToAll', myUserId:ServiceRoom.getTkRoom().getMySelf().id, userId:user.id, data:data}; //TODO:问题日志，问题修复后删除
                L.Logger.info('Bug Log:',JSON.stringify(logData));
                if(TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant){
                    this.sendLogToServer(logData);
                }
            }
            that.setParticipantPropertyToAll(user.id, data);
        }
    };

    /*用户功能-打开关闭视频
     *@method userVideoOpenOrClose*/
    userVideoOpenOrClose(user){
        console.log(user);
        console.log(user.publishstate);
        if( !CoreController.handler.getAppPermissions('userVideoOpenOrClose') ){return ;} ;
        const that = this ;
        if(!user){ L.Logger.error("not user , id:"+user.id); return ; }
        let isSet = false ;
        let data = {} ;
        if(user.raisehand){  
            data.raisehand = false;
        }
        if(user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY ){  //之前状态为1 ==>变为3
            data.publishstate = TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH;
            isSet = true ;
        }else if(user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_VIDEOONLY ){  //之前状态为2 ==>变为4
            data.publishstate = TkConstant.PUBLISHSTATE.PUBLISH_STATE_MUTEALL;
            isSet = true ;
        }else if(user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH ){  //之前状态为3 ==>变为1
            data.publishstate = TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY;
            isSet = true ;
        }else if(user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_MUTEALL ){  //之前状态为4 ==>变为2
            data.publishstate = TkConstant.PUBLISHSTATE.PUBLISH_STATE_VIDEOONLY;
            isSet = true ;
        }else if(user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE ){  //之前状态为0 ==>变为2
            data.publishstate = TkConstant.PUBLISHSTATE.PUBLISH_STATE_VIDEOONLY;
            isSet = true ;
        }
        if(isSet){
            if(data.publishstate !== undefined){
                let logData = {socure:'userVideoOpenOrClose',logType:'setParticipantPropertyToAll', myUserId:ServiceRoom.getTkRoom().getMySelf().id, userId:user.id, data:data}; //TODO:问题日志，问题修复后删除
                L.Logger.info('Bug Log:',JSON.stringify(logData));
                if(TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant){
                    this.sendLogToServer(logData);
                }
            }
            that.setParticipantPropertyToAll(user.id, data);
        }
    };
    
    /*改变用户的画笔权限
     *@method changeUserCandraw*/
    changeUserCandraw(user){
        if( !CoreController.handler.getAppPermissions('changeUserCandraw') ){return ;} ;
        const that = this ;
        if(!user){ L.Logger.error("not user , id:"+user.id); return ; }
        // that.setParticipantPropertyToAll( user.id , {candraw:!user.candraw});
        let data = {} ;
        if(user.raisehand){ 
            data.raisehand = false;
        }
        data.candraw=!user.candraw;
        if(user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE ){  //之前状态为0 ==>变为1
            data.publishstate = TkConstant.PUBLISHSTATE.PUBLISH_STATE_MUTEALL ;
        }
        if(data.publishstate !== undefined){
            let logData = {socure:'changeUserCandraw',logType:'setParticipantPropertyToAll', myUserId:ServiceRoom.getTkRoom().getMySelf().id, userId:user.id, data:data}; //TODO:问题日志，问题修复后删除
            L.Logger.info('Bug Log:',JSON.stringify(logData));
            if(TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant){
                this.sendLogToServer(logData);
            }
        }
        that.setParticipantPropertyToAll(user.id, data);
    } ;

    /*改变用户的发布状态*/
    changeUserPublish(userid , publishstate){
        if(!userid){L.Logger.error( 'user is not exist  , user id is '+userid+'!' ); return ; } ;
       /* if( !(user.role === TkConstant.role.roleChairman || user.role === TkConstant.role.roleStudent || (user.role === TkConstant.role.roleTeachingAssistant)&& TkConstant.joinRoomInfo.assistantOpenMyseftAV) ){        //17-09-15 xgd 修改
            return ;
        }*/
       if(TkGlobal.appConnected){
           if( userid !== ServiceRoom.getTkRoom().getMySelf().id){
               let logData = {socure:'changeUserPublish',logType:'changeUserPublish', myUserId:ServiceRoom.getTkRoom().getMySelf().id, userId:userid, publishstate:publishstate}; //TODO:问题日志，问题修复后删除
               L.Logger.info('Bug Log:',JSON.stringify(logData));
               if(TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant){
                   this.sendLogToServer(logData);
               }
           }
           ServiceRoom.getTkRoom().changeUserPublish(userid , publishstate);
       }
    }

    /*发送人数超过一定人数则小白板启用限制上台的人才有小白板的通知信令*/
    sendSignallingFromMoreUsers(data , isDelMsg = false ){
        let  name = "MoreUsers" , id = "MoreUsers" , toID="__all" ;
        this.sendSignallingDataToParticipant(isDelMsg , name ,id , toID ,  data ) ;
    };

    /*发送多黑板信令*/
    sendSignallingFromNewBlackBoard(data , isDelMsg = false ){
        if( !CoreController.handler.getAppPermissions('sendSignallingFromBlackBoard') ){return ;} ;
        let  name = "BlackBoard_new" , id = "BlackBoard_new" , toID="__all" ;
        this.sendSignallingDataToParticipant(isDelMsg , name ,id , toID ,  data ) ;
    };

    /*发送用户拥有小白信令*/
    sendSignallingFromUserHasNewBlackBoard(data , isDelMsg = false ) {
        // if( !CoreController.handler.getAppPermissions('sendSignallingFromBlackBoardDrag') ){return ;} ;
        const that = this;
        let name = "UserHasNewBlackBoard" , id = '_' + data.id, dot_not_save = false , associatedMsgID = "BlackBoard_new" , toID="__all" , associatedUserID=data.id;
        that.sendSignallingDataToParticipant(isDelMsg , name ,id , toID ,  data , dot_not_save , undefined , associatedMsgID , associatedUserID) ;
    };

    /** 高并发答题开始、结束信令 */
    /**
     * data中务必包含action字段，该字段控制答题器的状态
     * action字段包含以下预设值:open,start,end,restart
     */
    sendQuestion(isDelMsg, data){
        if( !CoreController.handler.getAppPermissions('sendQuestion') ){return ;} ;
        const name = 'Question',
              id = `Question_${TkConstant.joinRoomInfo["serial"]}`,
              toID="__all",
              write2DB = true;

        if(data.action === 'start'){
            data.quesID = 'ques_'+new Date().getTime();
        }

        if(TkGlobal.appConnected) {
            const save =  true ;
            if(data && typeof data === 'object' && !Array.isArray(data) ){
                data = JSON.stringify(data);
            }
            const params = {
                msgName:name, msgId:id, toID, data, save: true , write2DB
            };
            if(isDelMsg){
                ServiceRoom.getTkRoom().delMsg({name,id,toID, data})
            }else {
                ServiceRoom.getTkRoom().pubMsg(params);
            }
        }

        // this.sendSignallingDataToParticipant(isDelMsg , name ,id , toID ,  data )
    }

    /**
     * 高并发答题发布结果信令
     */
    publishResult(data, isDelMsg){
        if( !CoreController.handler.getAppPermissions('publishResult') ){return ;} ;
        const name = 'PublishResult',
              id = `PublishResult`,
              toID="__all";
              isDelMsg = isDelMsg || false;

        this.sendSignallingDataToParticipant(isDelMsg , name ,id , toID ,  data, )
    }

    /**
     * 提交答案信令
     * do_not_save: true
     * @param {*type: JSON/Object, vote commit data} data 
     */
    answerCommit(data){
        if( !CoreController.handler.getAppPermissions('answerCommit') ){return ;} ;
        const id              = `Question_${TkConstant.joinRoomInfo["serial"]}`,
              name            = 'AnswerCommit',
              type            = `count`,
              toId            = `__none`,
              write2DB        = true,
              do_not_save     = true,
              associatedMsgID = `Question`;

        const {actions, modify} = data

        if(TkGlobal.appConnected) {
            const save =  !do_not_save ;
            if(data && typeof data === 'object' && !Array.isArray(data) ){
                data = JSON.stringify(data);
            }
            const params = {
                msgName:name, msgId:id, toId, data, save ,associatedMsgID ,type , write2DB, actions, modify
            };
            ServiceRoom.getTkRoom().pubMsg(params);
        }
    }

    /**
     * 获取投票结果
     */
    getQuestionCount(data){
        if( !CoreController.handler.getAppPermissions('getQuestionCount') ){return ;} ;
        let id = `Question_${TkConstant.joinRoomInfo["serial"]}`;
        let name = 'GetQuestionCount';
        let type = 'getCount';
        let toId = ServiceRoom.getTkRoom().getMySelf().id;
        let do_not_save = true;
        let associatedMsgID = `Question`;

        if(TkGlobal.appConnected) {
            const save =  !do_not_save ;
            if(data && typeof data === 'object' && !Array.isArray(data) ){
                data = JSON.stringify(data);
            }
            const params = {
                msgName:name, msgId:id, toId, data, save ,associatedMsgID ,type
            };
            ServiceRoom.getTkRoom().pubMsg( params );
        }

    }


    /*发送展示聊天框信令*/
    sendChatShow(isDelMsg){
        //if( !CoreController.handler.getAppPermissions('sendSignallingFromLowConsume') ){return ;} ;
        const that = this ;
        const name = 'ChatShow',
            id = 'ChatShow',
            toID = '__none',
            data = {},
            do_not_save = false;

        that.sendSignallingDataToParticipant( isDelMsg , name ,id , toID ,  data , do_not_save  );
    };

}
const  ServiceSignallingInstance = new ServiceSignalling();
export default ServiceSignallingInstance;
    

/*
备注：
    toID=> __all , __allExceptSender , userid , __none ,__allSuperUsers
* */