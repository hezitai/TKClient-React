/* 教学工具箱 学生端 答题器组件 */
'use strict';
import "./static/css/index.css";
import "./static/css/index_black.css";
import React from 'react';
import ReactDrag from 'reactDrag';
import ServiceRoom from 'ServiceRoom';
import eventObjectDefine from 'eventObjectDefine';
import ss from 'ServiceSignalling';
import TkGlobal from 'TkGlobal';
import WebAjaxInterface from 'WebAjaxInterface';
import BigRoomOption from './option';
import BigRoomDetail from './detail';
import BigRoomFooter from './footer';
import BigRoomHeader from './header';
import BigRoomStatistics from './statistics';

const emitter = {
    on  : eventObjectDefine.CoreController.addEventListener,
    off : eventObjectDefine.CoreController.removeBackupListerner,
    emit: eventObjectDefine.CoreController.dispatchEvent,
}

/**
 * 页面索引，会分发给每一个子组件
 */
const pageDict = {
    detail    : 'DETAIL',       // 统计详情
    option    : 'OPTION',       // 选项界面
    statistics: 'STATISTICS',   // 统计界面
    current   : 'CURRENT',      // 维持当前页面不变
}

/**
 * 需要监听的事件列表
 */
const eventList = [
    TkConstant.EVENTTYPE.RoomEvent.roomPubmsg,
    TkConstant.EVENTTYPE.RoomEvent.roomDelmsg,
    'receive-msglist-question',
    'receive-msglist-publishResult',
]

const commitStateList = ['UNCOMMIT','COMMITTED'];
const commitStateAndPageMap = new Map([
    [commitStateList[0], pageDict.option],
    [commitStateList[1], pageDict.current],
]);

const questionStateList = ['RUNNING','FINISHED'];
const questionStateAndPageMap = new Map([
    [questionStateList[0], pageDict.option],
    [questionStateList[1], pageDict.statistics],
]);


const defaultOption = {hasChose: false};
const options = new Array(4).fill(undefined).map(item => Object.assign({}, defaultOption))

export default class BigRoomStudentAnswerPanel extends React.Component {

    constructor(){
        super();
        
        this.owner = ServiceRoom.getTkRoom().getMySelf();
        this.role = this.owner.role;
        this.markID = new Date().getTime()+'_'+Math.random();
        this.historyOptions = [];
        this.quesID = undefined;
        this.rightOptions = [];

        this.state = {
            show: false,
            commitState: commitStateList[0],   // UNSTART--(start)-->RUNNING--(end)-->FINISHED--(reset)-->UNSTART
            questionState: questionStateList[0],
            page: {
                index: pageDict.option,
                data : null
            },
            options,
            resizeInfo:{
                width:0,
                height:0,
            },
            rightOptions: [],
            detailPageInfo:{
                current: 1,
                total:1
            },
            detailData: [],
            pubRight: false
        }
    }

    reset(){
        this.historyOptions = [];
        this.setState({rightOptions:[], commitState: 'UNCOMMIT',detailData: [],detailPageInfo:{
            current: 1,
            total:1
        }})
    }
    componentDidMount(){

        eventList.forEach(
            (event, index) => emitter.on(
                event, 
                this.handleEvent.bind(this),
                this.markID
            )
        )
    }

    componentWillUnmount() {
        emitter.off(this.markID);
    };

    //在组件完成更新后立即调用,在初始化时不会被调用
    componentDidUpdate(prevProps , prevState){
        this.updateResize();
    };

    /*更新大小*/
    updateResize () {
        let {id} = this.props;
        let dragNode = document.getElementById(id);
        if (dragNode) {
            const defalutFontSize = TkGlobal.windowInnerWidth / TkConstant.STANDARDSIZE;
            let width = dragNode.offsetWidth/defalutFontSize;
            let height = dragNode.offsetHeight/defalutFontSize;
            if (this.state.resizeInfo && (!Object.is(this.state.resizeInfo.width, width ) || !Object.is(this.state.resizeInfo.height, height))) {
                this.state.resizeInfo={
                    width,
                    height,
                };
                this.setState({resizeInfo:this.state.resizeInfo});
            }
        }
    }
    /*设置初始位置*/
    setDefaultPosition() {
        let {id,draggableData} = this.props;
        let dragNode = document.getElementById(id);
        let boundNode = document.querySelector(draggableData.bounds);
        if (dragNode && boundNode) {
            if (draggableData.changePosition && typeof draggableData.changePosition === "function") {
                let isSendSignalling = true;
                draggableData.changePosition(id, {percentLeft:0.5,percentTop:0.5,isDrag:false}, isSendSignalling);
            }
        }
    };

/********************************************** 高并发答题器核心函数 start ***********************************************/
    /**
     * 统一处理子组件的事件
     */
    dispose({action, data, extra}){
        // 参数校验
        if(action === null || data === null){
            return L.Logger.error('Incomplete parameter');
        }

        this[action] && typeof this[action] === 'function' && this[action]({action, data, extra});
    }

    /**
     * 页面跳转
     */
    turn({data, extra ,extra: {page}}){
        // 参数校验
        if(data === null || extra === null || page === undefined){
            return L.Logger.error('Error parameter');
        }

        if(page.index !== pageDict.current){
            this.setState({page});
        }
    }

    /**
     * 事件统一处理
     */
    handleEvent({type, message}){
        type = /-/.test(type) && type.replace(/\-/g, '') || type;
        
        this.dispose({action: type, data: message});
    }

    /**
     * 改变答题器状态
     */
    changeQuestionState({data}){
        const {questionState} = this.state,
              index           = questionStateList.indexOf(questionState),
              nextPageIndex   = questionStateAndPageMap.get(questionStateList.length-1===index ? questionStateList[0]:questionStateList[index+1]),
              page            = nextPageIndex === pageDict.current ? this.state.page : {
                                    index: nextPageIndex,
                                    data,
                                }

        this.setState({
            questionState: questionStateList[questionStateList.length-1===index ? 0 : index+1],
            page,
        })

    }

    /**
     * 改变提交状态
     */
    changeCommitState({data}){
        const {commitState} = this.state,
              index           = commitStateList.indexOf(commitState),
              nextPageIndex   = commitStateAndPageMap.get(commitStateList.length-1===index ? commitStateList[0]:commitStateList[index+1]),
              page            = nextPageIndex === pageDict.current ? this.state.page : {
                                    index: nextPageIndex,
                                    data,
                                }
        
        if(commitState === 'UNCOMMIT' && !this.state.options.some(o=>o.hasChose===true))return

        const nextCommitState = commitState === 'UNCOMMIT' 
                                ? 'Commit' : 'Modify';
      
        this[`answerWill${nextCommitState}`]();

        this.setState({
            commitState: commitStateList[commitStateList.length-1===index ? 0 : index+1],
            page,
        })

    }

/********************************************** 高并发答题器核心函数 end ***********************************************/
/********************************************** 组件生命周期函数 start ***********************************************/

    answerWillCommit(){
        const {options} = this.state,
              actions = {};

        this.historyOptions.length > 0 && this.historyOptions.forEach((option, index) => {
            if(option.hasChose){
                actions[`${index}`] = -1
            }
        })
       
        options.forEach((option, index) => {
            if(option.hasChose && !actions[`${index}`]){
                actions[`${index}`] = 1
            }else if(option.hasChose&&actions[`${index}`]===-1){
                delete actions[`${index}`]
            }
        });
        
        ss.answerCommit({options, actions, modify: this.historyOptions.length>0&&1||0, stuName:ServiceRoom.getTkRoom().getMySelf().nickname, quesID: this.quesID, isRight: this.equals(options, this.rightOptions)});

        this.historyOptions = JSON.parse(JSON.stringify(options))
    }

    answerWillModify(){

    }

/********************************************** 组件生命周期函数 end   ***********************************************/
/********************************************** 子组件事件 start ***********************************************/
    roompubmsg({data: netEvent}){
        if(!netEvent.data)return;
        const {data:{action, state, quesID}} = netEvent;
        switch (netEvent.name) {
            case 'Question':
                    switch (action) {
                        case 'start':
                            const options = state.options
                            this.reset();
                            this.quesID = quesID;
                            this.rightOptions = options;
                            TkConstant.hasRole.roleStudent
                            && this.setState({
                                show: true,
                                questionState: 'RUNNING',
                                page: {
                                    index: pageDict.option,
                                    data: {}
                                },
                                options: new Array(options.length).fill(undefined).map(item => Object.assign({}, defaultOption)),
                                pubRight: false,
                            });
                        break;

                        case 'end':
                            this.quesID = quesID;
                            TkConstant.hasRole.roleStudent 
                            && this.setState({
                                show: true,
                                // options: new Array(optionsss.length).fill(undefined).map(item => Object.assign({}, defaultOption)),
                            });
                            break;
                    
                        default:
                            break;
                    }
                break;

            case 'PublishResult':
                const {result, resultNum, ansTime, rightOptions,hasPub} = netEvent.data;
                
                TkConstant.hasRole.roleStudent 
                && this.setState({
                    questionState: 'FINISHED',
                    page: {
                        index: pageDict.statistics,
                        data: {}
                    },
                    show: true,
                    result, resultNum, ansTime, rightOptions,
                    pubRight: hasPub
                });
            break;
        
            default:
                break;
        }
    }

    roomdelmsg({data: netEvent}){
        switch (netEvent.name) {
            case 'Question':
                    TkConstant.hasRole.roleStudent 
                    && this.setState({
                        show: false,
                    });
                break;
            case 'ClassBegin':
                    TkConstant.hasRole.roleStudent 
                    && this.setState({
                        show: false,
                    });
                break;
        
            default:
                break;
        }
    }

    receivemsglistpublishResult({data:{data}}){
        this.state.show && this.roompubmsg({data})
    }

    receivemsglistquestion({data:{data}}){
        this.roompubmsg({data})
    }

    equals(a1, a2) {
        if (!a1 || !a2)
            return 0;
        if (a1.length != a2.length)
            return 0;
        for (var i = 0, l = a1.length; i < l; i++) {
            if (a1[i] instanceof Array && a2[i] instanceof Array) {
                if (!this.equals(a1[i], a2[i]))return 0;    
            }else if(typeof a1[i] === 'object' && typeof a2[i] === 'object'){
                if(JSON.stringify(a1[i])!==JSON.stringify(a2[i]))return 0
            }else if (a1[i] != a2[i]) { 
                return 0;  
            }      
        }    
        return 1;
    }

    /*=============== option function ===================*/

    changeOptionLength({data:{num}}){
        const {options} = this.state;
        num > 0 && options.push(Object.assign({}, defaultOption)) || options.pop();

        this.setState({options})
    }

    optionClick({data: {index:i}}){
        if(this.state.commitState === 'UNCOMMIT'){
            const {options} = this.state;
            options[i].hasChose = !options[i].hasChose;
            
            this.setState({options})
        }
    }

    /*=============== option function ===================*/

    changeDetail({action, data}){
        if(this.state.detailPageInfo.current===1 && data.action === -1 || this.state.detailPageInfo.current===this.state.detailPageInfo.total && data.action === 1)return;
        if(data.action === -1){
            this.getDetailData(this.state.detailPageInfo.current-1);
        }else if(data.action === 1){
            this.getDetailData(this.state.detailPageInfo.current+1)
        }
    }

    changeDetailOrStatistics(){
        const {page} = this.state;
        
        this.getDetailData(1);
        
        this.setState({
            page:{index: page.index === pageDict.statistics ? pageDict.detail : pageDict.statistics}
        })
    }

    getDetailData(page){
        WebAjaxInterface.getSimplifyAnswer({id:this.quesID, page},{
            doneCallback: (res)=>{
                if(res.result === 0){
                    this.setState({
                        detailData: res.data,
                        detailPageInfo:{
                            total: res.pageinfo && (Math.ceil(res.pageinfo.count/20)) || 1,
                            current: page,
                        }
                    })
                }
            }
        });
    }

    close(){
        this.setState({show:false});
    }


/********************************************** 子组件事件 end ***********************************************/

    render(){
        const {show, questionState, commitState, resizeInfo} = this.state,
            //   studentNum                       = Object.values(ServiceRoom.getTkRoom().getUsers()).filter(user => user.role === TkConstant.role.roleStudent).length,
              currentState                     = Object.assign(this.state, {role: this.role, owner: this.owner});
        
        const {id, answerDragS, draggableData} = this.props;
        let percentLeft = answerDragS.percentLeft;
        let percentTop = answerDragS.percentTop;
        if (percentLeft != 0 && !percentLeft) {
            percentLeft = 0.5;
        }
        if (percentTop != 0 && !percentTop) {
            percentTop = 0.5;
        }
        let answerDragSStyle = {
            position:'absolute',
            zIndex:130,
            display:  show ? '':'none',
            left:0,
            top:0,
        };
        let DraggableData = Object.customAssign({
            id:id,
            size:resizeInfo,
            percentPosition:{percentLeft, percentTop},
        },draggableData);
        return (
            <ReactDrag  {...DraggableData}>
                <div id={id} className={`question-panel student ${questionState.toLowerCase()} ${commitState.toLowerCase()} ${'beyondDaTiQi'}`}
                    style={answerDragSStyle}>
                    <BigRoomHeader parentState = {currentState} 
                                dispose={this.dispose.bind(this)}
                                pageDict={pageDict}/>
                    <div className="body">
                        {this.state.page.index === pageDict.option ? 
                            <BigRoomOption parentState = {currentState} 
                                        dispose={this.dispose.bind(this)}
                                        pageDict={pageDict}/>
                            :undefined}
                        {this.state.page.index === pageDict.detail ? 
                            <BigRoomDetail parentState = {currentState} 
                                        dispose={this.dispose.bind(this)}
                                        pageDict={pageDict}/> 
                            :undefined}
                        {this.state.page.index === pageDict.statistics ? 
                            <BigRoomStatistics parentState = {currentState} 
                                        dispose={this.dispose.bind(this)}
                                        pageDict={pageDict}/> 
                            :undefined}
                    </div>
                    <BigRoomFooter parentState = {currentState} 
                                dispose={this.dispose.bind(this)}
                                pageDict={pageDict}/> 
                </div>
            </ReactDrag>
        )
    }
}