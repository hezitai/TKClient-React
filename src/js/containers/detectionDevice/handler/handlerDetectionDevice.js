/**
 * 检测组件用到的方法类
 * @class HandlerDetectionDevice
 * @description  用于提供检测设备用到的方法
 * @author QiuShao
 * @date 2017/08/18
 */
class HandlerDetectionDevice {
    /*audiooutput设备切换的处理函数*/
    audioOutputChangeHandler({deviceId , setSinkIdParentElementId }) {
        if( !(TK.isTkNative && TK.subscribe_from_native) ){
            let audiooutputDeviceId = deviceId;
            if (audiooutputDeviceId !== undefined && audiooutputDeviceId !== null) { //更换输出设备
                let audioElemetArray = document.getElementById(setSinkIdParentElementId).getElementsByTagName('audio') ;
                if(audioElemetArray && audioElemetArray.length>0){
                    TK.DeviceMgr.associateElementsToSpeaker(Array.from(audioElemetArray) , audiooutputDeviceId );
                }
            }
        }
    };

	audioSourceChangeHandlerFrom({deviceId , audioinputAudioElementId , audioinputVolumeContainerId} = {}){
        TK.DeviceMgr.startMicrophoneTest(deviceId,audioinputAudioElementId,function (instant) {
            instant=instant*(16/100)/16;
            let $audioVolumeElement = $("#" + audioinputVolumeContainerId);
            if($audioVolumeElement && $audioVolumeElement.length>0){
                let volumeIndex = Math.floor(instant * 16);
                $audioVolumeElement.find("li").removeClass("yes").filter(":lt(" + volumeIndex + ")").addClass("yes");
            }
        })
	}

    /*枚举设备信息*/
    enumerateDevices(callback){
        TK.DeviceMgr.getDevices(callback);
    };

    /*
     * 是否需要进行页面设备检测
     * @method checkNeedDetectionDevice
     * */
    checkNeedDetectionDevice(callback) {
        const that = this ;
        const _enumerateDevicesCallbakc = (deviceInfo) => {
            try {
                let needDetection = true; //默认需要检测
                L.Logger.debug("checkNeedDetectionDevice deviceInfo：", deviceInfo);
                let audioinputDeviceId = L.Utils.localStorage.getItem(L.Constant.deviceStorage.audioinput);
                let audiooutputDeviceId = L.Utils.localStorage.getItem(L.Constant.deviceStorage.audiooutput);
                let videoinputDeviceId = L.Utils.localStorage.getItem(L.Constant.deviceStorage.videoinput);
                if (!( deviceInfo.hasdevice.audioinput && deviceInfo.hasdevice.audiooutput && deviceInfo.hasdevice.videoinput )
                    || !( deviceInfo.useDevices.audioinput === audioinputDeviceId && deviceInfo.useDevices.audiooutput === audiooutputDeviceId && deviceInfo.useDevices.videoinput === videoinputDeviceId  )) {
                    //三种设备有任何一个没有或者三种设备有任何一个设备id和缓存中的id不一样 ， 则需要检测界面
                    needDetection = true;
                } else {
                    needDetection = false;
                }
                if (callback && typeof callback === 'function') {
                    callback(needDetection);
                }
            } catch (e) {
                L.Logger.error("TK  enumerateDevices error:", e);
            }
        };
        let paramsJson = {isSetlocalStorage: false};
        that.enumerateDevices( _enumerateDevicesCallbakc, paramsJson );
    };

}

const HandlerDetectionDeviceInstance = new HandlerDetectionDevice();
export default HandlerDetectionDeviceInstance ;


