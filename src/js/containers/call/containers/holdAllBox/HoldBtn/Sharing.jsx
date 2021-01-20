/**
 * 教学工具箱 Smart组件
 * @module Sharing
 * @description   工具箱共享按钮
 * @author huangYaQin
 * @date 2018/11/21 重构
 */
'use strict';
import React from "react";
import eventObjectDefine from "eventObjectDefine";
import WrapWithUpdate from '../WrapWithUpdateHoc/index'
import TkGlobal from "TkGlobal";
import ServiceRoom from "ServiceRoom";
import ServiceTools from "ServiceTools";
import ServiceTooltip from "ServiceTooltip";

class Sharing extends React.Component {
  constructor(props) {
    super(props)
  }

 //  共享工具点击
  _screenSharing() {
      let isChrome = this.BrowserCheck()[0] === 'Chrome';//判断是否是chrome内核
      let userObj = Object.entries(ServiceRoom.getTkRoom().getUsers());
      let users = userObj.filter(([userId, user]) => user.publishstate > 0);
      let usersRole = userObj.filter(([userId, user]) => (user.publishstate > 0 && (user.role === TkConstant.role.roleStudent || user.role === TkConstant.role.roleTeachingAssistant)));
      if ((users.length >= TkConstant.joinRoomInfo.maxvideo || usersRole.length >= (TkConstant.joinRoomInfo.maxvideo - 1)) && (TkConstant.hasRole.roleStudent || TkConstant.hasRole.roleTeachingAssistant)) {
          ServiceTooltip.showPrompt("当前已到达最大上台人数，暂不能进行桌面共享");
      } else {
          if (TkGlobal.isClient) {
              eventObjectDefine.CoreController.dispatchEvent({
                  type: 'programmShare'
              });
              this.props.isDisabledHoldItem("sharing", true);
          } else if (!TkGlobal.isClient && !TkGlobal.isMobile && isChrome) {
              ServiceTools.stopAllMediaShare();
              ServiceRoom.getTkRoom().startShareScreen(null, (code, info) => {
                  if (code === window.TK_ERR.CHECK_USERDesktopMediaError) {
                      eventObjectDefine.CoreController.dispatchEvent({
                          type: 'check_no_plug',
                      });
                  }
                  //桌面共享开始插件已唤出，取消共享，启用工具箱屏幕共享按钮
                  eventObjectDefine.CoreController.dispatchEvent({
                      type: 'colse-holdAll-item',
                      message: {
                          type: 'sharing'
                      }
                  });
              });
          }
      }
      this.props.close();
  }

    BrowserCheck() {
        var N = navigator.appName, ua = navigator.userAgent, tem;
        var M = ua.match(/(opera|chrome|safari|firefox|msie|trident)\/?\s*(\.?\d+(\.\d+)*)/i);
        if (M && (tem = ua.match(/version\/([\.\d]+)/i)) != null) { M[2] = tem[1]; }
        M = M ? [M[1], M[2]] : [N, navigator.appVersion, '-?'];
        return M;
    }

  render() {
    return (
      <li className={"holdAllitem " + (this.props.isDisabled?' disabled':'')}  >
        <div onClick={this._screenSharing.bind(this)}>
          <button className={this.props.bgName} />
          <span>{this.props.name}</span>
        </div>
      </li>
    );
  }
}

Sharing = WrapWithUpdate(Sharing);

export default Sharing; 