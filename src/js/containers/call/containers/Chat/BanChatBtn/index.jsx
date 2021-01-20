import React from 'react';
import TkGlobal from 'TkGlobal';
export default class BanChatBtn extends React.Component{
    render(){
        const {
            banChatTitle,
            isPatrol,
            textDisable,
            chatToggle,
            isAllBanSpeak 
        } = this.props;
        return(
            <button
                className={"emotion2 "+ (!isAllBanSpeak ? 'on':'off')}
                // atTyr--xuaiugai
                // style={{display:'none'}}
                disabled={(TkGlobal.isLeaveRoom ? true : TkConstant.hasRole.roleStudent && (isPatrol || textDisable))}
                title={banChatTitle}
                onClick={chatToggle}>
                {/* {banChatTitle} */}
            </button>
        )
    }
}
