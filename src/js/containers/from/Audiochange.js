import React, { Component } from 'react';
import ServiceRoom from 'ServiceRoom';
import TkGlobal from 'TkGlobal';
import TkConstant from "TkConstant";
export default class Audiochange extends Component{
    constructor(){
           super();
       };
    componentDidMount(){
        if(!this.props.stream){
            return;
        }
        let Audiochange = document.getElementById('Audiochange'+this.props.stream.extensionId);
        try {
            if(this.props.stream && Audiochange){
                ServiceRoom.getTkRoom().registerAudioVolumeListener(this.props.stream.extensionId,80,(vol)=>{
                    Audiochange.style.width = vol/20 +"rem";
                },()=>{L.Logger.error('registerAudioVolumeListener error')})
            }
        } catch (e) {
            L.Logger.error('!Your browser does not support SoundMeterInstance , error info:' , e);
        }
    };

    componentWillUnmount(){
         ServiceRoom.getTkRoom().unregisterAudioVolumeListener(this.props.stream.extensionId)
    }

    render(){
        return(
            <div style={{display: "block"}} className="Audiochange "   id={'Audiochange'+ (this.props.stream ?  this.props.stream.extensionId : '')}></div>
        )
    };
}