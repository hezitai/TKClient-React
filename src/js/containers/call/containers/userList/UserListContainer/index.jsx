import React from 'react';
export default class UserListContainer extends React.Component{
    render(){
        const {
            isLoadShow,
            listItemArray
        } = this.props;
        return(
            <div className="list-wrapper">
                {
                    isLoadShow?
                    <div className="loading-box"><span className="loading"></span></div>:
                    (<ul className="list-box" id="tool_participant_user_list">
                        {listItemArray}
                    </ul>)
                }
            </div>
        )
    }
}