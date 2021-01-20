/**
* 自定义奖杯Smart模块
* @module CustomTrophysSmart
* @description   承载自定义奖杯Smart的承载容器
* @author like
* @date 2018/5/11
*/
"use strict";
import "./static/index.css";
import "./static/index_black.css";
import React, { PureComponent } from "react";
import TkGlobal from "TkGlobal";
import TkConstant from "TkConstant";
import eventObjectDefine from "eventObjectDefine";
import WebAjaxInterface from "WebAjaxInterface";
import ReactDrag from "reactDrag";
import TrophyItem from "./components/TrophyItem";

const { CoreController: Ctrl } = eventObjectDefine;

class CustomTrophysSmart extends PureComponent {
    constructor() {
        super();
        this.listernerBackupid = new Date().getTime() + "_" + Math.random();
        this.state = {
            customTrophys: [],
            customTrophyShow: false,
        }
        this.userIdJson = {}
    };

    componentDidMount() {
        Ctrl.addEventListener("loadCustomTrophyItem", this.loadCustomTrophyItem.bind(this), this.listernerBackupid);
        Ctrl.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomConnected, this.handlerRoomConnected.bind(this), this.listernerBackupid); //roomDisconnected 事件
        Ctrl.addEventListener("recoverPanelBeforeStarting", this.handlerRecoverPanelBeforeStarting.bind(this), this.listernerBackupid); //下课 事件
    };

    componentWillUnmount() {
        Ctrl.removeBackupListerner(this.listernerBackupid);
    };

    //在组件完成更新后立即调用,在初始化时不会被调用
    componentDidUpdate(prevProps, { customTrophyShow }) {
        let { customTrophyShow: trophyShow } = this.state;

        if (customTrophyShow !== trophyShow && trophyShow) {
            this.setDefaultPosition();
        }
    };

    /*设置初始位置*/
    setDefaultPosition() {
        let { id, draggableData } = this.props;
        let dragNode = document.getElementById(id);
        let boundNode = document.querySelector(draggableData.bounds);

        if (dragNode && boundNode) {
            if (typeof draggableData.changePosition === "function") {
                let isSendSignalling = false;
                draggableData.changePosition(id, { percentLeft: 0.5, percentTop: 0.5, isDrag: false }, isSendSignalling);
            }
        }
    };

    handlerRecoverPanelBeforeStarting() {
        this.setState({ customTrophyShow: false })
    };

    handlerRoomConnected() {
        let { customTrophys, customTrophysVoice } =TkConstant.joinRoomInfo;

        if (customTrophys && customTrophysVoice) {
            if (TkConstant.hasRole.roleChairman) {
                this.setState({ customTrophys });
            }
        }
    };

    loadCustomTrophyItem(data) {
        this.userIdJson = data.message.userIdJson
        this.setState({ customTrophyShow: true })
    };

    /*发送礼物*/
    _sendGiftToStudent(customTrophys) {
        let { customTrophys: roomCustomTrophys, customTrophysVoice } = TkConstant.joinRoomInfo;

        if (Ctrl.handler.getAppPermissions("giveAllUserSendGift") || Ctrl.handler.getAppPermissions("giveAloneUserSendGift")) {
            if ((roomCustomTrophys || []).length > 1 && customTrophysVoice && customTrophys) {
                WebAjaxInterface.sendGift(this.userIdJson, customTrophys);
            }
            this.customTrophyCloseHandel();
        }
    };

    /*自定义多种奖杯关闭按钮*/
    customTrophyCloseHandel() {
        this.setState({ customTrophyShow: false })
    };

    render() {
        const { id, customTrophyDrag, draggableData } = this.props;
        let { customTrophys, customTrophyShow } = this.state;
        let DraggableData = Object.customAssign({
            id: id,
            percentPosition: { percentLeft: customTrophyDrag.percentLeft || 0.5, percentTop: customTrophyDrag.percentTop || 0.5 },
        }, draggableData);

        return (
            <ReactDrag {...DraggableData}>
                <div id={id} className="customTrophy-container " style={{ display: TkConstant.joinRoomInfo.customTrophys && TkConstant.joinRoomInfo.customTrophysVoice && customTrophyShow ? "block" : "none" }}>
                    <div className="container_top">
                        <span className="container-header">{TkGlobal.language.languageData.otherVideoContainer.button.gift.yes}</span>
                        <button id="container-closeBtn" className="container-closeBtn" title={TkGlobal.language.languageData.otherVideoContainer.button.close.yes} onClick={this.customTrophyCloseHandel.bind(this)}></button>
                    </div>
                    <ul className="container_ul">
                        {
                            customTrophys.map((value, index) => {
                                value = value || {};
                                return <TrophyItem {...value} key={index} id={`customTrophysItemBg${index}`} onClick={this._sendGiftToStudent.bind(this, value)}></TrophyItem>
                            })
                        }
                    </ul>
                </div>
            </ReactDrag>
        )
    }
}
export default CustomTrophysSmart;