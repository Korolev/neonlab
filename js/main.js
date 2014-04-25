/**
 * Created by mk-sfdev on 4/14/14.
 */
(function (document, window, $) {

    $(function () {

        var form = $('#file_upload'),
            button = form.find('.button'),
            inputFile = form.find('input');

        button.on('click', function () {
            inputFile.trigger('click');
        });

        window.__trigger__click = function(){
            button.click();
        }

        var app = new ApplicationViewModel();
        ko.applyBindings(app);

        $__app = app;

        $(document).on('keypress', function (e) {
            if (e.keyCode == 27) {
                app.showDialog(false);
                app.showStatusText(false);
            }
        });
        $(document).on('click', function (e) {
            var $e = $(e.target),
                cls = e.target.getAttribute('class'),
                isClickArea = cls && cls.indexOf('click_area') > -1;
            app.showStatusText(isClickArea);

            if ($e.parent().hasClass('remove')) {
                app.modalMessage('Вы действительно хотите удалить фаил: <b>' + app.fileName() + '</b> ?');
                app.modalButtons([
                    {
                        text: 'Да',
                        callback: function () {
                            app.removeFile();
                        }
                    },
                    {
                        text: 'Отмена',
                        callback: function () {
                            app.showModal(false);
                        }
                    }
                ]);
                app.showModal(true);
            }

        });
    });

})(document, window, jQuery);