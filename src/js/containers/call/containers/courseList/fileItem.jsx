import React from 'react';
import { FileItemEvent } from './service';
import TkGlobal from 'TkGlobal';
import TkConstant from 'TkConstant';
import FileIcon from './components/fileIcon';
import FileOperation from './components/fileOperation';
import eventObjectDefine from 'eventObjectDefine';

class FileItem extends React.PureComponent {
  

  deleteDocuemnt(fileid) {
      if(TkConstant.hasRole.rolePatrol){
          return false;
      }
    FileItemEvent.deleteDocuemnt(fileid)
  }

  openDocuemnt(file) {
      if(TkConstant.hasRole.rolePatrol){
          return false;
      }
    // FileItemEvent.openDocuemnt(file);
    if(file.filetype !== "mp3" && file.filetype !== "mp4"){ // 如果是媒体不存入全局变量
        TkGlobal.defaultFileInfo = file
    }else{
        eventObjectDefine.CoreController.dispatchEvent({ type: "CloseLibrary" }); //关闭课件库事件
    }
    eventObjectDefine.CoreController.dispatchEvent({ type: "openCourseChange",
        message: {
            id: file.fileid
        }
    }); //关闭课件库事件
  }

  render() { 
    const {file, fileID,isOnlyAudioRoom} = this.props;
    let classification=TkConstant.joinRoomInfo.isDocumentClassification;
    return(
        <div className={"fileItem " + (isOnlyAudioRoom && file.filetype === 'mp4' ? ' hide' : '')} >
            <FileIcon openDocuemnt={this.openDocuemnt} file={file}></FileIcon>
            <span className={"fileListTool"}>
              <span onClick={this.openDocuemnt.bind(this,file)} className={"closeIcon "+(file.fileid == fileID?" on":"")}></span>
                <span style={{ display: TkConstant.hasRole.roleStudent 
                    || (classification && (this.props.pub === "coursePublicFiles" || this.props.pub === "mediaPublicFiles") || (file.filetype == "whiteboard"))?"none":""}}
                    onClick={this.deleteDocuemnt.bind(this,file.fileid)} className={"deleteIcon"}></span>
            </span>
        </div>
    ) 
  }
}

export default FileItem;
