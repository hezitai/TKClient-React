'use strict';
import React from 'react';
import TkConstant from 'TkConstant';
import TkGlobal from 'TkGlobal';

const BigRoomFooter = ({dispose, parentState})=> {
    const {questionState, role, hasPub, options, pubRight} = parentState; 

    return  <div className="footer">
                <div className='footer-left'>
                    <span className="hint item" style={{display: TkConstant.hasRole.roleStudent&&parentState.rightOptions.length<=0?'none':''}}>
                        {
                            TkConstant.hasRole.roleStudent
                            ? (pubRight && parentState.rightOptions.length>0 ? `${TkGlobal.language.languageData.qPanel.rightOptionIs}:${parentState.rightOptions&&parentState.rightOptions.map(i=>String.fromCharCode('A'.charCodeAt()+i))}` : '')
                            : (parentState.questionState==='RUNNING'||parentState.questionState==='FINISHED')
                            ?`${TkGlobal.language.languageData.qPanel.rightOptionIs}:${parentState.rightOptions&&parentState.rightOptions.map(i=>String.fromCharCode('A'.charCodeAt()+i))}`
                            :TkGlobal.language.languageData.qPanel.tips[0]
                        }
                    </span>
                    <span className="hint item empty" style={{display: !TkConstant.hasRole.roleStudent&&parentState.questionState==='UNSTART'&&parentState.hintShow?'':'none'}}>
                        {
                            TkGlobal.language.languageData.qPanel.tips[1]
                        }
                    </span>
                    <span className="hint option item"
                        style={{display: TkConstant.hasRole.roleStudent&&parentState.questionState==='FINISHED'?'':'none'}}>
                        {TkGlobal.language.languageData.qPanel.myAnswer}:{options.map((o,i)=>{
                            return o.hasChose === true && String.fromCharCode('A'.charCodeAt()+i) || undefined
                        }).filter(i=>i!==undefined).toString()}
                    </span>
                    <button onClick={()=>{
                                dispose({
                                    action: 'publishResult',
                                    data: {}
                                })
                            }}
                            disabled={hasPub&&true}
                            style={{display: questionState === 'FINISHED' && (TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant) && TkConstant.joinRoomInfo && TkConstant.joinRoomInfo.isShowTheAnswer ?　'' : 'none'}} className='item pub-btn'>
                        {hasPub ? TkGlobal.language.languageData.qPanel.hasPub:TkGlobal.language.languageData.qPanel.pubResult}
                    </button>
                </div>
                <button className="ques-state-btn item" onClick={()=>{
                    dispose({
                        action: parentState.role === TkConstant.role.roleStudent
                                                      ? 'changeCommitState'
                                                      : 'changeQuestionState',
                        data: {}
                    })
                }} style={{display: (questionState === 'FINISHED' && !(TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant)) 
                                    ?　'none' : ''}}
                    disabled = { (!TkConstant.hasRole.roleChairman && !TkConstant.hasRole.roleStudent && !TkConstant.hasRole.roleTeachingAssistant) && true}             
                                    >
                    {
                        parentState.role === TkConstant.role.roleStudent
                        ? parentState.commitState === 'UNCOMMIT'
                        ? TkGlobal.language.languageData.qPanel.commitAnswer
                        : TkGlobal.language.languageData.qPanel.modifyAnswer
                        : (parentState.questionState === 'UNSTART'
                        ? TkGlobal.language.languageData.qPanel.start
                        : parentState.questionState === 'RUNNING'
                        ? TkGlobal.language.languageData.qPanel.end
                        : TkGlobal.language.languageData.qPanel.restart)
                    }
                </button>
            </div>

}

export default BigRoomFooter;