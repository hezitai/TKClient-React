import React from 'react';
import TkGlobal from "TkGlobal";
import TkSliderDumb from 'TkSliderDumb';

class ToolEraser extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
        const { openToolEraser,changeEraser,mouseLeave,onAfterChangeEraserWidth } = this.props
        return (
          <li 
            className={"tool-option tool_eraser " + (this.props.eraserDisabled ? " disabled" : "") + (this.props.isActive === "tool_eraser" ? " active" : "" ) + (this.props.show ? "" : " hide")} 
            onClick={openToolEraser} 
            title={TkGlobal.language.languageData.header.tool.eraser.title}>
              <em className="icon" />
              <div className="tool-eraser-list-extend" style={{ display: this.props.isActive === "tool_eraser" && this.props.eraserShow ? "block" : "none" }} onClick={changeEraser} onMouseLeave={mouseLeave}>
                <div className="eraser-width-container">
                  {/* <span className="eraser-width-title title">橡皮檫大小</span> */}
                  <div className={"tool-slider"}>
                    <span>
                      { TkGlobal.language.languageData.whiteboardSetSize .eraserWidth }
                    </span>
                    <TkSliderDumb onAfterChange={onAfterChangeEraserWidth} value={this.props.eraserWidth} />
                    <span>{this.props.eraserWidth}</span>
                  </div>
                </div>
              </div>
            </li>
        );
    }
}
export default ToolEraser;