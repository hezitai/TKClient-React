/**
 * @description 课件库
 * @author mlh
 * @date 2018/12/9
 */

import React from "react";
import eventObjectDefine from "eventObjectDefine";
import TkGlobal from "TkGlobal";
import TkConstant from "TkConstant";
import ServiceRoom from "ServiceRoom";
import utils from "./utils";
import { FileListEvent, FileItemEvent, HistoryFileId } from "./service";
import FileItem from "./fileItem";
import FileProgressBar from "./fileProgressBar";
import UploadFileFrom from "UploadFileFrom";
import WhiteBoardFile from "./components/whiteBoard";

class FileList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
      selectedFileID: TkGlobal.defaultFileInfo.fileid,
      isOnlyAudioRoom: TkGlobal.isOnlyAudioRoom,
      autoFileRefresh: false
    };
    this.recoveryList = [];
    this.defaultFileInfo = undefined;
    this.listernerBackupid = new Date().getTime() + "_" + Math.random();
  }

  componentDidMount() {
    // 更新当前打开的课件的selectedFileID
    eventObjectDefine.CoreController.addEventListener(
      "openCourseChange",
      this.openCourseChange.bind(this),
      this.listernerBackupid
    );
    eventObjectDefine.CoreController.addEventListener(
      TkConstant.EVENTTYPE.RoomEvent.roomFiles,
      this.handlerReceiveFileInfo.bind(this),
      this.listernerBackupid
    );
    eventObjectDefine.CoreController.addEventListener(
      TkConstant.EVENTTYPE.RoomEvent.roomAddFile,
      this.handlerRoomAddFile.bind(this),
      this.listernerBackupid
    );
    eventObjectDefine.CoreController.addEventListener(
      'isOnlyAudioRoom',
      this.handlerIsOnlyAudioRoom.bind(this),
      this.listernerBackupid
    );
    eventObjectDefine.CoreController.addEventListener(
      TkConstant.EVENTTYPE.RoomEvent.roomDeleteFile,
      this.handlerRoomDeleteFile.bind(this),
      this.listernerBackupid
    );
    eventObjectDefine.CoreController.addEventListener(
      "fileListEvent",
      this.handlerFileListObserver.bind(this),
      this.listernerBackupid
    );
    eventObjectDefine.CoreController.addEventListener(
      "receiveWhiteboardSDKAction",
      this.receiveWhiteboardSDKAction.bind(this),
      this.listernerBackupid
    );
  }

  componentWillUnmount() {
    eventObjectDefine.CoreController.removeBackupListerner(
      this.listernerBackupid
    );
  }
  handlerIsOnlyAudioRoom(recvEventData) {
    this.setState(() => {
      return { isOnlyAudioRoom: recvEventData.onlyAudio }
    })
  }

  // 将所有的课件分拣到四个列表当中
  handlerReceiveFileInfo(receiveEventData) {
    const { fileOption } = this.props;
    this.recoveryList = [].concat(
      FileListEvent._filterList(receiveEventData.message)[fileOption]
    );
    this.setState(() => {
      return { fileList: [].concat(this.recoveryList) }
    })
  }

  // 重新更新排序或搜索的列表
  handlerFileListObserver(recvEventData) {
    const message = recvEventData.message;
    const bool = /course/.test(this.props.fileOption);
    if (message.libType === 'courseLib' && bool) {
      if (message && message.fileSortType) {
        this._handleFileSort(message);
      } else if (message) {
        this._handleFileSearch(message);
      }
    } else if (message.libType === 'mediaLib' && !bool) {
      if (message && message.fileSortType) {
        this._handleFileSort(message);
      } else if (message) {
        this._handleFileSearch(message);
      }
    }
  }

  handlerRoomAddFile(receiveEventData) {
    const { fileid, fromID } = receiveEventData.message;
    // ----------
    const fileInfo =
      ServiceRoom.getTkRoom().getFileinfo &&
      ServiceRoom.getTkRoom().getFileinfo(fileid);
    const { fileOption, fileType } = this.props;
    let newFileList = [];
    // 0: 课堂文件 ， 1：系统文件
    if (!(+fileInfo.filecategory)) {
      if (
        (fileInfo.filetype === "mp3" || fileInfo.filetype === "mp4") &&
        fileOption === "mediaPrivateFiles"
      ) {
        newFileList.push(fileInfo);
      } else if (
        fileInfo.filetype !== "mp3" &&
        fileInfo.filetype !== "mp4" &&
        fileOption === "coursePrivateFiles"
      ) {
        newFileList.push(fileInfo);
      }
    } else {
      if (
        (fileInfo.filetype === "mp3" || fileInfo.filetype === "mp4") &&
        fileOption === "mediaPublicFiles"
      ) {
        newFileList.push(fileInfo);
      } else if (
        fileInfo.filetype !== "mp3" &&
        fileInfo.filetype !== "mp4" &&
        fileOption === "coursePublicFiles"
      ) {
        newFileList.push(fileInfo);
      }
    }
    this.recoveryList = newFileList.concat(this.state.fileList);
    this.setState(() => {
      return {
        fileList: [].concat(this.recoveryList),
        autoFileRefresh: true
      }
    });
    // 如果不是自己而且没有上课 就return
    if (!TkGlobal.classBegin && ServiceRoom.getTkRoom().getMySelf().id !== fromID) {
      return
    }
    // 如果新添加的是MP3或者mp4的话不自动播放
    if (fileInfo.filetype !== "mp3" && fileInfo.filetype !== "mp4") {
      TkGlobal.defaultFileInfo = fileInfo
      // 上传通知上传id
      eventObjectDefine.CoreController.dispatchEvent({
        type: "openCourseChange",
        message: {
          id: fileid
        }
      });
    }
    eventObjectDefine.CoreController.dispatchEvent({
      type: "fileListEvent",
      message: { revealFileId: fileid }
    });
  }

  handlerRoomDeleteFile(receiveEventData) {
    const { fileid, fromID, fileinfo } = receiveEventData.message;
    const filecategory = fileinfo.filecategory
    if (TkConstant.hasRole.roleStudent) return
    const fileList = this.state.fileList.filter(fileItem => {
      return fileItem.fileid != fileid;
    });
    // 如果当前删除的是公共课件  那么就只更新列表 不更新白板
    if (filecategory == 0) {
    // 判断各个列表如果列表为空了  显示白板
      if (!TkConstant.joinRoomInfo.isDocumentClassification) {
        if (this.props.fileOption == 'coursePrivateFiles' && fileList.length == 0) {
          eventObjectDefine.CoreController.dispatchEvent({
            type: "openCourseChange",
            message: {
              id: 0
            }
          });//选中白板
        }
      } else {
        if (this.props.fileOption == 'coursePrivateFiles' && fileList.length == 0) {
          TkGlobal.hasPrivateFile = false;
          eventObjectDefine.CoreController.dispatchEvent({
            type: "openCourseChange",
            message: {
              id: 0
            }
          });//选中白板
        } else if (this.props.fileOption == 'coursePrivateFiles' && fileList.length > 0) {
          TkGlobal.hasPrivateFile = true;
        }
      }
    }
    this.recoveryList = [].concat(fileList);
    this.setState(() => {
      return {
        fileList: [].concat(fileList)
      }
    });
  }

  receiveWhiteboardSDKAction(receiveEvent) {
    const { action, cmd } = receiveEvent.message;
    const { fileOption } = this.props;
    switch (action) {
      case "viewStateUpdate":
        const { viewState } = cmd;
        const { fileid, page } = viewState;
        let { file, fileList } = this.getFiles(fileid, page);
        if (file) {
          this.setState(() => {
            return {
              fileList,
            }
          })
          if (fileid !== this.state.selectedFileID) {
            // if (this.state.autoFileRefresh && file.filetype !== "mp3" && file.filetype !== "mp4") {
            if (file.filetype !== "mp3" && file.filetype !== "mp4") {
              this.defaultFileInfo = undefined;
            }

            if ((file.filetype === "mp3" || file.filetype === "mp4") && this.state.selectedFileID !== fileid) {
              return;
            }

            TkGlobal.defaultFileInfo = file;
            this.setState(() => {
              return {
                autoFileRefresh: false
              }
            });
            eventObjectDefine.CoreController.dispatchEvent({
              type: "openCourseChange"
            }); //关闭课件库事件
          }
        }
        break;
      case "mediaPlayerNotice":
        let mediaId = cmd.fileid;
        if (cmd.type === 'play') {
          if (this.getFiles(mediaId).file) {
            this.defaultFileInfo = TkGlobal.defaultFileInfo;
            TkGlobal.defaultFileInfo = this.getFiles(mediaId).file;
            eventObjectDefine.CoreController.dispatchEvent({
              type: "openCourseChange"
            }); // 关闭课件库事件
          } else {
            this.defaultFileInfo = undefined;
          }

        } else if (cmd.type === 'end') {
          if (HistoryFileId.course) {
            eventObjectDefine.CoreController.dispatchEvent({
              type: "openCourseChange",
              message: {
                id: HistoryFileId.course
              }
            });
          } else {
            eventObjectDefine.CoreController.dispatchEvent({
              type: "openCourseChange",
              message: {
                id: 0
              }
            });
          }
        } else if (cmd.type !== 'start') {
          if (this.defaultFileInfo) {
            TkGlobal.defaultFileInfo = this.defaultFileInfo;
            eventObjectDefine.CoreController.dispatchEvent({
              type: "openCourseChange"
            }); // 关闭课件库事件
          }
        }
        break;
    }
  }

  getFiles(fileid, page = {}) {
    let file = null;

    const fileList = [].concat(this.state.fileList).map(item => {
      if (item.fileid == fileid) {
        file = item;
        if (page.totalPage && item.pagenum !== page.totalPage) {
          item.pagenum = page.totalPage;
        }
        if (page.currentPage && item.currpage !== page.currentPage) {
          item.currpage = page.currentPage;
        }
      }
      return item;
    });
    if (fileid == 0) {
      file = FileItemEvent.addWhiteBoardInfo()
    }
    return {
      file,
      fileList
    };
  }

  // 更新眼睛状态  没有传参就用TkGlobal中的值
  openCourseChange(receiveEventData) {
    const id = receiveEventData.message && receiveEventData.message.id;
    if ((id == 0 || id) && this.getFiles(id)) {
      const file = this.getFiles(id).file
      FileItemEvent.openDocuemnt(file)
    }
    const selectedFileID = id || TkGlobal.defaultFileInfo.fileid;
    this.setState(() => {
      return {
        selectedFileID
      }
    });
  }

  _handleFileSort({ fileSortType, isAec }) {
    const fileList = this.state.fileList;
    const sortFileList = FileListEvent._sortFileList(fileList, {
      fileSortType,
      isAec
    });
    this.setState(() => {
      return {
        fileList: sortFileList
      }
    });
  }

  _handleFileSearch({ searchText }) {
    if (searchText) {
      const searchFileList = FileListEvent._filterFileBySearch(
        [].concat(this.recoveryList),
        searchText
      );
      this.setState(() => {
        return {
          fileList: searchFileList
        }
      });
    } else {
      this.setState(() => {
        return {
          fileList: [].concat(this.recoveryList)
        }
      });
    }
  }

  render() {
    const { fileList, selectedFileID, isOnlyAudioRoom } = this.state;
    return (
      <React.Fragment>
        {fileList.map(file => (
          <FileItem
            fileID={selectedFileID}
            pub={this.props.fileOption}
            key={file.fileid}
            file={file}
            isOnlyAudioRoom={isOnlyAudioRoom}
          />
        ))}
      </React.Fragment>
    );
  }
}

/**
 * @param { Component } FileListComponent
 * @param { mediaPublicFiles, mediaPrivateFiles, coursePublicFiles, coursePrivateFiles } fileOption
 */
function withFileListfilter(WrapperComponent, fileOption) {
    // console.error(fileOption);
  return class FileListfilter extends React.PureComponent {
    render() {
      return <WrapperComponent fileOption={fileOption} {...this.props} />;
    }
  };
}

const CoursePrivateFileList = withFileListfilter(FileList, "coursePrivateFiles");
const CoursePublicFileList = withFileListfilter(FileList, "coursePublicFiles");
const MediaPublicFileList = withFileListfilter(FileList, "mediaPublicFiles");
const MediaPrivateFileList = withFileListfilter(FileList, "mediaPrivateFiles");

class CourseLibrary extends React.Component {
  constructor() {
    super();
    this.state = {
      classSwitch: true,
      pubSwitch: false,
      showProgress: false,
      fileProgressArray: []
    };
  }

  openClassFile() {
    this.setState(() => {
      return {
        classSwitch: !this.state.classSwitch
      }
    });
  }
  openPubFile() {
    this.setState(() => {
      return {
        pubSwitch: !this.state.pubSwitch
      }
    });
  }

  uploadSuccess(id) {
    const timer = setTimeout(() => {
      this.setState(() => {
        return {
          showProgress: false
        }
      });
      this.props.clickDisable();
      clearTimeout(timer)
    }, 500)
    this._uploadCallbackFilter(id);
  }

  uploadCancel(id) {
    const timer = setTimeout(() => {
      this.setState({
        showProgress: false
      });
      this.props.clickDisable();
      clearTimeout(timer)
    }, 2000)
    this._uploadCallbackFilter(id);
  }

  // 课件上传成功后回调  从等待队列(fileProgressArray)中踢出  现在没有用
  _uploadCallbackFilter(id) {
    const fileList = this.state.fileProgressArray.filter(fileItem => {
      return Object.keys(fileItem) != id;
    });
    this.setState(() => {
      return {
        fileProgressArray: fileList
      }
    });
  }

  uploadFile(formData, filename, filetype, id) {
    this.setState(() => {
      return {
        showProgress: true
      }
    });
    this.props.clickEffect(false);
    if (!this.state.fileProgressArray[id]) {
      const newUploadInfo = [{ [id]: [formData, filename, filetype] }];
      this.setState(() => {
        return {
          fileProgressArray: newUploadInfo.concat(this.state.fileProgressArray)
        }
      });
    }
  }

  render() {
    const classification = TkConstant.joinRoomInfo.isDocumentClassification;
    const uploadHandler = () => {
      return {
        uploadSuccess: this.uploadSuccess.bind(this),
        uploadCancel: this.uploadCancel.bind(this),
        uploadFile: this.uploadFile.bind(this)
      };
    };
    const {
      fileProgressArray,
      classSwitch,
      pubSwitch,
      showProgress
    } = this.state;
    return (
      <div className={"fileContainer"}>
        {classification ? (
          <React.Fragment>
            <div
              onClick={this.openClassFile.bind(this)}
              className={"classification"}
            >
              {
                TkGlobal.language.languageData.toolContainer.toolIcon
                  .classFolder.title
              }
              <span className={"arrow" + (classSwitch ? " on" : " ")} />
            </div>
            <div style={{ display: classSwitch ? "block" : "none" }}>
              <span style={{ display: showProgress ? "block" : "none" }}>
                <FileProgressBar {...uploadHandler()} {...this.props} />
              </span>
              {/* {fileProgressArray.map(progress => {
                <FileProgressBar {...uploadHandler()} {...this.props} />
              })} */}
              <WhiteBoardFile {...this.props} />
              <CoursePrivateFileList {...this.props} />
            </div>
            <div
              onClick={this.openPubFile.bind(this)}
              className={"classification"}
            >
              {
                TkGlobal.language.languageData.toolContainer.toolIcon
                  .adminFolders.title
              }
              <span className={"arrow" + (pubSwitch ? " on" : " ")} />
            </div>
            <div style={{ display: pubSwitch ? "block" : "none" }}>
              <CoursePublicFileList {...this.props} />
            </div>
          </React.Fragment>
        ) : (
            <React.Fragment>
              <span style={{ display: showProgress ? "block" : "none" }}>
                <FileProgressBar {...uploadHandler()} {...this.props} />
              </span>
              {/* {fileProgressArray.map(progress => {
              <FileProgressBar {...uploadHandler()} {...this.props} />
            })} */}
              <WhiteBoardFile {...this.props} />
              <CoursePrivateFileList {...this.props} />
              <CoursePublicFileList {...this.props} />
            </React.Fragment>
          )}
      </div>
    );
  }
}

class MediaLibrary extends React.Component {
  constructor() {
    super();
    this.state = {
      classSwitch: true,
      pubSwitch: false,
      showProgress: false,
      fileProgressArray: []
    };
  }
  openClassFile() {
    this.setState(() => {
      return {
        classSwitch: !this.state.classSwitch
      }
    });
  }
  openPubFile() {
    this.setState(() => {
      return {
        pubSwitch: !this.state.pubSwitch
      }
    });
  }

  uploadSuccess(id) {
    const timer = setTimeout(() => {
      this.setState({
        showProgress: false
      });
      this.props.clickDisable();
      clearTimeout(timer)
    }, 500)
    this._uploadCallbackFilter(id);
    // eventObjectDefine.CoreController.dispatchEvent({ type: "openCourseChange" });
  }

  uploadCancel(id) {
    const timer = setTimeout(() => {
      this.setState({
        showProgress: false
      });
      this.props.clickDisable();
      clearTimeout(timer)
    }, 2000)
    this._uploadCallbackFilter(id);
  }

  _uploadCallbackFilter(id) {
    const fileList = this.state.fileProgressArray.filter(fileItem => {
      return Object.keys(fileItem) != id;
    });
    this.setState(() => {
      return {
        fileProgressArray: fileList
      }
    });
    this.props.clickDisable();
  }

  uploadFile(formData, filename, filetype, id) {
    this.setState(() => {
      return {
        showProgress: true
      }
    });
    this.props.clickEffect(true);
    if (!this.state.fileProgressArray[id]) {
      const newUploadInfo = [{ id: [formData, filename, filetype] }];
      this.setState(() => {
        return {
          fileProgressArray: newUploadInfo.concat(this.state.fileProgressArray)
        }
      });
    }
  }

  render() {
    const classification = TkConstant.joinRoomInfo.isDocumentClassification;
    const uploadHandler = () => {
      return {
        uploadSuccess: this.uploadSuccess.bind(this),
        uploadCancel: this.uploadCancel.bind(this),
        uploadFile: this.uploadFile.bind(this)
      };
    };
    const {
      fileProgressArray,
      classSwitch,
      pubSwitch,
      showProgress
    } = this.state;
    return (
      <div className={"fileContainer media"}>
        {classification ? (
          <React.Fragment>
            <div
              onClick={this.openClassFile.bind(this)}
              className={"classification"}
            >
              {
                TkGlobal.language.languageData.toolContainer.toolIcon
                  .classFolder.title
              }
              <span className={"arrow" + (classSwitch ? " on" : " ")} />
            </div>
            <div style={{ display: classSwitch ? "block" : "none" }}>
              <span style={{ display: showProgress ? "block" : "none" }}>
                <FileProgressBar {...uploadHandler()} {...this.props} />
              </span>
              <MediaPrivateFileList {...this.props} />
            </div>
            <div
              onClick={this.openPubFile.bind(this)}
              className={"classification"}
            >
              {
                TkGlobal.language.languageData.toolContainer.toolIcon
                  .adminFolders.title
              }
              <span className={"arrow" + (pubSwitch ? " on" : " ")} />
            </div>
            <div style={{ display: pubSwitch ? "block" : "none" }}>
              <MediaPublicFileList {...this.props} />
            </div>
          </React.Fragment>
        ) : (
            <React.Fragment>
              <span style={{ display: showProgress ? "block" : "none" }}>
                <FileProgressBar {...uploadHandler()} {...this.props} />
              </span>
              <MediaPrivateFileList {...this.props} />
              <MediaPublicFileList {...this.props} />
            </React.Fragment>
          )}
      </div>
    );
  }
}

export { CourseLibrary, MediaLibrary };
