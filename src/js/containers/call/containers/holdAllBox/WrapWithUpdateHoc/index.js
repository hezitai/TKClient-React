/**
 * 教学工具箱 Smart组件
 * @module AllCaptrue
 * @description 处理工具箱各按钮是否重新渲染
 * @author huangYaQin
 * @date 2018 / 11 / 21 重构
 */
'use strict';
import React, {Component} from 'react' 
import eventObjectDefine from "eventObjectDefine";
import CoreController from "CoreController";

export default (WrappedComponent) => {
  class NewComponent extends Component {
    constructor() {
      super();
      this.listernerBackupid = new Date().getTime() + "_" + Math.random();
    }

    /*组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器*/
    componentWillUnmount() {
      const that = this;
      eventObjectDefine.CoreController.removeBackupListerner(that.listernerBackupid);
    };

    /*在接收到新的props 或者 state，将要渲染之前调用。该方法在初始化渲染的时候不会调用*/
    shouldComponentUpdate(nextProps, nextState) {
      if (this.props.isDisabled !== nextProps.isDisabled || this.props.isShow !== nextProps.isShow) {
        return true;
      }
      return false;
    }

    render() {
      return (
        <WrappedComponent {...this.props}></WrappedComponent>
      )
    }
  }
  return NewComponent
}



