import React,{ Component } from 'react';
import TkGlobal from 'TkGlobal';
import CoreController from 'CoreController';
import eventObjectDefine from 'eventObjectDefine';
import TkConstant from 'TkConstant';
import TkUtils from "TkUtils";
import ReactDrag from 'reactDrag';
import ServiceRoom from 'ServiceRoom';
import ServiceSignalling from 'ServiceSignalling';


// import './static/css/rightChat.css';
import ChatTitleBox from './ChatTitleBox';
import ChatContainer from './ChatContainer';
import ChatInputBox from './ChatInputBox';
import styled from "styled-components";


// const ChartBoxDiv = styled.div`
//     display: ${props => (!props.show ? "none" : 'block')};
//     position:'relative' ;
//     height: ${props => (props.chatboxHeight)};
//     margin:${TkGlobal.clientComponent?0:undefined};
//     width:${TkGlobal.clientComponent?'100%':undefined};
// `;
const ChartBoxDiv = styled.div`
    position:'relative' ;
    height: 100%;
    margin:${TkGlobal.clientComponent?0:undefined};
    width:${TkGlobal.clientComponent?'100%':undefined};
`;

class ChatBox extends Component{
	constructor(props,context){
		super(props,context);		
		this.state={//0-allChat,1-headTeacherChat,2-groupChat
            selectChat:'allChat',//设置聊天室的工具栏切换的是聊天还是提问的索引值
            chatUnread:0,//显示未读聊天数量
            isPatrol: false,    //是否是巡课，默认不是
            isAllBanSpeak:false, //全体禁言，用于发送禁言状态
            textDisable:false,    //禁止输入框
		};
        this.chatType = {
            allChat: 'allChat',//全体
        };

        this.listernerBackupid = new Date().getTime()+'_'+Math.random();
	}
    componentWillMount(){
        TkConstant.skin === 'skin_black' ? import ('./static/css/rightChat_black.css') : import ('./static/css/rightChat.css');    
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
    };

    componentWillUnmount(){
        let that = this ;
        eventObjectDefine.CoreController.removeBackupListerner(that.listernerBackupid );
    };

    componentDidUpdate(prevProps , prevState){
        
    }

    beyondTmplHandler(e){
        if(e.message){
            const {key} = e.message
            switch (key) {
                case 'chat':
                    break;
                
                default:
                    break;
            }
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
        })
    }
    _resetChatList(){
        this.setState({
            selectChat:this.chatType.allChat,//设置聊天室的工具栏切换的是聊天还是提问的索引值
            chatUnread:0,//显示未读聊天数量
        });
    };
    
    close(){
        // eventObjectDefine.CoreController.dispatchEvent({
        //     type: 'closeChatBox'
        // })
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

        let {id} = this.props ;
        let banChatTitle = this.state.isAllBanSpeak?TkGlobal.language.languageData.videoContainer.sendMsg.btn.title.allChat : TkGlobal.language.languageData.videoContainer.sendMsg.btn.title.banChat;

        return(
            <ChartBoxDiv style={this.props.isChrome49 ?{width:'100%',height:'100%',position:'absolute'}:null} id="rightchatbox" className={"chat-all-container  "+(TkGlobal.playback?"playback":"") }   {...this.state} >
                <ChatTitleBox banChatTitle={banChatTitle} chatToggle={this.chatToggle.bind(this)} close={this.close.bind(this)}  {...this.state} />
                <ChatContainer selectChat={this.state.selectChat} isFloating={false}/>
                <ChatInputBox selectChat={this.state.selectChat} changeTextDisable={this.changeTextDisable.bind(this)} textDisable={this.state.textDisable} />
            </ChartBoxDiv>
		)
	};
};

export default ChatBox;
