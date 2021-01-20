import React from 'react';
import UploadFileFrom from 'UploadFileFrom';
import TkGlobal from 'TkGlobal';
import TkConstant from 'TkConstant';
export default class SendImgBen extends React.Component{
    render(){
        const {
            isPatrol,
            textDisable,
            OnSendIMG,
            size,
            flag,
            uploadSuccess,
            accept
        } = this.props;
        return(
            <div className="sendImgBtn">
                <button className="emotionl"
                        disabled={(TkGlobal.isLeaveRoom ? true : TkConstant.hasRole.roleStudent&& (isPatrol || textDisable))}
                        title={TkGlobal.language.languageData.videoContainer.sendMsg.btn.title.sendImg}
                        onClick={OnSendIMG}>
                </button>
                <UploadFileFrom size={size} flag={flag}
                                uploadSuccessCallback={uploadSuccess}
                                accept={accept}/> 
            </div>
        )
    }
}