/* 教师端 答题器 统计界面 */
'use strict';
import React from 'react';
import TkGlobal from 'TkGlobal';

const BigRoomStatistics = ({parentState, dispose, pageDict})=>{
    const {studentNum: totalNum, result, ansTime, resultNum} = parentState;

    const getFormatTime=(second)=>{
        const fs = Number(second%60),
              fm = Math.floor(second/60),
              fh = Math.floor(second/3600);

        return `${fh>9&&fh||`0${fh}`}:${fm>9&&fm||`0${fm}`}:${fs>9&&fs||`0${fs}`}`;
    }

    const getOptionItem = ()=>{
        return result.map((item, i) => {
            return (
                <div className="statistics-item" key={i}>
                    <span className={"op op-"+i}>
                    {String.fromCharCode('A'.charCodeAt()+i)}
                    </span>
                    <span className="total">
                        <span className="process" style={{width: `${Number(item)/Number(resultNum)*100}%`}}></span>
                    </span>
                    <span className="num">{item}{TkGlobal.language.languageData.qPanel.people}</span>
                </div>
            )
        });
    } 

    return (
        <div className="statistics" style={{display: parentState.page.index === pageDict.statistics ? '':'none'}}>
            <div className="statistics-header">
                <span className="num item">{TkGlobal.language.languageData.qPanel.answerNum}:{resultNum}{TkGlobal.language.languageData.qPanel.people}</span>
                <span className="time item">{TkGlobal.language.languageData.qPanel.useTime}:{getFormatTime(ansTime)}</span>
                <span className="cut item" onClick={()=>{dispose({action: 'changeDetailOrStatistics', data: {}})}}>{TkGlobal.language.languageData.qPanel.detail}</span>
            </div>
            <div className={(result.length > 4 ? `double `:'')+"statistics-wrap"}>
                {getOptionItem()}
            </div>
        </div>
    )
}

export default  BigRoomStatistics;