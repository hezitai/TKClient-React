/**
 * 教学工具箱 Smart组件
 * @module MovieShare
 * @description   工具箱媒体共享按钮
 * @author huangYaQin
 * @date 2018/11/21 重构
 */
'use strict';
import React from "react";
import TkGlobal from "TkGlobal";
import TkConstant from "TkConstant";
import ServiceRoom from 'ServiceRoom' ;
import ServiceTools from 'ServiceTools' ;
import eventObjectDefine from "eventObjectDefine";
import CoreController from "CoreController";
import WrapWithUpdate from "../WrapWithUpdateHoc/index";

class MovieShare extends React.Component {
  constructor(props) {
    super(props)
  }

  //媒体共享点击事件
  handleMovieShareClick(){
    let that = this;
    if(TkGlobal.isClient && !TkGlobal.isMacClient){
      TkGlobal.isMovieSharePlay = true;
      TkGlobal.movieShareStatus = true;
      ServiceRoom.getNativeInterface().getOpenFileName({caption:"Media File Selector", filter:{"Media File":"*.mp4;*.3gp;*.avi;*.flv;*.mkv;*.mov;*.mpg;*.rmvb;*.vob;*.wmv"}},  (arg) =>{    
        if (arg.action === "Complete") {// Complete Cancelled Activated
              ServiceTools.stopAllMediaShare();
              ServiceRoom.getNativeInterface().startShareMediaFile(arg.filename, undefined, undefined, {
                  IgnoreElementId:true ,
                  attrs:{
                      pauseWhenOver:TkConstant.joinRoomInfo.pauseWhenOver
                  }
              });
              
          }
      });
      this.props.close();
    }
  }

  render() {
    return (
      <li className={"holdAllitem "  + (this.props.isDisabled?' disabled':'')} >
        <div onClick={this.handleMovieShareClick.bind(this)}>
          <button className={this.props.bgName}  />
          <span>{this.props.name}</span>
        </div>
      </li>
    );
  }
}

MovieShare = WrapWithUpdate(MovieShare);

export default MovieShare; 