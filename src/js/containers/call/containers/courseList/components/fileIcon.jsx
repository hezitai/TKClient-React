import React from 'react'
class FileIcon extends React.Component{
    constructor(){
        super()
    }

    render(){
        let IconClass=null;
        switch (this.props.file.filetype){
            case "png":
            case "jpeg":
            case "bmp":
            case "gif":
            case "jpg":
                IconClass="png";
                break;
            case "whiteboard":
                IconClass="whiteboard";
                break;
            case "pptx":
            case "ppt":
                IconClass="pptx";
                break;
            case "word":
            case "doc":
            case "docx":
                IconClass="word";
                break;
            case "html":
                IconClass="html";
                break;
            case "pdf":
                IconClass="pdf";
                break;
            case "excle":
                IconClass="excle";
                break;
            case "txt":
                IconClass="txt";
                break;
            case "zip":
                IconClass="zip";
                break;
            case "mp3":
                IconClass="mp3";
                break;
            case "mp4":
                IconClass="mp4";
                break;

            default:
                IconClass=undefined;
                break;
        }
    return (
        <React.Fragment>
            <span onClick={this.props.openDocuemnt.bind(this,this.props.file)} className={"fileListIcon "+IconClass}></span>
            <span onClick={this.props.openDocuemnt.bind(this,this.props.file)} className={"fileListTest"}>{this.props.file.filename}</span>
        </React.Fragment>
    )
    }

}

export default FileIcon;