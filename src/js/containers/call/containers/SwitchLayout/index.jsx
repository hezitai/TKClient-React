/**
 * @author  zhixiang
 * @date 2018/11/27
 * @description   切换布局面板组件
 */

import React from 'react';
import TkGlobal from "TkGlobal";
import LayoutItem from './LayoutItem';
import styled from "styled-components";
import eventObjectDefine from 'eventObjectDefine';
import './static/css/index.css';
import './static/css/black.css';
const LayoutContainerDiv = styled.div`
    display: ${props => (props.isShow ? "block" : 'none')};
`;

const ToastMsg = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 0 .16rem;
    border-radius: .06rem;
    height: .46rem;
    line-height: .46rem;
    width: auto;
    font-size: .14rem;
    color: #FFF;
    background: rgba(0, 0, 0, .6);
`;

export default class SwitchLayout extends React.Component{
    constructor(){
        super();
        this.state = {
            activeClass:'CoursewareDown',    //默认选中状态
            isSynStudent:true,   //是否同步学生端
            isShow: false,   //是否显示布局切换列表
            toastShow: false, // 多人/主讲模式切换其他布局台上人数过多是  提示框  是否显示
            realClass: "CoursewareDown", // 真实的选中状态，用作切换失败的时候切回正确的布局
        }
        // this.state = {
        //     activeClass:'Encompassment',    //默认选中状态
        //     isSynStudent:true,   //是否同步学生端
        //     isShow: false,   //是否显示布局切换列表
        //     toastShow: false, // 多人/主讲模式切换其他布局台上人数过多是  提示框  是否显示
        //     realClass: "Encompassment", // 真实的选中状态，用作切换失败的时候切回正确的布局
        // }
        this.LayoutItemData = [
            {
                className: 'CoursewareDown',
                name: TkGlobal.language.languageData.layoutInfo.CoursewareDown,//视频置顶
            },
            {
                className: 'VideoDown',
                name: TkGlobal.language.languageData.layoutInfo.VideoDown,//视频置底
            },
            {
                className: 'Encompassment',
                name: TkGlobal.language.languageData.layoutInfo.Encompassment,//视频围绕
            },
            {
                className: 'Bilateral',
                name: TkGlobal.language.languageData.layoutInfo.Bilateral,//主讲排列
            },
            {
                className: 'MorePeople',
                name: TkGlobal.language.languageData.layoutInfo.MorePeople,//多人模式
            },
            //todo  此版本暂时不加纯视频
            // {
            //     className:'OnlyVideo',
            //     name:'纯视频',
            //     img:onlyVideoImg,
            // },
        ];

        this.listernerBackupid = new Date().getTime()+'_'+Math.random();
    }
    componentDidMount(){
        eventObjectDefine.CoreController.addEventListener('triggerSwitchLayout',this.handleTriggerSwitchLayout.bind(this),this.listernerBackupid);    //监听开启关闭切换布局
        eventObjectDefine.CoreController.addEventListener("receive-msglist-SwitchLayout",this.handleMsgListSwitchLayout.bind(this),this.listernerBackupid); //监听断线重连切换布局信令
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPubmsg,this.handlerRoomPubmsg.bind(this),this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener( "SwitchLayout", this.handleSwitchLayout.bind(this), this.listernerBackupid ); //监听切换布局的事件
    }
    componentWillUnmount(){
        eventObjectDefine.CoreController.removeBackupListerner(this.listernerBackupid );
    };
    handlerRoomPubmsg(recvEventData) {
        let pubmsgData = recvEventData.message;
        switch (pubmsgData.name) {
          case "switchLayout":
            this.setState({
                activeClass:pubmsgData.data.nowLayout
            })
            break;
        }
      }
    handleMsgListSwitchLayout(data){
        this.setState({
            activeClass:data.message.nowLayout
        })
    }
    
    close(){
        this.setState({
            isShow: false
        })
    }

    //处理监听切换布局的事件
    handleSwitchLayout(data) {
        let { nowLayout} = data;  //当前布局
        this.setState({ activeClass: nowLayout });
    }

    handleTriggerSwitchLayout(data){
        this.setState({
            isShow:data.layoutActive
        })
    }
    LayoutClick(type){
        this.setState({activeClass:type, realClass: this.state.activeClass});
    }
    handlerSynStudentClick(){
        this.setState({
            isSynStudent:!this.state.isSynStudent
        })
    }
    handleConfirmClick() {
        const { activeClass, isSynStudent, realClass } = this.state;
        const { streamLen } = this.props;
        
        if ((activeClass !== "MorePeople" && activeClass !== "Bilateral") && this.props.streamLen > 7) {
            this.setState({
                toastShow: true,
                activeClass: realClass,
            });
            let toastTimer = setTimeout(() => {
                this.setState({
                    toastShow: false
                });
                clearTimeout(toastTimer);
            }, 3000);
            return;
        }
        eventObjectDefine.CoreController.dispatchEvent({ type: "triggerSwitchLayout",layoutActive:false,message:{}});
        eventObjectDefine.CoreController.dispatchEvent({type:"SwitchLayout",nowLayout: activeClass,isSynStudent: isSynStudent})  //派发切换布局事件
    }
    //阻止点击关闭弹框
    _stopPreventClick(e){
        e.preventDefault();
        e.stopPropagation();
    }
    render(){
        const { LayoutItemData } = this;
        const { toastShow } = this.state;
        let className = '';
        if(TkConstant.hasRole.roleTeachingAssistant){
            className = 'layout-container-teachingAssistant';
        }else if(TkConstant.joinRoomInfo.hiddenClassBegin && !TkConstant.joinRoomInfo.helpcallbackurl && TkGlobal.isClient){
            className = 'layout-container-teachingAssistant';
        }
        return (
            <React.Fragment>
                {toastShow ? <ToastMsg>当前台上人数过多，无法切换</ToastMsg> : ""}
                <LayoutContainerDiv className={`layout-container ${className} `} isShow={this.state.isShow} onClick={this._stopPreventClick.bind(this)}>
                    <div className="layout-box">
                        {LayoutItemData.map((item, index) => (
                            <LayoutItem
                                key={index}
                                isActive={this.state.activeClass === item.className}
                                {...item}
                                LayoutClick={this.LayoutClick.bind(
                                    this,
                                    item.className
                                )}
                            />
                        ))}
                    </div>
                    <div className="other-box">
                        <div className={`synStudent ${this.state.isSynStudent ? "active" : ""}`} onClick={this.handlerSynStudentClick.bind(this)}>
                            <i className="checkbox" />
                            <span className="text">
                                {TkGlobal.language.languageData.layoutInfo.synStudent}
                            </span>
                        </div>
                        <button className="confirmBtn" onClick={this.handleConfirmClick.bind(this)} title={TkGlobal.language.languageData.alertWin.ok.showPrompt.text}>
                            {TkGlobal.language.languageData.alertWin.ok.showPrompt.text}
                        </button>
                    </div>
                </LayoutContainerDiv>
            </React.Fragment>
        );
    }
}