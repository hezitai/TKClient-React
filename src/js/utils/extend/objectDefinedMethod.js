'use strict';
'use strict';
const _isJson = function(obj){
    let isjson = typeof obj === "object" && Object.prototype.toString.call(obj).toLowerCase() === "[object object]" && !obj.length;
    return isjson;
};

if( !( Object && Object.shallowAssign ) || !( Object && Object.customAssign ) ){
    /*浅合并对象*/
    const shallowAssign = function(source) {
        try{
            return Object.assign.apply(Object.assign ,arguments );
        }catch (err){
            let copySource = source;
            for(let i=1 ; i<arguments.length;i++){
                let assignObj = arguments[i];
                if(assignObj && typeof assignObj === 'object'){
                    for(let key in assignObj){
                        copySource[key] = assignObj[key] ;
                    }
                }
            }
            /* if(typeof copySource === 'object'){
                 for(let key in copySource){
                     source[key] = copySource[key];
                 }
             }*/
            return source ;
        }
    };
    if( !( Object && Object.shallowAssign ) ){
        Object.shallowAssign = shallowAssign ;
    }
    if( !( Object && Object.customAssign ) ){
        Object.customAssign = shallowAssign ;
    }
}

if( !( Object && Object.deepAssign ) ){
    /*深合并对象*/
    Object.deepAssign = function(source) {
        let copySource = source;
        for(let i=1 ; i<arguments.length;i++){
            let assignObj = arguments[i];
            if(assignObj && typeof assignObj === 'object'){
                for(let key in assignObj){
                    if( copySource[key] === undefined ){
                        if( typeof assignObj[key] === 'object' && ( Array.isArray( assignObj[key] )  ||   _isJson( assignObj[key] ) ) ){
                            copySource[key] = Object.deepAssign( Array.isArray( assignObj[key] )? [] : {} , assignObj[key] );
                        }else{
                            copySource[key] = assignObj[key] ;
                        }
                    }else{
                        if(typeof assignObj[key] === 'object' && (  Array.isArray( assignObj[key] )  ||   _isJson( assignObj[key] ) ) ){
                            copySource[key] = Object.deepAssign( Array.isArray( assignObj[key] )? [] : {} , typeof copySource[key] === 'object' ? copySource[key] : ( Array.isArray( assignObj[key] )? [] : {} ) , assignObj[key]);
                        }else{
                            copySource[key] = assignObj[key] ;
                        }
                    }
                }
            }
        }
        /*if(typeof copySource === 'object'){
            for(let key in copySource){
                source[key] = copySource[key];
            }
        }*/
        return source ;
    };
}