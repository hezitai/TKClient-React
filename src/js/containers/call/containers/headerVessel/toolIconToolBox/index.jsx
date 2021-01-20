/**
 * 右侧头部- 头部图标按钮
 * @module  toolIconToolBox
 * @description  头部工具箱图标按钮
 * @date 2018/11/20
 */
import React from 'react';
import styled from 'styled-components';
import TkGlobal from "TkGlobal";
import CoreController from "CoreController";
import HoldAll from "@/holdAllBox";

const  ToolIconToolBoxDiv =  styled.div `
 display : ${ props=>
    props.classBegin && CoreController.handler.getAppPermissions('canDraw') && props.isCourseMp4Play && props.isShowTools
        ? 'block'
        : 'none'    
    };
`
export default class ToolIconToolBox extends React.Component {
    constructor(){
        super()
    }
    render(){
        //title={TkGlobal.language.languageData.toolCase.toolBox.text}
        const {toolKit,
            buttonClick ,
            classBegin,
            // 如果工具箱中是空的
            isShowTools} = this.props
        let {RightContentVesselSmartStyleJson ={}} = TkGlobal.systemStyleJson ;
        return(
            <div>
                <ToolIconToolBoxDiv 
                    isCourseMp4Play={this.props.isCourseMp4Play}
                    className={`Tk-header-icon icon-tools ${toolKit ? 'active' : ''}`}
                    onClick={buttonClick}
                    isShowTools={isShowTools}
                    classBegin={{classBegin}}>
                    <HoldAll id="holdAllBox"/> {/*工具箱*/}
                </ToolIconToolBoxDiv>
                <div 
                    className="mask2"  
                    onClick={buttonClick} 
                    style={{ display:  toolKit ? "block" : "none" , height: RightContentVesselSmartStyleJson.height }} />
            </div>
        )
    }

}