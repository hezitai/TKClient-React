import React from 'react';
import TkGlobal from "TkGlobal";
import ColorPicker from "../../../../../components/colorPicker/index";
import TkSliderDumb from 'TkSliderDumb';

class ToolShapeList extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
        const {showShapeList,changeShape,mouseLeave,setLineColor,onAfterChangeShapeLineWidth} = this.props;
        return <li className={"tool-option shape-list " + (this.props.shape + " ") + (this.props.isActive === this.props.shapeActive(this.props.shape) ? "active" : "") + (this.props.show ? "" : " hide")} data-current-shape={this.props.shape} onClick={showShapeList} title={TkGlobal.language.languageData.header.tool.shape.title}>
            <em className="icon" />
            <div className="tool-shape-list-extend" style={{ display: this.props.isShowShapeList && this.props.isActive === this.props.shapeActive(this.props.shape) ? "block" : "none" }} onClick={changeShape} onMouseLeave={mouseLeave}>
              <ol className="tool-shape-container">
                <em className="arrow" />
                <li className={"shape-option tool_rectangle_empty " + (this.props.isActive === "tool_rectangle_empty" ? "active" : "")}>
                  <em data-type={"tool_rectangle_empty"} className="shape-icon" />
                  {/* <p data-type={'tool_rectangle_empty'}>{TkGlobal.language.languageData.header.tool.shape.outlinedRectangle.text}</p> */}
                </li>
                <li className={"shape-option tool_rectangle " + (this.props.isActive === "tool_rectangle" ? "active" : "")}>
                  <em data-type={"tool_rectangle"} className="shape-icon" />
                  {/* <p data-type={'tool_rectangle'}>{TkGlobal.language.languageData.header.tool.shape.filledRectangle.text}</p> */}
                </li>
                <li className={"shape-option tool_ellipse_empty " + (this.props.isActive === "tool_ellipse_empty" ? "active" : "")}>
                  <em data-type={"tool_ellipse_empty"} className="shape-icon" />
                  {/* <p data-type={'tool_ellipse_empty'}>{TkGlobal.language.languageData.header.tool.shape.outlinedCircle.text}</p> */}
                </li>
                <li className={"shape-option tool_ellipse " + (this.props.isActive === "tool_ellipse" ? "active" : "")}>
                  <em data-type={"tool_ellipse"} className="shape-icon" />
                  {/* <p data-type={'tool_ellipse'}>{TkGlobal.language.languageData.header.tool.shape.filledCircle.text}</p> */}
                </li>
              </ol>
              <div style={{ position: "relative" }}>
                <ColorPicker afterChange={setLineColor} color={this.props.primaryColor} />
              </div>
              <div className={"tool-slider"}>
                <span>
                  {
                    TkGlobal.language.languageData.whiteboardSetSize
                      .lineWidth
                  }
                </span>
                <TkSliderDumb value={this.props.shapeWidth} onAfterChange={onAfterChangeShapeLineWidth} />
                <span>{this.props.shapeWidth}</span>
              </div>
            </div>
          </li>;
    }
}
export default ToolShapeList;