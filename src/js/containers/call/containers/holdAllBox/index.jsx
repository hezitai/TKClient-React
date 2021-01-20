/**
 * 教学工具箱 Smart组件
 * @date 2018/11/21  重构
 */
'use strict';
import "./static/css/index.css";
import "./static/css/index_black.css";
import React from 'react';
import TkGlobal from 'TkGlobal' ;
import TkConstant from 'TkConstant' ;
import ServiceRoom from 'ServiceRoom' ;
import ServiceSignalling from 'ServiceSignalling' ;
import eventObjectDefine from 'eventObjectDefine';
import CoreController from 'CoreController';
import TkUtils from 'TkUtils';
import styled from "styled-components";
import Answer from './HoldBtn/Answer'
import Turnplate from './HoldBtn/Turnplate'
import Timer from './HoldBtn/Timer'
import QrCode from './HoldBtn/QrCode'
import Responder from './HoldBtn/Responder'
import Sharing from './HoldBtn/Sharing'
import Blackboard from './HoldBtn/Blackboard'
import MovieShare from './HoldBtn/MovieShare'
import AllCaptrue from './HoldBtn/AllCaptrue'
import SmallCaptrue from './HoldBtn/SmallCaptrue'
// import sharingScreen from './HoldBtn/sharingScreen'

const HoldAllBoxDiv = styled.div`
  display: ${props => (props.isShow ? "block" : "none")};
`;

class HoldAll extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            isShow: false,
            // qrCodeBoxIsShow:false,
            // disabledSharing: false,
            // toolsShow: {
            //     destTopShare:false ,
            //     answer:false ,
            //     turnplate:false ,
            //     qrCode:false ,
            //     timer:false ,
            //     responder:false ,
            //     moreBlackboard:false ,
            // },
            holdData: {
                'answer': { //答题器
                    name: TkGlobal.language.languageData.answers.headerTopLeft.text,
                    bgName: 'answerBtn',
                    isDisabled: false,
                    isShow: false,
                    id: 'answer',
                },
                'turnplate': {  //转盘
                    name: TkGlobal.language.languageData.dial.turntable.text,
                    bgName: 'turnplateBtn',
                    isDisabled: false,
                    isShow: false,
                    id: 'turnplate',
                },
                'timer': {  //计时器
                    name: TkGlobal.language.languageData.timers.timerSetInterval.text,
                    bgName: 'timerBtn',
                    isDisabled: false,
                    isShow: false,
                    id: 'timer',
                },
                'qrCode': { //扫码
                    name: TkGlobal.language.languageData.header.tool.qrCode.title.yes,
                    bgName: 'qrCodeBtn',
                    isDisabled: false,
                    isShow: false,
                    id: 'qrCode',
                },
                'responder': {  //抢答器
                    name: TkGlobal.language.languageData.responder.responder.text,
                    bgName: 'responderBtn',
                    isDisabled: false,
                    isShow: false,
                    id: 'responder',
                },
                'sharing': {    //共享
                    name: TkGlobal.language.languageData.shares.shareSceen.text,
                    bgName: 'sharingBtn',
                    isDisabled: false,
                    isShow: false,
                    id: 'sharing',
                },
                'blackboard': { //小白板
                    name: TkGlobal.language.languageData.header.tool.blackBoard.title.open,
                    bgName: 'blackboardBtn',
                    isDisabled: false,
                    isShow: false,
                    id: 'blackboard',
                },
                'movieShare': { //媒体共享
                    name: TkGlobal.language.languageData.toolContainer.toolIcon.moviesSharing.title,
                    bgName: 'movieShareBtn',
                    isDisabled: false,
                    isShow: false,
                    id: 'movieShare',
                },
                'allCaptrue': {    //教室截屏
                    name: TkGlobal.language.languageData.header.tool.capture.title.all,
                    bgName: 'allCaptureBtn',
                    isDisabled: false,
                    isShow: false,
                    id: 'allCaptrue',
                },
                'smallCaptrue': {  //桌面截屏
                    name: TkGlobal.language.languageData.header.tool.capture.title.small,
                    bgName: 'smallCaptureBtn',
                    isDisabled: false,
                    isShow: false,
                    id: 'smallCaptrue',
                },
                // 'sharingScreen': {  //屏幕共享
                //     name: '屏幕共享',
                //     bgName: 'sharingScreenBtn',
                //     isDisabled: false,
                //     isShow: false,
                //     id: 'sharingScreen',
                // },
            },
            HoldBtn:[],
        };

        this.listernerBackupid = new Date().getTime()+'_'+Math.random();
    }
    componentDidMount(){
        let that = this;
        eventObjectDefine.CoreController.addEventListener('togo_holdArr', that.handleTogoHoldAll.bind(that), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPubmsg ,that.handlerRoomPubmsg.bind(that) , that.listernerBackupid ); //roomPubmsg 事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDelmsg ,that.handlerRoomDelmsg.bind(that) , that.listernerBackupid ); //roomPubmsg 事件
        eventObjectDefine.CoreController.addEventListener("initAppPermissions" ,that.handlerInitAppPermissions.bind(that) , that.listernerBackupid );
        eventObjectDefine.CoreController.addEventListener( "updateAppPermissions_isQrCode" , that.handlerIsQrCode.bind(that), that.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener("updateAppPermissions_Asharing", that.Asharing.bind(that), that.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener( "updateAppPermissions_isCapture" , that.handlerIsCaptureUpdate.bind(that), that.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener("colse-holdAll-item", this.handleCloseItem.bind(that), that.listernerBackupid);  //工具关闭事件
		eventObjectDefine.CoreController.addEventListener( "recoverPanelBeforeStarting" , that.handlercloseHoldAll.bind(that), that.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener( "CloseALLPanel" , that.close.bind(that), that.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener( "receiveWhiteboardSDKAction" , this.receiveWhiteboardSDKAction.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomUserpropertyChanged , that.handlerRoomUserpropertyChanged.bind(that) , that.listernerBackupid );  //监听用户属性改变
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomAudiovideostateSwitched, that.handlerRoomAudiovideostateSwitched.bind(that), that.listernerBackupid); //room-audiovideostate-switched 纯音频房间切换事件
    }

    /*组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器*/
    componentWillUnmount() {
        const that = this ;
        eventObjectDefine.CoreController.removeBackupListerner( that.listernerBackupid );
    };

    handlerIsQrCode(recvEventData){
      this.handlerInitAppPermissions();
    };
    Asharing(){
        this.handlerInitAppPermissions();
    }
    handlerIsCaptureUpdate(recvEventData){
        this.handlerInitAppPermissions();
    };
    receiveWhiteboardSDKAction(recvEventData){
        let {action ,cmd } = recvEventData.message;
        if(action === "mediaPlayerNotice" && cmd.streamType==='file'){
            if(cmd.type === 'end'){
                this.isDisabledHoldItem('movieShare', false);
            }else{
                this.isDisabledHoldItem('movieShare', true);
            }
        }
    }
    handlerInitAppPermissions(){
        let holdData = this.state.holdData;
        let isChrome =this.BrowserCheck()[0]==='Chrome';//判断是否是chrome内核
        let { roleChairman, roleTeachingAssistant} = TkConstant.hasRole;
        holdData.turnplate.isShow = TkConstant.joinRoomInfo.toolBox.turnplate  &&  (roleChairman || roleTeachingAssistant);
        holdData.answer.isShow = TkConstant.joinRoomInfo.toolBox.answer && (roleChairman || roleTeachingAssistant);
        holdData.responder.isShow = TkConstant.joinRoomInfo.toolBox.responder &&  (!TkConstant.hasRoomtype.oneToOne && !TkGlobal.roomChange ) && (roleChairman || roleTeachingAssistant);
        holdData.blackboard.isShow = TkConstant.joinRoomInfo.toolBox.moreBlackboard  && (roleChairman || roleTeachingAssistant);
        holdData.qrCode.isShow = CoreController.handler.getAppPermissions('isQrCode') && TkConstant.joinRoomInfo.qrCode ;
        holdData.timer.isShow = TkConstant.joinRoomInfo.toolBox.timer && (roleChairman || roleTeachingAssistant);
        // holdData.sharing.isShow = !TkGlobal.isOnlyAudioRoom && TkGlobal.isClient && !TkGlobal.isMacClient && ((TkConstant.joinRoomInfo.toolBox.destTopShare && roleChairman) || (TkConstant.joinRoomInfo.isDoubleShare && CoreController.handler.getAppPermissions('Asharing')));
        holdData.sharing.isShow = !TkGlobal.isOnlyAudioRoom && ((TkConstant.joinRoomInfo.toolBox.destTopShare && roleChairman) || (TkConstant.joinRoomInfo.isDoubleShare && CoreController.handler.getAppPermissions('Asharing'))) && (TkGlobal.isClient || (!TkGlobal.isClient && !TkGlobal.isMobile && isChrome));
        holdData.movieShare.isShow = TkGlobal.isClient && CoreController.handler.getAppPermissions('isMoviesShare') && (roleChairman || roleTeachingAssistant) && !TkGlobal.isOnlyAudioRoom && !TkGlobal.isMacClient;
        holdData.allCaptrue.isShow = CoreController.handler.getAppPermissions('isCapture') && TkGlobal.isClient&&!TkGlobal.isMacClient;
        holdData.smallCaptrue.isShow = CoreController.handler.getAppPermissions('isCapture') && TkGlobal.isClient&&!TkGlobal.isMacClient;

        if(CoreController.handler.getAppPermissions('canDraw')){
            eventObjectDefine.CoreController.dispatchEvent({
                type:'isholdAllShow' ,
                message:{
                    isShowData:holdData
                },
            });
        }
        this.setState({ holdData})
    };
    handlerRoomPubmsg(recvEventData){
        let pubmsgData = recvEventData.message;
        switch (pubmsgData.name) {
            case "BlackBoard_new":
                this.isDisabledHoldItem('blackboard', true);
                break;
            case "answer":
                this.isDisabledHoldItem('answer', true);
                break;
            case "Question":
                this.isDisabledHoldItem('answer', true);
                break;
            case "dial":
                this.isDisabledHoldItem('turnplate', true);
	            break;
            case "timer":
                this.isDisabledHoldItem('timer', true);
	            break;
	        case "qiangDaQi":
                this.isDisabledHoldItem('responder', true);
	            break;
            case "OnlyAudioRoom":
                // let  toolsShow = this.state.toolsShow;
                // toolsShow.destTopShare = false;
                // this.setState({
                //     isOnlyAudioRoom:true,
                //     toolsShow:toolsShow
                // });
                this.isDisabledHoldItem('sharing', true);
                this.isDisabledHoldItem('movieShare', true);
                break;
        }
    };
    handlerRoomDelmsg(recvEventData){
        let delmsgData = recvEventData.message;
        switch (delmsgData.name) {
            case "BlackBoard_new":
                this.isDisabledHoldItem('blackboard', false);
                break;
            case "answer":
                this.isDisabledHoldItem('answer', false);
                break;
            case "Question":
                this.isDisabledHoldItem('answer', false);
                break;
            case "dial":
                this.isDisabledHoldItem('turnplate', false);
	            break;
            case "timer":
                this.isDisabledHoldItem('timer', false);
	            break;
	        case "qiangDaQi":
                this.isDisabledHoldItem('responder', false);
	            break;
            case "OnlyAudioRoom":
                // let  toolsShow = this.state.toolsShow;
                // toolsShow.destTopShare = false;
                // this.setState({
                //     isOnlyAudioRoom:false,
                //     toolsShow:toolsShow
                // });
                this.isDisabledHoldItem('sharing', false);
                this.isDisabledHoldItem('movieShare', false);
                break;
	        case "ClassBegin":
                let holdData = this.state.holdData;
                for(let item in holdData){
                    holdData[item].isDisabled = false;
                }
                this.setState({ holdData });
                break;
            case 'roomStart': 
                this.close();
                break;
        }
    };
    handlercloseHoldAll(){
        let that = this;
        let holdData = that.state.holdData;
        for(let index in holdData){
            holdData[index].isDisabled = false;
        }
        this.close();
        that.setState({ holdData })
    }
    handlerRoomUserpropertyChanged(){
        let that = this;
        let holdItemList = that.getOpenHoldItemArr();
        if( !(holdItemList.length > 0) ){
            that.setState({
                isShow: false,
            })
        }
    }
    handlerRoomAudiovideostateSwitched(roomSwitchEventData){
        this.handlerInitAppPermissions();
        // if (TkGlobal.isOnlyAudioRoom) {
        //     this.isDisabledHoldItem('sharing', false);
        //     this.isDisabledHoldItem('movieShare', false);
        // } else {
        //     this.isDisabledHoldItem('sharing', true);
        //     this.isDisabledHoldItem('movieShare', true);
        // }
    }
    
    // 关闭工具箱
    close(){
        let that = this;
        eventObjectDefine.CoreController.dispatchEvent({
			type: 'colose_holdArr',
        });
        this.setState({
            isShow: false
        })
    }

    //  开启或关闭工具箱
    handleTogoHoldAll(handleData){
        let that = this;
        that.setState({
            isShow: handleData.isShow,
        })
    }

    // 启用工具箱按钮
    handleCloseItem(data) {
        let that = this;
        that.isDisabledHoldItem(data.message.type, false);
    }

    // 工具箱按钮状态更改
    isDisabledHoldItem(type, isDisabled){
        let that = this;
        let holdData = that.state.holdData;
        holdData[type].isDisabled = isDisabled;
        if(type==='movieShare' && TkGlobal.isClient && (TkConstant.hasRole.roleChairman||TkConstant.hasRole.roleTeachingAssistant)){
            holdData[type].isShow = true;
        }
        that.setState({
            holdData
        })
    }

    // 截屏上传文件
    takeSnapshot(data) {
        let _this=this;
        let isHideClassroom=data.isHideClassroom;
        // let fileName='TK'+new Date().getFullYear()+Number(new Date().getMonth() + 1)+new Date().getDate()+new Date().getHours()+new Date().getMinutes()+new Date().getSeconds();
        let fileName='TK'+TkUtils.dateFormat(new Date() , 'yyyyMMddHHmmss');
        let isAdd = true ;
        if(TkGlobal.isClient && !TkGlobal.isMacClient && ServiceRoom.getNativeInterface() ){
            ServiceRoom.getNativeInterface().screenCaptureUpload(fileName, (action, requestId, total, now, code, captureImgInfo) => {
                if (action === "progress") {
                    if(isAdd){
                        _this.setState({
                            isCapture:false
                        });
                        eventObjectDefine.CoreController.dispatchEvent({type:'captureImgStartUploading' });
                        isAdd=false;
                    }
                }
                if (action === "saved") {
                    if (code === 0) {
                        _this.setState({
                            isCapture:true
                        });
                        eventObjectDefine.CoreController.dispatchEvent({type:'captureImgUploadSaved' , message:{captureImgInfo:captureImgInfo}});
                    }
                }
                if (action === "result") {
                    if (code === 0 && captureImgInfo.swfpath) {
                        captureImgInfo.fileid = TkUtils.dateFormat(new Date() , 'yyyyMMddHHmmss');
                        let id = "CaptureImg_" + captureImgInfo.fileid;
                        let imgType = captureImgInfo.swfpath.substring(captureImgInfo.swfpath.lastIndexOf(".")) || '.jpg';
                        let fileUrl = captureImgInfo.swfpath.replace(imgType,"-1"+imgType) ;
                        let watermarkImageUrl = window.WBGlobal.nowUseDocAddress + fileUrl;
                        let watermarkImage = new Image();
                        watermarkImage.onload = function(){
                            let defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
                            let data = {
                                captureImgInfo:captureImgInfo,
                                remSize:{
                                    width: watermarkImage.width / defalutFontSize  ,
                                    height:watermarkImage.height / defalutFontSize  ,
                                }
                            };
                            ServiceSignalling.sendSignallingFromCaptureImg(id, data);
                        };
                        watermarkImage.src = watermarkImageUrl;
                        L.Logger.info('capture image info：' + captureImgInfo);
                        _this.setState({
                            isCapture:true
                        });
                        eventObjectDefine.CoreController.dispatchEvent({type:'captureImgUploadFinished' });
                        ServiceRoom.getTkWhiteBoardManager().useWhiteboardTool('tool_pencil'); //截屏后默认变回铅笔,跟客户端截屏保持一致
                    } else{
                        _this.setState({
                            isCapture:true
                        });
                        eventObjectDefine.CoreController.dispatchEvent({
                            type: 'captureImgUploadFailed',
                        });
                        L.Logger.warning('capture image upload failed');
                    }
                }
            },isHideClassroom);
        }
    }

    // 获取需要显示的工具元素
    getOpenHoldItemArr(){
        let that = this;
        let holdData = that.state.holdData;
        let holdItemList = [];
        for(let index in holdData){
            if(holdData[index].isShow){
                holdItemList.push(holdData[index]);
            }
        }
        return holdItemList;
    }

    //  创建工具元素
    createHoldItemElement(){
        let that = this;
        let holdItemList = that.getOpenHoldItemArr();
        let holdElementList = [];

        let { answer, turnplate, timer, qrCode, responder, sharing, blackboard, movieShare, allCaptrue, smallCaptrue, sharingScreen } = that.state.holdData;
        let propsFunc = {
            close: that.close.bind(that)  ,
            isDisabledHoldItem: that.isDisabledHoldItem.bind(that) 
        }
        let cmpts = {
            answer: <Answer key={0} {...answer} {...propsFunc} />,
            turnplate: <Turnplate key={1} {...turnplate} {...propsFunc} />,
            timer: <Timer key={2} {...timer} {...propsFunc} />,
            qrCode: <QrCode key={3} {...qrCode} {...propsFunc} />,
            responder: <Responder key={4} {...responder} {...propsFunc} />,
            sharing: <Sharing key={5} {...sharing} {...propsFunc} />,
            blackboard: <Blackboard key={6} {...blackboard} {...propsFunc} handlerRoomPubmsg={that.handlerRoomPubmsg.bind(that)} />,
            movieShare: <MovieShare key={7} {...movieShare} {...propsFunc} />,
            allCaptrue: <AllCaptrue key={8} {...allCaptrue} {...propsFunc} takeSnapshot={that.takeSnapshot.bind(that)} />,
            smallCaptrue: <SmallCaptrue key={9} {...smallCaptrue} {...propsFunc} takeSnapshot={that.takeSnapshot.bind(that)} />,
            // sharingScreen:<sharingScreen key={10} {...sharingScreen} {...propsFunc} />,
        };

        holdItemList.forEach((item, index)=>{
            holdElementList.push(cmpts[item.id]);
        })

        return holdElementList;
    }

    BrowserCheck() {
        var N = navigator.appName, ua = navigator.userAgent, tem;
        var M = ua.match(/(opera|chrome|safari|firefox|msie|trident)\/?\s*(\.?\d+(\.\d+)*)/i);
        if (M && (tem = ua.match(/version\/([\.\d]+)/i)) != null) { M[2] = tem[1]; }
        M = M ? [M[1], M[2]] : [N, navigator.appVersion, '-?'];
        return M;
    }

    //阻止点击关闭弹框
    _stopPreventClick(e){
        e.preventDefault();
        e.stopPropagation();
    }
    
    render(){
        let that = this;
        let holdItemElement = that.createHoldItemElement();
        const {id } = that.props;

        

        return <div>
            <HoldAllBoxDiv id={id} isShow={that.state.isShow} onClick={this._stopPreventClick.bind(this)} className={`hold-all-box ${TkConstant.hasRole.roleStudent ? "hold-all-box-student" : ""} `}>
              <ul className={"holdItemBox "}>{holdItemElement}</ul>
            </HoldAllBoxDiv>
          </div>;
    }
}

export default HoldAll;