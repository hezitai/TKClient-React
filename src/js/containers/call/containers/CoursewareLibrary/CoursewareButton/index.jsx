/**
 * @description     -------------11.20重构  该组件功能为设置课件库中切换媒体库的两个按钮
 * @author wanglimin
 * @date 2018/11/29
 */
'use strict';
import React, { PureComponent } from 'react';
import TkGlobal from 'TkGlobal';
import TkConstant from 'TkConstant';
import CoreController from 'CoreController';
import eventObjectDefine from 'eventObjectDefine';
import CoursewareButtonRender from './CoursewareButtonRender'

class CoursewareButton extends PureComponent{
    constructor(props){
        super(props);
        this.state = {
            toolButtonDescriptionArry:this.getToolButtonDescriptionArry(),

        };
        this.listernerBackupid = new Date().getTime()+'_'+Math.random();
        this.defaultIndex = 0;
        this.defaultId = 'tool_courseware_list';
    };
    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        const that = this ;
        
        //事件 initAppPermissions  ---11.20 重构 初始化权限
        eventObjectDefine.CoreController.addEventListener('initAppPermissions' , that.handlerInitAppPermissions.bind(that)  , that.listernerBackupid) ; 

        //Disconnected事件：参与者被踢事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomParticipantEvicted,that.handlerRoomLeaveroom.bind(that) , that.listernerBackupid);

        //Disconnected事件：参与者被踢事件   ---11.20 重构 sockit断开
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomLeaveroom,that.handlerRoomLeaveroom.bind(that) , that.listernerBackupid); 

        //roomDelmsg事件 下课事件 classBegin
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomDelmsg , that.handlerRoomDelmsg.bind(that), that.listernerBackupid); 

        //roomPubmsg 事件
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomPubmsg ,that.handlerRoomPubmsg.bind(that) , that.listernerBackupid );

        //点击课件库事件
        eventObjectDefine.CoreController.addEventListener("CoursewareClick",that.handlerCoursewareClick.bind(that),that.listernerBackupid);   
    };
    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        const that = this ;
        eventObjectDefine.CoreController.removeBackupListerner(that.listernerBackupid);
    };

    componentWillUpdate(){ //在组件接收到新的props或者state但还没有render时被调用。在初始化时不会被调用
    };

    // 初始化权限
    handlerInitAppPermissions(){
        const that = this ;
        for(let item of that.state.toolButtonDescriptionArry ){
            if(item.id === 'tool_courseware_list'){
                item.show = CoreController.handler.getAppPermissions('loadCoursewarelist') ;
                item.open = false;
            }else if(item.id === 'tool_media_courseware_list'){
                item.show =CoreController.handler.getAppPermissions('loadMedialist') ;
                item.open = false;
            }
        }
        that.setState({toolButtonDescriptionArry:that.state.toolButtonDescriptionArry}) ;
    };

    // 点击课件库显示弹框时  将按钮设置成默认按钮
    handlerCoursewareClick(){
        this.updateStateFromToolButtonDescriptionArry( this.defaultIndex , this.defaultId) ;
    }

    /*获取工具条按钮描述数组*/
    getToolButtonDescriptionArry(){
        return [
            {
                'className':'tl-left-document-list' ,
                'title':TkGlobal.language.languageData.toolContainer.toolIcon.documentList.title ,
                'id':'tool_courseware_list' ,
                'open':true,
                'show':true
            } , {
                'className':'tl-left-media-document-list' ,
                'title':TkGlobal.language.languageData.toolContainer.toolIcon.mediaDocumentList.title ,
                'id':'tool_media_courseware_list' ,
                'open':false ,
                'show': !!(TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant || TkConstant.hasRole.rolePatrol ) ,
            } 
        ] ;
    };

    /*更新按钮状态*/
    updateStateFromToolButtonDescriptionArry(index , id){
        const toolButtonDescriptionArry = this.getToolButtonDescriptionArry()
        toolButtonDescriptionArry.forEach(item => {
            item.open = false
        })
        toolButtonDescriptionArry[index].open = true
        this.setState({toolButtonDescriptionArry}) ;

        eventObjectDefine.CoreController.dispatchEvent({
            type:'updateToolButtonDescription' ,
            message:{
                index:index ,
                id:id ,
                open:toolButtonDescriptionArry[index]['open']
            }
        }) ;
    }

    // 点击 课件库 或者 点击媒体库  更新按钮状态
    handlerToolButtonClick(index , id){
        this.updateStateFromToolButtonDescriptionArry( index , id ) ;
    };
    // 隐藏所有按钮
    changeButtonDescriptionToHide(){
        let that = this;
        let toolButtonDescriptionArry = this.state.toolButtonDescriptionArry.map(item => {
            item.show = false
            return item
        })
        that.setState({toolButtonDescriptionArry}) ;
    }
    handlerRoomPubmsg(recvEventData){
        const that = this ;
        let pubmsgData = recvEventData.message ;
        switch(pubmsgData.name){
            case "OnlyAudioRoom":
                // 是否拥有电影共享否有权限 而且是主讲或者助教
                if(CoreController.handler.getAppPermissions('isMoviesShare') &&  (TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant) ){
                    let toolButtonDescriptionArry = that.state.toolButtonDescriptionArry;
                    that.setState({toolButtonDescriptionArry:toolButtonDescriptionArry}) ;
                }
                break;
            // 下课
            case "ClassBegin":
                // 下课时将按钮恢复成默认
                this.updateStateFromToolButtonDescriptionArry( this.defaultIndex , this.defaultId) ;
                break;
        }
    }

    // 被踢出事件  将按钮数组清零
    handlerRoomLeaveroom(event){
        this.setState({toolButtonDescriptionArry:[]}) ;
    }

    // ---11.20 重构   下课时关闭弹框
    handlerRoomDelmsg(recvEventData){
        const that = this ;
        let delmsgData = recvEventData.message ;
        switch(delmsgData.name)
        {
            case "ClassBegin":{
                 //是否拥有下课重置界面权限
                if(!CoreController.handler.getAppPermissions('endClassbeginRevertToStartupLayout')){
                    that.changeButtonDescriptionToHide();
                }
                break;
            }
            case "OnlyAudioRoom":
                if(CoreController.handler.getAppPermissions('isMoviesShare') &&  (TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant) ){
                    let toolButtonDescriptionArry = that.state.toolButtonDescriptionArry;
                    that.setState({toolButtonDescriptionArry:toolButtonDescriptionArry}) ;
                }
                break;
        }
    }

    render(){
        let that = this ;
        return (
                <CoursewareButtonRender toolButtonDescriptionArry={that.state.toolButtonDescriptionArry} handlerToolButtonClick={(index ,id) => that.handlerToolButtonClick(index ,id )}/>
        )
    };

};
export default  CoursewareButton;

