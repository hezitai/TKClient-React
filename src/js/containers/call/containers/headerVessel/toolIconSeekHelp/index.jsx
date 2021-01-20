/**
 * 右侧头部- 头部图标按钮
 * @module  toolIconSeekHelp
 * @description   求助图标按钮
 * @date 2018/11/20
 */
'use strict'

import React from 'react'
import TkGlobal from "TkGlobal";


export default class ToolIconSeekHelp extends React.Component{
    constructor(){
        super()
    }
    render(){
        const { buttonClick } = this.props
        return(
            <button title={TkGlobal.language.languageData.toolContainer.toolIcon.seekHelp.title}
                    className="Tk-header-icon icon-help"
                    onClick={buttonClick}
                  ></button>
        )
    }
}