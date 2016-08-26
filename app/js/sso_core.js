/**
 * SSO跨域登录实现
 * @options 属性定义
 *          formId  本地系统登录表单
 *          vcId 表单验证码控件ID
 *          localDomain 本地系统的域名
 *          loginSuccessCall 登录成功回调
 *          loginFailCall 登录失败回调
 *          beforeLoginCall 登录前回调
 * @constructor
 */
function xd_sso(options) {
    if(!String.prototype.trim){ //判断下浏览器是否自带有trim()方法
        String.prototype.trim=function() {
            return this.replace(/^\s+|\s+$/g, '');
        };
    };
    var _this = this;

    _this.options = options || {};
    _this.options.local_server = _this.options.localDomain;
    delete _this.options.localDomain;
    if (!_this.options.local_server || _this.options.local_server.length < 1) {
        var msg = "请定义本地系统的域名!!";
        _this.options.loginFail && _this.options.loginFail(msg);
        throw msg;
    }
    if (options.vcId) {
        _this.vcImg = document.getElementById(options.vcId);
        if (_this.vcImg) {
            _this.vcImg.src = _this.sso_server + "/image?t=" + new Date().getTime();
            _this.vcImg.onclick = function () {
                this.src = _this.sso_server + '/image?' + new Date().getTime();
                return false;
            }
        }
        _this.validateCode = document.getElementsByName("validateCode")[0];
    }
    _this.loginKey = document.getElementsByName("loginKey")[0];
    _this.password = document.getElementsByName("password")[0];
    _this.passwordTemp = document.getElementsByName("passwordTemp")[0];
    _this.execution = document.getElementsByName("execution")[0];
    _this.loginTicket = document.getElementsByName("lt")[0];
    _this.loginForm = document.forms[_this.options.formId];
    _this.loginForm.action = _this.sso_server + "/login?service=" + encodeURIComponent(_this.options.local_server);
    _this.flushLoginTicket();
    return _this;
}

xd_sso.prototype.sso_server = "http://sso.dev.adt100.net";
xd_sso.prototype.api_server = "http://api.dev.adt100.net";

xd_sso.prototype.flushOnLoginFail = function () {
    var _this = this;
    _this.vcImg && _this.vcImg.click();
    _this.password.value = "";
    if (_this.validateCode) {
        _this.validateCode.value = "";
    }
};

xd_sso.prototype.flushLoginTicket = function (call) {
    var _this = this;
    var _services = 'service=' + encodeURIComponent(_this.options.local_server);
    var url = _this.sso_server + '/login?' + _services + '&get-lt=true';

    _this.json_p(url, {
        success: function (data) {
            if (data.hasLogin) {
                _this.update(data.ticket);
            } else if (data.error) {
                failAbleCall(_this.options.loginFailCall, data.msg);
            } else {
                _this.loginTicket.value = data.lt;
                _this.execution.value = data.fk;
                call && call();
            }
        },
        fail: function () {
            failAbleCall(_this.options.loginFailCall, '超时,服务器正忙，请稍后再试..');
        },
        timeout: 10000
    })
};

xd_sso.prototype.deleteIFrame = function (iframeName) {
    var iframe = document.getElementById(iframeName);
    if (iframe) { // 删除用完的iframe，避免页面刷新或前进、后退时，重复执行该iframe的请求
        iframe.parentNode.removeChild(iframe);
    }
};

xd_sso.prototype.basicLoginCallBack = function (result) {
    var _this = this;
    _this.passwordTemp.disabled = false;
    if (result.login == 'fails') {
        _this.flushLoginTicket();
        _this.flushOnLoginFail();
        failAbleCall(_this.options.loginFailCall, result.msg);
    } else {
        _this.update(result.ticket);
    }
};

xd_sso.prototype.update = function (ticket) {
    var _this = this;
    _this.json_p(_this.api_server + "/login/" + ticket, {
        success: function (data) {
            if (data.status == 200) {
                failAbleCall(_this.options.loginSuccessCall, ticket);
            } else {
                failAbleCall(_this.options.loginFailCall, data.msg);
            }
        },
        fail: function (data) {
            failAbleCall(_this.options.loginFailCall, '超时,服务器正忙，请稍后再试..');
        },
        timeout: 5000
    })
};

xd_sso.prototype.feedBackUrlCallBack = function (result) {
    var _this = this;
    _this.basicLoginCallBack(result);
    _this.deleteIFrame('ssoLoginFrame');// 删除用完的iframe,但是一定不要在回调前删除，Firefox可能有问题的
};

xd_sso.prototype.loginValidate = function () {
    var _this = this;
    /* if (_this.getVal(_this.options.ltId).length == 0) {
     failAbleCall(_this.options.loginFailCall, '服务器正忙，请稍后再试..');
     return false;
     } else {*/
    if (null == document.getElementById("ssoLoginFrame")) {
        var ret = failAbleCall(_this.options.beforeLoginCall);
        if (ret == false) {
            return false;
        }
        var anyError = false;
        var errMsg = "";
        _this.loginKey.value = _this.loginKey.value.trim();
        if (_this.loginKey.value.length < 1) {
            errMsg = "登录账号不能为空!!!";
            anyError = true;
        } else {
            _this.passwordTemp.value = _this.passwordTemp.value.trim();
            if (_this.passwordTemp.value.length < 1) {
                errMsg = "登录密码不能为空!!!";
                anyError = true;
            } else {
                if (_this.validateCode) {
                    _this.validateCode.value = _this.validateCode.value.trim();
                    if (_this.validateCode.value.length < 1) {
                        errMsg = "验证码不能为空!!!";
                        anyError = true;
                    }
                }
            }
        }

        if (anyError) {
            failAbleCall(_this.options.loginFailCall,errMsg);
            return !anyError;
        }
        // 验证成功后，动态创建用于提交登录的 iframe
        _this.flushLoginTicket(function () {
            var iframe;
            try {
                iframe = document.createElement('<iframe name="ssoLoginFrame" style="display:none;width:0;height:0" id="ssoLoginFrame" src="javascript:false;"></iframe>');
            } catch (e) {
                iframe = document.createElement('iframe');
                iframe.name = 'ssoLoginFrame';
                iframe.id = "ssoLoginFrame";
                iframe.style.display = "none";
                iframe.style.width = "0";
                iframe.style.height = "0";
                iframe.src = "javascript:false;";
            }
            document.body.appendChild(iframe);
            _this.passwordTemp.disabled = true;
            _this.loginForm.submit();
        });
    }
    return false;
    //}
};

xd_sso.prototype.json_p = function (url, options) {
    options = options || {};
    options.timeout = options.timeout || 20000;//默认20S超时
    var call_bak_param = options.jsonp || 'callback';
    var oHead = document.getElementsByTagName('head')[0];
    var oS = document.createElement('script');
    var callbackName = ('jsonp_' + Math.random()).replace(".", "");

    oHead.appendChild(oS);

    window[callbackName] = function (json) {
        oHead.removeChild(oS);
        clearTimeout(oS.timer);
        window[callbackName] = null;
        failAbleCall(options.success, json)
    };
    if (url.indexOf("?") > -1) {
        url = url + '&t=' + new Date().getTime() + "&" + call_bak_param + "=" + callbackName
    } else {
        url = url + '?t=' + new Date().getTime() + "&" + call_bak_param + "=" + callbackName
    }
    oS.src = url;
    if (options.timeout) {
        oS.timer = setTimeout(function () {
            window[callbackName] = null;
            oHead.removeChild(oS);
            options.fail && options.fail({message: "超时"});
        }, options.timeout);
    }
};

xd_sso.logout = function (redirect) {
    top.location.href = xd_sso.prototype.sso_server + "/logout?service=" + redirect;
};

function failAbleCall(call, args) {
    if (typeof(call) == "function") {
        return call(args);
    } else {
        alert("warnning!!!!没有定义回调或者回调不是Function");
    }
    return false;
}