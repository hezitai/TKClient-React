import React,{ Component } from 'react';
import ReactDom from 'react-dom';
import TkGlobal from 'TkGlobal';
import CoreController from 'CoreController';
import eventObjectDefine from 'eventObjectDefine';
import ServiceRoom from 'ServiceRoom';
import TkConstant from 'TkConstant';
import ChatListMessageDumb from '../chatListMessage';
import TkUtils from 'TkUtils';

class ChatContainer extends Component{
	constructor(props,context){
        super(props,context);
        this.state={
            updateState:false ,
        };
        this.chatType = {
            allChat: 'allChat',
        };
        this.ids={
            teacherid:'',
            myid:''
        };
        this.property = {
            publishState:0,
            drawtype:false,
            raiseHand:undefined
        };
        this.chatList = [] ; //聊天列表数组
        this.awitTextMsgs = [] ; //等待处理的聊天消息数组
        this.maxChatListNum = 10000 ; //最大的聊天列表个数
        this.maxAwitTextMsgNum = 10000 ; //最大的等待队列个数
        this.delChatListNum = 0 ; //删除聊天列表的个数
        this.listernerBackupid = new Date().getTime()+'_'+Math.random();
    };
    /*在完成首次渲染之前调用，此时仍可以修改组件的state*/
    componentWillMount(){

    }
    /*在完成首次渲染之后调用*/
    componentDidMount() {
        const that = this ;
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomConnected, that.handlerRoomConnected.bind(that) , that.listernerBackupid); //监听房间连接事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPubmsg , that.handlerRoomPubmsg.bind(that), that.listernerBackupid); //roomPubmsg事件  上课事件 classBegin
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDelmsg, that.handlerRoomDelmsg.bind(that) , that.listernerBackupid); //监听roomDelmsg
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomParticipantJoin, that.handlerRoomParticipantJoin.bind(that) , that.listernerBackupid); //监听用户加入
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomParticipantLeave, that.handlerRoomParticipantLeave.bind(that) , that.listernerBackupid); //监听用户离开
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomTextMessage, that.handlerRoomTextMessage.bind(that)  , that.listernerBackupid);//监听服务器的广播聊天消息
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomUserpropertyChanged,that.handlerRoomUserpropertyChanged.bind(that) , that.listernerBackupid);//监听学生权限变化
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPlaybackClearAllFromPlaybackController,that.handlerRoomPlaybackClearAll.bind(that) , that.listernerBackupid); //roomPlaybackClearAll 事件：回放清除所有信令
        eventObjectDefine.CoreController.addEventListener( "captureImgUploadFailed" , that.captureImgUploadFailed.bind(that), that.listernerBackupid);//截屏图片上传失败
        eventObjectDefine.CoreController.addEventListener( "captureImgStartUploading" , that.captureImgStartUploading.bind(that), that.listernerBackupid);//截屏图片开始上传
        eventObjectDefine.CoreController.addEventListener( "captureImgUploadFinished" , that.captureImgUploadFinished.bind(that), that.listernerBackupid);//截屏图片上传成功
        eventObjectDefine.CoreController.addEventListener( "captureImgUploadSaved" , that.captureImgUploadSaved.bind(that), that.listernerBackupid);//截屏图片保存成功
        eventObjectDefine.CoreController.addEventListener( "preventRepeatChat", that.handlerRepeatChat.bind(that), that.listernerBackupid);  //提示禁止刷屏
        eventObjectDefine.CoreController.addEventListener( "synchronousData", that.handlerSynchronousData.bind(that), that.listernerBackupid);  //同步聊天消息
        eventObjectDefine.CoreController.addEventListener("getHronousData", that.handlergethronousData.bind(that), that.listernerBackupid);  //同步聊天消息
        eventObjectDefine.CoreController.addEventListener( "togo_layout", that.handlerTogoLayout.bind(that), that.listernerBackupid);  //本地切换布局
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomModeChanged,that.roomModeChanged.bind(that) , that.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener( "room-text-message-list" , that.handlerRoomTextMessageList.bind(that), that.listernerBackupid);//批量处理聊天消息的添加
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomNativeNotification,that.downloadFinishedToMesg.bind(that), that.listernerBackupid);//下载成功提示
        eventObjectDefine.CoreController.addEventListener( "handleNoticeMoreUsers", that.handleNoticeMoreUsers.bind(that), that.listernerBackupid)  //提示禁止刷屏
        TkGlobal.openUrl = this.openUrl ;
        if(!this.props.isFloating){
            eventObjectDefine.CoreController.dispatchEvent({
                type: 'getHronousData'
            })
        }
    };
    /*组件被移除之前被调用，可以用于做一些清理工作*/
    componentWillUnmount(){
        let that = this ;
        eventObjectDefine.CoreController.removeBackupListerner(that.listernerBackupid );
        this.batchDisposeTimer = undefined ;
    }
    /*在组件将要更新时调用，此时可以修改state，组件初始化时不调用*/
    componentWillUpdate(){

    }
    /*在接收到新的props 或者 state，将要渲染之前调用，return false可以阻止render调用*/
    /*shouldComponentUpdate(newsProps,newState){

    }*/
    /*在组件完成更新后立即调用, 此时可以获取dom节点，在初始化时不会被调用*/
    componentDidUpdate(){

    }
    /*截屏图片上传失败*/
    captureImgUploadFailed() {
        let time = this.getSendTime(TkGlobal.playback,0);
        this.notice(time,TkGlobal.language.languageData.captureImg.uploadFailed);
    }
    // 截屏开始上传
    captureImgStartUploading(){
        let timeStart = this.getSendTime(TkGlobal.playback,0);
        this.notice(timeStart,TkGlobal.language.languageData.captureImg.StartUploading);
    }
    //截屏上传完毕
    captureImgUploadFinished(){
        let timeEnd = this.getSendTime(TkGlobal.playback,0);
        this.notice(timeEnd,TkGlobal.language.languageData.captureImg.UploadSuccess);
    }
    //截屏保存成功
    captureImgUploadSaved(recvEventData){
        let timeEnd = this.getSendTime(TkGlobal.playback,0);
        let {captureImgInfo}=recvEventData.message;
        this.notice(timeEnd,TkGlobal.language.languageData.captureImg.SaveSuccess+captureImgInfo.path);
    }
    //大房间，或者人数超过13人
    handleNoticeMoreUsers(recvEventData){
        let timeEnd = this.getSendTime(TkGlobal.playback,0);
        this.notice(timeEnd,TkGlobal.language.languageData.moreUser.text);
    }
    handlerRepeatChat(){
        this.notice(undefined, TkGlobal.language.languageData.videoContainer.sendMsg.repeatSpeak.text, 'brush');
    }

    handlerRoomTextMessageList(recvEventDate){
        let textMsgArray = recvEventDate.message ;
        this.awitTextMsgs = [...this.awitTextMsgs , ...textMsgArray ] ;
        this._batchDisposeAwitTextMsgs();
    }
    handlerSynchronousData(recvEventDate){
        let that = this;
        let {chatList} = recvEventDate.message;
        if(!this.props.isFloating){
            that.chatList = chatList;
            that.setState({
                updateState: !that.state.updateState
            })
        }
    }
    handlergethronousData(){
        let that = this;
        if (this.props.isFloating) {  //如果是是浮层聊天区就推送数据到固定聊天区\
            let arr = [];
            that.chatList.forEach((item) => {
                arr.push(item);
            })
            eventObjectDefine.CoreController.dispatchEvent({
                type: 'synchronousData',
                message: {
                    chatList: arr,
                }
            })
        }
    }
    //处理本地切换布局
    handlerTogoLayout(data){
        let that = this;
        let {nowLayout} = data.message;
        if(nowLayout === "Encompassment" && this.props.isFloating){  //如果是环绕型，并且是浮层聊天区就推送数据到固定聊天区\
            let arr = [];
            that.chatList.forEach((item)=>{
                arr.push(item);
            })
            eventObjectDefine.CoreController.dispatchEvent({
                type: 'synchronousData',
                message:{
                    chatList: arr,
                }
            })
        }
    }
    /*批量处理等待的数据*/
    _batchDisposeAwitTextMsgs(){
        if( this.awitTextMsgs.length ){
            let startTime = new Date().getTime();
            let handleNum = 0 ; //处理的个数
            L.Logger.debug('开始批量处理数据 ， 数据个数：' +this.awitTextMsgs.length + ' , 开始的时间： '+startTime);
            if( TkGlobal.HeightConcurrence && this.awitTextMsgs.length > this.maxAwitTextMsgNum ){ //大房间且等待队列个数大于最大等待个数，则删除多余的旧数据
                L.Logger.debug('等待处理的队列个数超过最大等待数 ， 最大等待数：' +this.maxAwitTextMsgNum+ ' , 当前等待队列个数： '+this.awitTextMsgs.length +'ms' +' , 删除等待队列个数：'+(this.awitTextMsgs.length - this.maxAwitTextMsgNum ));
                this.awitTextMsgs.splice( 0 , this.awitTextMsgs.length  - this.maxAwitTextMsgNum );
            }
            for( let index = 0 , length = this.awitTextMsgs.length ; index < length ; index++  ){
                handleNum++;
                switch ( this.awitTextMsgs[index].type ){
                    case 'room-text-message':
                        this.handlerRoomTextMessage( this.awitTextMsgs[index] , false ); //处理过程不render
                        break;
                }
                let ts =  new Date().getTime() - startTime ;
                if( ts > 300 ){ //处理的时间超过300ms，则不处理剩余的队列
                    L.Logger.debug('批量处理数据超过300ms ， 总共处理数据个数：' +handleNum+ ' , 总用时： '+ts+'ms' +' , 剩余处理个数：'+(this.awitTextMsgs.length - handleNum));
                    break;
                }
            }

            if( handleNum >= this.awitTextMsgs.length ){
                this.awitTextMsgs.length = 0 ;
            }else{
                this.awitTextMsgs.splice(0 , handleNum );
            }
            L.Logger.debug('本次批量处理个数：' +handleNum+ ' , 总用时： '+(new Date().getTime() - startTime)+'ms' +' , 剩余处理个数：'+this.awitTextMsgs.length );
            if( TkGlobal.HeightConcurrence && this.chatList.length > this.maxChatListNum ){ //大房间且聊天列表个数大于最大列表个数，则删除多余的旧数据
                L.Logger.debug('聊天列表个数超过最大数 ， 最大列表数：' +this.maxChatListNum+ ' , 当前列表个数： '+this.chatList.length +'ms' +' , 删除列表的个数：'+( this.chatList.length - this.maxChatListNum   ));
                this.delChatListNum +=( this.chatList.length  - this.maxChatListNum );
                this.chatList.splice(0 , this.chatList.length  - this.maxChatListNum   );
            }
            this.isNeedRender = false ;
            this.setState({
                updateState:!this.state.updateState
            });
        }
    }

    /*房间模式改变*/
    roomModeChanged(){
        if( TkGlobal.HeightConcurrence ){
            clearInterval( this.batchDisposeTimer );
            this.batchDisposeTimer = setInterval( () => { //1s后再次处理等待数据以及决定是否render
                this._batchDisposeAwitTextMsgs();
                if( this.isNeedRender ){
                    this.isNeedRender = false ;
                    this.setState({
                        updateState:!this.state.updateState
                    });
                }
            } , 2000 );
        }else{
            clearInterval( this.batchDisposeTimer );
            this.batchDisposeTimer = undefined ;
        }
    }

    /*接收到发布信令时的处理方法*/
    handlerRoomPubmsg(recvEventData){
        const that = this ;
        switch(recvEventData.message.name){
            case "EveryoneBanChat":
                let time=that.getSendTime(TkGlobal.playback,0);
                that.notice(time,TkGlobal.language.languageData.alertWin.call.prompt.allSilence.yes.text);
                break;
        }
    };
    /*接收到删除信令时的处理方法*/
    handlerRoomDelmsg(delmsgDataEvent){
        const that = this ;
        let delmsgData = delmsgDataEvent.message ;
        switch(delmsgData.name) {
            case "ClassBegin":
                if(!TkConstant.joinRoomInfo.isClassOverNotLeave && CoreController.handler.getAppPermissions('endClassbeginRevertToStartupLayout')) { //是否拥有下课重置界面权限
                    setTimeout( () => {
                        that._resetChatList();
                    } , 250 );
                }
                break;
            case "EveryoneBanChat":
                let time=that.getSendTime(TkGlobal.playback,0);
                that.notice(time,TkGlobal.language.languageData.alertWin.call.prompt.allSilence.no.text);
                break;
        }
    };
    
    handlerRoomConnected(handlerData){
        const that = this ;
        //bug有时teacherid是undefined...
        that.ids.teacherid=Object.keys(TkUtils.getSpecifyRoleList(TkConstant.role.roleChairman,ServiceRoom.getTkRoom().getUsers()))[0];//N:获取老师的id
        that.ids.myid=ServiceRoom.getTkRoom().getMySelf().id;
        if(TkGlobal.HeightConcurrence){
            // TODO...
        }else{
            if(TkConstant.hasRole.roleTeachingAssistant  && !that.isLoadUserVersion ){
                that.isLoadUserVersion = true ;
                for(let user of Object.values( ServiceRoom.getTkRoom().getUsers() ) ){    // N：只有不是大并发才会调用
                    if (user.role !== TkConstant.role.rolePatrol && user.role !== TkConstant.role.rolePlayback && !(user.role === TkConstant.role.roleTeachingAssistant && TkConstant.joinRoomInfo.isJoinRoomTip)){ //不是巡检员和直播用户,未开始配置项‘助教进教室不提醒’,才提醒
                        let time=that.getSendTime(TkGlobal.playback,user.joinTs);
                        let userVersionInfo = '' ;
                        let userRoleInfo = '';
                        switch (user.role) {
                            case TkConstant.role.roleChairman:
                                userRoleInfo = "（"+TkGlobal.language.languageData.videoContainer.sendMsg.tips.teacher+"）";
                                break;
                            case TkConstant.role.roleTeachingAssistant:
                                userRoleInfo = "（"+TkGlobal.language.languageData.videoContainer.sendMsg.tips.assistant+"）";
                                break;
                            case TkConstant.role.roleStudent:
                                userRoleInfo = "（"+TkGlobal.language.languageData.videoContainer.sendMsg.tips.student+"）";
                                break;
                            case TkConstant.role.rolePatrol:
                                userRoleInfo = "（"+TkGlobal.language.languageData.videoContainer.sendMsg.tips.patrol+"）";
                                break;
                        }

                        if(TkConstant.hasRole.roleTeachingAssistant && user.appType && user.devicetype && user.systemversion && user.version){
                            let clientDeviceVersionInfo = TkGlobal.language.languageData.version.clientDeviceVersionInfo.key + user.devicetype ;
                            let browserVersionInfo =  user.appType === 'webpageApp' && (user.devicetype === 'MacClient' || user.devicetype === 'WindowClient') && Number(user.systemversion) >= 2018010200  ? user.systemversion : ( user.appType === 'webpageApp' ? TkGlobal.language.languageData.version.browserVersionInfo.webpageApp : TkGlobal.language.languageData.version.browserVersionInfo.mobileApp) + user.systemversion   ;
                            let appVersionInfo = TkGlobal.language.languageData.version.appVersionInfo.key  + user.version;
                            // let ipInfo = TkGlobal.language.languageData.version.ipInfo.key  + user.ip;
                            let comma = (TkGlobal.language.name === 'chinese' ?'，' : ',' ) ;
                            // userVersionInfo = comma + clientDeviceVersionInfo+ (user.appType === 'webpageApp' && (user.devicetype === 'MacClient' || user.devicetype === 'WindowClient') && Number(user.systemversion) >= 2018010200 ?' ':comma) +browserVersionInfo+ comma+ appVersionInfo + comma + ipInfo;
                            userVersionInfo = comma + clientDeviceVersionInfo+ (user.appType === 'webpageApp' && (user.devicetype === 'MacClient' || user.devicetype === 'WindowClient') && Number(user.systemversion) >= 2018010200 ?' ':comma) +browserVersionInfo+ comma+ appVersionInfo;
                        }
                        that.notice(time, '<span class="limit-length diff-width">' + user.nickname + '</span>' + userRoleInfo + TkGlobal.language.languageData.alertWin.call.prompt.joinRoom.stream.join.text + userVersionInfo)
                    }
                }
            }
            if (TkConstant.hasRole.roleTeachingAssistant || TkConstant.hasRole.roleChairman || TkConstant.hasRole.rolePatrol) {
                for(let user of Object.values( ServiceRoom.getTkRoom().getUsers() ) ){   // N：只有不是大并发才会调用
                    if (user.isInBackGround === true) {//收到手机端按home键的信息
                        let time = that.getSendTime(TkGlobal.playback,0);
                        let homeRemindText = user.nickname + "（" + user.devicetype + "）" + TkGlobal.language.languageData.alertWin.call.prompt.homeBtnRemind.leave.text;
                        that.notice(time,homeRemindText);
                    }else if(user.isInBackGround === false){
                        let time = that.getSendTime(TkGlobal.playback,0);
                        let homeRemindText = user.nickname + "（" + user.devicetype + "）" + TkGlobal.language.languageData.alertWin.call.prompt.homeBtnRemind.join.text;
                        that.notice(time,homeRemindText);
                    }
                }
            }
        }
    };
    downloadFinishedToMesg(data){
        if (data.message.args && data.message.args.result && typeof data.message.args.result === "string") {
            let result = JSON.parse(data.message.args.result)
            if (result.filename) {
                return;
            }
        }
        if(data.message.name==='onHttpResult' && data.message.args.httpcode===0){
            let time=this.getSendTime(TkGlobal.playback,0);
            this.notice(time,TkGlobal.language.languageData.alertWin.call.prompt.publishStatus.download.success.text);
        }else if(data.message.name==='onHttpResult' && data.message.args.httpcode!==0){
            let time=this.getSendTime(TkGlobal.playback,0);
            this.notice(time,TkGlobal.language.languageData.alertWin.call.prompt.publishStatus.download.failed.text);
        }
    };
    handlerRoomParticipantJoin(roomEvent , isRender = true ){
        const that = this ;
        let user = roomEvent.user ;
        if( TkGlobal.HeightConcurrence ){ 
            return;
        }
        if (user.role !== TkConstant.role.rolePatrol && user.role !== TkConstant.role.rolePlayback && !(user.role === TkConstant.role.roleTeachingAssistant && TkConstant.joinRoomInfo.isJoinRoomTip)) {
          //不是巡检员和直播用户,未开始配置项‘助教进教室不提醒’,才提醒
          let time = that.getSendTime(TkGlobal.playback, roomEvent.user.joinTs);
          let userVersionInfo = "";
          let userRoleInfo = "";
          switch (user.role) {
            case TkConstant.role.roleChairman:
              userRoleInfo = "（" + TkGlobal.language.languageData.videoContainer.sendMsg.tips.teacher + "）";
              break;
            case TkConstant.role.roleTeachingAssistant:
              userRoleInfo = "（" + TkGlobal.language.languageData.videoContainer.sendMsg.tips.assistant + "）";
              break;
            case TkConstant.role.roleStudent:
              userRoleInfo = "（" + TkGlobal.language.languageData.videoContainer.sendMsg.tips.student + "）";
              break;
            case TkConstant.role.rolePatrol:
              userRoleInfo = "（" + TkGlobal.language.languageData.videoContainer.sendMsg.tips.patrol + "）";
              break;
          }

          if (TkConstant.hasRole.roleTeachingAssistant && user.appType && user.devicetype && user.systemversion && user.version) {
            let clientDeviceVersionInfo = TkGlobal.language.languageData.version.clientDeviceVersionInfo.key + user.devicetype;
            let browserVersionInfo = user.appType === "webpageApp" && (user.devicetype === "MacClient" || user.devicetype === "WindowClient") && Number(user.systemversion) >= 2018010200 ? user.systemversion : (user.appType === "webpageApp" ? TkGlobal.language.languageData.version.browserVersionInfo.webpageApp : TkGlobal.language.languageData.version.browserVersionInfo.mobileApp) + user.systemversion;
            let appVersionInfo = TkGlobal.language.languageData.version.appVersionInfo.key + user.version;
            // let ipInfo = TkGlobal.language.languageData.version.ipInfo.key  + user.ip;
            let comma = TkGlobal.language.name === "chinese" ? "，" : ",";
            // userVersionInfo = comma + clientDeviceVersionInfo+ (user.appType === 'webpageApp' && (user.devicetype === 'MacClient' || user.devicetype === 'WindowClient') && Number(user.systemversion) >= 2018010200 ?' ':comma)  +browserVersionInfo+ comma+ appVersionInfo + comma + ipInfo;
            userVersionInfo = comma + clientDeviceVersionInfo + (user.appType === "webpageApp" && (user.devicetype === "MacClient" || user.devicetype === "WindowClient") && Number(user.systemversion) >= 2018010200 ? " " : comma) + browserVersionInfo + comma + appVersionInfo;
          }
          // that.notice(time,'<span class="limit-length diff-width">'+roomEvent.user.nickname+'</span><span class="user-role">'+userRoleInfo+'</span><span class="action">'+TkGlobal.language.languageData.alertWin.call.prompt.joinRoom.stream.join.text+userVersionInfo+'</span>' , undefined , isRender);
          that.notice(time, '<span class="limit-length diff-width">' + roomEvent.user.nickname + "</span>" + userRoleInfo + " " + TkGlobal.language.languageData.alertWin.call.prompt.joinRoom.stream.join.text + userVersionInfo, undefined, isRender);
        }
    };

    handlerRoomParticipantLeave(roomEvent , isRender = true){
        const that = this ;
        if( TkGlobal.HeightConcurrence ){ //大教室且两条消息的时间间隔小于500ms，则不直接render,等待定时器去render
            return;
        }
        let user = roomEvent.user ;
        let userRoleInfo = '';
        switch (user.role) {
            case TkConstant.role.roleChairman:
                userRoleInfo = "（"+TkGlobal.language.languageData.videoContainer.sendMsg.tips.teacher+"）";
                break;
            case TkConstant.role.roleTeachingAssistant:
                userRoleInfo = "（"+TkGlobal.language.languageData.videoContainer.sendMsg.tips.assistant+"）";
                break;
            case TkConstant.role.roleStudent:
                userRoleInfo = "（"+TkGlobal.language.languageData.videoContainer.sendMsg.tips.student+"）";
                break;
            case TkConstant.role.rolePatrol:
                userRoleInfo = "（"+TkGlobal.language.languageData.videoContainer.sendMsg.tips.patrol+"）";
                break;
        }
        if (user.role !== TkConstant.role.rolePatrol && user.role !== TkConstant.role.rolePlayback && !(user.role === TkConstant.role.roleTeachingAssistant && TkConstant.joinRoomInfo.isJoinRoomTip)) { //不是巡检员和直播用户,未开始配置项‘助教进教室不提醒’,才提醒
            let time=that.getSendTime(TkGlobal.playback,roomEvent.user.leaveTs);
            // that.notice(time,'<span class="limit-length diff-width">'+roomEvent.user.nickname+'</span><span class="user-role">'+userRoleInfo+'</span><span class="action">'+TkGlobal.language.languageData.alertWin.call.prompt.joinRoom.stream.leave.text+'</span>' , undefined , isRender);
            that.notice(time,'<span class="limit-length diff-width">'+roomEvent.user.nickname+'</span>'+userRoleInfo+' '+TkGlobal.language.languageData.alertWin.call.prompt.joinRoom.stream.leave.text , undefined , isRender);
        }
    };
    /*监听聊天消息*/
    handlerRoomTextMessage( param , isRender = true ){
        let time = this.getSendTime(TkGlobal.playback,param.message.ts);
        let { message , nickname , role , userid} = param;
        let senderUser = {nickname:nickname,role:role,id:userid};
        if ( message.msg ) {
            this.appendChatList( message , senderUser , time , isRender);
        }
    };

    handlerRoomUserpropertyChanged(param, isRender = true){
        const that = this ;
        if( TkGlobal.HeightConcurrence ){ //大教室且两条消息的时间间隔小于500ms，则不直接render,等待定时器去render
            let nowTime = new Date().getTime();
            if( this.oldUserInfoNoticeTime !== undefined ){
                if(nowTime - this.oldUserInfoNoticeTime <= 500){
                    this.isNeedRender = true ;
                    isRender = false ;
                }
            }
            this.oldUserInfoNoticeTime = nowTime ;
        }
        let userid = param.user.id;
        let changeUserproperty = param.message;
        if(TkGlobal.HeightConcurrence ){
            //TODO...
        }else {
            for (let [key, value] of Object.entries(changeUserproperty)) {
                if (key === "isInBackGround" && (TkConstant.hasRole.roleTeachingAssistant || TkConstant.hasRole.roleChairman || TkConstant.hasRole.rolePatrol)) {
                    if (value === true) {//收到手机端按home键的信息
                        let user = ServiceRoom.getTkRoom().getUser(userid);  /*NN: 小班課*/
                        let time = that.getSendTime(TkGlobal.playback, 0);
                        let homeRemindText = user.nickname + "（" + user.devicetype + "）" + TkGlobal.language.languageData.alertWin.call.prompt.homeBtnRemind.leave.text;
                        that.notice(time, homeRemindText, undefined, false);
                    } else if (value === false) {
                        let user = ServiceRoom.getTkRoom().getUser(userid);  /*NN: 小班課*/
                        let time = that.getSendTime(TkGlobal.playback, 0);
                        let homeRemindText = user.nickname + "（" + user.devicetype + "）" + TkGlobal.language.languageData.alertWin.call.prompt.homeBtnRemind.join.text;
                        that.notice(time, homeRemindText, undefined, false);
                    }
                }
            }
        }


        if(userid==that.ids.myid && userid!=that.ids.teacherid && !TkGlobal.playback){//只给我自己且不是教师并且不是回放者提醒消息
            let mediatype=param.message.publishstate;//音视频权限号码 gg
            let drawtype=param.user.candraw;//画笔权限
            let raisehand=param.message.raisehand;//举手
            if(raisehand != undefined){
                that.property.raiseHand=raisehand;
            }

            let time=that.getSendTime(TkGlobal.playback,0);

            if(mediatype != undefined){
                if((that.property.publishState==3&&mediatype==1)||(that.property.publishState==2&&mediatype==4)){//视频取消
                    that.notice(time,TkGlobal.language.languageData.alertWin.call.prompt.publishStatus.stream.videooff.text , undefined , false);
                }
                if((that.property.publishState==3&&mediatype==2)||(that.property.publishState==1&&mediatype==4)){//音频取消
                    that.notice(time,TkGlobal.language.languageData.alertWin.call.prompt.publishStatus.stream.audiooff.text , undefined , false);
                }
                if((that.property.publishState==4&&mediatype==1)||(that.property.publishState==2&&mediatype==3)){//音频开启
                    that.notice(time,TkGlobal.language.languageData.alertWin.call.prompt.publishStatus.stream.audioon.text , undefined , false);
                }
                if((that.property.publishState==4&&mediatype==2)||(that.property.publishState==1&&mediatype==3)){//'视频开启'
                    that.notice(time,TkGlobal.language.languageData.alertWin.call.prompt.publishStatus.stream.videoon.text , undefined , false);
                }
                if(that.property.publishState == 0&&mediatype){//点击上课，音视频都开启了,上台，提醒上台;老师取消学生举手
                    that.notice(time,TkGlobal.language.languageData.alertWin.call.prompt.publishStatus.stream.yes_status_3.text , undefined , false);
                }

                if(mediatype == 0){//下台 gg
                    that.notice(time,TkGlobal.language.languageData.alertWin.call.prompt.publishStatus.stream.no_status_0.text , undefined , false);

                }

                that.property.publishState=mediatype;//将现有状态保存
            }

            if(drawtype != undefined){
                if(param.user.publishstate){ //上台时才提醒
                    if(drawtype!=that.property.drawtype){//涂鸦权限改变了才提醒
                        if(drawtype){//涂鸦权限
                            that.notice(time,TkGlobal.language.languageData.alertWin.call.prompt.chat.literally.yes.text , undefined , false)
                        }else{
                            that.notice(time,TkGlobal.language.languageData.alertWin.call.prompt.chat.literally.no.text , undefined , false)
                        }
                        that.property.drawtype=drawtype;//将现有状态保存
                    }
                }else{//下台时将涂鸦权限的初始值置为false，防止出现授权涂鸦后下台，上台时因默认无涂鸦权限而提醒取消涂鸦
                    that.property.drawtype= drawtype;
                }
            }
        }

        if(isRender){
            this.isNeedRender = false ;
            this.setState({
                updateState:!this.state.updateState
            });
        }
    };

    handlerRoomPlaybackClearAll(){
        this._resetChatList();
    };

    getSendTime(playback , ts){//获取当前时间或时间戳时间
        const that=this;
        let time;
        if(playback && ts!= undefined){//是回放者
            let now=new Date(parseInt(ts));
            time=this.toTwo(now.getHours())+':'+this.toTwo(now.getMinutes());
        }else{
            time=that.toTwo(new Date().getHours())+':'+that.toTwo(new Date().getMinutes());
        }
        return time;
    }

    switchRole(senderUser,chatType){//根据角色代码转换为字，跟在用户名后面，只需要老师和助教
        let person='';
        if(TkGlobal.playback){
            return person;
        }
        let myId = ServiceRoom.getTkRoom().getMySelf().id;
        if (senderUser.id === myId) {
            person =`${TkGlobal.language.languageData.videoContainer.sendMsg.tips.me}`;
        }else {
            switch (senderUser.role) {
                case TkConstant.role.roleChairman:
                    person = `${TkGlobal.language.languageData.videoContainer.sendMsg.tips.teacher}`;
                    break;
                case TkConstant.role.roleTeachingAssistant:
                    person = `${TkGlobal.language.languageData.videoContainer.sendMsg.tips.assistant}`;
                    break;
                default:
                    break;
            }
        }
        return person;
    }
    /*时间个位数转十位数*/
    toTwo(num){
        if(parseInt(num/10)==0){
            return '0'+num;
        }else{
            return num;
        }
    }
    /*通知消息*/
    notice( time, who, styleName, isRender = true ){
        this.chatList.push({
            time,
            who,
            styleName,
        });
        if( isRender ){
            this.isNeedRender = false ;
            this.setState({
                updateState:!this.state.updateState
            });
        }
    }
    /*发送的表情代码正则转为图片*/
    replace_em(str){
        if(!str) return;

        if(str.indexOf()){
            str = str.replace(/\</g,'&lt;').replace(/\>/g,'&gt;').replace(/\n/g,'<br/>').replace(/ /g,'&nbsp;');
        }

        if(str.indexOf('em')!=-1){
            str = str.replace(/\[em_([1-8]*)\]/g,function(str,str1){
                return '<img src='+"./img/"+str1+".png"+' border="0" />' ;
            })
        }
        // var reg= /((https|http|ftp|rtsp|mms):\/\/)?(([0-9a-z_!~*'().&=+$%-]+:)?[0-9a-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}\.){3}[0-9]{1,3}|([0-9a-z_!~*'()-]+\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\.[a-z]{2,6})(:[0-9]{1,4})?((\/?)|(\/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+\/?)[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_]/g;
        var reg= /((http|ftp|https):\/\/)?[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/g;
        str=str.replace(/&nbsp;/g,' ')
        str=str.replace(reg,(a)=>{
            var changeArry=a;
            if(changeArry.split('.').length==2){
                if(!a.match(/.com|.cn|.net|.org|.gov|.edu|.mil|.mobi|.io|.ws|.tv|.fm|.museum|.int|.areo|.post|.rec|.asia/i)){
                    return a;
                }
            }
            let url = a.indexOf('http') != -1 ? a : 'http://' + a;
            if (!TkGlobal.isClient) {
                return '<a href="' + url + '" target="_blank"' + ' >' + a + '</a>'
            } else if (TkGlobal.isClient && TkGlobal.clientversion >= 2018031000 &&  ServiceRoom.getNativeInterface().clientOpenBrowserUrl) {
                let copyUrl = "'"+url+"'" ;
                return '<a href="javascript:void(0);" onclick="window.GLOBAL.openUrl(' + copyUrl +')">'+a+'</a>'
            }

        })
        return	<span  dangerouslySetInnerHTML={{__html: str}} ></span>
    }

    openUrl(url){
        TkGlobal.isClient && ServiceRoom.getNativeInterface().clientOpenBrowserUrl(url);
    }
    /*添加聊天记录列表*/
    appendChatList( message , senderUser , time , isRender = true ){
        let that = this;
        let msg = message.msgtype === 'onlyimg'?message.msg:that.replace_em(message.msg);
        let roleName = this.switchRole(senderUser,message.type);
        if (message.type === 0) {
            that.chatList.push( {
                who: senderUser.nickname,
                sendUserType: roleName,
                time: time,
                msg: msg,
                styleName: senderUser.id === ServiceRoom.getTkRoom().getMySelf().id ? 'isme ' : '',
                type: message.type,
                fromID: senderUser.id,
                msgtype: message.msgtype,
                cospath: message.cospath,
            });
            if(isRender){
                this.isNeedRender = false ;
                this.setState({
                    updateState:!this.state.updateState
                });
            }
        }
    };
    /*修改列表数据*/
    changeChatList(msgIndex,transResult){
        if (this.chatList[msgIndex]) {
            this.chatList[msgIndex].transResult = transResult;
            this.isNeedRender = false ;
            this.setState({
                updateState:!this.state.updateState
            });
        }
    };
    /*重置聊天列表*/
    _resetChatList(){
        this.chatList = [] ;
        this.awitTextMsgs = [] ;
        this.isNeedRender = false ;
        this.setState({
            updateState:!this.state.updateState
        });
    };

    accelerateDate(index){
        return this.chatList[index]
    }
	render(){
        let {isShow}=this.props;
		return(
            <section className={"chat-part " + (TkConstant.hasRole.rolePatrol||TkConstant.hasRole.rolePlayback ? " aa" : "" ) } >
                <ChatListMessageDumb isShow={isShow} changeChatList={this.changeChatList.bind(this)} accelerateDate={this.accelerateDate.bind(this)} chatMessageListLength={this.chatList.length} show={this.props.selectChat === this.chatType.allChat} delChatListNum={this.delChatListNum} />
            </section>
		)
	};
};

export default ChatContainer;
