import React from 'react';
import TkGlobal from "TkGlobal";
import SwitchLayout from "@/SwitchLayout";
import eventObjectDefine from "eventObjectDefine";
export default class SwitchLayoutBtn extends React.Component{

    constructor() {
        super();
        this.state = {
            streams: []
        };
        this.listernerBackupid = new Date().getTime() + "_" + Math.random();
    }

    componentDidMount() {
        eventObjectDefine.CoreController.addEventListener(TkConstant.EVENTTYPE.RoomEvent.roomUseraudiostateChanged,this._controlRemoteStreamFlag.bind(this,'Video'), this.listernerBackupid);
    }

    _controlRemoteStreamFlag(type, data) {
        let { message: msg } = data;
        let streams = JSON.parse(JSON.stringify(this.state.streams));
        let index = streams.findIndex(stream => stream.userId === data.message.userId);
        if (msg.type !== "video") {
            return ;
        }
        if (msg.publishstate !== 0) {
            if (index === -1) {
                streams.push({
                    userId: msg.userId,
                });
            }
        } else if (msg.publishstate === 0 && index !== -1) {
            streams.splice(index, 1);
        }
        this.setState({
            streams
        });
    }

    render(){
        const {buttonClick,layoutActive} = this.props;
        const { streams } = this.state;
        let {RightContentVesselSmartStyleJson ={}} = TkGlobal.systemStyleJson ;
        return(
            <div>
                <div className={`Tk-header-icon icon-switchLayout ${layoutActive ? 'active' : ''} `} onClick={buttonClick} title={TkGlobal.language.languageData.layoutInfo.layout}>
                    <SwitchLayout streamLen={streams.length} />   {/*切换布局组件 */}
                </div>
                <div 
                    className="mask2"  
                    onClick={buttonClick} 
                    style={{ display:  layoutActive ? "block" : "none" , height: RightContentVesselSmartStyleJson.height }} />
            </div>
        )
    }
}