var UserViewModel = function (app) {

    var self = this,
        messages = {
            base: "Пожалуйста, введите Ваши данные,<br>\
            технический расчет будет отправлен на Ваш электронный адрес<br>\
                и Вы всегда сможете вернуться к нему.",
            error:"<span style='color: red'>Пожалуйста, заполните данные корректно,<br>\
            технический расчет будет отправлен на Ваш электронный адрес<br>\
                и Вы всегда сможете вернуться к нему.</span>",
            confirm:"<img src='img/pokerface.png'><br><span style='font-size: 17px'>Ваш расчет отправлен на почту.<br> Спасибо!</span>",
            baseManager: "<img src='img/pokerface.png'><br><span style='font-size: 17px'>Ваш заказ будет отправлен менеджеру в производство.</span>"
        };

    var user = (function () {
        var data = getCookie('userInfo');
        if (data) {
            data = decodeURIComponent(data);
            data = JSON.parse(data);
        }
        return data;
    })();


    this.currentMessage = ko.observable(messages.base);
    this.rememberMe = ko.observable(true);
    this.userName = ko.observable('');
    this.userEmail = ko.observable('');
    this.userPhone = ko.observable('');
    this.sentToManager = ko.observable(false);
    this.userPhoneMask = ko.observable('+7 (999) 999-99-99');

    this.projectNumber = ko.observable('0001');

    this.sentToManager.subscribe(function(val){
       if(val){
           self.currentMessage(messages.baseManager)
       }else{
           self.currentMessage(messages.base);
       }
    });

    this.isEmpty = ko.computed(function(){
        self.currentMessage(messages.base);
        return !self.userName() || !self.userEmail() || !self.userPhone();
    },this).extend({throttle:1});

    this.saveUserInfo = function () {
        if(self.isEmpty()){
            self.currentMessage(messages.error);
            return false;
        }else{
            var data = {
                userName: self.userName(),
                userEmail: self.userEmail(),
                userPhone: self.userPhone(),
                projectNumber: self.projectNumber()
            };
            var exp = new Date([self.rememberMe() ? 2020 : 2002]);
            setCookie('userInfo', encodeURIComponent(JSON.stringify(data)), {expires: exp});
            app.File.sentToServer(function(){
                self.currentMessage(messages.confirm);
                setTimeout(function(){
                    self.sentToManager(false);
                    app.Dialog.hideDialogWindow();
                },1500);

            });
        }
    };


    if (user) {
        for (var key in user) {
            self[key](user[key]);
        }
    }
};