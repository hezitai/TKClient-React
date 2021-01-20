/**
 * 组合回放playback页面的所有模块
 * @module TkPlayback
 * @description   提供call页面的所有模块的组合功能
 * @author QiuShao
 * @date 2017/7/27
 */


'use strict';
import React from 'react';
import { DragDropContext ,DragDropContextProvider ,DropTarget  } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import eventObjectDefine from 'eventObjectDefine' ;
import TkGlobal from 'TkGlobal' ;
import TkUtils from 'TkUtils' ;
import TkConstant from 'TkConstant' ;
import CoreController from 'CoreController';
import ServiceRoom from 'ServiceRoom';
import HeaderVesselSmart from '@/headerVessel'
import ReconnectingSmart from '../call/supernatant/reconnecting';
// import SupernatantDynamicPptVideoSmart from '../call/supernatant/supernatantDynamicPptVideo';
import LoadSupernatantPromptSmart from '../call/supernatant/loadSupernatantPrompt';
import LxNotification from '../LxNotification';
import RightVesselSmart from '../call/mainVessel/rightVessel/rightVessel';
import BottomVesselSmart from '../call/mainVessel/leftVessel/bottomVessel/bottomVessel';
import RightContentVesselSmart from '../call/mainVessel/leftVessel/rightContentVessel/rightContentVessel';
import GiftAnimationSmart from '../call/mainVessel/leftVessel/giftAnimation/giftAnimation';
import PlaybackControlSmart from './playbackControl/playbackControl' ;
//import BottomToolsVesselSmart from "../call/mainVessel/bottomToolsVessel/bottomToolsVessel";
import "../../../css/tk-playback.css";
import ChatBox from '@/Chat';
import Layout from 'src/js/containers/call/layout';
import OneToone from 'src/js/containers/call/oneToOne';

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
            if (TkGlobal.areaExchangeFlag) {
                let roomUers = ServiceRoom.getTkRoom().getUsers();  // N: 只有1V1 才有区域交换 代码才会走到这里
                if (TkConstant.hasRole.roleChairman) {
                    for (let [key,value] of Object.entries(roomUers)) {
                        if (value.role === TkConstant.role.roleStudent) {
                            boundId = value.id;
                        }
                    }
                }else if (TkConstant.hasRole.roleStudent) {
                    for (let [key,value] of Object.entries(roomUers)) {
                        if (value.role === TkConstant.role.roleChairman) {
                            boundId = value.id;
                        }
                    }
                }
            }
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
        return true;
    },
};

/*Call页面*/
class TkPlayback extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            updateState:false ,
            chatbox:{
                left:0,
                top:0,
                percentLeft:0,
                percentTop:0,
                isDrag:false,
            }
        };
        this.listernerBackupid = new Date().getTime()+'_'+Math.random();
    };
    componentWillMount(){ //在初始化渲染执行之前立刻调用
        const that = this ;
        TkGlobal.playback = true ; //是否回放
        TkGlobal.playbackControllerHeight = '0.5rem' ;
        TkGlobal.routeName = 'playback' ; //路由的名字
        if(TkGlobal.playback){
            TkGlobal.isClient = false; //是否客户端
            TkGlobal.isMacClient = false;
            TkGlobal.clientversion =  undefined ; //客户端的版本
        }
        $(document.body).addClass('playback');
        that._refreshHandler();
    };
    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        const that = this ;
        if(!TkGlobal.isReload){
            eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomConnected ,that.handlerRoomConnected.bind(that), that.listernerBackupid ) ;//roomConnected事件：白板处理
            eventObjectDefine.CoreController.addEventListener( 'updateSystemStyleJson' , that.handlerUpdateSystemStyleJson.bind(that));
            let timestamp = new Date().getTime() ;
            let href = window.location.href ;
            L.Utils.sessionStorage.setItem(timestamp , TkUtils.encrypt( href ) );
            this.props.history.push('/replay?timestamp='+timestamp+'&reset=true' );
            eventObjectDefine.CoreController.dispatchEvent({type: 'loadSupernatantPrompt' , message:{show:true , content:TkGlobal.language.languageData.loadSupernatantPrompt.loadRoomingPlayback }  });
            CoreController.handler.joinPlaybackRoom();
            let defaultDocumentToolViewRoot=document.getElementById('defaultDocumentToolViewRoot');
            defaultDocumentToolViewRoot.style.display='none'

        }
    };
    componentWillUnmount(){ //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        const that = this ;
        eventObjectDefine.CoreController.removeBackupListerner(that.listernerBackupid );
    };

    handlerRoomConnected(){
        this.setState({updateState:!this.state.updateState});
    };

    handlerUpdateSystemStyleJson(){
        this.setState({updateState:!this.state.updateState});
    };

    _refreshHandler(){
        if( TkUtils.getUrlParams('reset' , window.location.href ) && TkUtils.getUrlParams('timestamp' , window.location.href) &&  L.Utils.sessionStorage.getItem( TkUtils.getUrlParams('timestamp' , window.location.href) ) ){
            TkGlobal.isReload = true ;
            window.location.href =  TkUtils.decrypt(  L.Utils.sessionStorage.getItem( TkUtils.getUrlParams('timestamp' , window.location.href) ) ) ;
            window.location.reload(true);
        }
    };
    /*点击call整体页面的事件处理*/
    callPlaybackOnClick(event){
        eventObjectDefine.CoreController.dispatchEvent({type:'callPlaybackOnClick' , message:{event} });
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
        let {HeaderVesselSmartStyleJson={}  , RightVesselSmartStyleJson={} , BottomVesselSmartStyleJson={} ,
            LeftToolBarVesselSmartStyleJson ={} , RightContentVesselSmartStyleJson ={} , DesktopShareSmartStyleJson = {} , BottomToolsVesselJson={} } = TkGlobal.systemStyleJson ;
        CoreController.handler.updateLoadModuleJson('LeftToolBarVesselSmart' ,  !TkGlobal.playback );
        let draggableData = {
            bounds:TK.SDKTYPE === 'pc'?'#all_wrap':'#tk_app',
            onStartDrag: this.onStartDrag.bind(this),//开始拖拽
            onStopDrag: this.onStopDrag.bind(this),//拖拽结束
            changePosition:this.changePosition.bind(this),//改变位置
            changeLayerIsShow:this.changeLayerIsShow.bind(this),//改变浮层是否显示
        };
        return connectDropTarget(
            <section  className="add-position-relative" id="room"  style={{width:'100%' , height:'100%'}} >
                <div onClick={that.callPlaybackOnClick.bind(that)} style={{width:'100%' , height:'100%'}}>
                    <article  className="all-wrap clear-float disabled playback-all-container " id="all_wrap"  style={{disabled:true , height:'100%'}} >
                        {/*系统内部组件 start*/}
                        <HeaderVesselSmart styleJson={HeaderVesselSmartStyleJson}/>   {/*头部header*/}
                        {/* <RightVesselSmart styleJson={RightVesselSmartStyleJson}  />  */}
                        {/*<BottomToolsVesselSmart styleJson={BottomToolsVesselJson}/>   /!* 底部容器*!/*/}
                        {/* <BottomVesselSmart styleJson={BottomVesselSmartStyleJson}  /> */}
                        {TkConstant.hasRoomtype.oneToOne? <OneToone 
                        RightContentVesselSmartStyleJson={RightContentVesselSmartStyleJson}
                        RightVesselSmartStyleJson={RightVesselSmartStyleJson}
                        /> :  <Layout styleJson={RightContentVesselSmartStyleJson} />}
                        {/* <RightContentVesselSmart styleJson={RightContentVesselSmartStyleJson}  /> */}
                        <GiftAnimationSmart /> {/*礼物动画*/}
                        {/*系统内部组件 end*/}

                        {/*拓展组件 start*/}
                        <ReconnectingSmart /> {/*重新连接*/}
                        <ChatBox id='chatbox' dragInfo={that.state.chatbox} draggableData={draggableData}/>
                    </article>
                </div>

                <PlaybackControlSmart /> {/*回放控制器*/}
                <LoadSupernatantPromptSmart /> {/*正在加载浮层*/}
                <LxNotification/>{/*提示弹框*/}
            </section>
        )
    }
};
const callDropTarget = DropTarget('talkDrag', specTarget, connect => ({
    connectDropTarget: connect.dropTarget(),
}))(TkPlayback);
export default  DragDropContext(HTML5Backend)(callDropTarget);
