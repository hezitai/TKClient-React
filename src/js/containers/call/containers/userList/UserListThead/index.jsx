
/**
 * 
 * 设计变更 暂时不需要引入
 */

import React from 'react';
import TkGlobal from 'TkGlobal';
export default class UserListThead extends React.Component{
    render(){
        return(
            <div className={"tk-list-thead"}>
                <div className={"tk-list-thead-facility"}>
                    <span>{TkGlobal.language.languageData.toolContainer.toolIcon.userList.thead.facility}</span>
                </div>
                <div className={"tk-list-thead-name textCenter"}>
                    <span>{TkGlobal.language.languageData.toolContainer.toolIcon.userList.thead.nick}</span>
                </div>
                <div className={"tk-list-thead-botton"}>
                    <span>{TkGlobal.language.languageData.toolContainer.toolIcon.userList.thead.platform}</span>
                    <span>{TkGlobal.language.languageData.toolContainer.toolIcon.userList.thead.camera}</span>
                    <span>{TkGlobal.language.languageData.toolContainer.toolIcon.userList.thead.microphone}</span>
                    <span>{TkGlobal.language.languageData.toolContainer.toolIcon.userList.thead.draw}</span>
                    <span>{TkGlobal.language.languageData.toolContainer.toolIcon.userList.thead.raise}</span>
                    <span>{TkGlobal.language.languageData.toolContainer.toolIcon.userList.thead.mute}</span>
                    <span>{TkGlobal.language.languageData.toolContainer.toolIcon.userList.thead.remove}</span>
                </div>
            </div>
        )
    }
}