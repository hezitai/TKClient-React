import React from 'react';
export default class layoutItem extends React.Component{
    shouldComponentUpdate(nextProps,nextState){
        if(nextProps.isActive == this.props.isActive){
            return false;
        }else{
            return true;
        }
    }
    render(){
        const {
            name,
            className,
            LayoutClick,
            isActive
        } = this.props;
        return(
            <div className={`layout ${className} ${isActive ? 'active':'' }`} onClick={LayoutClick} >
                <i className="img"></i>
                <div className={`text-box  `} >
                    {/* <i className="radiobox" ></i> */}
                    <span className="name">{name}</span>
                </div>
            </div>
        )
    }
}