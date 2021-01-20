/**
 * 教学工具箱 Smart组件
 * @module Answer
 * @description   工具箱答题器按钮
 * @author huangYaQin
 * @date 2018/11/21 重构
 */
'use strict';
import React from "react";
import ServiceSignalling from 'ServiceSignalling' ;
import eventObjectDefine from "eventObjectDefine";
import CoreController from "CoreController";
import WrapWithUpdate from "../WrapWithUpdateHoc/index";

class Answer extends React.Component  {
  constructor(props) {
    super(props)
  }

  componentDidMount(){
    const that = this;
    eventObjectDefine.CoreController.addEventListener("receive-msglist-answer", that.handlerMsglistAnswerShow.bind(that), that.listernerBackupid);
    eventObjectDefine.CoreController.addEventListener( "receive-msglist-question" , that.handlerMsglistQuestionShow.bind(that), that.listernerBackupid);
  }

  handlerMsglistAnswerShow(recvEventData){
    for(let message of recvEventData.message.answerShowArr){
      this.props.isDisabledHoldItem("answer", true);
    }
  };
  handlerMsglistQuestionShow(recvEventData){
    this.props.isDisabledHoldItem('answer', true);
  };

  /*答题器*/
  answerAssemblyShowHandel(e){
    ServiceSignalling.sendQuestion(false,{action:'open'})
    eventObjectDefine.CoreController.dispatchEvent({
        type:'handleAnswerShow' ,
        className:"answer-implement-bg",
        isShow:true,
    });
    this.props.isDisabledHoldItem("answer", true);
    this.props.close();
  }

  render() {
    return (
      <li className={"holdAllitem " + (this.props.isDisabled?' disabled':'')} >
        <div onClick={this.answerAssemblyShowHandel.bind(this)} >
          <button className={this.props.bgName} />
          <span>{this.props.name}</span>
        </div>
      </li>
    );
  }
}

Answer = WrapWithUpdate(Answer);

export default Answer;
