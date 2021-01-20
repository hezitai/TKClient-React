_loadActionButtonArray(user){
  let actionButtonArray = []  ;
  let actionButtonDesc = []  ;
  if(TkGlobal.playback){ //回放 不显示按钮
      return actionButtonArray ;
  }
  let isMyself =  user.id === ServiceRoom.getTkRoom().getMySelf().id ;
  let closeMyseftAV =  CoreController.handler.getAppPermissions('closeMyseftAV') ;
  let controlOtherVideo =  CoreController.handler.getAppPermissions('controlOtherVideo') ;
  /*if( (!isMyself && !controlOtherVideo) || (isMyself && !closeMyseftAV) || (!isMyself && controlOtherVideo && user.role === TkConstant.role.roleChairman) ){
  return actionButtonArray ;
  }*/
  let loadActionBtn = {};
  if(!TkGlobal.classBegin){
      if(TkConstant.joinRoomInfo.isBeforeClassReleaseVideo){
          loadActionBtn = {
              scrawl:false ,//画笔
              platform:false,//上下台
              audio:closeMyseftAV && isMyself,//音频
              video:closeMyseftAV && isMyself,//视频
              gift:false,//送礼物
              restoreDrag:false,//恢复位置
              areaExchange:false,//区域交换
              oneKeyReset:false,//一键恢复
              onlyAudio:false,//纯音频
          };
      }else{//上课前且上课前不发布音视频，则不显示按钮
          return actionButtonArray ;
      }
  }else{
      if (TkConstant.hasRole.roleStudent) {
          loadActionBtn = {
              scrawl:false ,//画笔
              platform:false,//上下台
              audio:closeMyseftAV && isMyself,//音频
              video:closeMyseftAV && isMyself,//视频
              gift:false,//送礼物
              restoreDrag:CoreController.handler.getAppPermissions('isCanDragVideo')&&this.props.direction === 'horizontal',//恢复位置
              areaExchange:isMyself ? false : TkConstant.joinRoomInfo.areaExchange && TkConstant.hasRoomtype.oneToOne && user.role === TkConstant.role.roleChairman && TkConstant.hasRole.roleStudent,//区域交换
              oneKeyReset:false,//一键恢复
          };
      }else if (TkConstant.hasRole.roleChairman) {
          loadActionBtn = {
              scrawl:!isMyself,
              platform:!isMyself,
              audio:true,
              video:true,
              gift:!isMyself,
              restoreDrag:CoreController.handler.getAppPermissions('isCanDragVideo')&&this.props.direction === 'horizontal',
              areaExchange:isMyself ? false:TkConstant.joinRoomInfo.areaExchange && TkConstant.hasRoomtype.oneToOne && user.role === TkConstant.role.roleStudent && TkConstant.hasRole.roleChairman,
              oneKeyReset:isMyself,
              onlyAudio:isMyself,//纯音频
              pointerReminder: TkConstant.joinRoomInfo.pointerReminder && this.props.direction === 'horizontal'&&(user.role!==TkConstant.role.roleChairman && user.role!==TkConstant.role.roleTeachingAssistant) ,//教鞭
          };
      }else if (TkConstant.hasRole.roleTeachingAssistant) {
          loadActionBtn = {
              scrawl:isMyself?false:user.role !== TkConstant.role.roleChairman ,
              platform:isMyself?false:user.role !== TkConstant.role.roleChairman,
              audio:isMyself?true:(user.role !== TkConstant.role.roleChairman),
              video:isMyself?true:(user.role !== TkConstant.role.roleChairman),
              gift:false,
              restoreDrag:CoreController.handler.getAppPermissions('isCanDragVideo')&&this.props.direction === 'horizontal',
              areaExchange:false,
              oneKeyReset:false,
              onlyAudio:false,//纯音频
              pointerReminder: TkConstant.joinRoomInfo.pointerReminder && this.props.direction === 'horizontal'&&(user.role!==TkConstant.role.roleChairman && user.role!==TkConstant.role.roleTeachingAssistant) , //教鞭
          };
      }else if (TkConstant.hasRole.rolePatrol) {
          loadActionBtn = {
              scrawl:false ,
              platform:false,
              audio:false,
              video:false,
              gift:false,
              restoreDrag:false,
              areaExchange:false,
              oneKeyReset:false,
          };
      }
  }
  let actionBtnJson = {
      scrawl: {
          disabled: false,
          languageKeyText: (user.candraw ? 'no' : 'yes'),
          className: 'scrawl-btn ' + (  (user.candraw )? 'no' : 'yes'),
          onClick: this.changeUserCandraw.bind(this, user),
          title: user.candraw ? TkGlobal.language.languageData.toolContainer.toolIcon.userList.button.Scrawl.on.title : TkGlobal.language.languageData.toolContainer.toolIcon.userList.button.Scrawl.off.title,
          isShow: !this.props.isSplitScreenFromStream && ( isMyself ? false : (user.role === TkConstant.role.roleStudent) ), //不是学生（并且不处于分屏下）则隐藏
      },
      platform: {
          disabled: false,
          languageKeyText: (user.publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE ? 'no' : 'yes'),
          className: 'platform-btn '+ (user.publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE ? 'no' : 'yes'),
          onClick: this.userPlatformUpOrDown.bind(this, user,user.role),
          title: user.publishstate !== TkConstant.PUBLISHSTATE.PUBLISH_STATE_NONE ? TkGlobal.language.languageData.toolContainer.toolIcon.userList.button.update.up.title : TkGlobal.language.languageData.toolContainer.toolIcon.userList.button.update.down.title,
          isShow: isMyself ? false : (user.role === TkConstant.role.roleStudent || user.role === TkConstant.role.roleTeachingAssistant )? true : !this.props.isDrag,
      },
      audio: {
          disabled: false,
          languageKeyText: (user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY || user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH) ? 'no' : 'yes',
          className: 'audio-btn ' + (  (user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY || user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH) ? 'no' : 'yes'),
          onClick: this.userAudioOpenOrClose.bind(this, user),
          title: user.disableaudio ? TkGlobal.language.languageData.toolContainer.toolIcon.userList.button.audio.disabled.title : (
              user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY || user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH ?
                  TkGlobal.language.languageData.toolContainer.toolIcon.userList.button.audio.on.title : TkGlobal.language.languageData.toolContainer.toolIcon.userList.button.audio.off.title
          ),
          isShow: user.hasaudio ,
      },
      video: {
          disabled: false,
          languageKeyText: (user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_VIDEOONLY || user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH) ? 'no' : 'yes',
          className: 'video-btn ' + (  (user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_VIDEOONLY || user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH) ?'no' : 'yes' ),
          onClick: this.userVideoOpenOrClose.bind(this, user),
          title: user.disablevideo ? TkGlobal.language.languageData.toolContainer.toolIcon.userList.button.video.disabled.title : (
              user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_VIDEOONLY || user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH ?
                  TkGlobal.language.languageData.toolContainer.toolIcon.userList.button.video.on.title : TkGlobal.language.languageData.toolContainer.toolIcon.userList.button.video.off.title
          ),
          isShow:TkGlobal.isOnlyAudioRoom?false:user.hasvideo,

      },
      gift: {
          disabled: false,
          languageKeyText: 'yes',
          className: 'gift-btn',
          onClick:this.sendGiftToStudent.bind(this, user),
          title: TkGlobal.language.languageData.otherVideoContainer.button.gift.yes,
          isShow: isMyself ? false:(user.role === TkConstant.role.roleStudent && TkConstant.hasRole.roleChairman),

      },
      restoreDrag: {
          disabled: false,
          languageKeyText: 'text',
          className: 'restoreDrag-btn',
          onClick: this.restoreVideoDrag.bind(this, user.id),
          title: TkGlobal.language.languageData.otherVideoContainer.button.restoreDrag.text,
          isShow: (TkGlobal.isSplitScreen ? false : this.props.isDrag )&& !TkGlobal.isVideoInFullscreen ,
      },
      areaExchange: {
          disabled: false,
          languageKeyText: 'text',
          className: 'areaExchange-btn',
          onClick: this.handlerAreaExchange.bind(this,user),
          title: TkGlobal.language.languageData.otherVideoContainer.button.areaExchange.text,
          isShow: !isMyself && TkConstant.joinRoomInfo.areaExchange && TkConstant.hasRoomtype.oneToOne && !this.state.areaExchangeBtn
      },

      /* 恢复全部 */
      oneKeyReset:{
          disabled: false,
          languageKeyText: 'text',
          className: 'oneKeyReset-btn',
          onClick: this.handlerOneKeyReset.bind(this),
          title: undefined,
          isShow: TkConstant.hasRole.roleChairman && isMyself && !TkConstant.isBaseboard && !TkConstant.hasRoomtype.oneToOne && !TkGlobal.isVideoInFullscreen ,
      },
      onlyAudio:{
          disabled: false,
          languageKeyText: TkGlobal.isOnlyAudioRoom ? 'yes' :'no',
          className: 'onlyAudio-btn'+(TkGlobal.isOnlyAudioRoom?' yes':' no'),
          onClick: this.setOnlyAudioClassRoomHandle.bind(this),
          title: undefined,
          isShow: TkConstant.hasRole.roleChairman && TkConstant.joinRoomInfo.isHasVideo && TkConstant.joinRoomInfo.createOnlyAudioRoom,
      },
      pointerReminder:{
          /*请勿删除，以后会做*/
          disabled: false,
          languageKeyText: 'text',
          className: 'pointerReminder-btn ' + (user.pointerstate?'yes':'no'),
          onClick: this.handlerPointerReminder.bind(this,user),
          title: TkGlobal.language.languageData.otherVideoContainer.button.pointerReminder.text,
          isShow: (TkConstant.hasRole.roleChairman || TkConstant.hasRole.roleTeachingAssistant) && TkConstant.joinRoomInfo.pointerReminder&&(user.role!==TkConstant.role.roleChairman && user.role!==TkConstant.role.roleTeachingAssistant), //配置项
          // isShow:false, //配置项
      }
  };
  for( let key of Object.keys(actionBtnJson) ){
      if(loadActionBtn[key]){
          actionButtonDesc.push(actionBtnJson[key]);
      }
  }
  if(TkGlobal.isVideoInFullscreen){
      actionButtonArray.length = 0;
  }else{
      actionButtonDesc.map( (item , index) => {
          let { disabled , languageKeyText , className  , onClick , title , isShow } = item ;
          if(isShow){
              let buttonName = className.split("-");
              actionButtonArray.push(
                  <button key={index}
                          className={'' + (className || '') + ' ' + (disabled ? ' disabled ' : ' ')}
                          onClick={onClick && typeof onClick === "function" ? onClick : undefined}
                          onMouseDown={(e) => {e.stopPropagation()}}
                          onDoubleClick={(e)=>{e.stopPropagation();e.preventDefault();}}
                          disabled={disabled ? disabled : undefined}
                          style={{display:!isShow?'none':'block'}}  title={TkGlobal.language.languageData.otherVideoContainer.button[buttonName[0]][languageKeyText]?TkGlobal.language.languageData.otherVideoContainer.button[buttonName[0]][languageKeyText]:this.props.direction === 'horizontal'?TkGlobal.language.languageData.otherVideoContainer.button[buttonName[0]][languageKeyText]:undefined} >
                  </button>
              );
              
          }
      } );
  }

  return actionButtonArray ;
};