/**
 * 工具箱 Smart组件
 * @module ProgrammShareSmart
 * @description   桌面共享组件
 * @author xiaguodong
 * @date 2017/11/27
 */

'use strict';
import "./static/css/index.css";
import "./static/css/index_black.css";
import React from 'react';
import TkGlobal from 'TkGlobal' ;
import TkConstant from 'TkConstant';
import eventObjectDefine from 'eventObjectDefine';
import ServiceRoom from 'ServiceRoom';
import ServiceTools from 'ServiceTools';
import ReactDrag from 'reactDrag';

class ProgrammShareSmart extends React.Component {
    constructor(props){
        super(props);
        this.state={
            modeStatuses: [false, true, false],
            programmShare:false,
            shareStream:undefined,
            type:3,
        };
        this.listernerBackupid =  new Date().getTime()+'_'+Math.random();
        this.isPublish = false;
        this.programmArray = [];    //可共享列表数组
        this.selectProgramm = undefined;

    };
    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        const that = this;
        eventObjectDefine.CoreController.addEventListener("programmShare",that.handlerProgrammShare.bind(that));
        eventObjectDefine.CoreController.addEventListener("DisconnectionRoom",that.clickCloseProgrammShare.bind(that));
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomDelmsg , that.handlerRoomDelmsg.bind(that), that.listernerBackupid); //roomDelmsg事件 下课事件 classBegin
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPlaybackClearAllFromPlaybackController,that.handlerRoomPlaybackClearAll.bind(that) , that.listernerBackupid); //roomPlaybackClearAll 事件：回放清除所有信令

    };
    //在组件完成更新后立即调用,在初始化时不会被调用
    componentDidUpdate(prevProps , prevState){
        if (prevState.programmShare !== this.state.programmShare && this.state.programmShare) {
            this.setDefaultPosition();
        }
    };

    componentWillUnmount() {
        eventObjectDefine.CoreController.removeBackupListerner(this.listernerBackupid );
    };

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


    handlerRoomDelmsg(recvEventData){
        const that = this ;
        let pubmsgData = recvEventData.message ;
        switch(pubmsgData.name)
        {
            case "ClassBegin":{
                if(this.state.programmShare) {
                    that.wsToggle(false);
                    that.setState({
                        programmShare:false,
                    });
                }
                break;
            }
        }
    }

    handlerRoomPlaybackClearAll(){  //重置数据
        this.setState({
            modeStatuses: [false, false, true],
            programmShare:false,
            shareStream:undefined,
        });
        this.isPublish = false;
        this.programmArray = [];    //可共享列表数组
        this.selectProgramm = undefined;
    };


    /*侦听工具箱桌面共享按钮事件*/
    handlerProgrammShare(){
        let that = this;
        that.setState({
            modeStatuses: [false, false, true],
            programmShare:true,
        });
    }


    handlerShareRegionClick(){
        let that = this;
    }

    shareFailure(e){
        L.Logger.error('Share the failure'+e)
    }
    /*桌面共享*/
    handlerShareFullScreenClick(){
        let catchcursor=TkConstant.joinRoomInfo.sharedMouseLocus;
        this.closeProgrammShare();  //关闭本页
        ServiceTools.stopAllMediaShare();
        if(TkGlobal.isClient){
            ServiceRoom.getNativeInterface().createShareScreenWindow(0,0, 0,0,false,false,this.shareFailure,catchcursor)
            ServiceRoom.getNativeInterface().startShareScreen(this.shareFailure);
            eventObjectDefine.CoreController.dispatchEvent({
                type: 'hasToolBox',
                message: {
                    isHasToolBox: false
                }
            });
        }
    }


    clickCloseProgrammShare(){
        let that = this;
        that.wsToggle(false);
        that.closeProgrammShare();

        //关闭共享页面，启用工具箱按钮
		eventObjectDefine.CoreController.dispatchEvent({
			type:'colse-holdAll-item' ,
			message: {
				type: 'sharing'
			}
		});
        
    }

    //关闭
    closeProgrammShare(){
        let that = this;
        that.setState({
            programmShare:false,
        });
        that.isPublish = false;
        eventObjectDefine.CoreController.dispatchEvent({
            type: 'disabledSharing'
        });
    }
 
    wsToggle(t){  // t为开关
      let catchcursor=TkConstant.joinRoomInfo.sharedMouseLocus;
      if(TkGlobal && TkGlobal.isClient && !TkGlobal.isMacClient){
          if(t){
              ServiceRoom.getNativeInterface().createShareScreenWindow(400,300, window.innerWidth/2-500,window.innerHeight/2-150,false,false,this.shareFailure,catchcursor);//区域描述
          }else{
              ServiceRoom.getNativeInterface().destroyShareScreenWindow()
          }
      }
    }

    /*区域共享*/
    handlerShareAreaClick(){
        if(TkGlobal.isMacClient){return false}
        this.closeProgrammShare();  //关闭本页
        ServiceTools.stopAllMediaShare();
        ServiceRoom.getNativeInterface().startShareScreen(this.shareFailure);
        eventObjectDefine.CoreController.dispatchEvent({
            type: 'hasToolBox',
            message: {
                isHasToolBox: false
            }
        });
    }

    changeMode(type){  // type =>  0/1/2 : program/full/area
        if(type === 0 ){
            //程序共享
            this.wsToggle(false);   //关闭区域窗口
            this.handlerProgrammShareSelect();  //获取可共享程序
        }else if(type === 1 ){
            //区域共享
            this.wsToggle(true);   //开启区域窗口

        }else if(type === 2 ){
            //桌面共享
            this.wsToggle(false);    //关闭区域窗口
        }else {
            this.wsToggle(false);   //关闭区域窗口
            return ;
        }

        this.setState({
            modeStatuses: (Array.from(this.state.modeStatuses)).map((item, index) => index === type),
        });
    }

    next(){
        let activeMode = undefined;
        for(let i = 0; i < this.state.modeStatuses.length; i++){
            if(this.state.modeStatuses[i]===true){
                activeMode = i;
            }
        }
        if(activeMode === undefined)return;

        switch (Number(activeMode)) {
            case 0:     //程序共享
                break;
                
            case 1:     //区域共享
                this.handlerShareAreaClick();
                
                break;
                
            case 2:     //桌面共享
                this.handlerShareFullScreenClick();
                break;
        
            default:
                break;
        }
    }



    onComboBoxChanged(e){
        this.selectProgramm = this.refs.programmShareSelect.value;
    }


    /*获取可共享的程序*/
    handlerProgrammShareSelect(){
        let that = this;
        if(TkGlobal.isClient  && ServiceRoom.getNativeInterface()){
            ServiceRoom.getNativeInterface().getShareableApplicationsList( (windowList) => {//可共享程序列表
                if (!Array.isArray(windowList)) return;
                that.programmArray = [];
                let select = that.refs.programmShareSelect;
                select.innerHTML = "";
                for(let index=0; index < windowList.length; index++)
                {
                    let flag = false;
                    for(let i=0;i<that.programmArray.length;i++){
                        if(that.programmArray[i].value === windowList[index].id ){
                            flag = true;
                            break;
                        }
                    }
                    if(!flag) {
                        let item = {};
                        item.value = windowList[index].id;
                        item.label = windowList[index].title;

                        that.programmArray.push(item);

                        let textData = windowList[index].title.indexOf("-") !== -1?windowList[index].title.split("-")[0]:windowList[index].title;

                        let optionItem = document.createElement("option");
                        //optionItem.style.width = "350px";
                        //optionItem.style.overflowX= "hidden";
                        optionItem.title = windowList[index].title;
                        optionItem.value = windowList[index].id;
                        optionItem.text = textData;
                        select.options.add(optionItem);
                    }
                }
                that.selectProgramm = that.programmArray[0].value;

            })
        }
    }


    render(){
        let that = this;
        const {id, programmShareDrag, draggableData} = this.props;
        let DraggableData = Object.customAssign({
            id:id,
            percentPosition:{percentLeft:programmShareDrag.percentLeft||0.5, percentTop:programmShareDrag.percentTop||0.5},
        },draggableData);
        return (
            <ReactDrag {...DraggableData}>
                <div id={id} className="programm-share" style={{display:that.state.programmShare?"block":"none"}}>
                    <div className="programm-share-title">
                        <h3 className="programm-share-name">
                            {TkGlobal.language.languageData.shares.sharingMode.text}
                        </h3>
                        <button className="programm-share-close" onClick={that.clickCloseProgrammShare.bind(that)}></button>
                    </div>
                    <div className="programm-share-body">
                        {/*因为波波那边的bug暂时隐藏*/}
                       {/* <div className="programm-share-item" onClick = {this.changeMode.bind(this, 0)}>
                            <div className={that.state.modeStatuses[0]? ' programm-share-item-box-active programm-share-item-box' : 'programm-share-item-box'} >
                                <div className={"programm-share-item-img programm-share-img"}></div>
                                <span className={"tk-programm-share-btn"  } >{TkGlobal.language.languageData.shares.programmShare.text}</span>
                                <div className="programm-share-item-border"></div>
                            </div>
                        </div>*/}
                        <div className='programm-share-body-main'>
                            {TkGlobal.isClient && TkGlobal.clientversion>=2018031000 && !TkGlobal.isMacClient? <div className="programm-share-item">
                                <div className={that.state.modeStatuses[1]? ' programm-share-item-box-active programm-share-item-box' : 'programm-share-item-box'} onClick = {this.changeMode.bind(this, 1)}>
                                    <div className={"programm-share-item-img area-share-img" + (that.state.modeStatuses[1] ? " area-share-img-active" : '')}></div>
                                    <span className={"tk-programm-share-btn"  }>{TkGlobal.language.languageData.shares.shareArea.text}</span>
                                </div>
                            </div>:null}
                            <div className="programm-share-item">
                                <div className={that.state.modeStatuses[2]? ' programm-share-item-box-active programm-share-item-box' : 'programm-share-item-box'} onClick = {this.changeMode.bind(this, 2)}>
                                    <div className={"programm-share-item-img screen-share-img" + (that.state.modeStatuses[2] ? " screen-share-img-active" : '')}></div>
                                    <span className={"tk-programm-share-btn"+(TkGlobal.languageName ==="english"?" change-width":"") }>{TkGlobal.language.languageData.shares.shareSceen.text}</span>
                                </div>
                            </div>
                        </div>
                        {window.screen.width > 1920 && that.state.modeStatuses[2] ? <p className="screen_width_tip" >{TkGlobal.language.languageData.shares.screenWidthTip.text}</p> : undefined }
                        <div className="programm-share-select-box" style={{display: this.state.modeStatuses[0]? 'block' : 'none'}} >
                            <p className="programm-share-select-tit" >{TkGlobal.language.languageData.shares.selectProgramm.text}</p>
                            <select ref="programmShareSelect" className="programm-share-select" onChange={that.onComboBoxChanged.bind(that) } >

                            </select>
                        </div>
                        <div>
                        <button className={"tk-programm-share-start-btn"  } onClick={that.next.bind(that)} >{TkGlobal.language.languageData.shares.startSharing.text}</button>
                        </div>
                    </div>

                </div>
            </ReactDrag>
        )
    }
}

export default ProgrammShareSmart;