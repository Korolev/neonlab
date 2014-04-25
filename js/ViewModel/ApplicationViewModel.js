/**
 * Created by mk-sfdev on 4/17/14.
 */
//147.svg - KARO

var ApplicationViewModel = function () {
    var self = this,
        messages = {
            base: "Пожалуйста, введите Ваши данные,<br>\
            технический расчет будет отправлен на Ваш электронный адрес<br>\
                и Вы всегда сможете вернуться к нему."
        },
        uploadUrl = 'http://neonlab.studiovsemoe.com/upload.php',
        downloadUrl = 'http://neonlab.studiovsemoe.com/upload/',
        editor_holder = $('.editor_base'),
        workrarea_width = editor_holder.width(),
        workarea_height = editor_holder.height(),
        greedStep = 100;

    /* =============== */
    this.canvas = Snap('#editor_svg').attr({
        width: workrarea_width,
        height: workarea_height
    });

    for (var i = greedStep; i <= workrarea_width; i += greedStep) {
        self.canvas.line(i, 0, i, workarea_height).attr({"stroke-dasharray": "10 10", stroke: '#d7e2ec'});
    }
    for (var i = greedStep; i <= workarea_height; i += greedStep) {
        self.canvas.line(0, i, workrarea_width, i).attr({"stroke-dasharray": "10 10", stroke: '#d7e2ec'});
    }

    this.workAreaReady = ko.observable(true);
    this.svgObject = ko.observable();
    this.svgOrignHTML = ko.observable();
    this.svgStartunitType = 0;
    this.svgScale = ko.observable(1);
    this.greedDeep = ko.observable();

    /* =============== */
    this.modalTypes = ['alert', 'info'];
    this.showModal = ko.observable(false);
    this.modalType = ko.observable(self.modalTypes[0]);
    this.modalMessage = ko.observable('This is text for test like a "Lorem ipsum"');
    this.modalButtons = ko.observableArray([
        {
            text: 'Ok',
            callback: function () {
                console.log('Ok')
            }
        },
        {
            text: 'Otmena',
            callback: function () {
                console.log('Otmena')
            }
        }
    ]);
    /* =============== */

    this.showStatusText = ko.observable(false);
    this.showDialog = ko.observable(false);
    this.currentMessage = ko.observable(messages.base);
    this.userName = ko.observable('');
    this.userEmail = ko.observable('');
    this.userPhone = ko.observable('');
    this.userPhoneMask = ko.observable('+7 (999) 999-99-99');
    /* =============== */
    this.diodInfo = [
        {h1: '60-100', name: 'X-Led Samsung 25', size: '20x9', luminous: '25', power: '0.6', distance: '100', price: '20'},
        {h1: '80-150', name: 'X-Led Samsung 50', size: '25x25', luminous: '50', power: '0.72', distance: '165', price: '32'},
        {h1: '130-200', name: 'X-Led Samsung 80', size: '25x25', luminous: '80', power: '0.72', distance: '215', price: '53'},
        {h1: '180-250', name: 'X-Led Samsung 120', size: '25x25', luminous: '120', power: '0.72', distance: '215', price: '60'}
    ];
    this.diodType = ko.observable(1);
    this.pointsCount = ko.observable(0);
    this.pointsWattCount = ko.computed(function () {
        var res = self.pointsCount() * parseFloat(self.diodInfo[self.diodType()].power);
        return Math.round(res);
    }, this).extend({throttle: 10});
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

    this.statusClass = ko.computed(function () {
        var st = self.fileUploadStatus[self.uploadStatus()];
        return st ? st.cssClass : 'none__';
    }, this).extend({throttle: 1});

    this.statusText = ko.computed(function () {
        var st = self.fileUploadStatus[self.uploadStatus()];
        return self.showStatusText() && st && st.helpText ? st.helpText : false;
    }, this).extend({throttle: 1});

    this.getSvgImg = ko.computed(function () {
        var html = '',
            s = self.canvas.select('svg');


        if (self.svgObject()) {
//            html = s.node.outerHTML
        }

        return html;
    }, this).extend({throttle: 100});

    /* =============== */
    self.svgScale.subscribe(function (val) {
        if (val && val > 0) {
            self.svgObject().setAttribute('transform', 'scale(' + val + ')');
        }
    });

    self.greedDeep.subscribe(function (val) {
        var v = parseInt(val, 10),
            error = false;
        if (isNaN(v)) {
            v = 80;
            error = true;
        } else if (v < 60) {
            v = 80;
            error = true;
        } else if (v > 250) {
            v = 200;
            error = true;
        }
        if (error) {
            self.modalMessage('Введенная глубина конструкции не попадает в диапазон от 60 мм до 250 мм. Попробуйте еще раз!');
            self.modalButtons([
                {
                    text: 'Ok',
                    callback: function () {
                        self.showModal(false);
                    }
                }
            ]);
            setTimeout(function () {
                self.showModal(false);
            }, 4000);
            self.showModal(true);
        }
        self.greedDeep(v);
    });

    this.removeFile = function () {
        self.showModal(false);
        self.uploadStatus('ready');
        console.log('VSE');
    };

    this.calculateDiod = function () {
        /*
         * 20x9(d:60-100)
         * 25x25(d:80-150)
         * 25x25(d:150-200)
         * 25x25(d:180-250)
         * */
        var ifrm = document.createElement('IFRAME'),
            svgHtml = self.svgOrignHTML();

        self.workAreaReady(false);

        ifrm.setAttribute('src', location.origin + location.pathname + 'iframe.html');
        ifrm.style.width = '300px';
        ifrm.style.height = '300px';
        document.body.appendChild(ifrm);
        self.ifrm = ifrm;


        var ifrmWin = ifrm.contentWindow,
            ifrmDoc = ifrmWin.document;


        $(ifrm).load(function () {
            var _Snap = ifrmWin.Snap,
                deep = self.greedDeep();

            var b = _Snap(ifrmWin.document.body);
            b.append(_Snap.parse(svgHtml));

            var canvas = b.select('svg'),
                canvasWidth = parseInt(canvas.attr('width'), 10),
                canvasHeight = parseInt(canvas.attr('height'), 10),
                svgBCR = canvas.node.getBoundingClientRect(),
                bodyBCR = ifrmDoc.body.getBoundingClientRect(),
                deepX = Math.ceil(deep + bodyBCR.left + svgBCR.left),
                deepY = Math.ceil(deep + bodyBCR.top + svgBCR.top),
                viewBox = canvas.attr('viewBox'),
                pixelUnitToMillimeterX = canvas.node.pixelUnitToMillimeterX,
                scrollX = 0,
                scrollY = 0,
                pointsCount = 0,
                timerCount = 1,
                totalCount = 0,
                totalCountReverse = 0;

            canvas.attr({
                width: canvasWidth,
                height: canvasHeight
            });

            var finishAction = function () {
                console.log('TYT');
                self.canvas.select('svg').remove();
                self.canvas.append(canvas.node);
                self.pointsCount(pointsCount);

                //            self.setZoom('fit');
                self.canvas.select('svg').attr({
                    width: workrarea_width,
                    height: workarea_height
                }).drag();
                $(ifrm).remove();
                self.workAreaReady(true);

                setTimeout(function () {
                    self.showDialog(true);
                }, 1000);
            };

            self.pixelUnitToMillimeterX = pixelUnitToMillimeterX;

            var coordHash = [],
                chIdx = 0;

            while (scrollY < canvasHeight) {
                while (scrollX < canvasWidth) {
                    coordHash[chIdx] = coordHash[chIdx] || [];
                    coordHash[chIdx].push({
                        deepX: deepX,
                        deepY: deepY,
                        scrollX: scrollX,
                        scrollY: scrollY
                    });

                    totalCount += 1;
                    scrollX += deep;
                }
                scrollX = 0;
                scrollY += deep;
                chIdx += 1;
            }

            totalCountReverse = totalCount;

            for (var i = 0; i < coordHash.length; i++) {
                for (var j = 0; j < coordHash[i].length; j++) {

                    setTimeout(function (i, j) {
                        var p = coordHash[i][j],
                            f;
                        ifrmWin.scrollTo(p.scrollX, p.scrollY);
                        f = _Snap.getElementByPoint(p.deepX, p.deepY);
                        p.type = f && f.type;
                        p.fill = f && f.attr('fill');
                        if (p.fill == "rgb(255, 255, 255)") {
                            canvas.rect(
                                (p.scrollX + deep) * 100 + viewBox.x,
                                (p.scrollY + deep) * 100 + viewBox.y,
                                2500, 2500);
                            pointsCount++;
                        }
                        totalCountReverse--;
                        if (totalCountReverse == 0) {
                            finishAction();
                        }
                    }, timerCount, i, j);
                    timerCount++;
                }
            }

            /*END PROCESS*/

        });

    };

    this.setZoom = function (zoom) {
        zoom = zoom || 'fit';
        var a = self.canvas.select('svg'),
            svgWidth = parseFloat(a.attr('width')) / self.pixelUnitToMillimeterX,
            svgHeight = parseFloat(a.attr('height')) / self.pixelUnitToMillimeterX,
            kX = svgWidth / workrarea_width,
            kY = svgHeight / workarea_height,
            k = kX < kY ? kX : kY,
            s = 1;

        switch (zoom) {
            case 'fit':
                k = kX > kY ? kX : kY;
                s = 1 / k;
                break;
            case 'height':
                k = kX < kY ? kX : kY;
                s = 1 / k;
                break;
            case 'zoomIn':
                s = self.svgScale() + self.svgScale() * 0.05;
                break;
            case 'zoomOut':
                s = self.svgScale() - self.svgScale() * 0.05;
                break;
            case '1:1':
                s = 1;
                break;
        }

        self.svgScale(s);
    };

    this.changeInputFile = function (el, event) {
        var element = event.target,
            file = element.files[0],
            data = new FormData();

        self.fileName(file.name);
        self.uploadStatus('loading');
        data.append('cdrfile', file);

//TODO check file extension in JavaScript before upload
        $.ajax({
//            url: '/upload',
            url: uploadUrl,
            type: "POST",
            data: data,
            processData: false,  // tell jQuery not to process the data
            contentType: false,   // tell jQuery not to set contentType
            success: function (r) {
                if (r.file) {
//                    downloadUrl = '/upload/?f=';
                    $.get(downloadUrl + r.file, function (r) {
                        self.uploadStatus('success');

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


                        self.svgOrignHTML(svgDom.outerHTML);
                        self.svgObject(svgDom);
                        self.canvas.append(svgDom);
//TODO set ZOOM FIT
                        var svgW = parseInt(self.canvas.select('svg').attr('width'), 10),
                            svgH = parseInt(self.canvas.select('svg').attr('height'), 10),
                            k1 = workrarea_width / workarea_height,
                            k2 = svgW / svgH,
                            nx = 0, ny = 0;


                        if (k1 > k2) {
                            svgH = workarea_height;
                            svgW = svgH * k2;
                            nx = (workrarea_width - svgW) / 2;
                        } else {
                            svgW = workrarea_width;
                            svgH = workrarea_width / k2;
                            ny = (workarea_height - svgH) / 2
                        }
                        self.canvas.select('svg').attr({
                            width: svgW,
                            height: svgH,
                            x: nx,
                            y: ny
                        }).drag();
                    });
                }
            },
            error: function (r) {
                self.uploadStatus('error');
                self.showStatusText(true);
            }
        });

        console.log(file);
        /* Is the file an image? */
        if (!file || !file.type.match(/image.*/)) return;
        /* It is! */
        self.status('loading');

        /* Lets build a FormData object*/
        var fd = new FormData();
        fd.append("image", file); // Append the file
        var xhr = new XMLHttpRequest(); //
        xhr.open("POST", uploadUrl);
        xhr.onload = function () {
            //document.querySelector("#link").href = JSON.parse(xhr.responseText).upload.links.imgur_page;
        }


        /* And now, we send the formdata */
        xhr.send(fd);

    }

};