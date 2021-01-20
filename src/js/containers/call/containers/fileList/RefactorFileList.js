/**
 * 文件列表的的Smart组件
 * @module FileListSmart
 * @description   普通文件列表的Smart组件,处理普通文件列表的业务
 * @author qiugs
 * @date 2018/05/21
 */

'use strict';
import React from 'react';
import TkConstant from 'TkConstant';
import TkGlobal from 'TkGlobal';
import TkUtils from 'TkUtils';
import ServiceRoom from 'ServiceRoom';
import ServiceTooltip from 'ServiceTooltip';
import ServiceTools from 'ServiceTools';
import CoreController from 'CoreController';
import eventObjectDefine from 'eventObjectDefine';
import UploadFileFrom from 'UploadFileFrom';
import FileListDumb from '@/fileList';
import FileProgressBar from "./fileProgressBar";

class FileListSmart extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            commonAccept:TkConstant.FILETYPE.documentFileListAccpet,
            mediaAccept:TkConstant.FILETYPE.mediaFileListAccpet,
            h5DocumentAccept:TkConstant.FILETYPE.h5DocumentFileListAccpet,
            isSelectUploadH5Document:false,
            updateState:false ,
            fileid: this.props.isMediaUI ? undefined : 0 , //正在打开的文件id
            fileList:{} , //文件列表
            tempfileList:{} , // 臨時文件列表
            uploadFileFromFlag: 0  ,  //上传文件的flag
            fileSortType:'fileid' , //排序类型 , fileid / filetype / filename
            isAec:false , //是否升序
            searchText:'' , //搜索内容
            filecategory:-1 , //显示的文件分类 ，-1:不区分文件类型 ， 0:课堂文件 ， 1：系统文件
        };
        this.AJAXCancel=null;
        this.listernerBackupid = new Date().getTime()+'_'+Math.random() ;
    };

    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomFiles , this.handlerRoomFiles.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomAddFile , this.handlerRoomAddFile.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomDeleteFile , this.handlerRoomDeleteFile.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomPubmsg , this.handlerRoomPubmsg.bind(this), this.listernerBackupid); //roomPubmsg事件
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomDelmsg , this.handlerRoomDelmsg.bind(this), this.listernerBackupid); //roomDelmsg事件 下课事件 classBegin
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomConnected, this.handlerRoomConnected.bind(this), this.listernerBackupid); //
         eventObjectDefine.CoreController.addEventListener( "receiveWhiteboardSDKAction" , this.receiveWhiteboardSDKAction.bind(this), this.listernerBackupid);
    
        this._initFileList();
    };

    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        eventObjectDefine.CoreController.removeBackupListerner(this.listernerBackupid );
    };

    handlerRoomFiles( receiveEventData ){
        let filterFiles =  this._filterFiles( receiveEventData.message ) ;
        this._initFileList();
        this.setState({
            fileList: { ...this.state.fileList , ... filterFiles }
        });
    };

    handlerRoomAddFile( receiveEventData ){
        let { fileid , fromID } = receiveEventData.message ;
        let fileinfo = ServiceRoom.getTkRoom().getFileinfo && ServiceRoom.getTkRoom().getFileinfo( fileid );
        if( fileinfo ){ 
            let addFilterFiles =  this._filterFiles( [ fileinfo ] ) ;
            this.setState({
                fileList: { ...this.state.fileList , ... addFilterFiles }
            });
        }
        if(  fromID === ServiceRoom.getTkRoom().getMySelf().id ){
            if(!this.props.isMediaUI){
                let file = this.state.fileList[ fileid ];
                if( file ){
                    ServiceRoom.getTkWhiteBoardManager().changeDocument( fileid , file.currpage );
                }
            }
        }
    }

    receiveWhiteboardSDKAction(receiveEvent){
        let { action , cmd  } = receiveEvent.message ;
        switch ( action ){
            case 'viewStateUpdate':
                if(!this.props.isMediaUI){
                    let { viewState } = cmd;
                    let { fileid , page} = viewState;
                    let fileListCopy = {...this.state.fileList};
                    if(fileListCopy[fileid]  && fileListCopy[fileid].pagenum !==  page.totalPage){
                        fileListCopy[fileid].pagenum = page.totalPage;
                        this.setState({
                            fileList:fileListCopy
                        })
                    }

                    if(fileListCopy[fileid]  && fileListCopy[fileid].currpage !== page.currentPage){
                        fileListCopy[fileid].currpage = page.currentPage;
                        this.setState({
                            fileList:fileListCopy
                        })
                    }
                    if( fileid !== this.state.fileid ){
                        this.setState({
                            fileid:fileid
                        });
                    }
                }
                break;
            case 'mediaPlayerNotice':
                if( this.props.isMediaUI ){
                    let { type , streamType , fileid } = cmd ;
                    if(streamType === 'file' || cmd.isDynamicPptVideo){
                        if(cmd.playerType==="videoPlayer"){
                            switch ( type ){
                                case 'start':
                                    TkGlobal.playMediaFileing=true;
                                    break;
                                case 'end':
                                case 'startShareMediaFail':
                                case 'subscribeShareMediaFail':
                                    TkGlobal.playMediaFileing=false;
                                    break;
                            }
                        }
                        this.setState({
                            fileid:undefined
                        })
                    }else if( streamType === 'media' ){
                        switch ( type ){
                            case 'start':
                                if(cmd.playerType==="videoPlayer"){
                                    TkGlobal.playMediaFileing=true;
                                }
                                this.setState({
                                    fileid:fileid
                                });
                                break;
                            case 'end':
                            case 'startShareMediaFail':
                            case 'subscribeShareMediaFail':
                                if(cmd.playerType==="videoPlayer"){
                                    TkGlobal.playMediaFileing=false;
                                }
                                this.setState({
                                    fileid:undefined
                                });
                                break;
                        }
                    }
                }
                break;
        }

    }

    handlerRoomDeleteFile( receiveEventData ){
        let { fileid , fromID } = receiveEventData.message ;
        if( !this.props.isMediaUI ){
            let openFileId = undefined ;
            let filterSortFileArr = this._getFilterAndSortFileArr( '' ) ;
            for( let index = 0 , length = filterSortFileArr.length ;  index < length ; index++ ){
                if( fileid == filterSortFileArr[index].fileid ){ //删除的课件是正在打开的，则切换文档
                    if( index < length -1 ){ //不是列表的最后一个
                        let file = filterSortFileArr[index+1] ;
                        if( file ){
                            openFileId = file.fileid ;
                        }else{
                            openFileId = 0 ;
                        }
                    }else if( index > 0) {
                        let file = filterSortFileArr[index-1] ;
                        if( file ){
                            openFileId = file.fileid ;
                        }else{
                            openFileId = 0 ;
                        }
                    }else{
                        openFileId = 0 ;
                    }
                    break ;
                }
            }
            if(TkGlobal.classBegin){
                if( fileid == this.state.fileid && fromID === ServiceRoom.getTkRoom().getMySelf().id ){ //删除的是当前打开的文件且是自己删除的
                    if( openFileId !== undefined && this.state.fileList[openFileId] ){
                        ServiceRoom.getTkWhiteBoardManager().changeDocument( openFileId ,  this.state.fileList[openFileId].currpage );
                    }
                }
            }else{
                if( fileid == this.state.fileid ){
                    if( openFileId !== undefined && this.state.fileList[openFileId] ){
                        ServiceRoom.getTkWhiteBoardManager().changeDocument( openFileId ,  this.state.fileList[openFileId].currpage );
                    }
                }
            }
            if(!this.props.isMediaUI && fileid === TkGlobal.defaultFileInfo.fileid){     //删除的是默认文档的情况
                if( openFileId !== undefined && this.state.fileList[openFileId] ){
                    TkGlobal.defaultFileInfo = {...this.state.fileList[openFileId]} ;
                }
            }

        }else{
            if( fileid == this.state.fileid && fromID === ServiceRoom.getTkRoom().getMySelf().id ){ //删除的是当前打开的文件且是自己删除的
                ServiceTools.stopAllMediaShare();
            }
        }

        let fileListCopy = {...this.state.fileList} ;
        if( fileListCopy[fileid] ){
            fileListCopy[fileid] = undefined ;
            delete fileListCopy[fileid] ;
        }
        this.setState({
            fileList: fileListCopy
        });
    }

    handlerRoomPubmsg(recvEventData){
        let pubmsgData = recvEventData.message ;
        switch(pubmsgData.name)
        {
            case "OnlyAudioRoom":
               this.setState({
                   updateState:!this.state.updateState
               });
                break;
            case "ClassBegin":{
                if(!this.props.isMediaUI){ //不是媒体文件列表，收到在教室里的上课信令后，因为上课信令只能是老师发送，所以此处判断是老师就同步当前打开的文档，在msglist如果没有收到ShowPage信令，则会打开默认文档
                    if( TkConstant.hasRole.roleChairman ){
                        this.openDocuemnt( this.state.fileid );
                    }
                }
                break;
            }
        }
    };

    handlerRoomDelmsg(recvEventData){
        let delmsgData = recvEventData.message ;
        switch(delmsgData.name) {
            case "ClassBegin":
                if( !TkConstant.joinRoomInfo.isClassOverNotLeave && CoreController.handler.getAppPermissions('endClassbeginRevertToStartupLayout') ) { //是否拥有下课重置界面权限
                    if( !this.props.isMediaUI ){
                        this._initDocumentDefaultState();
                        this._openDefaultDocument();
                    }
                }else if( TkConstant.joinRoomInfo.isClassOverNotLeave ){
                    this._initDocumentDefaultState();
                }
                break;
            case "OnlyAudioRoom":
                this.setState({
                    updateState:!this.state.updateState
                });
                break;
        }
    }

    handlerRoomConnected(){
        if(TkConstant.joinRoomInfo.isDocumentClassification){
            this.setState({
                filecategory:0
            })
        }
    }

    /*根据配置项筛选文件*/
    clickOptionFile(type){
        this.setState({
            filecategory:type
        })
    }

    /*打开文档*/
    openDocuemnt( fileid ,event){
        if(event){
            if(event.stopPropagation){
                event.stopPropagation();
            }else{
                event.cancelBubble=true;
            }
        }
        
        let file = this.state.fileList[fileid] ;
        if( file ){
            if(!this.props.isMediaUI && TkGlobal.playMediaFileing){
                ServiceRoom.getTkRoom().stopShareMedia();
                ServiceRoom.getTkRoom().stopShareLocalMedia();
            }
            ServiceRoom.getTkWhiteBoardManager().changeDocument( fileid , file.currpage ) ;
        }
        eventObjectDefine.CoreController.dispatchEvent({type:'CloseLibrary'});//关闭课件库事件
    }

    /*删除文档*/
    deleteDocuemnt( fileid ,event ){
    
        if(TkGlobal.isLeaveRoom){
            return;
        }
        if(event){
            if(event.stopPropagation){
                event.stopPropagation();
            }else{
                event.cancelBubble=true;
            }
        }
        ServiceTooltip.showConfirm(TkGlobal.language.languageData.alertWin.call.fun.deleteCourseFile.isDel , function (answer) {
            if(answer){
                //调用删除文件web接口，向php发送删除信息
                ServiceRoom.getTkRoom().deleteFile(fileid, function (code ,response_json ) {
                    if(code === 0  && response_json){
                        //底层自动发送删除的DocumentChange信令
                    }else{
                        //显示错误信息
                        ServiceTooltip.showError(TkGlobal.language.languageData.alertWin.call.fun.deleteCourseFile.fileDelete.failure.text);
                    }
                });
            }
        });
    }

    /*上传文件*/
    uploadFile( isH5 ){
        if(TkGlobal.isLeaveRoom){
            return;
        }
        if( isH5){
            this.isSelectUploadH5Document = true ;
        }else{
            this.isSelectUploadH5Document = false ;
        }
        this.setState({
            uploadFileFromFlag:this.state.uploadFileFromFlag+1
        })
    }
    /*上传文件*/
    uploadForm(formData,filename,filetype){
        if(TkGlobal.isLeaveRoom){
            return;
        }
        const that = this ;
        let AJAXCancel = null;
        let tmpFileid = new Date().getTime();

        let isH5Document = false;
        if(filename.indexOf(".zip")>0 ){
            isH5Document = true;
        }
        this.isSelectUploadH5Document = false ;
        let fileinfoObj = {
            companyid:TkConstant.joinRoomInfo.companyid,
            downloadpath:'',
            dynamicppt:0,
            filecategory:0,
            fileid:tmpFileid,
            filename:filename,
            fileprop:isH5Document?3:0,
            filetype:filetype,
            pagenum:1,
            swfpath:'',
            uploaduserid:ServiceRoom.getTkRoom().getMySelf().id,
            uploadusername:ServiceRoom.getTkRoom().getMySelf().nickname,
        };
         let percent = 0 ;
         let currProgressText = percent+'%';
         let addFilterFiles =  this._filterFiles( [ fileinfoObj ] ) ;
         let tempFileDomDesc = {};
         tempFileDomDesc[tmpFileid] = {
            children: <FileProgressBar id={"fileProgressBar_"+tmpFileid} currProgressWidth={percent} currProgressText={currProgressText} progressBarDisabled={true} cancelFileUpload={that.cancelFileUpload.bind(that  , tmpFileid ,AJAXCancel )} cancelBtnShow={true} />
        };
         this.setState({
             fileList: { ...this.state.fileList , ... addFilterFiles },
             tempfileList:{...this.state.tempfileList , ...tempFileDomDesc }
         });
        AJAXCancel = ServiceRoom.getTkRoom().uploadFile(formData, (code,res)=> {
            if(code === 0){
                tempFileDomDesc[tmpFileid] = null ;
                let newDeleteFileList = {...this.state.fileList};
                delete newDeleteFileList[tmpFileid];
                this.setState({
                    fileList:newDeleteFileList,
                });
            }else{
                 percent = 100 ;
                 currProgressText = '' ;
                let faukureText = TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile.fileUpload.failureNegativeTwo.text;
                switch (code){
                    case -1:
                        faukureText = TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile.fileUpload.failureNegativeOne.text ;
                        break;
                    case -2:
                        faukureText = TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile.fileUpload.failureNegativeTwo.text ;
                        break;
                    case -3:
                        faukureText = TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile.fileUpload.failureNegativeThree.text ;
                        break;
                    case -4:
                        faukureText = TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile.fileUpload.failureNegativeFour.text ;
                        break;
                    case -5:
                        faukureText = TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile.fileUpload.failureNegativeTwo.text + TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile.fileUpload.failureCode.text +code;
                        break;
                    case -6:
                        faukureText = TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile.fileUpload.failureNegativeTwo.text + TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile.fileUpload.failureCode.text + code;
                        break;
                    case -7:
                        faukureText = TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile.fileUpload.failureNegativeSeven.text ;
                        break;
                    case -8:
                        faukureText = TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile.fileUpload.failureNegativeEight.text ;
                        break;
                    case -10:
                        faukureText = TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile.fileUpload.failureNegativeTen.text ;
                        break;
                    case 3:
                        faukureText = TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile.fileUpload.failureFhree.text ;
                        break;
                    case 4:
                        faukureText = TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile.fileUpload.failureFour.text ;
                        break;
                    default:
                        faukureText = TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile.fileUpload.failureNegativeTwo.text ;
                        break;
                }
                tempFileDomDesc[tmpFileid] = {
                    children: <FileProgressBar id={"fileProgressBar_"+tmpFileid} failureColor={"#fff662"} faukureText={faukureText} currProgressWidth={percent} currProgressText={currProgressText} progressBarDisabled={true} cancelFileUpload={that.cancelFileUpload.bind(that  , tmpFileid , AJAXCancel)} cancelBtnShow={true} />
                };
                this.setState({
                    tempfileList:{...this.state.tempfileList , ...tempFileDomDesc }
                });

                window.setTimeout(()=>{
                    tempFileDomDesc[tmpFileid] = null ;
                    let newDeleteFileList = {...this.state.fileList};
                    delete newDeleteFileList[tmpFileid];
                    this.setState({
                        fileList:newDeleteFileList,
                    });
                },3000)
            }
        },(data,number)=>{
            percent=number;
            currProgressText = percent+'%';
            if(percent >= 100){
                if(!that.props.isMediaUI && filetype!=='mp3'&& filetype !=='mp4' ){
                    currProgressText = TkGlobal.language.languageData.toolContainer.toolIcon.FileConversion.text ;
                }
            }
            tempFileDomDesc[tmpFileid] = {
                children: <FileProgressBar id={"fileProgressBar_"+tmpFileid} currProgressWidth={percent} currProgressText={currProgressText} progressBarDisabled={true} cancelFileUpload={that.cancelFileUpload.bind(that  , tmpFileid ,AJAXCancel)} cancelBtnShow={true} />
            };
            this.setState({
                tempfileList:{...this.state.tempfileList , ...tempFileDomDesc }
            });
        });
    }
    /*取消文件上傳*/
    cancelFileUpload(tmpFileid,AJAXCancel){
        if(AJAXCancel && AJAXCancel.abort && typeof AJAXCancel.abort === 'function'){
            AJAXCancel.abort();
        }
        let tempFileDomDesc = {...this.state.tempfileList};
        tempFileDomDesc[tmpFileid] = null ;
        let newDeleteFileList = {...this.state.fileList};
        delete newDeleteFileList[tmpFileid];
        this.setState({
            tempfileList:tempFileDomDesc,
            fileList:newDeleteFileList,
        })

    }
    fileListSort( sortType,sortState ){
        this.setState({
            fileSortType:sortType,
            isAec:sortState
        })
    }
    fileListSearch( name ){
        this.setState({
            searchText:name
        })
    }
    /*生产白板文件数据*/
    _productionWhiteboardFileinfo(){
        return {
            0:{
                "fileid": 0 ,
                "companyid":'',
                "filename": TkGlobal.language.languageData.toolContainer.toolIcon.whiteBoard.title , //FIXME 此处切换语言需要更新下文本
                "uploaduserid": '' ,
                "uploadusername": '' ,
                "downloadpath":'',
                "swfpath": '',
                "isContentDocument": false,
                "filetype": 'whiteboard' ,
                "currpage": 1 ,
                "pagenum": 1 ,
                "dynamicppt": 0 ,
                "filecategory": 0 , //0:课堂 ， 1：系统
                "fileprop": 0 , //0：普通文档 ， 1-2：动态ppt(1-旧版，2-新版) ， 3：h5文档
            }
        }
    };

    /*过滤所需的文件信息*/
    _filterFiles( fileArr ){
        let filterFileList = {} ;
        for( let file of fileArr ){
            if( this.props.isMediaUI && !( file.filetype === 'mp3' || file.filetype === 'mp4' ) ){ //如果是媒体文件列表，那么不是媒体文件的不不往列表中添加
                continue ;
            }else if( !this.props.isMediaUI && ( file.filetype === 'mp3' || file.filetype === 'mp4' ) ){//如果不是媒体文件列表，那么是媒体文件的不不往列表中添加
                continue ;
            }
            filterFileList[file.fileid] = {
                "fileid": file.fileid ,
                "companyid":  file.companyid,
                "filename":  file.filename ,
                "uploaduserid": file.uploaduserid ,
                "uploadusername": file.uploadusername ,
                "downloadpath": file.downloadpath,
                "swfpath":  file.swfpath ,
                "isContentDocument": file.isContentDocument ,
                "filetype": file.filetype ,
                "currpage":  file.currpage !== undefined ? file.currpage : 1 ,
                "pagenum": file.pagenum ,
                "dynamicppt": file.dynamicppt ,
                "filecategory": file.filecategory , //0:课堂 ， 1：系统
                "fileprop": file.fileprop , //0：普通文档 ， 1-2：动态ppt(1-旧版，2-新版) ， 3：h5文档
            }
        }
        return filterFileList;
    }

    /*文件列表排序*/
    _sortFileList( fileArr ){
        let whiteboardFileinfo = undefined ;
        if( !fileArr || !Array.isArray( fileArr ) ){
            return ;
        }
        if( fileArr.length &&  fileArr[0] && fileArr[0].fileid != 0 ){
            for( let i = 0 , length = fileArr.length ; i < length ; i++ ){
                let file = fileArr[i];
                if( file && file.fileid == 0 ){
                    whiteboardFileinfo = file ;
                    fileArr.splice( i  , 1 );
                    break;
                }
            }
        }

        fileArr.sort((obj1, obj2) =>{

            if ( obj1 === undefined  || obj2 === undefined  || !obj1.hasOwnProperty(this.state.fileSortType)|| !obj2.hasOwnProperty( this.state.fileSortType ) ){
                return 0;
            }
            if( obj1.fileid == 0 || obj2.fileid == 0 ){
                // return -1 ;
                return obj1 - obj2;    //  由于再谷歌浏览器71版本中  直接返回-1 会导致乱序，所以暂时改成这个   zx 2018/9/26
            }

            let obj1Value = obj1[this.state.fileSortType] ;
            let obj2Value = obj2[this.state.fileSortType] ;
            if( this.state.fileSortType === 'fileid' ){
                obj1Value = Number( obj1Value );
                obj2Value = Number( obj2Value );
            }
            let isAecValue = this.state.isAec ? 1 : -1 ;
            if( obj1Value > obj2Value ){
                return 1 * isAecValue;
            }else if( obj1Value < obj2Value ){
                return -1 * isAecValue;
            }else {
                return 0 ;
            }

        });
        if( whiteboardFileinfo ){
            fileArr.unshift( whiteboardFileinfo );
        }
        return fileArr ;
    }

    /*初始化文件列表*/
    _initFileList(){
        if( !this.props.isMediaUI ){
            let whiteboardFileinfo = this._productionWhiteboardFileinfo();
            this.setState({
                fileList: whiteboardFileinfo
            });
        }else{
            this.setState({
                fileList: {}
            });
        }
    }

    /*获取文件列表的react描述*/
    _getFileReactDesc( file){
    
        let active =  file.fileid == this.state.fileid ;
        let isRoleChairmanOrTeachingAssistant = TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant ;
        let isShowDeleteBtn = TkConstant.joinRoomInfo.isDocumentClassification ? ( isRoleChairmanOrTeachingAssistant && file.filecategory == 0 ) : isRoleChairmanOrTeachingAssistant ;
        let children = null;
        if(this.state.tempfileList[file.fileid] && this.state.tempfileList[file.fileid].children) {
            children = this.state.tempfileList[file.fileid].children;
        }
        let fileItemDescInfo =  {
            id:file.fileid,
            active:active ,
            children:children ,
            textContext:file.filename,
            order: file.fileid == 0 ? 2 : 1 , //排序级别,白板级别为2 ，其它文档为1 ， 即白板永远在第一个
            show: !( TkGlobal.isOnlyAudioRoom && file.filetype === 'mp4' ) , //纯音频教室且是视频文件则不显示
            onClick: this.openDocuemnt.bind(this, file.fileid ),
            disabled:TkConstant.hasRole.rolePatrol,
            afterIconArray:[
                {
                    disabled:false,
                    before:true,
                    after:false,
                    show:true ,
                    'className':"disabled tk-icon-before tk-icon-" + TkUtils.getFiletyeByFilesuffix(file.filetype),
                    onClick: undefined,
                } ,
                {
                    disabled:this.state.fileid === file.fileid ? true : false,
                    before:false,
                    after:true,
                    show:true ,
                    'className':file.isMediaFile?('file-list-play-icon '):('file-list-eye-icon '  + ( active ?'on':'off' )),
                    onClick: this.openDocuemnt.bind(this, file.fileid),
                } ,
                {
                    disabled:false,
                    before:false,
                    after:true,
                    show:!(file.fileid == 0) && isShowDeleteBtn,
                    'className':'file-list-delete-icon ' ,
                    onClick: this.deleteDocuemnt.bind(this, file.fileid),
                } ,
            ],
        } ;
        return fileItemDescInfo ;
    }

    /*过滤搜索内容*/
    _filterFileBySearchTextAndFilecategory( fileArr , searchText ){
        let filterArr = [] ;
        for( let file of fileArr ){
            if( this.state.filecategory === -1 ){
                if( searchText ){
                    if( new RegExp(this.state.searchText , 'g').test( file.filename ) ){
                        filterArr.push( file );
                    }

                }else{
                    filterArr.push( file );
                }
            }else{
                if( file.filecategory == this.state.filecategory || file.fileid == 0  ){
                    if( this.state.searchText ){
                        if(file.filename.indexOf(this.state.searchText.replace(/&nbsp;/g , " "))!=-1){
                            filterArr.push( file );
                        }
                    }else{
                        filterArr.push( file );
                    }
                }



            }
        }
        return filterArr;
    }

    /*获取过滤文本以及排序后文件数组*/
    _getFilterAndSortFileArr( searchText ){
        let fileArr = [] ;
        if( this.props.isMediaUI &&  TkGlobal.isOnlyAudioRoom ){
            for( let file of Object.values( this.state.fileList ) ){
                if( file.filetype !== 'mp4'  ){
                    fileArr.push( file );
                }
            }
        }else{

            fileArr = Object.values( this.state.fileList ) ;
        }
        return this._sortFileList( this._filterFileBySearchTextAndFilecategory( fileArr  , searchText ) ) ;
    }

    /*获取文件列表的相关描述*/
    _getFileListDesc(){
        let filterSortFileArr = this._getFilterAndSortFileArr( this.state.searchText ) ; 
        let mp3Num = 0;
        if(this.props.isMediaUI){
            if(this.props.idType === 'media'){
                for (let [key, value] of Object.entries(this.state.fileList)) {
                    if(value.filetype === 'mp3'){
                        mp3Num +=1 ;
                    }
                }
            }
        }
        let titleJson = {
            title:this.props.isMediaUI ? TkGlobal.language.languageData.toolContainer.toolIcon.mediaDocumentList.title : TkGlobal.language.languageData.toolContainer.toolIcon.documentList.title ,
            titleSort: TkGlobal.language.languageData.toolContainer.toolIcon.documentList.titleSort,
            number:TkGlobal.isOnlyAudioRoom&& this.props.isMediaUI ? mp3Num : Object.keys( this.state.fileList ).length ,
        };
        let fileListItemArray = [] ;
        for(let file of filterSortFileArr){
            fileListItemArray.push( this._getFileReactDesc(file) );
        }
        /*let navChildren = TkConstant.joinRoomInfo.isDocumentClassification ?<div className="tk-file-list-container-navChildren ">
            <button className={this.state.filecategory == 0 ?'activeL ':''} onClick={this.clickOptionFile.bind(this,0)}>{TkGlobal.language.languageData.toolContainer.toolIcon.classFolder.title}</button>
            <button className={this.state.filecategory == 1 ?'activeR ':''} onClick={this.clickOptionFile.bind(this,1)}>{TkGlobal.language.languageData.toolContainer.toolIcon.adminFolders.title}</button>
        </div>:null;*/
        let uploadButtonJson = {
            show:TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant,
            buttonText: this.props.isMediaUI ? TkGlobal.language.languageData.toolContainer.toolIcon.mediaDocumentList.button.addCourse.text : TkGlobal.language.languageData.toolContainer.toolIcon.documentList.button.addCourse.text,
            buttonH5Text: TkGlobal.language.languageData.toolContainer.toolIcon.H5DocumentList.button.addCourse.text ,
            buttonTypeSortText: TkGlobal.language.languageData.toolContainer.toolIcon.documentList.button.fileType.text ,
            buttonNameSortText: TkGlobal.language.languageData.toolContainer.toolIcon.documentList.button.fileName.text ,
            buttonTimeSortText: TkGlobal.language.languageData.toolContainer.toolIcon.documentList.button.uploadTime.text ,
            fileListSort:this.fileListSort.bind(this),
            fileListSearch:this.fileListSearch.bind(this)
        };
        return { titleJson , fileListItemJson:fileListItemArray , uploadButtonJson };
    }

    /*初始化文档的默认状态*/
    _initDocumentDefaultState(){
        let fileList = {...this.state.fileList};
        for( let file of Object.values(fileList) ){
            if( file.fileid == 0 ){
                ServiceRoom.getTkWhiteBoardManager().resetPureWhiteboardTotalPage();
            }
            file.currpage = 1 ;
        }
        this.setState({
            fileList:fileList
        });
    }

    /*打开默认文档*/
    _openDefaultDocument(){
        let fileId = TkGlobal.defaultFileInfo.fileid;
        let file = this.state.fileList[ fileId ];
        if( file ){
            ServiceRoom.getTkWhiteBoardManager().changeDocument( TkGlobal.defaultFileInfo.fileid , file.currpage );
        }
    }

    render(){
        const that = this ;
        let accept = undefined ;
        let {show, mediaFileType , styleJson} = this.props ;
        if(!this.props.isMediaUI && that.isSelectUploadH5Document){
            accept = that.state.h5DocumentAccept;
        }else if(this.props.isMediaUI){
            accept = this.state.mediaAccept;
        }else if(!this.props.isMediaUI){
            accept = this.state.commonAccept;
        }
        let filelistData = this._getFileListDesc();
        return (
            <article className="tk-file-list-container " >
                <FileListDumb clickOptionFile={this.clickOptionFile.bind(this)} filecategory={this.state.filecategory} uploadFile={this.uploadFile.bind(this)} isMediaUI = {this.props.isMediaUI} isUploadH5Document={this.props.isUploadH5Document} idType={this.props.idType} show={show} styleJson={styleJson} {...filelistData}  />
                <UploadFileFrom  isWritedbFromUploadFile={true}  accept={accept} flag={this.state.uploadFileFromFlag}  externalUploadFileCallback={this.uploadForm.bind(this)}/>
            </article>
        )
    };

};
export default  FileListSmart;