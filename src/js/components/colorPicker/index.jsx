import React from 'react';
import { CustomPicker } from 'react-color';
import Label from './label';
import Strip from './strip';
import Block from './block';
import './style.css';

class TkColorPicker extends React.Component {
  render() {
    return (
        <div className='color-picker'
            onMouseDown = {(e)=>{e.stopPropagation()}}>
            <div className='column'>
                <Label {...this.props}/>
                <Strip {...this.props}/>
            </div>
            <Block {...this.props}/>
        </div>)
  }
}

export default CustomPicker(TkColorPicker);
