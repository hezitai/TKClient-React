/**
 * ClassBro新增需求
 * @class ClassBroFunctions
 * @author Tyr
 * @date 2019/3/7
 */
'use strict';
import eventObjectDefine from 'eventObjectDefine';
import TkConstant from 'TkConstant';
import TkUtils from 'TkUtils';
import RoleHandler from 'RoleHandler';
import CoreController from 'CoreController';
import ServiceTooltip from 'ServiceTooltip';
import TkGlobal from "TkGlobal";
import WebAjaxInterface from "WebAjaxInterface";
import ServiceRoom from "ServiceRoom";
import ServiceSignalling from "ServiceSignalling";
import ServiceTools from "ServiceTools";
import TkAppPermissions from 'TkAppPermissions';

class ClassBroFunctions {
    constructor(prop) {
        // super(props);
    };
    _teacherAloneAndCountDownAlert() { //监听老师是否恶意挂机    &&   临下课10分钟提示下课弹窗 -- 

    };
    _getStatesData(Obj) {}
}

const ClassBroInstance = new ClassBroFunctions();
export default ClassBroInstance;