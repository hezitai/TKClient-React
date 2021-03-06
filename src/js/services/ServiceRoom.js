/**
 * 房间服务
 * @module ServiceRoom
 * @description  提供 房间相关的服务
 * @author QiuShao
 * @date 2017/08/07
 */
const ServiceRoom = function () {
    let tkRoom;
    let roomName;
    let userName;
    let localStream;
    let userThirdid;
    let tkWhiteBoardManager;

    this.getTkRoom = function () {
        return tkRoom;
    };

    this.getRoomName = function () {
        return roomName;
    };

    this.setTkRoom = function (value) {
        tkRoom = value;
    };

    this.setRoomName = function (value) {
        roomName = value;
    };

    this.getLocalStream = function () {
        return localStream;
    };

    this.setLocalStream = function (value) {
        localStream = value;
    };

    this.getUserName = function () {
        return userName;
    };

    this.setUserName = function (value) {
        userName = value;
    };

    this.getUserThirdid = function () {
        return userThirdid;
    };

    this.setUserThirdid = function (value) {
        userThirdid = value;
    };
    this.getTkWhiteBoardManager = function () {
        return tkWhiteBoardManager;
    };
    this.setTkWhiteBoardManager = function (value) {
        tkWhiteBoardManager = value;
    };
    this.getNativeInterface = function () {
        if(tkRoom && tkRoom.getNativeInterface){
            return tkRoom.getNativeInterface() ;
        }
    };

    this.clearAll = function(){
        tkRoom = null ;
        roomName = null ;
        userName = null ;
        localStream = null ;
        userThirdid = null ;
        // tkWhiteBoardManager = null;
    }
} ;
export default new ServiceRoom() ;

