import React from 'react';
import TkConstant from 'TkConstant';
import TkGlobal from 'TkGlobal';
import BanChatBtn from '../BanChatBtn';
class ChatTitleBox extends React.Component{
    render(){
        const {close} = this.props;
        return(
            <div className="chat-title-tip" >
               {
                   TkConstant.hasRole.roleChairman || 
                   TkConstant.hasRole.roleTeachingAssistant ? 
                    <BanChatBtn {...this.props}/> :
                    undefined
                }
                {/* <span className="chat_title_text" ></span> */}
                {/* atTyr--xuaiugai */}
                <span className="chat_title_text" >{TkGlobal.language.languageData.videoContainer.sendMsg.tap.chat}</span>
                <span className="close" onClick={close}></span>
            </div>
        )
    }
}
export default ChatTitleBox;