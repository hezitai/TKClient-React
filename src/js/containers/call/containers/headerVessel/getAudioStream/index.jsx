let recorder;
let audio_context;
import React from 'react';
import TkGlobal from 'TkGlobal';
import TkConstant from 'TkConstant';
import ServiceRoom from "ServiceRoom";
// import { Recorder } from './../../../../../utils/recorder';
export default class Record extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }

    }
    componentDidMount(){
        let getUserMedia_1 = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia)
        getUserMedia_1.call(navigator,{audio: true}, this.startUserMedia, function(e) {
            console.log('No live audio input: ' + e)
        });

    }
    // 初始化录音功能
    startUserMedia = (stream) => {
        audio_context = new AudioContext
        var input = audio_context.createMediaStreamSource(stream)
        recorder = new Recorder(input)
    }
    // 开始录音
    startRecording = () => {
        recorder && recorder.record()
    }
    // 停止录音
    stopRecording = () => {
        recorder && recorder.stop()
        this.createDownloadLink()
        recorder.clear() // 清楚录音，如果不清除，可以继续录音
    }
    // 生成文件
    createDownloadLink = () => {
        recorder && recorder.exportWAV((blob) => {
            console.log(blob)
            this.setState({
                fileDataBlob: blob
            })
            if(!blob){
                console.log('无录音文件')
                return false;
            }else{
                var url = URL.createObjectURL(blob); // 生成的录音文件路径，可直接播放
            }
        });
    }
}