/**
 * 右侧头部- 头部图标按钮
 * @module  toolIconResourceLibrary
 * @description  头部课件库图标按钮
 * @date 2018/11/20
 */
' use strict '
import React from 'react'
import styled from 'styled-components'
import CoreController from "CoreController";
import TkGlobal from "TkGlobal";

// const ToolIconResourceLibraryButton = styled.div`
//    display : ${
//     CoreController.handler.getAppPermissions('loadCoursewarelist') && props.isCourseMp4Play && !TkGlobal.isMovieSharePlay
//         ? 'block'
//         : 'none'
//     };
// `;

export default class ToolIconResourceLibrary extends React.Component {
    constructor() {
        super()
    }
        render(){
            const { courseware, buttonClick, isCourseMp4Play} = this.props
            const isShow = CoreController.handler.getAppPermissions('loadCoursewarelist') && !(isCourseMp4Play && TkGlobal.movieShareStatus && TkGlobal.isMovieSharePlay);
          return (
            <button title={TkGlobal.language.languageData.toolContainer.toolIcon.resourceLibrary.title}
                    className={`Tk-header-icon icon-courseware ${courseware ? 'active' : ''}`}
                    onClick={buttonClick}
                    style={{ display: isShow ? 'block' : 'none'}}
                    >
            </button>
          )
        }


}
