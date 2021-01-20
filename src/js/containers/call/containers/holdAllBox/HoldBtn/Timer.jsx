/**
 * 教学工具箱 Smart组件
 * @module Timer
 * @description   工具箱计时器按钮
 * @author huangYaQin
 * @date 2018/11/21 重构
 */
'use strict';
import React from "react";
import ServiceSignalling from 'ServiceSignalling' ;
import eventObjectDefine from "eventObjectDefine";
import CoreController from "CoreController";
import WrapWithUpdate from "../WrapWithUpdateHoc/index";

class Timer extends React.Component  {
  constructor(props) {
    super(props)
  }

  componentDidMount(){
    const that = this;
    eventObjectDefine.CoreController.addEventListener("receive-msglist-timer", that.handlerMsglistTimerShow.bind(that), that.listernerBackupid);
  }

  handlerMsglistTimerShow(recvEventData){
    	for(let message of recvEventData.message.timerShowArr){
    		this.props.isDisabledHoldItem("timer", true);
    	}
  };

  /*倒计时*/
  timerAssemblyShowHandel(){
    let data = {
        isStatus: false,
        sutdentTimerArry: [0,5,0,0],
        isShow:true,
        isRestart:false
    };
    ServiceSignalling.sendSignallingTimerToStudent(data);
    eventObjectDefine.CoreController.dispatchEvent({
          type:'handleTurnShow' ,
          className:"timer-implement-bg",
          isShow:true,
      });
    this.props.isDisabledHoldItem("timer", true);
    this.props.close();
  }

  render() {
    return (
      <li className={"holdAllitem " + (this.props.isDisabled?' disabled':'')} >
        <div onClick={this.timerAssemblyShowHandel.bind(this)}>
          <button className={this.props.bgName}  />
          <span>{this.props.name}</span>
        </div>
      </li>
    );
  }
}

Timer = WrapWithUpdate(Timer);

export default Timer; 