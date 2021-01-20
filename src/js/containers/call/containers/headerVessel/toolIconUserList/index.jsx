/**
 * 右侧头部- 头部图标按钮
 * @module  toolIConUserList
 * @description  头部花名册图标按钮
 * @date 2018/11/20
 */
' use strict '
import React from 'react'
import TkGlobal from "TkGlobal";



export default  class ToolIConUserList extends React.Component{
    constructor (){
        super()
    }
    render(){
        const { userList , buttonClick ,isHasHand  } = this.props
         return (

             (<button title={TkGlobal.language.languageData.toolContainer.toolIcon.userList.title}
                                      className={`Tk-header-icon icon-roster ${userList?'active':''} ${isHasHand ? 'hand' : ''} `}
                                      onClick={buttonClick}
                      >
             </button>
             )
         )
    }
}