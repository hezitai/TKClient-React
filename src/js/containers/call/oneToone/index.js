import React, { PureComponent } from 'react'
import eventObjectDefine from "eventObjectDefine";
import TkConstant from "TkConstant";
import TkGlobal from "TkGlobal";


import RightVesselSmart from '../mainVessel/rightVessel/rightVessel';
import RightContentVesselSmart from '../mainVessel/leftVessel/rightContentVessel/rightContentVessel';
import styled from 'styled-components'
import ServiceRoom from '../../../services/ServiceRoom';


// const roles = 

const OneTooneDivStyle = styled.div.attrs({
    className: "oneToone"
})`
${props => {
        return {
            ...props.RightContentVesselSmartStyleJson,
            ...props.RightVesselSmartStyleJson,
            width: '100%'
        }
    }}
display: flex;
flex-wrap: wrap-reverse;
// flex-wrap: wrap-reverse;
flex-direction: column-reverse;
`

const Div = styled.div`
${props => {
        return {
            width: props.width,
            height: props.height,
            top: props.top,
            order: props.order
        }
    }}
position: relative;
// order: -1
`



class OneToone extends PureComponent {
    constructor(props) {
        super(props);
        this.state= {
            // 根据三块（右 左上 左下）的样式切换顺序  进行 位置大小对调
            styleArr: [0, 1, 2]
        }
        this.listernerBackupid = new Date().getTime() + "_" + Math.random();
    }
    componentDidMount() {
        eventObjectDefine.CoreController.addEventListener(
            "areaExchangeClose",
            this.handlerCloseAreaExchange.bind(this),
            this.listernerBackupid
        );
        eventObjectDefine.CoreController.addEventListener(
            'areaExchange', 
            this.handlerAreaExchange.bind(this), 
            this.listernerBackupid
            );
    }

    componentWillUnmount() {
        //组件被移除之前被调用，可以用于做一些清理工作
        eventObjectDefine.CoreController.removeBackupListerner(
            this.listernerBackupid
        );
    }

    // 区域切换事件
    handlerAreaExchange(data){
        const {message} = data
        if(message &&message.hasExchange){
            switch(ServiceRoom.getTkRoom().getMySelf().role) {
                case 0:
                    this.setState({styleArr: [2, 1, 0]})
                    break;
                case 2:
                    this.setState({styleArr: [1, 0, 2]})
                    break;
                default:
                    break;
            }
        }else{
            this.setState({styleArr: [0, 1, 2]})
        }
    }

    // 关闭切换
    handlerCloseAreaExchange(data) {
        this.setState({styleArr: [0, 1, 2]})
    }

    render() {
        let RightVesselSmartStyleJson = { ...this.props.RightVesselSmartStyleJson },
            RightContentVesselSmartStyleJson = { ...this.props.RightContentVesselSmartStyleJson }

        RightVesselSmartStyleJson.top = 0
        RightContentVesselSmartStyleJson.top = 0

        RightVesselSmartStyleJson.position = 'relative'
        RightContentVesselSmartStyleJson.position = 'relative'


        RightVesselSmartStyleJson.height && (RightVesselSmartStyleJson.height = RightVesselSmartStyleJson.height.split('rem')[0] / 2 + 'rem')



        let styleObj = {
            // 左边盒子的样式
            0: {
                ...RightContentVesselSmartStyleJson,
                order: 3
            },
            // 右边上盒子的样式
            1: {
                ...RightVesselSmartStyleJson,
                order: 2,
                className: 'video_wrap1v1'
            },
            // 右边下盒子的样式
            2: {
                ...RightVesselSmartStyleJson,
                order: 1,
                className: 'video_wrap1v1'
            }
        }
        if(TkGlobal.doubleScreen){
            styleObj[0] = {
                ...styleObj[0],
                top: '0.42rem',
                order: -1
            }
        }
        let styleArr = this.state.styleArr.map(item => {
            return styleObj[item]
        })
        return (
            <OneTooneDivStyle {...this.props}>
                <Div {...styleArr[0]}>
                    <RightContentVesselSmart styleJson={styleArr[0]} />
                </Div>


                <Div {...styleArr[1]}>
                    <RightVesselSmart isTeacher={true} styleJson={styleArr[1]} RightContentVesselSmartStyleJson={RightContentVesselSmartStyleJson} />
                </Div>


                <Div {...styleArr[2]}>
                    <RightVesselSmart isTeacher={false} styleJson={styleArr[2]} RightContentVesselSmartStyleJson={RightContentVesselSmartStyleJson} />
                </Div>
            </OneTooneDivStyle>
        );
    }
}


export default OneToone;