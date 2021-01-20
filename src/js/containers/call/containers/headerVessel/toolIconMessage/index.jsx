/**
 * 右侧头部- 头部图标按钮
 * @module  toolIconMessage
 * @description  留言消息图标按钮
 * @date 2018/11/20
 */
' use strict '
import React from 'react'
import TkGlobal from "TkGlobal";
import styled from 'styled-components'

const ToolIconMessageButton = styled.button`
   display : ${props=>
      !props.isClassOverLeave
       ?(props.isEncompassment ? 'none' : 'block')
       :'none'
   };
`
const ToolIconMessageSpan = styled.span.attrs({
    className: props => (props.unReadMessages < 100 ? "" : "more-meg")
})`
    display :${ props=>
         props.unReadMessages !== 0 && !props.chat
             ? 'block'
             : 'none'
    };
`
export default class ToolIconMessage extends React.Component{
    constructor(){
        super()
    }
    render(){
        const { chat,buttonClick ,isClassOverLeave,unReadMessages,isEncompassment} = this.props;
        return(
            <div className={`chat-icon-container`} >
                <ToolIconMessageButton title={TkGlobal.language.languageData.toolContainer.toolIcon.message.title}
                        className={`Tk-header-icon icon-chat ${chat?'active':''}`}
                        onClick={buttonClick}
                        isEncompassment={isEncompassment}
                        isClassOverLeave={isClassOverLeave} >
                </ToolIconMessageButton>
                <ToolIconMessageSpan unReadMessages = {unReadMessages}  chat={chat}
                      className={`icon-chat-unread`}>
                      {unReadMessages}
                </ToolIconMessageSpan>
            </div>
        )
    }

}