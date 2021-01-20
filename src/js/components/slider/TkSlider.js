/**
 * Slider Dumb组件
 * @module TkSliderDumb
 * @description   提供 Video显示区组件
 * @author xiagd
 * @date 2017/08/10
 */
'use strict';
import React  from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

class TkSliderDumb extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            updateState:false ,
        };
        this.isSlidering = false ; //是否正在slider
        this.changeValue = undefined;
    };
    onChange(value){
        if(this.isSlidering){
            this.changeValue = value ;
            this.setState({updateState:!this.state.updateState});
        }
        if(this.props.onChange && typeof this.props.onChange === 'function'){
            this.props.onChange(value);
        }
    };
    onBeforeChange(value){
        this.isSlidering = true ;
        this.changeValue = value ;
        if(this.props.onBeforeChange && typeof this.props.onBeforeChange === 'function'){
            this.props.onBeforeChange(value);
        }
    };
    onAfterChange(value){
        this.isSlidering = false ;
        this.changeValue = undefined ;
        if(this.props.onAfterChange && typeof this.props.onAfterChange === 'function'){
            this.props.onAfterChange(value);
        }
    };

    render(){
        let {className , disabled , vertical  , style } = this.props ;
        return (
            <Slider style={style} vertical={vertical} className={className}  disabled={disabled} value={this.changeValue !== undefined ? this.changeValue :this.props.value} onChange={this.onChange.bind(this)}  onBeforeChange={this.onBeforeChange.bind(this)} onAfterChange={this.onAfterChange.bind(this)}  />
        )
    };
};

export  default  TkSliderDumb ;
