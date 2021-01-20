/**
 * 教学工具箱 Smart组件
 * @module SmallCaptrue
 * @description   工具箱教室截屏按钮
 * @author huangYaQin
 * @date 2018/11/21 重构
 */
'use strict';
import React from "react";
import ServiceSignalling from 'ServiceSignalling' ;
import eventObjectDefine from "eventObjectDefine";
import CoreController from "CoreController";
import WrapWithUpdate from '../WrapWithUpdateHoc/index'

class SmallCaptrue extends React.Component {
  constructor(props) {
    super(props)
  }

  /*截屏时隐藏课堂窗口*/
  smallCpatureClick(){
    let data = {
        isHideClassroom:true,
    };
    this.props.takeSnapshot(data);
    // this.isDisabledHoldItem('smallCaptrue', true);
    this.props.close();
  }

  render() {
    return (
      <li className={"holdAllitem " + (this.props.isDisabled?' disabled':'')} >
        <div onClick={this.smallCpatureClick.bind(this)}>
          <button className={this.props.bgName}  />
          <span>{this.props.name}</span>
        </div>
      </li>
    );
  }
}

SmallCaptrue = WrapWithUpdate(SmallCaptrue);

export default SmallCaptrue; 