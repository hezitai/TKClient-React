import React from 'react';
import TkGlobal from 'TkGlobal';
export default class UserListSearch extends React.Component{
    constructor(){
        super();
        this.state={
            inputValue:''
        }
    }
    handleInputChange(e){
        this.setState({
            inputValue:e.target.value
        })
        this.props.inputChange(e.target.value);
    }
    render(){
        return(
                <div className="userlist-search">
                    <button className="searchBtn" title={TkGlobal.language.languageData.toolContainer.toolIcon.documentList.button.search.name}></button>
                    <input className="searchInput" type="text"  
                            onChange={this.handleInputChange.bind(this)} 
                            onMouseDown = {(event)=>{event.stopPropagation(); }}
                            value={this.state.inputValue}
                            placeholder={TkGlobal.language.languageData.toolContainer.toolIcon.documentList.button.search.text}  />
                </div>
            
        )
    }
}