import React,{ Component } from 'react';
import ReactDOM from 'react-dom';
import ServiceRoom from 'ServiceRoom';
import TkGlobal from 'TkGlobal';
import CoreController from 'CoreController';
import eventObjectDefine from 'eventObjectDefine';
import TkConstant from 'TkConstant';
import Md5 from 'js-md5';
import { AutoSizer } from 'react-virtualized/dist/commonjs/AutoSizer'
import { List as VList } from 'react-virtualized/dist/commonjs/List'
import { CellMeasurerCache, CellMeasurer } from 'react-virtualized/dist/commonjs/CellMeasurer'
import List from '../../../../../components/list/List';


import styled from "styled-components";
const ChatListUl = styled.ul`
    display: ${props => (props.show ? 'block':'none')};
`;
class ChatListMessageDumb extends Component{
	constructor(props,context){
        super(props,context);
        this.state={
            isDown:true,
            isDowntext:0,
            show: true,
            imgSize:{},
        };
        this.needScrollGoDown = false;
        this.updateListTimer = null;
        this.scrollTimer = null;
        this.scrollInfo = {};
        this.awitForceUpdateGridRenderNumber = 0 ;
        this.prevMsgNumber = 0;

        this.listernerBackupid = new Date().getTime()+'_'+Math.random();
    }
    componentDidMount(){
        eventObjectDefine.Document.addEventListener(TkConstant.EVENTTYPE.DocumentEvent.onFullscreenchange , this.handlerOnFullscreenchange.bind(this)   , this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomDelmsg, this.handlerRoomDelmsg.bind(this) , this.listernerBackupid); //监听roomDelmsg
        window.addEventListener('resize', this.handleScrollResize.bind(this));
        // this.triggerEle = document.querySelector('#chatListBox');

    };
    /*组件被移除之前被调用，可以用于做一些清理工作*/
    componentWillUnmount(){
        eventObjectDefine.CoreController.removeBackupListerner(this.listernerBackupid );
        eventObjectDefine.Document.removeBackupListerner(this.listernerBackupid );
        clearTimeout(this.scrollTime);
        window.removeEventListener('resize', this.handleScrollResize);
    }
    /*当props发生变化时执行，初始化render时不执行*/
    componentWillReceiveProps(newProps) {
        let {chatMessageListLength} = this.props;
        if(newProps.chatMessageListLength !== chatMessageListLength){
            if(!this.state.isDown){
                if (!this.prevMsgNumber) {
                    this.prevMsgNumber = chatMessageListLength;
                }
                this.setState({
                    isDowntext: newProps.chatMessageListLength - this.prevMsgNumber
                })
            }
        }
    };
    componentDidUpdate(prevProps){
        let {chatMessageListLength , delChatListNum, isShow} = this.props;
        if (this.needScrollGoDown) {
            this.needScrollGoDown = false;
            this._scrollGoDown();//将滚动条置底
        }
        if (isShow !== prevProps.isShow && isShow === true){
            if (this.VList && this.measureCache) {
                this.measureCache.clearAll();
                this.VList.forceUpdateGrid();
                let timer=setTimeout(()=>{
                    this._scrollGoDown();
                    clearTimeout(timer);
                },0)
            }
        }
        this.awitForceUpdateGridRenderNumber++;
        if( this.chatListLength + prevProps.delChatListNum !== chatMessageListLength + delChatListNum){
            if(!this.state.isDown){
                if (!this.prevMsgNumber) {
                    this.prevMsgNumber = this.chatListLength + prevProps.delChatListNum ;
                }
                this.setState({
                    isDowntext: ( chatMessageListLength + delChatListNum - this.prevMsgNumber) > 0 ? ( ( chatMessageListLength + delChatListNum - this.prevMsgNumber ) > 99 ? '99+' : ( chatMessageListLength + delChatListNum - this.prevMsgNumber )  ) :0
                })
            }
            if( chatMessageListLength ){
                let fromID = this.props.accelerateDate(chatMessageListLength - 1).fromID;
                if ( fromID === ServiceRoom.getTkRoom().getMySelf().id ) {
                    this.needScrollGoDown = true;
                    this._scrollGoDown();//将滚动条置底
                }else {
                    if (this.scrollInfo.offsetHeight + this.scrollInfo.scrollTop + 5 >= this.scrollInfo.scrollHeight) {
                        this.needScrollGoDown = true;
                        this._scrollGoDown();//将滚动条置底
                    }
                }
            }

            clearTimeout(this.updateListTimer);
            if( this.awitForceUpdateGridRenderNumber > 99 ){
                //通知react-virtualized重新计算列表
                this.awitForceUpdateGridRenderNumber = 0 ;
                this.measureCache.clearAll();
                this.VList.forceUpdateGrid();
            }else{
                this.updateListTimer = setTimeout(()=>{
                    //通知react-virtualized重新计算列表
                    this.awitForceUpdateGridRenderNumber = 0 ;
                    this.measureCache.clearAll();
                    this.VList.forceUpdateGrid();
                },300);
            }
        }

        this.chatListLength = chatMessageListLength ;

    }
    /*窗口改变时*/
    handleScrollResize() {
        if(TkGlobal.playback){//如果是回放滚动条直接置底
            this.needScrollGoDown = true;
            this._scrollGoDown();//将滚动条置底
        }else {
            if (Object.keys(this.scrollInfo).length > 0 && this.scrollInfo.offsetHeight + this.scrollInfo.scrollTop + 5 >= this.scrollInfo.scrollHeight) {
                this.needScrollGoDown = true;
                this._scrollGoDown();//将滚动条置底
            }
        }
        //通知react-vi*-rtualized重新计算列表
        clearTimeout(this.updateListTimer);
        this.updateListTimer = setTimeout(()=>{
            //通知react-virtualized重新计算列表
            if (this.VList && this.measureCache) {
                this.measureCache.clearAll();
                this.VList.forceUpdateGrid();
            }
        },17);
    };
    handlerOnFullscreenchange(){
        if(TkGlobal.playback){
            this.needScrollGoDown = true;
            this._scrollGoDown();//将滚动条置底
        }
    };

    /*接收到删除信令时的处理方法*/
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
        }
    };
    _resetChatList() {
        this.prevMsgNumber = 0;
        this.setState({
            isDown:true,
            isDowntext:0,
        });
    };
    scroll(scrollInfo){
        if (scrollInfo) {
            this.scrollInfo = {
                offsetHeight:scrollInfo.clientHeight,
                scrollTop:scrollInfo.scrollTop,
                scrollHeight:scrollInfo.scrollHeight,
            };
            if(this.scrollInfo.scrollHeight-this.scrollInfo.offsetHeight<=this.scrollInfo.scrollTop+5){
                this.prevMsgNumber = 0;
                this.setState({
                    isDown:true,
                    isDowntext:''
                });
            }else{
                this.setState({
                    isDown:false
                });
            }
        }
    };
    godown(){
        this.needScrollGoDown = true;
        this._scrollGoDown();//将滚动条置底
    };

    changebig(imgurl,cospath){
        eventObjectDefine.CoreController.dispatchEvent({type:'isBigPictureDisplay',imgurl:imgurl,cospath:cospath})
    }
    //优化图片自适应
    getsize(index,e){
        e.target.style.display='block';
        $(e.target).prev()[0].style.display='none';
        const defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
        let imgSize = JSON.parse(JSON.stringify(this.state.imgSize));
        imgSize[index] = {
            width: imgSize[index].initWidth || (Math.round(e.target.width))/defalutFontSize+'rem' ,
            height: imgSize[index].initHeight || (Math.round(e.target.height))/defalutFontSize+'rem',
        };
        if (!imgSize[index].initWidth) {
            imgSize[index].initWidth = imgSize[index].width;
            imgSize[index].initHeight = imgSize[index].height;
        }
        this.setState({
            imgSize,
        });
        //通知react-virtualized重新计算列表
        /* this.measureCache.clearAll();
        this.VList.forceUpdateGrid(); */
    };
    // 图片失败的回调
    imgerrror(index,e){
        this.state.imgSize[index] = {
            width:'1.39rem',
            height:'1.39rem',
        };
        //通知react-virtualized重新计算列表
        this.measureCache.clearAll();
        this.VList.forceUpdateGrid();
        this.setState({
            imgSize:this.state.imgSize,
        });
        $(e.target).prev().addClass('error');
        e.target.style.display='none';
    };

    _handleTranslateClick(ev){
        let that = this;
        let target = ev.target ;
        let query=$(target).siblings('.user-sended').text();
        //翻译功能
        let appid ='20180130000119815';
        let key = 'MeLC5NI37txuT_wtTd0B';
        let salt=new Date().getTime();

        let sign=Md5(appid+query+salt+key);
        let to;
        let language = navigator.language||navigator.userLanguage;
        if(language){
            language = language.toLocaleLowerCase();
        }
        L.Logger.info('The words you want to translate is ', query, 'is Chinese ', (/[\u4e00-\u9fa5]/.test(query)));
        L.Logger.info('Your browser text type is ', language);

        let languageType = undefined;
        if(TkConstant.joinRoomInfo.isJapaneseTranslate){
            languageType = 'jp';
        }else{
            if(language.indexOf('en') > -1){    //英文
            languageType = 'en';
            }else if(language.indexOf('zh') > -1){  //中文
                languageType = 'zh';
                // if(language.indexOf('tw') > -1){    //中文繁体
                //     languageType = 'cht';
                // }
            }else if(language.indexOf('nl') > -1){  //荷兰文
                languageType = 'nl';
            }else if(language.indexOf('fr') > -1){  //法语
                languageType = 'fra';
            }else if(language.indexOf('de') > -1){  //德语
                languageType = 'de';
            }else if(language.indexOf('ja') > -1){  //日语
                languageType = 'jp';
            }else if(language.indexOf('it') > -1){  //意大利语
                languageType = 'it';
            }else if(language.indexOf('pt') > -1){  //葡萄牙语
                languageType = 'pt';
            }else if(language.indexOf('es') > -1){  //西班牙语
                languageType = 'spa';
            }else if(language.indexOf('sv') > -1){  //瑞典语
                languageType = 'swe';
            }else if(language.indexOf('ko') > -1){  //韩语
                languageType = 'kor';
            }else if(language.indexOf('ru') > -1){  //俄语
                languageType = 'ru';
            }else if(language.indexOf('th') > -1){  //泰语
                languageType = 'th';
            }else if(language.indexOf('vi') > -1){  //越南语
                languageType = 'vie';
            }
        }
        

        if((/[\u4e00-\u9fa5]/.test(query))) {
            //中文
            if( languageType === 'en' || languageType === 'zh' ){
                to = 'en';
            }else{
                to = languageType? languageType : 'en';
            }
        } else if((/[a-zA-Z]/.test(query))) {
            //英文
            if( languageType === 'en' || languageType === 'zh' ){
                to = 'zh';
            }else{
                to = languageType? languageType : 'en'
            }
        }else{
            to = languageType? languageType : 'en'
        }
        let request={
            "q":query,
            "from":"auto",
            "to":to,
            "appid":appid,
            "salt":salt,
            "sign":sign
        };
        $.ajax({ //跨域
            url:"https://fanyi-api.baidu.com/api/trans/vip/translate",
            data:request,
            dataType:'jsonp',
            type:'get',
            success:function(data){
                if(data.trans_result){
                    if (that.props.changeChatList && typeof that.props.changeChatList === "function" ) {
                        that.props.changeChatList($(target).attr('data-index'),data.trans_result[0].dst);
                    }
                    // $(target).siblings('.user-sended').append('<p>'+data.trans_result[0].dst+'</p>');//将翻译结果添加到页面中
                    // $(target).prop('disabled',true);
                    // $(target).css('opacity',0.5);
                    //通知react-virtualized重新计算列表
                    that.measureCache.clearAll();
                    that.VList.forceUpdateGrid();
                }
            }
        });
    };

    getLanguageType(str){

    }

    initVList(measureCache,VList){
        this.measureCache = measureCache;
        this.VList = VList;
    }
    _loadBubble( index, style ){
        let data = this.props.accelerateDate(index);
        let imgurl='';
        let cospath='';
        const that = this;
        let bubble = '';
        if(data.msgtype=='onlyimg'){
            let st = /([^\*]+)(.png|.gif|.jpg|.jpeg)$/;
            let ary=st.exec(data.msg);
            imgurl=ary[1] + '-1' + ary[2];
            cospath=data.cospath;
        }
        if (!this.state.imgSize[index]) {
            this.state.imgSize[index] = {
                width:TkConstant.joinRoomInfo.roomtype === TkConstant.ROOMTYPE.oneToOne ? '2rem' : '3rem',
                height:TkConstant.joinRoomInfo.roomtype === TkConstant.ROOMTYPE.oneToOne ? '1rem' : '1.5rem',
            }
        }
        if(data.fromID && data.type !== undefined){
            bubble = (
                <li key={ index } className={data.styleName?data.styleName:""} style={style}>
                    <div className="user-msg-box">
                        <div className="user-title">
                            {data.sendUserType ? <span className="send-time">{data.time}</span> :undefined }
                            {!data.sendUserType ? <span className="send-time">{data.time}</span> :undefined }
                            <span className="username"><span className="keywords"> {data.sendUserType?data.sendUserType:""} </span>{data.sendUserType ? undefined:<span className="limit-length">{data.who}</span>}</span>
                        </div>
                        <div className="user-body">
                            {data.msgtype=='onlyimg'? <div ref={div=>this.div=div} style={{height: this.state.imgSize[index].height,width:this.state.imgSize[index].width}}>
                                <div className='Lodingimg'></div>
                                <img className="msg-only-img" onLoad={this.getsize.bind(this,index)} onError={this.imgerrror.bind(this,index)} src={ window.WBGlobal.nowUseDocAddress + imgurl} onDoubleClick={this.changebig.bind(this,imgurl,cospath)} alt={imgurl}/>
                            </div> :(<div className="user-sended " onMouseDown = {(event)=>{event.stopPropagation(); }}>
                                {data.msg}
                                {data.transResult?<p>{data.transResult}</p>:null}
                            </div>)}
                            {data.msgtype!=='onlyimg'? <button className={"translate " + (data.transResult?"disabled":"")} disabled={data.transResult?true:false} data-index={index} style={{display:TkGlobal.playback?'none':'',opacity:data.transResult?0.5:1}} onClick={that._handleTranslateClick.bind(that)}></button>:null}
                        </div>
                    </div>
                </li>
            );
        } else {
            bubble = (
                <li className={"notice " + (data.styleName?data.styleName:"")} key={index} style={style}>
                    <div className="notice-box"  onMouseDown = {(event)=>{event.stopPropagation(); }}>
                        <span className="send-time">{data.time}</span>
                        <span className="the-msg" dangerouslySetInnerHTML={{__html:data.who}}></span>
                    </div>
                </li>
            );
        }
        return bubble;
    };
    /*使滚动条到底部*/
    _scrollGoDown() {
        let {chatMessageListLength} = this.props;
        if (this.VList && chatMessageListLength) {
            this.VList.scrollToRow(chatMessageListLength - 1);//将滚动条置底
            clearTimeout(this.scrollTimer);
            this.scrollTimer = setTimeout(()=>{
                this.VList.scrollToRow(chatMessageListLength - 1);//将滚动条置底
                this.forceUpdate();
            },10);
        }
    }
    measureCache = new CellMeasurerCache({
        fixedWidth: true,
        // minHeight: 80
    });


    render(){
        let {isDown, isDowntext} = this.state;
        let {chatMessageListLength} = this.props;
        return(
            <ChatListUl className={"chat-list "}  show={this.props.show}>
                {isDown !== true && isDowntext?<span className='logspan' onClick={this.godown.bind(this)}><i></i>{this.state.isDowntext+TkGlobal.language.languageData.alertWin.call.fun.UnreadMessage.text}</span>:null}
                <List
                    loadListItem={this._loadBubble.bind(this)}
                    rowCount={chatMessageListLength}
                    className={"chat-list-box custom-scroll-bar constraint-box "}
                    id="chatListBox"
                    onScroll={this.scroll.bind(this)}
                    initVList = {this.initVList.bind(this)}
                />
            </ChatListUl>
        )
    };
};

export default ChatListMessageDumb;
