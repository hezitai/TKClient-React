/**
 * 教学工具箱 Smart组件
 * @module Blackboard
 * @description   工具箱小白板按钮
 * @author huangYaQin
 * @date 2018/11/21 重构
 */
'use strict';
import React from "react";
import ServiceSignalling from 'ServiceSignalling' ;
import eventObjectDefine from "eventObjectDefine";
import CoreController from "CoreController";
import WrapWithUpdate from "../WrapWithUpdateHoc/index";

class Blackboard extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount(){
    const that = this;
    eventObjectDefine.CoreController.addEventListener("receive-msglist-NewBlackBoard", that.handlerReceive_msglist_NewBlackBoard.bind(that), that.listernerBackupid);
  }

  handlerReceive_msglist_NewBlackBoard(recvEventData){
    this.props.handlerRoomPubmsg(recvEventData);
    let pubmsgData = recvEventData.message;
    if(pubmsgData.name ===  'BlackBoard_new'){
      this.props.isDisabledHoldItem("blackboard", true);
    }
  };

  // 小白板工具点击
  handleBlackBoardClick(){
    let isDelMsg = false , data = {
        blackBoardState:'_prepareing' ,  //_none:无 , _prepareing:准备中 , _dispenseed:分发 , _recycle:回收分发 , _againDispenseed:再次分发
        currentTapKey:'blackBoardCommon' ,
        currentTapPage:1 ,
    } ;
    ServiceSignalling.sendSignallingFromNewBlackBoard(data , isDelMsg);
    this.props.isDisabledHoldItem("blackboard", true);
    this.props.close();
  };

  render() {
    return (
      <li className={"holdAllitem " + (this.props.isDisabled?' disabled':'')}  >
        <div onClick={this.handleBlackBoardClick.bind(this)}>
          <button className={this.props.bgName} />
          <span>{this.props.name}</span>
        </div>
      </li>
    );
  }
}

Blackboard = WrapWithUpdate(Blackboard);

export default Blackboard; 