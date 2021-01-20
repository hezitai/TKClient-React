/**
 * 工具服务
 * @module serviceTools
 * @description   提供 工具服务
 * @author QiuShao
 * @date 2017/7/10
 */
import TkUtils from  "TkUtils" ;
import TkGlobal from  'TkGlobal' ;
import ServiceRoom from 'ServiceRoom';
import ServiceSignalling from 'ServiceSignalling';


const ServiceTools = {
   /*获取语言包数据
    @method getAppLanguageInfo
    @param {string} languageName 语言名字*/
   getAppLanguageInfo:function ( callback , languageName) {
       let lang = languageName ? languageName : TkGlobal.languageName;//默认语言
       // lang = 'english';//测试数据
       let languageInfo = {} ;
       TkGlobal.language = TkGlobal.language || {} ;
       /*获取语言数据*/
       languageInfo.name = lang ;
       languageInfo.languageData = require('../../language/i18_'+lang+'.js').default;
       if(callback && typeof callback === "function" ){
           callback(languageInfo);
       }
       document.body.className = document.body.className.replace(/(chinese|english|complex)/g , "") + " " +languageInfo.name ;
       document.body.setAttribute("data-language" , languageInfo.name);
   } ,
    /*停止所有的媒体共享
    * @params isStopMyself:是否只停止自己发布的媒体流，默认false*/
    stopAllMediaShare:(isStopMyself = false) => {
        ServiceRoom.getTkRoom().stopShareMedia(undefined,undefined,{
            onlyStopMyself:isStopMyself //是否只停止自己的流，sdk提供的内部使用配置项
        });
        ServiceRoom.getTkRoom().stopShareLocalMedia(undefined,undefined,{
            onlyStopMyself:isStopMyself //是否只停止自己的流，sdk提供的内部使用配置项
        });
    },

    TkUtils:TkUtils ,
};

export default ServiceTools ;