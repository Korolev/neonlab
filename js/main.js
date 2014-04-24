/**
 * Created by mk-sfdev on 4/14/14.
 */
(function(document, window, $){

    $(function(){

        var form = $('#file_upload'),
            button = form.find('.button'),
            inputFile = form.find('input');

        button.on('click',function(){
           inputFile.trigger('click');
        });

        var app = new ApplicationViewModel();
        ko.applyBindings(app);

        $__app = app;

        $(document).on('keypress',function(e){
            if(e.keyCode == 27){
                app.showDialog(false);
            }
        })
    });

})(document, window, jQuery);