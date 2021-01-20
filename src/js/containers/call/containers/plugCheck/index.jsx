/**
 * @description 插件检测
 * @author chenxx
 * @date 2019/1/7
 */


import React from "react";
import ServiceRoom from "ServiceRoom";
import eventObjectDefine from "eventObjectDefine";
import "./static/sass/purple.css"
import "./static/sass/black.css"
import TkGlobal from "TkGlobal";

export default class PlugCheck extends React.Component {

    constructor(props){
        super();
        this.state={
            show:false
        };
        this.listernerBackupid =  new Date().getTime()+'_'+Math.random();
        // this.openUrl = this.openUrl().bind(this);
        this.chinese={
            title:"插件安装引导",
            explain:"系统检测到您还未安装桌面共享插件,请下载安装",
            chromeTrue:"如果可以访问谷歌Chrome商店",
            chromeTrueClick:"直接点击",
            addPlugin:"添加插件",
            chromeFalse:"如果无法访问谷歌Chrome商店",
            one:"1、访问chrome://extensions/打开扩展管理界面，开启开发者模式，并将下载的.crx文件拖到扩展管理界面中确定添加即可;",
            two:"2. 安装成功后，在浏览器右上角会出现如下图的图标，代表安装成功，您可以正常使用。如果未出现图标，请关闭Chrome浏览器重新打开，也可以通过Chrome扩展管理器打开安装的插件。"
        };

        this.english={
            title:"Plug-in installation boot",
            explain: "The system has detected that you have not installed extension desktop sharing plug-in. Please download and install it.",
            chromeTrue:"If you can visit the Google Chrome store",
            chromeTrueClick:"directly click ",
            addPlugin:" add plugin",
            chromeFalse:"If you can't access the Google Chrome store",
            one:"Access the chrome/extension open extension management interface, open the developer mode, and drag the downloaded .crx file into the extended management interface to determine the addition;",
            two:"When the installation is successful, it will appear in the lower right corner of the browser to the following diagram, which means that the installation is successful, and you can use it normally.If no icon appears, please open the Chrome browser and open the installation plug-in through the Chrome extension browser."

        }

    }

    openUrl(){
        window.open('https://www.classbro.com/static-resource/tkcloud/Classbro-Extension.zip');
    }

    componentDidMount(){
        eventObjectDefine.CoreController.addEventListener( "check_no_plug" , this.handlerOpenAddPlug.bind(this) ,  this.listernerBackupid  );//检测无插件，打开插件下载弹窗

    }

    componentWillUpdate(){
        // if(this.state.show){
        //     ServiceRoom.getTkRoom().startShareScreen(null,(code)=>{
        //         console.error('plug——————code==>',code);
        //         if(code !== window.TK_ERR.CHECK_USERDesktopMediaError){
        //             this.setState({
        //                 show:false
        //             })
        //         }
        //     });
        // }

        // ServiceRoom.getTkRoom().stopShareScreen();

    }

    componentWillUnmount(){
        eventObjectDefine.CoreController.removeBackupListerner(this.listernerBackupid);
    }

    /*打开插件下载弹窗*/
    handlerOpenAddPlug() {
        this.setState({
            show:true
        })
    };


    close(){
        this.setState({
            show:false
        });
        eventObjectDefine.CoreController.dispatchEvent({
            type:'colse-holdAll-item' ,
            message: {
                type: 'sharing'
            }
        });
    }


    render() {
        let renderText = TkGlobal.language.name==="english"?this.english:this.chinese;
        // 安装插件引导--ByTyr
        return (
            <div className="plug_check_model" style={{display:this.state.show?'flex':'none'}}>
                <div className={"plug_check_container "+(TkGlobal.language.name==="english"?"plug_check_container_english":"")}>
                    {/*<img   alt="" src="../../../../../../publish/img/plug_check_close@2x.png"/>*/}
                    <div className="plug_check_close" onClick={this.close.bind(this)}></div>
                    <div className="plug_check_title">
                        <div className="plug_check_title_icon"></div>
                        <div className="plug_check_title_h">
                            <div className="plug_check_title_h1">{renderText.title}</div>
                            <div className="plug_check_title_h2">{renderText.explain}</div>
                        </div>
                    </div>
                    <div className={"plug_check_content "+(TkGlobal.language.name==="english"?"plug_check_content_english":"")}>
                        <div style={{padding:' 14px 18px 14px 19px',fontSize:' 14px',fontWeight: '400',color: '#58595E',lineHeight: '25px'}}>
                            <span>点击下载  屏幕共享的 <button style={{textDecoration:'underline',color:'blue'}} onClick={this.openUrl.bind(this)} >扩展程序</button>， 并解压到桌面</span><br />
                            <span>确保Chrome浏览器版本高于69.0.0版本</span><br />
                            <span style={{userSelect:'text'}}>查看浏览器版本：在地址栏输入 chrome://settings/help</span>
                        </div>
                        <div style={{padding:' 14px 18px 14px 19px',fontSize:' 14px',fontWeight: '400',color: '#58595E',lineHeight: '25px'}}>
                            <span>1、点击浏览器右上角"<span className='red-classbro'>自定义及控制Chrome</span>"按钮，选择"<span className='red-classbro'>更多工具</span>"，选择"<span className='red-classbro'>扩展程序</span>"。或在地址栏直接输入"<span className='red-classbro' style={{userSelect:'text'}}>chrome://extensions/</span>"</span>
                            <div className='classbroe1'></div>
                        </div>
                        <div style={{padding:' 14px 18px 14px 19px',fontSize:' 14px',fontWeight: '400',color: '#58595E',lineHeight: '25px'}}>
                            <span>2、进入扩展工具后，右上角将"<span className='red-classbro'>开发者模式</span>"开启，选择左上角"<span className='red-classbro'>加载已解压的扩展程序</span>"</span>
                            <div className='classbroe2'></div>
                            <div className='classbroe4'></div>
                        </div>
                        <div style={{padding:' 14px 18px 14px 19px',fontSize:' 14px',fontWeight: '400',color: '#58595E',lineHeight: '25px'}}>
                            <span>3、选中解压好的"<span className='red-classbro'>Classbro_Extension</span>"文件夹，点击"<span className='red-classbro'>选择文件夹</span>"</span>
                            <div className='classbroe3'></div>
                        </div>

                        {/* <div className="plug_check_type_true">{renderText.chromeTrue}
                            <span className="plug_check_fenge">|</span>
                            <span className="plug_check_click">{renderText.chromeTrueClick}
                            <a href="https://chrome.google.com/webstore/detail/talk-cloud-extension/pboolclgcnlceldkjnplgbcooafhaibk"  target="_blank">{renderText.addPlugin}</a>
                        </span>
                        </div>

                        <a className="plug_check_icon" href="https://chrome.google.com/webstore/detail/talk-cloud-extension/pboolclgcnlceldkjnplgbcooafhaibk"  target="_blank">
                            <div className={"plug_check_chrome "+(TkGlobal.language.name==="english"?"plug_check_chrome_english":"")}></div>
                        </a> */}

                        {/* <div className="plug_check_border"></div> */}

                        {/* <div className="plug_check_type_true">{renderText.chromeFalse}
                            <span className="plug_check_fenge">|</span>
                            <span className="plug_check_click">{renderText.chromeTrueClick}
                            <a href="https://doccdn.talk-cloud.net/Updatefiles/Talk-Cloud-Extension_v1.0.2.crx"  target="_blank">{renderText.addPlugin}</a>
                            </span>
                        </div> */}
                        {/* <div style={{padding:' 14px 18px 14px 19px',fontSize:' 14px',fontWeight: '400',color: '#58595E',lineHeight: '25px'}}>
                            <span>点击下载  屏幕共享的 <a href="_blank">扩展程序</a> </span>
                        </div>

                        <div className={"plug_check_type_false "+(TkGlobal.language.name==="english"?"plug_check_type_false_english":"")}>
                            <div className="plug_check_direct">{renderText.one}</div>
                            <div className={"plug_check_developer " + (TkGlobal.language.name==="english"?"plug_check_developer_english":"")}></div>
                        </div>

                        <div className={"plug_check_type_false2 "+(TkGlobal.language.name==="english"?"plug_check_type_false2_english":"")}>
                            <div className="plug_check_direct">{renderText.two}</div>
                            <div className="plug_check_success"></div>
                        </div> */}

                    </div>

                </div>
            </div>
        );
    }
}
