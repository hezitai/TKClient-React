/**
 * 普通文件列表的 Dumb组件
 * @module FileListDumb
 * @description   提供普通文件列表的Dumb组件
 * @author wangLiMin
 * @date 2018/11/21 初步重构
 */
'use strict';
import React  from 'react';
import PropTypes  from 'prop-types'; 
import TkUtils  from 'TkUtils';
import TkConstant from "TkConstant";
import FileFilter from "./fileFilter"
import FileUpLoad from "./fileUpLoad"
import FileListContent from './fileListContent'

class FileListDumb extends React.Component{
    constructor(props){
        super(props);
        this.publicFileList=[];
        this.classFileList=[];
    };

    /*加载用户列表所需要的props*/
    loadUserListProps(fileListItemJson ){
        //const _getListItemDataArray = (fileListItemJson) => {
        const listItemDataArray = [] ;
        for(let i=0;i<fileListItemJson.length;i++) {
            let value = fileListItemJson[i];
            let {id , disabled  , children , textContext ,afterIconArray , show , active ,temporaryDisabled , filetype, onClick } = value ;
            let tmpFileListItemJson = {
                className: 'file-container clear-float  add-position-relative '  + (active==1?'active':'') + (disabled?" disabled":""),
                id: 'file_list_' + id,
                textContextArray: [
                    {
                        className: 'file-name add-fl add-nowrap',
                        textContext: textContext,
                        onClick:onClick
                    }
                ],
                children:children ,
                //filetype:filetype,
                //dynamicppt:dynamicppt,
                show: show,
                onClick: onClick,
                iconArray:(function (afterIconArray) {
                    const tmpArr = [];
                    afterIconArray = afterIconArray || [];
                    afterIconArray.forEach(function (item) {
                        const {disabled,after, before, className, show, onClick, ...other} = item;
                        tmpArr.push(
                            {
                                attrJson: {
                                    className: className,
                                },
                                before: before,
                                after: after,
                                disabled: disabled,
                                show: show,
                                onClick: onClick,
                                ...TkUtils.filterContainDataAttribute(other)
                            }
                        );
                    });
                    return tmpArr;
                })(afterIconArray) ,

            };
            listItemDataArray.push(tmpFileListItemJson);
        };
        let bStudent = TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant;

        const fileListProps = {
            id:'tool_file_list_extend ' + this.props.idType ,
            className:'tool-file-list-extend ' + this.props.idType  + (bStudent?'':' student'),
            listPros:{
                id:'tool_participant_file_list' ,
                className:'t-participant-file-list add-over-auto-max-height  custom-scroll-bar' ,
                listItemDataArray:listItemDataArray ,
            }  ,
        };
        return {fileListProps:fileListProps} ;
    };

    /*加载ListItem组件数组*/
    loadListItem(listItemDataArray){
        const that = this ;
        const _loadListItemContext = (textContextArray) => {
            const listItemContextArray = [] ;
            const _handlerAddTextContext = (value , index) => {
                const {className , textContext ,id, onClick  ,order ,   ...ohterAttrs} = value ;
                listItemContextArray.push(
                    //注释备份花名册昵称居中
                    // (that.props.type==="userList"? (TkGlobal.classBegin?" textCenter":""):"")
                    <span key={index} title={textContext} className={"tk-listitem-context "+(className || '')+(that.props.type === "userList" ? " textCenter" : "")  }  id={id}  onClick={onClick} {...ohterAttrs} >{textContext}</span>
                )
            };
            if(TkUtils.isArray(textContextArray)){
                textContextArray.forEach( (value , index) =>{
                    _handlerAddTextContext(value , index);
                } );
            }else{
                _handlerAddTextContext(textContextArray );
            }
            return {listItemContextArray:listItemContextArray};
        };
        const loadIconArray = (iconArray) => {
            const beforeElementArray = [] , afterElementArray = [] ;
            if(iconArray){
                iconArray.forEach( (value , index) =>{
                    value.attrJson = value.attrJson || {} ;
                    const {attrJson , disabled , after , before , context , show , onClick  , onMouseLeave , iconChildren} = value ;
                  const {id , title  , className , ...otherAttrs } =  attrJson ;
                    const iconTemp = (<span key={index} style={ {display:!show?'none':undefined} } className={'tk-icon  tk-button-span tk-listitem-icon '+ (before?' tk-icon-before ':' tk-icon-after ')
                    + (className?className:'') + ' ' + (disabled?' disabled ':' ') } onMouseLeave={onMouseLeave && typeof onMouseLeave === "function"?onMouseLeave:undefined}
                                            onClick={onClick && typeof onClick === "function"?onClick:undefined}  title={title} id={id} {...TkUtils.filterContainDataAttribute(otherAttrs) } >
                        {context?context:''}
                        {iconChildren}
                    </span>) ;

                    if(before){
                        beforeElementArray.push(iconTemp)
                    }else if(after){
                        afterElementArray.push(iconTemp)
                    }

                });
            }
            return{
                beforeElementArray:beforeElementArray ,
                afterElementArray:afterElementArray
            }
        }
        const listItemArray = [] ;
        if(listItemDataArray){
            listItemDataArray.forEach( (value , index) =>{
                value = value || {} ;
                let { textContextArray , children ,iconArray,className,id,show, ...other} =  value ;
                let {listItemContextArray} = _loadListItemContext(textContextArray);
                let { beforeElementArray ,  afterElementArray }  = loadIconArray(iconArray);
                listItemArray.push(
                    <li key={index}  className={"tk-list-item "+className} id={id}    style={{display:!show ?'none':undefined}}  {...TkUtils.filterContainDataAttribute(other) } >
                        <span className={"tk-icon-before-container tk-icon-size-"+beforeElementArray.length } >
                            {beforeElementArray}
                        </span>
                        {listItemContextArray}
                        {children}
                        <span className={"tk-icon-after-container tk-icon-size-"+afterElementArray.length} >
                            {afterElementArray}
                        </span>
                    </li>
                );
            });
        }

        if(this.props.filecategory === 1 && TkConstant.joinRoomInfo.isDocumentClassification){
            this.publicFileList=listItemArray
        }else if(this.props.filecategory === 0 && TkConstant.joinRoomInfo.isDocumentClassification){
            this.classFileList=listItemArray
        }
        return {listItemArray,publicFileList:this.publicFileList,classFileList:this.classFileList} ;
    }

    render(){
        const that = this ;
        const {clickOptionFile,uploadFile,accept,isUploadH5Document  , fileListItemJson,isModeChange, show  , styleJson={} ,uploadButtonJson, ...otherProps} = that.props ;
        const {fileListProps} = that.loadUserListProps(fileListItemJson ) ;
        let {...fileList} = that.loadListItem(fileListProps.listPros.listItemDataArray);
        return <div id={fileListProps.id} className={"tk-app-list tool-extend " + (fileListProps.className || "")} {...TkUtils.filterContainDataAttribute(otherProps)} style={Object.customAssign(
              {},
              styleJson,
              { display: show ? "block" : "none" }
            )}>
            <div className="tk-list-container">
              <FileFilter uploadButtonJson={uploadButtonJson} isSearch={true} isSort={true} isModeChange={isModeChange} />
              <div className="tk-list-content">
                <FileListContent clickOptionFile={clickOptionFile} {...fileList} listPros={fileListProps.listPros} />
                <FileUpLoad uploadFile={uploadFile} accept={accept} uploadButtonJson={uploadButtonJson} isUploadH5Document={isUploadH5Document} />
              </div>
            </div>
          </div>;
    };
};

export  default  FileListDumb ;

