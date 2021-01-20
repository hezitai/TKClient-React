/*拓课自定义工具
@author 邱少
@data 20180111
* */
window.GLOBAL = window.GLOBAL || {} ;
window.GLOBAL.loadScript =  window.GLOBAL.loadScript || function (url, callback , options ) {
        if(!url){
            return ;
        }
        var loadJs = document.getElementById('tkLoadJs') || document.body ;
        options = options && typeof options === 'object' ? options : {};
        if(options.reload){
            console.warn('Reload file , file url is '+ url +' , options is '+JSON.stringify(options) )
        }
        var script = document.createElement("script");
        script.type = options.type !== undefined ? options.type : "text/javascript";
        if(options.async){
            script.async = true ;
        }
        // script.async = options.async !== undefined ? options.async : false ;
        script.charset = options.charset !== undefined ? options.charset :  "UTF-8";
        if( typeof(callback) != "undefined"  && typeof callback === 'function' ){
            script.onload = function () {
                console.info('js file load success , file url is '+ url +' , options is '+JSON.stringify(options) );
                callback();
            };
            script.onerror = function () {
                console.error('js file load fail , file url is '+ url +' , options is '+JSON.stringify(options) );
                if(!options.reload){
                    script.removeAttribute('async');
                    loadJs.removeChild(script);
                    options.async = false ;
                    options.reload = true ;
                    window.GLOBAL.loadScript(url, callback , options);
                }
            }
      /*      if (script.readyState) {
                script.onreadystatechange = function () {
                    if (script.readyState == "loaded" || script.readyState == "complete") {
                        script.onreadystatechange = null;
                        callback();
                    }
                };
            } else {
                script.onload = function () {
                    callback();
                };
            }*/
        }
        script.src = url;
        loadJs.appendChild(script);
    };
window.GLOBAL.loadStyle = window.GLOBAL.loadStyle || function (url,options){
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = url;
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(link);
} ;
window.GLOBAL.getUrlParams = window.GLOBAL.getUrlParams || function(key , url){
    /*charCodeAt()：返回指定位置的字符的 Unicode 编码。这个返回值是 0 - 65535 之间的整数。
     fromCharCode()：接受一个指定的 Unicode 值，然后返回一个字符串。
     encodeURIComponent()：把字符串作为 URI 组件进行编码。
     decodeURIComponent()：对 encodeURIComponent() 函数编码的 URI 进行解码。*/
    var  href = url ||  window.location.href;
    // var urlAdd = decodeURI(href);
    var urlAdd = decodeURIComponent(href);
    var urlIndex = urlAdd.indexOf("?");
    var urlSearch = urlAdd.substring(urlIndex + 1);
    var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)", "i");   //reg表示匹配出:$+url传参数名字=值+$,并且$可以不存在，这样会返回一个数组
    var arr = urlSearch.match(reg);
    if(arr != null) {
        return arr[2];
    } else {
        return "";
    }
} ;
window.GLOBAL.NativeInfo = function () {
    try{
        var that = {};
        that = talk_window;
        return that;
    }catch(e){
        return null;
    };
};