/**
 * LOGO组件
 * @module  headerLogo
 * @description  组件
 * @date 2018/11/20
 */
'use strict';
import React from 'react'

export default class HeaderLogo extends React.Component {
    constructor() {
        super()
    }

    render() {
        let {roomLogoUrl, logoError,logoLoad} = this.props;
        return (
            <span className={"add-fl h-logo-wrap " + (roomLogoUrl === undefined ? 'add-display-none' : 'add-block')}
                  ref="logoBox">
                    {roomLogoUrl ? <img src={roomLogoUrl} onLoad={logoLoad} onError={logoError}/> : undefined}
                </span>
        )
    }
}