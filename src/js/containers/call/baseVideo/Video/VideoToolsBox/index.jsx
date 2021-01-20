<div className="video-tools-box">
  {TkGlobal.isVideoInFullscreen ? (
    undefined
  ) : (
    <div className={"v-name-wrap "}>
      <div className="text-wrap">
        <span
          className={"v-name add-nowrmp add-fl user-select-none "}
          style={{ display: this.props.stream ? undefined : "none" }}
        >
          <i
            className={`primaryColor ${user.candraw ? "on" : "off"}`}
            style={{
              backgroundColor: user.primaryColor,
              border: `2px solid ${user.primaryColor}`
            }}
          />
          {user.nickname}
        </span>
        <div
          className="gift-show-container "
          style={{
            display:
              this.props.stream && user.role === TkConstant.role.roleStudent
                ? undefined
                : "none"
          }}
        >
          <span className="gift-icon" />
          <span className="gift-num">{user.giftnumber || 0}</span>
        </div>
      </div>
    </div>
  )}
  {TkGlobal.isVideoInFullscreen ? (
    undefined
  ) : (
    <div className="device-wrap">
      {(user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_AUDIOONLY ||
        user.publishstate === TkConstant.PUBLISHSTATE.PUBLISH_STATE_BOTH) &&
      user.hasaudio ? (
        <div className="Audiochangew">
          {<div className="Audiochangewlogo" />}
          {this.props.stream ? (
            <Audiochange user={user} stream={this.props.stream} />
          ) : null}
        </div>
      ) : (
        <div className="audio_close_icon" />
      )}
      <span className="v-device-open-close">{userInfoIconArray}</span>
    </div>
  )}
  <div
    className="user-network-delay"
    style={{
      color: this.state.networkDelayColor,
      display:
        TkGlobal.classBegin &&
        this.props.stream !== undefined &&
        this.state.hasNetworkState
          ? "none"
          : "none"
    }}
  >
    {" "}
    {/*todo 暂时不显示网络状态：inline-block*/}
    <span
      className="user-network-dot"
      style={{ backgroundColor: this.state.networkDelayColor }}
    />
    <span className="user-network-delay-num">
      {this.state.networkDelay + "ms"}
    </span>
  </div>

  <div
    className="video-hover-function-container"
    style={{
      display:
        actionButtonArray.length === 0 || this.state.isCanDrag
          ? "none"
          : undefined
    }}
  >
    <span className="button-set role-student">{actionButtonArray}</span>
  </div>

  {/*<div className="video-hover-function-container" style={{display:customTrophyShow? 'none':dragIsHide?"none":(actionButtonArray.length===0?'none':undefined) , maxWidth:this.maxWidthToActionContainer}}>*/}
  {/*<span className="button-set role-student" onDoubleClick={ (e) => { e.stopPropagation(); return false ; } }  >*/}
  {/*{actionButtonArray}*/}
  {/*</span>*/}
  {/*</div>*/}
  <div
    className="background-mode-float"
    style={{
      display:
        (TkGlobal.classBegin ||
          TkConstant.joinRoomInfo.isBeforeClassReleaseVideo) &&
        user.isInBackGround
          ? "block"
          : "none"
    }}
  >
    <p className="background-mode-prompt">
      {user.role === TkConstant.role.roleChairman
        ? TkGlobal.language.languageData.otherVideoContainer.prompt.userText
        : TkGlobal.language.languageData.otherVideoContainer.prompt.text}
    </p>
  </div>

  {/* {TkConstant.template==="template_classic" ?
                            (<div className="video-participant-raise-btn add-position-absolute-top0-right0"  style={{display: user.raisehand?'block':'none'}}>
                                <span className="raise-img" />
                            </div>):undefined
                        } */}
  <div
    className="foregroundpic-container"
    style={{
      display:
        TkConstant.hasRole.roleStudent &&
        TkConstant.joinRoomInfo.foregroundpic &&
        this.props.foregroundpicUrl &&
        this.props.pictureInPictureClassname
          ? "block"
          : "none",
      backgroundImage:
        TkConstant.hasRole.roleStudent &&
        TkConstant.joinRoomInfo.foregroundpic &&
        this.props.foregroundpicUrl &&
        this.props.pictureInPictureClassname
          ? "url(" + this.props.foregroundpicUrl + ")"
          : undefined
    }}
  />
</div>;
