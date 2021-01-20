/**
 * 教学工具箱 Smart组件
 * @module AllCaptrue
 * @description   工具箱桌面截屏按钮
 * @author huangYaQin
 * @date 2018/11/21 重构
 */
'use strict';
import React from "react";
import ServiceSignalling from 'ServiceSignalling' ;
import eventObjectDefine from "eventObjectDefine";
import CoreController from "CoreController";
import WrapWithUpdate from "../WrapWithUpdateHoc/index";

class AllCaptrue extends React.Component {
  constructor(props) {
    super(props)
  }

  /*桌面截屏*/
  allCpatureClick(){
    let data = {
        isHideClassroom:false,
    };
    this.props.takeSnapshot(data);
    // this.isDisabledHoldItem('allCaptrue', true)        
    this.props.close();
  }

  render() {
    return (
      <li className={"holdAllitem " + (this.props.isDisabled?' disabled':'')} >
        <div onClick={this.allCpatureClick.bind(this)}>
          <button className={this.props.bgName}  />
          <span>{this.props.name}</span>
        </div>
      </li>
    );
  }
}

AllCaptrue = WrapWithUpdate(AllCaptrue);

export default AllCaptrue;