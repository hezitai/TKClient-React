/**
 * 拓课系统样式工具类
 * @module serviceTools
 * @description   提供 系统所需要的模块样式
 * @author QiuShao
 * @date 2017/12/08
 */

'use strict';
import TkGlobal from 'TkGlobal';
import TkConstant from 'TkConstant';
import TkUtils from 'TkUtils';
//import BottomToolsVesselSmart from "../containers/call/mainVessel/bottomToolsVessel/bottomToolsVessel";
import eventObjectDefine from 'eventObjectDefine';

const systemStyleJsonUtils  = {
    updateSystemStyleJson:(updateStyleJson) => {
    if(updateStyleJson && typeof updateStyleJson === 'object'){
            systemStyleJsonUtils.loadSystemStyleJson( updateStyleJson );
            eventObjectDefine.CoreController.dispatchEvent({type:'updateSystemStyle'});
        }
    },
    loadSystemStyleJson:(notUpdateSystemStyleJson={} ) => {
        // notUpdateSystemStyleJson = L.Utils.toJsonStringify(notUpdateSystemStyleJson);
        // let notUpdateSystemStyleJsonToJsonParse = L.Utils.toJsonParse(notUpdateSystemStyleJson);
        let notUpdateSystemStyleJsonToJsonParse = notUpdateSystemStyleJson ;
        /*头部容器*/
        notUpdateSystemStyleJsonToJsonParse.HeaderVesselSmartStyleJson = notUpdateSystemStyleJsonToJsonParse.HeaderVesselSmartStyleJson || {} ;
        let HeaderVesselSmartStyleJson = Object.customAssign({
            position:'relative' ,
            width:'100%' ,
            height:'0.42rem' ,
            top:'0rem' ,
            backgroundColor: TkGlobal.playback?'#5467CC':'',
            zIndex:387,
        },  notUpdateSystemStyleJsonToJsonParse.HeaderVesselSmartStyleJson)  ;


        /*底部容器*/
        notUpdateSystemStyleJsonToJsonParse.BottomToolsVesselJson=notUpdateSystemStyleJsonToJsonParse.BottomToolsVesselJson||{};
        let BottomToolsVesselJson=Object.customAssign({
            position:'absolute',
            width:'100%',
            height:'0.56rem',
            bottom:'0',
            zIndex:259
        },notUpdateSystemStyleJsonToJsonParse.BottomToolsVesselJson);


        /*视频列表容器*/
        notUpdateSystemStyleJsonToJsonParse.BottomVesselSmartStyleJson =  notUpdateSystemStyleJsonToJsonParse.BottomVesselSmartStyleJson || {} ;
        let BottomVesselSmartStyleJson = Object.customAssign({
            position:'absolute' ,
            height:'0rem' ,
            // zIndex:901,
            bottom:'auto' ,
            top: 0,
            width:"100%" ,
        },  notUpdateSystemStyleJsonToJsonParse.BottomVesselSmartStyleJson )  ;

        /*右側容器*/
        notUpdateSystemStyleJsonToJsonParse.RightVesselSmartStyleJson = notUpdateSystemStyleJsonToJsonParse.RightVesselSmartStyleJson || {} ;
        let RightVesselSmartStyleJson = Object.customAssign({
            position:'absolute' ,
            // width:'3.51' ,
            width: TkConstant.hasRoomtype.oneToOne ? '3.51rem' : '4.36rem',
            right:'0rem' ,
            left:"auto" ,
            zIndex:200,
            top:TkConstant.hasRoomtype.oneToOne &&  BottomVesselSmartStyleJson.height==="0rem" ? 'calc('+BottomVesselSmartStyleJson.height+' + '+HeaderVesselSmartStyleJson.height+' + 0.2rem )' : 'calc('+BottomVesselSmartStyleJson.height+' + '+HeaderVesselSmartStyleJson.height+')' ,
            height:TkConstant.hasRoomtype.oneToOne &&  BottomVesselSmartStyleJson.height==="0rem" ? 'calc(100% - '+HeaderVesselSmartStyleJson.height+' -  '+BottomVesselSmartStyleJson.height+')' : 'calc(100% - '+HeaderVesselSmartStyleJson.height+' -  '+BottomVesselSmartStyleJson.height+')'  ,
        },  notUpdateSystemStyleJsonToJsonParse.RightVesselSmartStyleJson )  ;

        /*主体内容区域*/
        notUpdateSystemStyleJsonToJsonParse.RightContentVesselSmartStyleJson = notUpdateSystemStyleJsonToJsonParse.RightContentVesselSmartStyleJson || {};
        let RightContentVesselSmartStyleJson =   Object.customAssign({
            position: 'absolute',
            width: 'calc(100% - ' + RightVesselSmartStyleJson.width+' - ' + ' 0.25rem '+')',
            height: TkConstant.hasRoomtype.oneToOne &&  BottomVesselSmartStyleJson.height==="0rem" ? 'calc(100% - ' + HeaderVesselSmartStyleJson.height + ' -  ' + BottomVesselSmartStyleJson.height +' - '+BottomToolsVesselJson.height+' - 0.2rem'+')' : 'calc(100% - ' + HeaderVesselSmartStyleJson.height + ' -  ' + BottomVesselSmartStyleJson.height +' - '+BottomToolsVesselJson.height+')',
            top:TkConstant.hasRoomtype.oneToOne && BottomVesselSmartStyleJson.height==="0rem" ? 'calc( '+BottomVesselSmartStyleJson.height+' + '+HeaderVesselSmartStyleJson.height+' + 0.2rem)' : 'calc('+BottomVesselSmartStyleJson.height+' + '+HeaderVesselSmartStyleJson.height+')' ,
            left:'0.13rem',
        },  notUpdateSystemStyleJsonToJsonParse.RightContentVesselSmartStyleJson )  ;

        /*左侧区域*/
        notUpdateSystemStyleJsonToJsonParse.LeftToolBarVesselSmartStyleJson=notUpdateSystemStyleJsonToJsonParse.LeftToolBarVesselSmartStyleJson||{};
        let LeftToolBarVesselSmartStyleJson =Object.customAssign({

        },notUpdateSystemStyleJsonToJsonParse.LeftToolBarVesselSmartStyleJson);


        switch (TkConstant.template){
            case 'template_classic':
                Object.customAssign(HeaderVesselSmartStyleJson,{   //头部区域
                    height:'0.62rem' ,
                });
                Object.customAssign(RightVesselSmartStyleJson,{   //聊天区
                    width:'4rem',
                    top:HeaderVesselSmartStyleJson.height,
                    height:'calc(100% - '+HeaderVesselSmartStyleJson.height + ')' ,
                });
                Object.customAssign(LeftToolBarVesselSmartStyleJson,{
                    position:'absolute',
                    top:HeaderVesselSmartStyleJson.height,
                    width:"0.5rem",
                    height:'calc(100% - '+HeaderVesselSmartStyleJson.height+')',
                    left:'0',
                    zIndex:200
                });
                Object.customAssign(BottomVesselSmartStyleJson,{
                    bottom:'0.1rem' ,
                    top:'auto',
                    left:LeftToolBarVesselSmartStyleJson.width,
                    width:'calc(100% - '+ RightVesselSmartStyleJson.width + ' - ' + LeftToolBarVesselSmartStyleJson.width + ' - 0.1rem )'  ,
                });
                Object.customAssign(RightContentVesselSmartStyleJson,{   //白板区域
                    position: 'absolute',
                    width: 'calc(100% - ' + RightVesselSmartStyleJson.width +' - ' + LeftToolBarVesselSmartStyleJson.width + ' - 0.1rem )',
                    height: TkConstant.hasRoomtype.oneToOne  ? 'calc(100% - ' + HeaderVesselSmartStyleJson.height + ' - 0.1rem )' : 'calc(100% - ' + HeaderVesselSmartStyleJson.height + ' - ' + BottomVesselSmartStyleJson.height + ' - 0.1rem )',
                    top:HeaderVesselSmartStyleJson.height,
                    left:LeftToolBarVesselSmartStyleJson.width,
                });

                break;
            case 'template_beyond':
                Object.customAssign(RightVesselSmartStyleJson,{   //聊天区
                    // width:'5.5rem',
                    width:0,
                    top:'calc(' + HeaderVesselSmartStyleJson.height+' + ( 100% - 8.25rem ) / 2)',
                    height:'8.25rem' ,
                });

                if(TkConstant.layoutId !== 'layoutId_1') {
                    Object.customAssign(BottomVesselSmartStyleJson,{
                        bottom:'0.1rem' ,
                        top:'auto',
                        left:LeftToolBarVesselSmartStyleJson.width,
                        width:'calc(100% - '+ RightVesselSmartStyleJson.width + ' - ' + LeftToolBarVesselSmartStyleJson.width + ' - 0.1rem )'  ,
                    });
                    Object.customAssign(RightContentVesselSmartStyleJson,{   //白板区域
                        position: 'absolute',
                        width: TkConstant.hasRoomtype.oneToOne?'calc(100% - ' + RightVesselSmartStyleJson.width+' )':'100%',
                        height: TkConstant.hasRoomtype.oneToOne  ? '8.25rem' : 'calc(100% - ' + HeaderVesselSmartStyleJson.height + ' - ' + BottomVesselSmartStyleJson.height + ' )',
                        top:TkConstant.hasRoomtype.oneToOne ? 'calc(' + HeaderVesselSmartStyleJson.height+' + ( 100% - 8.25rem ) / 2) ' : RightContentVesselSmartStyleJson.top+BottomVesselSmartStyleJson.height,
                        // left:TkConstant.hasRoomtype.oneToOne ? LeftToolBarVesselSmartStyleJson.width : `0`,
                    });
                }else{
                    Object.customAssign(RightContentVesselSmartStyleJson,{   //白板区域
                        position: 'absolute',
                        width: TkConstant.hasRoomtype.oneToOne?'calc(100% - ' + RightVesselSmartStyleJson.width+' )':'100%',
                        height: TkConstant.hasRoomtype.oneToOne  ? '8.25rem' : 'calc(100% - ' + HeaderVesselSmartStyleJson.height + ' - ' + BottomVesselSmartStyleJson.height + ' )',
                        top:TkConstant.hasRoomtype.oneToOne ? 'calc(' + HeaderVesselSmartStyleJson.height+' + ( 100% - 8.25rem ) / 2) ' : RightContentVesselSmartStyleJson.top,
                        // left:TkConstant.hasRoomtype.oneToOne ? LeftToolBarVesselSmartStyleJson.width : `0`,
                    });
                }

                break;
                
        }

        /*Object.customAssign( TkGlobal.dragRange,  {
            left:0.77,
            top:TkUtils.replaceRemToNumber(HeaderVesselSmartStyleJson.height) + TkUtils.replaceRemToNumber(BottomVesselSmartStyleJson.height) + 0.08,//0.1是白板marginTop
        });*/
        TkGlobal.systemStyleJson = null ;
        TkGlobal.systemStyleJson = {
            HeaderVesselSmartStyleJson ,
            RightVesselSmartStyleJson ,
            BottomVesselSmartStyleJson ,
            RightContentVesselSmartStyleJson ,
            BottomToolsVesselJson,
            LeftToolBarVesselSmartStyleJson,
        };
    }
};

export default systemStyleJsonUtils ;