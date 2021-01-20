import React from 'react';
import TkGlobal from "TkGlobal";
import ColorPicker from "../../../../../components/colorPicker/index";
import TkSliderDumb from 'TkSliderDumb';
import TkConstant from "TkConstant";

class ToolPenList extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
        const {showPenList,changePen,mouseLeave,setLineColor,onAfterChangePenLineWidth}=this.props
        return(
            <li className={"tool-option pen-list " +(this.props.pen+' ') + (this.props.isActive === this.props.penActive(this.props.pen)? 'active' : '')+(this.props.show?'':' hide')} data-current-pen={this.props.pen} onClick={showPenList} title={TkGlobal.language.languageData.header.tool.pencil.title}>
                <em className="icon"></em>
                <div className={"tool-pen-list-extend " + (TkConstant.joinRoomInfo.mouseoptions && TkConstant.hasRole.roleStudent?" student":" ")} style={{display:this.props.isShowPenList&&this.props.isActive === this.props.penActive(this.props.pen)?"block":"none"}} onClick={changePen} onMouseLeave={mouseLeave}>
                    <ol className="tool-pen-container">
                        <em className="arrow"></em>
                        <li  className={"pen-option tool_pencil " + (this.props.pen === 'tool_pencil' ? 'active' : '')}>
                            <em data-type={'tool_pencil'} className="pen-icon "></em><p data-type={'tool_pencil'}>
                            {/* {TkGlobal.language.languageData.header.tool.pencil.pen.text} */}
                            </p>
                        </li>
                        <li className={"pen-option tool_highlighter " + (this.props.pen === 'tool_highlighter' ? 'active' : '')}>
                            <em data-type={'tool_highlighter'} className="pen-icon"></em><p data-type={'tool_highlighter'}>
                            {/* {TkGlobal.language.languageData.header.tool.pencil.Highlighter.text} */}
                            </p>
                        </li>
                        <li  className={"pen-option tool_line " + (this.props.pen === 'tool_line' ? 'active' : '')}>
                            <em data-type={'tool_line'} className="pen-icon"></em><p data-type={'tool_line'}>
                            {/* {TkGlobal.language.languageData.header.tool.pencil.linellae.text} */}
                            </p>
                        </li>
                        <li data-type={'tool_arrow'} className={"pen-option tool_arrow " + (this.props.pen === 'tool_arrow' ? 'active' : '')}>
                            <em data-type={'tool_arrow'} className="pen-icon"></em><p data-type={'tool_arrow'}>
                            {/* {TkGlobal.language.languageData.header.tool.pencil.arrow.text} */}
                            </p>
                        </li>
                    </ol>
                    <div style={{position:'relative'}}>
                        <ColorPicker afterChange = {setLineColor} color={this.props.primaryColor}/>
                    </div>
                    <div className={'tool-slider'}>
                        <span>{TkGlobal.language.languageData.whiteboardSetSize.lineWidth}</span>
                        <TkSliderDumb value={this.props.penWidth} onAfterChange = {onAfterChangePenLineWidth}/>
                        <span>{this.props.penWidth}</span>
                    </div>
                </div>
            </li>
        )
    }
}
export default ToolPenList;