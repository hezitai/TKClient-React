/**
 * 组合call页面的所有模块
 * @module TkCall
 * @description   提供call页面的所有模块的组合功能
 * @author QiuShao
 * @date 2017/7/27
 */


'use strict';
import React from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext,DragDropContextProvider,DropTarget  } from 'react-dnd';
import eventObjectDefine from 'eventObjectDefine' ;
import TkGlobal from 'TkGlobal' ;
import TkUtils from 'TkUtils' ;
import ServiceRoom from 'ServiceRoom' ;
import ServiceSignalling from 'ServiceSignalling' ;
import TkConstant from 'TkConstant' ;
import CoreController from 'CoreController';
// import ClassBroFunctions from "ClassBroFunctions"
// import HeaderVesselSmart from './headerVessel/headerVessel' ;
import JoinDetectionDeviceSmart from '../detectionDevice/joinDetectionDevice';
import RemoteControlDetectionDeviceSmart from '../detectionDevice/remoteControlDetectionDevice';
import ReconnectingSmart from './supernatant/reconnecting';
import LoadSupernatantPromptSmart from './supernatant/loadSupernatantPrompt';
import Help from '../help/subpage/help';
import LxNotification from '../LxNotification';

import RightVesselSmart from './mainVessel/rightVessel/rightVessel';
import RightContentVesselSmart from './mainVessel/leftVessel/rightContentVessel/rightContentVessel';
import OneToone from './oneToone';

import GiftAnimationSmart from './mainVessel/leftVessel/giftAnimation/giftAnimation';
import CoursewareLibrary from '@/CoursewareLibrary'
import BigPictureDisplay from "../BigPicture/BigPicture";
import ShareSmart from "../ShareSmart/ShareSmart";

import UserListSmart from "@/userList";
import CustomTrophysSmart from "@/customTrophysCompontent";
import ChatBox from '@/Chat'
import CndSwitch from "../CndSwitch/CndSwich";
import Preloading from "../preloading/Preloading";

import HeaderVesselSmart from '@/headerVessel';
import Layout from './layout';

import CourseList from '@/courseList'
import PlugCheck from '@/plugCheck'


const specTarget = {
    drop(props, monitor, component) {
        let dragFinishEleCoordinate = monitor.getSourceClientOffset(); //拖拽后鼠标相对body的位置
        if (dragFinishEleCoordinate && dragFinishEleCoordinate !== null && dragFinishEleCoordinate !== undefined) {
            const item = monitor.getItem(); //拖拽的元素信息
            let {id} = item;
            const defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
            let dragEle = document.getElementById(id); //拖拽的元素
            let dragEleW = dragEle.clientWidth;
            let dragEleH = dragEle.clientHeight;
            let boundId = 'lc-full-vessel';
            let content = document.getElementById(boundId) || document.getElementById('lc-full-vessel');//白板拖拽区域
            let contentW = content.clientWidth;
            let contentH = content.clientHeight;
            /*拖拽元素不能拖出白板区*/
            let dragEleOffsetLeft = dragFinishEleCoordinate.x;
            let dragEleOffsetTop = dragFinishEleCoordinate.y;
            let dragEleLeft,dragEleTop;
            if (TkGlobal.mainContainerFull || TkGlobal.isVideoInFullscreen) {//如果白板区全屏
                if (dragEleOffsetLeft < 0) {
                    dragEleOffsetLeft = 0;
                }else if (dragEleOffsetLeft > (contentW-dragEleW)) {
                    dragEleOffsetLeft = contentW-dragEleW;
                }
                if (dragEleOffsetTop < 0) {
                    dragEleOffsetTop = 0;
                }else if (dragEleOffsetTop > (contentH - dragEleH)) {
                    dragEleOffsetTop = contentH - dragEleH;
                }
                /*计算位置百分比*/
                dragEleLeft = dragEleOffsetLeft/(contentW - dragEleW);
                dragEleTop = dragEleOffsetTop/(contentH - dragEleH);
            }else {//白板区没有全屏
                if (dragEleOffsetLeft < TkGlobal.dragRange.left*defalutFontSize) {
                    dragEleOffsetLeft = TkGlobal.dragRange.left*defalutFontSize;
                }else if (dragEleOffsetLeft > (TkGlobal.dragRange.left*defalutFontSize+contentW-dragEleW)) {
                    dragEleOffsetLeft = TkGlobal.dragRange.left*defalutFontSize+contentW-dragEleW;
                }
                if (dragEleOffsetTop < TkGlobal.dragRange.top*defalutFontSize) {
                    dragEleOffsetTop = TkGlobal.dragRange.top*defalutFontSize;
                }else if (dragEleOffsetTop > (TkGlobal.dragRange.top*defalutFontSize + contentH - dragEleH)) {
                    dragEleOffsetTop = TkGlobal.dragRange.top*defalutFontSize + contentH - dragEleH;
                }

                /*计算位置百分比*/
                dragEleLeft = (dragEleOffsetLeft - TkGlobal.dragRange.left*defalutFontSize)/(contentW - dragEleW);
                dragEleTop = (dragEleOffsetTop - TkGlobal.dragRange.top*defalutFontSize)/(contentH - dragEleH);
            }
            dragEleLeft = (isNaN(dragEleLeft) || dragEleLeft === Infinity || dragEleLeft === null )?0:dragEleLeft;
            dragEleTop = (isNaN(dragEleTop) || dragEleTop === Infinity || dragEleTop === null )?0:dragEleTop;
            let dragEleStyle = { //相对白板区位置的百分比
                percentTop: dragEleTop,
                percentLeft: dragEleLeft,
                isDrag: true,
            };
            eventObjectDefine.CoreController.dispatchEvent({ //自己本地和通知别人改变拖拽的video位置
                type: 'changeOtherVideoStyle',
                message: {data: {style: dragEleStyle, id: id, item:item} , initiative:true},
            });
        }
    },
    canDrop(props, monitor) { //拖拽元素不能拖出白板区
        let {isDrag} = props;
        return true;
    },
};
/*Call页面*/
class TkCall extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            updateState:false ,
            isLoadIconShow:true
        };
        this.listernerBackupid = new Date().getTime()+'_'+Math.random();
    };
    /*在完成首次渲染之前调用，此时仍可以修改组件的state*/
    componentWillMount(){
        const that = this ;
        TkGlobal.playback = false ; //是否回放
        TkGlobal.routeName = 'call' ; //路由的名字
        $(document.body).removeClass('playback');
        that._refreshHandler();
        this.initDragData();
    };
    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        let that = this ;
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomConnected ,that.handlerRoomConnected.bind(that), that.listernerBackupid ) ;//roomConnected事件：白板处理
        eventObjectDefine.CoreController.addEventListener( 'updateSystemStyleJson' , that.handlerUpdateSystemStyleJson.bind(that));
        eventObjectDefine.CoreController.dispatchEvent({type: 'loadSupernatantPrompt' , message:{show:true , content:TkGlobal.language.languageData.loadSupernatantPrompt.loadRooming }  });
        eventObjectDefine.CoreController.addEventListener( "room_preload" , that.handlerPreLoadBegin.bind(that) ,  that.listernerBackupid   );
        eventObjectDefine.CoreController.addEventListener( "room_noPreload" , that.handlerPreLoadEnd.bind(that) ,  that.listernerBackupid  );
        eventObjectDefine.CoreController.addEventListener( "leave_room" , that.handlerLeaveRoom.bind(that) ,  that.listernerBackupid  );
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDisconnected,this.handlerRoomDisconnected.bind(this) , this.listernerBackupid); //Disconnected事件：失去连接事件

    };
    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        let that = this ;
        eventObjectDefine.CoreController.removeBackupListerner(that.listernerBackupid );
    };

    handlerRoomConnected(){
        this.setState({updateState:!this.state.updateState});
    };

    handlerUpdateSystemStyleJson(){
        this.setState({updateState:!this.state.updateState});
    };
    handlerPreLoadBegin(){
        if (!TkConstant.joinRoomInfo.preLoading){
            return;
        }
        this.setState({
            isLoadIconShow:false
        })
    }

    handlerPreLoadEnd(){
        this.setState({
            isLoadIconShow:true
        })
    }

    handlerLeaveRoom(){
        this.setState({
            isLoadIconShow:false
        })
    }
    handlerRoomDisconnected(){
        this.setState({
            isLoadIconShow:true
        })
    }

    handlerOkCallback(json){ /*切换设备之后的处理*/
        let {selectDeviceInfo} = json || {} ;
        TK.DeviceMgr.setDevices(selectDeviceInfo, function() {
            L.Logger.error('set devices failed')
        });
        if(TkGlobal.appConnected){    // 房間連接成功
            let paramsJson = {isSetlocalStorage: false} ;
            TK.DeviceMgr.getDevices(function (deviceInfo) {
                let data = {
                    action:'deviceManagement' ,
                    type:'sendDeviceInfo' ,
                    deviceData:{deviceInfo:deviceInfo} ,
                };
                for(let user of Object.values( TkUtils.getSpecifyRoleList(TkConstant.role.roleTeachingAssistant, ServiceRoom.getTkRoom().getUsers()) ) ){
                    ServiceSignalling.sendSignallingFromRemoteControl( user.id , data);
                }
            }, paramsJson);
        }
    };

    /*点击call整体页面的事件处理*/
    callAllWrapOnClick(event){
        eventObjectDefine.CoreController.dispatchEvent({type:'callAllWrapOnClick' , message:{event} });
    };

    _refreshHandler(){
        //如果没有经过login则视为刷新
        if (TkGlobal.isRenovate !== false ) {
            TkGlobal.isRenovate = true;
            let time = TkUtils.getUrlParams('timestamp' , window.location.href );
            let hrefSessionStorage  = L.Utils.sessionStorage.getItem(time);
            if (hrefSessionStorage) {

                window.location.href =  TkUtils.decrypt( hrefSessionStorage );
            }
        }
    };

    mouseLeave(event) {
        let canChangeResizeEle = CoreController.handler.getAppPermissions('isChangeVideoSize') || CoreController.handler.getAppPermissions('canResizeCaptureImg');
        if (canChangeResizeEle && TkGlobal.isVideoStretch === true) {
            if (TkGlobal.changeVideoSizeMouseUpEventName && TkGlobal.changeVideoSizeMouseUpEventName !== null) {
                eventObjectDefine.CoreController.dispatchEvent({type:TkGlobal.changeVideoSizeMouseUpEventName, message:{data:{event:event}},});
            }
        }
    };
    mouseMove (event) {
        let canChangeResizeEle = CoreController.handler.getAppPermissions('isChangeVideoSize') || CoreController.handler.getAppPermissions('canResizeCaptureImg');
        if (canChangeResizeEle) {
            if (TkGlobal.changeVideoSizeEventName && TkGlobal.changeVideoSizeEventName !== null) {
                eventObjectDefine.CoreController.dispatchEvent({type:TkGlobal.changeVideoSizeEventName, message:{data:{event:event}},},false);
            }
        }
    };
    mouseUp (event) {
        let canChangeResizeEle = CoreController.handler.getAppPermissions('isChangeVideoSize') || CoreController.handler.getAppPermissions('canResizeCaptureImg');
        if (canChangeResizeEle) {
            //如果您想以一个异步的方式来访问事件属性，您应该对事件调用event.persist()。这将从事件池中取出合成的事件，并允许该事件的引用，使用户的代码被保留
            event.persist();//TkGlobal.changeVideoSizeMouseUpEventName
            if (TkGlobal.changeVideoSizeMouseUpEventName && TkGlobal.changeVideoSizeMouseUpEventName !== null) {
                eventObjectDefine.CoreController.dispatchEvent({type:TkGlobal.changeVideoSizeMouseUpEventName, message:{data:{event:event}},});
            }
        }
    };
    /*初始化拖拽数据*/
    initDragData(isPlaybackClear) {
        let dragDataArrSync = [];
        let dragDataArr = ['toolExtendContainer','userListSmart','holdAllBox','controlPanelMain',"customTrophy",'chatbox'];
        dragDataArrSync.map((item,index)=>{
            this.state[item] = {
                left:0,
                top:0,
                percentLeft:0,
                percentTop:0,
                isDrag:false,
            };
        });
        if (isPlaybackClear) {return}
        dragDataArr.map((item,index)=>{
            this.state[item] = {
                left:0,
                top:0,
                percentLeft:0,
                percentTop:0,
                isDrag:false,
            };
        });
    };
    /*开始拖拽*/
    onStartDrag(e,dragData) {
        /*if (e.target.nodeName === 'BUTTON') {
         return false;
         }*/
    };
    /*拖拽结束*/
    onStopDrag(event, dragData, percentPosition) {
        let id = dragData.node.id;
        if (id && id !== '' && (this.state[id].left !== dragData.x || this.state[id].top !== dragData.y)) {
            this.state[id].left = dragData.x;
            this.state[id].top = dragData.y;
            this.state[id].isDrag = true;
            Object.customAssign(this.state[id], percentPosition);//保存百分比
            this.setState({
                [id]:this.state[id],
            });
        }
    };
    /*修改拖拽的位置*/
    changePosition(id, position, isSendSignalling) {
        if (position && id) {
            Object.customAssign(this.state[id], position);
            this.setState({[id]:this.state[id]});
            /*if (isSendSignalling) {
                this.sendSignallingOfDrag(id);
            }*/
        }
    };
    /*改变浮层是否显示*/
    changeLayerIsShow(mainContentLayerIsShow) {
        eventObjectDefine.CoreController.dispatchEvent({//初始化视频框的位置（拖拽和分屏）
            type:'changeLayerIsShow',
            data: {mainContentLayerIsShow:mainContentLayerIsShow}
        });
    };

    render(){
        const that = this ;
        const {connectDropTarget} = that.props;
        let {HeaderVesselSmartStyleJson={}  , RightVesselSmartStyleJson={} , 
            RightContentVesselSmartStyleJson ={} , BottomToolsVesselJson={},LeftToolBarVesselSmartStyleJson={} } = TkGlobal.systemStyleJson ;
        CoreController.handler.updateLoadModuleJson('LeftToolBarVesselSmart' ,  !TkGlobal.playback );
        let draggableData = {
            bounds:TK.SDKTYPE === 'pc'?'#all_wrap':'#tk_app',
            onStartDrag: this.onStartDrag.bind(this),//开始拖拽
            onStopDrag: this.onStopDrag.bind(this),//拖拽结束
            changePosition:this.changePosition.bind(this),//改变位置
            changeLayerIsShow:this.changeLayerIsShow.bind(this),//改变浮层是否显示
        };
        return connectDropTarget(
            <section  onMouseUp={this.mouseUp.bind(that)} onMouseMove={that.mouseMove.bind(that)} onMouseLeave={that.mouseLeave.bind(that)} className="add-position-relative" id="room"  style={{width:'100%' , height:'100%'}}>
                <article  className="all-wrap clear-float" id="all_wrap" onClick={that.callAllWrapOnClick.bind(that) } >
                    {/*插件检测*/}
                    <PlugCheck />
                    {/*系统内部组件 start*/}
                    <HeaderVesselSmart styleJson={HeaderVesselSmartStyleJson} />   {/*头部header*/}
                    <GiftAnimationSmart /> {/*礼物动画*/}
                    {CoreController.handler.getAppPermissions('loadUserlist')?<UserListSmart id="userListSmart" />:null}{/* 用户列表 index:300*/}
                    <CoursewareLibrary id="toolExtendContainer"  toolExtendContainerDrag={that.state.toolExtendContainer} draggableData={draggableData}/>{/*文件列表 index:300*/}
                    <CourseList></CourseList>
                    <ChatBox id='chatbox' dragInfo={that.state.chatbox} draggableData={draggableData}/>
                    
                    <CustomTrophysSmart id="customTrophy" customTrophyDrag={that.state.customTrophy} draggableData = {draggableData}/>{/*自定义奖杯*/}
                    {/*系统内部组件 end*/}

                    {/*拓展组件 start*/}
                    <Help/>{/*xueln 帮助组件*/}
                    <ReconnectingSmart isLoadIconShow={this.state.isLoadIconShow}/> {/*重新连接*/}
                    <LoadSupernatantPromptSmart isLoadIconShow={this.state.isLoadIconShow}/> {/*正在加载浮层*/}
                    <BigPictureDisplay/>{/*双击聊天区图片变大浮层*/}
                    <RemoteControlDetectionDeviceSmart isEnter={false} clearFinsh={true}  handlerOkCallback={undefined} backgroundColor='rgba(0,0,0,0.5)'  okText={TkGlobal.language.languageData.login.language.detection.button.ok.text}  titleText={TkGlobal.language.languageData.login.language.detection.deviceTestHeader.deviceSwitch.text} saveLocalStorage={false}  />
                    {TkConstant.hasRole.roleTeachingAssistant?<CndSwitch/>:null}
                    <LxNotification/>{/*提示弹框*/}
                    <JoinDetectionDeviceSmart isEnter={false} saveLocalStorage={false} clearFinsh={true} handlerOkCallback={that.handlerOkCallback.bind(that)}  backgroundColor='rgba(0,0,0,0.5)' okText={TkGlobal.language.languageData.login.language.detection.button.ok.text} titleText={TkGlobal.language.languageData.login.language.detection.deviceTestHeader.deviceSwitch.text} />{/*设备切换*/}
                    {/*拓展组件 end*/}
                    <Preloading />


                    {/* {TkConstant.hasRoomtype.oneToOne ? <RightContentVesselSmart styleJson={RightContentVesselSmartStyleJson}  /> : <Layout styleJson={RightContentVesselSmartStyleJson}></Layout>} */}
                    {TkConstant.hasRoomtype.oneToOne? 
                        <OneToone 
                            RightContentVesselSmartStyleJson={RightContentVesselSmartStyleJson}
                            RightVesselSmartStyleJson={RightVesselSmartStyleJson}
                            />
                     :  <Layout styleJson={RightContentVesselSmartStyleJson} />}
                </article>
            </section>
        )
    }
};
const callDropTarget = DropTarget('talkDrag', specTarget, connect => ({
    connectDropTarget: connect.dropTarget(),
}))(TkCall);
export default  DragDropContext(HTML5Backend)(callDropTarget);
// export default DragDropContext(HTML5Backend)(TkCall);