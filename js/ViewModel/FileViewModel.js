/**
 * Created by mk-sfdev on 5/6/14.
 */

var FileViewModel = function (app) {

    var self = this,
        uploadUrl = app.isDev ? '/upload' : 'http://neonlab.studiovsemoe.com/upload.php',
        downloadUrl = app.isDev ? '/upload/?f=' : 'http://neonlab.studiovsemoe.com/upload/',
        dialog = app.Dialog;


    /* =============== */

    this.fileUploadStatus = {
        ready: {
            cssClass: 'question',
            helpText: 'Добавьте нужный фаил с исходными размерами конструкции в формате <b>.cdr</b> или <b>.plt</b>'
        },
        loading: {
            cssClass: 'loading'
        },
        success: {
            cssClass: 'success'
        },
        remove: {
            cssClass: 'remove'
        },
        error: {
            cssClass: 'error',
            helpText: 'Добавьте нужный фаил с исходными размерами конструкции в формате <b>.cdr</b> или <b>.plt</b>'
        }
    };

    this.uploadStatus = ko.observable('ready');
    this.fileName = ko.observable('');
    this.showStatusText = ko.observable(false);

    this.statusClass = ko.computed(function () {
        var st = self.fileUploadStatus[self.uploadStatus()];
        return st ? st.cssClass : 'none__';
    }, this).extend({throttle: 1});

    this.statusText = ko.computed(function () {
        var st = self.fileUploadStatus[self.uploadStatus()];
        return self.showStatusText() && st && st.helpText ? st.helpText : false;
    }, this).extend({throttle: 1});

    this.removeFile = function (doNotAsk) {
        var removeFunc = function () {
            //TODO: important!!!
            dialog.hideModalWindow();
            self.fileName('');
            self.uploadStatus('ready');

            app.WorkArea.SvgImage.removeSvg();
            app.resetData();
        };

        if (doNotAsk) {
            removeFunc();
        } else {
            dialog.showModalWindow({
                message: 'Вы действительно хотите удалить фаил: <b>' + app.File.fileName() + '</b> ?',
                buttons: [
                    {
                        text: 'Да',
                        callback: removeFunc
                    },
                    {
                        text: 'Отмена',
                        callback: function () {
                            dialog.hideModalWindow();
                        }
                    }
                ]
            });
        }

    };

    this.changeInputFile = function (el, event) {

        if (self.fileName()) {
            dialog.showModalWindow({
                type: dialog.modalTypes.info,
                message: 'У Вас загружен фаил: <b>' + self.fileName() + '</b>. Заменить его?',
                buttons: [
                    {
                        text: 'Да',
                        callback: function () {
                            self.removeFile(true);
                            dialog.hideModalWindow();
                            self.changeInputFile(el, event);
                        }
                    },
                    {
                        text: 'Нет',
                        callback: function () {
                            dialog.hideModalWindow();
                        }
                    }
                ]
            });
            return false;
        }

        var element = event.target,
            file = element.files[0],
            data = new FormData();

        self.uploadStatus('loading');
        data.append('cdrfile', file);

//TODO check file extension in JavaScript before upload
        $.ajax({
            url: uploadUrl,
            type: "POST",
            data: data,
            processData: false,  // tell jQuery not to process the data
            contentType: false,   // tell jQuery not to set contentType
            success: function (r) {
                if (r.file) {
                    $.get(downloadUrl + r.file, function (r) {
                        self.uploadStatus('success');
                        self.fileName(file.name);

                        setTimeout(function () {
                            self.uploadStatus('remove');
                        }, 5000);

                        var svgDom = r.firstChild;

                        var recusiveWalk = function (node) {
                            if (node.childNodes && node.childNodes.length) {
                                $.each(node.childNodes, function (i, _node) {
                                    if (_node.getAttribute && _node.tagName) {
                                        var fill = _node.getAttribute('fill');
                                        if (fill) {
                                            if (fill != 'none') {
                                                _node.setAttribute('fill', '#ffffff');
                                            }
                                            _node.setAttribute('stroke', '#000000');
                                            _node.setAttribute('stroke-width', '100');
                                        }
                                    }
                                    recusiveWalk(_node);
                                });
                            }
                        };
                        recusiveWalk(svgDom);
                        app.WorkArea.setSvg(svgDom);
                    });
                }
            },
            error: function (r) {
                self.uploadStatus('error');
                self.showStatusText(true);
            }
        });

//        console.log(file);
//        /* Is the file an image? */
//        if (!file || !file.type.match(/image.*/)) return;
//        /* It is! */
//        self.status('loading');
//
//        /* Lets build a FormData object*/
//        var fd = new FormData();
//        fd.append("image", file); // Append the file
//        var xhr = new XMLHttpRequest(); //
//        xhr.open("POST", uploadUrl);
//        xhr.onload = function () {
//            //document.querySelector("#link").href = JSON.parse(xhr.responseText).upload.links.imgur_page;
//        };
//
//
//        /* And now, we send the formdata */
//        xhr.send(fd);

    };
};