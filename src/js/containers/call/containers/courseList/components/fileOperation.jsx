import React from 'react';
import utils from '../utils';

const FileOperation = ({type, event}) => {
  const fileOperationStyle = {
    'open': {
      name: 'open',
      url: '',
      css: ''
    },
    'delete': {
      name: 'delete',
      url: '',
      css: ''
    }
  }

  const clickEvent = (e) => {
    if(utils.isFunction(e)){
      return e;
    }
  };

  return (
    <span onClick = {clickEvent(event)}>
      <span>{fileOperationStyle[type].name}</span>
    </span>
  )
}

export default FileOperation;