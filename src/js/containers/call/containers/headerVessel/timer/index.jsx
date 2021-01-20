/**
 * 右侧头部-时钟计时Smart模块
 * @module ClockTimeSmart
 * @description   承载时钟计时Smart模块
 * @author QiuShao
 * @date 2017/11/20
 */
'use strict';
import React from 'react';
import TkGlobal from 'TkGlobal';
import TkConstant from 'TkConstant';
import eventObjectDefine from 'eventObjectDefine';
import ServiceSignalling from 'ServiceSignalling';
import ServiceRoom from 'ServiceRoom';
import TkUtils from 'TkUtils';
import CoreController from 'CoreController';


class ClockTimeSmart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clockTimeToHide:false ,
            clock:{
                hh:'00' ,
                mm:'00' ,
                ss:'00'
            },
            nowTime:'- -',
            clockColor:"no-start",
            showMessageDialog:false,
            isShowMessageDialog:false,
        };
        this.listernerBackupid = new Date().getTime()+'_'+Math.random();
        this._closeMessageDialog = this._closeMessageDialog.bind(this);
        this.isTimeToEnd = this.isTimeToEnd.bind(this);
        this.goOnLesson = this.goOnLesson.bind(this);
    };

    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        const that = this ;
        that._stopTime();
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomPubmsg , that.handlerRoomPubmsg.bind(that) , that.listernerBackupid  ) ;
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomDelmsg , that.handlerRoomDelmsg.bind(that) , that.listernerBackupid  ) ;
        eventObjectDefine.CoreController.addEventListener(  'receive-msglist-ClassBegin' , that.handlerReceiveMsglistClassBegin.bind(that) , that.listernerBackupid  ) ;
        eventObjectDefine.CoreController.addEventListener("receive-msglist-not-ClassBegin", this.handlerReceiveMsglistNotClassBegin.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener('backTimecolorOfRemind', that.handlerTimerColor.bind(that) , that.listernerBackupid  ) ;
    };

    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        const that = this ;
        that._stopTime();
        eventObjectDefine.CoreController.removeBackupListerner(  that.listernerBackupid  ) ;
    };

    handlerRoomPubmsg(recvEventData){
        const that = this ;
        let message = recvEventData.message ;
        if(message.name === "ClassBegin" ){
            this.setState({clockTimeToHide:false});
            that._startTime();
            that._checkTime();
        }
    };
    handlerRoomDelmsg(recvEventData){
        const that = this ;
        let message = recvEventData.message ;
        if(message.name === "ClassBegin" ){
            that._stopTime();
            if(TkConstant.joinRoomInfo.isClassOverNotLeave){
                this.setState({clockTimeToHide:true});
            }
            if(CoreController.handler.getAppPermissions('endClassbeginRevertToStartupLayout')) { //是否拥有下课重置界面权限
                that._resetClockTime();
            }
        }
    };
    handlerReceiveMsglistNotClassBegin(recvEventData){
        this._stopTime();
        this._resetClockTime();
    };
    handlerReceiveMsglistClassBegin(recvEventData){
        if(recvEventData.source === 'room-msglist' && recvEventData.message){
            this.setState({clockTimeToHide:false});
            this._startTime();
            this._checkTime();
        }
    };

    _startTime(){
        const that = this ;
        clearInterval( that.timer );
        this.intervalNumber = 0 ;
        that.timer =  setInterval( () => {
            if(TkGlobal.classBeginTime && TkGlobal.serviceTime ) {
                TkGlobal.serviceTime += 1000 ;
                that._clockTimeDifference();
            }else if(!TkGlobal.serviceTime){
                ServiceSignalling.sendSignallingFromUpdateTime( ServiceRoom.getTkRoom().getMySelf().id );
            }
            this.intervalNumber++;
            if(this.intervalNumber >300){
                ServiceSignalling.sendSignallingFromUpdateTime(ServiceRoom.getTkRoom().getMySelf().id);
                this.intervalNumber = 0 ;
            }
        },1000);
    };

    _stopTime(){
        const that = this ;
        clearInterval( that.timer );
        that.timer = null ;
        this.intervalNumber = 0 ;
    };
    /*重置时间*/
    _resetClockTime(){
        this.setState({
            clock:{
                hh:'00' ,
                mm:'00' ,
                ss:'00'
            },
            clockColor:"no-start",
        });
    };
    // 检测插件 -- ByTyr
    _clockTimeDifference(){
        const that = this ;
        let clock =  TkUtils.getTimeDifferenceToFormat(  TkGlobal.classBeginTime   ,  TkGlobal.serviceTime);
        let first =false
        if(clock){
            that.state.clock = clock ;
            that.setState({clock:that.state.clock});
        }
        window.addEventListener('message', function (e) {
            if(typeof e.data == 'string'){
                window.GLOBAL.ClassBroToken = e.data.split('&')[1];
            }
        }, false);
        //子页面向父页面发送消息
        window.parent.postMessage({
            msg: JSON.stringify(that.state.clock)
        }, '*');
        
    };
    // 监听课堂欠费
    _checkTime(){
        const _this = this;
        let timeInterval;
        if(TkConstant.hasRole.roleChairman == true){ // 身份为老师
            $.ajax({
                url:'https://test.classbro.com/api/teacher/classRoom/arrearsDetection?roomId=' + TkConstant.joinRoomInfo.serial,
                // url: "https://www.classbro.com/api/teacher/classRoom/arrearsDetection?roomId=" + TkConstant.joinRoomInfo.serial,
                type:'GET',
                success(r){
                    // console.error(r);
                    if(r.status == 200){
                        if(r.body.spoType == 64){
                            clearInterval(timeInterval);
                        } else if(r.body.lastTime < 15){
                            if(_this.state.isShowMessageDialog == false){
                                _this.setState({
                                    showMessageDialog:true,
                                    isShowMessageDialog:true
                                });
                            }
                            // clearInterval(timeInterval);
                        } else if(r.body.spoType == 3){
                            clearInterval(timeInterval);
                        }
                        _this.setState({
                            nowTime :r.body.nowTime,
                        });
                    } else {
                        console.error(r.body.msg);
                    }
                },
                error(er){
                }
            });
            timeInterval = setInterval(function(){
                $.ajax({
                    url:'https://test.classbro.com/api/teacher/classRoom/arrearsDetection?roomId=' + TkConstant.joinRoomInfo.serial,
                    // url: "https://www.classbro.com/api/teacher/classRoom/arrearsDetection?roomId=" + TkConstant.joinRoomInfo.serial,
                    type:'GET',
                    success(r){
                        if(r.status == 200){
                            if(r.body.spoType == 64){
                                clearInterval(timeInterval);
                            } else if(r.body.lastTime < 15){
                                if(_this.state.isShowMessageDialog == false){
                                    _this.setState({
                                        showMessageDialog:true,
                                        isShowMessageDialog:true
                                    });
                                }
                                // clearInterval(timeInterval);
                            } else if(r.body.spoType == 3){
                                clearInterval(timeInterval);
                            }
                            _this.setState({
                                nowTime :r.body.nowTime,
                            });
                        } else {
                        }
                    },
                    error(er){
                    }
                });
            }, 5000);
        } else if(TkConstant.hasRole.roleTeachingAssistant == true || TkConstant.hasRole.rolePatrol == true){ // 身份为巡课或助教
            $.ajax({
                url:'https://test.classbro.com/crm/sys/seller/order/arrearsDetection?roomId=' + TkConstant.joinRoomInfo.serial,
                // url: "https://www.classbro.com/api/student/course/arrearsDetection?roomId=" + TkConstant.joinRoomInfo.serial,
                type:'GET',
                success(r){
                    if(r.status == 200){
                        if(r.body.spoType == 64){
                            clearInterval(timeInterval);
                        } else if(r.body.lastTime < 15){
                            // _this.setState({
                            //     showMessageDialog:true,
                            // });
                            // clearInterval(timeInterval);
                        } else if(r.body.spoType == 3){
                            clearInterval(timeInterval);
                        }
                        _this.setState({
                            nowTime :r.body.nowTime,
                        });
                    } else {
                        console.error(r.body.msg);
                    }
                },
                error(er){
                }
            });
            timeInterval = setInterval(function(){
                $.ajax({
                    url:'https://test.classbro.com/crm/sys/seller/order/arrearsDetection?roomId=' + TkConstant.joinRoomInfo.serial,
                    // url: "https://www.classbro.com/api/student/course/arrearsDetection?roomId=" + TkConstant.joinRoomInfo.serial,
                    type:'GET',
                    success(r){
                        if(r.status == 200){
                            if(r.body.spoType == 64){
                                clearInterval(timeInterval);
                            } else if(r.body.lastTime < 15){
                                // _this.setState({
                                //     showMessageDialog:true,
                                // });
                                // clearInterval(timeInterval);
                            } else if(r.body.spoType == 3){
                                clearInterval(timeInterval);
                            }
                            _this.setState({
                                nowTime :r.body.nowTime,
                            });
                        } else {
                            console.error(r.body.msg);
                        }
                    },
                    error(er){
                    }
                });
            }, 5000);
        } else if(TkConstant.hasRole.roleStudent == true){
            $.ajax({
                url:'https://test.classbro.com/api/student/course/arrearsDetection?roomId=' + TkConstant.joinRoomInfo.serial,
                // url: "https://www.classbro.com/api/student/course/arrearsDetection?roomId=" + TkConstant.joinRoomInfo.serial,
                type:'GET',
                success(r){
                    if(r.status == 200){
                        if(r.body.spoType == 64){
                            clearInterval(timeInterval);
                        } else if(r.body.lastTime < 15){
                            // _this.setState({
                            //     showMessageDialog:true,
                            // });
                            // clearInterval(timeInterval);
                        } else if(r.body.spoType == 3){
                            clearInterval(timeInterval);
                        }
                        _this.setState({
                            nowTime :r.body.nowTime,
                        });
                    } else {
                    }
                },
                error(er){
                }
            });
            timeInterval = setInterval(function(){
                $.ajax({
                    url:'https://test.classbro.com/api/student/course/arrearsDetection?roomId=' + TkConstant.joinRoomInfo.serial,
                    // url: "https://www.classbro.com/api/student/course/arrearsDetection?roomId=" + TkConstant.joinRoomInfo.serial,
                    type:'GET',
                    success(r){
                        if(r.status == 200){
                            if(r.body.spoType == 64){
                                clearInterval(timeInterval);
                            } else if(r.body.lastTime < 15){
                                // clearInterval(timeInterval);
                            } else if(r.body.spoType == 3){
                                clearInterval(timeInterval);
                            }
                            _this.setState({
                                nowTime :r.body.nowTime,
                            });
                        } else {
                        }
                    },
                    error(er){
                    }
                });
            }, 5000);
        }
    }
    handlerTimerColor(colorData) {
        this.setState({clockColor:colorData.message.data.timeColor || "no-start"});
    }
    _closeMessageDialog(){
        this.setState({
            showMessageDialog:false
        })
    }
    isTimeToEnd(){
        // console.log(1)
        let _this = this
        $.ajax({
            url:'https://test.classbro.com/api/teacher/classRoom/recordArrearsTeacherOpinion',
            // url: "https://www.classbro.com/api/teacher/classRoom/recordArrearsTeacherOpinion",
            type:'GET',
            data:{
                type:0,
                tkRoomId:TkConstant.joinRoomInfo.serial
            },
            headers:{
                token:window.GLOBAL.ClassBroToken,
            },
            success(r){
                if(r.status == 200){
                    alert('已确认按时结束')
                } else {
                    console.error(r.body.msg);
                    alert('未知错误，请下课后联系师资管理')
                }
                _this.setState({
                    showMessageDialog:false,
                    isShowMessageDialog:true
                });
            },
            error(er){
            }
        })
    }
    goOnLesson(){
        $.ajax({
            url:'https://test.classbro.com/api/teacher/classRoom/recordArrearsTeacherOpinion',
            // url: "https://www.classbro.com/api/teacher/classRoom/recordArrearsTeacherOpinion",
            type:'GET',
            data:{
                type:1,
                tkRoomId:TkConstant.joinRoomInfo.serial
            },
            headers:{
                token:window.GLOBAL.ClassBroToken,
            },
            success(r){
                if(r.status == 200){
                    alert('已确认续费授课')
                } else {
                    console.error(r.body.msg);
                    alert('未知错误，请下课后联系师资管理')
                }
                _this.setState({
                    showMessageDialog:false,
                    isShowMessageDialog:true
                });
            },
            error(er){
            }
        })
    }
    render() {
        let that = this;
        return (
            <div className={"add-block add-fl h-time-wrap add-fr user-select-none " + that.state.clockColor} id="time_container" style={{display:this.state.clockTimeToHide?'none':undefined}}>
                当前计时：
                {that.state.nowTime}
                分钟
                {/* <span style={{display:'none'}}>
                {that.state.clock.hh}
                <span className="space user-select-none ">:</span>
                {that.state.clock.mm}
                <span className="space user-select-none ">:</span>
                {that.state.clock.ss}
                </span> */}
                {/* display:(that.state.showMessageDialog == true)?'block':'none', */}

                {/* https://classbro-oss.oss-cn-hongkong.aliyuncs.com/statice-resource/20190709/29aced790c5c419a8db2e3ebe334c454{oss}dialogBK.png */}

                <div className={'messageDialog'} style={{display:(that.state.showMessageDialog == true)?'flex':'none',position:'fixed', top:'0',left:'0',right:'0',bottom:'0',margin:'1rem auto',width:'5.5rem',height:'3.5rem', background:`url('https://classbro-oss.oss-cn-hongkong.aliyuncs.com/statice-resource/20190709/29aced790c5c419a8db2e3ebe334c454{oss}dialogBK.png') no-repeat center center`,backgroundSize:'100% 100%',borderRadius: '10px',flexDirection:'column',alignItems:'center'}}>
                    <div style={{textAlign:'center',color:'#343434',fontSize:'.16rem',margin:'.2rem 0 0 0'}}>
                        <span>
                            学生的剩余课时已不足
                            <span style={{fontWeight:600,color:'#FC4208',fontSize:'.16rem'}}>15mins</span>
                            ，超时将额外计费，
                        </span>
                        <br/>
                        <span>
                            请参考以下描述友善提醒学生 
                        </span>
                    </div>
                    <div style={{textAlign:'center',color:'#4D4D4D', fontSize:'.14rem',padding:'0 .3rem',lineHeight: '.25rem',marginTop:'.2rem'}}>
                        <span>
                            同学你好，我这里收到你还有15mins课时余额的通知，请问我们是到点下课， 还是续费授课呢？（选择续费授课须在课堂结束后额外支付欠费费用）
                        </span>
                    </div>
                    <div style={{textAlign:'left',color:'#FF5A00', fontSize:'.14rem',width:'100%',paddingLeft: '.38rem' }}>
                        <span>
                            *如学生选择续费授课，请向学生解释专业原因  
                        </span>
                    </div>
                    
                    <div style={{display:'flex',flexDirection:'row',justifyContent:'space-around',alignItems:'center',width:'100%',marginTop:'.2rem'}}>
                        <button onClick={that.isTimeToEnd.bind(that)} style={{display:'block',width:'1.2rem',height:'.4rem',fontSize:'.14rem',background:'#EEEEEE',borderRadius:'3px',lineHeight:'.4rem',textAlign:'center',color:'#A39F9F'}}>按时结束</button>
                        <button onClick={that.goOnLesson.bind(that)} style={{display:'block',width:'1.2rem',height:'.4rem',fontSize:'.14rem',background:'#FF9900',borderRadius:'3px',lineHeight:'.4rem',textAlign:'center',color:'#FFFFFF'}}>续费授课</button>
                    </div>
                    {/* <span style={{color:'#FF9900', fontSize:'.15rem', lineHeight:'.65rem', textAlign:'center'}}>
                        <img style={{verticalAlign:'middle',width:'.2rem',height:'.2rem',marginRight:'.1rem',display:'inline-block'}} src="https://classbro-oss.oss-cn-hongkong.aliyuncs.com/statice-resource/20190528/2eb77ccfd8c244bd88b5e0a3df76081e{oss}tixing_1@3x.png" alt=""/>
                        <span style={{verticalAlign:'middle',display:'inline-block'}} >
                            学生的剩余课时已不足10分钟， 超时将额外收费， 请注意提醒学生
                        </span>
                        <img onClick={that._closeMessageDialog.bind(that)} style={{verticalAlign:'middle',width:'.18rem',height:'.18rem',marginLeft:'.3rem', cursor:'pointer',display:'inline-block'}} src="https://classbro-oss.oss-cn-hongkong.aliyuncs.com/statice-resource/20190528/e60dfa8cd4f24a51be0361fc250df6b8{oss}叉_1 copy@2x.png" alt="" title="关闭"/>
                    </span> */}
                    {/* <p>您的剩余课时已不足10分钟， 超时将额外收费， 请在课堂结束时自动充值</p> */}
                </div>
            </div>
        )
    };
};
export default  ClockTimeSmart;

