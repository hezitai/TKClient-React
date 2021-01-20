"use strict";
import React, { PureComponent } from "react";
import TkGlobal from "TkGlobal";
import BlackboardSmart from "src/js/containers/whiteboard/extendWhiteboard/whiteboard";
import eventObjectDefine from "eventObjectDefine";
import ServiceSignalling from "ServiceSignalling";
import ReactDrag from "reactDrag";

const { CoreController: Ctrl, Window: Win } = eventObjectDefine;


class CaptureImg extends PureComponent {
    constructor(props) {
        super(props);
        let { captureImgInfo } = props;
        this.state = {
            captureImgBoardInfo: {
                containerWidthAndHeight: {
                    width: 0,
                    height: 0,
                },
                watermarkImageUrl: "",
                isShow: false,
                backgroundColor: "transparent",
                instanceId: `captureImgBoard${captureImgInfo.fileid}`,
                saveImage: false,
                nickname: "captureImgBoard",
                deawPermission: Ctrl.handler.getAppPermissions("canDraw"),
                associatedMsgID: `CaptureImg_${captureImgInfo.fileid}`,
            },
            isRender: false,
        };
        this.listernerBackupid = new Date().getTime() + "_" + Math.random();
    };

    /*在完成首次渲染之后调用*/
    componentDidMount() {
        Ctrl.addEventListener("updateAppPermissions_canDraw", this.handlerUpdateAppPermissions_canDraw.bind(this), this.listernerBackupid); //updateAppPermissions_canDraw：白板可画权限更新
        Ctrl.addEventListener("updateAppPermissions_canDragCaptureImg", this.handlerUpdate_canDragCaptureImg.bind(this), this.listernerBackupid); //更新拖拽截屏图片的权限
        Ctrl.addEventListener("updateAppPermissions_canResizeCaptureImg", this.handlerUpdate_canResizeCaptureImg.bind(this), this.listernerBackupid); //更新缩放截屏图片的权限
    };

    /*组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器*/
    componentWillUnmount() {
        Win.removeBackupListerner(this.listernerBackupid);
        Ctrl.removeBackupListerner(this.listernerBackupid);
    };

    /*画笔权限改变时*/
    handlerUpdateAppPermissions_canDraw() {
        let { captureImgBoardInfo } = this.state;

        captureImgBoardInfo.deawPermission = Ctrl.handler.getAppPermissions("canDraw");
        this.setState({ captureImgBoardInfo });
    };

    /*更新拖拽截屏图片的权限*/
    handlerUpdate_canDragCaptureImg() {
        this.setState({ isRender: !this.state.isRender });
    };

    /*更新缩放截屏图片的权限*/
    handlerUpdate_canResizeCaptureImg() {
        this.setState({ isRender: !this.state.isRender });
    };

    /*截屏图片关闭*/
    captureImgCloseClick() {
        ServiceSignalling.sendSignallingFromCaptureImg(`CaptureImg_${this.props.captureImgInfo.fileid}`, {}, true);
    };

    /*开始拖拽*/
    onStartDrag() {
        if (!(this.props.selectMouse && Ctrl.handler.getAppPermissions("canDragCaptureImg") && !TkGlobal.isVideoStretch)) {
            return false;
        }
    };

    /*鼠标在白板区移动时*/
    handleMouseMove(id, newSize) {
        let { changeEleReSize } = this.props;

        typeof changeEleReSize === "function" && changeEleReSize(id, newSize);
    };

    /*鼠标在白板区抬起时*/
    handleMouseUp(id, newSize) {
        let { sendSignallingOfResize, sendSignallingOfDrag, changeEleReSize } = this.props;

        if (typeof sendSignallingOfResize === "function") {
            sendSignallingOfResize(id);//发送缩放信令
            typeof sendSignallingOfDrag === "function" && sendSignallingOfDrag(id);//缩放后发送位置信令
        }
        typeof changeEleReSize === "function" && changeEleReSize(id, newSize);
    };

    render() {
        let { id, captureImgInfo: { swfpath }, draggableData, position, resizeInfo, useToolInfo: { useToolKey, useToolColor, blackboardToolsInfo }, selectMouse, changeLayerIsShow, eleInitResizeInfos } = this.props;
        let { captureImgBoardInfo: { watermarkImageUrl, containerWidthAndHeight, instanceId, nickname, backgroundColor, deawPermission, associatedMsgID } } = this.state;
        
        const defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
        let imgType = swfpath.substring(swfpath.lastIndexOf(".")) || ".jpg";
        let fileUrl = swfpath.replace(imgType, "-1" + imgType);
        watermarkImageUrl = window.WBGlobal.nowUseDocAddress + fileUrl;
        let useWidth = useToolKey === "tool_eraser" ? blackboardToolsInfo.eraser : blackboardToolsInfo.pencil;

        let captureImgBoxStyle = {
            width: resizeInfo.width + "rem",
            height: resizeInfo.height + "rem",
        };
        // 拖动组件相关Props
        let DraggableData = Object.customAssign({
            id: id,
            isDrag: true,
            isResize: true,
            handle: undefined,
            size: resizeInfo,
            borderWidth: 0.04,
            bounds: TK.SDKTYPE === "pc" ? "#lc-full-vessel" : "tk_app",
            position: { x: position.left, y: position.top },//位置px
            percentPosition: { percentLeft: position.percentLeft, percentTop: position.percentTop },//百分比
            onStartDrag: this.onStartDrag.bind(this),//开始拖拽
            changeLayerIsShow: changeLayerIsShow,
            disabled: !(selectMouse && Ctrl.handler.getAppPermissions("canDragCaptureImg") && !TkGlobal.isVideoStretch),//是否禁用拖拽,没有选择鼠标、没有权限、是缩放则禁用拖拽
        }, draggableData);

        let resizeData = {
            canResize: Ctrl.handler.getAppPermissions("canResizeCaptureImg") && selectMouse,
            eleInitResizeInfos: eleInitResizeInfos,//缩放元素的初始值
            handleMouseUp: this.handleMouseUp.bind(this),//鼠标抬起回调
            handleMouseMove: this.handleMouseMove.bind(this),//缩放时回调
            minResize: { width: 0.44, height: 0.44 },//缩放的最小值
            changeEleReSize: this.props.changeEleReSize,
        };
        if (defalutFontSize) {
            containerWidthAndHeight = {
                width: resizeInfo.width * defalutFontSize,
                height: resizeInfo.height * defalutFontSize,
            };
        }

        let blackBoardProps = {
            resizeInfo: resizeInfo,
            isBaseboard: false,
            watermarkImageUrl,
            instanceId,
            nickname,
            show: true,
            backgroundColor,
            containerWidthAndHeight,
            showShapeAuthor: false,
            deawPermission,
            associatedMsgID,
            fontSize: blackboardToolsInfo.text,
            useToolColor,
            pencilWidth: useWidth,
            useToolKey: useToolKey
        };

        return (
            <ReactDrag {...DraggableData} resizeData={resizeData}>
                <div id={id} className="capture-img-box" style={captureImgBoxStyle}>
                    <BlackboardSmart {...blackBoardProps}/>
                    <div className="capture-img-layer" style={{ display: DraggableData.disabled ? "none" : "block" }}></div>
                    <button id="captureImgClose" className="capture-img-close" style={{ display: TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant ? undefined : "none" }} onClick={this.captureImgCloseClick.bind(this)} title={TkGlobal.language.languageData.header.tool.blackBoard.title.close}></button>
                </div>
            </ReactDrag>
        )
    };
};

export default CaptureImg;
