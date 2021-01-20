import React from 'react';
import TkGlobal from 'TkGlobal';
export default class UserListTitle extends React.Component{
    render(){
        const {
            sum,
        } = this.props;
        return(
            <span className="userlist-title"> {TkGlobal.language.languageData.toolContainer.toolIcon.userList.title} <span className="tk-list-title-number" >{`（${sum}）`}</span> </span>
        )
    }
}