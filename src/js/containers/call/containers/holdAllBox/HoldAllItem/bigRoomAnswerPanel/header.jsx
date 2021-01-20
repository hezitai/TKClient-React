'use strict';
import React from 'react';
import TkGlobal from 'TkGlobal';
import TkConstant from 'TkConstant'

const BigRoomHeader = ({dispose, parentState})=> {
    let isHide = TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant ?'':' hide';
    return  <div className="header">
                <span className="subject item">{TkGlobal.language.languageData.qPanel.answerPanel}</span>
                <span className="btn item">
                    <button className={"close-btn"+isHide} onClick={()=>{
                        dispose({
                            action: 'close',
                            data: {}
                        })
                    }}></button>
                </span>
            </div>

}

export default BigRoomHeader;

