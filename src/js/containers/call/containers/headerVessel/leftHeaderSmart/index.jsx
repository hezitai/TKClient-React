/**
 * 头部容器-左侧头部Smart模块
 * @module LeftHeaderSmart
 * @description   承载头部的左侧所有组件
 * @author QiuShao
 * @date 2017/08/08
 */


'use strict';
import React from 'react';
import TkGlobal from 'TkGlobal';
import eventObjectDefine from 'eventObjectDefine';
import CoreController from 'CoreController';
// import TkConstant from '../../../../tk_class/TkConstant';
import NetworkStatusSmart from "../networkStatus";
import ClockTimeSmart from "../timer";
import LocalRecordSmart from "../localRecord";
import HeaderLogo from "../headPortrait";
import TkConstant from "TkConstant";


class LeftHeaderSmart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            updateState: false,
            hide: false,
            tipShow: false,
            roomLogoUrl: '',
            logoShow: false,
            // showVideoing:false
        };
        this.listernerBackupid = new Date().getTime() + '_' + Math.random();
    };

    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        eventObjectDefine.CoreController.addEventListener("keydownEscExitFullscreen", this.handlerKeydownEscExitFullscreen.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPubmsg, this.handlerRoomPubmsg.bind(this), this.listernerBackupid); //roomPubmsg事件
        // eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDelmsg, this.handlerRoomDelmsg.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener("initAppPermissions", this.handlerInitAppPermissions.bind(this), this.listernerBackupid);
        this.getClassRoomLogoUrl();
    };

    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        eventObjectDefine.CoreController.removeBackupListerner(this.listernerBackupid);
    };

    handlerInitAppPermissions() {
        this.setState({updateState: !this.state.updateState});

    }

    handlerRoomPubmsg(recvEventData) {
        const that = this;
        // let message = recvEventData.message;
        // if(message.name === "ClassBegin" ){
        //     this.setState({
        //         showVideoing:true
        //     })
        // }
    }
    // handlerRoomDelmsg(recvEventData) {
    //     const that = this;
    //     let message = recvEventData.message;
    //     if(message.name === "ClassBegin" ){
    //         this.setState({
    //             showVideoing:false
    //         })
    //     }
    // }
    handlerKeydownEscExitFullscreen(recvEventData) {
        if (recvEventData.message.isFullScreenStatus) {
            this.state.hide = true;
        } else {
            this.state.hide = false;
        }
        this.setState({hide: this.state.hide});
    }

    getClassRoomLogoUrl() {
        let url = undefined;
        if (TkConstant.joinRoomInfo && TkConstant.joinRoomInfo.classRoomLogoUrl !== undefined) {
            url = window.WBGlobal.nowUseDocAddress + TkConstant.joinRoomInfo.classRoomLogoUrl;
            //url = window.WBGlobal.nowUseDocAddress+'/upload1/20180605_124401_ijwnrwjn.jpg';
        }
        if (url) {
            this.setState({
                roomLogoUrl: url,
                logoShow: true
            })
        }
    }

    logoError() {
        this.setState({
            logoShow: false
        })
    }

    logoLoad() {
        this.setState({
            logoShow: true
        })
    }

    render() {
        let that = this;
        let {roomLogoUrl, logoShow} = this.state;
        return (
            <article className="h-left-wrap clear-float add-fl add-position-relative" id="header_left">
                <div
                    className={"roomID"}>{TkGlobal.language.languageData.login.language.detection.systemInfo.roomNumber}{TkConstant.joinRoomInfo.serial}
                </div>
                {!TkGlobal.playback ? <ClockTimeSmart/> : undefined}    
                {logoShow ? <HeaderLogo logoLoad={this.logoLoad.bind(this)} logoError={this.logoError.bind(this)}
                                        roomLogoUrl={roomLogoUrl}/> : null}
                {((TkGlobal.isClient && TkGlobal.clientversion < 2018072000) || TkGlobal.playback) ? undefined :
                    <NetworkStatusSmart/>}
                
                {/* {!TkGlobal.playback ? <ClockTimeSmart/> : undefined} */}
                {/*<AudioPlayerSmart />*/}
                {TkGlobal.clientversion && TkGlobal.clientversion >= 2018010200 && TkGlobal.isClient && CoreController.handler.getAppPermissions('localRecord') ?
                    <LocalRecordSmart/> : undefined}
                    {/* (that.state.showVideoing == true)?'block': */}
                <div className='videoing' style={{display:'none'}}>
                    <img src="https://classbro-oss.oss-cn-hongkong.aliyuncs.com/statice-resource/20190319/cc438308d1064962b15e5a9ec1a11339.png" alt=""/>
                </div>
            </article>
        )
    };
};
export default LeftHeaderSmart;