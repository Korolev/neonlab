/**
 * Created by mk-sfdev on 4/17/14.
 */
//147.svg - KARO

var ApplicationViewModel = function () {
    /* ====================== */

    this.winWidth = ko.observable($(window).width());
    this.winHeight = ko.observable($(window).height());
    /* ====================== */

    var self = this,
        messages = {
            base: "Пожалуйста, введите Ваши данные,<br>\
            технический расчет будет отправлен на Ваш электронный адрес<br>\
                и Вы всегда сможете вернуться к нему."
        },
        uploadUrl = 'http://neonlab.studiovsemoe.com/upload.php',
        downloadUrl = 'http://neonlab.studiovsemoe.com/upload/',
        editor_holder = $('.editor_base'),
        workareaStartWidth = editor_holder.width(),
        workareaStartHeight = editor_holder.height(),
        workarea_width = workareaStartWidth,
        workarea_height = workareaStartHeight,
        greedStep = 100,
        user = (function () {
            var data = getCookie('userInfo');
            if (data) {
                data = decodeURIComponent(data);
                data = JSON.parse(data);
            }
            return data;
        })();

    /* =============== */
    this.canvas = Snap('#editor_svg');


    for (var i = greedStep; i <= workarea_width*5; i += greedStep) {
        self.canvas.line(i, 0, i, workarea_height*5).attr({"stroke-dasharray": "10 10", stroke: '#d7e2ec'});
    }
    for (var i = greedStep; i <= workarea_height*10; i += greedStep) {
        self.canvas.line(0, i, workarea_width*10, i).attr({"stroke-dasharray": "10 10", stroke: '#d7e2ec'});
    }

    this.workAreaReady = ko.observable(true);
    this.workAreaFullScreen = ko.observable(false);
    this.baseStyle = ko.computed(function(){
        var s = self.workAreaFullScreen() ? self.winHeight()-36*4 : workareaStartHeight;
        return 'height:'+s+'px';
    },this).extend({throttle:10});
    this.svgObject = ko.observable();
    this.svgObjWidth = ko.observable(0);
    this.svgObjHeight = ko.observable(0);
    this.svgOrignHTML = ko.observable();
    this.svgStartunitType = 0;
    this.greedDeep = ko.observable();

    /* =============== */

    this.editMode = ko.observable('default');
    this.setMode = function(mode){
        mode = mode == self.editMode() ? 'default' : mode || 'default';

        var c = self.canvas.select('svg');

        switch (mode) {
            case 'moveItem':
                c && c.undrag();

                var set = c.selectAll('rect');
                $.each(set, function (k, el) {
                    if (el.attr('fill') == 'rgb(0, 0, 0)') {
                        el.drag();
                    }
                });

                break;
            case 'addItem':

                break;
            case 'removeItem':

                break;
            default :
                c && c.drag();
        }

        self.editMode(mode);
    };

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

    this.resizeBase = function () {

        workarea_width = self.workAreaFullScreen() ? editor_holder.width() : workareaStartWidth;
        workarea_height = self.workAreaFullScreen() ? self.winHeight()-4*36 : workareaStartHeight;
        console.log(workarea_width,'w');
        console.log(workarea_height,'h');
        this.canvas.attr({
            width: workarea_width,
            height: workarea_height
        });
    };

    this.resizeBase();
    /* =============== */

    this.showStatusText = ko.observable(false);
    this.showDialog = ko.observable(false);
    this.currentMessage = ko.observable(messages.base);
    this.rememberMe = ko.observable(true);
    this.userName = ko.observable('');
    this.userEmail = ko.observable('');
    this.userPhone = ko.observable('');
    this.userPhoneMask = ko.observable('+7 (999) 999-99-99');

    this.changeEditMode = function () {
        var mode = !self.workAreaFullScreen();
        if (mode) {

        } else {

        }
        self.workAreaFullScreen(mode);
        self.resizeBase();
    };
    this.saveUserInfo = function () {
        self.showDialog(false);
        var data = {
            userName: self.userName(),
            userEmail: self.userEmail(),
            userPhone: self.userPhone(),
            projectNumber: self.projectNumber()
        };
        var exp = new Date([self.rememberMe() ? 2020 : 2002]);
        setCookie('userInfo', encodeURIComponent(JSON.stringify(data)), {expires: exp});
    };
    /* =============== */
    var defDiod = {h1: '60-100', name: '-', size: '0', luminous: '0', power: '0', distance: '0', price: '00', itemsCount: 0},
        defPowerSupply = {name: '-', characteristic: '-', power: '0', amperage: '0', cost: '0', itemsCount: 0};
    this.diodInfo = [
        {h1: '60-100', name: 'X-Led Samsung 25', size: '20x9', luminous: '25', power: '0.6', distance: '100', price: '20'},
        {h1: '80-150', name: 'X-Led Samsung 50', size: '25x25', luminous: '50', power: '0.72', distance: '165', price: '32'},
        {h1: '130-200', name: 'X-Led Samsung 80', size: '25x25', luminous: '80', power: '0.72', distance: '215', price: '53'},
        {h1: '180-250', name: 'X-Led Samsung 120', size: '25x25', luminous: '120', power: '0.72', distance: '215', price: '60'}
    ];
    this.powerSuplyInfo = [
        {name: 'Mean Well', characteristic: '20 Вт, 12 В, IP 67', power: '20', amperage: '0.11', price: '450'},
        {name: 'Mean Well', characteristic: ' 35 Вт, 12 В, IP 67', power: '35', amperage: '0.19', price: '620'},
        {name: 'Mean Well', characteristic: ' 60 Вт, 12 В, IP 67', power: '60', amperage: '0.33', price: '740'},
        {name: 'Mean Well', characteristic: ' 100 Вт, 12 В, IP 67', power: '100', amperage: '0.54', price: '1200'},
        {name: 'Mean Well', characteristic: ' 150 Вт, 12 В, IP 65', power: '150', amperage: '0.78', price: '2450'}
    ];
    this.usedDiodTypes = ko.observableArray([defDiod]);
    this.usedPowerSupplyTypes = ko.observableArray([defPowerSupply]);
    this.pointsCount = ko.observable(0);
    this.projectNumber = ko.observable('0001');
    this.diodTotalCost = ko.computed(function () {
        var res = 0,
            total = self.pointsCount();
        $.each(self.usedDiodTypes(), function (k, v) {
            res += (v.itemsCount | 0) * parseFloat(v.price || 0);
        });
        return res;
    }, this).extend({throttle: 100});
    this.powerSupplyTotalCost = ko.computed(function () {
        var res = 0;
        $.each(self.usedPowerSupplyTypes(), function (k, v) {
            res += (v.itemsCount | 0) * parseFloat(v.price || 0);
        });
        return res;
    }, this).extend({throttle: 100});
    this.projectCost = ko.computed(function () {
        return self.powerSupplyTotalCost() + self.diodTotalCost();
    }, this).extend({throttle: 100});
    this.pointsWattCount = ko.computed(function () {
        var res = 0,
            resN = 0,
            bestBPIdx = 0,
            blocksPower = {},
            total = self.pointsCount(),
            candidate = [],
            choice;

        $.each(self.usedDiodTypes(), function (k, dt) {
            res += dt.itemsCount * parseFloat(dt.power);
        });

        resN = res * 1.15;
        if (resN > 0) {
            $.each(self.powerSuplyInfo, function (k, pw) {
                self.powerSuplyInfo[k].itemsCount = 0;
                blocksPower[k] = {
                    power: parseInt(pw.power, 10),
                    rate: pw.price / pw.power,
                    idx: k
                };
                bestBPIdx = bestBPIdx || k;
                if (blocksPower[k].rate < blocksPower[bestBPIdx].rate) {
                    bestBPIdx = k;
                }
            });

            while (resN > blocksPower[bestBPIdx].power) {
                self.powerSuplyInfo[bestBPIdx].itemsCount++;
                resN -= blocksPower[bestBPIdx].power;
            }

            $.each(blocksPower, function (k, pw) {
                if (pw.power > resN) {
                    candidate.push(pw);
                }
            });

            $.each(candidate, function (k, cd) {
                choice = choice || cd;
                if (cd.price < self.powerSuplyInfo[choice.idx].price) {
                    choice = cd;
                }
            });

            self.powerSuplyInfo[choice.idx].itemsCount++;

            self.usedPowerSupplyTypes([]);
            $.each(self.powerSuplyInfo, function (k, pw) {
                if (pw.itemsCount > 0) {
                    self.usedPowerSupplyTypes.push(pw);
                }
            });

        } else {
            self.usedPowerSupplyTypes([defPowerSupply]);
        }

        return Math.round(res);
    }, this).extend({throttle: 100});

    this.size = ko.computed(function () {
        return self.svgObjWidth() + 'x' + self.svgObjHeight();
    }, this).extend({throttle: 100});
    this.perimetr = ko.computed(function () {
        return (self.svgObjWidth() + self.svgObjHeight()) * 2;
    }, this).extend({throttle: 100});
    this.luminousSumm = ko.computed(function () {
    }, this).extend({throttle: 100});

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


    self.greedDeep.subscribe(function (val) {
        var minHVal, maxHVal,
            selectedType = 0;

        $.each(self.diodInfo, function (k, d) {
            var h = d.h1.split('-'), hFrom = h[0], hTo = h[1];
            minHVal = minHVal || hFrom;
            maxHVal = maxHVal || hTo;

            minHVal = Math.min(minHVal, hFrom);
            maxHVal = Math.max(maxHVal, hTo);

            if (val >= hFrom && val <= hTo) {
                selectedType = k;
            }
        });

        var v = parseInt(val, 10),
            error = false;
        if (isNaN(v)) {
            v = minHVal;
            error = true;
        } else if (v < minHVal) {
            v = minHVal;
            error = true;
        } else if (v > maxHVal) {
            v = maxHVal;
            error = true;
        }
        if (error) {
            self.modalMessage('Введенная глубина конструкции<br> не попадает в диапазон от ' +
                minHVal +
                ' мм<br> до ' + maxHVal +
                ' мм. Попробуйте еще раз!');
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
        self.usedDiodTypes([]);
        self.diodInfo[selectedType].itemsCount = self.diodInfo[selectedType].itemsCount || 0;
        self.usedDiodTypes.push(self.diodInfo[selectedType]);
        self.greedDeep(v);
    });

    this.removeFile = function () {
        //TODO: important!!!
        self.showModal(false);
        self.uploadStatus('ready');
        self.svgObject(false);
        self.svgOrignHTML('');
        self.canvas.select('svg').remove();
        self.fileName('-');
        self.svgObjHeight(0);
        self.svgObjWidth(0);

        self.usedDiodTypes([defDiod]);
        self.usedPowerSupplyTypes([defPowerSupply]);

        console.log('VSE');
    };

    this.calculateDiod = function () {
        if (!self.svgObject()) {
            return false;
        }
        var ifrm = document.createElement('IFRAME'),
            svgHtml = self.svgOrignHTML(),
            diod = self.usedDiodTypes()[0],
            diodWH = diod.size.split('x'),
            dw = diodWH[0] * 100,
            dh = diodWH[1] * 100;

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
                self.canvas.select('svg').remove();
                self.canvas.append(canvas.node);
                diod.itemsCount = pointsCount;

                self.pointsCount(pointsCount);


                //            self.setZoom('fit');
                self.canvas.select('svg').attr({
                    width: workarea_width,
                    height: workarea_height
                }).drag();
                $(ifrm).remove();
                self.workAreaReady(true);

                setTimeout(function () {
                    if (!self.userName() || !self.userEmail()) {
                        self.showDialog(true);
                    }
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
                                dw, dh);
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
        var pToMM = self.canvas.node.pixelUnitToMillimeterX,
            a = self.canvas.select('svg'),
            svgW = self.svgObjWidth(),
            svgH = self.svgObjHeight(),
            now_svgW = a.attr('width'),
            now_svgH = a.attr('height'),
            k1 = workarea_width / workarea_height,
            k2 = svgW / svgH,
            nx = 0, ny = 0;

        switch (zoom) {
            case 'fit':
                if (k1 > k2) {
                    svgH = workarea_height;
                    svgW = svgH * k2;
                    nx = (workarea_width - svgW) / 2;
                } else {
                    svgW = workarea_width;
                    svgH = workarea_width / k2;
                    ny = (workarea_height - svgH) / 2
                }
                break;
            case 'height':
                svgH = workarea_height;
                svgW = svgH * k2;
                break;
            case 'zoomIn':
                svgW = now_svgW * 1.10;
                svgH = now_svgH * 1.10;
                break;
            case 'zoomOut':
                svgW = now_svgW * 0.90;
                svgH = now_svgH * 0.90;
                break;
            case '1:1':
                svgW = svgW/pToMM;
                svgH = svgH/pToMM;
                break;
        }

        if(a){
            a.attr({
                width: svgW,
                height: svgH,
                x: nx,
                y: ny
            });
        }
    };

    this.changeInputFile = function (el, event) {

        if (self.svgObject()) {
            return false;
        }

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
                        self.svgObjWidth(parseInt(self.canvas.select('svg').attr('width'), 10));
                        self.svgObjHeight(parseInt(self.canvas.select('svg').attr('height'), 10));

                        self.setZoom('fit');

                        self.canvas.select('svg').drag();
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
        };


        /* And now, we send the formdata */
        xhr.send(fd);

    };

    if (user) {
        for (var key in user) {
            self[key](user[key]);
            console.log(key, user[key]);
        }
    }
};