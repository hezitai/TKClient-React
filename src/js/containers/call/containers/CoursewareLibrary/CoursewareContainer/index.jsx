/*
* 课件库主体容器
* */
import React, {Component } from 'react';
import TkConstant from 'TkConstant';
import ReactDrag from 'reactDrag';
import FileListSmart from '@/fileList/RefactorFileList';
import CoursewareButton from '@/CoursewareLibrary/CoursewareButton';


class CoursewareContainer extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const that = this
        let listWidth = '6.76rem';
        let {isLibraryShow}=this.props
        return (
            <article id={that.props.id} onClick={(e)=>{e.stopPropagation()}} className={"tool-extend-container courseware_container"} style={{ display: that.props.isLibraryShow ? "block" : "" }}>
                <CoursewareButton />
                {/* 课件/媒体 内容 */}
                <div className=" tk-weight all-children-user-select-none tool-extend-listbox " id="tool_extend_container" style={Object.customAssign({}, that.props.styleJson)}  >
                    <div style={{height:that.props.listShow.tool_courseware_list?"100%":0}}>
                        {(TkConstant.joinRoomInfo.isClassOverNotLeave || that.props.listLoad.tool_courseware_list || TkConstant.joinRoomInfo.qrCode) ?
                            <FileListSmart
                                styleJson={{ width: listWidth }}
                                isQrCodeUpload={TkConstant.joinRoomInfo.qrCode}
                                show={that.props.listShow.tool_courseware_list}
                                isUploadH5Document={that.props.isUploadH5Document}
                                isMediaUI={false}
                                idType={that.props.tool_common_type} /> : undefined}
                    </div>

                    <div style={{height:that.props.listShow.tool_media_courseware_list?"100%":0}}>
                        {that.props.listLoad.tool_media_courseware_list ?
                            <FileListSmart
                                styleJson={{ width: listWidth }}
                                show={that.props.listShow.tool_media_courseware_list}
                                isMediaUI={true}
                                idType={that.props.tool_media_type} /> : undefined}
                    </div>


                </div>
            </article>
        );
    }
}


export default CoursewareContainer;