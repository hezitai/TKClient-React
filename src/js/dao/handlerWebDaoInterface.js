/**
 *  web接口请求封装类处理函数
 * @module HandlerWebDaoInterface
 * @description  用于控制页面组件的通信
 * @author QiuShao
 * @date 2017/7/5
 */
'use strict';
import eventObjectDefine from 'eventObjectDefine';
import TkConstant from 'TkConstant';
import TkUtils from 'TkUtils';
import TkGlobal from 'TkGlobal';
import ServiceRoom from 'ServiceRoom';
import ServiceSignalling from 'ServiceSignalling';

const HandlerWebDaoInterface  = TK.EventDispatcher( {} ) ;
eventObjectDefine.HandlerWebDaoInterface = HandlerWebDaoInterface ;
HandlerWebDaoInterface.addEventListenerOnHandlerWebDaoInterface = () =>  {
    /**@description WebAjaxInterface的相关事件**/
    for(let eventKey in TkConstant.EVENTTYPE.WebDaoEvent ){
        eventObjectDefine.HandlerWebDaoInterface.addEventListener(TkConstant.EVENTTYPE.WebDaoEvent[eventKey] , function (recvEventData) {
            if(HandlerWebDaoInterface['handler'+TkUtils.replaceFirstUper(eventKey) ] && typeof  HandlerWebDaoInterface['handler'+TkUtils.replaceFirstUper(eventKey) ]  === "function" ){
                HandlerWebDaoInterface[ 'handler'+TkUtils.replaceFirstUper(eventKey) ](recvEventData);
            }
            eventObjectDefine.CoreController.dispatchEvent(recvEventData);
        });
    }
};

/*获取礼物接口后触发的事件处理函数*/
HandlerWebDaoInterface.handlerSendGift = (recvEventData) => {
    let {response , requestResult , participantIdJson , customTrophys} =  recvEventData.message ;
    if(requestResult && response.result == 0) {
        let participantList = ServiceRoom.getTkRoom().getUsers(); // N：上台用户还在该集合里
        for(let keyName in participantIdJson) {
            let participantId = keyName;
            let participant = participantList[participantId];
            if(participant) {
                TkGlobal.participantGiftNumberJson[participantId] = TkGlobal.participantGiftNumberJson[participantId] || 0;
                TkGlobal.participantGiftNumberJson[participantId]++;
                let giftnumber = (participant.giftnumber != undefined ? participant.giftnumber : 0) + TkGlobal.participantGiftNumberJson[participantId];
                let data = {
                    giftnumber: giftnumber
                }
                if(customTrophys){
                    data.giftinfo={
                        trophyname:customTrophys.trophyname,
                        trophyeffect:customTrophys.trophyeffect,
                        trophyimg:customTrophys.trophyimg,
                        trophyvoice:customTrophys.trophyvoice
                    }
                }
                ServiceSignalling.setParticipantPropertyToAll(participantId, data);
            }
        }
    }
};

/*上课发送的web接口roomstart后触发的事件处理函数*/
HandlerWebDaoInterface.handlerRoomStart = (recvEventData) => {

};

/*下课发送的web接口roomove后触发的事件处理函数*/
HandlerWebDaoInterface.handlerRoomStart = (recvEventData) => {

};

HandlerWebDaoInterface.handlerRoomStart = (recvEventData) => {

};


HandlerWebDaoInterface.addEventListenerOnHandlerWebDaoInterface();
export default HandlerWebDaoInterface ;