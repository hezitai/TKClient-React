/**
 * 礼物动画smart组件
 * @module GiftAnimationSmart
 * @description   提供发送礼物时显示的动画
 * @author QiuShao
 * @date 2017/08/25
 */

'use strict';
import React from 'react';
import eventObjectDefine from 'eventObjectDefine' ;
import TkConstant from 'TkConstant' ;
import TkGlobal from 'TkGlobal' ;
import ServiceRoom from "ServiceRoom";

class GiftAnimationSmart extends React.Component{
    constructor(props){
        super(props);
        this.listernerBackupid = new Date().getTime()+'_'+Math.random();
        this.giftAnimationElement = undefined ;
        this.giftAnimationJson = {} ;
        this.giftAnimationJsonIndex = 0 ;
        this.state={
            voicefileUrl:''
        };
    };
    componentDidMount() { //在完成首次渲染之前调用，此时仍可以修改组件的state
        let that = this ;
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomConnected , that.handlerRoomConnected.bind(that)  , that.listernerBackupid );
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomUserpropertyChanged , that.handlerRoomUserpropertyChanged.bind(that)  , that.listernerBackupid );
        eventObjectDefine.CoreController.addEventListener( 'playbackControl_seek_position' , that.handlerPlaybackControl_seek_position.bind(that)  , that.listernerBackupid );
    };
    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        let that = this ;
        eventObjectDefine.CoreController.removeBackupListerner(that.listernerBackupid );
    };

    handlerRoomConnected(){
        if(TK.isTkNative && TK.subscribe_from_native){
            let nowUseDocAddress = window.WBGlobal.nowUseDocAddress
            nowUseDocAddress = nowUseDocAddress.replace(/https/g, "http");
            nowUseDocAddress = nowUseDocAddress.replace(/443/g, "80");
            if (TkConstant.joinRoomInfo.customTrophys && TkConstant.joinRoomInfo.customTrophysVoice && ServiceRoom.getNativeInterface().clientPreloadMediaFile){
                let loadFileUrlArray = [] ;
                for(var trophy of TkConstant.joinRoomInfo.customTrophys){
                    loadFileUrlArray.push( nowUseDocAddress + trophy.trophyvoice);
                }
                this.setState({voicefileUrl:''})
                ServiceRoom.getNativeInterface().clientPreloadMediaFile(loadFileUrlArray) ;
            }
            else if(TkConstant.joinRoomInfo.voicefileUrl && TkConstant.joinRoomInfo.customTrophysVoice && ServiceRoom.getNativeInterface().clientPreloadMediaFile){
                let loadFileUrlArray = [] ;
                loadFileUrlArray.push( nowUseDocAddress + TkConstant.joinRoomInfo.voicefileUrl );
                this.setState({voicefileUrl: nowUseDocAddress + TkConstant.joinRoomInfo.voicefileUrl})
                ServiceRoom.getNativeInterface().clientPreloadMediaFile(loadFileUrlArray) ;
            }
        }else if(!TK.isTkNative && !TK.subscribe_from_native && !TkGlobal.isClient && !TkGlobal.isMacClient){
            if(TkConstant.joinRoomInfo.customTrophys && TkConstant.joinRoomInfo.customTrophysVoice){
                this.setState({voicefileUrl:''})
            }else if (TkConstant.joinRoomInfo.voicefileUrl && TkConstant.joinRoomInfo.customTrophysVoice){
                this.setState({voicefileUrl:window.WBGlobal.nowUseDocAddress + TkConstant.joinRoomInfo.voicefileUrl})
            }

        }
    };

    handlerPlaybackControl_seek_position(recvEventData){
        for(let giftAnimationJsonIndex in this.giftAnimationJson ){
            if(this.giftAnimationJson[giftAnimationJsonIndex]){
                clearTimeout( this.giftAnimationJson[giftAnimationJsonIndex]['timer'] );
                if(this.giftAnimationJson[giftAnimationJsonIndex]['element'] && this.giftAnimationJson[giftAnimationJsonIndex]['element'].remove){
                    this.giftAnimationJson[giftAnimationJsonIndex]['element'].remove();
                }
                this.giftAnimationJson[giftAnimationJsonIndex] = null ;
                delete this.giftAnimationJson[giftAnimationJsonIndex]  ;
            }
        }
    }

    handlerRoomUserpropertyChanged(recvEventData){
        const that = this ;
        let changeUserproperty = recvEventData.message;
        let user = recvEventData.user;
        let fromID = recvEventData.fromID;
        if(changeUserproperty.giftnumber === 0){
            return;
        }
        for (let key of Object.keys(changeUserproperty)) {
            if (key === "giftnumber" && user.id !== fromID) {
                if (user.publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE) {
                    let $giftAnimationContainer = $("#gift_animation_container")
                    let $giftAnimation = $('<div class="gift-animation"></div>');
                    $giftAnimationContainer.append($giftAnimation);
                    if(changeUserproperty.giftinfo && TkConstant.joinRoomInfo.customTrophys && TkConstant.joinRoomInfo.customTrophysVoice){
                        let trophyeffect=that._changecustomTrophyBg(changeUserproperty.giftinfo,$giftAnimation)
                        that._triggerTrophyTones();
                        that._giftAnimation(user,$giftAnimation,2000,trophyeffect);
                    }else{
                        //$giftAnimation.css('background','url(../../../../../../../../../src/img/call_layout/left/video/ico_gift.png) no-repeat center center')
                        that._triggerTrophyTones();
                        that._giftAnimation(user,$giftAnimation,1300,'0');
                    }
                }
            }
        }
    };
    /*改变奖杯图片动画*/
    _giftAnimation(user,$giftAnimation,time,trophyeffect){
        const that=this;
        $giftAnimation.removeClass("giftAnimationSmall giftAnimationBig scalc").addClass(" giftAnimationBig ");
        that.giftAnimationElement = $giftAnimation ;
        that.giftAnimationJsonIndex++ ;
        let giftAnimationJsonIndex = that.giftAnimationJsonIndex ;
        that.giftAnimationJson[giftAnimationJsonIndex] = {timer:undefined , element:$giftAnimation};
        that.giftAnimationJson[giftAnimationJsonIndex]['timer'] = setTimeout(function () {
            $giftAnimation.removeClass("giftAnimationBig giftAnimationSmall scalc").addClass("scalc giftAnimationSmall");
            // if(trophyeffect==="0"){
                let processedPariicipantId = user.id;
                let $videoParticipant = $("#hvideo" + processedPariicipantId);
                $videoParticipant = $videoParticipant.length > 0 ? $videoParticipant : $("#vvideo" + processedPariicipantId)
                let defalutFontSize = TkGlobal.windowInnerWidth /  TkConstant.STANDARDSIZE ;
                if ($videoParticipant.length > 0) {
                    let left = $videoParticipant.offset().left + $videoParticipant[0].offsetWidth/2 ;
                    let top = $videoParticipant.offset().top + $videoParticipant[0].offsetHeight/2 ;
                    $giftAnimation.animate({
                        left: left / defalutFontSize + "rem",
                        top: top / defalutFontSize + "rem"
                    }, 500, function () {
                        $giftAnimation.remove();
                        if(that.giftAnimationJson[giftAnimationJsonIndex]){
                            clearTimeout( that.giftAnimationJson[giftAnimationJsonIndex]['timer'] );
                            that.giftAnimationJson[giftAnimationJsonIndex] = null ;
                            delete that.giftAnimationJson[giftAnimationJsonIndex]  ;
                        }
                    });
                } else {
                    $giftAnimation.remove();
                    if(that.giftAnimationJson[giftAnimationJsonIndex]){
                        clearTimeout( that.giftAnimationJson[giftAnimationJsonIndex]['timer'] );
                        that.giftAnimationJson[giftAnimationJsonIndex] = null ;
                        delete that.giftAnimationJson[giftAnimationJsonIndex]  ;
                    }
                }
            // }
        }, time);
    }
   /*改变奖杯图片背景*/
    _changecustomTrophyBg(customTrophys,$giftAnimation){
        // 先判断是不是有权限
        if(TkConstant.joinRoomInfo.customTrophys && customTrophys && TkConstant.joinRoomInfo.customTrophysVoice){
            $giftAnimation.css('background','url('+ window.WBGlobal.nowUseDocAddress + customTrophys.trophyimg + ')'+' '+'no-repeat'+' '+'center'+' '+'center');
            $giftAnimation.css('backgroundSize','100% 100%');
            this.state.voicefileUrl = customTrophys.trophyvoice ? window.WBGlobal.nowUseDocAddress + customTrophys.trophyvoice : "./music/gift_default.wav";
            this.setState({voicefileUrl:this.state.voicefileUrl});
            return customTrophys.trophyeffect
        }
    }
    _triggerTrophyTones() { 
        if(TK.isTkNative && TK.subscribe_from_native){
            let nowUseDocAddress = this.state.voicefileUrl.replace(/https/g, "http");
            let projectPublishDirAddress = TkGlobal.projectPublishDirAddress;
            nowUseDocAddress = nowUseDocAddress.replace(/443/g, "80");
            nowUseDocAddress = nowUseDocAddress.replace(/mp3/g, "wav");
            projectPublishDirAddress = projectPublishDirAddress.replace(/https/g, "http");
            projectPublishDirAddress = projectPublishDirAddress.replace(/443/g, "80");
            // let audioUrl = this.state.voicefileUrl || (TkGlobal.projectPublishDirAddress + 'music/gift_default.wav') ;
            let audioUrl = nowUseDocAddress || (projectPublishDirAddress + 'music/gift_default.wav') ;
            let action = 'play'  ;
            let options = {
                localMediaFile: 'gift_default.wav'
            } ;
            ServiceRoom.getNativeInterface().clientAudioMediaPlayer(audioUrl , action , options ) ;
        }else{
            if(TkConstant.joinRoomInfo.customTrophys && TkConstant.joinRoomInfo.customTrophysVoice){
                this.setState({voicefileUrl:this.state.voicefileUrl});
            } else if(TkConstant.joinRoomInfo.voicefileUrl  && TkConstant.joinRoomInfo.customTrophysVoice){
                this.state.voicefileUrl = window.WBGlobal.nowUseDocAddress + TkConstant.joinRoomInfo.voicefileUrl;
                this.setState({voicefileUrl:this.state.voicefileUrl});
            } else if (TkConstant.joinRoomInfo.voicefileUrl ==='' && TkConstant.joinRoomInfo.customTrophysVoice){
                this.setState({voicefileUrl:''});
            }else{
                this.setState({voicefileUrl:''});
            }
            L.Utils.mediaPlay('trophyTones');
        }
    };
    render(){
        let {voicefileUrl} = this.state ;
        return (
            <section className="gift-animation-container" id="gift_animation_container">
                {TK.isTkNative && TK.subscribe_from_native ?undefined:<audio id="trophyTones" src={voicefileUrl || "./music/gift_default.wav"} />}
            </section>
        )
    }
};
export default  GiftAnimationSmart;