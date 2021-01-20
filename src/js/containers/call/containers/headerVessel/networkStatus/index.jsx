/**
 * 网络状态Smart组件
 * @module NetworkStatusSmart
 * @description   承载网络状态Smart组件
 * @date 2018/11/19
 */

"use strict";
import React from "react";
import eventObjectDefine from "eventObjectDefine";
import TkConstant from "TkConstant";
import TkGlobal from "TkGlobal";
import ServiceRoom from "ServiceRoom";
import "../../../../../../css/cssNetwordStatus.css";

class NetworkStatusSmart extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			networkStatus: {
				rtt: 0, //延时
				packetsLost: 0, //丢包率(%)
				kbps: 0, //带宽
				frameRatio: { frameWidth: 0, frameHeight: 0 }, //分辨率
				frameRate: 0 //帧率
			},
            show: false,
            showCB:false,
            showAw:false,
            showBingo:false,
            showAfterBingoAlert:false,
		};
		this.isSendNetworkDelay = 0;
		this.listernerBackupid = new Date().getTime() + "_" + Math.random();
	}
	componentDidMount() {
		//在完成首次渲染之前调用，此时仍可以修改组件的state
		eventObjectDefine.CoreController.addEventListener(
			TkConstant.EVENTTYPE.RoomEvent.roomUsernetworkstateChanged,
			this.UsernetworkstateChanged.bind(this),
			this.listernerBackupid
		);
		eventObjectDefine.CoreController.addEventListener(
			TkConstant.EVENTTYPE.RoomEvent.roomUservideostateChanged,
			this._controlRemoteStreamChange.bind(this),
			this.listernerBackupid
		);
		eventObjectDefine.CoreController.addEventListener(
			TkConstant.EVENTTYPE.RoomEvent.roomUseraudiostateChanged,
			this._controlRemoteStreamChange.bind(this),
			this.listernerBackupid
		);
	}
	componentWillUnmount() {
		//组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
		const that = this;
		clearInterval(this.sendNetworkDelayInterval);
		eventObjectDefine.CoreController.removeBackupListerner(
			that.listernerBackupid
		);
	}
	UsernetworkstateChanged(recvEventData) {
		let { message } = recvEventData;
		if (message.userId === ServiceRoom.getTkRoom().getMySelf().id) {
			let { networkStatus } = message;
			let tidyNetworkStatus = {
				frameRate: networkStatus.video.frameRate,
				frameRatio: {
					frameWidth: networkStatus.video.frameWidth,
					frameHeight: networkStatus.video.frameHeight
				},
				kbps: networkStatus.video.bitsPerSecond,
				packetsLost: networkStatus.video.packetsLostRate,
				rtt: networkStatus.video.currentDelay
			};
			this.setState({ networkStatus: tidyNetworkStatus }, () => {
				eventObjectDefine.CoreController.dispatchEvent({
					type: "handleTestSystemInfo",
					message: { data: this.state }
				});
			});
		}
	}

	_controlRemoteStreamChange(recvEventData) {
		let { message } = recvEventData;
		if (message.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE) {
			if (message.userId === ServiceRoom.getTkRoom().getMySelf().id) {
				this.setState({ show: false });
				//传递网络状态给设备检测组件：
				eventObjectDefine.CoreController.dispatchEvent({
					type: "handleTestSystemInfo",
					message: { data: this.state }
				});
				//清除发送网络状态的定时器，删除这条信令：
				clearInterval(this.sendNetworkDelayInterval);
			}
		} else {
			if (message.userId === ServiceRoom.getTkRoom().getMySelf().id) {
				this.setState({ show: true });
				//传递网络状态给设备检测组件：
				eventObjectDefine.CoreController.dispatchEvent({
					type: "handleTestSystemInfo",
					message: { data: this.state }
				});
			}
		}
	}
    
    
	/*获取网络状态:优、良好、一般、*/
	_getNetworkText(packetsLost, rtt, kbps) {
		let networkText = "";
		let networkStyle = undefined;
		if (packetsLost <= 1) {
			networkText = 'https://classbro-oss.oss-cn-hongkong.aliyuncs.com/statice-resource/20190122/08f7293251b14a378a3b251a21247f1f.png'
				// TkGlobal.language.languageData.networkStatus.network.value.excellent;
		} else if (packetsLost <= 5) {
			networkText = 'https://classbro-oss.oss-cn-hongkong.aliyuncs.com/statice-resource/20190122/48797849c9724724b87d1e584e40d6a7.png'
				// TkGlobal.language.languageData.networkStatus.network.value.well;
		} else if (packetsLost <= 10) {
			networkText = '	https://classbro-oss.oss-cn-hongkong.aliyuncs.com/statice-resource/20190122/345761e557aa4e7a8ca6e7bfe59ba15b.png'
				// TkGlobal.language.languageData.networkStatus.network.value.general;
			networkStyle = { color: "#ff8b2b" };
		} else {
			networkText = 'https://classbro-oss.oss-cn-hongkong.aliyuncs.com/statice-resource/20190122/3b68fb494b184a94b4b89f32de05bbae.png'
				// TkGlobal.language.languageData.networkStatus.network.value.suck;
			// networkStyle = { color: "#ff021d" };
		}
		return {
			networkText: networkText,
			networkStyle: networkStyle
		};
	}

	render() {
		let that = this;
		let { networkStatus = {}, show } = that.state;
		let { rtt, packetsLost, kbps } = networkStatus;
		let { networkText, networkStyle } = that._getNetworkText(
			packetsLost,
			rtt,
			kbps
		);
		return (
			<div
				id="network_status_container"
				className="network-status-container add-position-relative add-fl"
			>
				{/*网络状态容器*/}
				{TkConstant.joinRoomInfo.networkstate && TkConstant.hasRole.roleStudent ? ( //学生端不显示网络状态
					undefined
				) : (
					<label>
						{/* <span className="rtt-container">
							<span className="title">
								{TkGlobal.language.languageData.networkStatus.rtt.title.text}
							</span>
							:<span className="value">{rtt}ms</span>
						</span> */}
						<span className="packetsLost-container">
							<span className="title">
								{TkGlobal.language.languageData.networkStatus.packetsLost.title.text}
							</span>
							:<span className="value">{packetsLost}%</span>
						</span>
					</label>
                )}
                
				<span className="network-container">
					<span className="title">
						{TkGlobal.language.languageData.networkStatus.network.title.text}
					</span>
					:
					<span className="value" style={networkStyle} title={rtt + '毫秒'}>
                        {/* {networkText} */}
                        <img src={networkText} alt="" style={{width:'.12rem',height:'.12rem'}} />
					</span>
				</span>
                
                {/* 中央logo--ByTyr*/}
                {/*  onClick={this.showH5Lesson.bind(this)} */}
                
                <div className='center-logo'></div>
			</div>
		);
	}
}
export default NetworkStatusSmart;
