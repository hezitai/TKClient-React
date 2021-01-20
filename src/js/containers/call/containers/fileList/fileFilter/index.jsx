/*
* @wanglimin
* @课件库文件筛选组件
*/

import React  from 'react';
import TkGlobal from "TkGlobal";
import eventObjectDefine from "eventObjectDefine";

class FileFilter extends React.Component{
    constructor(){
        super();
        this.state={
            isSearch:false
        };
        this.fileSortType = 3;                  //文件排序类型
        this.fileNameSortState = undefined;            //文件名排序状态
        this.fileTypeSortState = undefined;            //文件类型排序状态
        this.fileSortState = 1;                 //文件上传时间排序状态
        this.oldfileSortType = 3;
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

    //合并tkAppList
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

    fileListSort(sortType,sortState){
        const {uploadButtonJson} = this.props ;
        if(uploadButtonJson && uploadButtonJson.fileListSort && typeof uploadButtonJson.fileListSort  === "function" ){
            uploadButtonJson.fileListSort(sortType,sortState);
        }
    }
    /*搜索课件库，花名册*/
    onClickFileListSearchOpen(){
        if(this.state.isSearch){
            this.searchContain();
        }else{
            this.refs.textEditableSearch.focus();
            this.refs.textEditableSearch.value='';
            eventObjectDefine.CoreController.dispatchEvent({type:'fileListSearchOpenIsshow',message:true})
            this.setState({
                isSearch:true
            })
        }
    }
    onClickFileListSearchClose(){
        this.refs.textEditableSearch.value='';
        this.searchContain();
        eventObjectDefine.CoreController.dispatchEvent({type:'fileListSearchOpenIsshow',message:false})
        this.setState({
            isSearch:false
        })
    }
    FileListSearch(data){
        if(this.state.isSearch){
            this.searchContain(data.message)
        }
    }
    onClickFileListSearch(name){
        const {uploadButtonJson} = this.props ;
        if(uploadButtonJson && uploadButtonJson.fileListSearch && typeof uploadButtonJson.fileListSearch  === "function" ){
            uploadButtonJson.fileListSearch(name);
        }
    }
    searchContain(){
        let text = this.refs.textEditableSearch.value.replace(/&nbsp;/g , " ");
        this.onClickFileListSearch(text)
    }

    render(){
        let that=this;
        let {uploadButtonJson,isSearch,isSort}=this.props;
        let {sortName,sortType,sortTime} = that._loadSort();
        return(
            <div className = {TkConstant.joinRoomInfo.issearchwrapper && !isSort ? 'tk-list-container-title isHideTile':'tk-list-container-title'} >
                <div className="tk-list-filtrate" >
                    <span className={"tk-list-button-context searchContainer " + (this.state.isSearch?" isSearchStyle":"")} style={{display:!isSearch?'none':''}}>
                        <button ref='searchBtn' className="searchBtn" onClick={that.onClickFileListSearchOpen.bind(that)} title={TkGlobal.language.languageData.toolContainer.toolIcon.documentList.button.search.name}></button>
                        <span className={"btn-container search" + (this.state.isSearch?" isShow":"") } >
                            <input ref='textEditableSearch'  onBlur={this.searchContain.bind(this)} placeholder={TkGlobal.language.languageData.toolContainer.toolIcon.documentList.button.search.text} onKeyUp={this.searchContain.bind(this)}></input>
                            <button className="close"  title={TkGlobal.language.languageData.toolContainer.toolIcon.documentList.button.close.text} onClick={that.onClickFileListSearchClose.bind(that)}></button>
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
                    </span>
                    <span className={"tk-list-button-context" + sortName} ref="fileSortFormName" style={{display:this.state.isSearch ?'none':(!isSort?'none':'')}} >
                        <button className="text"  onClick={that.onClickFileListSort.bind(that,'Name',undefined)}  >{uploadButtonJson && uploadButtonJson.buttonNameSortText ? uploadButtonJson.buttonNameSortText : ''}  </button>
                        <span className="btn-container">
                            <button className="up" onClick={that.onClickFileListSort.bind(that,'Name',1)} ></button>
                            <button className="down" onClick={that.onClickFileListSort.bind(that,'Name',0)} ></button>
                        </span>
                    </span>
                </div>
            </div>

        )
    }
}
export default FileFilter