/**
 * 右侧内容-时间提示Smart模块
 * @module TimeRemind
 * @description   右侧内容-时间提示Smart模块
 * @author QiuShao
 * @date 2017/08/29
 */
'use strict';
import React from 'react';
import TkGlobal from 'TkGlobal';
import TkConstant from 'TkConstant';
import ServiceSignalling from 'ServiceSignalling';
import ServiceRoom from 'ServiceRoom';
import WebAjaxInterface from 'WebAjaxInterface';
import eventObjectDefine from 'eventObjectDefine';
import TkAppPermissions from 'TkAppPermissions';
import CoreController from 'CoreController';

class TimeRemind extends React.PureComponent {
    constructor(props) {
        super(props);
        this.start = {
            status_lt_minute_1: false,
            status_gt_minute_1: false,
            status_gt_minute_0: false,
        };
        this.end = {
            status_gt_minute_0: false,
            status_gt_minute_3: false,
            status_lt_minute_1: false,
            status_end_second_10: false,
            status_end: false,
            status_end_minute_0: false,
        };
        this.timeContainer = null;
        this.state = {
            isShowTimeRemind: false,//提示是否显示
            ableStartClass: false,
            ableEndClass: false,
            isShowRemindBtn: true,//提示的确定按钮是否显示
            remindType: null,
            timeDifference: null,
            timeOfTen: 10,
            timeOfFive: 5,
        };
        this.listernerBackupid = new Date().getTime() + '_' + Math.random();
    };
    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        this._handlerRoomConnected();
    };
    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        eventObjectDefine.CoreController.removeBackupListerner(this.listernerBackupid);
        clearInterval(this.notClassBeginTimer);
        clearInterval(this.systemTimeRemind);
        clearInterval(this.timerCloseRoom);
        this.timerCloseRoom = null;
        this.systemTimeRemind = null;
        this.notClassBeginTimer = null;
    };
    //房间连接成功
    _handlerRoomConnected() {
        let { roomConnected } = this.props;
        if (roomConnected) {
            if (TkConstant.joinRoomInfo.endOfClassHoursIsClassOver) {
                ServiceSignalling.sendSignallingFromUpdateTime(ServiceRoom.getTkRoom().getMySelf().id);//发送更新时间的信令
                let startTime = TkConstant.joinRoomInfo.starttime * 1000;//教室开始时间
                let endTime = TkConstant.joinRoomInfo.endtime * 1000;//教室结束时间
                let intervalNumber = 0;
                this.listeningNotClassBeginTime(startTime, endTime, 1000, intervalNumber);
            } else {
                if (TkConstant.hasRole.roleChairman) {
                    ServiceSignalling.sendSignallingFromUpdateTime(ServiceRoom.getTkRoom().getMySelf().id);//发送更新时间的信令
                    let startTime = TkConstant.joinRoomInfo.starttime * 1000;//教室开始时间
                    let endTime = TkConstant.joinRoomInfo.endtime * 1000;//教室结束时间
                    let intervalNumber = 0;
                    this.listeningNotClassBeginTime(startTime, endTime, 1000, intervalNumber);
                }
            }
        }
    };
    //老师时间提示监听器
    listeningNotClassBeginTime(startTime, endTime, intervalTime, intervalNumber) { 
        clearInterval(this.notClassBeginTimer);
        this.notClassBeginTimer = setInterval( () => {
            if (TkGlobal.remindServiceTime) {
                TkGlobal.remindServiceTime += 1000;
                let startTimeDifference = TkGlobal.remindServiceTime - startTime;
                let endTimeDifference = TkGlobal.remindServiceTime - endTime;
                if (startTimeDifference < 0) {
                    if (!TkConstant.joinRoomInfo.endOfClassHoursIsClassOver) {
                        if (TkGlobal.classBegin === false) { //没有上课
                            TkAppPermissions.setAppPermissions('classBtnIsDisableOfRemind', true);
                            if (startTimeDifference > - 60 * 1000) { //离上课时间还有一分钟
                                if (this.start.status_lt_minute_1 === false) {
                                    this.start.status_lt_minute_1 = true;
                                    this.setState({
                                        isShowTimeRemind: true,
                                        ableStartClass: true,
                                        ableEndClass: false,
                                        isShowRemindBtn: true,
                                        remindType: "distanceOneMinute",//离上课时间还有一分钟
                                        timeDifference: startTimeDifference,
                                    });
                                    TkAppPermissions.setAppPermissions('classBtnIsDisableOfRemind', false);
                                    this.fiveIntervalTime();//倒计时5秒
                                }
                                if (ServiceRoom.getTkRoom().getMySelf().hasaudio == false) {
                                    TkAppPermissions.setAppPermissions('classBtnIsDisableOfRemind', true);
                                } else {
                                    TkAppPermissions.setAppPermissions('classBtnIsDisableOfRemind', false);
                                }
                            }
                        } else {
                            if (!CoreController.handler.getAppPermissions('classBtnIsDisableOfRemind')) {
                                TkAppPermissions.setAppPermissions('classBtnIsDisableOfRemind', true);
                            }
                        }
                    }
                } else {
                    if (TkGlobal.classBegin === false) { //没有上课
                        if (endTimeDifference > 0) { //超过教室时间并且没有上课
                            if (TkConstant.joinRoomInfo.endOfClassHoursIsClassOver) {
                                if (this.end.status_gt_minute_0 === false) {
                                    this.end.end_gt_minute_0 = true;
                                    this.setState({
                                        isShowTimeRemind: false,
                                        ableStartClass: false,
                                        ableEndClass: false,
                                        isShowRemindBtn: true,
                                        remindType: "noClassInTime",
                                        timeDifference: startTimeDifference,
                                    });
                                    clearInterval(this.notClassBeginTimer);
                                    this.notClassBeginTimer = null;
                                    ServiceRoom.getTkRoom().leaveroom(); //关闭房间
                                    eventObjectDefine.Room.dispatchEvent({ type: TkConstant.EVENTTYPE.RoomEvent.roomDelmsg, message: { name: "ClassBegin" } });
                                    setTimeout(() => {
                                        ServiceRoom.getTkRoom().uninit();
                                    }, 300);
                                    return;
                                }
                            } else {
                                if (this.end.status_gt_minute_0 === false) {
                                    this.end.end_gt_minute_0 = true;
                                    this.setState({
                                        isShowTimeRemind: true,
                                        ableStartClass: false,
                                        ableEndClass: false,
                                        isShowRemindBtn: true,
                                        remindType: "noClassInTime",
                                        timeDifference: startTimeDifference,
                                    });
                                    TkAppPermissions.setAppPermissions('classBtnIsDisableOfRemind', true);
                                    let isLeaveRoom = true;
                                    this.fiveIntervalTime(isLeaveRoom);

                                    clearInterval(this.notClassBeginTimer);
                                    this.notClassBeginTimer = null;
                                    return;
                                }
                            }
                            return;
                        }
                        if (endTimeDifference > - 300 * 1000 && TkConstant.joinRoomInfo.endOfClassHoursIsClassOver) { //距离下课还有5分钟
                            if (this.end.status_lt_minute_1 === false) {
                                this.end.status_lt_minute_1 = true;
                                this.setState({
                                    isShowTimeRemind: true,
                                    ableStartClass: false,
                                    ableEndClass: true,
                                    isShowRemindBtn: true,
                                });
                                this.fiveIntervalTime();
                            }
                            if (this.state.isShowTimeRemind == true) {
                                this.setState({
                                    remindType: "oneBeforeClass",
                                    timeDifference: endTimeDifference,
                                });//超过上课时间一分钟
                            }
                            return;
                        }
                        if (startTimeDifference > 60 * 1000 && !TkConstant.joinRoomInfo.endOfClassHoursIsClassOver) { //超过上课时间一分钟后提醒
                            if (this.start.status_gt_minute_1 === false) {
                                this.start.status_gt_minute_1 = true;
                                this.setState({
                                    isShowTimeRemind: true,
                                    ableStartClass: true,
                                    ableEndClass: false,
                                    isShowRemindBtn: true,
                                });
                                this.fiveIntervalTime();
                                TkAppPermissions.setAppPermissions('classBtnIsDisableOfRemind', false);
                            }
                            if (ServiceRoom.getTkRoom().getMySelf().hasaudio == false) {
                                TkAppPermissions.setAppPermissions('classBtnIsDisableOfRemind', true);
                            } else {
                                TkAppPermissions.setAppPermissions('classBtnIsDisableOfRemind', false);
                            }

                            if (this.state.isShowTimeRemind == true) {
                                this.setState({
                                    remindType: "exceedOneMinuteOfClass",
                                    timeDifference: startTimeDifference,
                                });//超过上课时间一分钟
                            }
                        } else {
                            if (!TkConstant.joinRoomInfo.endOfClassHoursIsClassOver) {
                                if (this.start.status_gt_minute_0 === false) {
                                    this.start.status_gt_minute_0 = true;
                                    this.setState({
                                        isShowTimeRemind: false,
                                        ableStartClass: true,
                                        ableEndClass: false,
                                    });
                                    TkAppPermissions.setAppPermissions('classBtnIsDisableOfRemind', false);
                                }
                                if (ServiceRoom.getTkRoom().getMySelf().hasaudio == false) {
                                    TkAppPermissions.setAppPermissions('classBtnIsDisableOfRemind', true);
                                } else {
                                    TkAppPermissions.setAppPermissions('classBtnIsDisableOfRemind', false);
                                }
                            }
                        }
                    } else { //已经上课了
                        if (endTimeDifference < 0) { //没到下课时间
                            if (endTimeDifference < - 60 * 1000 && !CoreController.handler.getAppPermissions('classBtnIsDisableOfRemind') && !TkConstant.joinRoomInfo.endOfClassHoursIsClassOver) {
                                TkAppPermissions.setAppPermissions('classBtnIsDisableOfRemind', true);
                            }
                            if (TkConstant.joinRoomInfo.endOfClassHoursIsClassOver) { //爱斑马
                                if (endTimeDifference > - 300 * 1000) { //离下课还有5分钟
                                    if (this.end.status_lt_minute_1 === false) {
                                        this.end.status_lt_minute_1 = true;
                                        this.setState({
                                            isShowTimeRemind: true,
                                            ableStartClass: false,
                                            ableEndClass: true,
                                            isShowRemindBtn: true,
                                        });
                                        this.fiveIntervalTime();//倒计时5秒
                                        // TkAppPermissions.setAppPermissions('classBtnIsDisableOfRemind' , false);
                                        if (this.timeContainer !== "ready-end") {
                                            this.timeContainer = "ready-end";
                                            eventObjectDefine.CoreController.dispatchEvent({
                                                type: 'backTimecolorOfRemind',
                                                message: {
                                                    source: 'timeRemind',
                                                    data: {
                                                        timeColor: this.timeContainer
                                                    }
                                                }
                                            });
                                        }
                                        //$("#time_container").removeClass("ready-end no-start ready-start start immediately-end end").addClass("ready-end") ;
                                    }
                                    if (this.state.isShowTimeRemind) {
                                        this.setState({
                                            remindType: "oneBeforeClass",
                                            timeDifference: endTimeDifference,
                                        });//离下课还有5分钟
                                    }
                                }
                            }
                            if (endTimeDifference > - 60 * 1000) { //离下课还有1分钟
                                if (this.end.status_lt_minute_1 === false) {
                                    this.end.status_lt_minute_1 = true;
                                    this.setState({
                                        isShowTimeRemind: true,
                                        ableStartClass: false,
                                        ableEndClass: true,
                                        isShowRemindBtn: true,
                                    });
                                    this.fiveIntervalTime();//倒计时5秒
                                    TkAppPermissions.setAppPermissions('classBtnIsDisableOfRemind', false);
                                    if (this.timeContainer !== "ready-end") {
                                        this.timeContainer = "ready-end";
                                        eventObjectDefine.CoreController.dispatchEvent({
                                            type: 'backTimecolorOfRemind',
                                            message: {
                                                source: 'timeRemind',
                                                data: {
                                                    timeColor: this.timeContainer
                                                }
                                            }
                                        });
                                    }
                                    //$("#time_container").removeClass("ready-end no-start ready-start start immediately-end end").addClass("ready-end") ;
                                }
                                if (this.state.isShowTimeRemind == true) {
                                    this.setState({
                                        remindType: "oneBeforeClass",
                                        timeDifference: endTimeDifference,
                                    });//离下课还有1分钟
                                }
                            }
                        } else { //超过下课时间
                            let countDownTime = 5 * 60 * 1000 - endTimeDifference;
                            if (TkConstant.joinRoomInfo.endOfClassHoursIsClassOver) { //爱斑马 //如果教室到时间了，则下课
                                if (TkGlobal.remindServiceTime > endTime) {
                                    this.setState({
                                        isShowTimeRemind: false,
                                        ableStartClass: false,
                                        ableEndClass: true,
                                    });
                                    clearInterval(this.notClassBeginTimer);
                                    this.notClassBeginTimer = null;
                                    ServiceRoom.getTkRoom().leaveroom(); //关闭房间
                                    eventObjectDefine.Room.dispatchEvent({ type: TkConstant.EVENTTYPE.RoomEvent.roomDelmsg, message: { name: "ClassBegin" } });
                                    setTimeout(() => {
                                        ServiceRoom.getTkRoom().uninit();
                                    }, 300);
                                }
                            } else {
                                if (countDownTime >= 0) { //超过下课时间五分钟内
                                    if (TkGlobal.classBeginTime && TkGlobal.remindServiceTime) {
                                        //$scope.remind.classBeginTime.func.classBeginInterval();
                                    }
                                    if (countDownTime <= 10 * 1000) { //离最大下课超时还有10秒
                                        if (this.end.status_end_second_10 === false) {
                                            this.end.status_end_second_10 = true;
                                            this.setState({
                                                isShowTimeRemind: true,
                                                ableStartClass: false,
                                                ableEndClass: true,
                                            });
                                            TkAppPermissions.setAppPermissions('classBtnIsDisableOfRemind', false);
                                            if (this.timeContainer !== "end") {
                                                this.timeContainer = "end";
                                                eventObjectDefine.CoreController.dispatchEvent({
                                                    type: 'backTimecolorOfRemind',
                                                    message: {
                                                        source: 'timeRemind',
                                                        data: {
                                                            timeColor: this.timeContainer
                                                        }
                                                    }
                                                });
                                            }
                                            //$("#time_container").removeClass("ready-end no-start ready-start start immediately-end end").addClass("end") ;
                                        }
                                        /*定时关闭教室，10秒后*/
                                        this.setState({
                                            isShowRemindBtn: false,
                                            remindType: "closeClassAfterTen",//10秒后关闭教室
                                            timeOfTen: 10,
                                        });
                                        clearInterval(this.timerCloseRoom);
                                        this.timerCloseRoom = setInterval(function () {
                                            if (this.state.isShowTimeRemind == true) {
                                                this.setState({
                                                    isShowRemindBtn: false,
                                                    remindType: "closeClassAfterTen",//10秒后关闭教室
                                                    timeOfTen: (--this.state.timeOfTen),
                                                });
                                            }
                                            //wj改7-10:
                                            if (TkGlobal.classBeginTime && TkGlobal.remindServiceTime) {
                                                TkGlobal.remindServiceTime += 1000;
                                                //$scope.remind.classBeginTime.func.classBeginInterval();
                                            }
                                            if (this.state.timeOfTen < 1) {
                                                WebAjaxInterface.roomOver(); //发送下课信令 //如果教室到时间了，则下课
                                                this.setState({
                                                    isShowTimeRemind: false,
                                                    ableStartClass: false,
                                                    ableEndClass: true,
                                                });
                                                clearInterval(this.timerCloseRoom);
                                                this.timerCloseRoom = null;
                                            }
                                        }, 1000);
                                        clearInterval(this.notClassBeginTimer);
                                        this.notClassBeginTimer = null;
                                        return;
                                    } else if (endTimeDifference > 3 * 60 * 1000) { //超过下课时间3分钟
                                        if (this.end.status_gt_minute_3 === false) {
                                            this.end.status_gt_minute_3 = true;
                                            this.setState({
                                                isShowTimeRemind: true,
                                                ableStartClass: false,
                                                ableEndClass: true,
                                                isShowRemindBtn: true,
                                            });
                                            TkAppPermissions.setAppPermissions('classBtnIsDisableOfRemind', false);
                                            this.fiveIntervalTime();
                                            if (this.timeContainer !== "immediately-end") {
                                                this.timeContainer = "immediately-end";
                                                eventObjectDefine.CoreController.dispatchEvent({
                                                    type: 'backTimecolorOfRemind',
                                                    message: {
                                                        source: 'timeRemind',
                                                        data: {
                                                            timeColor: this.timeContainer
                                                        }
                                                    }
                                                });
                                            }
                                            //$("#time_container").removeClass("ready-end no-start ready-start start immediately-end end").addClass("immediately-end") ;
                                        }
                                        if (this.state.isShowTimeRemind == true) {
                                            this.setState({
                                                remindType: "exceedThreeMinuteOfClass",
                                                timeDifference: endTimeDifference,
                                            });//超过下课时间3分钟
                                        }
                                    } else {
                                        if (this.end.status_end_minute_0 === false) {
                                            this.end.status_end_minute_0 = true;
                                            this.setState({
                                                isShowTimeRemind: false,
                                                ableStartClass: false,
                                                ableEndClass: true,
                                            });
                                            TkAppPermissions.setAppPermissions('classBtnIsDisableOfRemind', false);
                                            if (this.timeContainer !== "end") {
                                                this.timeContainer = "end";
                                                eventObjectDefine.CoreController.dispatchEvent({
                                                    type: 'backTimecolorOfRemind',
                                                    message: {
                                                        source: 'timeRemind',
                                                        data: {
                                                            timeColor: this.timeContainer
                                                        }
                                                    }
                                                });
                                            }
                                            //$("#time_container").removeClass("ready-end no-start ready-start start immediately-end end").addClass("end") ;
                                        }
                                    }
                                } else { //已经超过时间五分钟
                                    if (this.end.status_end === false) {
                                        this.end.status_end = true;
                                        this.setState({
                                            isShowTimeRemind: true,
                                            ableStartClass: false,
                                            ableEndClass: false,
                                            isShowRemindBtn: true,
                                            remindType: "exceedFiveMinuteOfClass",
                                        });
                                        TkAppPermissions.setAppPermissions('classBtnIsDisableOfRemind', true);
                                        this.fiveIntervalTime();

                                        clearInterval(this.notClassBeginTimer);
                                        this.notClassBeginTimer = null;
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                ServiceSignalling.sendSignallingFromUpdateTime(ServiceRoom.getTkRoom().getMySelf().id);//发送更新时间的信令
            }
            intervalNumber++;
            if (intervalNumber > 300) {
                ServiceSignalling.sendSignallingFromUpdateTime(ServiceRoom.getTkRoom().getMySelf().id);
                intervalNumber = 0;
            }
        }, intervalTime);
    };
    //倒计时5秒
    fiveIntervalTime(isLeaveRoom) {
        clearInterval(this.systemTimeRemind);
        this.systemTimeRemind = setInterval(() => {
            this.state.timeOfFive = this.state.timeOfFive - 1;
            this.setState({ timeOfFive: this.state.timeOfFive });
            if (this.state.timeOfFive <= 0 || TkGlobal.isLeaveRoom) {
                this.setState({
                    isShowTimeRemind: false,
                    timeOfFive: 5,
                });
                clearInterval(this.systemTimeRemind);
                this.systemTimeRemind = null;
                if (isLeaveRoom) {
                    ServiceRoom.getTkRoom().leaveroom(); //超过上课时间并且没有上课，则关闭房间
                    setTimeout(() => {
                        ServiceRoom.getTkRoom().uninit();
                    }, 300);
                }
            }
        }, 1000);
    };
    //返回提示内容
    returnTimeEle(remindType, timeDifference) {
        let htmlStr = "";
        switch (remindType) {
            case "distanceOneMinute"://离上课时间还有一分钟
                if (!TkConstant.joinRoomInfo.endOfClassHoursIsClassOver) {
                    htmlStr = <span>{TkGlobal.language.languageData.remind.time.readyStart.one}
                        <time className="time">{Math.ceil(Math.abs(timeDifference) / (1000 * 60))}</time>
                        {TkGlobal.language.languageData.remind.time.readyStart.two}</span>;
                }
                break;
            case "noClassInTime"://超过教室时间并且没有上课
                if (!TkConstant.joinRoomInfo.endOfClassHoursIsClassOver) {
                    htmlStr = TkGlobal.language.languageData.remind.time.endNotBegin.one;
                }
                break;
            case "exceedOneMinuteOfClass"://超过上课时间一分钟后提醒
                if (!TkConstant.joinRoomInfo.endOfClassHoursIsClassOver) {
                    htmlStr = <span>{TkGlobal.language.languageData.remind.time.timeoutStart.one}
                        <time className="time">{Math.floor(timeDifference / (1000 * 60))}</time>
                        {TkGlobal.language.languageData.remind.time.timeoutStart.two}</span>;
                }
                break;
            case "oneBeforeClass"://离下课还有1分钟
                if (TkConstant.joinRoomInfo.endOfClassHoursIsClassOver) {
                    if (timeDifference > -60 * 1000) {
                        htmlStr = <span><time className="time">{Math.ceil(Math.abs(timeDifference) / (1000))}</time>
                            {TkGlobal.language.languageData.remind.time.readyEndAiBanMa.two}
                            {TkGlobal.language.languageData.remind.time.readyEndAiBanMa.three}</span>;
                    } else {
                        htmlStr = <span><time className="time">{Math.ceil(Math.abs(timeDifference) / (1000 * 60))}</time>
                            {TkGlobal.language.languageData.remind.time.readyEndAiBanMa.one}
                            {TkGlobal.language.languageData.remind.time.readyEndAiBanMa.three}</span>;
                    }
                } else {
                    htmlStr = <span>{TkGlobal.language.languageData.remind.time.readyEnd.one}
                        <time className="time">{Math.ceil(Math.abs(timeDifference) / (1000 * 60))}</time>
                        {TkGlobal.language.languageData.remind.time.readyEnd.two}</span>;
                }
                break;
            case "closeClassAfterTen"://超过下课时间10分钟10秒后关闭教室
                htmlStr = <span>{TkGlobal.language.languageData.remind.time.timeoutEnd.one}
                    <time>{this.state.timeOfTen}</time>
                    {TkGlobal.language.languageData.remind.time.timeoutEnd.two}</span>;
                break;
            case "exceedThreeMinuteOfClass"://超过下课时间3分钟
                htmlStr = <span>{TkGlobal.language.languageData.remind.time.timeoutReadyEnd.one}
                    <time className="time">{Math.floor(timeDifference / (1000 * 60))}</time>
                    {TkGlobal.language.languageData.remind.time.timeoutReadyEnd.two}
                    <time className="time">{(5 - Math.floor(timeDifference / (1000 * 60)))}</time>
                    {TkGlobal.language.languageData.remind.time.timeoutReadyEnd.three}</span>;
                break;
            case "exceedFiveMinuteOfClass"://已经超过时间五分钟
                htmlStr = TkGlobal.language.languageData.remind.time.endBegin.one;
                break;
        }
        return htmlStr;
    }
    //点击隐藏
    remindBtnClick() {
        this.setState({ isShowTimeRemind: false });
    }

    render() {
        return (
            <div className={"sys-time-remind " + (TkConstant.joinRoomInfo.endOfClassHoursIsClassOver ? " aibanma-remind-center" : " add-position-absolute-top0-right0")} style={{ display: (TkConstant.joinRoomInfo.endOfClassHoursIsClassOver ? (this.state.isShowTimeRemind && (TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant || TkConstant.hasRole.roleStudent || TkConstant.hasRole.rolePatrol)) : (this.state.isShowTimeRemind && TkConstant.hasRole.roleChairman)) ? "block" : "none" }} > {/*提示信息*/}
                <span className="message" id="remind_msg">{this.returnTimeEle(this.state.remindType, this.state.timeDifference)}</span>
                <button className="know-btn" style={{ display: (this.state.isShowRemindBtn && !TkConstant.joinRoomInfo.endOfClassHoursIsClassOver) ? "inline-block" : "none" }} id="remind_ok_btn" onClick={this.remindBtnClick.bind(this)} ><span className="btn-content" >{TkGlobal.language.languageData.remind.button.remindKnow.text} <span>{this.state.timeOfFive}’</span></span></button>
            </div>
        )
    };
};
export default TimeRemind;