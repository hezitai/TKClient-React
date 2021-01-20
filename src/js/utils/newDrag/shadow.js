import React, { Component } from "react";
import ReactDOM from 'react-dom';
import TkGlobal from 'TkGlobal' ;
import { innerHeight, innerWidth } from "./util";

let height;
export default class Shadow extends Component {
  constructor(props) {
    super(props)
    this.state = {
      initX: this.props.initX || 0,
      initY: this.props.initY || 0,
      x: this.props.x || 0,
      y: this.props.y || 0,
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.props.x  !== prevProps.x || this.props.y  !== prevProps.y) {
      this.setState({
        x: prevProps.x,
        y: prevProps.y
      })
    }
  }

  componentDidMount() {
    const node = ReactDOM.findDOMNode(this);
    node.style.zIndex = 300
    this.self = node
  }

  fixDragEnd(e) {
    this.props.fixDragEnd(e)
  }
  

  render() {

    const { children } = this.props
    const { x, y, initX, initY } = this.state
    const X = this.props.isDrag? (x-initX) : initX 
    const Y = this.props.isDrag? (y-initY) : initY
    const DndStyle = {
      backgroundColor: "#eee",
      touchAction: "none!important",
      transform: `translate3d(${x-initX}px,${y-initY}px,0)`,
      opacity: 0.7,
    }
    return React.cloneElement(children, {
      onMouseLeave: this.fixDragEnd.bind(this),
      onMouseDown: this.fixDragEnd.bind(this),
      style: { ...DndStyle, ...children.props.style }
    })
  }

}