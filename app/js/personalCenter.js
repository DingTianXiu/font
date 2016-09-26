/**
 * Created by dtx on 16/8/27.
 */
(function ($) {

    var personalCenter = {
        bindEvent : function () {
            var that = this;
            $(".tab li").on("click",function () {
                $(this).addClass("optionSelected");
                $(this).siblings().removeClass("optionSelected");
                if($(this).html()=="修改密码"){
                    $(".personal_center_right").css("display","none");
                    $(".resetPasswordContainer").css("display","block");
                }else {
                    $(".personal_center_right").css("display","block");
                    $(".resetPasswordContainer").css("display","none");
                }
            });
            $("#currentPwd").on("blur",function () {
                that.validaCurrent();
                that.showSubmit();
            });
            $("#newPwd").on("blur",function () {
                that.validaNewPwd();
                that.showSubmit();
            });
            $("#repeatPwd").on("blur",function () {
                that.validaRepeatPwd();
                that.showSubmit();
            });
            $("input").on("keyup",function () {
                that.showSubmit();
            });
            $("#submitBtn").on("click",function () {
                that.resetPwd();
            })
        },
        init : function () {
            if(localStorage.userInfo){
                this.userInfo = JSON.parse(localStorage.userInfo);
                $(".userName").html(this.userInfo.orgName);
                $("#userName").html(this.userInfo.loginName);
                $("#company").html(this.userInfo.orgName);
                $("#registDate").html(this.userInfo.regTime);
                $("#email").html(this.userInfo.email);
                $("#mobilePhone").html(this.userInfo.mobile);
                $(".account").addClass("optionSelected");
            }
            this.bindEvent();
        },

        validaCurrent : function () {
            var that = this;
            var currentPwd = $("#currentPwd").val();
            if(!currentPwd){
                $("#messageTip").html("请输入当前密码").addClass("err");
                $("#currentPwd").css("borderBottom","2px solid #f25e61");
                $("#currentPwd").on("focus",function () {
                    $(this).val("").css("borderBottom","1px solid #d0d0d1");
                });
                return that.currentPwd = false
            }else{
                $("#currentPwd").unbind("focus");
                return that.currentPwd = true
            }
        },

        validaNewPwd : function () {
            var that = this;
            var newPwd = $("#newPwd").val();
            var patt = new RegExp("^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}$");//包含大小写字母和数字的组合，不能使用特殊字符，长度在8-16之间
            if(!patt.test(newPwd)){
                $("#messageTip").html("密码格式不符合要求").addClass("err");
                $("#newPwd").css("borderBottom","2px solid #f25e61");
                $("#newPwd").on("focus",function () {
                    $(this).val("").css("borderBottom","1px solid #d0d0d1");
                });
                return that.newPwd = false
            }else{
                $("#newPwd").unbind("focus");
                return that.newPwd = true
            }
        },

        validaRepeatPwd : function () {
            var that = this;
            var newPwd = $("#newPwd").val(),
                repaetPwd = $("#repeatPwd").val();
            if(newPwd!=repaetPwd){
                $("#messageTip").html("两次输入密码不相同").addClass("err");
                $("#repeatPwd").css("borderBottom","2px solid #f25e61");
                $("#repeatPwd").on("focus",function () {
                    $(this).val("").css("borderBottom","1px solid #d0d0d1");
                });
                return that.repeatPwd = false
            }else{
                $("#repeatPwd").unbind("focus");
                return that.repeatPwd = true
            }
        },

        showSubmit : function () {
            var currentPwd = $("#currentPwd").val(),
                newPwd = $("#newPwd").val(),
                repeatPwd = $("#repeatPwd").val();
            if(currentPwd&&newPwd&&repeatPwd){
                $("#submitBtn").css("display","inline-block");
                $("#messageTip").css("display","none");
            }
        },

        resetPwd : function () {
            var that = this;
            if(that.currentPwd&&that.repeatPwd&&that.newPwd){
                alert("show");
            }
        }
    }.init()

})(jQuery)