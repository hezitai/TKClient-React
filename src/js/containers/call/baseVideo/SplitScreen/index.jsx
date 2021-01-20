import React from 'react';
import ServiceSignalling from 'ServiceSignalling';
import ServiceRoom from 'ServiceRoom';
import TkUtils from "TkUtils";
import TkGlobal from 'TkGlobal' ;

const SplitScreen = {
    existTeacher:false,
    childrenSplitScreenStyle:{},
    // 初始化所有的分屏数据
    init(send=false){
        if(send){
            let isDelMsg = true;
            ServiceSignalling.sendSignallingFromVideoSplitScreen({userIDArry: []},isDelMsg);
        }
    },

    //加载分屏样式：
    load(userId,userIdArry,childrenSplitScreenStyle){
        let videoContainerStyle = undefined;
        let index = userIdArry.indexOf(userId) ;
        if (TkGlobal.isSplitScreen &&  index !== -1 && ServiceRoom.getTkRoom() && childrenSplitScreenStyle['liStyle_']) {
            if( userIdArry.length === 7 || userIdArry.length === 13){
                let roleChairmanId = undefined ;
                for(let value of  userIdArry){
                    let user = this.getUser(value) ;
                    if(user && user.role ===  TkConstant.role.roleChairman ){
                        roleChairmanId = user.id ;
                        break ;
                    }
                }
                if(roleChairmanId){
                    let currentUser =  this.getUser(userId) ;
                    if(currentUser && currentUser.role === TkConstant.role.roleChairman){
                        if(userIdArry.length === 7){
                            videoContainerStyle = childrenSplitScreenStyle['liStyle_'][2] ;
                        }else if(userIdArry.length === 13){
                            this.existTeacher = true;
                            videoContainerStyle = childrenSplitScreenStyle['liStyle_'][7] ;
                        }
                    }else{
                        let roleChairmanIdIndex = userIdArry.indexOf(roleChairmanId) ;
                        if(userIdArry.length === 7){
                            if(index === 1 && roleChairmanIdIndex !== -1){
                                videoContainerStyle = childrenSplitScreenStyle['liStyle_'][(roleChairmanIdIndex+1)] ;
                            }else{
                                videoContainerStyle = childrenSplitScreenStyle['liStyle_'][(index+1)] ;
                            }
                        }else if(userIdArry.length === 13){
                            if(index === 6 && roleChairmanIdIndex !== -1){
                                videoContainerStyle = childrenSplitScreenStyle['liStyle_'][(roleChairmanIdIndex+1)] ;
                            }else{
                                videoContainerStyle = childrenSplitScreenStyle['liStyle_'][(index+1)] ;
                            }
                        }
                    }
                }else{
                    this.existTeacher = false;
                    videoContainerStyle = childrenSplitScreenStyle['liStyle_'][(index+1)] ;
                }
            }else{
                videoContainerStyle = childrenSplitScreenStyle['liStyle_'][(index+1)];
            }
        }
        return videoContainerStyle;
    },

    //更新
    update(lengths,childrenSplitScreenStyle){
        if(TkGlobal.isSplitScreen) {
            let isChangeChildrenSplitScreenStyle = false ;
            let { width , height , left , top } = TkGlobal.systemStyleJson.RightContentVesselSmartStyleJson ;
            if( lengths === 1 ){
                for( let i = 1 ; i <= lengths ; i++ ){
                    childrenSplitScreenStyle.liStyle_={};
                    childrenSplitScreenStyle.liStyle_[i]={};
                    childrenSplitScreenStyle.liStyle_[i].height = "calc( "+TkUtils.replaceCalc(height) + " -  "+TkGlobal.playbackControllerHeight+")";
                    childrenSplitScreenStyle.liStyle_[i].width = "calc( "+TkUtils.replaceCalc(width)+")";
                    childrenSplitScreenStyle.liStyle_[i].left = left;
                    childrenSplitScreenStyle.liStyle_[i].top = top ;
                }
                isChangeChildrenSplitScreenStyle = true ;
            }
            if( lengths === 2 ){
                childrenSplitScreenStyle.liStyle_={};
                for( let i = 1 ; i < lengths+1 ; i++ ){
                    childrenSplitScreenStyle.liStyle_[i]={};
                    childrenSplitScreenStyle.liStyle_[i].height = "calc( "+TkUtils.replaceCalc(height) + " -  "+TkGlobal.playbackControllerHeight+")";
                    childrenSplitScreenStyle.liStyle_[i].width = "calc( ("+TkUtils.replaceCalc(width) + ") / 2 )" ;
                    childrenSplitScreenStyle.liStyle_[i].left = "calc( ("+TkUtils.replaceCalc(width) + ") / 2" + "*"+ (i-1) + " + " +left + " )";
                    childrenSplitScreenStyle.liStyle_[i].top = top ;
                }
                isChangeChildrenSplitScreenStyle = true ;
            }
            if( lengths >=3 && lengths < 8 ){
                this.count(lengths,2,childrenSplitScreenStyle);
                isChangeChildrenSplitScreenStyle = true ;
            }
            if( lengths >= 8 && lengths < 14){
                this.count(lengths,3,childrenSplitScreenStyle);
                isChangeChildrenSplitScreenStyle = true ;
            }
            if(isChangeChildrenSplitScreenStyle){
                let zIndex = 300 ;
                for( let value of Object.values(childrenSplitScreenStyle.liStyle_) ){
                    Object.customAssign(value , {
                        position: "fixed",
                        margin: 0,
                        zIndex:++zIndex
                    });
                }
                return childrenSplitScreenStyle;
            }
        }else{
            if(Object.keys(childrenSplitScreenStyle).length>0){
                return {};
            }
        }
    },

    //计算
    count(nums,moduloValue,childrenSplitScreenStyle){  //传两个参数 1.视频总路数；2.取模数（小于8的取模2，大于7的取模3）
        let { width , height , left , top } = TkGlobal.systemStyleJson.RightContentVesselSmartStyleJson ;
        childrenSplitScreenStyle.liStyle_={};
        if(nums !==13){
            this.existTeacher = false;
        }
        if(nums===3){
            for(let i=1; i<nums+1;i++) {
                childrenSplitScreenStyle.liStyle_[i]= {};
                childrenSplitScreenStyle.liStyle_[i].width ="calc( ("+TkUtils.replaceCalc(width) + ") / 2 )"  ;
                if(i===1){
                    childrenSplitScreenStyle.liStyle_[i].height = "calc( ("+TkUtils.replaceCalc(height) + " - "+TkGlobal.playbackControllerHeight+") )";
                    childrenSplitScreenStyle.liStyle_[i].left = left;
                    childrenSplitScreenStyle.liStyle_[i].top = top;
                }else{
                    childrenSplitScreenStyle.liStyle_[i].height = "calc( ("+TkUtils.replaceCalc(height) + " - "+TkGlobal.playbackControllerHeight+") / 2 )";
                    childrenSplitScreenStyle.liStyle_[i].left = "calc( ("+TkUtils.replaceCalc(width) + ") / 2" + " + " +left + " )";
                    childrenSplitScreenStyle.liStyle_[i].top =  "calc( ("+TkUtils.replaceCalc(height) + " - "+TkGlobal.playbackControllerHeight+") / 2 " + "*"+ (i-2) +  " + " + top +")";;
                }
            }
            return;
        }
        //大于3路
        for(let i=1; i<nums+1;i++){
            childrenSplitScreenStyle.liStyle_[i]= {};
            childrenSplitScreenStyle.liStyle_[i].height = "calc( ("+TkUtils.replaceCalc(height) + " - "+TkGlobal.playbackControllerHeight+") / " + moduloValue +" )";
            if( nums % moduloValue ===0 ){ // 均分情况 4  6  9  12 ;
                let divideValue = (nums /moduloValue);
                childrenSplitScreenStyle.liStyle_[i].width ="calc( ("+TkUtils.replaceCalc(width) + ")"+ "/" + divideValue +")"  ;
                if(i<=divideValue){ //第一排视频数量
                    childrenSplitScreenStyle.liStyle_[i].left = "calc( ("+TkUtils.replaceCalc(width) + ")"+ "/" + divideValue + "*"+ (i-1) + " + " +left + " )";
                    childrenSplitScreenStyle.liStyle_[i].top = top;
                }else{
                    if(nums <= 7){
                        childrenSplitScreenStyle.liStyle_[i].left = "calc( ("+TkUtils.replaceCalc(width) + ")"+ "/" + divideValue + "*"+ (i-divideValue-1) + " + " +left + " )";
                        childrenSplitScreenStyle.liStyle_[i].top = "calc( ("+TkUtils.replaceCalc(height) + " - "+TkGlobal.playbackControllerHeight+") / 2 "+ " + " + top +")";
                    }else if(nums>7&&nums<14){
                        if(i <= nums-divideValue){ //第二排视频数量
                            childrenSplitScreenStyle.liStyle_[i].left = "calc( ("+TkUtils.replaceCalc(width) + ")"+ "/" + divideValue + "*"+ (i-divideValue-1) + " + " +left + " )";
                            childrenSplitScreenStyle.liStyle_[i].top = "calc( ("+TkUtils.replaceCalc(height) + " - "+TkGlobal.playbackControllerHeight+") / " + moduloValue + " + " + top +")";
                        }else{ //第三排视频数量
                            if(nums===12){
                                childrenSplitScreenStyle.liStyle_[i].left = "calc( ("+TkUtils.replaceCalc(width) + ")"+ "/" + divideValue + "*"+ (i-nums+3) + " + " +left + " )";
                            }else{
                                childrenSplitScreenStyle.liStyle_[i].left = "calc( ("+TkUtils.replaceCalc(width) + ")"+ "/" + divideValue + "*"+ (i-nums+2) + " + " +left + " )";
                            }
                            childrenSplitScreenStyle.liStyle_[i].top = "calc( ("+TkUtils.replaceCalc(height) + " - "+TkGlobal.playbackControllerHeight+") /  " + moduloValue + " * 2 "+" + " + top +")";
                        }
                    }
                }
            }else{  // 视频数量 5 7 8 10 11 13； 13比较特殊单独判断
                let ceilValue = Math.ceil(nums/moduloValue);
                let parseIntValue = parseInt(nums/moduloValue);
                if(i<ceilValue){  //第一排视频数量
                    childrenSplitScreenStyle.liStyle_[i].width ="calc( ("+TkUtils.replaceCalc(width) + ")/"+ parseIntValue +")" ;
                    childrenSplitScreenStyle.liStyle_[i].left = "calc( ("+TkUtils.replaceCalc(width) + ")/"+ parseIntValue + "*"+ (i-1) + " + " +left + " )";
                    childrenSplitScreenStyle.liStyle_[i].top = top;
                }else { //第二排视频数量
                    if(nums <= 7){
                        childrenSplitScreenStyle.liStyle_[i].width = "calc( ("+TkUtils.replaceCalc(width) + ") / "+ceilValue + ")";
                        childrenSplitScreenStyle.liStyle_[i].left = "calc( ("+TkUtils.replaceCalc(width) + ") / "+ ceilValue  + "*"+ (i-ceilValue) + " + " +left + " )";
                        childrenSplitScreenStyle.liStyle_[i].top = "calc( ("+TkUtils.replaceCalc(height) + " - "+TkGlobal.playbackControllerHeight+")  / " + moduloValue + " + " + top +")";
                    } else if(nums > 7 && nums < 10){
                        if(i<(nums-parseIntValue)){
                            childrenSplitScreenStyle.liStyle_[i].width = "calc( ("+TkUtils.replaceCalc(width) + ") / "+ceilValue + ")";
                            childrenSplitScreenStyle.liStyle_[i].left = "calc( ("+TkUtils.replaceCalc(width) + ") / "+ ceilValue  + "*"+ (i-ceilValue) + " + " +left + " )";
                            childrenSplitScreenStyle.liStyle_[i].top = "calc( ("+TkUtils.replaceCalc(height) + " - "+TkGlobal.playbackControllerHeight+") / " + moduloValue + " + " + top +")";
                        }else { //第三排视频数量
                            childrenSplitScreenStyle.liStyle_[i].width = "calc( ("+TkUtils.replaceCalc(width) + ") / "+ceilValue + ")";
                            childrenSplitScreenStyle.liStyle_[i].left = "calc( ("+TkUtils.replaceCalc(width) + ") / "+ ceilValue  + "*"+ (i-nums+ceilValue-1) + " + " +left + " )";
                            childrenSplitScreenStyle.liStyle_[i].top = "calc( ("+TkUtils.replaceCalc(height) + " - "+TkGlobal.playbackControllerHeight+") / " + moduloValue + " * 2 " + " + " + top +")";
                        }
                    }else if(nums >= 10 && nums < 14){
                        if(nums===13){
                            if(i<=(nums-parseIntValue)){ //第二排
                                if(this.existTeacher){ //有老师
                                    let  secondTeacherWidth = "("+TkUtils.replaceCalc(width)+")/4";
                                    let  secondStudentWidth = "("+TkUtils.replaceCalc(width) +" - "+secondTeacherWidth+")/4";
                                    if(i===7){
                                        childrenSplitScreenStyle.liStyle_[i].width = "calc( "+secondTeacherWidth +")" ;
                                        childrenSplitScreenStyle.liStyle_[i].left = "calc( ("+secondStudentWidth  + "*"+ 2 + " ) + " +left + " )";
                                    }else if(i<7){
                                        childrenSplitScreenStyle.liStyle_[i].width = "calc( "+secondStudentWidth + ")";
                                        childrenSplitScreenStyle.liStyle_[i].left = "calc( "+secondStudentWidth + " * "+(i-5) +" + "+left + ")";
                                    }else{
                                        childrenSplitScreenStyle.liStyle_[i].width = "calc( "+secondStudentWidth+ ")";
                                        childrenSplitScreenStyle.liStyle_[i].left = "calc( "+secondStudentWidth + " * "+ (i-6)+ " + "+ secondTeacherWidth + " + " +left + " )";
                                    }
                                }else{//无老师
                                    childrenSplitScreenStyle.liStyle_[i].width = "calc( ("+TkUtils.replaceCalc(width) + ") / "+ceilValue + ")";
                                    childrenSplitScreenStyle.liStyle_[i].left = "calc( ("+TkUtils.replaceCalc(width) + ") / "+ ceilValue  + "*"+ (i-ceilValue) + " + " +left + " )";
                                }
                                childrenSplitScreenStyle.liStyle_[i].top = "calc( ("+TkUtils.replaceCalc(height) + " - "+TkGlobal.playbackControllerHeight+") / " + moduloValue + " + " + top +")";
                            }else{
                                childrenSplitScreenStyle.liStyle_[i].width = "calc( ("+TkUtils.replaceCalc(width) + ") / "+parseIntValue + ")";
                                childrenSplitScreenStyle.liStyle_[i].left = "calc( ("+TkUtils.replaceCalc(width) + ") / "+ parseIntValue  + "*"+ (i-nums+parseIntValue-1) + " + " +left + " )";
                                childrenSplitScreenStyle.liStyle_[i].top = "calc( ("+TkUtils.replaceCalc(height) + " - "+TkGlobal.playbackControllerHeight+") / " + moduloValue + " * 2 " + " + " + top +")";
                            }
                        }else{
                            if(i<(nums-parseIntValue)){ //第二排视频数量
                                if(nums===11){ //11路第二排四个
                                    childrenSplitScreenStyle.liStyle_[i].width = "calc( ("+TkUtils.replaceCalc(width) + ") / "+ceilValue + ")";
                                    childrenSplitScreenStyle.liStyle_[i].left = "calc( ("+TkUtils.replaceCalc(width) + ") / "+ ceilValue  + "*"+ (i-ceilValue) + " + " +left + " )";
                                }else{ //小于11路第二排3个
                                    childrenSplitScreenStyle.liStyle_[i].width = "calc( ("+TkUtils.replaceCalc(width) + ") / "+parseIntValue + ")";
                                    childrenSplitScreenStyle.liStyle_[i].left = "calc( ("+TkUtils.replaceCalc(width) + ") / "+ parseIntValue  + "*"+ (i-ceilValue) + " + " +left + " )";
                                }
                                childrenSplitScreenStyle.liStyle_[i].top = "calc( ("+TkUtils.replaceCalc(height) + " - "+TkGlobal.playbackControllerHeight+") / " + moduloValue + " + " + top +")";
                            }else { //第三排视频数量
                                childrenSplitScreenStyle.liStyle_[i].width = "calc( ("+TkUtils.replaceCalc(width) + ") / "+ceilValue + ")";
                                childrenSplitScreenStyle.liStyle_[i].left = "calc( ("+TkUtils.replaceCalc(width) + ") / "+ ceilValue  + "*"+ (i-nums+ceilValue-1) + " + " +left + " )";
                                childrenSplitScreenStyle.liStyle_[i].top = "calc( ("+TkUtils.replaceCalc(height) + " - "+TkGlobal.playbackControllerHeight+") / " + moduloValue + " * 2 " + " + " + top +")";
                            }
                        }
                    }
                }
            }
        }
    },

    //发送信令
    sendSignalling(userIDArry , notNeedRole = false, toID){
        if(notNeedRole || (!notNeedRole && TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant)){
            userIDArry = userIDArry || this.state.userIDArry ;
            let data = {
                userIDArry: userIDArry,
            };
            ServiceSignalling.sendSignallingFromVideoSplitScreen(data, undefined, toID);
        }
    },

    getUser(userid){
        if( !ServiceRoom.getTkRoom() ){
            return undefined ;
        }
        return ServiceRoom.getTkRoom().getUser(userid);
    }
};
export default SplitScreen;