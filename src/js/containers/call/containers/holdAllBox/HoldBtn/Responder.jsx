/**
 * 教学工具箱 Smart组件
 * @module Responder
 * @description   工具箱抢答器按钮
 * @author huangYaQin
 * @date 2018/11/21 重构
 */
'use strict';
import React from "react";
import ServiceSignalling from 'ServiceSignalling' ;
import eventObjectDefine from "eventObjectDefine";
import CoreController from "CoreController";
import WrapWithUpdate from "../WrapWithUpdateHoc/index";

class Responder extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount(){
    const that = this;
    eventObjectDefine.CoreController.addEventListener("receive-msglist-qiangDaQi", that.handlerMsglistQiangDaQi.bind(that), that.listernerBackupid);
  }

  handlerMsglistQiangDaQi(recvEventData){
    	for(let message of recvEventData.message.qiangDaQiArr){
    		this.props.isDisabledHoldItem("responder", true);
    	}
    }

  /*抢答器的显示的控制*/
  responderAssemblyShowHandel(){
    const that = this;
    let data = {
        isShow: true,
        begin: false,
        userAdmin: ""
    }
    let isDelMsg = false;
    ServiceSignalling.sendSignallingQiangDaQi(isDelMsg, data);
    eventObjectDefine.CoreController.dispatchEvent({
        type: 'responderShow',
        className: "responder-implement-bg",
        isShow: true,
    });
    that.props.isDisabledHoldItem("responder", true);
    this.props.close();
  };

  render() {
    return (
      <li className={"holdAllitem " + (this.props.isDisabled?' disabled':'')} >
        <div onClick={this.responderAssemblyShowHandel.bind(this)}>
          <button className={this.props.bgName}  />
          <span>{this.props.name}</span>
        </div>
      </li>
    );
  }
}

Responder = WrapWithUpdate(Responder);

export default Responder; 
