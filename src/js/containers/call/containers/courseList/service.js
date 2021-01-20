import utils from "./utils";
import TkGlobal from "TkGlobal";
import ServiceTooltip from "ServiceTooltip";
import ServiceRoom from "ServiceRoom";
import TkConstant from "TkConstant";
import eventObjectDefine from "eventObjectDefine";
let HistoryFileId = { 
  media: '',
  course: ''
}

const FileItemEvent = {
  /*删除文档*/
  deleteDocuemnt: function(fileid, event) {
    if (TkGlobal.isLeaveRoom) {
      return;
    }
    if (event) {
      if (event.stopPropagation) {
        event.stopPropagation();
      } else {
        event.cancelBubble = true;
      }
    }
    ServiceTooltip.showConfirm(
      TkGlobal.language.languageData.alertWin.call.fun.deleteCourseFile.isDel,
      function(answer) {
        if (answer) {
          // 如果当前删除的在展示列表的  就将其清除
          Object.keys(HistoryFileId).map(item=> {
            if (HistoryFileId[item] == fileid) {
              HistoryFileId[item] = ''
            }
          })
          //调用删除文件web接口，向php发送删除信息
          ServiceRoom.getTkRoom().deleteFile(fileid, function(
            code,
            response_json
          ) {
            if (code === 0 && response_json) {
              //底层自动发送删除的DocumentChange信令
              eventObjectDefine.CoreController.dispatchEvent({
                type: "fileListEvent",
                message: { delId: fileid }
              });
            } else {
              //显示错误信息
              ServiceTooltip.showError(
                TkGlobal.language.languageData.alertWin.call.fun
                  .deleteCourseFile.fileDelete.failure.text
              );
            }
          });
        }
      }
    );
  },

  /*打开文档*/
  openDocuemnt: function(file, event) {
    if (event) {
      if (event.stopPropagation) {
        event.stopPropagation();
      } else {
        event.cancelBubble = true;
      }
    }
    if (file) {
      if (TkGlobal.playMediaFileing) {
        ServiceRoom.getTkRoom().stopShareMedia();
        ServiceRoom.getTkRoom().stopShareLocalMedia();
      }

      // 更新打开的展示列表的文件id
      if (file.filetype !== "mp3" && file.filetype !== "mp4") HistoryFileId.course = file.fileid
      else HistoryFileId.media = file.fileid

      ServiceRoom.getTkWhiteBoardManager().changeDocument(
        file.fileid,
        file.currpage
      );
    }
  },
  
  /*取消文件上傳*/
  cancelFileUpload: function(tmpFileid, AJAXCancel) {
    if (
      AJAXCancel &&
      AJAXCancel.abort &&
      typeof AJAXCancel.abort === "function"
    ) {
      AJAXCancel.abort();
    }
    let tempFileDomDesc = { ...this.state.tempfileList };
    tempFileDomDesc[tmpFileid] = null;
    let newDeleteFileList = { ...this.state.fileList };
    delete newDeleteFileList[tmpFileid];
    this.setState({
      tempfileList: tempFileDomDesc,
      fileList: newDeleteFileList
    });
  },

  /**上传失败错误码 */
  fileUploadErrorCode: function(code) {
    const failureText = {
      "-1":
        TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile
          .fileUpload.failureNegativeOne.text,
      "-2":
        TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile
          .fileUpload.failureNegativeTwo.text,
      "-3":
        TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile
          .fileUpload.failureNegativeThree.text,
      "-4":
        TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile
          .fileUpload.failureNegativeFour.text,
      "-5":
        TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile
          .fileUpload.failureNegativeTwo.text +
        TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile
          .fileUpload.failureCode.text +
        code,
      "-6":
        TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile
          .fileUpload.failureNegativeTwo.text +
        TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile
          .fileUpload.failureCode.text +
        code,
      "-7":
        TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile
          .fileUpload.failureNegativeSeven.text,
      "-8":
        TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile
          .fileUpload.failureNegativeEight.text,
      "-10":
        TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile
          .fileUpload.failureNegativeTen.text,
      "3":
        TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile
          .fileUpload.failureFhree.text,
      "4":
        TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile
          .fileUpload.failureFour.text
    };
    const text = failureText[String(code)]
      ? failureText[String(code)]
      : TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile
          .fileUpload.failureNegativeTwo.text;
    return text;
  },

  /**加白板信息 */
  addWhiteBoardInfo: function(files) {
    let whiteBoardInfo = {
      fileid: 0,
      companyid: "",
      filename: TkGlobal.language.languageData.toolContainer.toolIcon.whiteBoard.title,
      uploadusername: "",
      downloadpath: "",
      swfpath: "",
      isContentDocument: false,
      filetype: "whiteboard",
      currpage: 1,
      pagenum: 1,
      dynamicppt: 0,
      filecategory: 0, //0:课堂 ， 1：系统
      fileprop: 0 //0：普通文档 ， 1-2：动态ppt(1-旧版，2-新版) ， 3：h5文档
    };
    // if (utils.isArray(files)) {
    //   files.push(whiteBoardInfo);
    // }
    return whiteBoardInfo;
  }
};

const FileEventObserver = {
  handlerRoomAddFile: function(receiveEventData) {
    const { fileid, fromID } = receiveEventData.message;
    const fileinfo =
      ServiceRoom.getTkRoom().getFileinfo &&
      ServiceRoom.getTkRoom().getFileinfo(fileid);
    return fileinfo;
  },

  handlerRoomDeleteFile: function(receiveEventData) {
    let { fileid, fromID } = receiveEventData.message;
    return { fileid, fromID }
  }
};

const FileListEvent = {
  /*过滤列表种类*/
  _filterList: function(files) {
    let mediaPublicFiles = [];
    let mediaPrivateFiles = [];
    let coursePublicFiles = [];
    let coursePrivateFiles = []
    files.map(fileInfo => {
      if (fileInfo.filetype === "mp3" || fileInfo.filetype === "mp4") {
        if (fileInfo.filecategory) {
          mediaPublicFiles.push(fileInfo); // 公共媒体
        } else {
          mediaPrivateFiles.push(fileInfo); // 课堂媒体
        }
      } else {
        if (fileInfo.filecategory) {
          coursePublicFiles.push(fileInfo); // 公共课件
        } else {
          coursePrivateFiles.push(fileInfo); // 课堂课件
        }
      }
    });
    return {
      mediaPublicFiles: mediaPublicFiles,
      mediaPrivateFiles: mediaPrivateFiles,
      coursePublicFiles: coursePublicFiles,
      coursePrivateFiles: coursePrivateFiles
    };
  },

  /*过滤搜索内容*/
  _filterFileBySearch: function(fileArr, searchText) {
    let filterArr = [];
    if (searchText) {
      for (let file of fileArr) {
        if (file.filename.indexOf(searchText.replace(/&nbsp;/g, " ")) != -1) {
          filterArr.push(file);
        }
      }
    } else {
      filterArr = fileArr;
    }
    return filterArr;
  },

  /*文件列表排序*/
  _sortFileList: function(fileArr, { fileSortType, isAec }) {
    let whiteboardFileinfo = undefined;
    fileArr = JSON.parse(JSON.stringify(fileArr))
    if (!utils.isArray(fileArr)) {
      return;
    }
    if (fileArr.length && fileArr[0] && fileArr[0].fileid != 0) {
      for (let i = 0, length = fileArr.length; i < length; i++) {
        let file = fileArr[i];
        if (file && file.fileid == 0) {
          whiteboardFileinfo = file;
          fileArr.splice(i, 1);
          break;
        }
      }
    }
    fileArr.sort((obj1, obj2) => {
      if (
        obj1 === undefined ||
        obj2 === undefined ||
        !obj1.hasOwnProperty(fileSortType) ||
        !obj2.hasOwnProperty(fileSortType)
      ) {
        return 0;
      }
      if (obj1.fileid == 0 || obj2.fileid == 0) {
        // return -1 ;
        return obj1 - obj2; //  由于再谷歌浏览器71版本中  直接返回-1 会导致乱序，所以暂时改成这个   zx 2018/9/26
      }
      let obj1Value = obj1[fileSortType];
      let obj2Value = obj2[fileSortType];
      if (fileSortType === "fileid") {
        obj1Value = Number(obj1Value);
        obj2Value = Number(obj2Value);
      }
      let isAecValue = isAec ? 1 : -1;
      if (obj1Value > obj2Value) {
        return 1 * isAecValue;
      } else if (obj1Value < obj2Value) {
        return -1 * isAecValue;
      } else {
        return 0;
      }
    });
    if (whiteboardFileinfo) {
      fileArr.unshift(whiteboardFileinfo);
    }
    return fileArr;
  },

  /*获取过滤文本以及排序后文件数组*/
  _getFilterAndSortFileArr: function(
    fileArr,
    searchText,
    { fileSortType, isAec }
  ) {
    let filterArr = this._filterFileBySearch(fileArr, searchText);
    return this._sortFileList(filterArr, { fileSortType, isAec });
  },

  /*打开默认文档*/
  _openDefaultDocument: function() {
    let fileId = TkGlobal.defaultFileInfo.fileid;
    let file = this.state.fileList[fileId];
    if (file) {
      ServiceRoom.getTkWhiteBoardManager().changeDocument(
        TkGlobal.defaultFileInfo.fileid,
        file.currpage
      );
    }
  },

  /*初始化文档的默认状态*/
  _initDocumentDefaultState: function() {
    let fileList = { ...this.state.fileList };
    for (let file of Object.values(fileList)) {
      if (file.fileid == 0) {
        ServiceRoom.getTkWhiteBoardManager().resetPureWhiteboardTotalPage();
      }
      file.currpage = 1;
    }
    this.setState({
      fileList: fileList
    });
  }
};

export { FileItemEvent, FileListEvent, FileEventObserver, HistoryFileId };
