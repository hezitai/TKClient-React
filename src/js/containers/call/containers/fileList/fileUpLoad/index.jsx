/*
* 上传文件组件
* @wanglimin
* @2018.11.22*/

import React from 'react';
import UploadFileFrom from 'UploadFileFrom';


class FileUpLoad extends React.Component{
    constructor(){
        super()

    }

    render(){
        let that=this;
        let {uploadFile , isUploadH5Document , uploadButtonJson}=this.props;
        return(
            <div className="tk-app-list-button-container"  style={{display:(uploadButtonJson && uploadButtonJson.show)?'flex':'none'}} >
                <button className="upload-btn "  onClick={uploadFile.bind(that,false)}  ref="uploadDocumentFile" >{uploadButtonJson && uploadButtonJson.buttonText ? uploadButtonJson.buttonText : '' }</button>
                <button  style={{display:!isUploadH5Document?'none':''}} className="upload-btn H5"  onClick={uploadFile.bind(that,true)}  ref="uploadH5DocumentFile" >{uploadButtonJson && uploadButtonJson.buttonH5Text ? uploadButtonJson.buttonH5Text : '' }</button>
            </div>
        )
    }

}
export default FileUpLoad