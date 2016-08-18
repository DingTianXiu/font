/**
 * Created by dtx on 16/8/11.
 */

angular.module("app.login",["ui.router","app.login.controller","app.losePassword.controller"])
    .config(['$stateProvider', '$urlRouterProvider',function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when("",'/login');
        $stateProvider
            .state('login', {
                url: '/login',
                views: {
                    'content': {
                        templateUrl: './views/login.html',
                        controller: 'loginCtrl'
                    }
                }
            })
            .state('losePassword',{
                url: '/losePassword',
                views: {
                    'content': {
                        templateUrl: './views/losePassword.html',
                        controller: 'losePasswordCtrl'
                    }
                }
            })
    }]);