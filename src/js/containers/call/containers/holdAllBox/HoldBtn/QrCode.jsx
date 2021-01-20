/**
 * 教学工具箱 Smart组件
 * @module QrCode
 * @description   工具箱扫码按钮
 * @author huangYaQin
 * @date 2018/11/21 重构
 */
'use strict';
import React from "react";
import ServiceSignalling from 'ServiceSignalling' ;
import eventObjectDefine from "eventObjectDefine";
import CoreController from "CoreController";
import WrapWithUpdate from "../WrapWithUpdateHoc/index";

class QrCode extends React.Component {
  constructor(props) {
    super(props)
  }

  /*二维码工具按钮的点击*/
  handleQrCodeBoxClick() {
    this.setState({
      qrCodeBoxIsShow:true,
    });
    eventObjectDefine.CoreController.dispatchEvent({
      type:'handleQrCodeShow' ,
      isShow:true,
    });
    this.props.isDisabledHoldItem("qrCode", true);
    this.props.close();
  }

  render() {
    return (
      <li className={"holdAllitem " + (this.props.isDisabled?' disabled':'')} >
        <div onClick={this.handleQrCodeBoxClick.bind(this)} >
          <button className={this.props.bgName} />
          <span>{this.props.name}</span>
        </div>
      </li>
    );
  }
}

QrCode = WrapWithUpdate(QrCode);

export default QrCode; 