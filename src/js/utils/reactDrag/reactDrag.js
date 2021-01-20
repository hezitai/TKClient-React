/**
 * Created by weijin on 2018/1/29.
 */

'use strict';
import React  from 'react';
import ReactDOM from 'react-dom';
import TkGlobal from 'TkGlobal' ;
import eventObjectDefine from 'eventObjectDefine';
import TkConstant from 'TkConstant' ;
import Draggable,{DraggableCore} from 'react-draggable';
import NewDrag from 'newDrag'

class ReactDrag extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            eleResizeInfo:{//有拉伸才会用到
                width:(props.size&&props.size.width)?props.size.width:null,
                height:(props.size&&props.size.height)?props.size.height:null,
            },
            updateState:false,
            isCanResize:false
        };
        
        this.isCanDrag = false;
        this.isDrag = false;

        this.stretchDirection = null;//拉伸的方向
        this.resizeTouchBounds = 20;//拉伸的触点范围(px)
        this.listernerBackupid = new Date().getTime()+'_'+Math.random();
        this.resizeEle = null
    };
    /*在完成首次渲染之后调用*/
    componentDidMount(){
        let {id} = this.props;
        eventObjectDefine.Window.addEventListener( TkConstant.EVENTTYPE.WindowEvent.onResize , this.handlerOnResize.bind(this) , this.listernerBackupid );
        eventObjectDefine.Document.addEventListener(TkConstant.EVENTTYPE.DocumentEvent.onFullscreenchange , this.handlerOnFullscreenchange.bind(this)   , this.listernerBackupid); //document.onFullscreenchange事件
        eventObjectDefine.CoreController.addEventListener( 'resizeHandler' , this.handlerOnResize.bind(this) , this.listernerBackupid );
        eventObjectDefine.CoreController.addEventListener('changeMainContentVesselSmartSize' , this.changeMainContentVesselSmartSize.bind(this)  , this.listernerBackupid) ; //改变视频框占底部的ul的高度的事件
        eventObjectDefine.CoreController.addEventListener(id + "_mouseUp", this.handleMouseUp.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener(id + "_mouseMove", this.handleChangeSize.bind(this), this.listernerBackupid);
    };
    /*组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器*/
    componentWillUnmount() {
        eventObjectDefine.Window.removeBackupListerner(this.listernerBackupid);
        eventObjectDefine.CoreController.removeBackupListerner(this.listernerBackupid);
        eventObjectDefine.Document.removeBackupListerner(this.listernerBackupid );
    };
    /*当props发生变化时执行，初始化render时不执行*/
    componentWillReceiveProps(nextProps) {
        let {bounds, id, changePosition, borderWidth=0, resizeData} = this.props;
        //位置改变时
        if (nextProps.percentPosition && !isNaN(nextProps.percentPosition.percentTop) && !isNaN(nextProps.percentPosition.percentLeft) &&
            (nextProps.percentPosition.percentLeft !== this.props.percentPosition.percentLeft ||
                nextProps.percentPosition.percentTop !== this.props.percentPosition.percentTop)) {
            // this.percentPosition = nextProps.percentPosition;//保存百分比
            let position = this.getPosition(nextProps.percentPosition,id,bounds);
            if (changePosition && typeof changePosition === "function") {
                changePosition(id, position);
            }
        }
        //大小改变时       
        if (nextProps.size && this.props.size && (nextProps.size.width !== this.props.size.width || nextProps.size.height !== this.props.size.height)){
            const defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
            let {width:newWidth, height:newHeight} = nextProps.size;
            let originalResizeScaleNew = (nextProps.resizeData && nextProps.resizeData.eleInitResizeInfos)?nextProps.resizeData.eleInitResizeInfos.originalResizeScale:undefined;
            this.updateEleReSize(newWidth*defalutFontSize, newHeight*defalutFontSize, id , borderWidth,originalResizeScaleNew);
            let position = this.getPosition(nextProps.percentPosition,id,bounds,nextProps.size);
            if (changePosition && typeof changePosition === "function") {
                changePosition(id, position);
            }
        }
    };
    /*在接收到新的props 或者 state，将要渲染之前调用。该方法在初始化渲染的时候不会调用*/
    /*shouldComponentUpdate(nextProps,nextState){

    }*/
    /*在组件将要更新时调用，此时可以修改state，组件初始化时不调用*/
    componentWillUpdate(nextProps, nextState) {
        //大小改变时
        if ( ( !isNaN(nextState.eleResizeInfo.width) && !isNaN(nextState.eleResizeInfo.height)  && !isNaN(this.state.eleResizeInfo.width)  && !isNaN(this.state.eleResizeInfo.height)  ) && (nextState.eleResizeInfo.width !== this.state.eleResizeInfo.width || nextState.eleResizeInfo.height !== this.state.eleResizeInfo.height) ) {
            let {id, changePosition, bounds} = this.props;
            let position = this.getPosition(nextProps.percentPosition,id,bounds,nextState.eleResizeInfo);
            if (changePosition && typeof changePosition === "function") {
                changePosition(id, position);
            }
            
        }
    }
    /*在组件完成更新后立即调用, 此时可以获取dom节点，在初始化时不会被调用*/
    /*componentDidUpdate(prevProps,prevState){

    }*/
    /*窗口改变时*/
    handlerOnResize() {
        this.recalculation();
    };
    /*全屏改变时*/
    handlerOnFullscreenchange() {
        this.recalculation();
    };
    /*主要区域高度改变时*/
    changeMainContentVesselSmartSize() {
        this.recalculation();
    };
    /*重新计算*/
    recalculation() {
        let {bounds, id, changePosition, percentPosition, borderWidth=0,resizeData} = this.props;
        let position = this.getPosition(percentPosition,id,bounds);
        if (changePosition && typeof changePosition === "function") {
            changePosition(id, position);
        }
        if (resizeData && resizeData.changeEleReSize && typeof resizeData.changeEleReSize === "function") {
            const defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
            let {width:newWidth, height:newHeight} = this.state.eleResizeInfo;
            // 限制组件,不能超出白板范围并且不小于最小大小
            let newSize= this.limitEleReSize(newWidth*defalutFontSize, newHeight*defalutFontSize, id , borderWidth);
            resizeData.changeEleReSize(id,newSize);
        }
    }
    getPosition(percentPosition, dragNodeId, bounds, size) {
        let {borderWidth=0} = this.props;
        // const node = ReactDOM.findDOMNode(dragNode);
        const node = document.getElementById(dragNodeId)
        let boundNode;
        if (typeof bounds === 'string') {
            boundNode = document.querySelector(bounds);
        }
        if (node && boundNode && percentPosition.percentLeft !== undefined && percentPosition.percentTop !== undefined) {
            const defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
            let width = size?(size.width + 2*borderWidth)*defalutFontSize:node.offsetWidth;
            let height = size?(size.height + 2*borderWidth)*defalutFontSize:node.offsetHeight;
            let boundWidth = boundNode.offsetWidth;
            let boundHeight = boundNode.offsetHeight;

            let left = percentPosition.percentLeft*(boundWidth - width);
            let top = percentPosition.percentTop*(boundHeight- height);
            left = (isNaN(left) || left === Infinity || left === null || left < 0)?0:Number(left.toFixed(4));
            top = (isNaN(top) || top === Infinity || top === null || top < 0)?0:Number(top.toFixed(4));
            return {left,top};
        }else {
            return {left:0,top:0};
        }
    }
    getPercentPosition(position,dragNode,bounds) {
        const node = ReactDOM.findDOMNode(dragNode);
        let boundNode;
        if (typeof bounds === 'string') {
            boundNode = document.querySelector(bounds);
        }
        if (node && boundNode && position.x !== undefined && position.y !== undefined) {
            let width = node.offsetWidth;
            let height = node.offsetHeight;
            let boundWidth = boundNode.offsetWidth;
            let boundHeight = boundNode.offsetHeight;
            let percentLeft = position.x/(boundWidth - width);
            let percentTop = position.y/(boundHeight- height);
            percentLeft = (isNaN(percentLeft) || percentLeft === Infinity || percentLeft === null || percentLeft < 0)?0:Number(percentLeft.toFixed(6));
            percentTop = (isNaN(percentTop) || percentTop === Infinity || percentTop === null || percentTop < 0)?0:Number(percentTop.toFixed(6));
            return {percentLeft,percentTop};
        }else {
            return {percentLeft:0,percentTop:0};
        }
    }
    /*开始拖拽*/
    handlerOnStartDrag(event,dragData) {
        if (event.target.nodeName === 'INPUT') {
            return false;
        }
        let {onStartDrag, changeLayerIsShow} = this.props;
        if (changeLayerIsShow && typeof changeLayerIsShow === "function") {
            changeLayerIsShow(true);//浮层显示
        }
        this.isCanDrag = true;
        if (onStartDrag && typeof onStartDrag === "function") {
            return onStartDrag(event,dragData);
        }
    };
    /*拖拽中*/
    handlerOnDragging(event,dragData) {
        let dragging = dragData.dragging?dragData.dragging:false
        this.props.isDragging&& this.props.isDragging(dragging);
        if (this.isCanDrag) {
            this.isDrag = true;
        }else {
            return false
        }
    };
    /*拖拽结束*/
    handlerOnStopDrag(event,dragData) {
        let {id,bounds,onStopDrag, changeLayerIsShow} = this.props;
        if (changeLayerIsShow && typeof changeLayerIsShow === "function") {
            changeLayerIsShow(false);//浮层消失
        }
        let dragging = dragData.dragging?dragData.dragging:false
        this.props.isDragging&& this.props.isDragging(dragging);
        if (this.isDrag === true) {
            this.isDrag = false;
            this.isCanDrag = false;
            if (isNaN(dragData.x) || dragData.x === null || isNaN(dragData.y) || dragData.y === null) {
                L.Logger.error('Drag and drop failed:',dragData);
            }
            const node = ReactDOM.findDOMNode(this);
            let boundNode;
            if (typeof bounds === 'string') {
                boundNode = document.querySelector(bounds);
                if (boundNode) {
                    dragData.x = dragData.x < 0 ? 0 : ((dragData.x > boundNode.offsetWidth - node.offsetWidth) ? (boundNode.offsetWidth - node.offsetWidth) : dragData.x);
                    dragData.y = dragData.y < 0 ? 0 : ((dragData.y > boundNode.offsetHeight - node.offsetHeight) ? (boundNode.offsetHeight - node.offsetHeight) : dragData.y);
                }
            }
            let position = {
                x: dragData.x,
                y: dragData.y,
            };
            if(dragData.lastX || dragData.lastY){
                let percentLastPosition = this.getPercentPosition({x: dragData.lastX, y: dragData.lastY},this,bounds);
                dragData.lastX = percentLastPosition.percentLeft
                dragData.lastY = percentLastPosition.percentTop
            }
            let percentPosition = this.getPercentPosition(position,this,bounds);//获取百分比
            if (onStopDrag && typeof onStopDrag === "function") {
                onStopDrag(event, dragData, percentPosition);
            }
        }else {
            return false
        }
    };

    /*鼠标在组件上按下时*/
    handlerOnMouseDown(event) {
        // this.setState({
        //     position: position
        // })
        let {changeLayerIsShow, resizeData} = this.props;
        if(resizeData && resizeData.canResize) {
            if (this.stretchDirection === 'w-resize' || this.stretchDirection === 's-resize' || this.stretchDirection === 'se-resize') {
                TkGlobal.isVideoStretch = true; //是否是拉伸
                this.setState({
                    updateState:!this.state.updateState,
                    isCanResize:true
                });
                if (changeLayerIsShow && typeof changeLayerIsShow === "function") {
                    changeLayerIsShow(true);//浮层显示
                }
            }
            event.preventDefault();
            event.stopPropagation();
        }
    };
    /*鼠标在组件上移动时*/
    mouseMove(e) {
        
        let {id, resizeData, isDrag} = this.props;
        if(resizeData && resizeData.canResize) {
            if(TkGlobal.changeVideoSizeEventName !== id + "_mouseMove" && TkGlobal.changeVideoSizeMouseUpEventName !== id + "_mouseUp" && !TkGlobal.isVideoStretch && isDrag) {
                TkGlobal.changeVideoSizeEventName = id + "_mouseMove"; //以id作为改变组件大小事件的名字
                TkGlobal.changeVideoSizeMouseUpEventName = id + "_mouseUp";
            }
        }
    }
    /*鼠标在白板区抬起时*/
    handleMouseUp(handleData) {
        let {id, changeLayerIsShow, resizeData} = this.props;
        if(resizeData && resizeData.canResize) {
            let {handleMouseUp} = resizeData;
            let event = handleData.message.data.event;
            if (TkGlobal.isVideoStretch === true) {
                if (handleMouseUp && typeof handleMouseUp === "function") {
                    handleMouseUp(id, this.state.eleResizeInfo);
                }
                event.onmousemove = null;
                let classNameArr = ['tk-resize-w-resize','tk-resize-s-resize','tk-resize-se-resize'];
                classNameArr.map((item,index)=>{
                    let removeClassNameEle = document.querySelectorAll('.'+item);
                    for(let i=0;i<removeClassNameEle.length;i++) {
                        removeClassNameEle[i].classList.remove(item);
                    }
                });
                // this.resizeEle.classList.remove('tk-resize-w-resize');
                // this.resizeEle.classList.remove('tk-resize-s-resize');
                // this.resizeEle.classList.remove('tk-resize-se-resize');
                // event.target.style.cursor = "";//在页面上鼠标的样式初始化
                this.stretchDirection = null;
                TkGlobal.isVideoStretch = false; //是否是拉伸
                TkGlobal.changeVideoSizeEventName = null;//在页面上鼠标移动时触发的事件名制空
                TkGlobal.changeVideoSizeMouseUpEventName = null;//在页面上鼠标抬起时触发的事件名制空
                this.setState({
                    updateState: !this.state.updateState,
                    isCanResize:false
                });//强制render
                if (changeLayerIsShow && typeof changeLayerIsShow === "function") {
                    changeLayerIsShow(false);//浮层消失
                }
            }
        }
    };
    /*鼠标在白板区移动时*/
    handleChangeSize(handleData) {
        let {id, resizeData, borderWidth=0, percentPosition, bounds} = this.props;
        let event = handleData.message.data.event;
        if(resizeData && resizeData.canResize && percentPosition) {
            let {eleInitResizeInfos, handleMouseMove} = resizeData;
            const defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
            let width = this.state.eleResizeInfo.width * defalutFontSize;
            let height = this.state.eleResizeInfo.height * defalutFontSize;
            let position = this.getPosition(percentPosition,id,bounds);
            //获取组件相对body的位置：
            let eleLeftOfbody,eleTopOfbody;
            if (TkGlobal.mainContainerFull || TkGlobal.isVideoInFullscreen) {
                eleLeftOfbody = position.left;
                eleTopOfbody = position.top;
            }else {
                eleLeftOfbody = (position.left + TkGlobal.dragRange.left * defalutFontSize) ;
                eleTopOfbody = (position.top + TkGlobal.dragRange.top * defalutFontSize) ;
            }
            //获取鼠标相对body的位置：
            let mouseLeft = event.pageX;
            let mouseTop = event.pageY;
            //改变鼠标的样式
            if (!TkGlobal.isVideoStretch) {
                let resizeEle
                try{    
                    resizeEle = document.querySelector('#'+id);
                }catch(error) {
                    resizeEle = document.querySelector('#player_'+id).parentNode.parentNode.parentNode;
                }
                if ((mouseLeft >= eleLeftOfbody + width + borderWidth*2*defalutFontSize - this.resizeTouchBounds 
                    && mouseLeft <= eleLeftOfbody + width + borderWidth*2*defalutFontSize) 
                    && (mouseTop >= eleTopOfbody 
                    && mouseTop < eleTopOfbody + height + borderWidth*2*defalutFontSize - this.resizeTouchBounds)) {
                    // event.target.style.cursor = "w-resize";
                    this.changeAllNodeClassName(resizeEle,'tk-resize-w-resize',true)
                    // event.target.classList.add('tk-resize-w-resize');
                    this.stretchDirection = 'w-resize';
                } else if ((mouseTop >= eleTopOfbody + height + borderWidth*2*defalutFontSize - this.resizeTouchBounds 
                    && mouseTop <= eleTopOfbody + height + borderWidth*2*defalutFontSize) 
                    && (mouseLeft >= eleLeftOfbody 
                    && mouseLeft < eleLeftOfbody + width + borderWidth*2*defalutFontSize - this.resizeTouchBounds)) {
                    // event.target.style.cursor = "s-resize";
                    this.changeAllNodeClassName(resizeEle,'tk-resize-s-resize',true)
                    // event.target.classList.add('tk-resize-s-resize');
                    this.stretchDirection = 's-resize';
                } else if ((mouseTop < eleTopOfbody + height + borderWidth*2*defalutFontSize 
                    && mouseTop >= eleTopOfbody + height + borderWidth*2*defalutFontSize - this.resizeTouchBounds) 
                    && (mouseLeft < eleLeftOfbody + width + borderWidth*2*defalutFontSize 
                    && mouseLeft >= eleLeftOfbody + width + borderWidth*2*defalutFontSize - this.resizeTouchBounds)) {
                    // event.target.style.cursor = "se-resize";
                    this.changeAllNodeClassName(resizeEle,'tk-resize-se-resize',true)
                    // event.target.classList.add('tk-resize-se-resize');
                    this.stretchDirection = 'se-resize';
                } else {
                    // event.target.style.cursor = "";
                    let classNameArr = ['tk-resize-w-resize','tk-resize-s-resize','tk-resize-se-resize'];
                    classNameArr.map((item,index)=>{
                        let removeClassNameEle = document.querySelectorAll('.'+item);
                        for(let i=0;i<removeClassNameEle.length;i++) {
                            removeClassNameEle[i].classList.remove(item);
                        }
                    });
                    // event.target.classList.remove('tk-resize-w-resize');
                    // event.target.classList.remove('tk-resize-s-resize');
                    // event.target.classList.remove('tk-resize-se-resize');
                    this.stretchDirection = null;
                }
            }
            //改变组件的大小
            let newWidth, newHeight;
            if (TkGlobal.isVideoStretch) {
                if (this.stretchDirection === "w-resize" || this.stretchDirection === "se-resize") {
                    newWidth = Math.abs(mouseLeft - eleLeftOfbody) + borderWidth * 2 * defalutFontSize;
                    newHeight = eleInitResizeInfos?(newWidth / eleInitResizeInfos.originalResizeScale):height;
                    if (mouseLeft < eleLeftOfbody || (!TkGlobal.mainContainerFull && !TkGlobal.isVideoInFullscreen && mouseLeft < TkGlobal.dragRange.left * defalutFontSize)) {
                        return;
                    }
                    let newSize = this.updateEleReSize(newWidth, newHeight, id , borderWidth)
                    if (handleMouseMove && typeof handleMouseMove === "function") {
                        handleMouseMove(id, newSize);
                    }
                } else if (this.stretchDirection === "s-resize") {
                    newHeight = Math.abs(mouseTop - eleTopOfbody) + borderWidth * 2 * defalutFontSize;//px
                    newWidth = eleInitResizeInfos?(newHeight * eleInitResizeInfos.originalResizeScale):width;//px
                    if (mouseTop < eleTopOfbody || (!TkGlobal.mainContainerFull && !TkGlobal.isVideoInFullscreen && mouseTop < TkGlobal.dragRange.top * defalutFontSize)) {
                        return;
                    }
                    let newSize = this.updateEleReSize(newWidth, newHeight, id , borderWidth)
                    if (handleMouseMove && typeof handleMouseMove === "function") {
                        handleMouseMove(id, newSize);
                    }
                }
            }
        }else {
            // event.target.style.cursor = "";
        }
    };
    //改变节点下的所有节点的className
    changeAllNodeClassName(targetNode,className,isAdd) {
        if (targetNode.nodeType === 1) {
            if (isAdd) {
                targetNode.classList.add(className);
            }else {
                targetNode.classList.remove(className);
            }
        }
        if (targetNode.hasChildNodes()) {
            let curChildNodes = targetNode.childNodes;
            for (let item=0;item<curChildNodes.length;item++) {
                if (curChildNodes[item].nodeType === 1) {
                    if (isAdd) {
                        curChildNodes[item].classList.add(className);
                    }else {
                        curChildNodes[item].classList.remove(className);
                    }
                    this.changeAllNodeClassName(curChildNodes[item],className,isAdd);
                }
            }
        }

    }
    /*限制组件大小*/
    limitEleReSize(newWidth, newHeight, id, borderWidth,originalResizeScaleNew) {
        let {resizeData} = this.props;
        let {eleInitResizeInfos,minResize} = resizeData;
        if (!eleInitResizeInfos || !minResize) {return}
        //获取白板区域宽高：
        const defalutFontSize = window.innerWidth / TkConstant.STANDARDSIZE;
        let boundsEleW,boundsEleH;
        if (TK.SDKTYPE === 'pc') {
            let boundsEle = document.getElementById('lc-full-vessel');
            boundsEleW = boundsEle.clientWidth;
            boundsEleH = boundsEle.clientHeight;
        }else {
            boundsEleW = TkGlobal.windowInnerWidth;
            boundsEleH = TkGlobal.windowInnerHeight;
        }
        let originalResizeScale = originalResizeScaleNew || eleInitResizeInfos.originalResizeScale;
        //不能小于最小值
        if (originalResizeScale > minResize.width/minResize.height) {
            if (newHeight < minResize.height*defalutFontSize) {
                newHeight = minResize.height*defalutFontSize;
                newWidth = newHeight * originalResizeScale;
            }
        }else {
            if (newWidth < minResize.width*defalutFontSize) {
                newWidth = minResize.width*defalutFontSize;
                newHeight = newWidth / originalResizeScale;
            }
        }
        //不能超出主要内容区域
        if(newWidth >= boundsEleW - borderWidth*2*defalutFontSize || newHeight >= boundsEleH - borderWidth*2*defalutFontSize) {
            if (originalResizeScale > boundsEleW/boundsEleH) {
                newWidth = boundsEleW - borderWidth*2*defalutFontSize;
                newHeight = newWidth / originalResizeScale;
            }else {
                newHeight = boundsEleH - borderWidth*2*defalutFontSize;
                newWidth = newHeight * originalResizeScale;
            }
        }
        return {width:newWidth/defalutFontSize, height:newHeight / defalutFontSize};
    };
    /*改变组件大小*/
    updateEleReSize(newWidth, newHeight, id , borderWidth,originalResizeScaleNew) {
        let {resizeData} = this.props;
        if(resizeData) {
            // 限制组件,不能超出白板范围并且不小于最小大小
            let newSize = this.limitEleReSize(newWidth, newHeight, id , borderWidth,originalResizeScaleNew);
            this.setState({
                eleResizeInfo: newSize,
            });
            return newSize;
        }
    };

    render(){
        let {eleResizeInfo} = this.state;
        let {resizeData, percentPosition, bounds, id, position, borderWidth, isResize} = this.props;
        const children = React.Children.only(this.props.children);
        const defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
        let DraggableData = {
            BorderWidth: borderWidth*defalutFontSize,
            onMouseDown:this.handlerOnMouseDown.bind(this),//鼠标按下
            onStart: this.handlerOnStartDrag.bind(this),//开始拖拽
            onDrag: this.handlerOnDragging.bind(this),//拖拽中
            onStop: this.handlerOnStopDrag.bind(this),//拖拽结束
            position:this.position?this.position:{},
            disable: this.props.disable?this.props.disable:(this.props.disabled ? this.props.disabled : false),
            isResize: isResize?isResize:null, 
        };
        DraggableData = Object.customAssign(DraggableData, this.props);
        if (percentPosition) {
            let position = this.getPosition(percentPosition, id, bounds);
            DraggableData.position.x = (isNaN(position.left) || position.left === null)?0:position.left;
            DraggableData.position.y = (isNaN(position.top) || position.top === null)?0:position.top;
        }
        let style = !TkGlobal.isSplitScreen? {
            width:eleResizeInfo.width + 'rem',
            height:eleResizeInfo.height + 'rem',
        }: null;
        style = this.props.isDrag ? style : null;
        if(TkGlobal.isVideoStretch){
            if (typeof children.props.id == "string" && children.props.id.indexOf("captureImg_") == -1) {
                return React.cloneElement(children, {
                    style: (resizeData && resizeData.canResize)?{...children.props.style, ...style}:{...children.props.style},
                    onMouseMove:this.mouseMove.bind(this) 
                })
            } else {
                return (
                    <NewDrag {...DraggableData}>
                        {React.cloneElement(children, {
                            style: (resizeData && resizeData.canResize) ? { ...children.props.style, ...style } : { ...children.props.style },
                            onMouseMove: this.mouseMove.bind(this)
                        })}
                    </NewDrag>
                )
            }
        }else{
            return (
                <NewDrag {...DraggableData}>
                    {React.cloneElement(children, {
                        style: (resizeData && resizeData.canResize)?{...children.props.style, ...style}:{...children.props.style},
                        onMouseMove:this.mouseMove.bind(this)
                    })}
                </NewDrag>
            )
        }
        
    };
};

export  default  ReactDrag;
