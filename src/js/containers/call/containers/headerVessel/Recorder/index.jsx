let recorder;
let audio_context;
import React from "react";
import Recorder from "./recorder.js";
export default class Record extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
		this.props.onRef(this);
    }
    componentDidMount() {
        let getUserMedia_1 =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;
        getUserMedia_1.call(
        navigator,
        { audio: true },
        this.startUserMedia,
        function(e) {
            console.log("No live audio input: " + e);
        }
        );
    }
    // 初始化录音功能
    startUserMedia = stream => {
        audio_context = new AudioContext();
        var input = audio_context.createMediaStreamSource(stream);
        recorder = new Recorder(input);
    };
    // 开始录音
    startRecording = () => {
        recorder && recorder.record();
    };
    // 停止录音
    stopRecording = () => {
        recorder && recorder.stop();
        this.createDownloadLink();
        recorder.clear(); // 清楚录音，如果不清除，可以继续录音
    };
    // this.props.onRef(this);
    // 生成文件
    createDownloadLink = () => {
        let that = this;
        recorder && recorder.exportWAV(blob => {
            console.log(blob);
            this.setState({
            fileDataBlob: blob
            });
            let url;
            if (!blob) {
            console.log("Do not get AudioFiles");
            url = '';
            return false;
            } else {
            url = URL.createObjectURL(blob); // 生成的录音文件路径，可直接播放
            }
            console.log(url);
            window.classbroBlob = url;
            // $.ajax
            console.log(window);
            // that.props.setFatherData(url);
        });
    };

  render() {
        let that = this;
        return (
        <div style={{position:'fixed',top:'.01rem',right:'6rem'}}>
            {/* <button onClick={that.startRecording} style={{border:'1px solid #555' ,marginLeft:'.22rem'}}>开始</button>
            <button onClick={that.stopRecording} style={{border:'1px solid #555' ,marginLeft:'.22rem'}}>结束</button> */}
        </div>
        )
  }
}
