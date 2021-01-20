'use strict';
import React  from 'react';
import ReactDOM from 'react-dom';
import eventObjectDefine from "eventObjectDefine";
import TkConstant from "TkConstant";
import ServiceRoom from "ServiceRoom";
import TkGlobal from "TkGlobal";



class Preloading extends React.Component{
    constructor(){
        super();
        this.listernerBackupid = new Date().getTime()+'_'+Math.random();
        this.state={
            passPreload:false,
            preLoadBegin:false,
            preloadWidth: '0%',
            iframeSrc:undefined,
        }
    }
    componentDidMount(){
        let that = this;
        eventObjectDefine.CoreController.addEventListener( "room_preload" , that.handlerPreLoadBegin.bind(that) ,  that.listernerBackupid   );
        eventObjectDefine.Window.addEventListener( TkConstant.EVENTTYPE.WindowEvent.onMessage , that.BeginLoading.bind(that) ,  that.listernerBackupid   );
    };


    handlerPreLoadBegin(){
        let that = this;
            let data = undefined;
            this.setState({preLoadBegin:true,iframeSrc:undefined,preloadWidth:'0%'});

            this.timer=setTimeout(()=>{
                that.setState({
                    passPreload:true,
                })
            },30000);
            let fileList=ServiceRoom.getTkRoom().getFileList();
            fileList.forEach((item)=>{
                if (Number(item.type) === 1 && (Number(item.fileprop) === 1 || Number(item.fileprop) === 2)){
                    data=item;
                }
            });
            if(data){
                that.setState({
                    iframeSrc:window.WBGlobal.nowUseDocAddress + '/Public/html/preload.html?fileUrl='+ data.downloadpath + '&fileid='+ data.fileid
                })
            }else{
                    eventObjectDefine.CoreController.dispatchEvent({type:'room_noPreload'});
                    that.setState({
                        preLoadBegin:false
                    });
            }
    }
    BeginLoading(eventData){
        let that=this;
        if(eventData && eventData.message && eventData.message.event ){
            let event = eventData.message.event;
            let recvData = undefined ;
            try{
                recvData =  JSON.parse(event.data) ;
            }catch (e){
                L.Logger.warning(  "preload dynamic ppt receive iframe message data can't be converted to JSON , iframe data:" , event.data ) ;
                return ;
            }
            if(recvData && recvData.source === "tk_dynamicPPT_preload") {
                if( recvData.data && recvData.data.progress){
                    this.setState({
                        preloadWidth: Math.floor(recvData.data.progress * 100) +'%',
                    })
                }
                if (recvData.data && recvData.data.progress>=1){
                    clearTimeout(this.timer);
                    eventObjectDefine.CoreController.dispatchEvent({type:'room_noPreload'});
                    that.setState({
                        preLoadBegin:false
                    })
                }
            }
        }
    }
    passPreload(){
        let that=this;
        clearTimeout(that.timer);
        eventObjectDefine.CoreController.dispatchEvent({type:'room_noPreload'});
        that.setState({
            passPreload:false,
            preLoadBegin:false
        })
    }



    render(){
        let that = this ;
        return (
            <div id={"PreLoading_box"} className="PreLoading_box" style={{display:that.state.preLoadBegin ? "block": 'none'}}>
                <div className={"bg"}></div>
                <div className={"container"}>
                    <div className={"PreLoad"}><div className={"PreLoading"} style={{width: this.state.preloadWidth}}></div></div>
                    <span className="skip" onClick={that.passPreload.bind(that)} style={{display:that.state.passPreload?"":"none"}} >{TkGlobal.language.languageData.login.language.preLoad.pass}</span>
                </div>
                <div className={"load"}>{TkGlobal.language.languageData.login.language.preLoad.text}({this.state.preloadWidth})</div>
                <iframe id={"preload_iframe"} allow="autoplay" src={that.state.iframeSrc} frameBorder="0"></iframe>
            </div>
        )
    }
}

export  default  Preloading ;