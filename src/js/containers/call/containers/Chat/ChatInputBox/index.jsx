import React, { Component } from 'react';
import TkGlobal from 'TkGlobal';
import TkConstant from 'TkConstant';
import eventObjectDefine from 'eventObjectDefine';
import ServiceRoom from 'ServiceRoom';
import CoreController from 'CoreController';
import ServiceSignalling from 'ServiceSignalling';
// import { LOADIPHLPAPI } from 'dns';


import FaceBtn from '../FaceBtn';
import SendImgBtn from '../SendImgBtn';
import styled from "styled-components";
const InputBoxDiv = styled.div`
    display: ${props => (props.inputHide ? 'none':'block')};
`;
const ChatSubjectDiv = styled.div`
    display: ${props => ( props.isShow ? "":"none")};
`;
const InputTopDiv = styled.div`
    display: ${props => ( props.isShow ? "none":"")};
`;
class InputBox extends Component{
	constructor(props,context){
		super(props,context);
		this.state={
			value:'',
			qqFaceShow:false ,
            sendRealText:'',
            uploadFileName:'',
            flag:1,
            size: 1 * 1024 * 1024 ,
            updateState:false ,
            inputHide:false ,//是否是回放者,默认框不显示
            isPatrol: false,    //是否是巡课，默认不是
            // isAllBanSpeak:false,  //全体禁言，用于发送禁言状态
            isAlonBanSpeak:false,
            // textDisable:false,    //禁止输入框
            HeightConcurrenceInputText:TkGlobal.language.languageData.videoContainer.sendMsg.inputText.placeholder
		};
        this.chatType = {
            allChat: 'allChat',
            headTeacherChat: 'headTeacherChat',
            groupChat: 'groupChat',
        };
		this.accept = TkConstant.FILETYPE.imgFileListAccpet;
        this.hasFocus=false;
        this.emotionArray = [
            TkGlobal.language.languageData.phoneBroadcast.chat.face.naughty,TkGlobal.language.languageData.phoneBroadcast.chat.face.happy,TkGlobal.language.languageData.phoneBroadcast.chat.face.complacent,TkGlobal.language.languageData.phoneBroadcast.chat.face.curlOnesLips,
            TkGlobal.language.languageData.phoneBroadcast.chat.face.grieved,TkGlobal.language.languageData.phoneBroadcast.chat.face.shedTears,TkGlobal.language.languageData.phoneBroadcast.chat.face.kiss,TkGlobal.language.languageData.phoneBroadcast.chat.face.love
        ];
        this.historyChat=[];
		this.listernerBackupid = new Date().getTime()+'_'+Math.random();
	}
    componentDidMount() {
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPubmsg ,this.handlerRoomPubmsg.bind(this) , this.listernerBackupid );
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDelmsg,this.handlerRoomDelmsg.bind(this),this.listernerBackupid);
		eventObjectDefine.CoreController.addEventListener('initAppPermissions', this.initAppPermissions.bind(this) , this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomConnected, this.handlerRoomConnected.bind(this) , this.listernerBackupid); //监听房间连接事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomUserpropertyChanged,this.handlerRoomUserpropertyChanged.bind(this) , this.listernerBackupid);//监听学生权限变化
        // eventObjectDefine.CoreController.addEventListener("receive-msglist-EveryoneBanChat",this.handlerEveryoneBanChat.bind(this),this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener("chatToggle",this.allBanSpeak.bind(this),this.listernerBackupid);
    };
    componentWillUnmount() {
		eventObjectDefine.CoreController.removeBackupListerner(this.listernerBackupid );
	};
    /*接收到发布信令时的处理方法*/
    handlerRoomPubmsg(recvEventData){
        switch(recvEventData.message.name){
            case "EveryoneBanChat":
                // this.setState({
                //     isAllBanSpeak:true
                // });
                if(TkConstant.hasRole.roleStudent){
                    // this.setState({
                    //     textDisable:true,
                    // });
                    this.refs.textEditable.innerHTML=TkGlobal.language.languageData.alertWin.call.prompt.publishStatus.stream.speakoff.text;
                }
                break;

        }
    };


    handlerRoomDelmsg(recvEventData){
        switch(recvEventData.message.name){
            case "EveryoneBanChat":
            //     this.setState({
            //         isAllBanSpeak:false
            //     });
                if(TkConstant.hasRole.roleStudent){
            //         this.setState({
            //             textDisable:false,
            //         });
                    this.refs.textEditable.innerHTML=this.state.sendRealText;
                }
                break;
        }
    }
    handlerRoomConnected(handlerData){
        this.setState({
            inputHide: false, //判断人物身份是否是回放者身份，巡课、回放者不需要聊天框
            isPatrol : TkConstant.hasRole.rolePatrol || TkConstant.hasRole.rolePlayback,   //判断人物身份是否是巡课身份
        });
    };
    /*处理断线重连的全体禁言*/
    handlerEveryoneBanChat(recvEventData){
        // this.setState({
        //     isAllBanSpeak:recvEventData.message.EveryoneBanChatArr[0].data.isAllBanSpeak
        // })
        if(recvEventData.message.EveryoneBanChatArr[0].data.isAllBanSpeak){
            if(TkConstant.hasRole.roleStudent){
                // this.setState({
                //     textDisable:true
                // });
                this.refs.textEditable.innerHTML=TkGlobal.language.languageData.alertWin.call.prompt.publishStatus.stream.speakoff.text;
            }
        }
    }
    // //处理断线重连 单独禁言
    // handlerAlonBanChat(recvEventData){
    //     if(recvEventData.message.AlonBanChatArr!=undefined){
    //         if(TkConstant.hasRole.roleStudent){
    //             if(recvEventData.message.AlonBanChatArr[0].data.userid===ServiceRoom.getTkRoom().getMySelf().id){
    //                 let userid=ServiceRoom.getTkRoom().getMySelf().id;
    //                 let data={
    //                     disablechat:recvEventData.message.AlonBanChatArr[0].data.disablechat
    //                 }
    //                 ServiceSignalling.setParticipantPropertyToAll(userid,data);
    //             }
    //         }
    //     }
    // }
    //监听学生权限变化
    handlerRoomUserpropertyChanged(param){
        //如果不是自己就不处理
        if(param.userid !== ServiceRoom.getTkRoom().getMySelf().id ){
            return;
        }
        if(param.message.disablechat!=undefined){
            //接到单体禁言
            // this.setState({
            //     textDisable:param.message.disablechat
            // });
            if(param.message.disablechat){
                if(TkConstant.hasRole.roleStudent){
                    let speakText=TkGlobal.language.languageData.alertWin.call.prompt.publishStatus.stream.speakoff.text;
                    if(param.message.userid===ServiceRoom.getTkRoom().getMySelf().userid){
                        this.refs.textEditable.innerHTML=speakText;
                    }
                }
            }else{
                if(TkConstant.hasRole.roleStudent){
                    if(param.message.userid===ServiceRoom.getTkRoom().getMySelf().userid){
                        this.refs.textEditable.innerHTML=this.state.sendRealText;
                    }
                }
            }
            
        }
        
    }
    handleEditableOnInput(e){
        let that = this;
        let range = document.createRange();
        let text = this.refs.textEditable.innerHTML.replace(/&nbsp;/g , " ");
        that.setState({sendRealText:text});
    };
    //禁止刷屏
    preventRepeatChat(value){
        let that=this;
        that.historyChat=that.historyChat.filter((item)=>{
            return ((new Date().getTime()- item.timestamp)/1000) <=3;
        });
        const isRepeat = that.historyChat.some(item=>item.value === value);
        if(isRepeat){
            return true;
        }else{
            that.historyChat.push({timestamp:new Date().getTime(),value:value});
            return false;
        }
        return false;
    }
    handleEditableOnKeyDown(e){//当按回车发送时将value置空，使得按钮变颜色
        let that=this;
        if(TkConstant.hasRole.roleStudent){
            if(this.props.textDisable){return false};
        }
        if(e.keyCode===13){
            e.preventDefault();

            let str = this.state.sendRealText.replace(/<img.*?(?:>|\/>)/gi, function (matchStr) {
                let emojiNum = matchStr.substring(matchStr.lastIndexOf("/") + 1).split('.')[0];
                return '[em_' + emojiNum +']';
            });
            let value = str.replace(/&nbsp;/g , " " ).replace(/<\/?[a-zA-Z]+[^><]*>/g,"");
            that._handleInputToSend({
                value:value,
            });
            this.refs.textEditable.innerHTML="";
            that.setState({sendRealText:""});
        }
    }

    handleEditableOnButtonClick(e){
        let that=this;
        if(TkConstant.hasRole.roleStudent){
            if(this.props.textDisable){return false};
        }
        let str = this.state.sendRealText.replace(/<img.*?(?:>|\/>)/gi, function (matchStr) {
           let emojiNum = matchStr.substring(matchStr.lastIndexOf("/") + 1).split('.')[0];
           return '[em_' + emojiNum +']';
        });
        let value = str.replace(/&nbsp;/g , " " ).replace(/<\/?[a-zA-Z]+[^><]*>/g,"");
        // that.preventRepeatChat(value);
        that._handleInputToSend({
            value:value,
        });
        this.refs.textEditable.innerHTML="";
        that.setState({sendRealText:""});
    };
    //  sendImg权限控制
    initAppPermissions(a){
        this.setState({updateState:!this.state.updateState});
    }

    // 触发from组件渲染
	OnSendIMG(){
        if(TkConstant.hasRole.roleStudent){
            if(this.props.textDisable)return false;
        }
        this.setState({
            flag: this.state.flag + 1,
        })
    };

    emotionMouse(){
        this.hasFocus= $(this.refs.textEditable).is(':focus')
    }

    handleEmotionBtnOnClick(){
    	this.setState({
            qqFaceShow:!this.state.qqFaceShow,
        });
        this.refs.textEditable.focus();
        if(!this.hasFocus){
            let range = document.createRange();
            range.selectNodeContents(this.refs.textEditable);
            range.collapse(false);
            let sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            this.hasFocus=false
        }

	};

    handleQqFaceOnMouseLeave(){
        this.setState({
            qqFaceShow:false
        });
	};

    /*点击表情*/
    handleFaceOnClick( index  , iconIndex){
        if(TkConstant.hasRole.roleStudent){
            if(this.props.textDisable)return false;
        }
        let insertImgSrc = "./img/"+iconIndex+".png";
        this.insertImg(insertImgSrc);//插入表情图片
		this.setState({
			qqFaceShow:false ,
            sendRealText:this.refs.textEditable.innerHTML
		});
	};

    emotionClick = (e) => {
        let findIndex = Array.from(this.refs.textEditable.childNodes).findIndex((value, index) => {
            return value === e.target;
        });
        if (e.clientX > $(e.target).offset().left + (e.target.scrollWidth / 2)) {
            let sel, el = this.refs.textEditable;
            sel = window.getSelection();
            sel.collapse(el, findIndex + 1);
            el.focus();
        } else {
            let sel, el = this.refs.textEditable;
            sel = window.getSelection();
            sel.collapse(el, findIndex);
            el.focus();
        }
    };
    /*插入表情图片*/
    insertImg(src) {
        if('getSelection' in window) {
            let sel = window.getSelection();
            if(sel && sel.rangeCount === 1 && sel.isCollapsed) {
                //有选区，且选区数量是一个，且选区的起始点和终点在同一位置
                this.refs.textEditable.focus();
                let range = sel.getRangeAt(0);
                let img = new Image();
                img.src = src;
                img.onclick=this.emotionClick;
                range.insertNode(img);
                range.collapse(false); //对于IE来说，参数不可省略
                sel.removeAllRanges();
                sel.addRange(range);
            }
        } else if('selection' in document) {
            this.refs.textEditable.focus();
            let range = document.selection.createRange();
            range.pasteHTML('<img onclick="this.emotionClick()" src="' + src + '">');
            this.refs.textEditable.focus(); //IE 11模拟的IE5~IE8无须这一步也能获得焦点
        }
    };
    /*插入文本*/
    insertText(text) {
        if('getSelection' in window) {
            let sel = window.getSelection();
            if(sel && sel.rangeCount === 1 && sel.isCollapsed) {
                //有选区，且选区数量是一个，且选区的起始点和终点在同一位置
                this.refs.textEditable.focus();
                let range = sel.getRangeAt(0);
                let textNode = document.createTextNode(text);
                range.insertNode(textNode);
                range.collapse(false); //对于IE来说，参数不可省略
                sel.removeAllRanges();
                sel.addRange(range);
            }
        } else if('selection' in document) {
            this.refs.textEditable.focus();
            let range = document.selection.createRange();
            range.text = text;
            this.refs.textEditable.focus(); //IE 11模拟的IE5~IE8无须这一步也能获得焦点
        }
    };
	/*加载表情数组*/
    _loadEmotionArray(){
    	const that = this ;
		let suffix = '.png';
		let tdNum = 15 ;
        let emotionTrArray = [];
    	let tdJson = {} ;

      	this.emotionArray.map( (title , index) => {
      		let num = Math.floor( index / tdNum ) ;
            tdJson[num] = tdJson[num] || [];
            let iconIndex = index+1 ;
            //title = undefined ;
            tdJson[num].push(
				<li key={'td_'+index} ><img title={title}  className={"icon"}  src={"./img/"+iconIndex+suffix} onClick={that.handleFaceOnClick.bind(that , index  , iconIndex)}  /></li>
			);
		});
      	for(let [key,value] of Object.entries(tdJson) ){
            emotionTrArray.push(
				<ul key={'tr_'+key}>{value}</ul>
			);
		}
    	return{
            emotionArray:emotionTrArray
		}
	};

    uploadSuccess(res){
        this._handleInputToSend({
            value:res.swfpath,
            cospath:res.cospath,
            msgtype: "onlyimg"
        });
    };
    toTwo(num){//时间个位数转十位数
        if(parseInt(num/10)==0){
            return '0'+num;
        }else{
            return num;
        }
    }

    //发送全体禁言信令
    allBanSpeak(){
        // const roles=[TkConstant.role.roleStudent] ;
        // if(this.state.isAllBanSpeak){
        //     ServiceSignalling.sendSignllingEveryoneBanChat({isAllBanSpeak:false},true);
        //     ServiceSignalling.setParticipantPropertyToAllByoRole(roles,{disablechat:false});
        // }else{
        //     ServiceSignalling.sendSignllingEveryoneBanChat({isAllBanSpeak:true});
        //     ServiceSignalling.setParticipantPropertyToAllByoRole(roles,{disablechat:true});
        // }
        // this.setState({isAllBanSpeak:!this.state.isAllBanSpeak});
    }

    _handleInputToSend(data){
        const that = this ;
        if( data.value && $.trim( data.value ) ){
            if(that.preventRepeatChat(data.value)){
                eventObjectDefine.CoreController.dispatchEvent({type:"preventRepeatChat"});
                return ;
            }
            let identity =  undefined ; //todo 这里需要处理私聊
            let code = that.props.selectChat === this.chatType.allChat? 0 : undefined;
            let time = that.toTwo(new Date().getHours())+':'+that.toTwo(new Date().getMinutes());
            let dataToServer = {
                msg: data.value,
                type: code,
                time: time,
            }
            if(data.msgtype){//onlyimg
                dataToServer.msgtype = data.msgtype ;
                dataToServer.cospath = data.cospath ;
            }
            switch (code) {
                case 0: // 若为chat界面
                    if(identity){
                        ServiceSignalling.sendTextMessage(dataToServer,identity);
                    }else{
                        ServiceSignalling.sendTextMessage(dataToServer);
                    }
                    break;
                default:
                    return;
                    break;
            }
            if(TkGlobal.HeightConcurrence&&ServiceRoom.getTkRoom().getMySelf().role === TkConstant.role.roleStudent && !this.props.textDisable){
                this.setState({
                    // textDisable:true,
                    HeightConcurrenceInputText:TkGlobal.language.languageData.videoContainer.sendMsg.inputText.frequently
                });
                if(this.props.changeTextDisable){
                    this.props.changeTextDisable(true)
                }
                window.setTimeout(()=>{
                    if(this.props.changeTextDisable){
                        this.props.changeTextDisable(false)
                    }
                    this.setState({
                        // textDisable:false,
                        HeightConcurrenceInputText:TkGlobal.language.languageData.videoContainer.sendMsg.inputText.placeholder
                    });
                },10000)
            }
        }
    };

	render(){
		let {emotionArray} = this._loadEmotionArray() ;
        // let banChatTitle = isAllBanSpeak?TkGlobal.language.languageData.videoContainer.sendMsg.btn.title.allChat : TkGlobal.language.languageData.videoContainer.sendMsg.btn.title.banChat;
        if(this.props.isShow && this.refs.textEditable && this.refs.textEditable.focus){
            this.refs.textEditable.focus()
        }
        return(
            <InputBoxDiv className={"input-box " + (TkConstant.hasRoomtype.oneToOne ? 'middle' : 'high' ) } inputHide={this.state.inputHide} >
                {!TkGlobal.playback && !TkConstant.hasRole.roleRecord ?
                    (<InputTopDiv className='input-top' isShow={TkConstant.hasRole.rolePatrol} >
                        <FaceBtn  
                            emotionClick = {this.handleEmotionBtnOnClick.bind(this)} 
                            emotionMouseEnter={this.emotionMouse.bind(this)}
                            QQFaceMouseLeave={this.handleQqFaceOnMouseLeave.bind(this)}
                            emotionArray= {emotionArray}
                            textDisable={this.props.textDisable}
                            {...this.state}
                        />
                        {CoreController.handler.getAppPermissions('chatSendImg') ? 
                            <SendImgBtn 
                                OnSendIMG={this.OnSendIMG.bind(this)}
                                uploadSuccess={this.uploadSuccess.bind(this)}
                                accept={this.accept}
                                textDisable={this.props.textDisable}
                                {...this.state}
                            />:undefined
                        }
                    </InputTopDiv>):undefined
                }
                {!TkGlobal.playback && !TkConstant.hasRole.roleRecord ?(
                    <ChatSubjectDiv className="chat-subject" onMouseLeave={this.handleQqFaceOnMouseLeave.bind(this)} isShow={!TkConstant.hasRole.rolePatrol}>
                        <div className="chat-input">
                            <div contentEditable={(TkGlobal.isLeaveRoom ? false :(this.state.isPatrol || this.props.textDisable) ? false : "plaintext-only")}
                                ref='textEditable'
                                placeholder={this.state.isPatrol? TkGlobal.language.languageData.videoContainer.sendMsg.inputText.patrolPlaceholder:(this.state.HeightConcurrenceInputText===TkGlobal.language.languageData.videoContainer.sendMsg.inputText.placeholder)? TkGlobal.language.languageData.videoContainer.sendMsg.inputText.placeholder:this.state.HeightConcurrenceInputText}
                                data-text= {this.state.isPatrol? TkGlobal.language.languageData.videoContainer.sendMsg.inputText.patrolPlaceholder: (this.state.HeightConcurrenceInputText===TkGlobal.language.languageData.videoContainer.sendMsg.inputText.placeholder)? TkGlobal.language.languageData.videoContainer.sendMsg.inputText.placeholder:this.state.HeightConcurrenceInputText}
                                onInput = {this.handleEditableOnInput.bind(this)}
                                onMouseDown = {(event)=>{event.stopPropagation(); }}
                                onKeyDown={this.handleEditableOnKeyDown.bind(this)} className="inputContentEditable custom-scroll-bar " />
                        </div>
                        {/* <div className='cut-off-rule'></div> */}
                        <button className="sendBtn user-select-none "
                                disabled={(TkGlobal.isLeaveRoom ? true : TkConstant.hasRole.roleStudent&&(this.state.isPatrol || this.props.textDisable))}
                                onClick={this.handleEditableOnButtonClick.bind(this)}>
                            {TkGlobal.language.languageData.videoContainer.sendMsg.sendBtn.text}
                        </button>
                    </ChatSubjectDiv>
                ):undefined}
                <div className="chat_icon_rockets" ></div>
            </InputBoxDiv>
		)
	}
	
	
}

export default InputBox;