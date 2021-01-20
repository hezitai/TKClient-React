import React from "react";
import ServiceRoom from "ServiceRoom";
import { FileItemEvent } from "./service";
import TkGlobal from "TkGlobal";
import utils from "./utils";
import UploadFileFrom from "UploadFileFrom";
import eventObjectDefine from 'eventObjectDefine';

class FileProgressBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      percent: 0,
      currProgressText: 0
    };
    this.AJAXCancel = null;
  }

  uploadSuccess(id) {
    this.props.uploadSuccess(id);
  }

  uploadCancel(id) {
    if (this.AJAXCancel && utils.isFunction(this.AJAXCancel.abort)) {
      this.AJAXCancel.abort();
    }
    this.props.uploadCancel(id);
    return false;
  }

  uploadFile(formData, filename, filetype) {
    const id = new Date().getTime()
    this.props.uploadFile(formData, filename, filetype, id)
    this.AJAXCancel = ServiceRoom.getTkRoom().uploadFile(
      formData,
      // 上传状态
      (code, res) => {
        if (code === 0) {
          this.uploadSuccess(id);
        } else {
          this.setState({
            percent: 100,
            currProgressText: FileItemEvent.fileUploadErrorCode(code)
          });
          this.uploadCancel(id);
        }
      },
      // 上传进度
      (data, number) => {
        if (number >= 100) {
          if (filetype !== "mp3" && filetype !== "mp4") {
            this.setState({
              percent: 100,
              currProgressText:
                TkGlobal.language.languageData.toolContainer.toolIcon
                  .FileConversion.text
            });
          } else {
            this.setState({
              percent: 100,
              currProgressText: "100%"
            });
          }
        } else {
          this.setState({
            percent: number,
            currProgressText: `${number}%`
          });
        }
      }
    );
  }

  render() {
    let { percent, currProgressText } = this.state;
    let { libType, fileType, uploadFileFromFlag } = this.props;
    let accept = null;
    if (libType == "courseLib" && fileType == "h5") {
      accept = TkConstant.FILETYPE.h5DocumentFileListAccpet;
    } else if (libType == "mediaLib") {
      accept = TkConstant.FILETYPE.mediaFileListAccpet;
    } else if (libType == "courseLib") {
      accept = TkConstant.FILETYPE.documentFileListAccpet;
    }
    return (
      <div className="progress-bar-box">
        <span className="progress-bar" style={{ width: percent + "%" }}>
          <span className="curr-progress">{currProgressText}</span>
        </span>
        {/*<span className="upload-failure">{currProgressText}</span>*/}
        <button
          className="cancel-file-upload"
          onClick={this.uploadCancel.bind(this)}
        />
        <UploadFileFrom
          isWritedbFromUploadFile={true}
          accept={accept}
          flag={uploadFileFromFlag}
          externalUploadFileCallback={this.uploadFile.bind(this)}
        />
      </div>
    );
  }
}

export default FileProgressBar;

// function withAddFileProgressBar() {}
