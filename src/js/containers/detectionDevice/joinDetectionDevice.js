/**
 * 登录页面模块-检测设备 总容器组件
 * @module JoinDetectionDeviceSmart
 * @description   提供设备的检测页面
 * @author QiuShao
 * @date 2017/7/21
 */

'use strict';
import React from 'react';
import TkGlobal from 'TkGlobal';
import TkConstant from 'TkConstant';
import eventObjectDefine from "eventObjectDefine" ;
import HandlerDetectionDevice from "./handler/handlerDetectionDevice" ;
import WelcomeDetectionDeviceSmart from "./welcomeDetectionDevice" ;
import MainDetectionDeviceSmart from "./mainDetectionDevice" ;

/*检测页面*/
class JoinDetectionDeviceSmart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show:false,
            hasBgImg:false,
            StateType:'',
        };
        this.listernerBackupid = new Date().getTime()+'_'+Math.random();
    };

    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        let that = this;
        // 加载了设备检测功能
        eventObjectDefine.CoreController.addEventListener( "loadDetectionDevice" , that.handlerLoadDeviceDetection.bind(that) , that.listernerBackupid ); 

        // 设备检测完成
        eventObjectDefine.CoreController.addEventListener( "detectionDeviceFinsh" , that.handlerDetectionDeviceFinsh.bind(that) , that.listernerBackupid ); 
    };

    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        let that = this;
        eventObjectDefine.CoreController.removeBackupListerner(that.listernerBackupid);
    };

    /**
     * 加载设备检测时触发 判断当前是进入那个页面
     * @param {Object} recvEventData 包含属性： 
     *      start 是否显示welcomeDetectionDevice组件  
     *      main是否显示mainDetectionDevice组件 
     *      check 是否需要做校验 
     *      bgImg是否加载背景图（在教室中没有，显示为弹框）
     */
    handlerLoadDeviceDetection(recvEventData){
        const that = this ;
        let { start , main  , check , bgImg} = recvEventData.message || {} ; 
        if(check) {
            HandlerDetectionDevice.checkNeedDetectionDevice((needDetection) => {
                
                
                // 检测巡课不用检测设备--ByTyr
                if(window.GLOBAL.isTour == true){
                    if(needDetection){
                        that.setState({show:true});
                        if(start){
                            eventObjectDefine.CoreController.dispatchEvent({type:'welcomeDetectionDevice'});
                        }else if(main){
                            eventObjectDefine.CoreController.dispatchEvent({type:'mainDetectionDevice'});
                        }
                    }else{
                        let {handlerOkCallback} = that.props ;
                        if(handlerOkCallback && typeof handlerOkCallback === 'function'){
                            handlerOkCallback({needDetection:needDetection});
                        }
                    }
                } else {
                    needDetection = true;// 测试数据====================
                    // 是否需要检测
                    if(needDetection){
                        that.setState({show:true});
                        if(start){
                            eventObjectDefine.CoreController.dispatchEvent({type:'welcomeDetectionDevice'});
                        }else if(main){
                            eventObjectDefine.CoreController.dispatchEvent({type:'mainDetectionDevice'});
                        }
                    }else{
                        let {handlerOkCallback} = that.props ;
                        if(handlerOkCallback && typeof handlerOkCallback === 'function'){
                            handlerOkCallback({needDetection:needDetection});
                        }
                    }
                }


                // needDetection = true;// 测试数据====================
                // // 是否需要检测
                // if(needDetection){
                //     that.setState({show:true});
                //     if(start){
                //         eventObjectDefine.CoreController.dispatchEvent({type:'welcomeDetectionDevice'});
                //     }else if(main){
                //         eventObjectDefine.CoreController.dispatchEvent({type:'mainDetectionDevice'});
                //     }
                // }else{
                //     let {handlerOkCallback} = that.props ;
                //     if(handlerOkCallback && typeof handlerOkCallback === 'function'){
                //         handlerOkCallback({needDetection:needDetection});
                //     }
                // }

               
            });
        } else {
            if(bgImg){
                that.setState({hasBgImg:true});
            }
            if(start){
                that.setState({show:true});
                eventObjectDefine.CoreController.dispatchEvent({type:'welcomeDetectionDevice'});
            }else if(main){
                that.setState({show:true});
                eventObjectDefine.CoreController.dispatchEvent({type:'mainDetectionDevice'});
            }
        }
    };

    /**
     * 设备检测完成时触发 检测完成时隐藏设备页面显示
     * @param {Object} recvEventData 包含属性 clearFinsh： 是否检测完成 true为完成
     */
    handlerDetectionDeviceFinsh(recvEventData){
		let {clearFinsh} = recvEventData.message || {};
		if(clearFinsh){
            this.setState({show:false});
		}
  };
    render() {
        let that = this;
        let {show , hasBgImg} = that.state ;
        let {isEnter, handlerOkCallback , clearFinsh , backgroundColor , okText , titleText , saveLocalStorage} = that.props ;
        return (
            <section id="all_start" className={"startdetection start-backgroundImg add-position-absolute-top0-left0"+ (hasBgImg?" opcityBg":"")} style={{display: !show ? 'none' : 'block'  , backgroundColor:backgroundColor }}>
                {/* WelcomeDetectionDeviceSmart组件和 MainDetectionDeviceSmart 通过事件分发控制切换显示(display控制)*/}
                {/*开始检测界面开始 */}
                <WelcomeDetectionDeviceSmart /> 

                {/*设备检测的主要页面*/}
                <MainDetectionDeviceSmart hasBgImg={hasBgImg} isEnter={isEnter} clearFinsh={clearFinsh} closeDetectionCallback={(isShow)=>{that.setState({show:isShow})}} handlerOkCallback={handlerOkCallback} okText={okText} titleText={titleText} saveLocalStorage={saveLocalStorage}  /> 
            </section>
        )
    };
}
;
export default JoinDetectionDeviceSmart;


/**
 * props
 * isEnter 判断来自哪里 来自tk-call为false   tk-login 为true
 * handlerOkCallback 点击确定或者不需要检测时执行的函数  
 * clearFinsh    所有调用都传的true
 * saveLocalStorage 是否写入localStorage  目前穿值方式是个谜
 */

