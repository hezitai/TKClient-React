/**
 * 用户列表的Smart组件
 * @module UserListSmart
 * @description   用户列表的Smart组件,处理用户列表的业务
 */
'use strict';
import React from 'react';
import TkGlobal from 'TkGlobal';
import eventObjectDefine from 'eventObjectDefine';
import TkConstant from 'TkConstant';
import ServiceRoom from 'ServiceRoom';
import ServiceSignalling from 'ServiceSignalling';
import CoreController from 'CoreController';
import ServiceTooltip from 'ServiceTooltip';
import TkUtils from "TkUtils";
import UserListSearch from './UserListSearch';

import './static/css/index.css';
import "./static/css/black.css";
import styled from 'styled-components';
import UserListTitle from './UserListTitle';
import UserListContainer from './UserListContainer';
import Paging from '../../../../components/paging/paging';
const ToolExtendContainerDiv = styled.div`
    display:${props=>(props.isShow ? 'block':'none')}
`;
class UserListSmart extends React.Component{
    constructor(){
        super();
        this.state = {
            isShow:false,
            isLoadShow:false,
            checkNetworkChecked:false,
            userIsAsk:{},
            radioIndex: 0,
            pageSum:1,   //分页总数
            pageSize:15,  //分页一页多少个
            nowPage: 1,   //当前页
            searchNowPage:1,  //搜索结果当前页
            isSearch:false,    //是否搜索
            isPageText:1,
            userListSum:0,   //花名册总人数
            userListItemData:new Map()    //用户列表数据
        };
        this.userListSearchOpenIsshow=false;
        this.operationList =null;
        this.listernerBackupid = new Date().getTime()+'_'+Math.random() ;
    }
    componentDidMount(){
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomConnected , this.handlerRoomConnected.bind(this) , this.listernerBackupid ); //room-connected事件-接收到房间连接成功后执行添加用户到用户列表中
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomParticipantJoin , this.handlerRoomParticipantJoin.bind(this) , this.listernerBackupid ); //room-participant_join事件-收到有参与者加入房间后执行添加用户到用户列表中
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomParticipantLeave , this.handlerRoomParticipantLeave.bind(this) , this.listernerBackupid); //room-participant_leave事件-收到有参与者离开房间后执行删除用户在用户列表中
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomUserpropertyChanged , this.handlerRoomUserpropertyChanged.bind(this) , this.listernerBackupid); //room-userproperty-changed事件-收到参与者属性改变后执行更新用户在用户列表中
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomDisconnected , this.handlerRoomDisconnected.bind(this) , this.listernerBackupid); //room-disconnected事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPlaybackClearAllFromPlaybackController,this.handlerRoomPlaybackClearAll.bind(this) , this.listernerBackupid); //roomPlaybackClearAll 事件：回放清除所有信令
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomUservideostateChanged,this._controlRemoteStreamChange.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomUseraudiostateChanged,this._controlRemoteStreamChange.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomPubmsg , this.handlerRoomPubmsg.bind(this) , this.listernerBackupid); //roomPubmsg事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomModeChanged , this.handlerRoomMoreChanged.bind(this),this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener('receive-msglist-ClassBegin' , this.handlerReceiveMsglistClassBegin.bind(this) , this.listernerBackupid); //receive-msglist-ClassBegin 事件
        eventObjectDefine.CoreController.addEventListener('initAppPermissions' , this.handlerInitAppPermissions.bind(this)  , this.listernerBackupid) ; //事件 initAppPermissions
        eventObjectDefine.CoreController.addEventListener("userListSearchOpenIsshow" , this.UserListSearchOpenIsshow.bind(this),this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener("CloseUserListPanel" , this.CloseUserListPanel.bind(this),this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener("CloseALLPanel" , this.CloseUserListPanel.bind(this),this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener("recoverPanelBeforeStarting" , this.CloseUserListPanel.bind(this),this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener("triggerUserListPanel" , this.triggerUserListPanel.bind(this),this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener( 'beyondTmplEvent' , this.beyondTmplHandler.bind(this) , this.listernerBackupid);
        
    }
    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        eventObjectDefine.CoreController.removeBackupListerner(this.listernerBackupid);
    };
    componentDidUpdate(prevProps , prevState){
        // if (prevState.isShow !== this.state.isShow && this.state.isShow) {
        //     this.setDefaultPosition();
        // }
        if(TkGlobal.HeightConcurrence){
            let role = (TkConstant.hasRole.roleChairman  || TkConstant.hasRole.rolePatrol) ? [TK.ROOM_ROLE.ASSISTANT,TK.ROOM_ROLE.STUDENT]:[TK.ROOM_ROLE.ASSISTANT,TK.ROOM_ROLE.STUDENT,TK.ROOM_ROLE.TEACHER];
            //监听当前页改变
            if( !isNaN(parseInt(this.state.nowPage))  ){
                if( parseInt(prevState.nowPage) !==   parseInt(this.state.nowPage) ){
                    this.setState({isLoadShow:true});
                    this.handlerBigRoomUsersAndSetPage(this.state.pageSize*(this.state.nowPage-1),this.state.pageSize,role);
                }
            }else{
                this.setState({
                    isPageText:this.stepNowPage,
                    nowPage:this.stepNowPage
                })
            }

            //监听搜索状态当前页改变
            if( !isNaN(parseInt(this.state.searchNowPage))  ){
                if( parseInt(prevState.searchNowPage) !==   parseInt(this.state.searchNowPage) ){
                    this.setState({isLoadShow:true});
                    this.handlerBigRoomUsersAndSetPage(this.state.pageSize*(this.state.searchNowPage-1),this.state.pageSize,role,this.SearchName);
                }
            }else{
                this.setState({
                    isPageText:this.stepNowPage,
                    searchNowPage:this.stepNowPage
                })
            }
        }else{
            //小班课
            if( !isNaN(parseInt(this.state.nowPage))  ){
                if( parseInt(prevState.nowPage) !==   parseInt(this.state.nowPage) ){
                    this.handlerSmallRoomUsers();
                }
            }else{
                this.setState({
                    isPageText:this.stepNowPage,
                    nowPage:this.stepNowPage
                })
            }

            //监听搜索状态当前页改变
            if( !isNaN(parseInt(this.state.searchNowPage))  ){
                if( parseInt(prevState.searchNowPage) !==   parseInt(this.state.searchNowPage) ){
                    this.handlerSmallRoomUsers(this.SearchName);
                }
            }else{
                this.setState({
                    isPageText:this.stepNowPage,
                    searchNowPage:this.stepNowPage
                })
            }

        }
    }
    beyondTmplHandler(e){
        if(e.message){
            const {key} = e.message
            switch (key) {
                case 'userList':
                    this.setState({isShow: !this.state.isShow})
                    break;

                default:
                    break;
            }
        }
    }
    handlerRoomPubmsg(recvEventData){
        const that = this ;
        let pubmsgData = recvEventData.message ;
        switch(pubmsgData.name) {
            case "StreamFailure":
                /*this._updateTemporaryDisabled(pubmsgData.data.studentId , false); */
                let userid = pubmsgData.data.studentId ;
                if(TkGlobal.specificUsers[userid]){
                    delete TkGlobal.specificUsers[userid];
                }
                break;
            case 'ClassBegin':
                that.updateAllUserToList();
                break;
            case 'RemoteControl':
                if(pubmsgData.data.action === 'pushDocServer'){
                    const {serverList, serverIndex}=pubmsgData.data.serverInfo;
                    this.setState({
                        radioIndex: (serverIndex === null || serverIndex === undefined) ? 0 : serverIndex
                    },()=>{
                        if(TkGlobal.HeightConcurrence){
                            ServiceRoom.getTkRoom().getRoomUser(pubmsgData.fromID,(user)=>{
                                user && this.updateUserToList(user);
                            },(e)=>{
                                L.Logger.error('error:'+e)
                            })
                        }else{
                            const user = ServiceRoom.getTkRoom().getUser(pubmsgData.fromID)&&ServiceRoom.getTkRoom().getUser(pubmsgData.fromID)||undefined;   /* NN:小班课逻辑未改动*/

                            user && this.updateUserToList(user);
                        }
                    })
                }
                break;
        }
    };
    /*处理room-connected事件*/
    handlerRoomConnected(roomConnectedEventData){
        if(TkGlobal.HeightConcurrence){
            //todo
        }else{
            this.handlerSmallRoomUsers();
        }
    };
    /*处理room-participant_join事件*/
    handlerRoomParticipantJoin(roomParticipantJoinEventData){
        if(TkGlobal.HeightConcurrence){
            //todo
        }else{
            this.handlerSmallRoomUsers(this.SearchName);
        }
    }
    /*处理 room-mode-changed 事件*/
    handlerRoomMoreChanged(eventData){
        if(eventData.message.roomMode === "normalRoom"){return ;}
        if(this.state.isShow){
            const role = (TkConstant.hasRole.roleChairman  || TkConstant.hasRole.rolePatrol) ? [TK.ROOM_ROLE.ASSISTANT,TK.ROOM_ROLE.STUDENT]:[TK.ROOM_ROLE.ASSISTANT,TK.ROOM_ROLE.STUDENT,TK.ROOM_ROLE.TEACHER];
            this.getUserTimer = setInterval(()=>{
                if(this.state.isSearch){
                    this.handlerBigRoomUsersAndSetPage(this.state.pageSize*(this.state.searchNowPage-1),this.state.pageSize,role,this.SearchName);
                }else{
                    this.handlerBigRoomUsersAndSetPage(this.state.pageSize*(this.state.nowPage-1),this.state.pageSize,role);
                }
            },2000)
        }
    }
    /*处理room-participant_leave事件*/
    handlerRoomParticipantLeave(roomParticipantLeaveEventData){
        if(TkGlobal.HeightConcurrence){
            //todo
        }else{
            const removeuser = roomParticipantLeaveEventData.user ;
            this.removeUserToList(removeuser);
            this.handlerSmallRoomUsers()
        }
    }
    /*处理room-userproperty-changed事件*/
    handlerRoomUserpropertyChanged(roomUserpropertyChangedEventData){
        if(TkGlobal.HeightConcurrence){
            //TODO
        }else{
            const that = this ;
            const changePropertyJson  = roomUserpropertyChangedEventData.message ;
            const user = roomUserpropertyChangedEventData.user ;
            for( let key of Object.keys(changePropertyJson) ){
                if( key !== 'giftnumber' ){
                    that.updateUserToList(user) ;
                }
                if( key === 'disablechat'){
                    that.updateUserToList(user) ;
                }
            }
        }
    };
    handlerRoomPlaybackClearAll(){
        if(!TkGlobal.playback){L.Logger.error('No playback environment, no execution event[roomPlaybackClearAll] handler ') ;return ;};
        this.clearUserListItemJson();
    };
    /*处理room-disconnected事件*/
    handlerRoomDisconnected(roomDisconnectedEventData){
        this.clearUserListItemJson();
    };
    _controlRemoteStreamChange(event){
        let {message} = event;
        if(TkGlobal.specificUsers[message.userId]){
            delete TkGlobal.specificUsers[message.userId];
        }
    }
    handlerReceiveMsglistClassBegin(recvEventData){
        const that = this ;
        that.updateAllUserToList();
    };
    handlerInitAppPermissions(){
        this.updateAllUserToList();
    };
    UserListSearchOpenIsshow(data){
        this.userListSearchOpenIsshow=data.message
    }
    triggerUserListPanel(){
        this.setState({
            isShow:true
        });
        //打开花名册后执行
        if(TkGlobal.HeightConcurrence){
            let role = (TkConstant.hasRole.roleChairman  || TkConstant.hasRole.rolePatrol) ? [TK.ROOM_ROLE.ASSISTANT,TK.ROOM_ROLE.STUDENT]:[TK.ROOM_ROLE.ASSISTANT,TK.ROOM_ROLE.STUDENT,TK.ROOM_ROLE.TEACHER];
            this.handlerBigRoomUsersAndSetPage(this.state.pageSize*(this.state.nowPage-1),this.state.pageSize,role);
            this.getUserTimer = setInterval(()=>{
                if(this.state.isSearch){
                    this.handlerBigRoomUsersAndSetPage(this.state.pageSize*(this.state.searchNowPage-1),this.state.pageSize,role,this.SearchName);
                }else{
                    this.handlerBigRoomUsersAndSetPage(this.state.pageSize*(this.state.nowPage-1),this.state.pageSize,role);
                }
            },2000)
        }
    }
    /*设置初始位置*/
    setDefaultPosition() {
        let {id,draggableData} = this.props;
        let dragNode = document.getElementById(id);
        let boundNode = document.querySelector(draggableData.bounds);
        if (dragNode && boundNode) {
            if (draggableData.changePosition && typeof draggableData.changePosition === "function") {
                let isSendSignalling = false;//TkGlobal.dragRange.top
                const defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
                let boundNodeHeight=TkUtils.replacePxToNumber(TkUtils.getStyle(boundNode,'height'))/defalutFontSize;
                let dragNodeHeight=TkUtils.replacePxToNumber(TkUtils.getStyle(dragNode,'height'))/defalutFontSize;
                let percentTop=TkGlobal.dragRange.top/(boundNodeHeight-dragNodeHeight);
                draggableData.changePosition(id, {
                    percentLeft:0.5,
                    percentTop:TkConstant.hasRoomtype.oneToOne?0.5:percentTop,
                    isDrag:false
                }, isSendSignalling);
            }
        }
    }
    CloseUserListPanel(){
        clearInterval(this.getUserTimer);
        this.setState({
            isShow:false
        });
        eventObjectDefine.CoreController.dispatchEvent({
            type:'triggerUserListPanelRecover'
        });
        eventObjectDefine.CoreController.dispatchEvent({
            type:'userListClose'
        });
    }
    //清除用户列表
    clearUserListItemJson(){
        this.state.userListItemData.clear();
    }
    /*在用户列表中更新用户*/
    updateUserToList(user , children ,isRender = true){
        if(user.role === TkConstant.role.roleStudent  || user.role === TkConstant.role.roleTeachingAssistant ||  user.role === TkConstant.role.roleChairman ) {
            let userItemDescInfo = this._productionUserItemDescInfo(user , children);
            if(!userItemDescInfo){return ;}
            if(this.state.userListItemData.has(user.id) ){
                if( TkGlobal.HeightConcurrence ){ //大教室且两条消息的时间间隔小于500ms，则不直接render,等待定时器去render
                    let nowTime = new Date().getTime();
                    if( this.oldUserInfoNoticeTime !== undefined ){
                        if(nowTime - this.oldUserInfoNoticeTime <= 500){
                            this.isNeedRender = true ;
                            isRender = false ;
                        }
                    }
                    this.oldUserInfoNoticeTime = nowTime ;
                }

                Object.customAssign(this.state.userListItemData.get(user.id) , userItemDescInfo ) ;
                if(isRender){
                    this.isNeedRender = false;
                    this.setState({userListItemData:this.state.userListItemData},()=>{
                        if(user.openUserExtendList){
                            if(this.operationList && this.operationList.getBoundingClientRect){
                                const extend=this.operationList.getBoundingClientRect();
                                const ulClient = document.getElementById("tool_participant_user_list").getBoundingClientRect();
                                if(extend.top < ulClient.top){
                                    this.operationList.style.top = 'calc(60% + '+( Math.abs(ulClient.top - extend.top) + 12 )/100+'rem )';
                                }else if((extend.top+extend.height)>(ulClient.height+ulClient.top)){
                                    this.operationList.style.top = 'calc(30% - '+( Math.abs((extend.top + extend.height) - (ulClient.height + ulClient.top)))/100+'rem )';
                                }
                            }
                        }
                    });
                }
            }
        }
    };
    /*更新所有的用户属性状态*/
    updateAllUserToList(){
        const that = this ;
        const pageSize = this.state.pageSize;
        const nowPage = this.state.nowPage;
        const role = (TkConstant.hasRole.roleChairman || TkConstant.hasRole.rolePatrol) ? [TK.ROOM_ROLE.ASSISTANT,TK.ROOM_ROLE.STUDENT]:[TK.ROOM_ROLE.ASSISTANT,TK.ROOM_ROLE.STUDENT,TK.ROOM_ROLE.TEACHER];
        if(TkGlobal.HeightConcurrence){
            this.handlerBigRoomUsersAndSetPage(pageSize*(nowPage-1),pageSize,role);
        }else{
            let users = ServiceRoom.getTkRoom().getUsers();  /* NN：走到这里的是小班课*/
            for(let user of Object.values(users) ){
                that.updateUserToList(user);
            }
        }
    };
    /*在用户列表中删除用户*/
    removeUserToList(user,isRender = true){
        if(user.role === TkConstant.role.roleStudent  || user.role === TkConstant.role.roleTeachingAssistant ||  user.role === TkConstant.role.roleChairman) {
            if(this.state.userListItemData.has(user.id) ){
                if(TkConstant.HeightConcurrence){
                    let nowTime = new Date().getTime();
                    if( this.oldUserInfoNoticeTime !== undefined ){
                        if(nowTime - this.oldUserInfoNoticeTime <= 500){
                            this.isNeedRender = true ;
                            isRender = false ;
                        }
                    }
                    this.oldUserInfoNoticeTime = nowTime ;
                }
                this.state.userListItemData.delete(user.id) ;
                if(isRender){
                    this.setState({userListItemData:this.state.userListItemData})
                }
                
            }
        }
    };
    /*在用户列表中添加或者更新用户*/
    addUserToList(user,isRender = true){
        if(user.role === TkConstant.role.roleStudent  || user.role === TkConstant.role.roleTeachingAssistant ||  user.role === TkConstant.role.roleChairman) {
            if( !this.state.userListItemData.has(user.id) ){
                if(TkGlobal.HeightConcurrence){ //大教室且两条消息的时间间隔小于500ms，则不直接render,等待定时器去render
                    let nowTime = new Date().getTime();
                    if( this.oldUserInfoNoticeTime !== undefined ){
                        if(nowTime - this.oldUserInfoNoticeTime <= 500){
                            this.isNeedRender = true ;
                            isRender = false ;
                        }
                    }
                    this.oldUserInfoNoticeTime = nowTime ;
                }
                let userItemDescInfo = this._productionUserItemDescInfo(user);
                if(!userItemDescInfo){return ;}
                userItemDescInfo.temporaryDisabled = false ;
                if(this.userListSearchOpenIsshow){
                    userItemDescInfo.show=false;
                }
                this.state.userListItemData.set(user.id , userItemDescInfo );
                if(isRender){
                    this.setState({userListItemData:this.state.userListItemData});
                }
            }
        }
    };
    //计算页数
    pageCount(totalnum,limit){
        return totalnum > 0 ? ((totalnum < limit) ? 1 : ((totalnum % limit) ? (parseInt(totalnum / limit) + 1) : (totalnum / limit))) : 1;
    }
    //高并发房间获取用户列表
    handlerBigRoomUsersAndSetPage(start,max,role,search){
        ServiceRoom.getTkRoom().getRoomUsers((users,total)=>{
            // //设置总页数
            const pagesum = this.pageCount(total,this.state.pageSize);
            if(this.state.isSearch){
                if(this.state.searchNowPage >pagesum){
                    this.setState({
                        searchNowPage:pagesum,
                        isPageText:pagesum
                    })
                }
            }else{
                if(this.state.nowPage > pagesum){
                    this.setState({
                        nowPage:pagesum,
                        isPageText:pagesum
                    })
                }
            }
            // 获取用户列表
            this.clearUserListItemJson();
            for(let key in  users ){
                let user = users[key];
                let isConflict = CoreController.handler.checkRoleConflict(user , false) ;
                if(!isConflict){
                    this.addUserToList(user,false);
                }
            }
            this.setState({isLoadShow:false,pageSum:pagesum,userListSum:total});
        },start,max,role,e=>{L.Logger.error(e)},search,[{"role":'asc'},{"ts":'asc'}]);
    }
    //小班课房间获取用户列表
    handlerSmallRoomUsers(searchName){
        const pageSize = this.state.pageSize;
        const nowPage = this.state.nowPage;
        const allUsers = (TkConstant.hasRole.roleChairman || TkConstant.hasRole.rolePatrol) ? this.getAllUserInSort().filter(item=>item.role!==0) : this.getAllUserInSort() ;
        const cutUsers = (TkConstant.hasRole.roleChairman || TkConstant.hasRole.rolePatrol) ? this.getAllUserInSort().filter(item => item.role !== 0).slice(pageSize*(nowPage-1),pageSize*nowPage):this.getAllUserInSort().slice(pageSize*(nowPage-1),pageSize*nowPage);
        let pagesum = null;
        this.clearUserListItemJson();
        if(this.state.isSearch){
            let searchUsers = allUsers.filter(item=>item.nickname.indexOf(searchName)!==-1);
            this.searchUsers = searchUsers;
            let searchUsersSlice = searchUsers.slice(pageSize*(this.state.searchNowPage-1),pageSize*this.state.searchNowPage);
            for(let key in searchUsersSlice){
                let user = searchUsersSlice[key];
                let isConflict = CoreController.handler.checkRoleConflict(user , false) ;
                if(!isConflict){
                    this.addUserToList(user);
                }
            }
            pagesum = this.pageCount(searchUsers.length,pageSize);
            if(this.state.searchNowPage > pagesum){
                this.setState({
                    searchNowPage:pagesum,
                    isPageText:pagesum
                })
            }
        }else{
            this.searchUsers=null;
            for(let key in cutUsers){
                let user = cutUsers[key];
                let isConflict = CoreController.handler.checkRoleConflict(user , false) ;
                if(!isConflict){
                    this.addUserToList(user);
                }
            }
            pagesum= this.pageCount(allUsers.length,this.state.pageSize);
            if(this.state.nowPage > pagesum){
                this.setState({
                    nowPage:pagesum,
                    isPageText:pagesum
                })
            }
        }

        this.setState({pageSum:pagesum,userListSum:allUsers.length});
    }
    //获取小班课用户并通过时间排序
    getAllUserInSort(){  
        let users = Object.values(ServiceRoom.getTkRoom().getUsers()); /*NN:走到这里的是小班课*/
        let teacherArr = users.filter(item=>item.role===0);
        let studentArr = users.filter(item=>item.role===2).sort((a,b)=>a.ts - b.ts);
        let teachingAssistantArr = users.filter(item=>item.role===1).sort((a,b)=>a.ts - b.ts);
        let resultArr = [];
        if(!TkConstant.hasRole.rolePatrol){
            resultArr.push(...teacherArr);
        }
        resultArr.push(...teachingAssistantArr);
        resultArr.push(...studentArr);
        return resultArr;
    }
    //翻页组件获取焦点
    pagingInputFocus(){
        this.stepNowPage = parseInt(this.state.nowPage);
    }
    //翻页组件输入
    pagingInputChange(v){
        this.setState({
            isPageText: v
        })
    }
    //翻页组件失去焦点
    pagingInputBlur(e){
        if(!isNaN(parseInt(e))){
            this.setState({
                nowPage:parseInt(e),
                isPageText:parseInt(e)
            })
        }else{
            this.setState({
                isPageText:this.state.nowPage
            })
        }
    }
    //翻页组件点击上一页
    pagingClickPrev(){
        if(this.state.isSearch){
            this.setState({searchNowPage:this.state.searchNowPage - 1,isPageText:this.state.searchNowPage - 1 });
        }else{
            this.setState({nowPage:this.state.nowPage - 1,isPageText:this.state.nowPage - 1 });
        }
    }
    //翻页组件点击下一页
    pagingClickNext(){
        if(this.state.isSearch){
            this.setState({searchNowPage:this.state.searchNowPage + 1,isPageText:this.state.searchNowPage + 1 });
        }else{
            this.setState({nowPage:this.state.nowPage + 1,isPageText:this.state.nowPage + 1 });
        }
    }
    handlerOpenUserExtendListOnMouseLeave(user , event){
        if(user){
            if(  user.openUserExtendList ){
                this._updateOpenUserExtendList(user , false );
            }
        }
        if(event){
            event.preventDefault();
            event.stopPropagation();
        }
        return false ;
    }; 
    handlerOpenUserExtendListOnClick(user , event){
        this.operationList = event.target.parentNode.getElementsByClassName('user-extend-list')[0];
        // let ul = document.getElementById("tool_participant_user_list");
        // //ServiceSignalling.sendSignallingFromRemoteControl(user.id, {action: 'getDocServer'});
        if(user){
            let openUserExtendList = user.openUserExtendList ;
            this._updateOpenUserExtendList(user , !openUserExtendList ,true);
        }

        if(event){
            event.preventDefault();
            event.stopPropagation();
        }

        return false ;
    };
    handlerUserRefresh(userid , event){
        let data = {
            action:'refresh' ,
        };
        ServiceSignalling.sendSignallingFromRemoteControl(userid , data);
        if(event){
            event.preventDefault();
            event.stopPropagation();
        }
        return false ;
    };
    handlerUserDeviceManagement(userid , event){
        eventObjectDefine.CoreController.dispatchEvent({type:'remoteControl_deviceManagement' , message:{user:userid}});

        if(event){
            event.preventDefault();
            event.stopPropagation();
        }
        return false ;
    };
    handlerUserAreaSelection(user , event){
        eventObjectDefine.CoreController.dispatchEvent({type:'remoteControl_userAreaSelection' , message:{user:user}});
        if(event){
            event.preventDefault();
            event.stopPropagation();
        }
        return false ;
    };
    handlerUseCndLine(user , event){
        if(user.codeVersion<2){
            ServiceSignalling.sendSignallingFromRemoteControl(user.id, {action: 'getDocServer'});
        }else{
            ServiceSignalling.sendSignallingFromRemoteControl(user.id , {action: 'nowSomeoneCdnIp'});
        }
        if(event){
            event.preventDefault();
            event.stopPropagation();
        }
        return false ;
    };
    /* 花名册搜索*/
    userListSearch(name){
        this.SearchName = name;
        if(TkGlobal.HeightConcurrence){
            if(name){
                this.setState({isSearch:true,isPageText:1,searchNowPage:1});
            }else{
                this.setState({isSearch:false,nowPage:this.state.nowPage,isPageText:this.state.nowPage});
            }
        }else{
            if(name){
                this.setState({isSearch:true,isPageText:1,searchNowPage:1},()=>{
                    this.handlerSmallRoomUsers(name);
                });
            }else{
                this.setState({isSearch:false,nowPage:this.state.nowPage,isPageText:this.state.nowPage},()=>{
                    this.handlerSmallRoomUsers();
                });
            }
        }
    }
    /*用户功能-打开关闭视频*/
    userVideoOpenOrClose(user) {
        if(!user){ L.Logger.error('user is not exist , userid is '+user.id+'!'); return;}
        if( ( !this.isBeyondMaxVideo() || user.publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE ) ){ //没有超出最大发布路数   //xgd 17-09-20
            ServiceSignalling.userVideoOpenOrClose(user);
        }else{
            const children = <span className="beyond-max-video" > {TkGlobal.language.languageData.alertWin.call.prompt.remoteStreamFailure.publishvideoFailure_overrun.one} </span> ;
            this.updateUserToList( user , children );
            // that._updateTemporaryDisabled(userid ,true );
            setTimeout( () => {
                this.updateUserToList( user , undefined );
                // that._updateTemporaryDisabled(userid ,false );
            } , 3000) ;
        }
    }
    /*用户功能-打开关闭音频*/
    userAudioOpenOrClose(user) {
        // ServiceSignalling.userAudioOpenOrClose(user)
        if(!user){ L.Logger.error('user is not exist , userid is '+user.id+'!'); return;}
        if( ( !this.isBeyondMaxVideo() || user.publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE ) ){ //没有超出最大发布路数   //xgd 17-09-20
            ServiceSignalling.userAudioOpenOrClose(user)
        }else{
            const children = <span className="beyond-max-video" > {TkGlobal.language.languageData.alertWin.call.prompt.remoteStreamFailure.publishvideoFailure_overrun.one} </span> ;
            this.updateUserToList( user , children );
            // that._updateTemporaryDisabled(userid ,true );
            setTimeout( () => {
                this.updateUserToList( user , undefined );
                // that._updateTemporaryDisabled(userid ,false );
            } , 3000) ;
        }
    }
    /*改变用户的画笔权限*/
    changeUserCandraw(user,isCandraw) {
        // ServiceSignalling.changeUserCandraw(user);

        if(!user){ L.Logger.error('user is not exist , userid is '+user.id+'!'); return;}
        if( ( !this.isBeyondMaxVideo() || user.publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE ) ){ //没有超出最大发布路数   //xgd 17-09-20
            ServiceSignalling.changeUserCandraw(user);
        }else{
            const children = <span className="beyond-max-video" > {TkGlobal.language.languageData.alertWin.call.prompt.remoteStreamFailure.publishvideoFailure_overrun.one} </span> ;
            this.updateUserToList( user , children );
            // that._updateTemporaryDisabled(userid ,true );
            setTimeout( () => {
                this.updateUserToList( user , undefined );
                // that._updateTemporaryDisabled(userid ,false );
            } , 3000) ;
        }
    }
    //踢出房间
    handlerRemoveClick(userid){
        ServiceTooltip.showConfirm( TkGlobal.language.languageData.alertWin.messageWin.winMessageText.removeStudent.text , function (answer) {
            if(answer){
                let data = {
                    reason : 1
                };
                ServiceRoom.getTkRoom().evictUser(userid,data);
            }
        });
    }
    //单独用户禁言
    handlerAloneUserBanSpeak(userid){
        if(TkGlobal.HeightConcurrence){
            ServiceRoom.getTkRoom().getRoomUser(userid,(user)=>{
                if(!user){ L.Logger.error('user is not exist , userid is '+userid+'!'); return;}
                if(user.role === TkConstant.role.roleTeachingAssistant || user.role === TkConstant.role.roleChairman ){
                    return false;
                }
                let disablechatStatus = user.disablechat;

                let data = {
                    disablechat:!disablechatStatus,
                };
                ServiceSignalling.setParticipantPropertyToAll(userid, data);
            },(e)=>{L.Logger.error('error:'+e)});
        }else{
            let user =  ServiceRoom.getTkRoom().getUser(userid);  /*NN: 走到这里就是小班课*/
            if(!user){ L.Logger.error('user is not exist , userid is '+userid+'!'); return;}
            if(ServiceRoom.getTkRoom().getUser(userid).role === TkConstant.role.roleTeachingAssistant || ServiceRoom.getTkRoom().getUser(userid).role === TkConstant.role.roleChairman ){  /*NN： 小班课才会走到这里*/
                return false;
            }
            let disablechatStatus = user.disablechat;
            let data = {
                disablechat:!disablechatStatus,
            };
            ServiceSignalling.setParticipantPropertyToAll(userid, data);
        }
    }
    /*上台人数是否超过限制*/
    isBeyondMaxVideo(){
        let publishNum = 0 ;
        let isBeyondMaxVideo = false ;
        let users = ServiceRoom.getTkRoom().getUsers(); //这里检测上台的人是否超限，因为台上的人在列表中，因此此处就算是大房间获取列表也是可行的
        for(var key in users ){
            if(users[key].publishstate !== TK.PUBLISH_STATE_NONE){
                if(  (++publishNum) >= TkConstant.joinRoomInfo.maxvideo){
                    isBeyondMaxVideo = true ;
                    return isBeyondMaxVideo ;
                }
            }
        }
        return isBeyondMaxVideo ;
    };
    /*处理用户列表中用户点击item的事件-用户上下台功能*/
    handlerUserListItemOnClick(user){
        const that = this ;
        //该用户在后台模式并且是下台状态就不让上台，给予提示
        if (user.isInBackGround && user.isInBackGround === true && user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE) {
            ServiceTooltip.showPrompt(
                user.nickname
                + TkGlobal.language.languageData.alertWin.call.prompt.remoteStreamFailure.mobileHome.two
            );
            return;
        }
        if(!user){ L.Logger.error('user is not exist , userid is '+user.id+'!'); return;}
        /*user.passivityPublish = true ;*/
        TkGlobal.specificUsers[user.id]=true;
        //let assistantFlag = TkConstant.hasRoomtype.oneToOne && TkConstant.joinRoomInfo.assistantOpenMyseftAV;
        //let studentPlatformUp = TkConstant.hasRoomtype.oneToOne && assistantFlag &&  user.role === TkConstant.role.roleStudent && user.publishstate == TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE;   //一对一，学生没有上台，且助教可以发布音视频
        if( ( !this.isBeyondMaxVideo() || user.publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE ) ){ //没有超出最大发布路数   //xgd 17-09-20
            if(!TkGlobal.classBegin && ServiceRoom.getTkRoom().getMySelf().id == user.id){  //LJH修改  爱斑马的上课前助教开启音视频配置 满足条件助教自己点击自己
                // that._updateTemporaryDisabled(userid ,true );
                ServiceSignalling.userPlatformUpOrDown( user ) ;
            }else if(TkGlobal.classBegin){ //LJH   上课之后不做修改保留之前
                // that._updateTemporaryDisabled(userid ,true );
                ServiceSignalling.userPlatformUpOrDown( user ) ;
                if(user.publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE && TkConstant.joinRoomInfo.areaExchange && TkConstant.hasRoomtype.oneToOne && user.role===TkConstant.role.roleStudent){
                    eventObjectDefine.CoreController.dispatchEvent({
                        type:'areaExchangeClose',
                        message: {
                            hasExchange: false,
                            user:user,
                            hasBtn:true
                        }
                    });
                }
            }
        }else{
            const children = <span className="beyond-max-video" > {TkGlobal.language.languageData.alertWin.call.prompt.remoteStreamFailure.publishvideoFailure_overrun.one} </span> ;
            that.updateUserToList( user , children );
            // that._updateTemporaryDisabled(userid ,true );
            const timer = setTimeout( () => {
                that.updateUserToList( user , undefined );
                clearTimeout(timer)
                // that._updateTemporaryDisabled(userid ,false );
            } , 3000) ;
        }
    };
    handlerUserKick(userid , event){
        let data = {
            reason : 1
        };
        ServiceRoom.getTkRoom().evictUser(userid , data);
        if(event){
            event.preventDefault();
            event.stopPropagation();
        }
        return false ;
    }
    lineChange(index, userid, event){
        this.handlerUserKick()
        this.setState({
            radioIndex: index
        }, ()=>{

            let data = {
                action:'changeLine' ,
                lineIndex: index
            };
            ServiceSignalling.sendSignallingFromRemoteControl(userid , data);

        })
        return false ;
    }
    _updateOpenUserExtendList(user ,openUserExtendList ,isClick){
        if(user){
            user.openUserExtendList = openUserExtendList ;
            this.updateUserToList(user,isClick );
        }
    };
    /*根据user生产用户描述信息*/
    _productionUserItemDescInfo(user , children ){
        const that = this ;
        if(user.role === TkConstant.role.roleChairman && !TkConstant.hasRole.roleTeachingAssistant){ //用户角色是老师并且我自己的角色不是助教，则不显示老师
            return ;
        }
        let platformDisabled = false;
        let videoBtnDisabled = false;
        let audioBtnDisabled=false;
        let pencilDisabled = false;
        if( !TkGlobal.classBegin ){
            if(  TkConstant.hasRole.roleTeachingAssistant && user.id === ServiceRoom.getTkRoom().getMySelf().id
                && TkConstant.joinRoomInfo.isBeforeClassReleaseVideo && TkConstant.joinRoomInfo.assistantOpenMyseftAV ){ //我是助教且角色是我自己，上课前发布音视频且助教开启上台配置项，则能上台
                platformDisabled = false ;
                videoBtnDisabled = false;
                audioBtnDisabled = false;
                pencilDisabled = true;
            }else{
                platformDisabled = true ;
                videoBtnDisabled = true;
                audioBtnDisabled = true;
                pencilDisabled = true;
            }
        }else{
            //上下台权限判断
            let notUserlisPlatform = !CoreController.handler.getAppPermissions('userlisPlatform') ; //没有点击上台的权限
            let notDeviceNotPublish = (!user.hasvideo && !user.hasaudio &&  user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE )  ; //没有设备并且没有上台则不能上台
            let disabledDeviceNotPublish = (user.disableaudio && user.disablevideo &&  user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE)   ; //有设备并且没有上台则不能上台
            let teachingAssistantNotPublish = ( (user.role === TkConstant.role.roleTeachingAssistant || user.role === TkConstant.role.rolePatrol)  && !TkConstant.joinRoomInfo.assistantOpenMyseftAV ) ; //角色是助教并且助教没有开启上台配置项则不能上台
            // platformDisabled = ( notUserlisPlatform || notDeviceNotPublish || disabledDeviceNotPublish || teachingAssistantNotPublish ) ;
            platformDisabled = ( notDeviceNotPublish || disabledDeviceNotPublish || teachingAssistantNotPublish ) ;
            //视频权限判断
            // videoBtnDisabled = !( user.publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE && user.hasvideo && !isAudioRoom ) ;
            videoBtnDisabled = !(user.role === TkConstant.role.roleTeachingAssistant ? (TkConstant.joinRoomInfo.assistantOpenMyseftAV&&user.hasvideo) : user.hasvideo);
            //音频权限判断
            // audioBtnDisabled = !( user.publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE && user.hasaudio) ;
            audioBtnDisabled = !(user.role === TkConstant.role.roleTeachingAssistant ? (TkConstant.joinRoomInfo.assistantOpenMyseftAV&&user.hasaudio) : user.hasaudio) ;
            //画笔权限判断
            pencilDisabled = !(user.role===TkConstant.role.roleStudent);
        }

        let beforeIconChildrenArray  = undefined ;
        if(TkConstant.hasRole.roleTeachingAssistant && user.id !== ServiceRoom.getTkRoom().getMySelf().id){ //如果是助教才有管理的功能
            beforeIconChildrenArray = [] ;
            let extendButtonShow =  {
                refresh:user.appType === 'webpageApp'  &&  (
                    (user.devicetype === 'MacClient' || user.devicetype === 'WindowClient') && Number(user.systemversion) >= 2018010200  ? true : !(user.devicetype === 'MacClient' || user.devicetype === 'WindowClient') ) ,
                deviceManagement:user.appType === 'webpageApp' ,
                areaSelection:true ,
                kick:user.role === TkConstant.role.roleChairman?false:true ,
                // getDocAddress: true,
                getDocAddress: user.codeVersion >= 1 , //代码版本大于等于1才显示切换cdn
            };
            let extendNum = 0 ;
            for(let value of Object.values(extendButtonShow)){
                if(value){
                    extendNum++;
                }
            }
            // style={{display:user.openUserExtendList ? 'block' : 'none' }}
            beforeIconChildrenArray.push(
                <div key={'userExtendList'} className={'user-remote-list-container'} style={{display:user.openUserExtendList ? 'block' : 'none'  }} >
                    <button className='triangle'></button>
                    <div className="user-extend-list remote-control-container add-position-absolute-top0-right0"  key={'userExtendList'}  style={{display:user.openUserExtendList ? 'table' : 'none' }} >
                    <span className={"extend-container all-children-user-select-none " }  >
                        {!extendButtonShow.refresh?undefined: <button className="extend-option refresh"   onClick={that.handlerUserRefresh.bind(that , user.id)} >
                            <span className='add-nowrap' style={{width: "100%"}} title={TkGlobal.language.languageData.remoteControl.refresh} >{TkGlobal.language.languageData.remoteControl.refresh}</span>
                        </button> }
                        {!extendButtonShow.deviceManagement?undefined: <button className="extend-option device-management" onClick={that.handlerUserDeviceManagement.bind(that , user)}  >
                            <span className='add-nowrap' style={{width: "100%"}} title={TkGlobal.language.languageData.remoteControl.deviceManagement} >{TkGlobal.language.languageData.remoteControl.deviceManagement}</span>
                        </button>}
                        {!extendButtonShow.areaSelection?undefined: <button className="extend-option area-selection"  onClick={that.handlerUserAreaSelection.bind(that , user)}  >
                            <span className='add-nowrap' style={{width: "100%"}} title={TkGlobal.language.languageData.remoteControl.optimalServer} >{TkGlobal.language.languageData.remoteControl.optimalServer}</span>
                        </button>}
                        {!extendButtonShow.kick?undefined: <button className="extend-option kick"  onClick={that.handlerUserKick.bind(that , user.id)}  >
                            <span className='add-nowrap' style={{width: "100%"}} title={TkGlobal.language.languageData.remoteControl.kick} >{TkGlobal.language.languageData.remoteControl.kick}</span>
                        </button>}
                        {!extendButtonShow.getDocAddress?undefined: <button className="extend-option get-doc-address" >
                            <span className='add-nowrap' style={{width: "90%"}} title={TkGlobal.language.languageData.remoteControl.getDocAddress} onClick={that.handlerUseCndLine.bind(this,user)} >{TkGlobal.language.languageData.remoteControl.getDocAddress}</span>
                        </button>}
                    </span>
                    </div>
                </div>

            );
        }
        let roleClassName =  (user.role === TkConstant.role.roleChairman ? 'roleChairman':( user.role === TkConstant.role.roleTeachingAssistant ? 'roleTeachingAssistant': ( user.role === TkConstant.role.roleStudent ? 'roleStudent': ''  )  ) ) ;
        const userItemDescInfo =  {
            id:user.id,
            active:false,
            // onClick:!disabled?that.handlerUserListItemOnClick.bind(that , user.id):undefined ,
            textContext:user.nickname ,
            show:true,
            clientDeviceVersionInfo :user.devicetype,
            children:children  ,
            disabled:TkConstant.hasRole.rolePatrol,
            order:user.role === TkConstant.role.roleStudent ? 0 : ( user.role === TkConstant.role.roleTeachingAssistant?1:2 ), //根据角色排序用户列表，数越小排的越往后 （order:0-学生 ， 1-助教 ， 2-暂时未定）
            beforeIconArray:[
                {
                    show:true ,
                    // className:user.udpstate === L.Constant.udpState.notOnceSuccess ? 'udp-notOnceSuccess ' : 'udp-ok ' + ( user.openUserExtendList?' userRemoteActive':' '  ) ,
                    className:'',
                    disabled:!(TkConstant.hasRole.roleTeachingAssistant && user.id !== ServiceRoom.getTkRoom().getMySelf().id) ,
                    title:undefined ,
                    iconChildren:beforeIconChildrenArray ,
                    before:true ,
                    onMouseLeave:that.handlerOpenUserExtendListOnMouseLeave.bind(that , user) ,
                    onClick:that.handlerOpenUserExtendListOnClick.bind(that , user )
                }
            ] ,
            afterIconArray:[
                {
                    show:true ,
                    'className':'hand-icon '+ (user.raisehand? 'on' : 'off') ,
                    title:user.raisehand?TkGlobal.language.languageData.header.system.Raise.yesText : TkGlobal.language.languageData.header.system.Raise.noText,
                    disabled:false,
                } ,
                {
                    // show:!(user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE && !user.hasaudio && !user.hasvideo) ,
                    show:true,
                    'className':'v-user-update-icon  '+ roleClassName + ( user.publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE ? ' on' : ' off') ,
                    title: user.publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE ? TkGlobal.language.languageData.toolContainer.toolIcon.userList.button.update.up.title : TkGlobal.language.languageData.toolContainer.toolIcon.userList.button.update.down.title,
                    onClick:that.handlerUserListItemOnClick.bind(that , user),
                    disabled:platformDisabled,
                } ,
                {
                    // show:user.hasvideo ,
                    show:true,
                    'className':'video-icon ' + ( ( user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_VIDEOONLY || user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH ) ? 'on' : 'off' )+ ' ' +( user.disablevideo ? 'disablevideo' : '') +' '+ (user.hasvideo ? "":"no")  ,
                    title: user.disablevideo ? TkGlobal.language.languageData.toolContainer.toolIcon.userList.button.video.disabled.title : (
                        user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_VIDEOONLY || user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH   ?
                            TkGlobal.language.languageData.toolContainer.toolIcon.userList.button.video.on.title : TkGlobal.language.languageData.toolContainer.toolIcon.userList.button.video.off.title
                    ) ,
                    onClick:that.userVideoOpenOrClose.bind(that,user),
                    disabled:videoBtnDisabled
                } ,
                {
                    // show:user.hasaudio ,
                    show:true,
                    'className':'audio-icon ' +' '+ ( (user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY || user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH  ) ?  'on' : 'off' ) + ' ' +( user.disableaudio ? 'disableaudio' : '') +' '+(user.hasaudio ? "":"no"),
                    title: user.disableaudio ? TkGlobal.language.languageData.toolContainer.toolIcon.userList.button.audio.disabled.title : (
                        user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY || user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH   ?
                            TkGlobal.language.languageData.toolContainer.toolIcon.userList.button.audio.on.title : TkGlobal.language.languageData.toolContainer.toolIcon.userList.button.audio.off.title
                    ) ,
                    onClick:that.userAudioOpenOrClose.bind(that,user),
                    disabled:audioBtnDisabled
                } ,
                {
                    show:true ,
                    'className':'pencil-icon '+ (user.candraw? 'on' : 'off') ,
                    title:user.candraw ?  TkGlobal.language.languageData.toolContainer.toolIcon.userList.button.Scrawl.on.title :  TkGlobal.language.languageData.toolContainer.toolIcon.userList.button.Scrawl.off.title,
                    onClick:that.changeUserCandraw.bind(that,user),
                    // disabled:!TkGlobal.classBegin ? true : ( user.role===TkConstant.role.roleTeachingAssistant || user.role === TkConstant.role.roleChairman )
                    // disabled:user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE
                    disabled:pencilDisabled
                    // (user.role===TkConstant.role.roleTeachingAssistant || user.role === TkConstant.role.roleChairman)
                } ,
                {
                    show:true ,
                    'className':'mute-icon '+(!user.disablechat? 'on':'off'),
                    title:user.disablechat?TkGlobal.language.languageData.toolContainer.toolIcon.userList.button.mute.on.title:TkGlobal.language.languageData.toolContainer.toolIcon.userList.button.mute.off.title,
                    onClick:that.handlerAloneUserBanSpeak.bind(that,user.id),
                    disabled:user.role===TkConstant.role.roleTeachingAssistant || user.role === TkConstant.role.roleChairman
                },
                {
                    show:true,
                    'className':'remove-icon',
                    title:TkGlobal.language.languageData.toolContainer.toolIcon.userList.button.remove.title,
                    onClick:that.handlerRemoveClick.bind(that,user.id),
                    disabled:user.role===TkConstant.role.roleTeachingAssistant || user.role === TkConstant.role.roleChairman
                }
            ]
        } ;

        return userItemDescInfo ;
    };
    /*加载ListItem组件数组*/
    loadListItem(listItemDataArray){
        const that = this ;
        const _loadListItemContext = (textContextArray) => {
            const listItemContextArray = [] ;
            const _handlerAddTextContext = (value , index) => {
                const {className , textContext , id , onClick  ,order ,   ...ohterAttrs} = value ;
                listItemContextArray.push(
                    <span key={index} title={textContext} className={"tk-listitem-context "+(className || '')  }  id={id}  onClick={onClick} {...ohterAttrs} >{textContext}</span>
                )
            };
            if(TkUtils.isArray(textContextArray)){
                textContextArray.forEach( (value , index) =>{
                    _handlerAddTextContext(value , index);
                } );
            }else{
                _handlerAddTextContext(textContextArray );
            }
            return {listItemContextArray:listItemContextArray};
        };
        const loadIconArray = (iconArray) => {
            const beforeElementArray = [] , afterElementArray = [] ;
            if(iconArray){
                iconArray.forEach( (value , index) =>{
                    value.attrJson = value.attrJson || {} ;
                    const {attrJson , disabled , after , before , context , show , onClick  , onMouseLeave , iconChildren} = value ;
                    const {id , title  , className , ...otherAttrs } =  attrJson ;
                    const iconTemp = (<span key={index} style={ {display:!show?'none':undefined} } className={'tk-icon  tk-button-span tk-listitem-icon '+ (before?' tk-icon-before ':' tk-icon-after ')
                    + (className?className:'') + ' ' + (disabled?' disabled ':' ') } onMouseLeave={onMouseLeave && typeof onMouseLeave === "function"?onMouseLeave:undefined}
                                            onClick={onClick && typeof onClick === "function"?onClick:undefined}  title={title} id={id} {...TkUtils.filterContainDataAttribute(otherAttrs) } >
                        {context?context:''}
                        {iconChildren}
                    </span>) ;

                    if(before){
                        beforeElementArray.push(iconTemp)
                    }else if(after){
                        afterElementArray.push(iconTemp)
                    }

                });
            }
            return{
                beforeElementArray:beforeElementArray ,
                afterElementArray:afterElementArray
            }
        }
        const listItemArray = [] ;
        if(listItemDataArray){
            listItemDataArray.forEach( (value , index) =>{
                value = value || {} ;
                let { textContextArray , children ,iconArray,className,id,show, ...other} =  value ;
                let {listItemContextArray} = _loadListItemContext(textContextArray);
                let { beforeElementArray ,  afterElementArray }  = loadIconArray(iconArray);
                listItemArray.push(
                    <li key={index}  className={"tk-list-item "+className} id={id}    style={{display:!show ?'none':undefined}}  {...TkUtils.filterContainDataAttribute(other) } >
                        <span className={"tk-icon-before-container tk-icon-size-"+beforeElementArray.length } >
                            {beforeElementArray}
                        </span>
                        {listItemContextArray}
                        {children}
                        <span className={"tk-icon-after-container tk-icon-size-"+afterElementArray.length} >
                            {afterElementArray}
                        </span>
                    </li>
                );
            });
        }
        return {listItemArray:listItemArray} ;
    }
    /*加载用户列表所需要的props*/
    loadUserListProps(userListItemJson ){
        const _getListItemDataArray = (userListItemJson) => {
            const listItemDataArray = [] ;
            userListItemJson.forEach( (value , index) => {
                let {id , disabled  , children , textContext , beforeIconArray ,afterIconArray , show , active ,temporaryDisabled ,  onClick   , order , clientDeviceVersionInfo} = value ;
                let userId = id;
                let tmpUserListItemJson = {
                    className:'user-container clear-float add-position-relative '+( disabled?' disabled ':' ') + ( active?' active ':' ')+ ( temporaryDisabled?' temporary-disabled ':' '),
                    id:id ? 'userlist_'+id : undefined ,
                    textContextArray:[
                        {
                            className:'user-name add-fl add-nowrap' ,
                            textContext:textContext ,
                            order:order ,
                        }
                    ] ,
                    order:order ,
                    children:children ,
                    show:show!=undefined?show:true ,
                    onClick:onClick ,
                    clientDeviceVersionInfo:clientDeviceVersionInfo,
                    iconArray:(function (afterIconArray , beforeIconArray) {
                        const tmpArr = [] ;
                        afterIconArray = afterIconArray || [] ;
                        beforeIconArray = beforeIconArray || [] ;
                        afterIconArray.forEach(function (item) {
                            const {after ,before , className , disabled , show ,title ,id ,onClick ,  ...other } = item;
                            tmpArr.push(
                                {
                                    attrJson:{
                                        className:before?'user-portrait add-fl add-block use-pic '+ ( className || '' ) :  className,
                                        title:title ,
                                        id:id,
                                    } ,
                                    before:before,
                                    after: after!=undefined? after:true,
                                    disabled:disabled,
                                    show:show!=undefined?show:true ,
                                    onClick:onClick?onClick:undefined ,
                                    ...TkUtils.filterContainDataAttribute(other),
                                }
                            );
                        });
                        beforeIconArray.forEach(function (item) {
                            const {after ,before = true , className , show = true ,title ,id ,onClick ,onMouseLeave , disabled = true , iconChildren , ...other } = item;
                            let deviceTypeClassName;
                            switch (clientDeviceVersionInfo) {
                                case "WindowPC":
                                    deviceTypeClassName = "netWindowPc";
                                    break;
                                case "MacPC":
                                    deviceTypeClassName = "netMacPc";
                                    break;
                                case "AndroidPhone":
                                    deviceTypeClassName = "netAndroid";
                                    break;
                                case "AndroidPad":
                                    deviceTypeClassName = "netAndroidPad";
                                    break;
                                case "iPhone":
                                    deviceTypeClassName = "netIPhone";
                                    break;
                                case "iPad":
                                    deviceTypeClassName = "netIPad";
                                    break;
                                case "WindowClient":
                                    deviceTypeClassName = "netWindowClient";
                                    break;
                                case "MacClient":
                                    deviceTypeClassName = "netMacClient";
                                    break;
                                case "AndroidTV":
                                    deviceTypeClassName = "netAndroidTV";
                                    break;
                                default:
                                    deviceTypeClassName = 'unknownDevice';
                                    break;
                            }
                            tmpArr.push(
                                {
                                    attrJson:{
                                        className:(className || '')+' user-portrait add-fl add-block use-pic '+ deviceTypeClassName,
                                        title:title ,
                                        id:id,
                                    } ,
                                    iconChildren:iconChildren ,
                                    before:before,
                                    after: after!=undefined? after:false,
                                    disabled:disabled ,
                                    show:show!=undefined?show:true ,
                                    onClick:onClick?onClick:undefined ,
                                    onMouseLeave:onMouseLeave?onMouseLeave:undefined ,
                                    ...TkUtils.filterContainDataAttribute(other),
                                }
                            );
                        });
                        return tmpArr ;
                    })(afterIconArray , beforeIconArray) ,
                };

                let indexMark = undefined ;
                for(let i=0 ; i<listItemDataArray.length;i++){
                    if(order>listItemDataArray[i].order){
                        indexMark = i ;
                        break;
                    }
                }
                if(indexMark!=undefined){
                    listItemDataArray.splice(indexMark , 0 , tmpUserListItemJson ) ;
                }else{
                    listItemDataArray.push(tmpUserListItemJson);
                }
            });
            return listItemDataArray ;
        };

        const userListProps = {
            id:'tool_user_list_extend' ,
            className:'tool-user-list-extend'  ,
            listItemDataArray:_getListItemDataArray(userListItemJson) ,
        };
        return {userListProps:userListProps} ;
    };
    //处理搜索（子组件）的Change事件
    handleSearchInputChange(value){
        let text = value.replace(/&nbsp;/g , " ");
        this.userListSearch(text);
    }
    close(){
        eventObjectDefine.CoreController.dispatchEvent({type:"userListClose"})
        this.setState({
            isShow:false
        })
    }
    render(){
        const that = this ;
        let isLoadShow=this.state.isLoadShow;
        const {styleJson, id, userListSmartDrag, draggableData } = this.props ;
        const {userListProps} = that.loadUserListProps(this.state.userListItemData) ;
        let {listItemArray} = that.loadListItem(userListProps.listItemDataArray);
        const PageParam = {
            sum:this.state.pageSum ,
            isPageText:this.state.isPageText,
            searchNowPage:this.state.searchNowPage,
            isSearch:this.state.isSearch ,
            pagingInputFocus:this.pagingInputFocus.bind(this),
            pagingInputBlur:this.pagingInputBlur.bind(this),
            pagingInputChange:this.pagingInputChange.bind(this),  
            pagingClickPrev:this.pagingClickPrev.bind(this), 
            pagingClickNext:this.pagingClickNext.bind(this)
        }
        return (
            <div className={"mask"} onClick={this.close.bind(this)} style={{display:this.state.isShow?"block":"none"}}>
                <ToolExtendContainerDiv  onClick={(e)=>{e.stopPropagation()}} className="userlist-container" isShow={this.state.isShow}>
                    <div className="title-wrapper">
                        <UserListTitle  sum={this.state.userListSum} />
                        {!TkConstant.joinRoomInfo.issearchwrapper ? <UserListSearch inputChange={this.handleSearchInputChange.bind(this)} />:undefined}
                    </div>
                    <UserListContainer userListSearch={this.userListSearch.bind(this)} isLoadShow={isLoadShow} listItemArray={listItemArray} {...PageParam}/>
                    <Paging {...PageParam}/>
                </ToolExtendContainerDiv>
            </div>

        )
    };
};
export default  UserListSmart;

