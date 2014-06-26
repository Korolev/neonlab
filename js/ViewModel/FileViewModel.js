/**
 * Created by mk-sfdev on 5/6/14.
 */

var FileViewModel = function (app) {

    var self = this,
        uploadUrl = app.isDev ? '/upload' : 'upload.php',
        downloadUrl = app.isDev ? '/upload/?f=' : '/upload/',
        diodesUrl = app.isDev ? '/upload/diode.php' : 'diode.php',
        powerUrl = app.isDev ? '/upload/power.php' : 'power.php',
        finishUrl = app.isDev ? '/upload/finish.php' : 'finish.php',
        dialog = app.Dialog;


    /* =============== */
    var helpText = 'Добавьте нужный фаил<br> с исходными размерами конструкции в формате <b>.cdr</b> с любым, внутренним фоном.';

    this.fileUploadStatus = {
        ready: {
            cssClass: 'question',
            helpText: helpText
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
            helpText: helpText
        }
    };

    this.uploadStatus = ko.observable('ready');
    this.fileId = ko.observable('');
    this.fileName = ko.observable('');
    this.showStatusText = ko.observable(false);

    this.fileId.subscribe(function (val) {
        if (val) {
            var s = val + '',
                l = s.length;
            while (l < 4) {
                s = '0' + s;
                l = s.length;
            }
        } else {
            s = '0001';
        }
        app.User.projectNumber(s);
    });

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
        console.log('TYT IE1',uploadUrl);
        $.ajax({
            url: uploadUrl,
            type: "POST",
            data: data,
            cache: false,
            processData: false,  // tell jQuery not to process the data
            contentType: false,   // tell jQuery not to set contentType
            success: function (r) {
                console.log('TYT IE2');
                if(r.status == 0){
                    self.uploadStatus('error');
                    self.showStatusText(true);
                    return false;
                }
                if (r.file) {
                    $.get(downloadUrl + r.file, function (r) {
                        self.uploadStatus('success');
                        self.fileName(file.name);

                        setTimeout(function () {
                            self.uploadStatus('remove');
                        }, 5000);

                        var svgDom = r.querySelector('svg'),
                            fileExtension = file.name.split('.');
                        fileExtension = fileExtension[fileExtension.length-1];

                        if(fileExtension == 'plt' && false ){//TODO remove this block if it never use
                            var paths = [],
                                grps = svgDom.getElementsByTagName('path');

                            each(grps,function(k,p){
                                paths.push(p.getAttribute('d'));
                            });

                            if (window.Worker) {
                                var worker = new Worker('js/workers/pltparser.js');// Create new worker

                                    worker.postMessage({
                                        pathsArr : paths
                                    });

                                worker.onmessage = function (event) {
                                    if (event.data.status == 'complite') {

                                    } else if (event.data.status == 'console') {
                                        console.log(event.data.log);
                                    } else {
                                        //show current complete level
                                        var progress = event.data.progress > 100 ? 100 : event.data.progress;
                                    }
                                }
                            }else {
                                alert('Ваш браузер не поддерживает Web Workers!');
                            }
                        }

                        app.useBetter = false;

                        var recusiveWalk = function (node) {
//TODO move recursive Walk to SvgImage class
                            if (node.childNodes && node.childNodes.length) {
                                if(node.style && node.style.stroke){
                                    node.style.stroke = '#999999';
                                }
                                each(node.childNodes, function (i, _node) {
                                    //console.log(_node);
                                    if (_node.getAttribute && _node.tagName) {
                                        var fill = _node.getAttribute('fill');
                                        if (fill) {
                                            if (fill != 'none') {
                                                _node.setAttribute('fill', '#ffffff');
                                            }
                                            _node.setAttribute('stroke', '#999999');//#555555
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
                if (r.id) {
                    self.fileId(r.id);
                }

            },
            error: function (r) {
                console.log('TYT IE FAIL');
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

    this.loadDiode = function (callback) {
        $.ajax({
            url: diodesUrl,
            success: function (r) {
                callback && callback(r.diode);
            },
            error: function (r) {
                callback && callback(false);
            }
        });
    };

    this.loadPower = function (callback) {
        $.ajax({
            url: powerUrl,
            success: function (r) {
                callback && callback(r.power);
            },
            error: function (r) {
                callback && callback(false);
            }
        });
    };

    this.sentToServer = function (callback) {
        if (app.WorkArea.isReady()) {
            var data = {
                    id: self.fileId(),
                    svg: app.WorkArea.fullSizeSVG,
                    name: app.User.userName(),
                    email: app.User.userEmail(),
                    phone: app.User.userPhone(),
                    manager: app.User.sentToManager()
                },
                additionalData = {
                    items: app.usedItemsList(),
                    perimeter: app.perimetr(),
                    dimension: app.size(),
                    depth: app.greedDeep(),
                    total: app.projectCost(),
                    itemsCount: app.pointsCount(),
                    totalPower: app.pointsWattCount()
                };
            data.data = JSON.stringify(additionalData);
            $.ajax({
                url: finishUrl,
                type: 'POST',
                data: data,
                success: function (r) {
                    if(r.status && r.status == 1){
                        callback && callback(r);
                    }else{
                        callback(false);
                    }
                },
                error: function (r) {
                    callback && callback(false);
                }
            });
        }
    }
};