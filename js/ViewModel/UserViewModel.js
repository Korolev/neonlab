var UserViewModel = function (app) {

    var self = this,
        messages = {
            base: "Пожалуйста, введите Ваши контактные данные.<br>\
            Получите скидку 5%<br>\
                <span style='font-size: 12px;font-style: italic;color: #3782d7;font-family: serif;'>Технический расчет будет отправлен на Ваш электронный адрес.</span>",
            base1: "Пожалуйста, введите Ваши данные,<br>\
            технический расчет будет отправлен на Ваш электронный адрес<br>\
                и Вы всегда сможете вернуться к нему.",
            error:"<span style='color: red'>Пожалуйста, заполните данные корректно,<br>\
            технический расчет будет отправлен на Ваш электронный адрес<br>\
                и Вы всегда сможете вернуться к нему.</span>",
            confirm:"<img src='img/pokerface.png'><br><span style='font-size: 17px'>Ваш расчет отправлен на почту.<br> Спасибо!</span>",
//            baseManager: "<img src='img/pokerface.png'><br><span style='font-size: 17px'>Ваш заказ будет отправлен менеджеру в производство.</span>"
            baseManager: "<span style='font-size: 17px'>Ваш заказ будет отправлен менеджеру в производство.</span>",
            serverWait: "<img src='img/sent_to_server.gif'><br><span style='font-size: 17px'>Идет отправка.</span>",
            serverError: "Что-то пошло не так, и сервер не ответил, попробуйте еще раз посже."
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

    this.disabledButton = ko.observable(false);

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
        if(self.disabledButton()){
            return false;
        }
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
            self.disabledButton(true);
            self.currentMessage(messages.serverWait);
            app.File.sentToServer(function(r){
                self.currentMessage(r ? messages.confirm : messages.serverError);
                setTimeout(function(){
                    self.sentToManager(false);
                    self.disabledButton(false);
                    app.Dialog.hideDialogWindow();
                    self.currentMessage(messages.base);
                },1500);
            });
        }
        return true;
    };


    if (user) {
        for (var key in user) {
            self[key](user[key]);
        }
    }
};