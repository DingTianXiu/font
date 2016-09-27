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
                    $(".resetSuccess").css("display","none");
                    $(".option").html("修改密码");
                }else {
                    $("#currentPwd").val("");
                    $("#newPwd").val("");
                    $("#repeatPwd").val("");
                    $(".personal_center_right").css("display","block");
                    $(".resetPasswordContainer").css("display","none");
                    $(".resetSuccess").css("display","none");
                    $(".option").html("账号信息");
                }
            });
            //弃用
            // $("#currentPwd").on("blur",function () {
            //     that.validaCurrent();
            //     that.showSubmit();
            // });
            // $("#newPwd").on("blur",function () {
            //     that.validaNewPwd();
            //     that.showSubmit();
            // });
            // $("#repeatPwd").on("blur",function () {
            //     that.validaRepeatPwd();
            //     that.showSubmit();
            // });
            $("input").on("keyup",function () {
                that.showSubmit();
            });
            $("#submitBtn").on("click",function () {
                that.validation();
                if(that.currentPwd&&that.repeatPwd&&that.newPwd){
                    that.resetPwd();
                }
            })
        },
        init : function () {
            if(localStorage.userInfo){
                this.userInfo = JSON.parse(localStorage.userInfo);
                $(".option").html("账号信息");
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

        //弃用
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

        //弃用
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

        //弃用
        validaRepeatPwd : function () {
            var that = this;
            var newPwd = $("#newPwd").val(),
                repeatPwd = $("#repeatPwd").val();
            if(newPwd!=repeatPwd){
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

        validation : function () {
            var that = this;
            var currentPwd = $("#currentPwd").val(),
                newPwd = $("#newPwd").val(),
                repeatPwd = $("#repeatPwd").val();
            if(!currentPwd){
                that.showErr();
                $("#messageTip").html("请输入当前密码").addClass("err");
                $("#currentPwd").css("borderBottom","2px solid #f25e61");
                $("#currentPwd").on("focus",function () {
                    $(this).val("").css("borderBottom","1px solid #d0d0d1");
                });
                return that.currentPwd = false
            }else{
                $("#currentPwd").unbind("focus");
                that.currentPwd = true
            }
            var patt = new RegExp("^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}$");//包含大小写字母和数字的组合，不能使用特殊字符，长度在8-16之间
            if(!patt.test(newPwd)){
                that.showErr();
                $("#messageTip").html("密码格式不符合要求").addClass("err");
                $("#newPwd").css("borderBottom","2px solid #f25e61");
                $("#newPwd").on("focus",function () {
                    $(this).val("").css("borderBottom","1px solid #d0d0d1");
                });
                return that.newPwd = false
            }else{
                $("#newPwd").unbind("focus");
                that.newPwd = true
            }
            if(newPwd!=repeatPwd){
                that.showErr();
                $("#messageTip").html("两次输入密码不相同").addClass("err");
                $("#repeatPwd").css("borderBottom","2px solid #f25e61");
                $("#repeatPwd").on("focus",function () {
                    $(this).val("").css("borderBottom","1px solid #d0d0d1");
                });
                return that.repeatPwd = false
            }else{
                $("#repeatPwd").unbind("focus");
                that.repeatPwd = true
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

        showErr : function () {
            $("#submitBtn").hide();
            $("#messageTip").show();
            setTimeout(function () {
                $("#messageTip").hide();
                $("#submitBtn").show();
            },3000);
        },

        resetPwd : function () {
            var that = this;
            var pwdDetail = {
                curPwd : $("#currentPwd").val(),
                newPwd : $("#newPwd").val(),
                repeatPwd : $("#repeatPwd").val()
            };
            $.ajaxJSON({
                name: "更改密码",
                url: URL.UPDATE_PWD,
                data: pwdDetail,
                type : "post",
                iframe : true,
                success : function () {
                    $(".personal_center_right").css("display","none");
                    $(".resetPasswordContainer").css("display","none");
                    $(".resetSuccess").css("display","block");
                },
                fail : function (data) {
                    console.log(data);
                    if(data.msg == "密码不正确"){
                        that.showErr();
                        $("#messageTip").html("密码不正确").addClass("err");
                        $("#currentPwd").css("borderBottom","2px solid #f25e61");
                        $("#currentPwd").on("focus",function () {
                            $(this).val("").css("borderBottom","1px solid #d0d0d1");
                        });
                        return that.currentPwd = false
                    }else if(data.msg == "原密码长度必须在6-32位;"){
                        that.showErr();
                        $("#messageTip").html("原密码长度必须在6-32位;").addClass("err");
                        $("#currentPwd").css("borderBottom","2px solid #f25e61");
                        $("#currentPwd").on("focus",function () {
                            $(this).val("").css("borderBottom","1px solid #d0d0d1");
                        });
                        return that.currentPwd = false
                    }
                }
            });

        }
    }.init()

})(jQuery)