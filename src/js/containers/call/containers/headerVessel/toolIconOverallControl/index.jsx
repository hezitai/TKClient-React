
/**
 * 右侧头部- 头部图标按钮
 * @module  toolIconOverall
 * @description  头部全体控制图标按钮
 * @date 2018/11/20
 */
' use strict '
import React from 'react';
import styled from 'styled-components';
import TkGlobal from "TkGlobal";
import TkConstant from "TkConstant";
import ControlPanel from "@/ControlPanel";

const ToolIconOverallDiv = styled.div `
   display : ${props =>
       props.classBegin&& (TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant)
       ? 'block' 
       : 'none'
    };
`

export default class ToolIconOverall extends React.Component {
    constructor(){
        super()
    }
    render(){
        const {option,buttonClick ,classBegin} = this.props;
        let {RightContentVesselSmartStyleJson ={}} = TkGlobal.systemStyleJson ;
        return(
            <div>
                <ToolIconOverallDiv 
                    title={TkGlobal.language.languageData.toolContainer.toolIcon.overallControl.title}
                    className={`Tk-header-icon icon-option ${option ? 'active' : ''}`}
                    onClick={buttonClick}
                    classBegin={classBegin}
                    >
                        <ControlPanel id="controlPanelMain"/>{/*全体控制*/}
                </ToolIconOverallDiv>
                <div 
                    className="mask2"  
                    onClick={buttonClick} 
                    style={{ display:  option ? "block" : "none" , height: RightContentVesselSmartStyleJson.height }} />
            </div>
        )
    }

}