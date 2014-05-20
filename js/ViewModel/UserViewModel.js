var UserViewModel = function (app) {

    var self = this,
        messages = {
            base: "Пожалуйста, введите Ваши данные,<br>\
            технический расчет будет отправлен на Ваш электронный адрес<br>\
                и Вы всегда сможете вернуться к нему."
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
    this.sentToManager = false;
    this.userPhoneMask = ko.observable('+7 (999) 999-99-99');

    this.projectNumber = ko.observable('0001');

    this.isEmpty = ko.computed(function(){
        return !self.userName() || !self.userEmail() || !self.userPhone();
    },this).extend({throttle:1});

    this.saveUserInfo = function () {
        app.Dialog.hideDialogWindow();
        var data = {
            userName: self.userName(),
            userEmail: self.userEmail(),
            userPhone: self.userPhone(),
            projectNumber: self.projectNumber()
        };
        var exp = new Date([self.rememberMe() ? 2020 : 2002]);
        setCookie('userInfo', encodeURIComponent(JSON.stringify(data)), {expires: exp});
        app.File.sentToServer(function(){
            self.sentToManager = false;
        });
    };


    if (user) {
        for (var key in user) {
            self[key](user[key]);
        }
    }
};