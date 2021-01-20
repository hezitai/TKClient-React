import React,{ Component } from 'react';
import { Saturation } from 'react-color/lib/components/common';

export default class Block extends Component {

    handleChange(data,event){
        this.props.onChange(data,event)

        this.props.afterChange && this.props.afterChange(this.props.hex)
    }

    render(){
        return (
            <div className='cp saturation'>
                <Saturation {...this.props}  onChange={this.handleChange.bind(this)}/>
            </div>
        )
    }

}