import React, { Component } from 'react';
import ServiceRoom from 'ServiceRoom';
import ServiceTooltip from 'ServiceTooltip';
import TkGlobal from 'TkGlobal';
import TkConstant from 'TkConstant';

export default class UploadFileFrom extends Component{
    constructor(props){
        super(props);
        this.state={
          uploadFileParams:null,
        };
        this.isNeedUpdateFile = false ;
    }

    componentDidUpdate(prevProps,prevState){
       if(prevProps.flag!==this.props.flag){
           let input=this.i;
           input.value="";
           input.click();
       }
       if(this.isNeedUpdateFile){
           this.isNeedUpdateFile = false ;
           let formData = new FormData(this.form);
           if(this.props.uploadFileCallbackOnBefore && typeof this.props.uploadFileCallbackOnBefore === 'function' && this.state.uploadFileParams ){
               this.props.uploadFileCallbackOnBefore(formData , this.state.uploadFileParams.fileoldname , this.state.uploadFileParams.fieltype );
           }
           if(this.props.externalUploadFileCallback && typeof this.props.externalUploadFileCallback === 'function'  && this.state.uploadFileParams ){
               this.props.externalUploadFileCallback(formData , this.state.uploadFileParams.fileoldname , this.state.uploadFileParams.fieltype);
           }else{
               ServiceRoom.getTkRoom().uploadFile(formData, (code,res)=> {
                   if(code === 0){
                       if(this.props.uploadSuccessCallback && typeof this.props.uploadSuccessCallback === 'function' ){
                           this.props.uploadSuccessCallback(res)
                       }
                   }else{
                       L.Logger.warning('上传文件失败！');
                   }
               });
           }
       }
    }

    change (e) {
        let input=this.i;
        let accept = this.props.accept ;
        let uploadFileName = input.files[0].name;
        let fileType = uploadFileName.substring(uploadFileName.lastIndexOf(".") + 1);
        let acceptFileTyle = accept.toString() + "";
        if (acceptFileTyle.toLowerCase().indexOf("." + fileType.toLowerCase()) === -1) {
            ServiceTooltip.showError(TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile.fileTypeError.text.one + fileType + TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile.fileTypeError.text.two);
            return;
        }

        if(this.props.size){
            let MAXFILESIZE = this.props.size ;
            if(this.props.imgMaxSize &&  (TkConstant.FILETYPE.imgFileListAccpet.toLowerCase().indexOf("." + fileType.toLowerCase()) !== -1) ){
                MAXFILESIZE = this.props.imgMaxSize ;
            }
            let fileSize = input.files[0].size ;
            if(fileSize > MAXFILESIZE) {
                ServiceTooltip.showError(TkGlobal.language.languageData.alertWin.call.fun.uploadCourseFile.fileSizeError.text.one + MAXFILESIZE / 1024 / 1024+ 'M' , false);
                return;
            }
        }

        let uploadFileParams =  ServiceRoom.getTkRoom().getUploadFileParams(uploadFileName ,fileType, this.props.isWritedbFromUploadFile !== undefined  ?  this.props.isWritedbFromUploadFile  : false) ;
        this.isNeedUpdateFile = true ;
        this.setState({
            uploadFileParams:uploadFileParams
        });
        e.preventDefault();
        e.stopPropagation();
    }



    render(){
        let ary=[];
        for(let i in this.state.uploadFileParams){
            ary.push({[i]:this.state.uploadFileParams[i]})
        }
        return(
            <div>
                <form style={{display:'none'}} ref={form=>this.form=form} >
                    <input type="file" ref={i=>this.i=i}  onChange={this.change.bind(this)}  name={"filedata"} accept={this.props.accept} />
                    {
                       ary.length>0?ary.map(function (item,index) {
                        let key,value;
                           for(let a in item){
                               key=a;
                               value=item[a]
                           }
                           return  <input type="text" key={index} name={key} value={value} readOnly/>
                       }):null
                    }
                </form>
            </div>
        )
    }

}