/**
 * TK权限控制类
 * @class TkAppPermissions
 * @description   提供 TK系统所需的权限控制
 * @author QiuShao
 * @date 2017/08/08
 */
'use strict';
import eventObjectDefine from 'eventObjectDefine';

class TkAppPermissions{
    constructor(){
        this.permissionsJson = this.productionDefaultAppAppPermissions();
    };

    productionDefaultAppAppPermissions(){
        let defaultAppPermissions =  {
            canDraw:false , //画笔权限
            classBtnIsDisableOfRemind:false,//根据提示上课按钮能否点击
            loadClassbeginRemind:false,//加载上课提示权限
            whiteboardPagingPage:false , //白板翻页权限
            newpptPagingPage:false , //动态ppt翻页权限
            h5DocumentPagingPage:false , //h5课件翻页权限
            h5DocumentActionClick:false,//h5课件点击动作的权限
            dynamicPptActionClick:false,//动态PPT点击动作的权限
            pubMsg:true , //pubMsg 信令权限
            delMsg:true , //delMsg 信令权限
            setProperty:true , //setProperty 信令权限
            setParticipantPropertyToAll:true , //setParticipantPropertyToAll 设置参与者属性发送给所有人权限
            setParticipantPropertyToAllByoRole:true, //setParticipantPropertyToAllByoRole  改变指定角色的用户属性发送给所有人权限
            sendSignallingDataToParticipant:true , //sendSignallingDataToParticipant 发送信令pubmsg和delmsg的权限
            sendTextMessage:true , //发送聊天消息的权限
            sendSignallingFromClassBegin:false , //上下课信令权限
            sendSignallingTimerToStudent:false,//老师教课工具倒计时信令权限
            sendSignallingDialToStudent:false,//转盘的信令权限
            studentInit:false, //学生的初始权限
            dialIconClose:false,//转盘图标关闭的初始权限
            sendSignallingQiangDaQi:false,//抢答器发送的信令
            sendSignallingQiangDaZhe:true,//抢答者发送的信令
            sendSignallingFromVideoSplitScreen:false,//演讲模式双击视频分屏的动作相关信令权限
            sendSignallingFromUpdateTime:false , //发送更新时间信令权限
            sendSignallingFromDocumentChange:false , //发送文档上传或者删除相关的信令权限
            sendSignallingFromStreamFailure:false , //数据流失败后发送信令权限
            sendSignallingFromVideoDraghandle:false,//拖拽的信令权限
            sendSignallingFromBlackBoardDrag:false,//小黑板拖拽的信令权限

            userPlatformUpOrDown:false , //上下讲台信令的发送权限
            userAudioOpenOrClose:false , //打开关闭音频权限
            userVideoOpenOrClose:false , //打开关闭视频权限
            changeUserCandraw:false , //改变用户的画笔权限
            sendGift:false , //发送礼物权限
            roomStart:false , //上课发送的web接口roomstart权限
            roomOver:false , //下课发送的web接口roomove权限
            giveAllUserSendGift:false , //给所有用户发送礼物权限
            giveAloneUserSendGift:false , //给单独用户发送礼物权限
            allUserMute:false , //全体静音权限
            hasAllSpeaking:false , //全体发言权限
            allUserTools:false,//教学工具的权限
            allTrophy:false,//自定义奖杯工具的权限
            dialCircleClick:true,//转盘是否可以点击
            startClassBegin:false , //上课权限
            endClassBegin: false, //下课权限
            forcedEndClassBegin: false, //强制下课权限
            raisehand: false, //举手权限
            raisehandDisable:false , //举手不可点击权限
            loadUserlist:false , //加载用户列表的权限
            loadCoursewarelist:true , //加载文档文件列表的权限
            loadMedialist:true , //加载媒体文件列表的权限
            loadSystemSettings:true,//加载系统设置的权限
            loadNoviceHelp:true,//加载新手帮助的权限
            showUserlistIcon:false , //显示用户列表的状态图标权限
            laser:false , //激光笔权限
            autoPublishAV:false , //自动发布音视频权限
            userlisPlatform:false , //用户列表点击上下台的权限
            openFileIsClick:true,//是否能点击打开文档和媒体文件的权限
            publishMediaStream:false , //发布媒体文件流的权限
            unpublishMediaStream:false , //取消发布媒体文件流的权限
            publishFileStream:false , //发布本地媒体文件流的权限
            unpublishFileStream:false , //取消发布本地媒体文件流的权限
            publishDynamicPptMediaPermission_video:false , //发布动态PPT视频的权限
            autoClassBegin:false , //自动上课权限
            hiddenClassBeginAutoClassBegin:false , //隐藏上下课按钮自动上课权限
            dblclickDeviceVideoFullScreenRight:false , //双击右侧设备流全屏
            dblclickDeviceVideoFullScreenBottom:false , //双击底部设备流全屏
            studentVframeBtnIsHide:true,//学生关闭音视频的按钮是否隐藏
            teacherVframeBtnIsShow:false,//老师视频框的按钮是否能显示的权限
            endClassbeginRevertToStartupLayout:false , //下课后恢复界面的默认界面的权限
            endClassbeginShowLocalStream:false , //下课后显示本地视频权限
            delmsgTo__AllAll:false , //清除所有信令的权限
            sendWhiteboardMarkTool:false , //发送标注工具信令权限
            isChangeVideoSize:false,//是否可以拉伸视频框
            jumpPage:false,//能否输入页数跳转到指定文档页权限
            pairOfManyIsShow:false,//是否显示一对三十的界面和逻辑
            toolListIsShowPairMany:false,//在一对三十的界面是否显示用户列表
            sendSignallingFromBlackBoard:false,//发送多黑板信令的权限
            sendSignallingFromLowConsume:false , //发送性能指标信令（适应IOS配置）
            sendSignallingFromDialDrag:false , //转盘拖拽的相关信令
            isSendSignallingFromTimerDrag:false , //计时器拖拽的相关信令
            isSendSignallingFromAnswerDrag:false , //答题卡拖拽的相关信令
            isSendSignallingFromResponderDrag:false , //抢答器拖拽的相关信令
            isSendSignallingFromVideoChangeSize:false , //视频框拉伸的相关信令
            isSendSignallingFromVideoWhiteboard:false,//视频标注的相关信令
            sendSignallingFromRemoteControl:false , //发送远程控制信令
            isCanDragVideo:false,//能否拖拽视频框
            closeMyseftAV:false , //关闭自己音视频权限
            controlOtherVideo:false  , //控制别人的视频框上的操作权限
            localStream:false , // 本地视频流权限
            /*publishVideoStream:false , //发布音视频流权限*/
            isShowVideoDrawTool:false,//视频标注工具条是否有权限显示
            isCapture:false,//截屏否有权限显示
            isMoviesShare:false,//电影共享否有权限显示
            isQrCode:false,//二维码拍照上传否有权限显示
            localRecord:false,//本地录制权限
			isShowCoursewareRemarks:false,//是否有权限显示课件备注
            isSendSignallingFromFullScreen:false,//是否有权限发送画中画全屏的信令
			pictureInPicture:false,//视频全屏后采用画中画权限
			isHandleVideoInFullScreen:false,//是否能操作课件或MP4全屏后video放置右下角
            chatSendImg:false,//是否能操作课件或MP4全屏后video放置右下角
            isSendSignallingFromCaptureImg:false,//是否能发送截屏信令
            canDragCaptureImg:false,//能否拖拽截屏图片
            isSendSignallingFromCaptureImgDrag:false,//是否能发送截屏图片拖拽信令
            canResizeCaptureImg:false,//能否拉伸截屏图片
            isSendCaptureImgResize:false,//能否发送拉伸截屏图片的信令
            publishDeskTopShareStream:false, //桌面共享
            unpublishDeskTopShareStream:false, //取消桌面共享
            isShowPPTToolBottom:false,//ppt翻页放大的控制件 智课学生不显示
            sendSignallingFromExtendSignalling:false,//发送信令扩展权限
            sendSignllingEveryoneBanChat: false, //全员禁言
            switchLayout:false,   //切换布局
            doubleClickVideo:false,   //双击视频同步
            sendQuestion: false, //高并发答题器发起答题信令
            publishResult: false, //高并发答题器发布答题结果信令
            answerCommit: false, //高并发答题器提交答案信令
            getQuestionCount: false, //高并发答题器获取结果信令
        }; //权限存储json
        return defaultAppPermissions;
    }

    /*重置默认的权限*/
    resetDefaultAppPermissions(isSendReset = true){
        const that = this ;
        that.permissionsJson = that.productionDefaultAppAppPermissions();
        if(isSendReset){
            eventObjectDefine.CoreController.dispatchEvent({
                // type:'resetDefaultAppPermissions',
                type:'initAppPermissions',
                message:{
                    data:that.permissionsJson ,
                }
            });
        }
    };

    /*重置权限*/
    resetAppPermissions( appPermissions ,  isSendReset = true){
        const that = this ;
        if(appPermissions && typeof appPermissions === 'object'){
            Object.customAssign(that.permissionsJson , appPermissions) ;
            if(isSendReset){
                eventObjectDefine.CoreController.dispatchEvent({
                    type:'resetAppPermissions',
                    message:{
                        data:that.permissionsJson ,
                    }
                });
            }
        }
    };

    /*设置（更新）权限
    *@method updateAppPermissions
    *@params [appPermissionsKey:string , appPermissionsValue:any ] */
    setAppPermissions(appPermissionsKey ,appPermissionsValue ){
        let that = this ;
        if(that.permissionsJson[appPermissionsKey] !== appPermissionsValue){
            L.Logger.debug('setAppPermissions key and value:' , appPermissionsKey , appPermissionsValue  , 'old appPermissions:' , that.permissionsJson[appPermissionsKey] );
            that.permissionsJson[appPermissionsKey] = appPermissionsValue ;
            let updateAppPermissionsEventData = {
                type:'updateAppPermissions_'+appPermissionsKey ,
                message:{
                    key:appPermissionsKey ,
                    value:appPermissionsValue
                }
            };
            eventObjectDefine.CoreController.dispatchEvent(updateAppPermissionsEventData);
        }
    };
    /*设置（更新）权限
     *@method updateAppPermissions
     *@params [appPermissionsKey:string] */
    getAppPermissions(appPermissionsKey){
        let that = this ;
        return that.permissionsJson[appPermissionsKey] ;
    };
    /*初始化权限
     *@method initAppPermissions
     *@params [initAppPermissionsJson:json] */
    initAppPermissions(initAppPermissionsJson){
        L.Logger.debug('initAppPermissions data:' , initAppPermissionsJson );
        let that = this ;
        for(let appPermissionsKey in initAppPermissionsJson){
            that.permissionsJson[appPermissionsKey] = initAppPermissionsJson[appPermissionsKey] ;
        }
        eventObjectDefine.CoreController.dispatchEvent({
            type:'initAppPermissions',
            message:{
                data:that.permissionsJson ,
            }
        });
        eventObjectDefine.CoreController.dispatchEvent({//todo 白板whiteboard.js的学生监听不到initAppPermissions，原因待查！！！
            type:'initAppPermissionsOfWhiteboard',
            message:{
                data:that.permissionsJson ,
            }
        });
    };

};
const TkAppPermissionsInstance = new TkAppPermissions() ;
export  default TkAppPermissionsInstance ;
