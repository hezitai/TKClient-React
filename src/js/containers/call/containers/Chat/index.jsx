import React,{ Component } from 'react';
import TkGlobal from 'TkGlobal';
import CoreController from 'CoreController';
import eventObjectDefine from 'eventObjectDefine';
import TkConstant from 'TkConstant';
import TkUtils from "TkUtils";
import ReactDrag from 'reactDrag';
import ServiceRoom from 'ServiceRoom';
import ServiceSignalling from 'ServiceSignalling';


import './static/css/chatroom.css';
import ChatTitleBox from './ChatTitleBox';
import ChatContainer from './ChatContainer';
import ChatInputBox from './ChatInputBox';
import styled from "styled-components";


const ChartBoxDiv = styled.div`
    display: ${props => (!props.show ? "none" : 'block')};
    position:'relative' ;
    height: ${props => (props.chatboxHeight)};
    margin:${TkGlobal.clientComponent?0:undefined};
    width:${TkGlobal.clientComponent?'100%':undefined};
`;

class ChatBox extends Component{
	constructor(props,context){
		super(props,context);		
		this.state={//0-allChat,1-headTeacherChat,2-groupChat
            selectChat:'allChat',//设置聊天室的工具栏切换的是聊天还是提问的索引值
            chatUnread:0,//显示未读聊天数量
            show: false,
            isPatrol: false,    //是否是巡课，默认不是
            isAllBanSpeak:false, //全体禁言，用于发送禁言状态
            textDisable:false,    //禁止输入框
            HeightConcurrenceInputText:TkGlobal.language.languageData.videoContainer.sendMsg.inputText.placeholder, //聊天框默认文字
		};
        this.chatType = {
            allChat: 'allChat',//全体
        };

        this.listernerBackupid = new Date().getTime()+'_'+Math.random();
	}
    componentWillMount(){
        TkConstant.skin === 'skin_black' ? import ('./static/css/chatroom_black.css') : import ('./static/css/chatroom.css');    
    }
    componentDidMount(){
		const that = this ;
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDelmsg, that.handlerRoomDelmsg.bind(that) , that.listernerBackupid); //监听roomDelmsg
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomTextMessage, that.handlerRoomTextMessage.bind(that)  , that.listernerBackupid);//监听服务器的广播聊天消息
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPubmsg , that.handlerRoomPubmsg.bind(that), that.listernerBackupid); //roomPubmsg事件  上课事件 classBegin
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPlaybackClearAllFromPlaybackController,that.handlerRoomPlaybackClearAll.bind(that) , that.listernerBackupid); 
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomUserpropertyChanged,this.handlerRoomUserpropertyChanged.bind(this) , this.listernerBackupid);//监听学生权限变化
        eventObjectDefine.CoreController.addEventListener( 'beyondTmplEvent' , that.beyondTmplHandler.bind(that) , that.listernerBackupid); //roomPlaybackClearAll 事件：回放清除所有信令
        eventObjectDefine.CoreController.addEventListener("CloseALLPanel",that.close.bind(that),that.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener("receive-msglist-EveryoneBanChat",this.handlerEveryoneBanChat.bind(this),this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener('receive-msglist-SwitchLayout',that.handleMsgListSwitchLayout.bind(that),that.listernerBackupid);   //监听断线重连切换布局信令
        eventObjectDefine.CoreController.addEventListener("togo_layout",that.handlerTogoLayout.bind(that),that.listernerBackupid);  //本地切换布局
    };

    componentWillUnmount(){
        let that = this ;
        eventObjectDefine.CoreController.removeBackupListerner(that.listernerBackupid );
    };

    componentDidUpdate(prevProps , prevState){
        if (prevState.show !== this.state.show && this.state.show) {
            // this.setDefaultPosition();
        }
    }

    // /*设置初始位置*/
    // setDefaultPosition() {
    //     let {id,draggableData} = this.props;
    //     let dragNode = document.getElementById(id);
    //     let boundNode = document.querySelector(draggableData.bounds);
    //     if (dragNode && boundNode) {
    //         if (draggableData.changePosition && typeof draggableData.changePosition === "function") {
    //             let isSendSignalling = false;//TkGlobal.dragRange.top
    //             const defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
    //             let boundNodeHeight=TkUtils.replacePxToNumber(TkUtils.getStyle(boundNode,'height'))/defalutFontSize;
    //             let dragNodeHeight=TkUtils.replacePxToNumber(TkUtils.getStyle(dragNode,'height'))/defalutFontSize;
    //             let percentTop=TkGlobal.dragRange.top/(boundNodeHeight-dragNodeHeight);
    //             draggableData.changePosition(id, {
    //                 percentLeft:0.5,
    //                 percentTop:TkConstant.hasRoomtype.oneToOne?0.5:percentTop,
    //                 isDrag:false
    //             }, isSendSignalling);
    //         }
    //     }
    // }

    beyondTmplHandler(e){
        if(e.message){
            const {key} = e.message
            switch (key) {
                case 'chat':
                    this.setState({show: !this.state.show})
                    break;
                
                default:
                    break;
            }
        }
    }
    handlerTogoLayout(data){
        let that = this;
        let {nowLayout} = data.message;
        if(nowLayout === "Encompassment"){
            this.setState({
                show: false
            })
        }
    }
    handleMsgListSwitchLayout(data){
        if(data.message.nowLayout === "Encompassment"){
            this.setState({
                show: false
            })
        }
    }

    handlerRoomPlaybackClearAll(){
        this.setState({
            selectChat:this.chatType.allChat,//设置聊天室的工具栏切换的是聊天还是提问的索引值
        });
    };

    handlerRoomTextMessage(param){
        const that = this ;
        //如果是我自己 需要在用户名后跟着我字样
        if(param.message.type == 0){
            if(this.state.selectChat!= this.chatType.allChat){//只有当前选中的选项卡不是聊天时才计数：记录未读消息数
                this.setState({
                    chatUnread:parseInt(this.state.chatUnread)<99?++this.state.chatUnread:99+'+'
                })
            }
        }
    };

    // 接收到发布信令时的处理方法
    handlerRoomPubmsg(recvEventData){
        const that = this ;
        let pubmsgData = recvEventData.message ;
        switch(pubmsgData.name) {
            case "EveryoneBanChat":
                this.setState({
                    isAllBanSpeak:true
                });
                if(TkConstant.hasRole.roleStudent){
                    this.setState({
                        textDisable:true,
                    });
                    // this.refs.textEditable.innerHTML=TkGlobal.language.languageData.alertWin.call.prompt.publishStatus.stream.speakoff.text;
                }
                break;
            case "switchLayout":
                if(pubmsgData.data.nowLayout === "Encompassment"){  //如果是环绕型，并且是浮层聊天区就推送数据到固定聊天区\
                    this.setState({
                        show:false
                    });
                }
                break;
        }
    };

    handlerRoomDelmsg(delmsgDataEvent){
        const that = this ;
        let delmsgData = delmsgDataEvent.message ;
        switch(delmsgData.name) {
            case "ClassBegin":
                if(!TkConstant.joinRoomInfo.isClassOverNotLeave && CoreController.handler.getAppPermissions('endClassbeginRevertToStartupLayout')) { //是否拥有下课重置界面权限
                    setTimeout( () => {
                        that._resetChatList();
                    } , 250 );
                }
                break;
            case "EveryoneBanChat":
                this.setState({
                    isAllBanSpeak:false
                });
                if(TkConstant.hasRole.roleStudent){
                    this.setState({
                        textDisable:false,
                    });
                    // this.refs.textEditable.innerHTML=this.state.sendRealText;
                }
                break;
        }
    };
    handlerEveryoneBanChat(recvEventData){
        this.setState({
            isAllBanSpeak:recvEventData.message.EveryoneBanChatArr[0].data.isAllBanSpeak
        })
        if(recvEventData.message.EveryoneBanChatArr[0].data.isAllBanSpeak){
            if(TkConstant.hasRole.roleStudent){
                this.setState({
                    textDisable:true
                });
                // this.refs.textEditable.innerHTML=TkGlobal.language.languageData.alertWin.call.prompt.publishStatus.stream.speakoff.text;
            }
        }
    }
    handlerRoomUserpropertyChanged(param){
        //如果不是自己就不处理
        if(param.userid !== ServiceRoom.getTkRoom().getMySelf().id ){
            return;
        }
        if(param.message.disablechat!=undefined){
            //接到单体禁言
            this.setState({
                textDisable:param.message.disablechat
            });
            // if(param.message.disablechat){
            //     if(TkConstant.hasRole.roleStudent){
            //         let speakText=TkGlobal.language.languageData.alertWin.call.prompt.publishStatus.stream.speakoff.text;
            //         if(param.message.userid===ServiceRoom.getTkRoom().getMySelf().userid){
            //             this.refs.textEditable.innerHTML=speakText;
            //         }
            //     }
            // }else{
            //     if(TkConstant.hasRole.roleStudent){
            //         if(param.message.userid===ServiceRoom.getTkRoom().getMySelf().userid){
            //             this.refs.textEditable.innerHTML=this.state.sendRealText;
            //         }
            //     }
            // }
            
        }
        
    }

    changeTextDisable(boolean){
        this.setState({
            textDisable: boolean,
            HeightConcurrenceInputText: boolean ? TkGlobal.language.languageData.videoContainer.sendMsg.inputText.frequently : TkGlobal.language.languageData.videoContainer.sendMsg.inputText.placeholder,
        })
    }

    /*处理断线重连的全体禁言*/
    // handlerEveryoneBanChat(recvEventData) {
    //     this.setState({
    //         isAllBanSpeak: recvEventData.message.EveryoneBanChatArr[0].data.isAllBanSpeak
    //     })
    // }

    _resetChatList(){
        this.setState({
            selectChat:this.chatType.allChat,//设置聊天室的工具栏切换的是聊天还是提问的索引值
            chatUnread:0,//显示未读聊天数量
        });
    };
    
    close(){
        this.setState({show:false})
        eventObjectDefine.CoreController.dispatchEvent({
            type: 'closeChatBox'
        })
    }

    // 禁言或者取消禁言
    chatToggle(){
        // eventObjectDefine.CoreController.dispatchEvent({
        //     type: 'chatToggle'
        // })
        const roles=[TkConstant.role.roleStudent] ;
        if(this.state.isAllBanSpeak){
            ServiceSignalling.sendSignllingEveryoneBanChat({isAllBanSpeak:false},true);
            ServiceSignalling.setParticipantPropertyToAllByoRole(roles,{disablechat:false});
        }else{
            ServiceSignalling.sendSignllingEveryoneBanChat({isAllBanSpeak:true});
            ServiceSignalling.setParticipantPropertyToAllByoRole(roles,{disablechat:true});
        }
        this.setState({
            isAllBanSpeak:!this.state.isAllBanSpeak
        })
    }

	render(){
        const that = this;
        let chatboxHeight;
        if (TkGlobal.clientComponent) {
            chatboxHeight = '100%';
        }else if(TkConstant.hasRoomtype.oneToOne) {
            chatboxHeight = 'calc(100% - '+this.props.videoContainerHeightRem+'rem - 0.4rem)';
        }else{
            chatboxHeight = 'calc(100% - '+this.props.videoContainerHeightRem+'rem - 0.1rem)';
        }

        let {id, dragInfo, draggableData } = this.props ;
        let DraggableData = Object.customAssign({
            id:id,
            percentPosition:{percentLeft:dragInfo.percentLeft||0.5, percentTop:dragInfo.percentTop||0.5},
            disable: false 
        },draggableData);
        let banChatTitle = this.state.isAllBanSpeak?TkGlobal.language.languageData.videoContainer.sendMsg.btn.title.allChat : TkGlobal.language.languageData.videoContainer.sendMsg.btn.title.banChat;

        return(
            // <ReactDrag {...DraggableData}>
            <div className={"mask"} onClick={this.close.bind(this)} style={{display:this.state.show?"block":"none"}}>
                <ChartBoxDiv id="chatbox" onClick={(e)=>{e.stopPropagation()}}  className={"chat-all-container  "+(TkGlobal.playback?"playback":"")}   {...this.state} chatboxHeight={chatboxHeight} >
                    <ChatTitleBox banChatTitle={banChatTitle} chatToggle={this.chatToggle.bind(this)} close={this.close.bind(this)}  {...this.state} />
                    <ChatContainer selectChat={this.state.selectChat} isFloating={true} isShow={this.state.show} />
                    <ChatInputBox selectChat={this.state.selectChat}  isShow={this.state.show} changeTextDisable={this.changeTextDisable.bind(this)} textDisable={this.state.textDisable} />
                </ChartBoxDiv>
            </div>

            // </ReactDrag>
		)
	};
};

export default ChatBox;
