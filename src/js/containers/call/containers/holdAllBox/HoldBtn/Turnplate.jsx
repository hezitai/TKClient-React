/**
 * 教学工具箱 Smart组件
 * @module Turnplate
 * @description   工具箱转盘按钮
 * @author huangYaQin
 * @date 2018/11/21 重构
 */
'use strict';
import React from "react";
import ServiceSignalling from 'ServiceSignalling' ;
import eventObjectDefine from "eventObjectDefine";
import CoreController from "CoreController";
import WrapWithUpdate from '../WrapWithUpdateHoc/index'

class Turnplate extends React.Component  {
  constructor(props) {
    super(props)
    this.turntableAssemblyShowHandel = this.turntableAssemblyShowHandel.bind(this);
  }

  componentDidMount(){
    const that = this;
    eventObjectDefine.CoreController.addEventListener("receive-msglist-dial", that.handlerMsglistDialShow.bind(that), that.listernerBackupid);
  }

  handlerMsglistDialShow(recvEventData){
    for(let message of recvEventData.message.dialShowArr){
      this.props.isDisabledHoldItem("turnplate", true);
    }
  };

  /*转盘*/
  turntableAssemblyShowHandel(){
    let data={
        rotationAngle:'rotate('+ 0 +'deg)',
        isShow:true ,
    };
    let isDelMsg = false;
    ServiceSignalling.sendSignallingDialToStudent(data,isDelMsg);
    this.props.isDisabledHoldItem("turnplate", true);
    this.props.close();
  }

  render() {
    return (
      <li className={"holdAllitem " + (this.props.isDisabled?' disabled':'')} >
        <div onClick={this.turntableAssemblyShowHandel}>
          <button className={this.props.bgName}  />
          <span>{this.props.name}</span>
        </div>
      </li>
    );
  }
}

Turnplate = WrapWithUpdate(Turnplate);

export default Turnplate; 