var _host = window.location.host;
if (_host.indexOf('dev') > -1 || _host.indexOf('local') > -1 || _host.indexOf('10.2') > -1) {	// 测试环境
	document.write('\x3Cscript type="text/javascript" src="http://sso.dev.adt100.net/remote_sso_request/sso_core2.js">\x3C/script>');
} else {
	document.write('\x3Cscript type="text/javascript" src="http://sso007.adt100.com/remote_sso_request/sso_core2.js">\x3C/script>');
}
