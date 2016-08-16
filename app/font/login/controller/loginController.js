/**
 * Created by dtx on 16/8/11.
 */

angular.module("app.login.controller",["app.login.server"])
    .controller("loginCtrl",["$rootScope","$scope","$state","login","$q",function ($rootScope,$scope,$state,login,$q) {

        /*登录btn状态设置*/
        $scope.message = "登录";
        $scope.codeWrong = false;
        $scope.passwordWrong = false;

        /*用户认证--验证码验证*/
        $scope.err = false;
        var authWatch = $scope.$watch(function () {
            if($scope.auth && $scope.auth.code){
                return $scope.auth.code
            }else{
                return
            }
        },function(){
            if($scope.auth && $scope.auth.code && $scope.auth.code.length==4){
                $scope.getCode_defer = $q.defer();
                login.checkCode()
                    .then(function (data){
                        if(!data){
                            $scope.err = true;
                            $scope.codeWrong = true;
                            $scope.message = "请输入正确验证码";
                            $scope.getCode_defer.reject(false);
                        }else{
                            authWatch();
                            $scope.getCode_defer.resolve(true);
                        }
                    });
                return $scope.getCode_defer.promise;
            }else if($scope.auth && $scope.auth.code && $scope.auth.code.length>4){
                $scope.err = true;
                $scope.codeWrong = true;
                $scope.message = "请输入正确验证码";
            }else{
                $scope.codeWrong = false;
                $scope.err = false;
                $scope.message = "登录";
            }
        });

        /*点击验证码输入框,清空*/
        $scope.codeClick = function () {
            if($scope.auth  && $scope.auth.code && $scope.auth.code){
                $scope.auth.code = "";
            }
            $scope.codeWrong = false;
            $scope.err = false;
            $scope.waiting = false;
            $scope.message = "登录";
        };



        /*用户认证--登录认证*/

        $scope.goLogin = function () {
            //$q延迟执行
            if($scope.getCode_defer && $scope.getCode_defer.promise){
                $scope.waiting = true;
                $scope.message = "正在登录...";
                $scope.getCode_defer.promise
                    .then(function (isTrue) {
                        if(isTrue){
                            login.goLogin()
                                .then(function (data) {
                                    if(data){
                                        $state.go(home);
                                    }else{
                                        //后端验证失败处理
                                        $scope.waiting = false;
                                        $scope.err = true;
                                        $scope.passwordWrong = true;
                                        $scope.message = "请输入正确用户名或密码!"
                                    }
                                });
                        }else {
                            $scope.err = true;
                            $scope.waiting = false;
                            $scope.message = "请输入正确验证码"
                        }
                    })
            }else {
                $scope.err = true;
                $scope.codeWrong = true;
                $scope.message = "请输入正确验证码"
            }
        };

        /*点击用户名输入框,不清空*/
        $scope.userClick = function () {
            //nothing happened
        };

        /*点击密码输入框,清空*/
        $scope.passwordClick = function () {
            if($scope.auth && $scope.auth.password){
                $scope.auth.password = "";
            }
            $scope.waiting = false;
        };
    }]);