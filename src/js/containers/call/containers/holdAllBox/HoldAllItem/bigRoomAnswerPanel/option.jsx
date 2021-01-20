/* 答题器 选项界面 */
'use strict';
import React from 'react';
import TkGlobal from 'TkGlobal';
import TkConstant from 'TkConstant';

const BigRoomOption = ({dispose, parentState})=> {
    const { options } = parentState;
    const getOptionItem= ()=>{
        return options.map(
            (option, index) => {
                return (
                    <div className="option-wrap" key={index}>
                        <div className={`${option.hasChose ? 'active':''} option option-${index}`}
                            onClick={()=>{dispose({action: 'optionClick', data: {index}})}}>
                            <span>{String.fromCharCode('A'.charCodeAt()+index)}</span>
                        </div>
                    </div>
                )
            }
        )
    }

    return  (
        <div className="option-panel">
            <div className="options">
                {getOptionItem()}
            </div>
            <button 
                style={{display:TkConstant.hasRole.roleChairman||TkConstant.hasRole.roleTeachingAssistant?'':'none'}} 
                className={`option-btn ${options.length >= 8 ? 'disabled' : ''}`}
                onClick={()=>{dispose({action: 'changeOptionLength', 
                data:{num:1}})}}
            >
                {TkGlobal.language.languageData.qPanel.addOption}
            </button>
            <button 
                style={{display:TkConstant.hasRole.roleChairman||TkConstant.hasRole.roleTeachingAssistant?'':'none'}} 
                className={`option-btn ${options.length <=2 ? 'disabled' : ''}`}
                onClick={()=>{dispose({action: 'changeOptionLength', 
                data:{num:-1}})}}
            >
                {TkGlobal.language.languageData.qPanel.delOption}
            </button>
        </div>
    )

}

export default BigRoomOption;