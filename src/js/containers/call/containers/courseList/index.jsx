/**
 * @description 课件库
 * @author mlh
 * @date 2018/12/9
 */

import React from "react";
import eventObjectDefine from "eventObjectDefine";
import TkGlobal from "TkGlobal";
import ServiceRoom from "ServiceRoom";
import {
	CourseLibraryHasToolBar,
	MediaLibraryHasToolBar
} from "./fileListHasToolBar";
import "./static/css";
import "./static/css/black.css";
import TkConstant from "../../../../tk_class/TkConstant";

class CourseList extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			isLibraryShow: false,
			isMedia: false,
			isCourseShow: true, //默认显示课件库
			isMediaShow: false,
			uploadType: null // 上传文件类型
		};
		this.listernerBackupid = new Date().getTime() + "_" + Math.random();
		this.tempMediaLib = [];
		this.tempCourseLib = [];
	}

	componentDidMount() {
		//点击课件库事件
		eventObjectDefine.CoreController.addEventListener(
			"CourseListClick",
			this.handlerCourseListClick.bind(this),
			this.listernerBackupid
		);

		//关闭课件库事件
		eventObjectDefine.CoreController.addEventListener(
			"CloseLibrary",
			this.handlerCloseLibrary.bind(this),
			this.listernerBackupid
		);

		eventObjectDefine.CoreController.addEventListener(
			"CloseALLPanel",
			this.handlerCloseLibrary.bind(this),
			this.listernerBackupid
		);
	}

	// 关闭弹框
	handlerCloseLibrary() {
		this.setState({ isLibraryShow: false });
		eventObjectDefine.CoreController.dispatchEvent({
			type: "CoursewareRemove"
		});
	}

	// 点击课件库  将弹框显示出来
	handlerCourseListClick() {
		this.setState({ isLibraryShow: true });
	}

	//点击打开课件库
	openCourse() {
		this.setState({
			isCourseShow: true,
			isMediaShow: false
		});
	}

	//点击打开媒体库
	openMedia() {
		this.setState({
			isCourseShow: false,
			isMediaShow: true
		});
	}

	render() {
		return (
			<div
				className={"mask"}
				onClick={this.handlerCloseLibrary.bind(this)}
				style={{
					display: this.state.isLibraryShow ? "block" : "none"
				}}
			>
				<article
					className={"courseware_box"}
					onClick={e => {
						e.stopPropagation();
					}}
				>
					<div className={"courseware_left_button"}>
						<p
							className={"tool-icon" + (this.state.isCourseShow ? " active" : " ")}
							onClick={this.openCourse.bind(this)}
							title={
								TkGlobal.language.languageData.toolContainer.toolIcon.documentList.title
							}
						>
							{
								TkGlobal.language.languageData.toolContainer.toolIcon.documentList.title
							}
						</p>
						<p
							className={"tool-icon" + (this.state.isMediaShow ? " active" : " ")}
							onClick={this.openMedia.bind(this)}
							style={{ display: TkConstant.hasRole.roleStudent ? "none" : "" }}
							title={
								TkGlobal.language.languageData.toolContainer.toolIcon.mediaDocumentList
									.title
							}
						>
							{
								TkGlobal.language.languageData.toolContainer.toolIcon.mediaDocumentList
									.title
							}
						</p>
					</div>
					<div className={"courseware_content"}>
						<div
							style={{
								display: this.state.isCourseShow ? "block" : "none",
								height: "100%"
							}}
						>
							<CourseLibraryHasToolBar {...this.props} />
						</div>
						<div
							style={{
								display: this.state.isMediaShow ? "block" : "none",
								height: "100%"
							}}
						>
							<MediaLibraryHasToolBar {...this.props} />
						</div>
					</div>
				</article>
			</div>
		);
	}
}

export default CourseList;
