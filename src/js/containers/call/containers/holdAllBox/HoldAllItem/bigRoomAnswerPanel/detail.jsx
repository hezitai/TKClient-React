/* 教师端 答题器 统计详情 */
'use strict';
import React from 'react';
import TkGlobal from 'TkGlobal';
import Paging from "../../../../../../components/paging/paging";

const BigRoomDetail = ({parentState,dispose, pageDict})=>{
    let detailDom = null;
    const {studentNum: totalNum, result, ansTime, resultNum, detailData} = parentState;
    const getFormatTime=(second)=>{
        const fs = Number(second%60),
              fm = Math.floor(second/60),
              fh = Math.floor(second/3600);

        return `${fh>9&&fh||`0${fh}`}:${fm>9&&fm||`0${fm}`}:${fs>9&&fs||`0${fs}`}`;
    }
    //修改时间
    const getDetailItem = ()=>{
        if(detailData && detailData.length && detailData.length > 0){
            return detailData.map((item, i) => {
                return (
                    <div className="detail-item" key={i}>
                        <span>{item && item.studentname}</span>
                        <span className={"selectedAnswers"}>{TkGlobal.language.languageData.qPanel.choseAnswer}:{item && item.options.map(x=>String.fromCharCode('A'.charCodeAt()+x))+''}</span>
                        <span className={"useTime"}>{TkGlobal.language.languageData.qPanel.useTime}:{item && item.timestr}</span>
                    </div>
                )
            });
        }else {
            return (
                <div className="detail-item">
                    <span>{TkGlobal.language.languageData.qPanel.loading}</span>
                </div>
            )
        }

    }

    const getPageInfo=()=>{
        return (
            <div className="detail-page">
                <span onClick={()=>{dispose({action: 'changeDetail', data: {action: -1}})}}>{`<`}</span>
                <span>{`${parentState.detailPageInfo.current}/${parentState.detailPageInfo.total}`}</span>
                <span onClick={()=>{dispose({action: 'changeDetail', data: {action: 1}})}}>></span>
            </div>
        )
    }

    const pagingClickPrev=()=>{
        dispose({action: 'changeDetail', data: {action: -1}});
        detailDom.scrollTop = 0;
    }

    const pagingClickNext=()=>{
        dispose({action: 'changeDetail', data: {action: 1}});
        detailDom.scrollTop = 0;
    }

    const pagingInputFocus=()=>{
        //stepNowPage = parseInt(parentState.detailPageInfo.current);
    }

    const pagingInputChange=(v)=>{
        dispose({action: 'changeDetail', data: {action: 2 , text: v}});
        detailDom.scrollTop = 0;
    }

    const pagingInputBlur=(e)=>{
        dispose({action: 'changeDetail', data: {action: 3 , text: e}});
    }

    return (
        <div className="statistics" style={{display: parentState.page.index === pageDict.detail ? '':'none'}}>
            <div className="statistics-header">
                <span className="num item">{TkGlobal.language.languageData.qPanel.answerNum}:{resultNum}{TkGlobal.language.languageData.qPanel.people}</span>
                <span className="time item">{TkGlobal.language.languageData.qPanel.useTime}:{getFormatTime(ansTime)}</span>
                <span className="cut item" onClick={()=>{dispose({action: 'changeDetailOrStatistics', data: {}})}}>{TkGlobal.language.languageData.qPanel.statistics}</span>
            </div>
            <div className="detail" ref={(input) => { detailDom = input; }}>
                {getDetailItem()}
            </div>
            <Paging sum={parentState.detailPageInfo.total} isPageText={parentState.detailPageInfo.current} pagingClickPrev = {pagingClickPrev} pagingInputFocus={pagingInputFocus} pagingInputChange={pagingInputChange} pagingInputBlur={pagingInputBlur} pagingClickNext = {pagingClickNext}/>
        </div>
    )
}

export default  BigRoomDetail;