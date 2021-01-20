/**
 *  应用系统列表的Dumb组件
 * @module TkAppListDumb
 * @description   提供应用系统列表的Dumb组件
 * @author QiuShao
 * @date 2017/08/10
 */

'use strict';
import React  from 'react';
import PropTypes  from 'prop-types';
import List  from '../base/list/List';
import TkUtils  from 'TkUtils';
import eventObjectDefine from "eventObjectDefine";
import TkGlobal from "TkGlobal";
import TkConstant from "TkConstant";

class TkAppListDumb extends React.Component{
    constructor(props){
        super(props);
        this.state={
            isSearch:false
        }
        this.uploadFile = this.uploadFile.bind(this) ;
        this.fileListSort = this.fileListSort.bind(this) ;
        this.fileSortType = 3;                  //文件排序类型
        this.fileNameSortState = undefined;            //文件名排序状态
        this.fileTypeSortState = undefined;            //文件类型排序状态
        this.fileSortState = 1;                 //文件上传时间排序状态
        this.oldfileSortType = 3;
    };

    uploadFile(isH5 , e){
        const {uploadButtonJson} = this.props ;
        if(uploadButtonJson && uploadButtonJson.uploadFile && typeof uploadButtonJson.uploadFile  === "function" ){
            uploadButtonJson.uploadFile(isH5);
        }
        return false ;
    }

    fileListSort(sortType,sortState){
        const {uploadButtonJson} = this.props ;
        if(uploadButtonJson && uploadButtonJson.fileListSort && typeof uploadButtonJson.fileListSort  === "function" ){
            uploadButtonJson.fileListSort(sortType,sortState);
        }
    }

    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        let that = this;
        if(this.props.isModeChange&&this.refs.textEditableSearch){
            this.refs.textEditableSearch.value = "";
        }
        eventObjectDefine.CoreController.addEventListener('FileListSearch',that.FileListSearch.bind(that));
        
        that.onClickFileListSort("Time");
    }
    onClickFileListSort(type,state,Ev){

        let that = this;
        let sortType = undefined;
        let sortState = undefined;
        let plasticityType,plasticityState;
        let { fileListItemJson } = that.props ;
        if(type === 'Time'){
            sortType = 3;
            that.fileSortType = sortType;
            if(that.fileSortState === 1 && state === undefined) {
                sortState = 0;
                that.fileSortState = 0;
            }
            else if(that.fileSortState !==1 && state === undefined){
                sortState = 1;
                that.fileSortState = 1;
            } else if(state !== undefined){
                sortState = state;
                that.fileSortState = state;
            }
        }
        if(type === 'Type'){
            sortType = 2;
            that.fileSortType = sortType;
            if(that.fileTypeSortState === 1 && state === undefined) {
                sortState = 0;
                that.fileTypeSortState = 0;
            }
            else if(that.fileTypeSortState !==1 && state === undefined){
                sortState = 1;
                that.fileTypeSortState = 1;
            } else if(state !== undefined){
                sortState = state;
                that.fileTypeSortState = state;
            }
        }

        if(type === 'Name'){
            sortType = 1;
            that.fileSortType = sortType;
            if(that.fileNameSortState === 1  && state === undefined) {
                sortState = 0;
                that.fileNameSortState = 0;
            }
            else if(that.fileNameSortState !==1  && state === undefined) {
                sortState = 1;
                that.fileNameSortState = 1;
            } else if(state !== undefined){
                sortState = state;
                that.fileNameSortState = state;
            }
        }
        let fileListSortData = {};
        fileListSortData.sortType = sortType;
        fileListSortData.sortState = sortState;



        if(Ev && Ev.target){
            if(this.fileSortType !== this.oldfileSortType && Ev.target.className === 'text' ){
                if(type === 'Time'){
                    this.fileSortState = 0;
                }else if(type === 'Type'){
                    this.fileTypeSortState = 0;
                }else if(type === 'Name'){
                    this.fileNameSortState = 0;
                }
                sortState = 0
            }
            this.oldfileSortType = this.fileSortType;
        }

        switch (sortType) {
            case 3:
                plasticityType = 'fileid';
                break;
            case 2:
                plasticityType = 'filetype';
                break;
            case 1:
                plasticityType = 'filename';
                break;
            default:
                plasticityType = 'fileid';
                break;
        }
        if(sortState){
            plasticityState = true
        }else{
            plasticityState = false
        }

        that.fileListSort(plasticityType,plasticityState);
        return false ;
    }

    _loadSort(){
        let that = this;
        let sortName = "";
        let sortType = "";
        let sortTime = "";

        if(that.fileSortType===1 && that.fileNameSortState ===1){
            sortName = " active-up";
        }
        if(that.fileSortType===1 && that.fileNameSortState ===0){
            sortName = " active-down";
        }

        if(that.fileSortType===2 && that.fileTypeSortState ===1){
            sortType = " active-up";
        }
        if(that.fileSortType===2 && that.fileTypeSortState ===0){
            sortType = " active-down";
        }

        if(that.fileSortType===3 && that.fileSortState ===1){
            sortTime = " active-up";
        }
        if(that.fileSortType===3 && that.fileSortState ===0){
            sortTime = " active-down";
        }

        return {sortName:sortName,
            sortType:sortType,
            sortTime:sortTime};

    }
    /*搜索课件库，花名册*/
    onClickFileListSearchOpen(type){
        if(type === 'userList'){
            return;
        }
        if(this.state.isSearch){
            this.searchContain(type);
        }else{
            this.refs.textEditableSearch.focus();
            this.refs.textEditableSearch.value='';
            if(type==='fileList'){
                eventObjectDefine.CoreController.dispatchEvent({type:'fileListSearchOpenIsshow',message:true})
            }else{
                eventObjectDefine.CoreController.dispatchEvent({type:'userListSearchOpenIsshow',message:true})
            }

            this.setState({
                isSearch:true
            })
        }
    }
    onClickFileListSearchClose(type){
        this.refs.textEditableSearch.value='';
        this.searchContain(type);
        if(type==='fileList'){
            eventObjectDefine.CoreController.dispatchEvent({type:'fileListSearchOpenIsshow',message:false})
        }else{
            eventObjectDefine.CoreController.dispatchEvent({type:'userListSearchOpenIsshow',message:false})
        }
        this.setState({
            isSearch:false
        })
    }
    FileListSearch(data){
        if(this.state.isSearch){
            this.searchContain(data.message)
        }
    }
    onClickFileListSearch(name,type){
        if(type==='fileList'){
            const {uploadButtonJson} = this.props ;
            if(uploadButtonJson && uploadButtonJson.fileListSearch && typeof uploadButtonJson.fileListSearch  === "function" ){
                uploadButtonJson.fileListSearch(name);
            }
        }else{
            const {userListSearchButtonJson} = this.props ;
            if(userListSearchButtonJson && userListSearchButtonJson.userListSearch && typeof userListSearchButtonJson.userListSearch  === "function" ){
                userListSearchButtonJson.userListSearch(name);
            }
        }
    }
    handleEditableSearchonKeyUp(type){
        this.searchContain(type)
    }
    handleEditableSearchonBlur(type){
        this.searchContain(type)
    }
    searchContain(type){
        let text = this.refs.textEditableSearch.value.replace(/&nbsp;/g , " ");
        this.onClickFileListSearch(text,type)
    }
    render(){
        let that = this ;
        let { id , type , className  , show , isSort , isSearch ,  titleJson  , listPros  , uploadButtonJson , styleJson={} , navChildren , pagingDom ,isLoadShow, ...otherProps } = that.props ;
        let {sortName,sortType,sortTime} = that._loadSort();
        return (
            <div id={id} className={"tk-app-list tool-extend "+ (className || '') }   {...TkUtils.filterContainDataAttribute(otherProps)}   style={ Object.customAssign( {} , styleJson , {display:show?'block':'none' } ) }  >
                <div className="tk-app-list-title  add-position-relative" id={titleJson.id}>
                    <span className="tk-list-title-context add-nowrap user-select-none ">
                        <span> {titleJson.title} <span className="tk-list-title-number" >{`（${titleJson.number?titleJson.number:0}）`}</span> </span>
                        {/* <span className={"tk-list-button-context searchContainer "} style={{display:!isSearch?'none':''}}>
                            <button ref='searchBtn' className="searchBtn" onClick={that.onClickFileListSearchOpen.bind(that,type)} title={TkGlobal.language.languageData.toolContainer.toolIcon.documentList.button.search.text}></button>
                            <span className={"btn-container search" + (this.state.isSearch?" isShow":"") } >
                                <input ref='textEditableSearch'  onBlur={this.handleEditableSearchonBlur.bind(this,type)} placeholder={TkGlobal.language.languageData.toolContainer.toolIcon.documentList.button.search.text} onKeyUp={this.handleEditableSearchonKeyUp.bind(this,type)}></input>
                                <button className="close"  title={TkGlobal.language.languageData.toolContainer.toolIcon.documentList.button.close.text} onClick={that.onClickFileListSearchClose.bind(that,type)}></button>
                            </span>
                        </span>
                        <span className={"tk-list-button-context" + sortName} ref="fileSortFormName" style={{display:this.state.isSearch ?'none':(!isSort?'none':'')}} >
                            <button className="text"  onClick={that.onClickFileListSort.bind(that,'Name',undefined)}  >{uploadButtonJson && uploadButtonJson.buttonNameSortText ? uploadButtonJson.buttonNameSortText : ''}  </button>
                            <span className="btn-container">
                                <button className="up" onClick={that.onClickFileListSort.bind(that,'Name',1)} ></button>
                                <button className="down" onClick={that.onClickFileListSort.bind(that,'Name',0)} ></button>
                            </span>
                        </span>
						<span className={"tk-list-button-context " +  sortTime}  ref="fileSortFormTime" style={{display:this.state.isSearch ?'none':(!isSort?'none':'')}}>
                            <button className="text"  onClick={that.onClickFileListSort.bind(that,'Time',undefined)}  >{uploadButtonJson && uploadButtonJson.buttonTimeSortText ? uploadButtonJson.buttonTimeSortText : ''}</button>
                            <span className="btn-container">
                                <button className="up" onClick={that.onClickFileListSort.bind(that,'Time',1)} ></button>
                                <button className="down" onClick={that.onClickFileListSort.bind(that,'Time',0)} ></button>
                            </span>
                        </span>
                        <span className={"tk-list-button-context " + sortType} ref="fileSortFormType" style={{display:this.state.isSearch ?'none':(!isSort?'none':'')}}>
                            <button className="text"  onClick={that.onClickFileListSort.bind(that,'Type',undefined)}  >{uploadButtonJson && uploadButtonJson.buttonTypeSortText ? uploadButtonJson.buttonTypeSortText : ''} </button>
                            <span className="btn-container">
                                <button className="up" onClick={that.onClickFileListSort.bind(that,'Type',1)} ></button>
                                <button className="down" onClick={that.onClickFileListSort.bind(that,'Type',0)} ></button>
                            </span>
                        </span> */}
                    </span>
                </div>
                {navChildren}
                <div className="tk-list-container">
                        <div className = {TkConstant.joinRoomInfo.issearchwrapper && !isSort ? 'tk-list-container-title isHideTile':'tk-list-container-title'} >
                            <div className="tk-list-filtrate" >
                                <span className={"tk-list-button-context " +  sortTime}  ref="fileSortFormTime" style={{display:this.state.isSearch ?'none':(!isSort?'none':'')}}>
                                    <button className="text"  onClick={that.onClickFileListSort.bind(that,'Time',undefined)}  >{uploadButtonJson && uploadButtonJson.buttonTimeSortText ? uploadButtonJson.buttonTimeSortText : ''}</button>
                                    <span className="btn-container">
                                        <button className="up" onClick={that.onClickFileListSort.bind(that,'Time',1)} ></button>
                                        <button className="down" onClick={that.onClickFileListSort.bind(that,'Time',0)} ></button>
                                    </span>
                                </span>
                                <span className={"tk-list-button-context " + sortType} ref="fileSortFormType" style={{display:this.state.isSearch ?'none':(!isSort?'none':'')}}>
                                    <button className="text"  onClick={that.onClickFileListSort.bind(that,'Type',undefined)}  >{uploadButtonJson && uploadButtonJson.buttonTypeSortText ? uploadButtonJson.buttonTypeSortText : ''} </button>
                                    <span className="btn-container">
                                        <button className="up" onClick={that.onClickFileListSort.bind(that,'Type',1)} ></button>
                                        <button className="down" onClick={that.onClickFileListSort.bind(that,'Type',0)} ></button>
                                    </span>
                                </span>
                                <span className={"tk-list-button-context" + sortName} ref="fileSortFormName" style={{display:this.state.isSearch ?'none':(!isSort?'none':'')}} >
                                    <button className="text"  onClick={that.onClickFileListSort.bind(that,'Name',undefined)}  >{uploadButtonJson && uploadButtonJson.buttonNameSortText ? uploadButtonJson.buttonNameSortText : ''}  </button>
                                    <span className="btn-container">
                                        <button className="up" onClick={that.onClickFileListSort.bind(that,'Name',1)} ></button>
                                        <button className="down" onClick={that.onClickFileListSort.bind(that,'Name',0)} ></button>
                                    </span>
                                </span>
                                {
                                    isSort? 
                                    <span className={"tk-list-button-context searchContainer " + (this.state.isSearch?" isSearchStyle":"")} style={{display:!isSearch?'none':''}}>
                                        <button ref='searchBtn' className="searchBtn" onClick={that.onClickFileListSearchOpen.bind(that,type)} title={TkGlobal.language.languageData.toolContainer.toolIcon.documentList.button.search.name}></button>
                                        <span className={"btn-container search" + (this.state.isSearch?" isShow":"") } >
                                            <input ref='textEditableSearch' onClick={(e)=>{this.refs.textEditableSearch.focus()}}  onBlur={this.handleEditableSearchonBlur.bind(this,type)} placeholder={TkGlobal.language.languageData.toolContainer.toolIcon.documentList.button.search.text} onKeyUp={this.handleEditableSearchonKeyUp.bind(this,type)}></input>
                                            <button className="close"  title={TkGlobal.language.languageData.toolContainer.toolIcon.documentList.button.close.text} onClick={that.onClickFileListSearchClose.bind(that,type)}></button>
                                        </span>
                                    </span>
                                    :
                                    <div>
                                        {
                                            TkConstant.joinRoomInfo.issearchwrapper ? // 配置花名册搜索
                                            undefined :
                                            <span className={"tk-list-button-context searchContainer isSearchStyle"} style={{display:!isSearch?'none':''}}>
                                                <button ref='searchBtn' className="searchBtn" onClick={that.onClickFileListSearchOpen.bind(that,type)} title={TkGlobal.language.languageData.toolContainer.toolIcon.documentList.button.search.name}></button>
                                                <span className={"btn-container search isShow user"} >
                                                    <input ref='textEditableSearch' onClick={(e)=>{this.refs.textEditableSearch.focus()}}  onBlur={this.handleEditableSearchonBlur.bind(this,type)} placeholder={TkGlobal.language.languageData.toolContainer.toolIcon.documentList.button.search.text} onKeyUp={this.handleEditableSearchonKeyUp.bind(this,type)}></input>
                                                </span>
                                            </span>
                                        }
                                    </div>
                                }
                            </div>
                        </div>
                   
                    <div className="tk-list-content"> 
                        {
                            type==="userList"?(<div className={"tk-list-thead"}>
                                <div className={"tk-list-thead-facility"}>
                                    <span>{TkGlobal.language.languageData.toolContainer.toolIcon.userList.thead.facility}</span>
                                </div>
                                <div className={"tk-list-thead-name textCenter"}>
                                    <span>{TkGlobal.language.languageData.toolContainer.toolIcon.userList.thead.nick}</span>
                                </div>
                                <div className={"tk-list-thead-botton"}>
                                    <span>{TkGlobal.language.languageData.toolContainer.toolIcon.userList.thead.platform}</span>
                                    <span>{TkGlobal.language.languageData.toolContainer.toolIcon.userList.thead.camera}</span>
                                    <span>{TkGlobal.language.languageData.toolContainer.toolIcon.userList.thead.microphone}</span>
                                    <span>{TkGlobal.language.languageData.toolContainer.toolIcon.userList.thead.draw}</span>
                                    <span>{TkGlobal.language.languageData.toolContainer.toolIcon.userList.thead.raise}</span>
                                    <span>{TkGlobal.language.languageData.toolContainer.toolIcon.userList.thead.mute}</span>
                                    <span>{TkGlobal.language.languageData.toolContainer.toolIcon.userList.thead.remove}</span>
                                </div>
                            </div>):undefined
                        }
                        <List {...listPros} isLoadShow = {isLoadShow} type={type}/>
                         <div className="tk-app-list-button-container"  style={{display:(uploadButtonJson && uploadButtonJson.show)?'flex':'none'}} >
                            <button className="upload-btn "  onClick={that.uploadFile.bind(that , false)}  ref="uploadDocumentFile" >{uploadButtonJson && uploadButtonJson.buttonText ? uploadButtonJson.buttonText : '' }</button>
                            <button  style={{display:!that.props.isUploadH5Document?'none':''}} className="upload-btn H5"  onClick={that.uploadFile.bind(that , true)}  ref="uploadH5DocumentFile" >{uploadButtonJson && uploadButtonJson.buttonH5Text ? uploadButtonJson.buttonH5Text : '' }</button>
                        </div>
                    </div>
                    {pagingDom}
                </div>
               
            </div>
        )
    };
};
TkAppListDumb.propTypes = {
    titleJson:PropTypes.object.isRequired ,
    listPros:PropTypes.object.isRequired ,
    uploadButtonJson:PropTypes.object
};
export  default  TkAppListDumb ;

/*
数据格式:
props = {
    id:id ,
    className:className  ,
    titleJson:{
        id:id ,
        title:title ,
        number:number
    }  ,
    listPros:{...listPros}  ,
    uploadButtonJson:{
         show:show ,
         buttonText:buttonText ,
         uploadFile:uploadFile
    } ,
    ...otherProps
}
* */
