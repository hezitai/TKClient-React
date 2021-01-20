import React from 'react';
import { FileItemEvent } from '../service';
import FileItem from '../fileItem';
import eventObjectDefine from 'eventObjectDefine';
import TkGlobal from 'TkGlobal';

class WhiteBoardFile extends React.PureComponent {
  constructor(props){
    super(props)
    this.state = {
      selectedFileID: TkGlobal.defaultFileInfo.fileid
    }
    this.whiteBoard = FileItemEvent.addWhiteBoardInfo()
  }

  componentDidMount() {
    eventObjectDefine.CoreController.addEventListener(
      "openCourseChange",
      this.openCourseChange.bind(this),
      this.listernerBackupid
    );
  }

  openCourseChange(receiveEventData) {
    let selectedFileID = TkGlobal.defaultFileInfo.fileid
    if(receiveEventData&&receiveEventData.message){
      selectedFileID = receiveEventData.message.id;
    }
    this.setState({
      selectedFileID
    });
  }
  
  render() {
    return(
      <React.Fragment>
        <FileItem
          fileID={this.state.selectedFileID}
          pub={'coursePrivateFiles'}
          key={this.whiteBoard.fileid}
          file={this.whiteBoard}
        />
      </React.Fragment>
    );
  }
}

export default WhiteBoardFile;