import React,{ Component } from 'react';
import { Hue } from 'react-color/lib/components/common';

export default class Strip extends Component {

    handleChange(data,event){
        this.props.onChange(data,event)

        this.props.afterChange && this.props.afterChange(this.props.hex)
    }

    render(){
        return (
            <div className='cp hue'>
                <Hue {...this.props} direction={ 'vertical' } onChange={this.handleChange.bind(this)}/>
            </div>
        )
    }

}