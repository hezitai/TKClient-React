/**
 * web接口请求封装类
 * @class WebAjaxInterface
 * @description   提供系统所需要的web接口请求
 * @author QiuShao
 * @date 2017/08/08
 */
'use strict';
import TkConstant from 'TkConstant';
import TkGlobal from 'TkGlobal';
import eventObjectDefine from 'eventObjectDefine';
import ServiceRoom from 'ServiceRoom';
import ServiceSignalling from 'ServiceSignalling';
import CoreController from 'CoreController';
import HandlerWebDaoInterface from './handlerWebDaoInterface';

export  const webRequestSuccess = 1 ;
export  const webRequestFail = 0 ;
class WebAjaxInterface{
    /*基础请求接口*/
    baseAjax(requestJson , responseJson){
        responseJson = responseJson || {} ;
        responseJson.ajaxHandlerCallback = function (error , response ) {
            if(requestJson.handlerEventKey){
                let webAjaxEventData = {
                    type: TkConstant.EVENTTYPE.WebDaoEvent[requestJson.handlerEventKey] ,
                } ;
                if(error && !response){
                    webAjaxEventData.message = {
                        error:error ,
                        requestResult:webRequestFail
                    }
                }else if(response){
                    webAjaxEventData.message = {
                        response:response ,
                        requestResult:webRequestSuccess
                    };
                    if(requestJson.excessResponseResultJson){
                        for(let keyName in requestJson.excessResponseResultJson){
                            webAjaxEventData.message[keyName] =  requestJson.excessResponseResultJson[keyName] ;
                        }
                    }
                }
                eventObjectDefine.HandlerWebDaoInterface.dispatchEvent(webAjaxEventData);
            }else{
                L.Logger.error('requestJson not handlerEventKey!' , JSON.stringify(requestJson) );
            }
        };
        $.ajax({
            type: requestJson.type || "post",
            url: requestJson.url,
            dataType:requestJson.dataType || "json",
            async: requestJson.async || false,
            data:requestJson.data,
        }).done(function(response) {
            L.Logger.debug( (requestJson.remark?'['+requestJson.remark+']' : '' )  +"success:ajax request  response:", response);
            if(responseJson && responseJson.doneCallback && typeof responseJson.doneCallback === "function" ){
                responseJson.doneCallback(response);
            }else{
                responseJson.ajaxHandlerCallback(undefined ,response);
            }
        }).fail(function(error) {
            L.Logger.error((requestJson.remark?'['+requestJson.remark+']' : '' )  + "fail:ajax request  error:", error);
            if(responseJson && responseJson.failCallback && typeof responseJson.failCallback === "function" ){
                responseJson.failCallback(error);
            }else{
                responseJson.ajaxHandlerCallback(error ,undefined);
            }
        });
    };

    /*获取礼物信息，participantId可缺省，缺省获取所有人的
    * @method getGiftInfo*/
    getGiftInfo(participantId,resCallback){
        let that = this ;
        let data = {
            serial: TkConstant.joinRoomInfo["serial"] //教室id
        };
        if(participantId) {
            data["receiveid"] = participantId; //收礼物人id',（可不填）
        };
        let requestJson = {
            type:'get' ,
            url:TkConstant.SERVICEINFO.webAddress + "/ClientAPI" + "/getgiftinfo"+"?ts="+new Date().getTime(),
            data:data ,
            async:true ,
            handlerEventKey:'getGiftInfo' ,
            remark:'获取礼物',
        };
        that.baseAjax(requestJson,{doneCallback:resCallback});
    } ;

    /*发送礼物
     * @method sendGift
     * @params [participantIdJson:json]*/
    sendGift(participantIdJson,customTrophys){
        if( !CoreController.handler.getAppPermissions('sendGift') ){return ;} ;
        let that = this ;
        let data = {
            serial: TkConstant.joinRoomInfo["serial"] , //教室id
            sendid: ServiceRoom.getTkRoom().getMySelf().id, //送礼物人id
            sendname: ServiceRoom.getTkRoom().getMySelf().nickname, //送礼物人名字'
            receivearr: participantIdJson //接收礼物人id Json
        };
        let requestJson = {
            type:'post' ,
            url:TkConstant.SERVICEINFO.webAddress + "/ClientAPI" + "/sendgift"+"?ts="+new Date().getTime(),
            data:data ,
            async:true ,
            handlerEventKey:'sendGift' ,
            excessResponseResultJson:{participantIdJson:participantIdJson,customTrophys:customTrophys} ,
            remark:'发送礼物' ,
        };
        that.baseAjax(requestJson);
    };

    /*上课发送的web接口roomstart
     * @method roomStart*/
    roomStart(){
        if( !CoreController.handler.getAppPermissions('roomStart') ){return ;} ;
        let that = this ;
        let data = {
            serial: TkConstant.joinRoomInfo["serial"],
            companyid: TkConstant.joinRoomInfo["companyid"]
        };
        let requestJson = {
            type:'post' ,
            url:TkConstant.SERVICEINFO.webAddress + "/ClientAPI" + "/roomstart"+"?ts="+new Date().getTime(),
            data:data ,
            async:true ,
            handlerEventKey:'roomStart' ,
            remark:'开始上课' ,
        };
        that.baseAjax(requestJson);
        ServiceSignalling.sendSignallingFromClassBegin(false);
    };


    /*下课发送的web接口roomove
     * @method roomOver */
    roomOver(){
        if( !CoreController.handler.getAppPermissions('roomOver') ){return ;} ;
        let that = this ;
        let data = {
            act: 3, //删除会议
            serial: TkConstant.joinRoomInfo["serial"],
            companyid: TkConstant.joinRoomInfo["companyid"]
        };
        let requestJson = {
            type:'post' ,
            url:TkConstant.SERVICEINFO.webAddress + "/ClientAPI" + "/roomover"+"?ts="+new Date().getTime(),
            data:data ,
            async:true ,
            handlerEventKey:'roomOver' ,
            remark:'结束上课' ,
        };
        that.baseAjax(requestJson);
        ServiceSignalling.sendSignallingFromClassBegin(true);
    };

   /*获取扫描二维码上传的图片*/
    getQrCodeUploadFile(codeid,responseJson){
        let that = this ;
        let data = {
            key: TkConstant.joinRoomInfo["companyid"],
            serial: TkConstant.joinRoomInfo["serial"],
            uploaduserid: ServiceRoom.getTkRoom().getMySelf().id,
            codeid:codeid,
            codetype:1
        };
        let requestJson={
            type:'get' ,
            url:TkConstant.SERVICEINFO.webAddress + "/ClientAPI" + "/getUploadfile"+"?ts="+new Date().getTime(),
            data:data ,
            async:true ,
            handlerEventKey:'getQrCodeUploadFile' ,
            remark:'获取二维码上传的图片' ,
        }
        that.baseAjax(requestJson,responseJson);
    };
   /*获取答题详情*/
    getSimplifyAnswer({id,page},responseJson){
        let that = this ;
        let data = {
            serial: TkConstant.joinRoomInfo["serial"],
            id,page
        };
        let requestJson={
            type:'post' ,
            url:TkConstant.SERVICEINFO.webAddress + "/ClientAPI" + "/simplifyAnswer"+"?ts="+new Date().getTime(),
            data,
            async:true ,
            handlerEventKey:'getSimplifyAnswer' ,
            remark:'获取答题详情' ,
        };
        that.baseAjax(requestJson,responseJson);
    };
    /*获取cnd列表*/
    getAllCndIp(resCallback){
        let that = this ;
        let requestJson={
            type:'get' ,
            url:TkConstant.SERVICEINFO.webAddress + "/ClientAPI" + "/getcdnlist"+"?ts="+new Date().getTime(),
            async:true ,
            remark:'获取cnd列表' ,
            handlerEventKey:'getAllCndIp' ,
        };
        that.baseAjax(requestJson,{doneCallback:resCallback});
    };
};
const  WebAjaxInterfaceInstance = new WebAjaxInterface();
export  default  WebAjaxInterfaceInstance ;