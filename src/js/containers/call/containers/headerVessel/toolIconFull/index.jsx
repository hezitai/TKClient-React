/**
 * 右侧头部- 头部图标按钮
 * @module  toolIconFull
 * @description   全屏图标按钮
 * @date 2018/11/20
 */

'use strict'
import React from  'react'
import TkGlobal from "TkGlobal";

export default class ToolIconFull  extends React.Component{
    constructor(){
        super()
    }
    render(){
        const { buttonClick , isFullScreen } = this.props
        return(
            <button title={TkGlobal.language.languageData.toolContainer.toolIcon[isFullScreen? 'fullOff' : 'full'].title}
                    className={`Tk-header-icon icon-${isFullScreen?'reset':'f11'}`}
                    onClick={buttonClick}>

            </button>
        )
    }

}