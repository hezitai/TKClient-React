import React from 'react';
import TkGlobal from 'TkGlobal' ;
import TkConstant from 'TkConstant' ;
import WhiteboardSmart from './whiteboard';
import eventObjectDefine from 'eventObjectDefine';
import CoreController from 'CoreController' ;
import ServiceRoom from "ServiceRoom";
import ServiceSignalling from 'ServiceSignalling' ;
import TkSliderDumb from 'TkSliderDumb';
import ColorPicker from '../../../components/colorPicker/index'

class VideoDrawingBoard extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state={
            eraserShow:false,
            penShow:false,
            videoDrawBoardInfo:{
                containerWidthAndHeight:{
                    width:0,
                    height:0,
                },
                watermarkImageScalc:16/9,
                isShow:false,
                backgroundColor:'transparent',
                instanceId:this.props.videoDrawingBoardInstanceId || 'videoDrawBoard',
                saveImage:false,
                nickname:this.props.videoDrawingBoardInstanceId  ||'videoDrawBoard',
                deawPermission:false,
                associatedMsgID:'VideoWhiteboard',
            },
            useToolInfo:{
                useToolKey:'tool_pencil',
                useToolColor:this._changeWhiteboardConfig(),
                blackboardToolsInfo:TK.SDKTYPE !== 'mobile'?{pencil:5 , text:30 , eraser:30} : {pencil:5 , text:45 , eraser:150} ,
                selectBlackboardToolSizeId:'blackboard_size_small' ,
            },
            useColorsTool:false,
            BlackboardSmartIsShow:false,
            stream:undefined ,
            eraserIsDisabled:true
        };
        this.streamType = undefined;
        this.userid = undefined;
        this.watermarkImageScalc = undefined;
        this.listernerBackupid = new Date().getTime()+'_'+Math.random() ;
    };

    componentDidMount(){
        let that = this;
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDisconnected,that.handlerRoomDisconnected.bind(that) , that.listernerBackupid); //Disconnected事件：失去连接事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPubmsg ,that.handlerRoomPubmsg.bind(that)  ,  that.listernerBackupid ) ;//room-pubmsg事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDelmsg , that.handlerRoomDelmsg.bind(that)  ,  that.listernerBackupid ) ;//room-delmsg事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.DocumentEvent.onKeydown , that.onKeydown.bind(that)  ,  that.listernerBackupid ) ;//room-delmsg事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPlaybackClearAllFromPlaybackController,that.handlerRoomPlaybackClearAll.bind(that) , that.listernerBackupid); //roomPlaybackClearAll 事件：回放清除所有信令
        eventObjectDefine.CoreController.addEventListener( 'receive-msglist-VideoWhiteboard' , that.receiveMsglistVideoWhiteboard.bind(that) , that.listernerBackupid );
        eventObjectDefine.CoreController.addEventListener("receiveWhiteboardSDKAction" ,that.receiveWhiteboardSDKAction.bind(that) , that.listernerBackupid  ); //监听白板sdk的行为事件
        eventObjectDefine.CoreController.addEventListener("receivePauseMedia" ,that.receivePauseMedia.bind(that) , that.listernerBackupid  ); //监听白板sdk的行为事件
    }
    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        let that = this ;
        eventObjectDefine.CoreController.removeBackupListerner(that.listernerBackupid );
        ServiceRoom.getTkWhiteBoardManager().destroyExtendWhiteboard(that.state.videoDrawBoardInfo.instanceId);
        ServiceRoom.getTkWhiteBoardManager().resetWhiteboardData(that.state.videoDrawBoardInfo.instanceId)
    };
    componentDidUpdate(prevProps , prevState){ //在组件完成更新后立即调用。在初始化时不会被调用
        if (prevState.videoDrawBoardInfo.isShow !== this.state.videoDrawBoardInfo.isShow) {
            this.setState({BlackboardSmartIsShow:this.state.videoDrawBoardInfo.isShow});
        }
    };
    handlerRoomPlaybackClearAll() {
        let videoDrawBoardInfoCopy = {...this.state.videoDrawBoardInfo};
        videoDrawBoardInfoCopy.isShow = false;
        this.setState({videoDrawBoardInfo:videoDrawBoardInfoCopy});
    }
    handlerRoomDisconnected() {
        let videoDrawBoardInfoCopy = {...this.state.videoDrawBoardInfo};
        videoDrawBoardInfoCopy.isShow = false;
        this.setState({videoDrawBoardInfo:videoDrawBoardInfoCopy});
        ServiceRoom.getTkWhiteBoardManager().destroyExtendWhiteboard(videoDrawBoardInfoCopy.instanceId);
        ServiceRoom.getTkWhiteBoardManager().resetWhiteboardData(videoDrawBoardInfoCopy.instanceId)
    }

    /*接收到主白板sdk的返回*/
    receiveWhiteboardSDKAction(recvEvent){
        let {action,cmd} = recvEvent.message;
        let isDelMsg = undefined;
        if(action === 'mediaPlayerNotice'){
            this.watermarkImageScalc = cmd.attributes.width/cmd.attributes.height;
            this.streamType = cmd.streamType;
            this.userid = cmd.userid;
            if(cmd.type === 'end'){
                isDelMsg = true;
                ServiceSignalling.sendSignallingFromVideoWhiteboard(isDelMsg); //TODO 20180722:qiu 高并发会导致很多人发送这条消息
            }
        }
    };
    onKeydown(recvEvent){
        if(recvEvent.message.keyCode === 32){
            this.playMediaHandle();
        }
    }
    /*视频标注白板的返回*/
    receiveVideoWhiteboardSDKAction(recvEvent){
        let {action,cmd} = recvEvent;
        if(action === 'viewStateUpdate'){
            let eraserIsDisabled = cmd.viewState.tool['tool_eraser'].disabled;
            this.setState({eraserIsDisabled:eraserIsDisabled});
        }
    }

    /*room-pubmsg事件*/
    handlerRoomPubmsg(pubmsgDataEvent){
        let pubmsgData = pubmsgDataEvent.message ;
        switch(pubmsgData.name) {
            case "VideoWhiteboard":
                if(TK.SDKTYPE === 'mobile'){
                    document.getElementById('all_root').style.background = this.state.videoDrawBoardInfo.backgroundColor;
                    document.getElementById('tk_app').getElementsByClassName('all-container')[0].style.background = this.state.videoDrawBoardInfo.backgroundColor;
                }
                let videoDrawBoardInfoCopy = {...this.state.videoDrawBoardInfo};
                videoDrawBoardInfoCopy.isShow = true;
                videoDrawBoardInfoCopy.deawPermission = CoreController.handler.getAppPermissions('isShowVideoDrawTool');
                if(pubmsgData.data && typeof pubmsgData.data === 'object' && pubmsgData.data.videoRatio) {
                    videoDrawBoardInfoCopy.watermarkImageScalc = pubmsgData.data.videoRatio;
                }
                this.setState({videoDrawBoardInfo:videoDrawBoardInfoCopy});
                this.setState({
                    penShow: false,
                    eraserShow: false
                })
                break;
            default:
                break;
        }
    };

    /*room-delmsg事件*/
    handlerRoomDelmsg(delmsgDataEvent){
        let delmsgData = delmsgDataEvent.message ;
        switch(delmsgData.name) {
            case "VideoWhiteboard":
            case "ClassBegin": //下课
                let videoDrawBoardInfoCopy = {...this.state.videoDrawBoardInfo};
                let useToolInfo = {...this.state.useToolInfo};
                videoDrawBoardInfoCopy.isShow = false;
                videoDrawBoardInfoCopy.deawPermission = false;
                useToolInfo.useToolKey = 'tool_pencil';
                useToolInfo.useToolColor = this._changeWhiteboardConfig();
                useToolInfo.blackboardToolsInfo = TK.SDKTYPE !== 'mobile'?{pencil:5 , text:30 , eraser:30} : {pencil:5 , text:45 , eraser:150};
                useToolInfo.selectBlackboardToolSizeId = 'blackboard_size_small';
                this.setState({
                    eraserIsDisabled:true,
                    videoDrawBoardInfo:videoDrawBoardInfoCopy ,
                    useToolInfo:useToolInfo
                });
                if(TkGlobal.isClient && !TkGlobal.isMacClient && this.streamType === 'file' ){
                    ServiceRoom.getNativeInterface().pauseShareMediaFile(false);
                }else if (this.streamType === 'media'){
                    ServiceRoom.getTkRoom().pauseShareMedia(false);
                }
		        ServiceRoom.getTkWhiteBoardManager().destroyExtendWhiteboard(videoDrawBoardInfoCopy.instanceId);
                break;
        }
    };

    /*视频标注msglist*/
    receiveMsglistVideoWhiteboard(handleData) {
        let data = handleData.message.VideoWhiteboardArray[0].data;
        let videoDrawBoardInfoCopy = {...this.state.videoDrawBoardInfo};
        videoDrawBoardInfoCopy.isShow = true;
        videoDrawBoardInfoCopy.deawPermission = CoreController.handler.getAppPermissions('isShowVideoDrawTool');
        if (data && typeof data === 'object' && data.videoRatio) {
            videoDrawBoardInfoCopy.watermarkImageScalc = data.videoRatio;
        }
        this.setState({videoDrawBoardInfo:videoDrawBoardInfoCopy});
    }

    /*匹配颜色色值*/
    _colorFilter(text){
        return text.replace(/#/g,"");
    };

    changeStrokeColorClick(colorValue){
        this.state.useToolInfo.useToolColor = colorValue;
        this.setState({
            useToolInfo:this.state.useToolInfo,
            useColorsTool:false
        });
    };
    /*根据枚举设备信息更改设备的描述信息*/
    _changeWhiteboardConfig(){
        if(TkConstant.joinRoomInfo.customWhiteboardBackground){  //配置自定义白板底色
            let index = TkConstant.joinRoomInfo.whiteboardcolor;
            let reverseColor ='';
            let useStrokeColor = undefined;
            if( TkConstant.hasRole.roleChairman  ||  TkConstant.hasRole.roleTeachingAssistant){  //老师助教的画笔颜色取反
                if(TkGlobal.customWhiteboardColorArry[index] === 'ffffff'){ //白板是白色，老师是红色，学生是黑色，
                    reverseColor = 'ED3E3A'
                }else{
                    reverseColor = 'EDEDED'
                };
                useStrokeColor = '#'+reverseColor;
            }
            return useStrokeColor;
        }else{
            let useStrokeColor = '#ED3E3A'
            return useStrokeColor;
        }
    }
    _loadToolColorsElementArray(){
        let colorsArray = [];
        let colors =  [] ;
        colors =["#5AC9FA" , "#FFCC00" , "#ED3E3A" , "#4740D2" , "#007BFF" , "#09C62B" ,
                "#000000" , "#EDEDED"] ;
        colors.forEach(  (item , index) => {
            let reactElement = <li className={"color-option " + ("color_"+this._colorFilter(item) )+ " " + (this.state.useToolInfo.useToolColor === item ? ' active' : '') } key={index} onClick={this.changeStrokeColorClick.bind( this , item )}  id={"video_drawBoard_color_"+this._colorFilter(item)} ></li>
            colorsArray.push(reactElement);
        });
        return{
            toolColorsArray:colorsArray
        }
    };
    handleToolClick(toolKey){
        if(toolKey === 'tool_pencil' || toolKey ==='tool_text' || toolKey ==='tool_eraser'){
            this.state.useToolInfo.useToolKey = toolKey;
            if(toolKey === 'tool_pencil'){
                this.setState({
                    eraserShow: false,
                    penShow: !this.state.penShow,
                })
            }else if(toolKey === 'tool_eraser'){
                this.setState({
                    eraserShow: !this.state.eraserShow,
                    penShow: false,
                })
            }
            this.setState({
                useToolInfo:this.state.useToolInfo,
                useColorsTool:false
            });
        }
    };
    /*改变大小的点击事件*/
    _changeStrokeSizeClick(selectBlackboardToolSizeId , strokeJson ){
        this.state.useToolInfo.selectBlackboardToolSizeId = selectBlackboardToolSizeId;
        this.state.useToolInfo.blackboardToolsInfo = strokeJson;
        this.setState({
            useToolInfo:this.state.useToolInfo,
        });
    };

    /*接收到主动触发暂停视频情况*/
    receivePauseMedia(){
        let data = {videoRatio:this.watermarkImageScalc};
        let isDelMsg = false;
        ServiceSignalling.sendSignallingFromVideoWhiteboard(isDelMsg,data);  //TODO 20180722:qiu 高并发会导致很多人发送这条消息
    }
    /*继续播放视频*/ //TODO 20180722:qiu 白板会返回播放的通知消息，为什么还要自己关注播放    -----解释：这个函数是视频标注的退出按钮触发的，所以保留这个函数
    playMediaHandle(){
        let isDelMsg = true;
        this.setState({useColorsTool:false,penShow:false,eraserShow:false});
        ServiceSignalling.sendSignallingFromVideoWhiteboard(isDelMsg);  //TODO 20180722:qiu 高并发会导致很多人发送这条消息
    }
    handleToolColorsClick(){
        this.setState({useColorsTool:!this.state.useColorsTool})
    }
    closeMediaVideoOnClick(){//关闭视频文件
        if(TkGlobal.isClient && this.streamType === 'file' ){
            ServiceRoom.getTkRoom().stopShareLocalMedia();   //stopShareMediaFile
        }else if (this.streamType === 'media'){
            ServiceRoom.getTkRoom().stopShareMedia();
        }
    }
    onAfterChangeEraserWidth(value){
        let useToolInfoCopy = {...this.state.useToolInfo};
        if (value === 0){value=1}
        useToolInfoCopy.blackboardToolsInfo.eraser = value;
        this.setState({useToolInfo:useToolInfoCopy})
    }
    onAfterChangePencilWidth(value){
        let useToolInfoCopy = {...this.state.useToolInfo};
        if (value === 0){value=1}
        useToolInfoCopy.blackboardToolsInfo.pencil = value;
        this.setState({useToolInfo:useToolInfoCopy})
    }

    setLineColor(hexColor){
        if(hexColor){
            let useToolInfo = JSON.parse(JSON.stringify(this.state.useToolInfo))

            useToolInfo.useToolColor = hexColor;
            this.setState({useToolInfo})
        }
    }
    render() {
        let that = this;
        let {videoDrawBoardInfo,useToolInfo , useColorsTool , eraserIsDisabled} = that.state ;

        let {useToolKey} = useToolInfo;
        let {toolColorsArray} = that._loadToolColorsElementArray();
        let useWidth = useToolKey ===  'tool_eraser' ? useToolInfo.blackboardToolsInfo.eraser : useToolInfo.blackboardToolsInfo.pencil ;
        return(
            <div className="video-drawing-board-box" style={{display:videoDrawBoardInfo.isShow ?'block':'none'}}>
                <div className="video-drawing-board" >
                    {this.state.BlackboardSmartIsShow? <WhiteboardSmart isBaseboard={false}  containerWidthAndHeight={videoDrawBoardInfo.containerWidthAndHeight} instanceId={videoDrawBoardInfo.instanceId} nickname={videoDrawBoardInfo.nickname}
                                                                        show={this.state.BlackboardSmartIsShow} backgroundColor={videoDrawBoardInfo.backgroundColor} useToolKey={useToolKey}
                                                                        fontSize={useToolInfo.blackboardToolsInfo.text} useToolColor={useToolInfo.useToolColor}  pencilWidth={useWidth}  showShapeAuthor={false}
                                                                        deawPermission={videoDrawBoardInfo.deawPermission} watermarkImageScalc={videoDrawBoardInfo.watermarkImageScalc} associatedMsgID={videoDrawBoardInfo.associatedMsgID} receiveVideoWhiteboardSDKAction={this.receiveVideoWhiteboardSDKAction.bind(this)}/>:undefined}
                </div>
                {TkConstant.hasRole.roleStudent || TkConstant.hasRole.rolePatrol || TkConstant.hasRole.roleRecord || TkConstant.hasRole.rolePlayback || !TkConstant.joinRoomInfo.videoWhiteboardDraw?undefined:
                    <ul id="video-drawing-tool" className="blackboard-tool clear-float"    >
                        <li className={"blackboard-tool-option" + (useToolKey ===  'tool_pencil' ? ' active':'')} >
                            <button id="video_blackboard_tool_pencil" className={"tool-btn pencil-icon " + (useToolKey ===  'tool_pencil' ? ' active':'')} title={TkGlobal.language.languageData.header.tool.blackBoard.boardTool.pen }  onClick={that.handleToolClick.bind(that , 'tool_pencil')}  ></button>
                            <div className="tool-pen-list-extend"
                            style={{display:this.state.penShow?"block":"none"}}>
                                <div style={{position:'relative'}}>
                                    <ColorPicker 
                                    afterChange = {this.setLineColor.bind(this)} 
                                    color={this.state.useToolInfo.useToolColor}
                                    />
                                </div>
                                <div className={'tool-slider'}>
                                    <span>线条宽度</span>
                                    <TkSliderDumb
                                    onAfterChange = {this.onAfterChangePencilWidth.bind(this)}
                                    value = {this.state.useToolInfo.blackboardToolsInfo.pencil}
                                    />
                                     <span>{this.state.useToolInfo.blackboardToolsInfo.pencil}</span>
                                </div>
                            </div>
                        </li>
                        <li className={"blackboard-tool-option" + (useToolKey ===  'tool_text' ? ' active':'')} style={{display:'none'}} > {/*todo 暂时不要文本输入框*/}
                            <button id="video_blackboard_tool_text" className={"tool-btn text-icon"+ (useToolKey ===  'tool_text' ? ' active':'')}   title={TkGlobal.language.languageData.header.tool.blackBoard.boardTool.text }  onClick={that.handleToolClick.bind(that , 'tool_text')}  ></button>
                        </li>
                        <li className={"blackboard-tool-option" + (useToolKey ===  'tool_eraser' ? ' active':'') } >
                            <button id="video_blackboard_tool_eraser" className={"tool-btn eraser-icon"+ (useToolKey ===  'tool_eraser' ? ' active':'')+ (eraserIsDisabled ? ' disable':'')} disabled={eraserIsDisabled} title={TkGlobal.language.languageData.header.tool.blackBoard.boardTool.eraser }  onClick={that.handleToolClick.bind(that , 'tool_eraser')}  ></button>
                            <div className="tool-eraser-extend"
                            style={{display:this.state.eraserShow?"block":"none"}}>
                                <div className={'tool-slider'}>
                                    <span>橡皮大小</span>
                                    <TkSliderDumb
                                    onAfterChange = {this.onAfterChangeEraserWidth.bind(this)}
                                    value = {this.state.useToolInfo.blackboardToolsInfo.eraser}
                                    />
                                    <span>{this.state.useToolInfo.blackboardToolsInfo.eraser}</span>
                                </div>
                            </div>
                        </li>
                      
                        <li className={"blackboard-tool-option"} >
                            <button id="video_blackboard_tool_exit" className={"tool-btn exit-icon"}    title={TkGlobal.language.languageData.videLabel.exit}  onClick={that.playMediaHandle.bind(that)}  ></button>
                        </li>
                    </ul>}
                {
                    (this.userid === ServiceRoom.getTkRoom().getMySelf().id && this.streamType === 'file' ) || (this.streamType === 'media' && (TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant)) ?
                    <button className={'tk-videodraw-player-close-btn '} onClick={this.closeMediaVideoOnClick.bind(this)}></button>
                    :undefined
                }
            </div>
        )
    }
}

export default VideoDrawingBoard;