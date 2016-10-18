var isDev = true;
if(isDev) {
    window.ROOT = '/app';
    var _logHost = 'sso.dev.adt100.net'; // 开发环境
}else{
    window.ROOT = '';
    var _logHost = 'sso007.adt100.com'  //生产机环境
}
logoutUrl = "http://" + _logHost + "/logout?service=http://" + window.location.host + window.ROOT;
var URL = {
    GET_USER_INFO : "/Yishang/user/detail",
    SOLUTION_LIST : "/Yishang/solution/list",
    CREATE_SCHEME : "/Yishang/solution/insert",
    UPDATE_SCHEME : "/Yishang/solution/update",
    MODULE_LIST : "/Yishang/module/list",
    CREATE_MODULE : "/Yishang/module/insert",
    UPDATE_MODULE : "/Yishang/module/update",
    COMPONENT_LIST : "/Yishang/component/inst/selectInstCpts",
    CREATE_CPTINST : "/Yishang/cptInst/add",
    DELETE_CPTINT : "/Yishang/component/inst/delete",
    GET_CPTINST_ATTR : "/Yishang/cptInst/getAttr",
    UPDATE_CPTiNST_ATTR : "/Yishang/cptInst/update",
    UPDATE_GET_DATA : "/Yishang/cptInst/updateAndGetData",
    GET_CPTINST_DATA : "/Yishang/cptInst/getData",
    GET_REL_CPT : "/Yishang/baseCpt/getRelCpt",
    GET_COMPONENT_BASE_LIST : "/Yishang/component/base/list",
    GET_COMPONENT_BASE_DETAIL : "/Yishang/component/base/detail",
    GET_STYLE_LIST : "/Yishang/baseCpt/getStyList",
    GET_PHONE_LIST : "/Yishang/component/data/selectBrandModelList",
    GET_SOURCE_DATA : "/Yishang/config/selectNetInfoSource",
    GET_INST_ATTR_GROUP : "/Yishang/component/inst/groupAttr",         //获取模块关联构件组
    UPDATE_SYNC_TYPE : "/Yishang/component/inst/updateInstCptSyncType",               //设置属性实例同步信息
    UPDATE_PWD : "/Yishang/user/updatePwd",
    UPDATE_INST_CPT_SYNC : "/Yishang/component/inst/updateInstCptSyncType",
    GET_CUSTOMER_LIST : "/Yishang/user/selectCustUserList"
};