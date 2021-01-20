const utils = {
  isFunction: (functionToCheck) => {
    if(functionToCheck && {}.toString.call(functionToCheck) === '[object Function]'){
      return true;
    }
    console.error(e + 'is not a function')
    return false;
  },

  isArray: (arrayToCheck) => {
    if (Array.isArray){
      if(Array.isArray(arrayToCheck)){
        return true;
      }else{
        console.error(arrayToCheck + 'is not a Array')
        return false;
      }
    }else{
      if( Object.prototype.toString.call( arrayToCheck ) === '[object Array]' ) {
        return true;
      }
      console.error(arrayToCheck + 'is not a Array')
      return false;
    }
  },

  compose: (...funcs) => {
    if (funcs.length === 0) {
      return arg => arg 
    }
    if (funcs.length === 1) {
      return funcs[0]
    }
    return funcs.reduce((a, b) => (...args) => a(b(...args)))
  }
}

export default utils;