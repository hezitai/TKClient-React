import React from 'react';
import TkGlobal from "TkGlobal";
import ColorPicker from "../../../../../components/colorPicker/index";
import TkSliderDumb from 'TkSliderDumb';

class ToolText extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
        const {openToolText,changePen,mouseLeave,changeFontFamily,setLineColor,changeFontSize} = this.props;
        return <li className={"tool-option tool_text " + (this.props.isActive === "tool_text" ? "active" : "") + (this.props.show ? "" : " hide")} onClick={openToolText} title={TkGlobal.language.languageData.header.tool.text.title}>
            <em className="icon" />
            <div className="tool-pen-list-extend" style={{ display: this.props.textPanelShow && this.props.isActive === "tool_text" ? "block" : "none" }} onClick={changePen} onMouseLeave={mouseLeave}>
              {TkConstant.joinRoomInfo.fontoptions && TkConstant.hasRole.roleStudent ? undefined : <div className="font-container"> 
                  <div className="font-content-container">
                    <div className="font-family-container" onClick={changeFontFamily}>
                      <button className={"font-family-option Msyh " + (this.props.fontFamily === "微软雅黑" ? "active" : "")} data-fontfamily="微软雅黑">
                        {TkGlobal.language.languageData.header.tool.text.Msyh.text}
                      </button>
                      <button className={"font-family-option Ming " + (this.props.fontFamily === "宋体" ? "active" : "")} data-fontfamily="宋体">
                        {TkGlobal.language.languageData.header.tool.text.Ming.text}
                      </button>
                      <button className={"font-family-option Arial " + (this.props.fontFamily === "Arial" ? "active" : "")} data-fontfamily="Arial">
                        {TkGlobal.language.languageData.header.tool.text.Arial.text}
                      </button>
                    </div>
                  </div>
                </div>}
              <div style={{ position: "relative" }}>
                <ColorPicker afterChange={setLineColor} color={this.props.primaryColor} />
              </div>
              {/* 配置项：学生端涂鸦工具无字体字号的选择，仅可选择颜色 */}
              {TkConstant.joinRoomInfo.fontoptions && TkConstant.hasRole.roleStudent ? undefined : <div className={"tool-slider"}>
                  <span>
                    {
                      TkGlobal.language.languageData.whiteboardSetSize
                        .textWidth
                    }
                  </span>
                  <TkSliderDumb value={this.props.fontSize} onAfterChange={changeFontSize} />
                  <span>{this.props.fontSize}</span>
                </div>}
            </div>
          </li>;
    }
}
export default ToolText;