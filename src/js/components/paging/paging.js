/**
 *  翻页组件
 * @module Paging
 * @author ZhiX
 * @date 2018/6/27
 */

'use strict';
import React  from 'react';

class Paging extends React.Component{
    constructor(props){
        super(props);
        this.state={
            prevDisabled: false,
            nextDisabled: false,
        }
    };

    componentWillReceiveProps(nextProps){
        //接收父组件传值
        if(!isNaN(parseInt(nextProps.isPageText))){
            let nowPage = nextProps.isSearch? parseInt(nextProps.searchNowPage) : parseInt(nextProps.isPageText);
            this.setState({
                prevDisabled:false,
                nextDisabled:false
            })
            if(nowPage>1&&nowPage<=nextProps.sum){
                this.setState({
                    prevDisabled:false
                })
            }else{
                this.setState({
                    prevDisabled:true,
                })
            }

            if(nowPage>= nextProps.sum || nowPage<1){
                this.setState({
                    nextDisabled:true
                })
            }else{
                this.setState({
                    nextDisabled:false
                })
            }

        }
    }
    handlerInputFocus(e){
        this.props.pagingInputFocus();
    }
    handlerInputChange(e){
        this.props.pagingInputChange(e.target.value)
    }
    handlerInputBlur(e){
        this.props.pagingInputBlur(e.target.value)
    }
    handlerClickPrev(){
        this.props.pagingClickPrev();
    }
    handlerClickNext(){
        this.props.pagingClickNext();
    }
    inputOnKeyDown(e){
        if(e.which === 13){
            e.target.blur()
        }
    }
    render(){
        let that = this;
        let {sum,isPageText,searchNowPage ,isSearch} = that.props;
        return (
            <div className="paging-container">
                <span className={"paging-left "+(this.state.prevDisabled ? "disabled":"")} onClick = {this.handlerClickPrev.bind(this)}></span>
                <div className="paging-container-info">
                    <input className="paging-input" id="pageInput"  type="text"  onMouseDown = {(event)=>{event.stopPropagation(); }} onKeyDown={this.inputOnKeyDown} value={isSearch?searchNowPage:isPageText} onFocus={this.handlerInputFocus.bind(this)} onBlur={this.handlerInputBlur.bind(this)} onChange={this.handlerInputChange.bind(this)} />
                    /
                    <span className="paging-sum">{sum}</span>
                </div>
                <span className={"paging-right " +(this.state.nextDisabled ? "disabled":"")} onClick={this.handlerClickNext.bind(this)}></span>
            </div>
        )
    }
}

export default Paging;