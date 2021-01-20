;(function () {
    window.clientInfo = window.clientInfo || {} ;
    var isPopupWrapDivShow = false; //包裹弹窗的背景
    var isPopupDivShow = false; //显示弹窗
    var ispopupCancel = false;  //取消
    var endtypeUrlParams =  window.GLOBAL.getUrlParams("endtype") ;
    var endtype = undefined ;
    var clientversion = undefined ;
    var getupdateinfoUrl = window.location.protocol + "//" + (window.GLOBAL.getUrlParams('host') ? window.GLOBAL.getUrlParams('host') : window.location.hostname) + "/ClientAPI/getupdateinfo?ts="+new Date().getTime();
    var language = (navigator.browserLanguage || navigator.systemLanguage || navigator.userLanguage || navigator.language ) ;
    var languageName = language && language.toLowerCase().match(/zh/g) ?  'chinese' : 'english' ;
    if(window.GLOBAL.NativeInfo){
        var nativeInfo = window.GLOBAL.NativeInfo() ;
        if(nativeInfo &&  typeof  nativeInfo === 'object'){
            endtype = Number(  nativeInfo.endtype );
            clientversion = Number(  nativeInfo.clientversion );
        }else if(endtypeUrlParams !== ""){
            endtype =  Number( endtypeUrlParams ) ;
            clientversion = window.GLOBAL.getUrlParams("clientversion") !=="" ? Number(window.GLOBAL.getUrlParams('clientversion') ) : 2018010200 ; //客户端的版本 为空赋值第一次添加的版本号
        }
    }else if(endtypeUrlParams !== ""){
        endtype =  Number( endtypeUrlParams ) ;
        clientversion = window.GLOBAL.getUrlParams("clientversion") !=="" ? Number(window.GLOBAL.getUrlParams('clientversion') ) : 2018010200 ; //客户端的版本
    }
    window.clientInfo.isClient = (endtype === 1 || endtype === 2) ;  //是否客户端
    window.clientInfo.endtype = endtype ;  //客户端的类型
    window.clientInfo.clientversion = clientversion ;  //客户端版本号
    window.checkClientUpdate = function ( callback , url , options ) {
        var WINDOWCLIENT = 1 , MACCLIENT = 0 ;
        url = url || getupdateinfoUrl ;
        options = options || {} ;
        if(!window.clientInfo.isClient && !(Number(window.clientInfo.endtype) === 0 && window.clientInfo.clientversion <= 2018011800)){
            console.error('checkClientUpdate must is client!') ;
            callback();
            return ;
        }

        if(window.clientInfo.endtype === 2){ //mac客户端暂时不检测
            console.warn('mac client is not checkClientUpdate!') ;
            callback();
            return ;
        }

        // 定制的企业，避免升级成标准版
        options.type = !(talk_window && talk_window.customcategory) ? (window.clientInfo.endtype === 1 ? WINDOWCLIENT : ( window.clientInfo.endtype === 2 ? MACCLIENT : undefined)): Number( talk_window.customcategory );
        options.version = clientversion;
        options.companydomain = talk_window && talk_window.companydomain ? talk_window.companydomain:"";
        if( options.type === undefined || !options.version ){
            console.warn('checkClientUpdate options.endtype or options.clientversion is not exist!') ;
            callback();
            return ;
        }


        // if( ! (window.clientInfo.endtype === 1 && Number(options.clientversion) >= 2018011700)  ){ //window客户端并且版本<2018011700
        //     console.warn('checkClientUpdate clientversion must  greater than or equal 2018011700!') ;
        //     callback();
        //     return ;
        // }

        //ajax
        var xhr  ;
        if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
            xhr = new XMLHttpRequest();
        } else {// code for IE6, IE5
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        for(var key in options){
            url += ("&"+key+"="+options[key]) ;
        }
        xhr.open('get', url );
        xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=utf-8");
        xhr.send();
        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4){
                return;
            }
            if(xhr.status === 200){
                var data = JSON.parse(xhr.responseText);
                if( Number(data.result) === -1 ){
                    callback();
                    return;
                }

                if(window.clientInfo.clientversion <= 2018011800 && talk_window && (Number(talk_window.customcategory) === 8 || Number(talk_window.customcategory) === 7)){
                    _talkWindowAbnormityCopy(callback  ,data.updateflag,data.updateaddr,data.setupaddr);
                }else{
                    if(!(talk_window && talk_window.updateClient)|| Number(talk_window.clientversion) < 2018122000){ //低版本
                        if(Number(data.updateflag)===1||(Number(data.updateflag)===2 && window.clientInfo.clientversion <= 2018122000)){ //并且是强制更新弹出手动安装包，自动下载升级
                            _talkWindowAbnormityCopy(callback  ,data.updateflag,data.updateaddr,data.setupaddr);
                        }else{ //直接进入房间
                            callback();
                        }
                    }else{
                        if(Number(data.updateflag)===2 && window.clientInfo.clientversion <= 2018122000){
                            isPopupWrapDivShow = true ;
                            isPopupDivShow = true ;
                            ispopupCancel = false ;
                            _createPopup(callback,data.updateflag,data.updateaddr,data.setupaddr);
                        }
                        if(Number(data.updateflag)===0 ){ //不需要更新
                            isPopupWrapDivShow = false ;
                            isPopupDivShow = false ;
                            ispopupCancel = false ;
                            callback()
                        }else if(Number(data.updateflag)===1){ //强制更新
                            isPopupWrapDivShow = true ;
                            isPopupDivShow = true ;
                            ispopupCancel = false ;
                            _createPopup(callback,data.updateflag,data.updateaddr,data.setupaddr);
                        }else if(Number(data.updateflag)===2){ //选择更新
                            isPopupWrapDivShow = true ;
                            isPopupDivShow = true ;
                            ispopupCancel = !(window.clientInfo.clientversion < 2018122000) ;
                            _createPopup(callback,data.updateflag,data.updateaddr,data.setupaddr);
                        }
                    }
                }
            }else{ //ajax失败
                callback();
            }
        }
    };
    //创建弹窗
    function _createPopup(callback , updateflag , updateaddr , setupaddr) {
        var publishDirFix = window.publishDirFix || "./" ;
        var PopupWrapDiv = document.createElement("div");
        PopupWrapDiv.style.background = "rgb(18, 26, 44)";
        PopupWrapDiv.style.position = "absolute";
        PopupWrapDiv.style.top = 0;
        PopupWrapDiv.style.left = 0;
        PopupWrapDiv.style.width = "100%";
        PopupWrapDiv.style.height = "100%";
        if(isPopupWrapDivShow){
            PopupWrapDiv.style.display = "block";
        }else{
            PopupWrapDiv.style.display = "none";
        }
        var PopupDiv = document.createElement("div");
        PopupDiv.style.width = "300px";
        PopupDiv.style.height = "400px";
        PopupDiv.style.position = "absolute";
        PopupDiv.style.left = 0;
        PopupDiv.style.right = 0;
        PopupDiv.style.top = 0;
        PopupDiv.style.bottom = 0;
        PopupDiv.style.background = "#5790ef";
        PopupDiv.style.borderRadius = "10px";
        PopupDiv.style.backgroundImage = "url("+publishDirFix+"/img/update_bg.jpg)";
        PopupDiv.style.backgroundRepeat = "no-repeat";
        PopupDiv.style.backgroundSize ="100% 100%";
        PopupDiv.style.margin = "auto";
        PopupDiv.style.zIndex = 99999999;
        PopupDiv.style.overflow = "hidden";
        PopupDiv.style.fontFamily = "Microsoft YaHei";
        if(isPopupDivShow){
            PopupDiv.style.display = "block";
        }else{
            PopupDiv.style.display = "none";
        }
        var popupMsgLeft = document.createElement("p");
        popupMsgLeft.style.width = "100%";
        popupMsgLeft.style.marginTop = "190px";
        popupMsgLeft.style.textAlign = "center";
        popupMsgLeft.style.fontSize = "25px";
        popupMsgLeft.style.fontWeight = "900";

        if(languageName === 'chinese'){
            popupMsgLeft.textContent = "发现新版本";
        }else{
            popupMsgLeft.textContent = "found new versions";
        }
        PopupDiv.appendChild(popupMsgLeft);
        var popupMsg = document.createElement("p");
        popupMsg.style.width = "80%";
        popupMsg.style.marginLeft = "10%";
        popupMsg.style.marginTop = "10px";
        popupMsg.style.fontSize = "14px";
        popupMsg.style.textAlign = "center";
        if(languageName === 'chinese'){
            if(Number( updateflag ) === 2){ //非强制
                popupMsg.textContent = "已有新版本可用，为了达到最佳使用体验，建议您立即完成版本升级。";
            }else if(Number( updateflag ) ===1){ //强制
                popupMsg.textContent = "已有新版本可用，为了获得完整的学习体验，请您立即完成版本升级。";
            } else if(Number( updateflag ) === 2&&window.clientInfo.clientversion <= 2018122000){
                popupMsg.textContent = "已有新版本可用，为了获得完整的学习体验，请您立即完成版本升级。";
            }
        }else{
            if(Number( updateflag ) === 2){ //非强制
                popupMsg.textContent = "A new version is available, and for the best use experience," +
                         " it is recommended that you complete the version upgrade immediately.";
            }else if( Number( updateflag ) === 1){ //强制
                popupMsg.textContent = "The new version is available, so to get the full learning experience, " +
                        "please do your version upgrade immediately.";
            }else if(Number( updateflag ) === 2&&window.clientInfo.clientversion <= 2018122000){
                popupMsg.textContent =  "The new version is available, so to get the full learning experience, " +
                "please do your version upgrade immediately.";
            }
        }
        PopupDiv.appendChild(popupMsg);
        var popupCancel = document.createElement("button");
        popupCancel.style.width = "20px";
        popupCancel.style.height = "20px";
        popupCancel.style.position = "absolute";
        popupCancel.style.right = "10px";
        popupCancel.style.top = "10px";
        popupCancel.style.backgroundImage = "url("+publishDirFix+"/img/update_cancel.png)";
        popupCancel.style.backgroundRepeat = "no-repeat";
        popupCancel.style.backgroundSize ="100% 100%";
        popupCancel.onclick = function(){
            PopupWrapDiv.style.display = "none";
            PopupDiv.style.display = "none";
            callback()
        };
        if(ispopupCancel){
            popupCancel.style.display = "block";
        }else{
            popupCancel.style.display = "none";
        }
        PopupDiv.appendChild(popupCancel);
        var popupAffirm = document.createElement("button");
        popupAffirm.style.width = "40%";
        popupAffirm.style.height = "10%";
        popupAffirm.style.position = "absolute";
        popupAffirm.style.left = "30%";
        popupAffirm.style.bottom = "10%";
        popupAffirm.style.backgroundImage = "url("+publishDirFix+"/img/update_affirm.jpg)";
        popupAffirm.style.backgroundRepeat = "no-repeat";
        popupAffirm.style.backgroundSize ="100% 100%";
        popupAffirm.style.fontSize ="16px";
        popupAffirm.style.color ="white";
        if(languageName === 'chinese'){
            popupAffirm.textContent = "立即升级";
        }else{
            popupAffirm.textContent = "Upgrade Now";
        }
        popupAffirm.onclick = function(){
            PopupWrapDiv.style.display = "none";
            PopupDiv.style.display = "none";
            var updateData = {};
            updateData.updateaddr = updateaddr;
            updateData.setupaddr = setupaddr;
            if(talk_window){
                talk_window.updateClient(updateData)  // 调取波波接口
            }else{
                console.error('talk_window is not exist!');
                if(callback && typeof callback === 'function'){
                    callback();
                }
            }
        };
        PopupDiv.appendChild(popupAffirm);
        PopupWrapDiv.appendChild(PopupDiv);
        document.getElementsByTagName("body")[0].appendChild(PopupWrapDiv);
    };

    //talk_window 异常找不到或者updateClient未定义 导致立即下载失败。兼容复制的版本
    function _talkWindowAbnormityCopy(callback , updateflag , updateaddr , setupaddr){
        var publishDirFix = window.publishDirFix || "./" ;
        var PopupWrapDiv = document.createElement("div");
        PopupWrapDiv.style.background = "rgb(18, 26, 44)";
        PopupWrapDiv.style.position = "absolute";
        PopupWrapDiv.style.top = 0;
        PopupWrapDiv.style.left = 0;
        PopupWrapDiv.style.width = "100%";
        PopupWrapDiv.style.height = "100%";
        var PopupDiv = document.createElement("div");
        PopupDiv.style.width = "100%";
        PopupDiv.style.height = "100%";
        PopupDiv.style.position = "absolute";
        PopupDiv.style.left = 0;
        PopupDiv.style.right = 0;
        PopupDiv.style.top = 0;
        PopupDiv.style.bottom = 0;
        PopupDiv.style.background = "#5790ef";
        if(Number(window.clientInfo.endtype) === 0 && window.clientInfo.clientversion <= 2018011800){
            PopupDiv.style.backgroundImage = "url("+publishDirFix+"/img/xxwjy_TV.jpg)";
        }else{
            PopupDiv.style.backgroundImage = "url("+publishDirFix+"/img/update_bg.jpg)";
        }

        PopupDiv.style.backgroundRepeat = "no-repeat";
        PopupDiv.style.backgroundSize ="100% 100%";
        PopupDiv.style.margin = "auto";
        PopupDiv.style.fontFamily = "Microsoft YaHei";
        PopupDiv.style.zIndex = 99999999;
        var popupMsgLeft = document.createElement("p");
        popupMsgLeft.style.width = "80%";
        popupMsgLeft.style.position = "absolute";
        popupMsgLeft.style.top = "50%";
        popupMsgLeft.style.left = "10%";
        popupMsgLeft.style.textAlign = "center";
        if(Number(window.clientInfo.endtype) === 0 && window.clientInfo.clientversion <= 2018011800){
            popupMsgLeft.style.fontSize ="25px";
        }else{
            popupMsgLeft.style.fontSize ="12px";
        }
        popupMsgLeft.style.fontWeight = "900";
        if(languageName === 'chinese'){
            popupMsgLeft.textContent = "您的当前版本过低，请手动下载安装客户端后进入教室";
        }else{
            popupMsgLeft.textContent = "Your current version is lower, please manually download " +
                "the installation client ,before enter the classroom";
        }
        PopupDiv.appendChild(popupMsgLeft);
        var popupUpdateAddless = document.createElement("p");
        popupUpdateAddless.style.width = "80%";
        popupUpdateAddless.style.position = "absolute";
        popupUpdateAddless.style.left = "10%";
        popupUpdateAddless.style.top = "65%";
        popupUpdateAddless.style.textAlign = "center";
        if(Number(window.clientInfo.endtype) === 0 && window.clientInfo.clientversion <= 2018011800){
            popupUpdateAddless.style.fontSize ="25px";
        }else{
            popupUpdateAddless.style.fontSize ="12px";
        }
        popupUpdateAddless.style.color = "#478be4";
        popupUpdateAddless.style.wordBreak = "break-all";
        popupUpdateAddless.textContent = setupaddr;
        PopupDiv.appendChild(popupUpdateAddless);
        var popupAffirm = document.createElement("button");
        popupAffirm.style.width = "40%";
        popupAffirm.style.height = "10%";
        popupAffirm.style.position = "absolute";
        popupAffirm.style.left = "30%";
        popupAffirm.style.bottom = "5%";
        popupAffirm.style.backgroundImage =  "url("+publishDirFix+"/img/update_affirm.jpg)";
        popupAffirm.style.backgroundRepeat = "no-repeat";
        popupAffirm.style.backgroundSize ="100% 100%";
        if(Number(window.clientInfo.endtype) === 0 && window.clientInfo.clientversion <= 2018011800){
            popupAffirm.style.fontSize ="25px";
        }else{
            popupAffirm.style.fontSize ="12px";
        }
        popupAffirm.style.color ="white";
        popupAffirm.style.border ="none";
        // if(languageName === 'chinese'){ //todo 此版本暂时不用，下版本还原
        //     popupAffirm.textContent = "立即下载";
        // }else{
        //     popupAffirm.textContent = "Download Now";
        // }
        if(languageName === 'chinese'){
            popupAffirm.textContent = "复制连接";
        }else{
            popupAffirm.textContent = "Copy Link";
        }
        popupAffirm.onclick = function() {
            // PopupWrapDiv.style.display = "none";  //todo 此版本暂时不用，下版本还原
            // PopupDiv.style.display = "none";
            // var updateData = {};
            // updateData.setupaddr = setupaddr;
            // if(talk_window){
            //     talk_window.updateClient(updateData)  // 调取波波接口
            // }else{
            //     console.error('talk_window is not exist!');
            //     if(callback && typeof callback === 'function'){
            //         callback();
            //     }
            // }
            if (talk_window) {
                var oInput = document.createElement('input');
                if(languageName === 'chinese'){
                    popupAffirm.textContent = "已复制";
                }else{
                    popupAffirm.textContent = "Copied";
                }
                oInput.value = setupaddr;
                document.body.appendChild(oInput);
                oInput.select(); // 选择对象
                document.execCommand("Copy"); // 执行浏览器复制命令
                oInput.style.display='none';
            } else {
                console.error('talk_window is not exist!');
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        }
        PopupDiv.appendChild(popupAffirm);
        PopupWrapDiv.appendChild(PopupDiv);
        document.getElementsByTagName("body")[0].appendChild(PopupWrapDiv);
    }
})();
