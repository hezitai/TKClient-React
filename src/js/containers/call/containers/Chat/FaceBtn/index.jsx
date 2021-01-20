import React from 'react';
import TkGlobal from 'TkGlobal';
import TkConstant from 'TkConstant';
import styled from "styled-components";
const QQFaceDiv = styled.div`
    display: ${props => (!props.qqFaceShow ? 'none' : '')};
`;

export default class FaceBtn extends React.Component{
    render(){
        const {
            isPatrol,
            qqFaceShow,
            textDisable,
            emotionClick,
            emotionMouseEnter,
            QQFaceMouseLeave,
            emotionArray
        }  = this.props;
        return(
            <div className="faceBtn">
                <button className="emotion"
                        disabled={(TkGlobal.isLeaveRoom ? true :TkConstant.hasRole.roleStudent&& (isPatrol || textDisable) )}
                        title={TkGlobal.language.languageData.videoContainer.sendMsg.btn.title.sendEmotion}
                        onClick={emotionClick}
                        onMouseEnter={emotionMouseEnter} >
                </button>
                <QQFaceDiv className="qqFace" onMouseLeave={QQFaceMouseLeave} qqFaceShow={qqFaceShow} >
                    {emotionArray}
                </QQFaceDiv>
            </div>
        )
    }
}