/**
 * 白板组件
 * @module WhiteboardSmart
 * @description   提供 白板的组件
 * @author QiuShao
 * @date 2017/7/27
 */
'use strict';
import React from 'react';
import PropTypes  from 'prop-types';
import eventObjectDefine from 'eventObjectDefine';
import TkUtils from 'TkUtils';
import TkGlobal from 'TkGlobal';
import ServiceRoom from 'ServiceRoom';
import ServiceSignalling from 'ServiceSignalling';
import TkConstant from "TkConstant";

class WhiteboardSmart extends React.Component{
    constructor(props){
        super(props);
        this.containerWidthAndHeight =  Object.customAssign({} , this.props.containerWidthAndHeight);
        this.instanceId = this.props.instanceId !== undefined ? this.props.instanceId : 'whiteboard_default' ;
        this.whiteboardElementId = 'whiteboard_container_'+ this.instanceId;
        this.listernerBackupid = new Date().getTime()+'_'+Math.random();
        this.showShapeAuthor = this.props.showShapeAuthor !== undefined ? this.props.showShapeAuthor : TkGlobal.showShapeAuthor ; //是否显示远程提示内容
        this.HandlerWhiteboardAndCoreInstance =  ServiceRoom.getTkWhiteBoardManager().getWhiteboardIntermediateLayerInstance() ;
        this.HandlerTkWhiteBoardManager =  ServiceRoom.getTkWhiteBoardManager() ;
    };
    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        let that = this ;
        eventObjectDefine.CoreController.addEventListener("changeWebPageWindowSize" ,that.handlerChangeWebPageWindowSize.bind(that) , that.listernerBackupid); //接收小黑板的缩略图信息
        eventObjectDefine.CoreController.addEventListener("resizeHandler" ,that.handlerResizeHandler.bind(that) , that.listernerBackupid); //接收resizeHandler事件执行resizeHandler
        eventObjectDefine.CoreController.addEventListener('SwitchLayout' ,that.handlerSwitchLayout.bind(that)  , that.listernerBackupid );
        that._lcInit();
    };
    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        let that = this ;
        if(that.props.saveImage){
            this.HandlerWhiteboardAndCoreInstance.downCanvasImageToLocalFile(that.instanceId);
        }
        eventObjectDefine.Window.removeBackupListerner(that.listernerBackupid);
        eventObjectDefine.CoreController.removeBackupListerner(that.listernerBackupid);
        this.HandlerTkWhiteBoardManager.destroyExtendWhiteboard(that.instanceId)
    };
    handlerChangeWebPageWindowSize(){
        const that = this;
        setTimeout(()=>{
            that.HandlerTkWhiteBoardManager.updateWhiteboardSize(this.instanceId)
        },100)
    }
    handlerSwitchLayout(){
        const that = this;
        setTimeout(()=>{
            that.HandlerTkWhiteBoardManager.updateWhiteboardSize(this.instanceId)
        },100)
    }
    handlerResizeHandler(){
        this.HandlerTkWhiteBoardManager.updateWhiteboardSize(this.instanceId); //更新白板尺寸
    }
    componentDidUpdate(prevProps , prevState){ //在组件完成更新后立即调用,在初始化时不会被调用
        let that = this ;
        if(prevProps.show !== this.props.show && this.props.show){
            this.HandlerTkWhiteBoardManager.updateWhiteboardSize(this.instanceId); //更新白板尺寸
        };
        if(that.props.containerWidthAndHeight && (that.props.containerWidthAndHeight.width !==  that.containerWidthAndHeight.width || that.props.containerWidthAndHeight.height !==  that.containerWidthAndHeight.height ) ){
            Object.customAssign(that.containerWidthAndHeight , that.props.containerWidthAndHeight );
            setTimeout(()=>{
                this.HandlerTkWhiteBoardManager.updateWhiteboardSize(this.instanceId)
            },100)
        };

        /*画笔权限*/
        if(that.props.deawPermission !== prevProps.deawPermission){
            let configration = {
                canDraw:that.props.deawPermission
            };
            this.HandlerTkWhiteBoardManager.changeWhiteBoardConfigration(configration , that.instanceId) ;
        };

        /*使用的工具*/
        if(that.props.useToolKey !== prevProps.useToolKey && that.props.useToolKey!=='tool_color'){ // 画笔
            this.HandlerTkWhiteBoardManager.useWhiteboardTool(that.props.useToolKey , that.instanceId);
        }

        /*顔色*/
        if(that.props.useToolColor !== prevProps.useToolColor){
            let configration = {
                primaryColor:that.props.useToolColor
            };
            this.HandlerTkWhiteBoardManager.changeWhiteBoardConfigration(configration , that.instanceId);
        }

        /*画笔和橡皮的宽度*/
        if(that.props.pencilWidth !== prevProps.pencilWidth){
            let configration = {
                pencilWidth:that.props.pencilWidth,
                eraserWidth:that.props.pencilWidth
            };
            this.HandlerTkWhiteBoardManager.changeWhiteBoardConfigration(configration , that.instanceId);
        };

        /*字体尺寸*/
        if(that.props.fontSize !== prevProps.fontSize){
            let configration = {
                fontSize:that.props.fontSize
            };
            this.HandlerTkWhiteBoardManager.changeWhiteBoardConfigration(configration , that.instanceId);
        }

        /*字体尺寸*/
        if(this.props.watermarkImageUrl  !== prevProps.watermarkImageUrl){ /*设置白板的图片*/
            this.HandlerWhiteboardAndCoreInstance.setWhiteboardWatermarkImage(this.instanceId , this.props.watermarkImageUrl);
        }

        /*更新白板缩放比例*/
        if(that.props.watermarkImageScalc !== prevProps.watermarkImageScalc  ){
            this.HandlerWhiteboardAndCoreInstance.updateWhiteboardWatermarkImageScale(that.instanceId , that.props.watermarkImageScalc ) ;
        };

        /*基准白板：分发的时候以老师的白板为基准分发*/
        if(that.props.isBaseboard !== prevProps.isBaseboard  ){
            this.HandlerWhiteboardAndCoreInstance.updateIsBaseboard(that.instanceId , that.props.isBaseboard ) ;
        };

        /*依赖基准白板的ID*/
        if(that.props.dependenceBaseboardWhiteboardID !== prevProps.dependenceBaseboardWhiteboardID  ){ /*更新dependenceBaseboardWhiteboardID*/
            this.HandlerWhiteboardAndCoreInstance.updateDependenceBaseboardWhiteboardID(that.instanceId , that.props.dependenceBaseboardWhiteboardID ) ;
        };

        /*暂时没使用*/
        if(that.props.saveRedoStack !== prevProps.saveRedoStack){
            this.HandlerWhiteboardAndCoreInstance.updateWhiteboardSaveRedoStackAndSaveUndoStack(that.instanceId , {saveRedoStack:that.props.saveRedoStack } );
        }
    };

    /*视频标注底层的回调*/
    _receiveActionCommand(action, cmd){
        if(this.props.receiveVideoWhiteboardSDKAction){
            let message={
                action:action,
                cmd:cmd
            };
            this.props.receiveVideoWhiteboardSDKAction(message);
        }
    }

    /*白板初始化*/
    _lcInit(){
        if(document.getElementById(this.whiteboardElementId)){
            let  parentNode = document.getElementById(this.whiteboardElementId);
            let  whiteboardToolBarConfig = {};
            if(TK.SDKTYPE === 'mobile'){
                if(TkGlobal.clientComponentName === "videoDrawWhiteboardComponent" || TkGlobal.clientComponentName === "localFileVideoDrawWhiteboardComponent"){
                    whiteboardToolBarConfig = {
                        initWhiteboardProductionOptions:{
                            proprietaryTools:true ,
                            isBaseboard:this.props.isBaseboard ,
                            dependenceBaseboardWhiteboardID:this.props.dependenceBaseboardWhiteboardID ,
                            needLooadBaseboard:this.props.needLooadBaseboard ,
                            associatedMsgID:this.props.associatedMsgID ,
                        },
                        isConnectedRoom:true , //是否已经连接房间，默认false(注：不提供给用户，自己内部使用) 移动端无法拿到房间连接成功
                        canDraw:this.props.deawPermission ,
                        synchronization:true ,
                        defaultWhiteboardScale:16/9 ,
                        isLoadWhiteboardToolBar:false ,
                        backgroundColor:this.props.backgroundColor ,
                        primaryColor:this.props.useToolColor
                    };
                }else {
                    whiteboardToolBarConfig = {
		    	        initWhiteboardProductionOptions:{
                            proprietaryTools:true ,
                            isBaseboard:this.props.isBaseboard ,
                            dependenceBaseboardWhiteboardID:this.props.dependenceBaseboardWhiteboardID ,
                            needLooadBaseboard:this.props.needLooadBaseboard ,
                            associatedMsgID:this.props.associatedMsgID ,
                    	},
                        canDraw: this.props.deawPermission,
                        synchronization: true,
                        defaultWhiteboardScale: 16 / 9,
                        isLoadWhiteboardToolBar: false,
                        backgroundColor: this.props.backgroundColor,
                        primaryColor: this.props.useToolColor,
                        pencilWidth: 10, //画笔大小 , 默认5
                        shapeWidth: 25, //图形画笔大小 , 默认5
                        eraserWidth: 10, //橡皮大小 ， 默认15
                        fontSize: 18, //字体大小 ， 默认18
                    };
                }
            }else{
                whiteboardToolBarConfig = {
                    initWhiteboardProductionOptions:{
                        proprietaryTools:true ,
                        isBaseboard:this.props.isBaseboard ,
                        dependenceBaseboardWhiteboardID:this.props.dependenceBaseboardWhiteboardID ,
                        needLooadBaseboard:this.props.needLooadBaseboard ,
                        associatedMsgID:this.props.associatedMsgID ,
                    },
                    canDraw:this.props.deawPermission ,
                    // defaultWhiteboardScale:16/9 ,
                    isLoadWhiteboardToolBar:false,
                    backgroundColor:this.props.backgroundColor ,
                    primaryColor:this.props.useToolColor ,
                    fontSize: 18, //字体大小 ， 默认18
                };
            }
            this.HandlerTkWhiteBoardManager.createExtendWhiteboard(parentNode ,  this.instanceId  ,  whiteboardToolBarConfig  , this._receiveActionCommand.bind(this));
            this.HandlerTkWhiteBoardManager.updateWhiteboardSize(this.instanceId); //更新白板尺寸
            if(this.props.watermarkImageScalc && this.props.watermarkImageScalc !== undefined){ //视频标注更新白板比例
                this.HandlerWhiteboardAndCoreInstance.updateWhiteboardWatermarkImageScale(this.instanceId , this.props.watermarkImageScalc ) ;
            }
            if(this.props.watermarkImageUrl && this.props.watermarkImageUrl !== undefined){ //截屏
                this.HandlerWhiteboardAndCoreInstance.setWhiteboardWatermarkImage(this.instanceId , this.props.watermarkImageUrl);
            }
        }
    };

    render(){
        let that = this ;
        let { show , containerWidthAndHeight, ...other} = that.props ;
        return (
            <div id={that.whiteboardElementId}  style={{display:!show?'none':'block',width:'100%',height:'100%'}} className={"overflow-hidden  scroll-literally-container "}    {...TkUtils.filterContainDataAttribute(other)}   ></div>
        )
    };
};
WhiteboardSmart.propTypes = {
    instanceId:PropTypes.string.isRequired ,
};
export default WhiteboardSmart ;


