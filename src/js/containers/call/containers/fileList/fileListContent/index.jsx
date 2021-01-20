/*
* 课件库文件列表组件
* @wanglimin
* @2018.11.22*/

import React from 'react';
import TkConstant from 'TkConstant';
import TkGlobal from 'TkGlobal';


class FileListContent extends React.Component{
    constructor(){
        super()
        this.state={
            publicFileShow:false,
            classFileShow:true
        }
    }
    publicFileShow(){
        this.setState({
            publicFileShow:!this.state.publicFileShow
        })
    }
    classFileShow(){
        this.setState({
            classFileShow:!this.state.classFileShow
        })
    }

    render(){
        let that=this;
        let classification=TkConstant.joinRoomInfo.isDocumentClassification
        let {listItemArray,listPros,clickOptionFile,publicFileList,classFileList}=this.props;
        return(
            <div>
                <div style={{display:classification?"block":"none"}}>
                    <div className={"file_button"} onClick={this.classFileShow.bind(this)}>
                        <button className={"navChildren"} onClick={clickOptionFile.bind(this,0)}>{TkGlobal.language.languageData.toolContainer.toolIcon.classFolder.title}</button>
                        <span className={"icon " + (this.state.classFileShow?" active":" ")}></span>
                    </div>
                    <ul style={{ maxHeight :'auto',display:this.state.classFileShow?"block":"none"}} className={ "fileList tk-list "+ (listPros.className || '') } id={listPros.id} >
                        {classFileList}
                    </ul>
                    <div className={"file_button"} onClick={this.publicFileShow.bind(this)}>
                        <button className={"navChildren"} onClick={clickOptionFile.bind(this,1)}>{TkGlobal.language.languageData.toolContainer.toolIcon.adminFolders.title}</button>
                        <span className={"icon " + (this.state.publicFileShow?" active":" ")}></span>
                    </div>
                    <ul style={{ maxHeight :'auto',display:this.state.publicFileShow?"block":"none" }} className={ "fileList tk-list "+ (listPros.className || '') } id={listPros.id} >
                        {publicFileList}
                    </ul>
                </div>
                <div style={{display:classification?"none":"block"}}>
                    <ul style={{ maxHeight :'auto'}} className={ "tk-list "+ (listPros.className || '') } id={listPros.id} >
                        {listItemArray}
                    </ul>
                </div>
            </div>
        )
    }

}
export default FileListContent