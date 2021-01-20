import React from 'react';
import eventObjectDefine from 'eventObjectDefine' ;
import TkUtils from "TkUtils";
import TkConstant from "TkConstant";
import ServiceTooltip from 'ServiceTooltip' ;
import WebAjaxInterface from "WebAjaxInterface";
import TkGlobal from "TkGlobal";
import ServiceRoom from 'ServiceRoom';

export default class BigPictureDisplay extends React.Component{
    constructor(){
        super();
        this.state={
            istrue:false,
            imgurl:'',
            cospath:''
        }
    }
    componentDidMount() {
        eventObjectDefine.CoreController.addEventListener('isBigPictureDisplay',this.isBigPicture.bind(this));
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomNativeNotification,this.downloadFinished.bind(this));
    }

    isBigPicture(obj){
        if(obj['imgurl']){
            this.setState({
                istrue:true,
                imgurl:obj.imgurl,
                cospath:obj.cospath ,
                // imgurl:'/upload0/20180328_180127_edsfqwuq.png',
                // cospath:'https://doccdn-1253417915.cos.ap-guangzhou.myqcloud.com'
            })
        }
    }
    del(e){
        if(e.keyCode==27){
            this.setState({
                istrue:false,
                imgurl:''
            })
        }
    }
    downloadFinished(data){
        if(data.message.name==='onHttpResult' && (data.message.args.httpcode===0 || data.message.args.httpcode!==0)){
            this.clickDel();
        }
    }
    clickDel(){
        this.setState({
            istrue:false,
            imgurl:''
        })
    }

    focus(){
        this.a.focus()
    }
    handlerDownLoad(){
        let path=this.state.imgurl;
        if(path.lastIndexOf('.') !== -1){
            let index=path.lastIndexOf('.');
            let name=path.substring(index+1);
            ServiceRoom.getNativeInterface().getSaveFileName({caption:"Save", filter:{"all":"*.*"},suffix:name},(arg) =>{
                if (arg.action === "Complete") {
                    let cospath = '' ;
                    if(this.state.cospath){
                        cospath = this.state.cospath ;
                        cospath= cospath.replace(/https/,'http');//FIXME 此处将https串改为http,如果端口写了的情况下或有问题
                    }
                    let url=this.state.cospath ? cospath+this.state.imgurl : window.WBGlobal.nowUseDocAddress.replace(/https/,'http').replace(/:443/,':80')+this.state.imgurl;
                    ServiceRoom.getNativeInterface().nativeDownloadFile(url,arg.filename);
                }
            });
        }
    }
    render(){
        return(
            <div id='openBigImg'>
                {this.state.istrue?<div  ref={a=>this.a=a} onLoad={this.focus.bind(this)} className='isdisplay' tabIndex="0"  onKeyDown={this.del.bind(this)} >
                    <img src={ window.WBGlobal.nowUseDocAddress + this.state.imgurl}  className='changebigimg' onClick={this.clickDel.bind(this)} alt="bigimg"/>
                    {TkGlobal.isClient ?
                        (<div className='downloadPictrue'>
                            <span onClick={this.handlerDownLoad.bind(this)} className={"download_btn"} title={TkGlobal.language.languageData.videoContainer.download.downloadFile.title}></span>
                        </div>)
                        : (<div className='downloadPictrue'>
                             <a href={this.state.cospath?this.state.cospath+this.state.imgurl:window.WBGlobal.nowUseDocAddress+this.state.imgurl}  target={'blank'} className={"download_btn"} title={TkGlobal.language.languageData.videoContainer.download.downloadFile.title}></a>
                        </div>)}
                </div>:null}
            </div>
        )
    }
}