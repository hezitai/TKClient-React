/**
 * @description   课件库的所有组件
 * @author 重构wanglimin  原写者"QiuShao"
 * @date 2018/11/29
 */
'use strict';
import React from 'react';
import TkConstant from 'TkConstant';
import TkUtils from "TkUtils";
import TkGlobal from "TkGlobal";
import CoreController from 'CoreController';
import eventObjectDefine from 'eventObjectDefine';
import CoursewareContainer from './CoursewareContainer'
import "./static/css"
import './static/css/black.css'


class CoursewareLibrary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // 根据权限判断列表加载
            listLoad: {
                // 加载文档文件列表的权限
                tool_courseware_list: CoreController.handler.getAppPermissions('loadCoursewarelist'),
                // 加载媒体文件列表的权限
                tool_media_courseware_list: CoreController.handler.getAppPermissions('loadMedialist'),
                // tool_user_list: CoreController.handler.getAppPermissions('loadUserlist'),
                isUploadH5Document: false,
            },
            // 课件、媒体列表是否显示
            listShow: {
                tool_courseware_list: false,
                tool_media_courseware_list: false,
                // tool_user_list: false,
            },
            tool_common_type: "common",
            tool_media_type: "media",
            // 弹框是否显示
            isLibraryShow: false
        };
        this.fileToolStatus = false;  // att-update lock
        this.listernerBackupid = new Date().getTime() + '_' + Math.random();
    };

    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        const that = this;
        //事件 initAppPermissions   ---11.21 重构 初始化权限
        eventObjectDefine.CoreController.addEventListener('initAppPermissions', that.handlerInitAppPermissions.bind(that), that.listernerBackupid);

        //事件updateToolButtonDescription   ---11.21 重构 点击 课件库、媒体库时触发
        eventObjectDefine.CoreController.addEventListener('updateToolButtonDescription', that.handlerUpdateToolButtonDescription.bind(that), that.listernerBackupid);

        //roomPubmsg事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPubmsg, that.handlerRoomPubmsg.bind(that), that.listernerBackupid);

        //roomConnected事件  ---房间连接成功事件 
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomConnected, that.handlerRoomConnected.bind(that), that.listernerBackupid);

        //eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomParticipantEvicted,that.handlerRoomParticipantEvicted.bind(that) , that.listernerBackupid); //Disconnected事件：参与者被踢事件
        //点击课件库事件
        eventObjectDefine.CoreController.addEventListener("CoursewareClick", that.handlerCoursewareClick.bind(that), that.listernerBackupid);

        //关闭课件库事件
        eventObjectDefine.CoreController.addEventListener("CloseLibrary", that.handlerCloseLibrary.bind(that), that.listernerBackupid);

        //特殊下课事件
        eventObjectDefine.CoreController.addEventListener("recoverPanelBeforeStarting", that.handlerClassOver.bind(that), that.listernerBackupid);

        eventObjectDefine.CoreController.addEventListener("CloseALLPanel", that.handlerCloseLibrary.bind(that), that.listernerBackupid);
    };
    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        const that = this;
        eventObjectDefine.CoreController.removeBackupListerner(that.listernerBackupid);
    };
    //在组件完成更新后立即调用,在初始化时不会被调用
    componentDidUpdate(prevProps, prevState) {
        if (prevState.isLibraryShow !== this.state.isLibraryShow && this.state.isLibraryShow) {
            this.setDefaultPosition();
        }
    };
    /*设置初始位置*/
    setDefaultPosition() {
        // 这里的id为固定值 toolExtendContainer
        let { id, draggableData } = this.props;
        // 获取弹框dom
        let dragNode = document.getElementById(id);
        // 获取项目最外层容器dom
        let boundNode = document.querySelector(draggableData.bounds);
        if (dragNode && boundNode) {
            if (draggableData.changePosition && typeof draggableData.changePosition === "function") {
                let isSendSignalling = false;
                const defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
                let boundNodeHeight = TkUtils.replacePxToNumber(TkUtils.getStyle(boundNode, 'height')) / defalutFontSize;
                let dragNodeHeight = TkUtils.replacePxToNumber(TkUtils.getStyle(dragNode, 'height')) / defalutFontSize;
                let percentTop = TkGlobal.dragRange.top / (boundNodeHeight - dragNodeHeight);
                draggableData.changePosition(id, {
                    percentLeft: 0.5,
                    percentTop: TkConstant.hasRoomtype.oneToOne ? 0.5 : percentTop,
                    isDrag: false
                }, isSendSignalling);
            }
        }
    }

    // 权限初始化时 重新获取一次权限
    handlerInitAppPermissions() {
        let listLoad = {
            tool_courseware_list: CoreController.handler.getAppPermissions('loadCoursewarelist'),
            tool_media_courseware_list: CoreController.handler.getAppPermissions('loadMedialist'),
            // tool_user_list: CoreController.handler.getAppPermissions('loadUserlist'),
        };
        Object.customAssign(this.state.listLoad, listLoad);
        // this.state.listShow.tool_user_list = false;
        this.setState({
            listLoad: this.state.listLoad,
            listShow: this.state.listShow,
        });
    };

    /*处理事件updateToolButtonDescription*/
    handlerUpdateToolButtonDescription(recvEventData) {
        const that = this;
        let message = recvEventData.message;
        if (that.state.listShow[message.id] != undefined) {
            for (let key of Object.keys(that.state.listShow)) {
                if (key === message.id) {
                    that.state.listShow[key] = message.open;
                } else {
                    that.state.listShow[key] = false;
                }
            }
            that.setState({ listShow: that.state.listShow });
        }
        else {
            for (let key of Object.keys(that.state.listShow)) {
                that.state.listShow[key] = false;
            }
            that.setState({ listShow: that.state.listShow });
        }
    };

    // 房间链接成功时
    handlerRoomConnected() {
        this.setState({
            isUploadH5Document: TkConstant.joinRoomInfo.isUploadH5Document
        });
    };

    handlerRoomPubmsg(recvEventData) {
        const that = this;
        let pubmsgData = recvEventData.message;

        switch (pubmsgData.name) {
            case "ClassBegin": {
                //全部置false
                // 1.暂时注释，点击上课后 课件库不消失 2018/5/18
                // 2.郑鑫让全部false，若有问题，或者需要改动，务必询问郑鑫 2018/06/06
                that.handlerCloseLibrary();
                break;
            }
        }
    };
    //处理下课事件
    handlerClassOver() {
        this.setState({ isLibraryShow: false });
    }
    // 关闭弹框
    handlerCloseLibrary() {
        this.setState({ isLibraryShow: false });
        eventObjectDefine.CoreController.dispatchEvent({ type: 'CoursewareRemove' });
    }

    // 点击课件库  将弹框显示出来
    handlerCoursewareClick() {
        this.setState({ isLibraryShow: true });
    }

    render() {
        let that = this;


        const { id, toolExtendContainerDrag, draggableData } = this.props;
        let DraggableData = Object.customAssign({
            id: id,
            percentPosition: { percentLeft: toolExtendContainerDrag.percentLeft || 0.5, percentTop: toolExtendContainerDrag.percentTop || 0.5 },
        }, draggableData);

        return (
            <div className={"mask"} onClick={this.handlerCloseLibrary.bind(this)} style={{display:this.state.isLibraryShow?"block":"none"}}>
                <CoursewareContainer {...this.state} {...this.props} DraggableData={DraggableData} ></ CoursewareContainer>
            </div>
        )
    };

};
export default CoursewareLibrary;

