/**
 * 教学工具箱 Smart组件
 * @module QrCodeTeachingToolSmart
 * @description  扫码上传图片组件
 * @date 2017/09/20
 */

'use strict';
import "./static/css/index.css";
import "./static/css/index_black.css";
import React from 'react';
import TkGlobal from 'TkGlobal';
import TkConstant from 'TkConstant';
import eventObjectDefine from 'eventObjectDefine';
import ServiceRoom from 'ServiceRoom';
import WebAjaxInterface from "WebAjaxInterface" ;
import ReactDrag from 'reactDrag';
import TkUtils from "TkUtils";
import ServiceSignalling from "ServiceSignalling";
import styled from "styled-components";

const QrCodeBoxDiv = styled.div.attrs({
    className: "qrCode-teachTool-wrap",
}) `
    display: ${props => ServiceRoom.getTkRoom().getMySelf().candraw ? props.isShow : "none"}
`

class QrCodeTeachingToolSmart extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
            qrCodeTeachToolWrapDisplay: "none",
            resizeInfo:{
                width:0,
                height:0,
            },
		};
		this.getFilestop = null;
		this.listernerBackupid = new Date().getTime() + '_' + Math.random();
    };
	componentDidMount() { //在完成首次渲染之后调用
		const that = this;
        eventObjectDefine.CoreController.addEventListener( 'handleQrCodeShow' , that.handleqrCodeShow.bind(that) , that.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomDelmsg , that.handlerRoomDelmsg.bind(that), that.listernerBackupid); //roomDelmsg事件

    };
    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        const that = this ;
        eventObjectDefine.CoreController.removeBackupListerner(that.listernerBackupid);
    };
    //在组件完成更新后立即调用,在初始化时不会被调用
    componentDidUpdate(prevProps , prevState){
        if (prevState.qrCodeTeachToolWrapDisplay !== this.state.qrCodeTeachToolWrapDisplay && this.state.qrCodeTeachToolWrapDisplay === 'block') {
            this.setDefaultPosition();
        }
        this.updateResize();
    };
    handlerRoomDelmsg(recvEventData){
        let pubmsgData = recvEventData.message;
        switch(pubmsgData.name) {
            case "ClassBegin":
                this.qrCodeCloseHandel();
                break;
        }
    }
    /*设置初始位置*/
    setDefaultPosition() {
        let {id,draggableData} = this.props;
        let dragNode = document.getElementById(id);
        let boundNode = document.querySelector(draggableData.bounds);
        if (dragNode && boundNode) {
            if (draggableData.changePosition && typeof draggableData.changePosition === "function") {
                let isSendSignalling = false;
                draggableData.changePosition(id, {percentLeft:0.5,percentTop:0.5,isDrag:false}, isSendSignalling);
            }
        }
    }

	handleqrCodeShow(data){
		const that = this;
        if(that.state.qrCodeTeachToolWrapDisplay=="none" && data.isShow){
            clearInterval(this.getFilestop)
            that.setState({qrCodeTeachToolWrapDisplay:"block"})
            // let userName=escape(ServiceRoom.getTkRoom().getMySelf().nickname)
            let userName=encodeURI(ServiceRoom.getTkRoom().getMySelf().nickname)
            let codeid=ServiceRoom.getTkRoom().getMySelf().id+'_'+TkUtils.getGUID().getGUIDDate() + TkUtils.getGUID().getGUIDTime()
            if(TkConstant.SERVICEINFO.webAddress.indexOf('neiwang')!=-1){
                let urldata='http://cn.talk-cloud.net/static/qrCode/qrCode.html?serial='+TkConstant.joinRoomInfo["serial"]+'&userid='+ServiceRoom.getTkRoom().getMySelf().id+'&sender='+userName+'&key='+TkConstant.joinRoomInfo["companyid"]+'&url='+TkConstant.SERVICEINFO.webAddress+'&languageName='+TkGlobal.languageName+'&ts='+ new Date().getTime()+'&codeid='+codeid;
                //$('#qrCode').qrcode(urldata);
                $('#qrCode').qrcode({
                    render: "canvas", // 渲染方式有table方式和canvas方式
                    width: 256,   //默认宽度
                    height: 256, //默认高度
                    text: urldata, //二维码内容
                    typeNumber: -1,   //计算模式一般默认为-1
                    correctLevel: 0, //二维码纠错级别
                    background: "#ffffff",  //背景颜色
                    foreground: "#000000" ,  //二维码颜色
                    ecLevel: 'L', // error correction level: 'L', 'M', 'Q' or 'H'
                    radius: 0.5, // corner radius relative to module width: 0.0 .. 0.5
                });
			}else{
                let urldata=TkConstant.SERVICEINFO.webAddress+'/static/qrCode/qrCode.html?serial='+TkConstant.joinRoomInfo["serial"]+'&userid='+ServiceRoom.getTkRoom().getMySelf().id+'&sender='+userName+'&key='+TkConstant.joinRoomInfo["companyid"]+'&url='+TkConstant.SERVICEINFO.webAddress+'&languageName='+TkGlobal.languageName+'&ts='+ new Date().getTime()+'&codeid='+codeid;
                // $('#qrCode').qrcode(urldata);
                $('#qrCode').qrcode({
                    render: "canvas", // 渲染方式有table方式和canvas方式
                    width: 256,   //默认宽度
                    height: 256, //默认高度
                    text: urldata, //二维码内容
                    typeNumber: -1,   //计算模式一般默认为-1
                    correctLevel: 0, //二维码纠错级别
                    background: "#ffffff",  //背景颜色
                    foreground: "#000000" ,  //二维码颜色
                    ecLevel: 'L', // error correction level: 'L', 'M', 'Q' or 'H'
                    radius: 0.5, // corner radius relative to module width: 0.0 .. 0.5
                });
            }
            that.getFilestop=setInterval(this._getFileByqrCode.bind(this,codeid), 3000);
        }
	}
    _getFileByqrCode(codeid){
        const that = this;
        let responseJson = {
            doneCallback(res){
                if (res.result == 0) {
                    that.qrCodeCloseHandel();
                    //新模板派发信令
                    var isDynamicPPT = res.fileprop === 1 || res.fileprop === 2 ;
                    var isH5Document = res.fileprop === 3 ;
                    var isGeneralFile = !isDynamicPPT && !isH5Document ;
                    var isMediaFile = /(mp3|mp4|webm)/g.test( res.filetype ) ;
                    let fileInfoObj = {
                        "isDel": false,
                        "isGeneralFile": isGeneralFile,
                        "isMedia": isMediaFile,
                        "isDynamicPPT": isDynamicPPT,
                        "isH5Document": isH5Document ,
                        "action": "",
                        "mediaType": isMediaFile ? res.filetype : "",
                        "filedata": {
                            "fileid":  Number( res.fileid ) ,
                            "currpage": 1,
                            "pagenum": Number(res.pagenum) ,
                            "filetype":res.filetype   ,
                            "filename": res.filename  ,
                            "swfpath": ( isDynamicPPT||isH5Document ) ? res.downloadpath : res.swfpath ,
                            "pptslide": 1,
                            "pptstep": 0,
                            "steptotal": 0,
                            "filecategory": res.filecategory !== undefined ? Number( res.filecategory ) : 0 , //0:课堂 ， 1：系统
                        }
                    };
                    ServiceSignalling.sendSignallingFromDocumentChange(fileInfoObj);
                    eventObjectDefine.CoreController.dispatchEvent({
                        type:'qrCode',
                        message:{
                            getInfo:res,
                            // clear:that.qrCodeCloseHandel
                        }
                    });
                }
            },
        };
        WebAjaxInterface.getQrCodeUploadFile(codeid,responseJson);
    }

	/*关闭*/
    qrCodeCloseHandel() {
        clearInterval(this.getFilestop)
        $('#qrCode canvas').remove();
		this.setState({
            qrCodeTeachToolWrapDisplay: "none",
		});
        eventObjectDefine.CoreController.dispatchEvent({
            type:'handleQrCodeShow' ,
            isShow:false,
        });

        //关闭扫码，启用工具箱按钮
        eventObjectDefine.CoreController.dispatchEvent({
            type:'colse-holdAll-item' ,
            message: {
                type: 'qrCode'
            }
        });
	};
    /*更新大小*/
    updateResize () {
        let {id} = this.props;
        let dragNode = document.getElementById(id);
        if (dragNode) {
            const defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
            let width = dragNode.offsetWidth/defalutFontSize;
            let height = dragNode.offsetHeight/defalutFontSize;
            if (this.state.resizeInfo && (!Object.is(this.state.resizeInfo.width, width ) || !Object.is(this.state.resizeInfo.height, height))) {
                this.state.resizeInfo={
                    width,
                    height,
                };
                this.setState({resizeInfo:this.state.resizeInfo});
            }
        }
    }
    render() {
        const {id, qrCodeDrag, draggableData} = this.props;
        let {resizeInfo} = this.state;
        let percentLeft = qrCodeDrag.percentLeft;
        let percentTop = qrCodeDrag.percentTop;
        if (percentLeft != 0 && !percentLeft) {
            percentLeft = 0.5;
        }
        if (percentTop != 0 && !percentTop) {
            percentTop = 0.5;
        }
        let DraggableData = Object.customAssign({
            id:id,
            size:resizeInfo,
            percentPosition:{percentLeft, percentTop},
        },draggableData);
        return (
            <ReactDrag {...DraggableData}>
                <QrCodeBoxDiv id={id} isShow={this.state.qrCodeTeachToolWrapDisplay}>
                    <div  className="qrCode-teachTool-header">
                        <span className="scanStyle">{TkGlobal.language.languageData.qrCode.scan.text}</span>
                        <span className="qrCode-teachTool-closeSpan" onClick={this.qrCodeCloseHandel.bind(this)}></span>
                    </div>
					<div id="qrCode" className="qrCode"></div>
                    <div  className="attentionStyle">{TkGlobal.language.languageData.qrCode.attention.text}</div>
                </QrCodeBoxDiv>
            </ReactDrag>
        )
    };
}
export default QrCodeTeachingToolSmart;