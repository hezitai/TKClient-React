/**
 * 提供异步加载的Dumb组件
 * @module AsyncComponent
 * @description   提供 组件的异步加载
 * @author QiuShao
 * @date 2017/12/25
 */
'use strict';
import React, { Component } from "react";
import Loading from './Loading' ;

/*异步组件加载组件
@params importComponent:一个函数（importComponent），当被调用时会动态地导入给定的组件 , Function
@params asyncLoadComponentID: 异步加载的组件id标识 , String
@params isNecessaryAwit: 是否必须等待加载完毕 ， 默认true , Boolean
@params loadedCallback: 加载完毕的回调函数 , Function
@params destroyCallback: 组件销毁的回调函数 , Function
@params componentName: 组件的名字 , String
asyncComponent函数需要一个参数; 一个函数（importComponent），当被调用时会动态地导入给定的组件*/
export default function asyncComponent({importComponent , asyncLoadComponentID  , isNecessaryAwit = true ,  loadedCallback , destroyCallback  , componentName} = {} ) {
  class AsyncComponent extends Component {
      constructor(props) {
        super(props);
        this.state = {
          component: undefined
        };
        this.isNecessaryAwit = isNecessaryAwit ;
        this.asyncLoadComponentID = asyncLoadComponentID !== undefined && asyncLoadComponentID !== null ? asyncLoadComponentID :  ( ( componentName && typeof componentName === 'string'? componentName+'_' : 'AsyncComponent_' )+ new Date().getTime()+'_'+Math.random() );
      }

      async componentDidMount() {
          this._setComponentLoadState(false);
          const { default: component } = await importComponent(this.asyncLoadComponentID);
          this.setState({
              component: component
          });
      };

      componentDidUpdate(prevProps , prevState){ //在组件完成更新后立即调用。在初始化时不会被调用
          if(prevState.component === undefined && this.state.component ){
              this._setComponentLoadState(true);
              if(loadedCallback && typeof loadedCallback === 'function'){
                  loadedCallback(this.asyncLoadComponentID);
              }
          }
       };

      componentWillUnmount(){
          this._setComponentLoadState(undefined , true);
          if(destroyCallback && typeof destroyCallback === 'function'){
              destroyCallback(this.asyncLoadComponentID);
          }
      };

      _setComponentLoadState(state , isDel){
        window.asyncLoadComponentList = window.asyncLoadComponentList || {} ;
        window.asyncLoadComponentList.necessaryAwit = window.asyncLoadComponentList.necessaryAwit || { } ;
        window.asyncLoadComponentList.notAwit = window.asyncLoadComponentList.notAwit || { } ;
        if(isDel){
            L.Logger.info('AsyncComponent lift is destroy , asyncLoadComponentID is '+this.asyncLoadComponentID + ' , isNecessaryAwit is '+ this.isNecessaryAwit) ;
            if( this.isNecessaryAwit ){
                delete window.asyncLoadComponentList.necessaryAwit[this.asyncLoadComponentID];
            }else{
                delete window.asyncLoadComponentList.notAwit[this.asyncLoadComponentID];
            }
        }else{
            L.Logger.info('AsyncComponent lift is '+(state?'living':'create')+' , asyncLoadComponentID is '+this.asyncLoadComponentID + ' , isNecessaryAwit is '+ this.isNecessaryAwit) ;
            if( this.isNecessaryAwit ){
                 window.asyncLoadComponentList.necessaryAwit[this.asyncLoadComponentID] = state ;
            }else{
                 window.asyncLoadComponentList.notAwit[this.asyncLoadComponentID] = state ;
            }
        }
    }

    render() {
      const Component = this.state.component;
      return (Component ? <Component {...this.props} /> : <Loading /> ); /*可以在这里加上loading*/
    }
  }

  return AsyncComponent;
}
