/**
 * Created by dtx on 16/8/27.
 */
(function ($) {

    var personalCenter = {




        bindEvent : function () {
            $(".personal_center li").on("click",function () {
                console.log("!");
                $(this).addClass("optionSelected");
                $(this).siblings().removeClass("optionSelected");
            });
        },

        init : function () {
            if(localStorage.userInfo){
                this.userInfo = JSON.parse(localStorage.userInfo);
                console.log(this.userInfo);
                $(".userName").html(this.userInfo.orgName);
                $("#userName").html(this.userInfo.loginName);
                $("#company").html(this.userInfo.orgName);
                $("#registDate").html(this.userInfo.regTime);
                $("#email").html(this.userInfo.email);
                $("#mobilePhone").html(this.userInfo.mobile);
                $(".account").addClass("optionSelected");
            }
            this.bindEvent();
        }
    }.init()







})(jQuery)