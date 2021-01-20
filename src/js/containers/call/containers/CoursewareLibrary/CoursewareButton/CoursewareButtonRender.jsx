

import React, { PureComponent } from 'react';
import TkConstant from 'TkConstant';
import ButtonDumb from 'ButtonDumb';
import styled from "styled-components";

const ArticleStyle = styled.div.attrs({
    className: `tool-icon-wrap add-position-absolute-top0-left0 ${((TkConstant.joinRoomInfo && (TkConstant.joinRoomInfo.helpcallbackurl !== '' && TkConstant.joinRoomInfo.helpcallbackurl !== null && TkConstant.joinRoomInfo.helpcallbackurl !== undefined)) ? ' hasSeekHelpBtn' : '')}`,
    id: "tool_list_left"
})``

const FormStyle = styled.div.attrs({
    method: "post",
    className: "account-basic-upload add-display-none",
    id: "uploadForm",
    encType: "multipart/form-data"
})``


class CoursewareButtonRender extends PureComponent {
    constructor(props) {
        super(props);

    }


    ButtonDumbtoStyle(item) {
        const { id, className, show, onClick, ...other } = item
        return "tk-tool-btn tool-icon " + (className || '') + ' ' + (other && other['open'] && !other['exclude-active'] ? 'active' : '') + ' ' + (other && other['data-circle-show'] ? 'data-circle-show' : '')
    }
    render() {
        const that = this
        return (
            <ArticleStyle>
                {that.props.toolButtonDescriptionArry.map((item, index) => {
                    const { id, className, show, onClick, ...other } = item;
                    return <ButtonDumb
                        className={this.ButtonDumbtoStyle({ ...item })}
                        hide={!show} key={index} id={id} onClick={that.props.handlerToolButtonClick.bind(that, index, id)} {...other} />

                })}
                {/*<FormStyle  >*/}
                    {/*/!*.xls,.xlsx,.ppt,.pptx,.doc,.docx,.txt,.rtf,.pdf,.bmp,.jpg,.jpeg,.png,.flv,.mp4,.swf*!/*/}
                    {/*<input type="file" name="filedata" id="filedata" accept="" />*/}
                {/*</FormStyle>*/}
            </ArticleStyle>
        );
    }
}

export default CoursewareButtonRender;

