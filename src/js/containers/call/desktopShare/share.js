/**
 * 屏幕共享 Smart组件
 * @module DestTop
 * @description   提供 屏幕共享组件
 * @author xiagd
 * @date 2017/08/10
 */
'use strict';
import React  from 'react';
import CoreController from 'CoreController' ;
import TkUtils from 'TkUtils';
import TkGlobal from 'TkGlobal';
import eventObjectDefine from 'eventObjectDefine';
import ServiceRoom from 'ServiceRoom';
import TkConstant from "TkConstant";

class DestTop extends React.Component{
    constructor(props){
        super(props);
        this.programmShare=false;
        this.programmArray = []; //可共享程序列表
        this.selectProgramm = undefined;
        this.state = {
            shareType: this.props.shareType,
            liveStreamState: undefined,
        }
    };

    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        if(this.props.isPlayFlag && this.props.stream && this.props.stream.extensionId){
            ServiceRoom.getTkRoom().unplayRemoteScreen(this.props.stream.extensionId);
        }
        eventObjectDefine.CoreController.removeBackupListerner(this.listernerBackupid );
    };

    componentDidMount(){
        let that = this;
        if(this.props.isPlayFlag && this.props.stream && this.props.stream.extensionId){
            ServiceRoom.getTkRoom().playRemoteScreen(this.props.stream.extensionId,'screen'+that.props.stream.extensionId,{loader:true});
        }
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomUserpropertyChanged, this.closeEmpowerCancelShare.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomDelmsg , that.handlerRoomDelmsg.bind(that), that.listernerBackupid); //roomDelmsg事件 下课事件 classBegin
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomPubmsg , that.handlerRoomPubmsg.bind(that), that.listernerBackupid); //roomPubmsg事件 桌面共享事件
    }


    /*停止共享 回调父函数*/
    stopScreenShare(){
            let that = this;
            that.props.unScreenSharing();
    }
    closeEmpowerCancelShare(roomUserpropertyChangedEventData){
        let user = roomUserpropertyChangedEventData.user ;
        if(roomUserpropertyChangedEventData.message.candraw === false && user.id === ServiceRoom.getTkRoom().getMySelf().id && this.props.isMe){
            if(this.props.isPlayFlag){  // 根據腹肌傳入的屬性兩次判斷是否 正在直播
                let that = this;
                that.props.unScreenSharing();
            }
        }
    }



    /*直播结束共享*/
    handleShareStreamEnd(){
        let that = this;
        that.setState({
            liveStreamState: false,
        })
    }

    handlerRoomDelmsg(recvEventData){

        const that = this ;
        let pubmsgData = recvEventData.message;
        switch(pubmsgData.name)
        {
            case "LiveShareStream":{
                that.handleShareStreamEnd();
                break;
            }
            case "ClassBegin":{
                if(that.state.liveStreamState)
                break;
            }
        }
    }

    handlerRoomPubmsg(recvEventData){
        const that = this ;
        let mySelf = ServiceRoom.getTkRoom().getMySelf();

        let pubmsgData = recvEventData.message ;
        switch(pubmsgData.name)
        {
            case "OnlyAudioRoom":
                this.stopScreenShare();
                break;
            case "LiveShareStream":{
                that.handleShareStreamStart();
                if(mySelf.role === TkConstant.role.roleChairman){
                }
                this.selectProgramm = parseInt(pubmsgData.data.selectProgramm);
                break;
            }
            }
    }

    handlerOnDoubleClick(event){ //双击视频全屏
        let that = this;
        if(! CoreController.handler.getAppPermissions('dblclickDeviceVideoFullScreenRight')){return ; } ;
        let targetVideo = that.refs.destTopPlayer;
        if(targetVideo){
            if( TkUtils.tool.isFullScreenStatus(targetVideo) ) {
                TkUtils.tool.exitFullscreen(targetVideo);
            }else{
                TkUtils.tool.launchFullscreen(targetVideo);
            }
        }
    };



    _loadComponent(isMe){
        let that = this;
        let destTopComponents = undefined ;
        let mySelf = ServiceRoom.getTkRoom().getMySelf();
        if(isMe){
            let shareText = TkGlobal.language.languageData.shares.shareing.text2;
            if(that.props.shareType || that.props.shareType === 0){
                switch (this.props.shareType){
                    case 0 :
                        shareText = TkGlobal.language.languageData.shares.shareing.text0;
                        break;
                    case 1 :
                        shareText = TkGlobal.language.languageData.shares.shareing.text1;
                        break;
                    case 2 :
                        shareText = TkGlobal.language.languageData.shares.shareing.text2;
                        break;
                }
            }
            destTopComponents = <div className={"screen-share-" + (that.props.isPlayFlag ? "all" : "unall") +  " screen-share-wrap"}>
                <div className="screen-share-wrap-box" >
                    <div className="screen-share-wrap-bg" >
                        {/*<img src={Bg} />*/}
                    </div>
                    <select ref="programmShareSelect" className="programm-share-select-stop"   style={{display: this.props.shareType===0? 'block' : 'none'}} >

                    </select>
                    <button className="screen-share-wrap_button" onClick={this.stopScreenShare.bind(that)}>{TkGlobal.language.languageData.shares.stopShare.text}</button>
                </div>
            </div>;
        } else{
                destTopComponents =
                    <div ref="destTopPlayer" className={"screen-share-" + (that.props.isPlayFlag ? "all" : "unall")}
                         id={that.props.stream !== undefined ? 'screen'+that.props.stream.extensionId : ""}
                         onDoubleClick={that.handlerOnDoubleClick.bind(that)}/>;


        }
        return {destTopComponents:destTopComponents};
    }

    render(){
        let that=this;
        let {isMe} = that.props;
        let {destTopComponents} = that._loadComponent(isMe);
        return (
            <div  className="add-fl clear-float tool-and-literally-wrap add-position-relative "  id={"screenStreamContainer"}>
                {destTopComponents}
            </div>
        )
    };
};

export  default  DestTop;
