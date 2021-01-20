/*弹出框 组件*/
"use strict";
import "./static/index.css";
import "./static/index_black.css";
import TkGlobal from "TkGlobal";
import React from "react";
import eventObjectDefine from "eventObjectDefine";
import ServiceRoom from "ServiceRoom";
import TkConstant from "TkConstant";
import staricongrey from "../../../../src/img/startempty.svg";
import stariconblue from "../../../../src/img/startfull.svg";

class LxNotification extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			alert: {
				isShow: false,
				ok: "",
				type: ""
			},
			confirm: {
				isShow: false
			},
			isHasClassCenter: false,
			title: "",
			message: "",
			callback: null,
			//接到页面传过来的值
			//因为当前页面显示五颗星，而分数是十分所以要去平均值，
			num: this.props.name / 2,
			//根据页面当中的星星的数量来设置默认值
			arr: [1, 2, 3, 4, 5],
			clickIndex: 0,
			hoverIndex: 0
		};
		this.listernerBackupid = new Date().getTime() + "_" + Math.random();
		this.getStar = this.getStar.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.handleOnMouseEnter = this.handleOnMouseEnter.bind(this);
		this.handleOnMouseOut = this.handleOnMouseOut.bind(this);
		this.changeMarkingScore = this.changeMarkingScore.bind(this);
	}

	handleClick(index) {
		this.setState({
			clickIndex: index
		});
		this.changeMarkingScore(index);
	}

	handleOnMouseEnter(index) {
		this.setState({
			hoverIndex: index
		});
	}

	handleOnMouseOut() {
		this.setState({
			hoverIndex: 0
		});
		console.log(this.state.clickIndex);
	}

	changeMarkingScore(index) {
		let item = {
			module: this.props.data,
			score: index
		};
	}

	getStar() {
		let num =
			this.state.hoverIndex === 0 ? this.state.clickIndex : this.state.hoverIndex;
		let starContainer = [];
		const arr = [1, 2, 3, 4, 5];
		arr.map((ele, index) => {
			starContainer.push(
				<span
					key = {index}
					className="staricon"
					onClick={this.handleClick.bind(this, ele)}
					onMouseEnter={this.handleOnMouseEnter.bind(this, ele)}
					onMouseOut={this.handleOnMouseOut.bind(this)}
				>
					{ele > num ? (
						<img src={staricongrey} style={{ width: ".44rem", margin: ".1rem" }} />
					) : (
						<img src={stariconblue} style={{ width: ".44rem", margin: ".1rem" }} />
					)}
				</span>
			);
		});
		return starContainer;
	}

	componentDidMount() {
		//在完成首次渲染之前调用，此时仍可以修改组件的state
		const that = this;
		eventObjectDefine.CoreController.addEventListener(
			"showAlert",
			that.showAlert.bind(that),
			that.listernerBackupid
		);
		eventObjectDefine.CoreController.addEventListener(
			"showConfirm",
			that.showConfirm.bind(that),
			that.listernerBackupid
		);
		eventObjectDefine.CoreController.addEventListener(
			"showInputTooltip",
			that.showInputTooltip.bind(that),
			self.listernerBackupid
		); //added by R37
	}
	componentWillUnmount() {
		//组件被移除之前被调用，可以用于做一些清理工作，在componentDidMount方法中添加的所有任务都需要在该方法中撤销，比如创建的定时器或添加的事件监听器
		eventObjectDefine.CoreController.removeBackupListerner(
			this.listernerBackupid
		);
	}
	alertCloseClick(callback) {
		this.setState({
			isHasClassCenter: false,
			alert: { isShow: false },
			confirm: { isShow: false }
		});
		callback(true);
	}
	confirmClick(callback) {
		//同意
		let data = {
			text: this.refs.subNode_1 ? this.refs.subNode_1.value : undefined,
			href: this.refs.subNode_2 ? this.refs.subNode_2.value : undefined
		};
		this.setState({
			isHasClassCenter: false,
			alert: { isShow: false },
			confirm: { isShow: false }
		});
		// confirm按钮点击事件会根据content类型的不同而传递不同个数的参数
		// 如果是message类的content，只传递boolean类型的参数
		// 如果是editable类的content，除了boolean类型的参数，还会传递输入框内的数据
		callback(true, data);
	}
	// 教室评价-classbro--ByTyr
	alertCloseClick1(callback) {
		this.setState({	
			isHasClassCenter: false,
			alert: { isShow: false },
			confirm: { isShow: false }
		});
		let evaluate = this.state.clickIndex;
		
		let tk = window.GLOBAL.ClassBroToken;
		let classroomId = TkConstant.joinRoomInfo.serial;
		$.ajax({
			type: "POST",
			url: "https://test.classbro.com/api/student/course/evaluationClassRoom",
			// url: 'https://www.classbro.com/api/student/course/evaluationClassRoom',
			headers: {
				contentType: "application/json",
				token: tk
			},
			data: {
				roomId: classroomId,
				rate: evaluate
			},
			success: function(r) {
				if (r.status == 200) {
					alert("评价成功");
				} else if (r.status == 400) {
					alert(r.body.msg);
				} else {
					alert("评价失败");
				}
			},
			error: function() {
				alert("评价失败");
			}
		});
       
        callback(true);
	}
	alertCloseClick2(callback) {
		this.setState({
			isHasClassCenter: false,
			alert: { isShow: false },
			confirm: { isShow: false }
		});
		callback(true);
	}
	confirmClick1(callback) {
		//同意
		let data = {
			text: this.refs.subNode_1 ? this.refs.subNode_1.value : undefined,
			href: this.refs.subNode_2 ? this.refs.subNode_2.value : undefined
		};
		this.setState({
			isHasClassCenter: false,
			alert: { isShow: false },
			confirm: { isShow: false }
		});
		// confirm按钮点击事件会根据content类型的不同而传递不同个数的参数
		// 如果是message类的content，只传递boolean类型的参数
		// 如果是editable类的content，除了boolean类型的参数，还会传递输入框内的数据
		callback(true, data);
	}
	cancelClick(callback) {
		//不同意
		this.setState({
			isHasClassCenter: false,
			alert: { isShow: false },
			confirm: { isShow: false }
		});
		callback(false);
	}
	showAlert(handleData) {
		let { title, message, ok, callback, type } = handleData.message.data;
		this.setState({
			alert: {
				isShow: true,
				ok: ok,
				type: type
			},
			confirm: { isShow: false },
			title: title,
			message: message,
			callback: callback,
			isHasClassCenter: true
		});
	}
	showConfirm(handleData) {
		let { title, message, isOk, callback } = handleData.message.data;
		this.setState({
			alert: { isShow: false },
			confirm: {
				isShow: true,
				isOk: isOk
			},
			title: title,
			message: message,
			callback: callback,
			isHasClassCenter: true
		});
	}

	/***************************** R_add_origin ***********************/
	// 监听到showInputTooltip后触发的事件
	showInputTooltip(event) {
		let { title, message, isOk, callback, contentType } = event.data;
		this.setState({
			alert: {
				isShow: false
			},
			confirm: {
				isShow: true,
				isOk: isOk
			},
			title: title,
			message: message,
			callback: callback,
			isHasClassCenter: true,
			contentType: contentType
		});
	}

	__loadContent() {
		const self = this;
		let content = undefined;

		if (self.state.message) {
			content = self.state.message;
		} else if (self.state.contentType) {
			switch (self.state.contentType) {
				case "edit-text-area":
					content = (
						<div className="edit-node">
							<textarea
								ref="subNode_1"
								name=""
								id=""
								cols="50"
								rows="6"
								maxLength="50"
							/>
						</div>
					);
					break;
				case "edit-input":
					content = (
						<div className="edit-node">
							<label htmlFor="">
								{TkGlobal.language.languageData.notice.content}:
							</label>
							<input
								ref="subNode_1"
								type="text"
								style={{ marginLeft: ".08rem" }}
								maxLength="20"
							/>
						</div>
					);
					break;
				case "edit-input-db":
					content = (
						<div className="edit-node">
							<label htmlFor="">
								{TkGlobal.language.languageData.notice.content}:
							</label>
							<input
								ref="subNode_1"
								type="text"
								style={{ marginLeft: ".22rem", marginBottom: ".3rem" }}
								maxLength="30"
							/>
							<br />
							<label htmlFor="">{TkGlobal.language.languageData.notice.href}:</label>
							<input
								ref="subNode_2"
								type="text"
								style={{ marginLeft: ".08rem" }}
								maxLength="50"
							/>
						</div>
					);
					break;
				default:
					L.Logger.error(
						"This content type has not defined, please check out and define this content!"
					);
			}
		}

		return {
			content: content
		};
	}
	/**************************** R_add_terminus *********************/

	evaluate() {
		let a = this.state.clickIndex;
		console.log(a);
	}

	render() {
		const self = this;
		let starItems = this.getStar();
		let {
			alert,
			confirm,
			isHasClassCenter,
			title,
			message,
			callback
		} = this.state;
		let { content } = self.__loadContent();
		let onOff = false;
		if (
			message == "本次课程已经结束！" &&
			TkConstant.hasRole.roleStudent == true
		) {
			onOff = true;
		} else {
			onOff = false;
		}
		return (
			<section
				id="alert-error-confrim"
				className={
					"alert-error-confrim " +
					(alert.isShow
						? alert.type === "error"
							? " error-message"
							: " prompt-message"
						: "")
				}
				style={{ display: alert.isShow || confirm.isShow ? "block" : "none" }}
			>
				<div
					id="alert-box"
					className={"alert-box " + (isHasClassCenter ? "center " : "")}
					style={{ display: onOff == false ? "block" : "none" }}
				>
					<div className="alert-title">
						<p className="title-text user-select-none ">{title}</p>
						{alert.isShow ? (
							<button
								onClick={self.alertCloseClick.bind(self, callback)}
								className="title-close"
								id="title-close"
							/>
						) : (
							""
						)}
					</div>
					<div className="alert-contant user-select-none ">{content}</div>
					{/* 课程评价  confirm.isShow是判断课程结束按钮显示*/}
					<div className="alert-isOk">
						<button
							id="alert-confrim"
							className={
								"user-select-none" +
								(confirm.isShow ? " alert-red-confirm" : " alert-blue-confirm")
							}
							onClick={
								alert.isShow
									? self.alertCloseClick.bind(self, callback)
									: confirm.isShow
									? self.confirmClick.bind(self, callback)
									: undefined
							}
						>
							{alert.isShow ? alert.ok : confirm.isShow ? confirm.isOk.ok : ""}
						</button>
						{confirm.isShow ? (
							<button
								id="alert-cancel"
								onClick={self.cancelClick.bind(self, callback)}
								className="alert-cancel user-select-none "
							>
								{confirm.isOk.cancel}
							</button>
						) : (
							""
						)}
					</div>
				</div>
				<div
					style={{
						display: onOff == true ? "flex" : "none",
						justifyContent: "center",
						alignItems: "center"
					}}
				>
					<div
						style={{
							width: "500px",
							background: "#fff",
							borderRadius: "5px",
							margin: "150px 40px 40px 40px"
						}}
					>
						<div
							style={{
								height: "60px",
								lineHeight: "60px",
								textAlign: "left",
								fontSize: "18px",
								background: "#ccc",
								borderTopLeftRadius: "5px",
								borderTopRightRadius: "5px"
							}}
						>
							<p style={{ paddingLeft: ".3rem", position: "relative" }}>
								评价
								<span
									onClick={self.alertCloseClick2.bind(self, callback)}
									style={{ position: "absolute", right: ".2rem", cursor: "pointer" }}
								>
									×
								</span>
							</p>
						</div>
						<div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }} >
							<img
								style={{ width: "1.2rem",height:'1.8rem', marginTop: ".22rem" }}
								src="https://classbro-oss.oss-cn-hongkong.aliyuncs.com/statice-resource/20190129/3080164a31a2452fb6ad80541e4ed269.png"
								alt=""
							/>
							<h3 style={{ textAlign: "center" }}>
								请你对本堂课的辅导讲师进行评价吧！
							</h3>
							<div style={{ padding: ".33rem" }}>
								<div className="starmarking">
									<div className="starcontainer">{starItems}</div>
								</div>
							</div>
						</div>
						<div
							className="alert-isOk"
							style={{
								height: ".7rem",
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								flexDirection: "column"
							}}
						>
							<button
								id="alert-confrim"
								style={{
									background: "#FC6235",
									boxShadow: "inset 0 -2px 1px #FC6235",
									margin: "0"
								}}
								className={
									"user-select-none" +
									(confirm.isShow ? " alert-red-confirm" : " alert-blue-confirm")
								}
								onClick={self.alertCloseClick1.bind(self, callback)}
							>
								{alert.isShow ? alert.ok : confirm.isShow ? confirm.isOk.ok : ""}
							</button>
						</div>
					</div>
				</div>
			</section>
		);
	}
}
export default LxNotification;
