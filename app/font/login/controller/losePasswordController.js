/**
 * Created by dtx on 16/8/15.
 */

angular.module("app.losePassword.controller",["app.losePassword.server"])
    .controller("losePasswordCtrl",["$scope","$q","login","losePassword","$interval",function ($scope,$q,login,losePassword,$interval) {


        /*step1*/

        /*忘记密码btn状态设置*/
        $scope.message = "下一步";
        $scope.codeWrong = false;
        $scope.passwordWrong = false;
        $scope.phoneRight = false;

        /*忘记密码--验证码验证*/
        $scope.err = false;
        var codeWatch = $scope.$watch(function () {
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
                            codeWatch();
                            $scope.getCode_defer.resolve(true);
                        }
                    })
                return $scope.getCode_defer.promise;
            }else if($scope.auth && $scope.auth.code && $scope.auth.code.length>4){
                $scope.err = true;
                $scope.codeWrong = true;
                $scope.message = "请输入正确验证码";
            }else{
                $scope.codeWrong = false;
                $scope.err = false;
                $scope.message = "下一步";
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
            $scope.message = "下一步";
        };

        /*忘记密码--手机号认证*/
        $scope.checkPhone = function () {
            //$q延迟执行
            if($scope.getCode_defer && $scope.getCode_defer.promise){
                $scope.waiting = true;
                $scope.message = "正在验证...";
                $scope.getCode_defer.promise
                    .then(function (isTrue) {
                        if(isTrue){
                            losePassword.checkPhone()
                                .then(function (data) {
                                    if(data){
                                        //跳转路由
                                    }else{
                                        //后端验证失败处理
                                        $scope.waiting = false;
                                        $scope.err = true;
                                        $scope.passwordWrong = true;
                                        $scope.message = "请输入正确手机号"
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

        /*step2*/

        /*计时器*/
        $scope.second = 45;
        $scope.isZero = false;
        $scope.countdown = function () {
            $scope.second--;
            if($scope.second<0){
                $scope.isZero = true;
                $scope.stop();
                console.log($scope.second);
            }
        };
        $scope.stop = function () {
            $interval.cancel(stopInterval);
            console.log("stop");
        };
        var stopInterval = $interval($scope.countdown,1000);
        $scope.sendCode = function () {
            $scope.second = 3;
            $scope.isZero = false;
            stopInterval = $interval($scope.countdown,1000);
            losePassword.sendCode();
        };

        /*忘记密码--手机验证码认证*/
            $scope.err = false;
            var phoneCodeWatch = $scope.$watch(function () {
                if($scope.auth && $scope.auth.code){
                    return $scope.auth.code
                }else{
                    return
                }
            },function(){
                if($scope.auth && $scope.auth.code && $scope.auth.code.length==4){
                    $scope.getPhoneCode_defer = $q.defer();
                    losePassword.checkPhoneCode()
                        .then(function (data){
                            if(!data){
                                $scope.err = true;
                                $scope.codeWrong = true;
                                $scope.message = "请输入正确验证码";
                                $scope.getPhoneCode_defer.reject(false);
                            }else{
                                phoneCodeWatch();
                                $scope.getPhoneCode_defer.resolve(true);
                            }
                        })
                    return $scope.getPhoneCode_defer.promise;
                }else if($scope.auth && $scope.auth.code && $scope.auth.code.length>4){
                    $scope.err = true;
                    $scope.codeWrong = true;
                    $scope.message = "请输入正确验证码";
                }else{
                    $scope.codeWrong = false;
                    $scope.err = false;
                    $scope.message = "下一步";
                }
            });

        /*忘记密码--手机验证码认证成功,跳转step3*/
        $scope.checkPhoneCode = function () {
            if($scope.getPhoneCode_defer && $scope.getPhoneCode_defer.promise){
                $scope.waiting = true;
                $scope.message = "正在验证...";
                $scope.getPhoneCode_defer.promise
                    .then(function (isTrue) {
                        if(isTrue){
                            losePassword.checkPhone()
                                .then(function (data) {
                                    if(data){
                                        //跳转路由
                                    }else{
                                        //后端验证失败处理
                                        $scope.waiting = false;
                                        $scope.err = true;
                                        $scope.passwordWrong = true;
                                        $scope.message = "请输入正确手机号"
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
        }
    }]);