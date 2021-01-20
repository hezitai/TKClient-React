/**
 * 右侧头部- 头部图标按钮
 * @module  toolIconSetting
 * @description   设置图标按钮
 * @date 2018/11/20
 */

'use strict'

import React from 'react';
import TkGlobal from "TkGlobal";

export default class ToolIconSetting extends  React.Component{
      constructor(){
          super()
      }
      render() {
          const {settingActive ,buttonClick} = this.props
          return(
              <button title={TkGlobal.language.languageData.toolContainer.toolIcon.setting.title} style={{marginRight:'0rem'}}  className={"Tk-header-icon icon-setting" + (settingActive ? ' active' : '')}
                      onClick={buttonClick}>

              </button>

          )
      }

}


















