import React, { Component } from "react";
import ReactDOM from 'react-dom';
import PropTypes from "prop-types";
import Shadow from "./shadow";
import TkGlobal from 'TkGlobal';

import {
  int,
  innerHeight,
  innerWidth,
  outerHeight,
  outerWidth,
  parseBounds,
  isNumber
} from "./util";

const doc = document;
const noop = (x, y) => {};
let initX = 0, initY = 0;

class Dragger extends Component {
  /**
   * 初始变量设置
   */
  static defaultProps = {
    x: void 0,
    y: void 0,
    // onDragging: noop
  };
  constructor(props){
    super(props)
    this.state = {
      // x轴,y轴位移，单位px 
      x: props.position ? props.position.x : props.defaultPosition.x,
      y: props.position ? props.position.y : props.defaultPosition.y,
      // 鼠标点击元素的原始位置，单位px
      originX: 0,
      originY: 0,
      // 已经移动的位移，单位px
      lastX: null,
      lastY: null,
      dragging: false
    };
    this.flag = true
  }
  

  getBox = (boundId) => {
    if(boundId){
      this.box = doc.querySelector( boundId);
    }
  };

  move = event => {
    event.stopPropagation();
    event.preventDefault();
    if (this.props.disable === true || TkGlobal.isVideoStretch) return;
    // 保证用户在移动元素的时候不会选择到元素内部的东西
    doc.body.style.userSelect = "none";
    // this.self.style.cursor = 'move'
    this.setState({
      dragging:true
    })
    let { lastX, lastY } = this.state;
    // event.client - this.state.origin 表示的是移动的距离,
    // elX表示的是原来已经有的位移
    let deltaX, deltaY;
    if (event.type && event.type === "touchmove") {
      deltaX = event.touches[0].clientX - this.state.originX + lastX;
      deltaY = event.touches[0].clientY - this.state.originY + lastY;
    } else {
      deltaX = event.clientX - this.state.originX + lastX;
      deltaY = event.clientY - this.state.originY + lastY;
    }

    if(!this.props.dnd){
      const { bounds } = this.props;
      if (bounds) {
        // 如果用户指定一个边界，那么在这里处理
        let NewBounds = bounds === true ? bounds : parseBounds(bounds);
        let isXBounder;
        let isYBounder;
        if (this.box) {
          let borderWidth = this.props.BorderWidth ? this.props.BorderWidth : 0;

          NewBounds = {
            left:
              int(this.box.style.paddingLeft) +
              int(this.self.style.marginLeft) 
              - int(this.self.offsetLeft)
              ,
            top:
              int(this.box.style.paddingTop) +
              int(this.self.style.marginTop),
            right:
              innerWidth(this.box) -
              outerWidth(this.self) +
              int(this.box.style.paddingRight) -
              int(this.self.style.marginRight) - 
              - int(this.self.offsetLeft) - 
              2*borderWidth
              ,
            bottom:
              innerHeight(this.box) -
              outerHeight(this.self) +
              int(this.box.style.paddingBottom) +
              int(this.self.style.marginBottom)
              - 2*borderWidth
          };
          isXBounder = (x) => {
            return x >= NewBounds.left && x <= NewBounds.right
          };
          isYBounder = (y) => {
            return y >= NewBounds.top && y <= NewBounds.bottom
          };
        }
        if(isXBounder(this.state.x) && isYBounder(this.state.y)) {
          // 保证不超出右边界和底部
          if (isNumber(NewBounds.right)) deltaX = Math.min(deltaX, NewBounds.right);
          if (isNumber(NewBounds.bottom)) deltaY = Math.min(deltaY, NewBounds.bottom);
          // 保证不超出左边和上边
          if (isNumber(NewBounds.left)) deltaX = Math.max(deltaX, NewBounds.left);
          if (isNumber(NewBounds.top)) deltaY = Math.max(deltaY, NewBounds.top);
        }
        // this.props.onStart(event)
        // this.props.onDrag && this.props.onDrag(event);
      }
    } else {
      const coreData = {
        id: this.props.id,
        node: this.self,
        x: deltaX ,
        y: deltaX ,
        lastX: this.state.lastX,
        lastY: this.state.lastY,
        dragging: true
      }
      this.props.onStart(event, coreData)
      this.props.onDrag && this.props.onDrag(event,coreData);
    }
    this.setState({
      x: deltaX,
      y: deltaY,
    });
  };

  onDragStart = event => {
    if(!this.props.isDrag){
      this.flag = false
    }

    if (this.props.disable === true || TkGlobal.isVideoStretch) return;
    this.props.onMouseDown(event);
    this.self = event.currentTarget;
    this.self.style.cursor = 'move'

    doc.addEventListener("mouseup", this.onDragEnd);
    doc.addEventListener("touchend", this.onDragEnd);
    doc.addEventListener("mousemove", this.move);
    doc.addEventListener("touchmove", this.move);
    
    if(this.props.dnd&&!this.props.isDrag){
      initX = int(this.self.offsetLeft);
      initY = int(this.self.offsetTop);
      this.setState({
        x:0,
        y:0
      })
    } else {
      const coreData = {
        id: this.props.id,
        node: this.self,
        x: event.pageX ,
        y: event.pageY ,
        lastX: event.pageX,
        lastY: event.pageX
      }
      this.props.onStart(event, coreData)
      this.props.onDrag && this.props.onDrag(event,coreData);
    }

    let deltaX, deltaY;
    if (event.type === "touchstart") {
      deltaX = event.touches[0].clientX;
      deltaY = event.touches[0].clientY;
    } else {
      deltaX = event.clientX;
      deltaY = event.clientY;
    }
    
    if(this.props.dnd){
      this.setState({
        originX: deltaX,
        originY: deltaY,
        lastX: this.props.isDrag?this.state.x:0,
        lastY: this.props.isDrag?this.state.y:0,
        x: this.state.lastX,
        y: this.state.lastY
      },function(){

      });
    } else {
      this.setState((prevState, props) => ({
        originX: deltaX,
        originY: deltaY,
        lastX: prevState.x,
        lastY: prevState.y
      }));
    }
   
  };

  onDragEnd = event => {
    if (this.props.disable === true || TkGlobal.isVideoStretch) return;
    this.setState(
      {
        dragging: false
      }
    );
    doc.removeEventListener("mousemove", this.move);
    doc.removeEventListener("touchmove", this.move);
    doc.removeEventListener("mouseup", this.onDragEnd);
    doc.removeEventListener("touchend", this.onDragEnd);
    if(this.self&&this.self.style&&this.self.style.cursor){ this.self.style.cursor = ''}
    const {dnd, isDrag} = this.props
    let coreData
    if(dnd){
      coreData = {
        id: this.props.id,
        node: this.self,
        x: this.state.x,
        y: this.state.y,
        lastX: this.flag?this.state.lastX:0,
        lastY: this.flag?this.state.lastY:0,
        dragging: false
      }
      if(!isDrag){
        const height = ReactDOM.findDOMNode(this).parentNode.clientHeight
        coreData.x += initX
        coreData.y -= height
      }
      this.setState({
        x: coreData.x,
        y: coreData.y,
        lastX: coreData.x,
        lastY: coreData.y
      }, function(){
        this.flag = coreData.lastX?true:false
      })
    }else{
      coreData = {
        id: this.props.id,
        node: this.self,
        x: this.state.x,
        y: this.state.y,
        lastX: this.state.lastX,
        lastY: this.state.lastY
      }
    }
    this.props.onStop(event, coreData)
    this.self = null;
    doc.body.style.userSelect = "";
  };

  componentWillUpdate(nextProps) {
    let {position} = this.props
    
    if(nextProps.position && ((nextProps.position.x !== position.x)||(nextProps.position.y !== position.y))){
      this.setState({
        x: nextProps.position.x,
        y: nextProps.position.y
      })
    }
  }


  componentDidMount() {
    if(this.props.bounds){
      this.getBox(this.props.bounds)
    }
  }

  render() {
    const { x, y, dragging } = this.state;
    const { children, dnd, isDrag, isResize } = this.props;

    let X = x;
    let Y = y;
    const getHandle = () => {
      if(TkGlobal.isVideoStretch){
        return false
      }
      return {
        onMouseDown: this.onDragStart.bind(this),
        onMouseUp: this.onDragEnd.bind(this),
        onTouchStart: this.onDragStart.bind(this),
        onTouchEnd: this.onDragEnd.bind(this),
        onDragStart: this.onDragStart.bind(this),
        onDragEnd: this.onDragEnd.bind(this),
      };
    };
    let DraggableStyle = (!(TkGlobal.isVideoStretch)||isResize)?{
      touchAction: "none!important",
      transform: `translate3d(${X}px,${Y}px,0)`,
    }:null;
    const fixDragStyle = {
      "WebkitUserSelect": "none",
      "MozUserSelect": "none",
      "KhtmlUserSelect": "none",
      "UserSelect": "none"
    }
    if(dnd&&!TkGlobal.isVideoStretch){
      const position = {
        initX: this.state.lastX?this.state.lastX:0,
        initY: this.state.lastY?this.state.lastY:0,
        x: this.state.x,
        y: this.state.y,
        isDrag: this.props.isDrag,
        fixDragEnd: this.onDragEnd.bind(this)
      }
      if(dragging){
        return (
          <Shadow {...position}>
            { React.cloneElement(children, {
                style: { ...children.props.style }
              }) }
          </Shadow>  
        )
      }
      return (
        React.cloneElement(children, {
          ...getHandle(), 
          style: {...children.props.style }
        }) 
      )
      
    } else {
      return React.cloneElement(children, {
        ...getHandle(), 
        style: { ...DraggableStyle, ...children.props.style }
      })
    }
  }
}

Dragger.propTypes = {
  // 给予元素一个x,y的初始位置，单位是px
  x: PropTypes.number,
  y: PropTypes.number,

  // 是否由用户移动,可能是通过外部props改变
  isUserMove: PropTypes.bool,

  // 是否静态,设置了就不可移动
  disable: PropTypes.bool,

  // 开始拖拽
  onDragStart: PropTypes.func,
  
  // 正在拖拽
  onDragMove: PropTypes.func,

  // 结束拖拽，鼠标弹开
  onDragEnd: PropTypes.func,

};

export default Dragger;
