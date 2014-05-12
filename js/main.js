/**
 * Created by mk-sfdev on 4/14/14.
 */
(function (document, window, $) {

    $(function () {

        var form = $('#file_upload'),
            button = form.find('.button'),
            inputFile = form.find('input'),
            $win = $(window);

        button.on('click', function () {
            inputFile.trigger('click');
        });

        var app = new ApplicationViewModel();
        ko.applyBindings(app);

        $__app = app;

        var dialog = app.Dialog;

        window.__trigger__click = function () {
            button.click();
        };

        $win.on('resize', function () {
            app.WorkArea.winWidth($win.width());
            app.WorkArea.winHeight($win.height());
            app.WorkArea.resizeBase();
        });

        $(document).on('keypress', function (e) {
            if (e.keyCode == 27) {
                dialog.hideDialogWindow();
                app.File.showStatusText(false);
            }
        });
        $(document).on('click', function (e) {
            if(!!e.target || !e.target.getAttribute){
                return;
            }
            var $e = $(e.target),
                cls = e.target.getAttribute('class'),
                isClickArea = cls && cls.indexOf('click_area') > -1;
            app.File.showStatusText(isClickArea);

            if ($e.parent().hasClass('remove')) {
                app.File.removeFile()
            }

        });
    });

})(document, window, jQuery);