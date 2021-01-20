/**
 * video Dumb组件
 * @module VideoDumb
 * @description   提供 Video显示区组件
 * @author xiagd
 * @date 2017/08/10
 */

'use strict';
import React  from 'react';
import ServiceRoom from "../../services/ServiceRoom";
import TkGlobal from 'TkGlobal';

class VideoDumb extends React.Component{
    constructor(props){
        super(props);
    };

    componentDidMount(){
       let {stream,myUserId,volume} = this.props;
        if( stream.mediaFlagObj.videoFlag){
            ServiceRoom.getTkRoom().playVideo(stream.extensionId, this.props.videoDumbElementIdPrefix + stream.extensionId, {
                mirror: this.props.isMirror,
                loader: this.props.loader,
                mode: this.props.mode
            });
        }
        if (stream.extensionId !== myUserId) {
            if(stream.mediaFlagObj.audioFlag){
                ServiceRoom.getTkRoom().playAudio(stream.extensionId, this.props.videoDumbElementIdPrefix + stream.extensionId);
                this._changeVolume(volume);
            }
        }
    };

    componentWillUnmount() { //组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
        if(this.props.stream.extensionId !== this.props.myUserId){
            ServiceRoom.getTkRoom().unplayAudio(this.props.stream.extensionId);
        }
        ServiceRoom.getTkRoom().unplayVideo(this.props.stream.extensionId);
    };

    componentDidUpdate(prevProps, prevState){
        let {stream,mode,loader,isMirror,videoDumbElementIdPrefix,myUserId,user} = this.props;
        if(stream !== undefined && stream !== null && stream.mediaFlagObj && prevProps.stream.mediaFlagObj){
            if(stream.extensionId !== myUserId) {
                if(prevProps.stream.mediaFlagObj.audioFlag !== stream.mediaFlagObj.audioFlag){
                    if(stream.mediaFlagObj.audioFlag){
                        ServiceRoom.getTkRoom().playAudio(stream.extensionId, videoDumbElementIdPrefix + stream.extensionId);
                        this._changeVolume(this.props.volume);
                    }else{
                        ServiceRoom.getTkRoom().unplayAudio(stream.extensionId);
                    }
                }
            }
            if(prevProps.stream.mediaFlagObj.videoFlag !== stream.mediaFlagObj.videoFlag){
                if(stream.mediaFlagObj.videoFlag){
                    ServiceRoom.getTkRoom().playVideo(stream.extensionId, videoDumbElementIdPrefix + stream.extensionId, {
                        mirror: isMirror,
                        loader: loader,
                        mode: mode
                    });
                }else{
                    ServiceRoom.getTkRoom().unplayVideo(stream.extensionId)
                }
            }
        }
        if(stream.mediaFlagObj.videoFlag && isMirror !== undefined && isMirror !== null ){
            if(prevProps.isMirror !== isMirror && stream ){
                ServiceRoom.getTkRoom().updateVideoPlayerOptions({mirror:isMirror},stream.extensionId)
            }
        }
        if(stream.mediaFlagObj.audioFlag && this.props.volume !== undefined && this.props.volume !== null ){
            if(prevProps.volume !== this.props.volume){
                this._changeVolume(this.props.volume);
            }
        }
    }

    _changeVolume(volume){
        let {stream,myUserId} = this.props;
        if(this.props.changeVolumeJurisdiction){
            if(volume !== undefined && typeof volume === 'number' && stream.extensionId && myUserId && (stream.extensionId !== myUserId)){
                ServiceRoom.getTkRoom().setRemoteAudioVolume(volume,this.props.stream.extensionId)
            }
        }
    }

    render(){
        return (
            <div className={'video-box ' +this.props.videoDumbElementIdPrefix} id={this.props.videoDumbElementIdPrefix+this.props.stream.extensionId} />
        )
    };
};

export  default  VideoDumb ;