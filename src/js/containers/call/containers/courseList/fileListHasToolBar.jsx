import React from "react";
import eventObjectDefine from "eventObjectDefine";
import TkGlobal from "TkGlobal";
import ServiceRoom from "ServiceRoom";
import utils from "./utils";
import { FileItemEvent } from "./service";

import FileListSmart from "@/fileList/RefactorFileList";
import { CourseLibrary, MediaLibrary } from "./fileList";
import TkConstant from "../../../../tk_class/TkConstant";

function withAddFileToolBar(WrapperComponent, isMedia) {
	class FileToolBar extends React.Component {
		state = {
			fileSortType: "fileid", //排序类型 , fileid / filetype / filename
			isAec: false, //是否升序
			searchText: "", //搜索内容
			filecategory: -1, //显示的文件分类 ，-1:不区分文件类型 ， 0:课堂文件 ， 1：系统文件
			isSearch: false,
			libType: null,
			fileType: null,
			uploadFileFromFlag: 0, //上传文件的flag
			mediaDisabled: false,
			courseDisabled: false,
			showUpdatePptBln: false,
			showUpdatePptFinishBln: false,
			showUpdatePptErrorBln: false
		};

		// componentDidMount() {
		//   //监听添加课件
		//   eventObjectDefine.CoreController.addEventListener(
		//     "fileListEvent",
		//     this.handlerFileList.bind(this),
		//     this.listernerBackupid
		//   );
		// }

		// // 处理上传课件种类
		// handlerFileList(recvEventData) {
		//   const message = recvEventData.message;
		//   if (message && message.addType) {
		//     if (message.libType == "mediaLib") {
		//       this.tempMediaLib.push();
		//     } else {
		//       this.tempCourseLib.push();
		//     }
		//     this.setState({
		//       addFileType: message.addType
		//     });
		//   }
		// }

		handleSearch(event) {
			const searchText = event.target.value;
			this.handleSearchList(searchText);
		}
		handleSearchList(searchText = "") {
			const libType = isMedia ? "mediaLib" : "courseLib";
			this.setState({
				searchText: searchText
			});
			eventObjectDefine.CoreController.dispatchEvent({
				type: "fileListEvent",
				message: { searchText: searchText, libType: libType }
			});
		}

		handleSort(type) {
			let isAec = false;
			const libType = isMedia ? "mediaLib" : "courseLib";
			if (type !== this.state.fileSortType) {
				this.setState({
					fileSortType: type,
					isAec: isAec
				});
			} else {
				isAec = !this.state.isAec;
				this.setState({
					isAec: isAec
				});
			}
			eventObjectDefine.CoreController.dispatchEvent({
				type: "fileListEvent",
				message: { fileSortType: type, isAec: isAec, libType: libType }
			});
		}

		uploadppt() {
			// ByTyr 动态课件上传
			let _this = this;
            
            
            // let tk =  window.GLOBAL.ClassBroToken;
			let myform = new FormData();
			myform.append("files", document.getElementById("load_xls").files[0]);
			myform.append("roomNo", TkConstant.joinRoomInfo.serial);
			$.ajax({
				url: "https://test.classbro.com/api/teacher/courseware/saveDynamicPPT",
				// url: "https://www.classbro.com/api/teacher/courseware/saveDynamicPPT",
				type: "POST",
				data: myform,
				processData: false,
				contentType: false,
				success: function(data) {
					_this.setState({
						showUpdatePptBln: true
					});
					let aaaa = setInterval(() => {
						_this.setState({
							showUpdatePptBln: false
						});
						clearInterval(aaaa);
					}, 1200);
					let timer;
					timer = setInterval(() => {
						$.ajax({
							url: "https://test.classbro.com/api/teacher/courseware/checkChangeProgress",
							// url: "https://www.classbro.com/api/teacher/courseware/checkChangeProgress",
							type: "POST",
							data: JSON.stringify(data.body),
							headers: {
								"content-type": "application/json"
							},
							success: function(res) {
								if (res.body.length == 0) {
									clearInterval(timer);
									_this.setState({
										showUpdatePptFinishBln: true
									});
									// debugger;
									let aaaa = setInterval(() => {
										_this.setState({
											showUpdatePptFinishBln: false
										});
										clearInterval(aaaa);
									}, 5000);
								} else if (res.status >= 400) {
									clearInterval(timer);
									_this.setState({
										showUpdatePptErrorBln: true
									});
									let aaaa = setInterval(() => {
										_this.setState({
											showUpdatePptErrorBln: false
										});
										clearInterval(aaaa);
									}, 3000);
								}
							},
							error: function(error) {}
						});
					}, 1000);
				},
				error: function(error) {}
			});
		}

		// 点击上传课件按钮
		handleAdd(type, isMedia) {
			if (TkConstant.hasRole.rolePatrol) {
				return false;
			}
			const libType = isMedia ? "mediaLib" : "courseLib";
			this.setState({
				libType: libType,
				fileType: type,
				uploadFileFromFlag: this.state.uploadFileFromFlag + 1
			});
		}

		//打开搜索
		openSearch() {
			this.setState({
				isSearch: true
			});
		}
		//bboom bboom
		//关闭搜索
		closeSearch() {
			this.setState({
				isSearch: false
			});
			this.handleSearchList();
		}

		clickDisable() {
			this.setState({
				mediaDisabled: false,
				courseDisabled: false
			});
		}

		clickEffect(isMedia) {
			this.setState({
				mediaDisabled: isMedia,
				courseDisabled: !isMedia
			});
		}

		render() {
			const { searchText, libType, fileType, uploadFileFromFlag } = this.state;
			// console.error(this.state.showUpdatePptBln, this.state.showUpdatePptFinishBln, this.state.showUpdatePptErrorBln);
			return (
				<React.Fragment>
					<div className={"fileFilter"}>
						<div
							className="showUpdatePpt showPptAlert animated slideInDown"
							style={{ display: this.state.showUpdatePptBln ? "block" : "none" }}
						>
							<p>动态课件上传中</p>
						</div>
						<div
							className="showUpdatePptFinish showPptAlert animated slideInDown"
							style={{ display: this.state.showUpdatePptFinishBln ? "block" : "none" , fontSize:'.17rem'}}
						>
							<p style={{textAlign:'center',fontSize:'.16rem', paddingTop:'.1rem'}}>课件已成功上传到后台 <br /> 请耐心等待转码 <br /> 转码成功后自动显示</p>
							{/* <p></p>
							<p></p> */}
						</div>
						<div
							className="showUpdatePptError showPptAlert animated slideInDown"
							style={{ display: this.state.showUpdatePptErrorBln ? "block" : "none" }}
						>
							<p>动态课件上传失败</p>
						</div>
						<div className={"flexBox"}>
							<span
								className={"filterItem" + (this.state.isSearch ? " searching" : " ")}
							>
								<button
									className={"search"}
									onClick={this.openSearch.bind(this)}
									title={
										TkGlobal.language.languageData.toolContainer.toolIcon.documentList
											.button.search.name
									}
								/>
								<span style={{ display: this.state.isSearch ? "" : "none" }}>
									<input
										value={searchText}
										placeholder={
											TkGlobal.language.languageData.toolContainer.toolIcon.documentList
												.button.search.text
										}
										onChange={this.handleSearch.bind(this)}
									/>
									<button className={"close"} onClick={this.closeSearch.bind(this)} />
								</span>
							</span>
							<span
								className={
									"filterItem" + (this.state.fileSortType === "fileid" ? " active" : "")
								}
								style={{ display: this.state.isSearch ? "none" : "" }}
								onClick={this.handleSort.bind(this, "fileid")}
							>
								{
									TkGlobal.language.languageData.toolContainer.toolIcon.documentList
										.button.uploadTime.text
								}
								<span className={"flex_box"}>
									<button className={"up" + (this.state.isAec ? " on" : "")} />
									<button className={"down" + (this.state.isAec ? "" : " off")} />
								</span>
							</span>
							<span
								className={
									"filterItem" +
									(this.state.fileSortType === "filetype" ? " active" : "")
								}
								style={{ display: this.state.isSearch ? "none" : "" }}
								onClick={this.handleSort.bind(this, "filetype")}
							>
								{
									TkGlobal.language.languageData.toolContainer.toolIcon.documentList
										.button.fileType.text
								}
								<span className={"flex_box"}>
									<button className={"up" + (this.state.isAec ? " on" : "")} />
									<button className={"down" + (this.state.isAec ? "" : " off")} />
								</span>
							</span>
							<span
								className={
									"filterItem" +
									(this.state.fileSortType === "filename" ? " active" : "")
								}
								style={{ display: this.state.isSearch ? "none" : "" }}
								onClick={this.handleSort.bind(this, "filename")}
							>
								{
									TkGlobal.language.languageData.toolContainer.toolIcon.documentList
										.button.fileName.text
								}
								<span className={"flex_box"}>
									<button className={"up" + (this.state.isAec ? " on" : "")} />
									<button className={"down" + (this.state.isAec ? "" : " off")} />
								</span>
							</span>
						</div>
						<div
							style={{
								display: TkConstant.hasRole.roleStudent ? "none" : "",
								position: "relative"
							}}
						>
							<button
								className={"addCourse"}
								onClick={this.handleAdd.bind(this, "course", isMedia)}
								disabled={
									isMedia ? this.state.mediaDisabled : this.state.courseDisabled
								}
							>
								{isMedia
									? TkGlobal.language.languageData.toolContainer.toolIcon
											.mediaDocumentList.button.addCourse.text
									: TkGlobal.language.languageData.toolContainer.toolIcon.documentList
											.button.addCourse.text}
							</button>
							
							{isMedia || !TkConstant.joinRoomInfo.isUploadH5Document ? null : (
								<button
									className={"addH5"}
									// onClick={this.handleAdd.bind(this, "h5", isMedia)}
									disabled={this.state.courseDisabled}
									style={{position:'relative'}}
								>
									<input
										style={{
											position: "absolute",
											top: "0",
											right: "-0.1rem",
											width: "1rem",
											height: ".4rem",
											opacity: "0",
											cursor: "pointer",
											zIndex:'9999'
										}}
										type="file"
										id="load_xls"
										name="file"
										onChange={this.uploadppt.bind(this)}
									/>
									+ 动态课件
									{
										// TkGlobal.language.languageData.toolContainer.toolIcon.H5DocumentList
										// 	.button.addCourse.text
									}
								</button>
							)}
						</div>
					</div>
					<WrapperComponent
						uploadFileFromFlag={uploadFileFromFlag}
						fileType={fileType}
						libType={libType}
						clickDisable={this.clickDisable.bind(this)}
						clickEffect={this.clickEffect.bind(this)}
						{...this.props}
					/>
				</React.Fragment>
			);
		}
	}
	return FileToolBar;
}

const CourseLibraryHasToolBar = withAddFileToolBar(CourseLibrary, false);
const MediaLibraryHasToolBar = withAddFileToolBar(MediaLibrary, true);

export { CourseLibraryHasToolBar, MediaLibraryHasToolBar };
