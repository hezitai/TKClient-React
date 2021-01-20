/*
* 工具条组件
* */
import React from 'react';
import ServiceRoom from "ServiceRoom";
import eventObjectDefine from "eventObjectDefine";
import TkConstant from "TkConstant";
import TkGlobal from "TkGlobal";
import CoreController from 'CoreController';
import ToolPenList from './ToolPenList/index';
import ToolText from './ToolText/index';
import ToolShapeList from './ToolShapeList/index';
import ToolEraser from './ToolEraser/index';
import './static/index_black.css';
import './static/index.css';

class ToolBar extends React.PureComponent{
    constructor(){
        super()
        this.state={
            show: true,
            isActive:'tool_mouse',
            eraserDisabled:false,
            clearDisabled:false,
            redoDisabled:false,
            undoDisabled:false,
            isShowPenList:false,
            isShowShapeList:false,
            eraserWidth:undefined,
            fontFamily:undefined,
            fontSize:undefined,
            penWidth:undefined,
            primaryColor:undefined,
            pen:'tool_pencil',
            shape:'tool_rectangle_empty',
            textPanelShow:false,
            eraserShow: false,
            showToolBar:ServiceRoom.getTkRoom().getMySelf().candraw
        }
        this.listernerBackupid= new Date().getTime()+'_'+Math.random();
    }
    componentDidMount() { //真实的DOM被渲染出来后调用
        eventObjectDefine.CoreController.addEventListener("receiveWhiteboardSDKAction",this.handlerReceiveWhiteboardSDKAction.bind(this),this.listernerBackupid);//监听白板sdk的行为事件
        eventObjectDefine.CoreController.addEventListener("updateAppPermissions_canDraw",this.showToolBar.bind(this),this.listernerBackupid);//监听白板sdk的行为事件
        eventObjectDefine.Window.addEventListener( TkConstant.EVENTTYPE.WindowEvent.onResize , this.onResize.bind(this) , this.listernerBackupid );
        eventObjectDefine.CoreController.addEventListener( "updateSystemStyle" , this.setStyle.bind(this), this.listernerBackupid);
        eventObjectDefine.CoreController.addEventListener( TkConstant.EVENTTYPE.RoomEvent.roomUserpropertyChanged ,this.handlerRoomUserpropertyChanged.bind(this)  ,  this.listernerBackupid ) ;
    };
    componentDidUpdate(prevProps, prevState){
    }
    
    changePenColor(e){
        ServiceRoom.getTkWhiteBoardManager().changeWhiteBoardConfigration({primaryColor:e.target.dataset.color})
    }
    handlerRoomUserpropertyChanged(recvEventData){
        const {user} = recvEventData;
        if(user.id === ServiceRoom.getTkRoom().getMySelf().id){
            this.setState({
                showToolBar:user.candraw
            });
        }
        if(TkConstant.joinRoomInfo.mouseoptions&& TkConstant.hasRole.roleStudent && user.candraw){
            ServiceRoom.getTkWhiteBoardManager().useWhiteboardTool('tool_pencil');
        }
    }
    handlerReceiveWhiteboardSDKAction(recvEventData){
        if(TkGlobal.systemStyleJson
        && recvEventData.message.cmd
        && recvEventData.message.cmd.viewState
        && recvEventData.message.cmd.viewState.scale){
            TkGlobal.wbScale = Math.abs(Number(Number(recvEventData.message.cmd.viewState.scale).toFixed(2))-1.78)<=0.1?
                                1.78:
                                (Math.abs(Number(Number(recvEventData.message.cmd.viewState.scale).toFixed(2))-1.78)<=0.1 || TkConstant.hasRoomtype.oneToOne)?
                                1.33:'100%';
            this.setStyle()
        }
        let that=this
        let {cmd,action}=recvEventData.message;
        switch (action){
            case 'viewStateUpdate':
                for (let key in cmd.viewState) {
                    switch (key) {
                        case  'tool':
                            for (let keys in cmd.viewState[key]) {
                                if(keys==='tool_pencil'||keys==='tool_highlighter'||keys==='tool_line'||keys==='tool_arrow'){
                                    if(cmd.viewState[key][keys].isUse){
                                        that.setState({
                                            pen:keys
                                        })
                                    }
                                }
                                if(keys==='tool_rectangle_empty'||keys==='tool_rectangle'||keys==='tool_ellipse_empty'||keys==='tool_ellipse'){
                                    if(cmd.viewState[key][keys].isUse){
                                        that.setState({
                                            shape:keys
                                        })
                                    }
                                }
                                if(cmd.viewState[key][keys].isUse){
                                   that.setState({
                                       isActive:keys
                                   })
                                }
                                if(cmd.viewState[key].tool_eraser.disabled){
                                    that.setState({
                                        eraserDisabled:true
                                    })
                                }else {
                                    that.setState({
                                        eraserDisabled:false
                                    })
                                }
                            }
                        break;
                        case 'action':
                            if (cmd.viewState[key].action_clear.disabled){
                                that.setState({
                                    clearDisabled:true
                                })
                            }else {
                                that.setState({
                                    clearDisabled:false
                                })
                            }
                            if (cmd.viewState[key].action_redo.disabled){
                                that.setState({
                                    redoDisabled:true
                                })
                            }else {
                                that.setState({
                                    redoDisabled:false
                                })
                            }
                            if (cmd.viewState[key].action_undo.disabled){
                                that.setState({
                                    undoDisabled:true
                                })
                            }else {
                                that.setState({
                                    undoDisabled:false
                                })
                            }
                        break;
                        case 'other':
                            for (let keys in cmd.viewState[key]) {
                                if( keys === 'fontSize'){
                                    this.setState({
                                        fontSize:cmd.viewState[key][keys]
                                    })
                                }
                                if (keys === 'pencilWidth'){
                                    this.setState({
                                        penWidth:cmd.viewState[key][keys]
                                    })
                                }
                                if (keys === 'shapeWidth'){
                                    this.setState({
                                        shapeWidth:cmd.viewState[key][keys]
                                    })
                                }
                                if( keys === 'fontFamily'){
                                    this.setState({
                                        fontFamily:cmd.viewState[key][keys]
                                    })
                                }
                                if( keys === 'primaryColor'){
                                    this.setState({
                                        primaryColor:cmd.viewState[key][keys]
                                    })
                                }
                                if( keys === 'eraserWidth'){
                                    this.setState({
                                        eraserWidth:cmd.viewState[key][keys]
                                    })
                                }
                            }
                        break;

                    }
                }
            break;
        }
    }

    showToolBar(){
        this.setState({
            showToolBar:ServiceRoom.getTkRoom().getMySelf().candraw
        })
    }

    onResize(){
        this.setStyle()
    }
    setStyle(){
        const styleJson = JSON.parse(JSON.stringify(TkGlobal.systemStyleJson))
        const videoContainerStyle = styleJson.RightVesselSmartStyleJson,
        wbStyle = styleJson.RightContentVesselSmartStyleJson;
        if(TkConstant.hasRoomtype.oneToOne && videoContainerStyle && wbStyle){
            CoreController.handler.updateSystemStyleJson('RightVesselSmartStyleJson' ,
            Object.customAssign(videoContainerStyle, this.getJsonStyle(this.getMainHeight(), 'video')))
            CoreController.handler.updateSystemStyleJson('RightContentVesselSmartStyleJson' ,
            Object.customAssign(wbStyle, this.getJsonStyle(this.getMainHeight(), 'wb')))
        }else if(wbStyle && !TkConstant.hasRoomtype.oneToOne){
            if(TkGlobal.wbScale === '100%'){
                wbStyle.width = '100%';
                wbStyle.left = '0rem';
            }else {
                let {BottomVesselSmartStyleJson, HeaderVesselSmartStyleJson} = TkGlobal.systemStyleJson;
                const bottomHeight = Number(BottomVesselSmartStyleJson.height.replace('rem', '')),
                      headerHeight = Number(HeaderVesselSmartStyleJson.height.replace('rem', ''));
                const baseSize = TkGlobal.windowInnerWidth /  TkConstant.STANDARDSIZE,
                  totalHeight = TkGlobal.windowInnerHeight/baseSize, // 单位:rem
                  totalWidth = TkGlobal.windowInnerWidth/baseSize,
                  wbHeight = totalHeight - bottomHeight -headerHeight,
                  wbWidth = wbHeight*TkGlobal.wbScale,
                  wbLeft = `calc( ( 100% - ${wbWidth}rem ) / 2 )`;
                if(wbWidth <= totalWidth){
                    wbStyle.width = `${wbWidth}rem`;
                    wbStyle.height = `${wbHeight}rem`;
                    wbStyle.left  = wbLeft;
                    if(TkConstant.layoutId !== 'layoutId_1') {
                        wbStyle.top = `${headerHeight}rem`
                    }else{
                        wbStyle.top = `${bottomHeight +headerHeight}rem`
                    }
                }else {
                    wbStyle.width = `100%`;
                    wbStyle.height = `${totalHeight - bottomHeight - headerHeight}rem`;
                    wbStyle.left = '0';
                    if(TkConstant.layoutId !== 'layoutId_1') {
                        wbStyle.top = `${headerHeight}rem`
                    }else{
                        wbStyle.top = `${bottomHeight +headerHeight}rem`
                    }
                }
            }
            CoreController.handler.updateSystemStyleJson('RightContentVesselSmartStyleJson', wbStyle)
        }
    }

    getJsonStyle(height, type){
        if(height && type){
            const baseSize    = TkGlobal.windowInnerWidth /  TkConstant.STANDARDSIZE,
                  totalHeight = TkGlobal.windowInnerHeight/baseSize,
                  totalWidth  = TkGlobal.windowInnerWidth/baseSize,                                                                                                                                                                                                                                                                                                                         // 单位:rem
                  maxHeight   = Number(totalHeight - TkGlobal.systemStyleJson.HeaderVesselSmartStyleJson.height.replace('rem', ''))||totalHeight,                                                                                                                                                                                                                                           // 单位:rem
                  top         = maxHeight - height > 0 ? (maxHeight - height)/2 + Number(TkGlobal.systemStyleJson.HeaderVesselSmartStyleJson.height.replace('rem', '')): Number(TkGlobal.systemStyleJson.HeaderVesselSmartStyleJson.height.replace('rem', '')),
                  // right       = type === 'video' ? `${maxHeight - height > 0 ? 0: (totalWidth - maxHeight*(TkGlobal.wbScale+TkGlobal.videoScale/2))/2}rem`:'auto',
                  right       = type === 'video' ? 0:'auto',
                  // left        = type !== 'video' ? `${maxHeight - height > 0 ? 0: (totalWidth - maxHeight*(TkGlobal.wbScale+TkGlobal.videoScale/2))/2}rem`:'auto',
                  left        = type !== 'video' ? 0:'auto';
            return {
                height: `${height}rem`,
                // width: `${type === 'video' ? height*TkGlobal.videoScale/2: height*TkGlobal.wbScale}rem`,
                width: `${type === 'video' ? height*TkGlobal.videoScale/2: (totalWidth - height*TkGlobal.videoScale/2)}rem`,
                top: `${top}rem`,
                right,left,
            }
        }
    }
    getMainHeight(){
        if(TkGlobal.videoScale
        && TkGlobal.wbScale
        && TkGlobal.systemStyleJson
        && TkGlobal.systemStyleJson.HeaderVesselSmartStyleJson
        && TkGlobal.systemStyleJson.HeaderVesselSmartStyleJson.height){
            const baseSize = TkGlobal.windowInnerWidth /  TkConstant.STANDARDSIZE,
                  {wbScale, videoScale} = TkGlobal,
                  totalWidth = TkGlobal.windowInnerWidth,  // 单位:px
                  totalHeight = TkGlobal.windowInnerHeight/baseSize, // 单位:rem
                  maxHeight = Number(totalHeight - TkGlobal.systemStyleJson.HeaderVesselSmartStyleJson.height.replace('rem', ''))||totalHeight,// 单位:rem
                  calcHeight =  (2*totalWidth/(2*wbScale+videoScale))/baseSize, // 以rem为单位
                  height = calcHeight > maxHeight ? maxHeight : calcHeight;
            return height;
        }else{
            // return Log.error('missing parameter: No TkGlobal.videoScale or TkGlobal.wbScale')
            return undefined;
        }
    }
    toggle(){
        this.setState({show:!this.state.show})
    }
    openToolMouse(type){
        ServiceRoom.getTkWhiteBoardManager().useWhiteboardTool(type);
        this.setState({
            isActive:type
        })
    }
    penActive(value){
        const checkArr = ['tool_pencil' , 'tool_highlighter' , 'tool_line' , 'tool_arrow'];
        return checkArr.indexOf(value)!==-1?value:''
    }
    isShowShapeList(){
        ServiceRoom.getTkWhiteBoardManager().useWhiteboardTool(this.state.shape);
        this.setState({
            isShowShapeList:!this.state.isShowShapeList,
            isActive:this.state.shape,
            isShowPenList:false,
            textPanelShow:false,
            eraserShow:false
        });
    }
    isShowPenList(){
        ServiceRoom.getTkWhiteBoardManager().useWhiteboardTool(this.state.pen);
        this.setState({
            isShowPenList:!this.state.isShowPenList,
            isActive:this.state.pen,
            isShowShapeList:false,
            textPanelShow:false,
            eraserShow:false
        });
    }
    changePen(e){
        if(e.target.dataset.type){
            ServiceRoom.getTkWhiteBoardManager().useWhiteboardTool(e.target.dataset.type);
            this.setState({
                // isShowPenList:!this.state.isShowPenList,
                isActive:e.target.dataset.type
            });
        }
        e.stopPropagation()
    }
    mouseLeave(){
        this.setState({
            isShowShapeList:false,
            isShowPenList:false,
            isShowSettingList:false,
            textPanelShow:false,
            eraserShow:false
        });
    }
    setLineColor(hexColor){
        if(hexColor){
            this.setState(
                {primaryColor: hexColor},
                ()=>{
                    ServiceRoom.getTkWhiteBoardManager().changeWhiteBoardConfigration({primaryColor: hexColor})
                })
        }
    }
    getWidthByType(value,type){
        if(!type)return
        let width = undefined;
        switch (type) {
            case 'line':
                width = Math.ceil(Number(value));
                if (width === 0){width=1}
                break;
            case 'shape':
                width = Math.ceil(Number(value));
                if (width === 0){width=1}
                break;
            case 'text':
                width = Math.ceil(Number(value));
                if (width === 0){width=1}
                break;
            case 'eraser':
                width = Math.ceil(Number(value));
                if (width === 0){width=1}
                break;

            default:
                break;
        }
        return width
    }
    onAfterChangePenLineWidth(value){
        const width = this.getWidthByType(value, 'line');
        ServiceRoom.getTkWhiteBoardManager().changeWhiteBoardConfigration({pencilWidth:width});
    }
    onAfterChangeShapeLineWidth(value){
        const width = this.getWidthByType(value, 'shape')
        ServiceRoom.getTkWhiteBoardManager().changeWhiteBoardConfigration({shapeWidth:width});
    }
    openToolUndo(type){
        ServiceRoom.getTkWhiteBoardManager().undo();
        this.setState({
            isActive:type,
            isShowShapeList:false,
            isShowPenList:false,
            textPanelShow:false,
            eraserShow:false
        });
    }
    openToolLaser(type){
        ServiceRoom.getTkWhiteBoardManager().useWhiteboardTool(type);
        this.setState({
            isActive:type
        })
    }
    openToolText(type){
        ServiceRoom.getTkWhiteBoardManager().useWhiteboardTool(type);
        this.setState({
            isActive:type,
            textPanelShow: !this.state.textPanelShow,
            isShowShapeList:false,
            isShowPenList:false,
            eraserShow:false
        })
    }
    changeFontFamily(e){
        if(e && e.target && e.target.dataset.fontfamily){
            ServiceRoom.getTkWhiteBoardManager().changeWhiteBoardConfigration({fontFamily:e.target.dataset.fontfamily})
        }
        e.stopPropagation()
    }
    changeFontSize(value){
        const width = this.getWidthByType(value, 'text')
        ServiceRoom.getTkWhiteBoardManager().changeWhiteBoardConfigration({fontSize:width})
    }
    isShowShapeList(){
        ServiceRoom.getTkWhiteBoardManager().useWhiteboardTool(this.state.shape);
        this.setState({
            isShowShapeList:!this.state.isShowShapeList,
            isActive:this.state.shape,
            isShowPenList:false,
            textPanelShow:false,
            eraserShow:false
        });
    }
    shapeActive(value){
        const checkArr = ['tool_rectangle_empty','tool_rectangle','tool_ellipse_empty','tool_ellipse'];
        return checkArr.indexOf(value)!==-1?value:''
    }
    changeShape(e){
        if(e && e.target && e.target.dataset.type){
            ServiceRoom.getTkWhiteBoardManager().useWhiteboardTool(e.target.dataset.type);
            this.setState({
                // isShowShapeList:!this.state.isShowShapeList,
                isActive:e.target.dataset.type
            });
        }
        e.stopPropagation()
    }
    openToolEraser(type){
        ServiceRoom.getTkWhiteBoardManager().useWhiteboardTool(type);
        this.setState({
            isActive:type,
            isShowShapeList:false,
            isShowPenList:false,
            textPanelShow:false,
            eraserShow:!this.state.eraserShow
        });
    }
    changeEraser(e){
        e && e.stopPropagation && e.stopPropagation()
        // this.setState({eraserShow:!this.state.eraserShow})
    }
    onAfterChangeEraserWidth(value){
        const width = this.getWidthByType(value, 'eraser')
        ServiceRoom.getTkWhiteBoardManager().changeWhiteBoardConfigration({eraserWidth:width});
    }
    openToolRedo(type){
        ServiceRoom.getTkWhiteBoardManager().redo();
        this.setState({
            isActive:type,
            isShowShapeList:false,
            isShowPenList:false,
            textPanelShow:false,
            eraserShow:false
        });
    }
    openToolClear(type){
        ServiceRoom.getTkWhiteBoardManager().clear();
        this.setState({
            isActive:type,
            isShowShapeList:false,
            isShowPenList:false,
            textPanelShow:false,
            eraserShow:false
        });
    }
    render(){
        const {show} = this.state
        
        let styleJson = {};
        if (!TkConstant.hasRoomtype.oneToOne) {
            styleJson.order = 3;
        } else {
            styleJson = this.props.styleJson; /* 区域交换视频框不显示工具条 */
        }
        return(
            <div id='beyond_tools' style={{ display: this.state.showToolBar && TkGlobal.classBegin && styleJson.order === 3 ?"block":"none"}}>
                <ul className="test whiteboard-tool-list-container">
                    <li className={"tool-option icon"} onClick={this.toggle.bind(this)}></li>
                    {/* 配置项：学生端涂鸦工具无鼠标，默认选择画笔； */}
                    {
                        TkConstant.joinRoomInfo.mouseoptions && TkConstant.hasRole.roleStudent ?
                            undefined :
                        <li className={"tool-option tool_mouse " + (this.state.isActive === 'tool_mouse' ? 'active' : '')+(show?'':' hide')} onClick={this.openToolMouse.bind(this,'tool_mouse')} title={TkGlobal.language.languageData.header.tool.mouse.title}>
                            <em className="icon"></em>
                        </li>
                     }
                    <li className={"tool-option tool_laser " + (this.state.isActive === 'tool_laser' ? 'active' : '')+(show&&!TkConstant.hasRole.roleStudent?'':' hide')} onClick={this.openToolLaser.bind(this,'tool_laser')} title={TkGlobal.language.languageData.header.tool.pencil.laser.title}>
                        <em className="icon"></em>
                    </li>
                    <ToolPenList {...this.state}
                        showPenList={this.isShowPenList.bind(this) }
                        penActive={this.penActive}
                        changePen={this.changePen.bind(this)}
                        mouseLeave={this.mouseLeave.bind(this)}
                        setLineColor={this.setLineColor.bind(this)}
                        onAfterChangePenLineWidth={this.onAfterChangePenLineWidth.bind(this)}
                    ></ToolPenList>
                    <ToolText {...this.state}
                        openToolText={this.openToolText.bind(this,'tool_text')}
                        changePen={this.changePen.bind(this)}
                        mouseLeave={this.mouseLeave.bind(this)}
                        changeFontFamily={this.changeFontFamily.bind(this)}
                        setLineColor={this.setLineColor.bind(this)}
                        changeFontSize={this.changeFontSize.bind(this)}
                    ></ToolText>
                    {/* 配置项：学生端涂鸦工具无形状工具 */}
                    {TkConstant.joinRoomInfo.shapeoptions && TkConstant.hasRole.roleStudent ? 
                        undefined :
                        <ToolShapeList {...this.state}
                            shapeActive={this.shapeActive}
                            showShapeList={this.isShowShapeList.bind(this)}
                            changeShape={this.changeShape.bind(this)}
                            mouseLeave={this.mouseLeave.bind(this)}
                            setLineColor={this.setLineColor.bind(this)}
                            onAfterChangeShapeLineWidth={this.onAfterChangeShapeLineWidth.bind(this)}
                        ></ToolShapeList>
                    }
                    <ToolEraser {...this.state}
                        openToolEraser={this.openToolEraser.bind(this,'tool_eraser')}
                        changeEraser={this.changeEraser.bind(this)}
                        mouseLeave={this.mouseLeave.bind(this)}
                        onAfterChangeEraserWidth={this.onAfterChangeEraserWidth.bind(this)}
                    ></ToolEraser>
                    <li className={"tool-option tool_undo " + (this.state.undoDisabled?' disabled':'') + (this.state.isActive === 'tool_undo'?'active':''+(show&&(!TkConstant.hasRole.roleStudent||TkConstant.joinRoomInfo.shapeUndoRedoClear)?'':' hide'))} onClick={this.openToolUndo.bind(this,'tool_undo')} title={TkGlobal.language.languageData.header.tool.undo.title}>
                        <em className="icon"></em>
                    </li>
                    <li className={"tool-option tool_redo " + (this.state.redoDisabled?' disabled':'') + (this.state.isActive === 'tool_redo'?'active':''+(show&&(!TkConstant.hasRole.roleStudent||TkConstant.joinRoomInfo.shapeUndoRedoClear)?'':' hide'))} onClick={this.openToolRedo.bind(this,'tool_redo')} title={TkGlobal.language.languageData.header.tool.redo.title}>
                        <em className="icon"></em>
                    </li>
                    <li className={"tool-option tool_clear " + (this.state.clearDisabled?' disabled':'') + (this.state.isActive === 'tool_clear'?'active':'')+(show&&(!TkConstant.hasRole.roleStudent||TkConstant.joinRoomInfo.shapeUndoRedoClear)?'':' hide')} onClick={this.openToolClear.bind(this,'tool_clear')} title={TkGlobal.language.languageData.header.tool.clear.title}>
                        <em className="icon"></em>
                    </li>
                    <li className={"tool-option icon-show "+(show?'show':'')} onClick={this.toggle.bind(this)}></li>
                </ul>
            </div>
        )
    }
}
export default ToolBar;