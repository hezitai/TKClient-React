import React,{ Component } from 'react';

export default class Label extends Component {
    render(){
        return (
            <div className="cp label" style={{backgroundColor:this.props.hex}}></div>
        )
    }

}