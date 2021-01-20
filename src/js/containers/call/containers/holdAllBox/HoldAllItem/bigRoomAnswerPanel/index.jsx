/* 教学工具箱 教师端 答题器组件 */
'use strict';
import "./static/css/index.css";
import "./static/css/index_black.css";
import React from 'react';
import ReactDrag from 'reactDrag';
import ServiceRoom from 'ServiceRoom';
import eventObjectDefine from 'eventObjectDefine';
import ss from 'ServiceSignalling';
import WebAjaxInterface from 'WebAjaxInterface';
import TkConstant from 'TkConstant';
import TkGlobal from 'TkGlobal';
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

const questionStateList = ['UNSTART', 'RUNNING','FINISHED'];
const questionStateAndPageMap = new Map([
    [questionStateList[0], pageDict.option],
    [questionStateList[1], pageDict.statistics],
    [questionStateList[2], pageDict.current],
]);


const defaultOption = {hasChose: false};
const options = new Array(4).fill(undefined).map(item => Object.assign({}, defaultOption))


export default class BigRoomAnswerPanel extends React.Component {
    constructor(){
        super();
        this.owner        = ServiceRoom.getTkRoom().getMySelf();
        this.role         = this.owner.role;
        this.pollTimerID  = undefined;
        this.ansTimerID   = undefined;
        this.statisticsTimerID = undefined;
        this.quesID       = undefined;
        this.pollInterval = 3000;
        this.markID       = new Date().getTime()+'_'+Math.random();

        this.state = {
            show: false,
            questionState: questionStateList[0],   // UNSTART--(start)-->RUNNING--(end)-->FINISHED--(reset)-->UNSTART
            page: {
                index: pageDict.option,
                data : null
            },
            options,
            result: new Array(options.length).fill(0),
            hasPub: false,
            ansTime: 0,
            resultNum: 0,
            rightOptions: [],
            detailData: [],
            resizeInfo:{
                width:0,
                height:0,
            },
            detailPageInfo:{
                current: 1,
                total:1
            },
            hintShow: false
        }
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
        if (prevState.show !== this.state.show && this.state.show) {
                this.isSetDefaultPosition = false;
                this.setDefaultPosition();
        }
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
     * 统一处理子组件事件
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
        
        this.setState({event: {type, message}} ,()=>this.dispose({action: type, data: message}))
    }

    /**
     * 改变答题器状态
     */
    changeQuestionState({data}){
        const {questionState,options} = this.state,
              index           = questionStateList.indexOf(questionState),
              nextPageIndex   = questionStateAndPageMap.get(questionStateList.length-1===index ? questionStateList[0]:questionStateList[index+1]),
              page            = nextPageIndex === pageDict.current ? this.state.page : {
                                    index: nextPageIndex,
                                    data,
                                }
        
        if(questionState === 'UNSTART' && !options.some(o=>o.hasChose===true)){
            this.setState({
                hintShow: true,
            })
            return;
        }

        const nextQuestionState = questionState === 'UNSTART' 
                                  ? 'Start'
                                  : questionState === 'RUNNING'
                                  ? 'End' : 'Reset';
        
        const rightOptions = options.map((o,i)=>{if(o.hasChose===true){return i}}).filter(i=>i!==undefined)

        this.setState({
            questionState: questionStateList[questionStateList.length-1===index ? 0 : index+1],
            page,
            rightOptions,
        },()=>{
            this[`questionWill${nextQuestionState}`]();
        })

    }


/********************************************** 高并发答题器核心函数 end ***********************************************/
/********************************************** 组件生命周期函数 start ***********************************************/

    questionWillStart(){
        const {options,rightOptions} = this.state
        ss.sendQuestion(false, {options, action:'start',rightOptions,state:this.state});
        this.startAnsTimer();
        this.startGetAnswerData();
    }

    questionWillEnd(){
        this.stopGetAnswerData();
        this.stopAnsTimer();
        ss.sendQuestion(false, {action:'end',state:this.state, quesID:this.quesID||undefined});
        const {result, resultNum, ansTime, rightOptions} = this.state;
        ss.publishResult({result, resultNum, ansTime, rightOptions});
    }

    questionWillReset(){
        ss.sendQuestion(true, {});
        ss.publishResult({},true);
        ss.sendQuestion(false, {action: 'open'});
        this.statisticsTimerID&&clearInterval(this.statisticsTimerID);
        this.setState({
            resultNum: 0,
            ansTime  : 0,
            hasPub   : false,
            options: new Array(4).fill(undefined).map(item => Object.assign({}, defaultOption)),
            detailData: [],
            detailPageInfo:{
                current: 1,
                total:1
            },
            hintShow: false
        })
    }

/********************************************** 组件生命周期函数 end   ***********************************************/
/********************************************** 子组件事件 start ***********************************************/

    roompubmsg({data: netEvent}){
        if(!netEvent.data)return;
        const {name, values, answerCount, data: {options, action, rightOptions,state , quesID}} = netEvent;

        switch (name) {
            case 'Question':
                if(!TkConstant.hasRole.roleStudent){
                    switch (action) {
                        case 'open':
                            this.setState({
                                show:true,
                                questionState: questionStateList[0],
                                page: {
                                    index: pageDict.option
                                },
                                options :new Array(4).fill(undefined).map(item => Object.assign({}, defaultOption)),
                            })
                            break;
                        
                        case 'start':
                        // if(TkConstant.hasRole.rolePatrol || TkConstant.hasRole.roleTeachingAssistant){
                            this.quesID = netEvent.data.quesID;
                            this.setState(state,()=>{
                                this.startAnsTimer();
                                this.startGetAnswerData();
                            })
                            // }else {
                                // }
                            break;
                        case 'end':
                            // if(TkConstant.hasRole.rolePatrol || TkConstant.hasRole.roleTeachingAssistant){
                                this.quesID = quesID;
                                this.stopAnsTimer();
                                this.stopGetAnswerData();
                                this.setState({
                                    questionState: questionStateList[2],
                                })
                            // }
                            break;
                        default:
                            break;
                    }
                }
                break;

            case 'GetQuestionCount':
                const result = values !== null && values !== undefined ? new Array(this.state.options.length).fill(0).map(
                    (option, index)=>{
                        option = (values && Number(values[`${index}`])) || 0;
                        return option;
                    }
                ) : new Array(this.state.options.length).fill(0);
                const resultNum = answerCount;
                
                this.setState({result,resultNum})
                break;

            case 'PublishResult':
                const {hasPub} = netEvent.data;
                hasPub && this.setState({hasPub});

                break;
        
            default:
                break;
        }
    }

    roomdelmsg({data: netEvent}){
        const {name} = netEvent;

        switch (name) {
            case 'Question':
                this.setState({
                    show:false,
                    questionState: questionStateList[0],
                    options :new Array(4).fill(undefined).map(item => Object.assign({}, defaultOption)),
                    resultNum: 0,
                    ansTime  : 0,
                    hasPub   : false,
                    detailData: [],
                },()=>{
                    emitter.emit({
                        type:'colse-holdAll-item' ,
                        message: {
                            type: 'answer'
                        }
                    });
                })
                break;
            case 'ClassBegin':
                this.setState({
                    show:false,
                    questionState: questionStateList[0],
                    options :new Array(4).fill(undefined).map(item => Object.assign({}, defaultOption)),
                    resultNum: 0,
                    ansTime  : 0,
                    hasPub   : false,
                    detailData: [],
                },()=>{
                    emitter.emit({
                        type:'colse-holdAll-item' ,
                        message: {
                            type: 'answer'
                        }
                    });
                })
                break;
        
            default:
                break;
        }
    }
    receivemsglistpublishResult(){
        this.setState({hasPub:true});
    }
    receivemsglistquestion(data){
        if(!data.data.data.data)return;
        const {questionState} = this.state,
              ansTime = TkGlobal.serviceTime/1e3-data.data.data.ts,
              {action, options, rightOptions,quesID, state} = data.data.data.data;
        
        if(action === 'open' && !TkConstant.hasRole.roleStudent){
        // if(action === 'open' && TkConstant.hasRole.roleChairman){
            this.setState({
                show:true,
                options: new Array(4).fill(undefined).map(item => Object.assign({}, defaultOption)),
            })
        }

        if(action === 'start' && !TkConstant.hasRole.roleStudent){
            this.quesID = quesID;
            ss.getQuestionCount({})
            this.setState({
                show: true,
                questionState: 'RUNNING',
                page: {
                    index: pageDict.statistics
                },
                ansTime,
                rightOptions,
                options
            },()=>{
                this.startAnsTimer();
                this.startGetAnswerData();
            })
        }

        if(action === 'end' && !TkConstant.hasRole.roleStudent){
            this.quesID = quesID;
            this.stopAnsTimer();
            this.stopGetAnswerData();
            this.setState(state)
        }
    }

    startGetAnswerData(){
        this.pollTimerID && clearInterval(this.pollTimerID);
        
        this.pollTimerID = setInterval(()=>{
            ss.getQuestionCount({})
        }, this.pollInterval);

        this.setState({
            result: new Array(this.state.options.length).fill(0)
        })
    }

    startAnsTimer(){
        this.ansTimerID && clearInterval(this.ansTimerID);
        
        this.ansTimerID = setInterval(()=>{
            const ansTime = this.state.ansTime+1;
            this.setState({ansTime});
        }, 1000);

    }

    stopGetAnswerData(){
        this.pollTimerID && clearInterval(this.pollTimerID);
        this.pollTimerID = undefined;

        ss.getQuestionCount({})
    }

    stopAnsTimer(){
        this.ansTimerID && clearInterval(this.ansTimerID);
    }

    publishResult(){
        const {result, resultNum, ansTime, rightOptions} = this.state;
        ss.publishResult({result, resultNum, ansTime, rightOptions, hasPub: true});
        
        this.setState({hasPub: true});
    }
    /*=============== option function ===================*/

    changeOptionLength({data:{num}}){
        const {options} = this.state;
        if(options.length >=8 && num > 0 || options.length <=2 && num < 0)return;

        num > 0 && options.push(Object.assign({}, defaultOption)) || options.pop();

        this.setState({options})
    }

    optionClick({data: {index:i}}){
        const {options} = this.state;
        options[i].hasChose = !options[i].hasChose;
        
        this.setState({options})
    }

    /*=============== option function ===================*/

    changeDetail({action, data}){
        if(this.state.detailPageInfo.current===1 && data.action === -1 || this.state.detailPageInfo.current===this.state.detailPageInfo.total && data.action === 1)return;
        if(data.action === -1){
            const pageNum = this.state.detailPageInfo.current-1;
            this.getDetailData(pageNum);
            if(!!this.statisticsTimerID){
                clearInterval(this.statisticsTimerID);
                this.getDetailData(pageNum);
                this.statisticsTimerID = setInterval(()=>{
                    this.getDetailData(pageNum);
                }, 500)
            }
        }else if(data.action === 1){
            const pageNum = this.state.detailPageInfo.current+1;
            this.getDetailData(pageNum);
            if(!!this.statisticsTimerID){
                clearInterval(this.statisticsTimerID);
                this.getDetailData(pageNum);
                this.statisticsTimerID = setInterval(()=>{
                    this.getDetailData(pageNum);
                }, 500)
            }
        }else if(data.action === 2){
            let pageNum = data.text;
            if(pageNum===''){
                pageNum = this.state.detailPageInfo.current
            }
            this.getDetailData(pageNum);
            if(!!this.statisticsTimerID){
                clearInterval(this.statisticsTimerID);
                this.getDetailData(pageNum);
                this.statisticsTimerID = setInterval(()=>{
                    this.getDetailData(pageNum);
                }, 500)
            }
        }else if(data.action === 3){
            let pageNum = undefined;
            if(!isNaN(parseInt(data.text))){
                pageNum = data.text;
            }else{
                pageNum = this.state.detailPageInfo.current;
            }
            this.getDetailData(pageNum);
            if(!!this.statisticsTimerID){
                clearInterval(this.statisticsTimerID);
                this.getDetailData(pageNum);
                this.statisticsTimerID = setInterval(()=>{
                    this.getDetailData(pageNum);
                }, 500)
            }
        }
    }

    changeDetailOrStatistics(){
        const {page} = this.state;

        if(this.state.page.index === pageDict.statistics){
            this.getDetailData(1);
            this.statisticsTimerID = setInterval(()=>{
                this.getDetailData(1);
            }, 500)
        }else if(!!this.statisticsTimerID){
            clearInterval(this.statisticsTimerID);
            this.statisticsTimerID = undefined;
        }
        
        
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
        let {id} = this.props;
        this.statisticsTimerID&&clearInterval(this.statisticsTimerID);
        this.setState({
            show:false,
            questionState: questionStateList[0],
            options :new Array(4).fill(undefined).map(item => Object.assign({}, defaultOption)),
            resultNum: 0,
            ansTime  : 0,
            hasPub   : false,
            hintShow : false,
            detailData: [],
            detailPageInfo:{
                current: 1,
                total:1
            },
        },()=>{
            ss.sendQuestion(true, {});
            ss.publishResult({},true);
            emitter.emit({
                type:'colse-holdAll-item' ,
                message: {
                    type: 'answer'
                }
            });
        })
    }



   

/********************************************** 子组件事件 end ***********************************************/

    render(){
        const {show, questionState, resizeInfo} = this.state,
            //   studentNum                       = Object.values(ServiceRoom.getTkRoom().getUsers()).filter(user => user.role === TkConstant.role.roleStudent).length,
              currentState                     = Object.assign(this.state, {role: this.role, owner: this.owner});
        
        const {id, answerDrag, draggableData} = this.props;
        let percentLeft = answerDrag.percentLeft;
        let percentTop = answerDrag.percentTop;
        if (percentLeft != 0 && !percentLeft) {
            percentLeft = 0.5;
        }
        if (percentTop != 0 && !percentTop) {
            percentTop = 0.5;
        }
        let answerDragStyle = {
            position:'absolute',
            zIndex:130,
            display:  show ? '':'none',
            left:0,
            top:0,
        };
        let DraggableData = Object.customAssign({
            id:id,
            size:resizeInfo,
            percentPosition:{
                percentLeft, 
                percentTop
            },
        },draggableData);
        return (
            TkGlobal.playback  ? undefined:
            <ReactDrag  {...DraggableData}>
                <div id={id} className={`question-panel teacher ${questionState.toLowerCase()}  ${'beyondDaTiQi'}`} 
                    style={answerDragStyle}>
                    <BigRoomHeader parentState = {currentState} 
                                dispose={this.dispose.bind(this)}
                                pageDict={pageDict}/>
                    <div className="body">
                        {this.state.page.index === pageDict.option ? 
                            <BigRoomOption parentState = {currentState} 
                                        dispose={this.dispose.bind(this)}
                                        pageDict={pageDict}/>
                            :undefined}
                        {this.state.page.index === pageDict.detail || this.state.page.index === pageDict.statistics ? 
                            <BigRoomDetail parentState = {currentState} 
                                        dispose={this.dispose.bind(this)}
                                        pageDict={pageDict}/> 
                            :undefined}
                        {this.state.page.index === pageDict.detail || this.state.page.index === pageDict.statistics ? 
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