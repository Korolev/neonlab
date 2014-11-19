/**
 * Created by mk-sfdev on 5/6/14.
 */


var DialogViewModel = function(app){

    var self = this,
        defButtonSet = [
            {
                text: 'Ok',
                callback: function () {
                    self.hideModalWindow();
                }
            }
        ];
    this.modalTypes = {'alert':'alert', 'info':'info'};

/*=======Modals========*/
    this.showModal = ko.observable(false);
    this.modalType = ko.observable(self.modalTypes[0]);
    this.modalMessage = ko.observable('This is text for test like a "Lorem ipsum"');
    this.modalButtons = ko.observableArray(defButtonSet);

    this.cssTop = ko.observable($(window).scrollTop()+20);

    this.showModalWindow = function(opts){
        if(opts){
            self.modalType(opts.type || self.modalTypes.alert);
            self.modalMessage(opts.message || '');
            self.modalButtons(opts.buttons || defButtonSet);
        }
        self.showModal(true);
    };

    this.hideModalWindow = function(){
        self.showModal(false);
    };
/*=======Dialogs========*/
    this.showDialog = ko.observable(false);

    this.showDialogWindow = function(){
        self.showDialog(true);
    };

    this.hideDialogWindow = function(){
        self.showDialog(false);
    };
};