/**
 * 登录页面模块
 * @module TkLogin
 * @description   提供 登录界面所有组件
 * @author QiuShao
 * @date 2017/7/21
 */

'use strict';
import React from 'react';
import CoreController from 'CoreController';
import eventObjectDefine from 'eventObjectDefine';
import TkGlobal from 'TkGlobal';
import TkUtils from 'TkUtils';
import TkConstant from 'TkConstant';
import JoinDetectionDeviceSmart from '../detectionDevice/joinDetectionDevice';
import JoinHint from './joinHint/join-hint';
import LxNotification from '../LxNotification';
import ServiceRoom from "ServiceRoom";


/*Login页面*/
class TkLogin extends React.Component {
        constructor(props) {
            super(props);
            this.listernerBackupid = new Date().getTime() + '_' + Math.random();
        };
        componentWillMount() { //在初始化渲染执行之前立刻调用
            const that = this;
            TkGlobal.playback = false; //是否回放
            TkGlobal.routeName = 'login'; //路由的名字
            $(document.body).removeClass('playback');
            that._refreshHandler();
        };
        componentDidMount() { //在完成首次渲染之后调用，此时仍可以修改组件的state


            // window.setInterval(function(){
            // window.addEventListener('message', function (e) {
            //     console.error(typeof e.data);
            //     console.error(e.data);
            //     // parent.postMessage({'msg':'get'}, '*');
            //     if(typeof e.data == 'string'){
            //         console.error(e.data);
            //         window.GLOBAL.ClassBroToken = e.data.split('&')[1];
            //         console.error(window.GLOBAL.ClassBroToken);
            //     }
            //     // window.GLOBAL.ClassBroToken = e.data.split('CLASSBROD')[1].split('&')[1];
            // }, false);
            // },1000)



            // let url = window.location.href;
            // // window.GLOBAL.ClassBro = {};
            // window.GLOBAL.ClassBroUserPhone = url.split('CLASSBROD')[1].split('&')[0];
            // window.GLOBAL.ClassBroToken = url.split('CLASSBROD')[1].split('&')[1];
            // window.GLOBAL.ClassBroClassRoomId = url.split('CLASSBROD')[1].split('&')[2];
            // window.GLOBAL.ClassBroStatusType = url.split('CLASSBROD')[1].split('&')[3];
            // debugger;
            if (!TkGlobal.isReload && !TkGlobal.playback) {
                let timestamp = new Date().getTime();
                let href = window.location.href;
                L.Utils.sessionStorage.setItem(timestamp, TkUtils.encrypt(href));
                this.props.history.push('/login?timestamp=' + timestamp + '&reset=true' + '&tplId=' + (TkConstant.template.replace(/template_/g, '')) + '&skinId=' + (TkConstant.skin.replace(/skin_/g, '')) + '&layout=' + (TkConstant.layout.replace(/layout_/g, '')));
                if (TkGlobal.logintype === 88) {
                    CoreController.handler.joinRoom(); //执行joinroom
                } else {
                    eventObjectDefine.CoreController.dispatchEvent({
                        type: "loadDetectionDevice",
                        message: {
                            check: true,
                            start: true
                        }
                    });
                }
            }
        };
        componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
            let that = this;
            eventObjectDefine.CoreController.removeBackupListerner(that.listernerBackupid);
        };
        handlerOkCallback(json) { //设备检测：点击确定或者不需要检测时执行的函数
            let {
                needDetection
            } = json || {};
            TkGlobal.needDetectioned = needDetection;
            CoreController.handler.joinRoom(); //执行joinroom
        };
        _refreshHandler() {
            if (TkGlobal.loadVersion !== undefined) {
                TkGlobal.isReload = true;
                TkGlobal.loadVersion = undefined;
                window.location.reload(true);
            } else {
                if (TkGlobal.isRenovate) { //是否是刷新
                    TkGlobal.isReload = true;
                    window.location.reload(true);
                } else if (TkUtils.getUrlParams('reset', window.location.href) && TkUtils.getUrlParams('timestamp', window.location.href) && L.Utils.sessionStorage.getItem(TkUtils.getUrlParams('timestamp', window.location.href))) {
                    TkGlobal.isReload = true;
                    TkGlobal.isRenovate = true;
                    window.location.href = TkUtils.decrypt(L.Utils.sessionStorage.getItem(TkUtils.getUrlParams('timestamp', window.location.href)));
                    window.location.reload(true);
                }
                TkGlobal.isRenovate = false;
                TkGlobal.loadVersion = TkConstant.VERSIONS;
            }
        };
        render() {
            let that = this;

            return ( <
                div className = "login-container" > {
                    TkGlobal.playback ? undefined : < JoinHint / >
                } {
                    /* '#121A2C' */ } {
                    !TkGlobal.playback && TkGlobal.logintype !== 88 ? < JoinDetectionDeviceSmart isEnter = {
                        true
                    }
                    clearFinsh = {
                        true
                    }
                    handlerOkCallback = {
                        that.handlerOkCallback.bind(that)
                    }
                    backgroundColor = '#F1F4F7'
                    okText = {
                        TkGlobal.language.languageData.login.language.detection.button.join.text
                    }
                    titleText = {
                        TkGlobal.language.languageData.login.language.detection.deviceTestHeader.device.text
                    }
                    />:undefined} {
                        TkGlobal.playback ? undefined : < LxNotification / >
                    } {
                        /*提示弹框*/ } <
                    /div>
                )
            }
        };
        export default TkLogin;