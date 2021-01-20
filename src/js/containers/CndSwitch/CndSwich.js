/**
 * Component
 * @description    New Switch of Document Component
 * @author Ks
 * @date 2018/08/09
 */

'use strict';

import React, { Component } from 'react';
import TkGlobal from 'TkGlobal';
import TkConstant from 'TkConstant';
import eventObjectDefine from 'eventObjectDefine';
import CoreController from "CoreController";
import ServiceRoom from "ServiceRoom";
import WebAjaxInterface from "WebAjaxInterface";
import ServiceSignalling from "ServiceSignalling";
import ReactDrag from 'reactDrag';
import TkUtils from 'TkUtils' ;

export default class CndSwitch extends Component{
    constructor(){
        super();
        this.state={
            list:[],
            nowKey:window.WBGlobal.docAddressKey,
            nowLine:0,
            nowShow:false,
            user:null,
        };
        this.newCdnList = [];
        this.isOne = false;
        this.versions = 1;
        this.index = 1;
    }
    componentDidMount(){
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomPubmsg , this.handlerRoomPubmsg.bind(this) , this.listernerBackupid); //roomPubmsg事件
    }

    handlerRoomPubmsg(recvEventData) {
        let pubmsgData = recvEventData.message;
        switch (pubmsgData.name) {
            case "RemoteControl":
                switch (pubmsgData.data.action) {
                    case 'callCdnIp':
                        this.versions = 2;
                        if(!this.hasGetAllCndIped){
                            WebAjaxInterface.getAllCndIp((resList)=>{
                                this.hasGetAllCndIped = true ;
                                this.newCdnList = resList;
                                this.setState({
                                    list:this.newCdnList
                                },()=>{
                                    let nowLine = this.findKeyToIndex(this.state.list, pubmsgData.data.serverInfo.serverKey);
                                    this.setState({
                                        user: pubmsgData.fromID,
                                        nowShow: true,
                                        nowLine: nowLine,
                                        nowKey: pubmsgData.data.serverInfo.serverKey,
                                    });
                                });
                            });
                        }else{
                            let nowLine = this.findKeyToIndex(this.state.list, pubmsgData.data.serverInfo.serverKey);
                            this.setState({
                                list:this.newCdnList,
                                user: pubmsgData.fromID,
                                nowShow: true,
                                nowLine: nowLine,
                                nowKey: pubmsgData.data.serverInfo.serverKey,
                            });
                        }
                        break;
                    case 'pushDocServer':
                        this.versions = 1;
                        this.setState({
                            list:pubmsgData.data.serverInfo.serverList,
                            user: pubmsgData.fromID,
                            nowShow: true,
                            nowLine: pubmsgData.data.serverInfo.serverIndex,
                        });
                        break;
                }
                break;

        }
    }

    findKeyToIndex(ary,Key) {
        let rCase = 0;
        if(ary && Array.isArray(ary)){
             rCase =  ary.findIndex((item, index) => {
                    return item.domain === Key
                })
        }
        if(rCase == -1){
            return 0
        }
        return rCase
    }

    changeInput(index,item){
        this.setState({
            nowLine:index,
            nowKey:item.domain
        });
        this.index = index
    }

    okclick(){
        if(this.versions){
            if(this.versions === 1){
                let data = {
                    action:'changeLine' ,
                    lineIndex: this.state.nowLine,
                };
                ServiceSignalling.sendSignallingFromRemoteControl(this.state.user , data);
            }else if(this.versions === 2){
                ServiceSignalling.sendSignallingFromRemoteControl(this.state.user , {action: 'changeCdnIp',key:this.state.nowKey});
            }
        }
        
        this.setState({
            nowKey:window.WBGlobal.docAddressKey,
            nowLine:0,
            nowShow:false,
            user:null,
        });
    }

    close(){
        this.setState({
            nowKey:window.WBGlobal.docAddressKey,
            nowLine:0,
            nowShow:false,
            user:null,
        })
    }

    nowList(){
        let DomList=[];
        this.state.list.forEach((item,index)=> {
            DomList.push(
                <li key={index} className={(index === this.index ? "active" : '')}>
                    <span>
                        <input id={'srever_' + index} name="selectremotesrever" value={index} type="radio"
                               onChange={this.changeInput.bind(this, index, item)}
                               checked={index === this.index}/>
                    </span>
                    <span>
                        <label htmlFor={'srever_' + index}>{this.versions === 1 ?(index === 0?TkGlobal.language.languageData.remoteControl.line1:TkGlobal.language.languageData.remoteControl.line2):((TkGlobal.language.name === 'chinese'?item.cninfo:(TkGlobal.language.name === 'japan'?item.japinfo:item.eninfo))+'('+item.domain+')')}</label>
                    </span>
                </li>
            )
        });
        return DomList;
    }

    render(){
        let domList = this.nowList();
        return(
            <div className={'device-test cnd startdetection cdnSwitch '} style={{display:this.state.nowShow?'block':'none'}}>
                <div  className={'testing-right opcityBg main fixldy net-testing network-right'}>
                    <div className={'titletext'}>{TkGlobal.language.languageData.login.language.detection.deviceTestHeader.optimalServer.text}</div>
                    <div className={'close-detection'} onClick={this.close.bind(this)} style={{cursor: 'pointer'}}></div>
                    <ul className={'custom-scroll-bar width test-network-box'}>
                        {domList}
                    </ul>
                    <div className={'detection-result-btn onclick'} onClick={this.okclick.bind(this)}>{TkGlobal.language.languageData.login.language.detection.button.ok.text}</div>
                </div>
            </div>
        )
    }
}