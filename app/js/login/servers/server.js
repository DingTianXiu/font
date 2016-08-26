/**
 * Created by dtx on 16/8/11.
 */

angular.module("app.login.server",[])
    .factory("login",["$http","$q",function ($http,$q) {
        return{
            goLogin: function (_acf_ticket) {
                var defer = $q.defer();
                console.log("111");
                $http({
                    method: 'GET',
                    url: '/yishang/user/detail',
                    params:{
                        '&acf_ticket': _acf_ticket
                    }
                })
                    .success(function (data) {
                        defer.resolve(data);
                    })
                    .error(function (data) {
                        defer.reject(data)
                    });
                return defer.promise;
            },
            checkCode: function () {
                var defer = $q.defer();
                $http({
                    method: 'GET',
                    url: 'https://120.26.45.186:8443/petpet/login.json?userName=xiaodexiaode&password=chunbonanyuan',
                    params:{

                    }
                })
                    .success(function (data) {
                        defer.resolve(data);
                    })
                    .error(function (data) {
                        defer.reject(data)
                    });
                return defer.promise;
            }
        }
    }]);