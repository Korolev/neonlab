/**
 * Created by mk-sfdev on 5/6/14.
 */

var Diod = function (data, info, app) {
    var self = this;

    this.app = app;
    this.info = info || {};
    this.origin = data.origin;
    this.x = data.x;
    this.y = data.y;
    this.deep = data.deep;
    this.isHighlight = false;
    this.defaultPatternId = false;
    this.selectedPatternId = false;

    this.setSize(info);

};

Diod.prototype.setInfo = function (data) {
    this.info = data;
    this.setSize(data);
    this.redraw();
};

Diod.prototype.setSize = function (info) {
    var size = info && info.size && info.size.split('x');
    this.w = size ? size[0] * 100 | 0 : 0;
    this.h = size ? size[1] * 100 | 0 : 0;
};

Diod.prototype.highlight = function (val) {
    var app = this.app,
        self = this,
        defId = self.defaultPatternId ,
        selId = self.selectedPatternId;

    if (self.isHighlight == val) {
        return false;
    }
    self.isHighlight = val;
    if (self.paper) {
        if (val) {
            self.paper.attr('href', selId);
        } else {
            self.paper.attr('href', defId);
        }
    }
};


Diod.prototype.remove = function () {
    try {
        var self = this;
        self.paper.undrag();
        self.app.WorkArea.diodesArr.remove(self);
        self.paper.remove();
    } catch (e) {
        console && console.log("Can't remove. Reason: " + e.message, e);
    }
};

Diod.prototype.redraw = function () {
    var app = this.app,
        self = this,
        size = self.info.size,
        k = 0,
        pDef = app.WorkArea.SvgImage['pattern' + size] ,
        pHl = app.WorkArea.SvgImage['pattern' + size + 'hl'];

    if (pDef.id !== this.defaultPatternId) {
        this.defaultPatternId = '#' + pDef.id;
        this.selectedPatternId = '#' + pHl.id;

        pHl.attr('id', pHl.id);
        pDef.attr('id', pDef.id);

        self.paper.attr('href', self.defaultPatternId);
    }
};

Diod.prototype.draw = function (canvas) {
    var app = this.app,
        self = this,
        size = self.info.size,
        k = 0,
        pDef = app.WorkArea.SvgImage['pattern' + size] ,
        pHl = app.WorkArea.SvgImage['pattern' + size + 'hl'];

    this.defaultPatternId = '#' + pDef.id;
    this.selectedPatternId = '#' + pHl.id;

    pHl.attr('id', pHl.id);
    this.paper = pDef.use().attr({
        x: this.x,
        y: this.y
    }).appendTo(canvas);

    this.paper.drag(function (dx, dy) {
            // move
            dy = dy - window.pageYOffset;
            if (this.canDrag) {
                self.x = this.ox + dx * k * 100;
                self.y = this.oy + dy * k * 100;
                this.attr({
                    x: self.x,
                    y: self.y
                })
            }
        },
        function () {
            //start move
            this.canDrag = false;
            if (app.WorkArea.editMode() == 'moveItem') {
                k = app.WorkArea.SvgImage.canvasZoomRate;
                this.canDrag = true;
                this.ox = self.x;
                this.oy = self.y;
            } else if (app.WorkArea.editMode() == 'removeItem') {
                self.remove();
//                console.log(self);
            }
        },
        function () {
            //console.log('end',arguments);
        });
    return this.paper;
};

var WorkAreaViewModel = function (app) {

    var self = this,
        editor = $('.editor'),
        editor_holder = $('.editor_base'),
        workareaStartWidth = editor_holder.width(),
        workareaStartHeight = editor_holder.height();

    this.diodesArr = ko.observableArray([]);
    this.selectedDiodes = ko.observableArray([]);

    this.showOptionsDialog = ko.observable(false);

    this.winWidth = ko.observable($(window).width());
    this.winHeight = ko.observable($(window).height());

    this.width = ko.observable(workareaStartWidth);
    this.height = ko.observable(workareaStartHeight);
    this.offsetLeft = ko.observable(0);
    this.offsetTop = ko.observable(0);

    this.isReady = ko.observable(true);
    this.fullScreen = ko.observable(false);
    this.fullSizeSVG = ko.observable(false);
    this.baseStyle = ko.computed(function () {
        return 'height:' + self.height() + 'px;width:' + self.width() + 'px;';
    }, this).extend({throttle: 10});

    this.SvgImage = new SvgImageViewModel(app, self);

    self.getSvgImg = ko.computed(function () {
        var html = '',
            c = self.SvgImage.canvas,
            s = c.select('svg'),
            vb = s && s.attr('viewBox'),
            clone,
            sObj = self.SvgImage.svgObject(),
            diodes = self.diodesArr();

        if (s) {
            clone = s.clone();
            clone.attr({
                x: 0,
                y: 0,
                width: vb.width / 100,
                height: vb.height / 100
            });
            self.fullSizeSVG(clone.toString());
            clone.attr({
                width: 450,
                height: 150
            });
            html = clone.toString();
            clone.remove();
        }

        return html;
    }, this).extend({throttle: 100});

    this.setSvg = function (svg) {
        self.SvgImage.setSvg(svg);
    };

    /* =============== */
    this.editMode = ko.observable('default');

    this.setMode = function (mode) {
        mode = mode == self.editMode() ? 'default' : mode || 'default';
        if (self.selectedDiodes().length) {
            each(self.selectedDiodes(), function (k, d) {
                d.highlight(false);
                self.selectedDiodes([]);
            });
        }
        self.editMode(mode);
    };

    this.changeEditMode = function () {
        var mode = !self.fullScreen();
        self.fullScreen(mode);
        self.setMode();

        if (mode) {

        } else {

        }

        setTimeout(function () {
            self.resizeBase();
        }, 50);

    };

    this.diodesArr.subscribe(function (points) {
        var diodeTypes = app.usedDiodTypes(),
            dInfo = app.diodInfo,
            used = [],
            maxDeep = 0;

        each(dInfo, function (i, t) {
            t.itemsCount = 0;
            each(points, function (k, p) {
                if (p.info.name == t.name) {
                    t.itemsCount++;
//                    console.log('+');//TODO to mach calls wen recalculate
                    if(p.deep && p.deep > maxDeep){
                        maxDeep = p.deep;
                    }
                }
            });
        });
//        $.each(points, function (k, p) {
//            $.each(diodeTypes, function (i, t) {
//                if (p.info.name == t.name) {
//                    t.itemsCount++;
//                }
//            });
//        });

        each(dInfo, function (i, t) {
            if (t.itemsCount > 0) {
                used.push(t);
            }
        });

        app.totalDeep(maxDeep);
        app.maxDeep(maxDeep);

        app.usedDiodTypes(used);
        app.pointsCount(points.length);
    });

    this.resizeBase = function () {
        self.width(self.fullScreen() ? self.winWidth() : workareaStartWidth);
        self.height(self.fullScreen() ? self.winHeight() - 4 * 36 : workareaStartHeight);
        self.SvgImage.canvas.attr({
            width: self.width(),
            height: self.height()
        });

        var e = document.getElementsByClassName('editor')[0];
        e.style.display = 'none';
        e.offsetHeight;
        e.style.display = 'block';

        self.calculateOffset();

        this.SvgImage.setZoom();
    };

    this.calculateOffset = function(){
//====
        var boundingCR = editor_holder[0].getBoundingClientRect();
        self.offsetLeft(boundingCR.left);
        self.offsetTop(boundingCR.top);
//====
    };

    this.resizeBase();

    this.isFileUploaded = function(){
        if (!app.File.fileName()) {
            console.log('load .cdr first');
            app.Dialog.showModalWindow({
                message: "Загрузите фаил с исходными размерами конструкции в формате <b>.cdr</b>"// или <b>.plt</b>"
            });
            return false;
        }
        return true;
    };

    this.calculateManual = function () {
        if (!self.isFileUploaded()){
                return false;
        }
        self.changeEditMode();
        app.additionalDeep(80);
        app.greedDeep(80);
        self.editMode('selectItem');
        app.Dialog.showModalWindow({
            type:app.Dialog.modalTypes.info,
            message: 'Выделите нужную область.'
        });
        setTimeout(function(){
            app.Dialog.hideModalWindow();
        },2000);
    };

    this.calculateDiod = function () {
        app.greedDeep.valueHasMutated();
        if (!self.isFileUploaded()){
            return false;
        }
        if (!app.greedDeep()) {
            app.Dialog.showModalWindow({
                message: "Задайте глубину вывески."
            });
            return false;
        }

        var svgWidth = self.SvgImage.svgObjWidth(),
            svgHeight = self.SvgImage.svgObjHeight(),
            useDiodeType = app.usedDiodTypes()[0],
            waCanvas = self.SvgImage.canvas.select('svg');

        self.calculateDiodesByCoordinates(app, 0, 0, svgWidth, svgHeight, useDiodeType, app.greedDeep(), function (points) {
            if (self.SvgImage.diodGroup) {
                self.SvgImage.diodGroup.remove();
            }
            self.SvgImage.diodGroup = waCanvas.g();

            for (var i = 0; i < points.length; i++) {
                setTimeout(function (i) {
                    var p = points[i].draw(waCanvas);
                    self.SvgImage.diodGroup.add(p);
                    if (i == points.length - 1) {
                        app.WorkArea.isReady(true);
                        self.diodesArr(points);
                        clearTimeout(app.testUseTimeOut);
                        if(!app.useBetter){
                            app.testUseTimeOut = setTimeout(function () {
                                if(!app.Dialog.showDialog()){
//                                    app.testUseMorePowerfulDiode();
                                }
                            }, 10000);
                        }


//
//                        var viewBox = waCanvas.attr('viewBox'),
//                            x1=590,
//                            y1 = 370;
//
//                        self.SvgImage.canvas.rect(x1*100+viewBox.x,y1*100+viewBox.y,10000,10000)
//                            .attr({fill:'none',stroke:'red','stroke-width':'50'}).appendTo(waCanvas);
//
                    }
                }, i * 9, i);
            }
        })

    };

    this.calculateDiodesByCoordinates = function (app, x, y, xTo, yTo, useDiodeType, deep, callback) {
        var ifrm = document.createElement('IFRAME'),
            workArea = app.WorkArea,
            SvgImage = app.WorkArea.SvgImage,
            svgHtml = SvgImage.svgOrignHTML(),
            svgWidth = SvgImage.svgObjWidth(),
            svgHeight = SvgImage.svgObjHeight(),
            useDiodeTypeSize = useDiodeType.size.split('x'),
            udtW = useDiodeTypeSize[0] | 0,
            udtH = useDiodeTypeSize[1] | 0,
            waCanvas = SvgImage.canvas.select('svg'),
            viewBox = waCanvas.attr('viewBox'),
            $complete_process = $('#complete_process');

        workArea.isReady(false);

//        ifrm.setAttribute('src', location.origin + location.pathname + 'iframe.html');
        ifrm = document.getElementById('fakeFrame');
        ifrm.style.width = '100%';
        ifrm.style.height = '10px';
//        document.body.appendChild(ifrm);

//        var ifrmWin = ifrm.contentWindow;
        var ifrmWin = window;

        (function () {
            var c = document.createElement('canvas');

            c.width = svgWidth;
            c.height = svgHeight;
            ifrm.appendChild(c);
            if (typeof FlashCanvas != "undefined") {
                FlashCanvas.initElement(c);
            }
            ifrmWin.canvg(c, svgHtml, { renderCallback: function (dom) {
                var ctx = c.getContext('2d'),
                    points = [];

                if (window.Worker) {
                    var worker = new Worker('js/workers/analiser.js'),// Create new worker
                        width = xTo - x,
                        height = yTo - y,
                        useParts = false,
                        oldHeight = height;

                    if (width > 10000) {
                        height = Math.ceil(height / 2);
                        useParts = true;
                    }

                    worker.postMessage({
                        // sent ImageData to worker
                        imagedata: ctx.getImageData(x, y, width, height),
                        width: width,
                        height: height,
                        deep: deep,
                        dW: udtW,
                        dH: udtH
                    });

                    if (useParts) {
                        var worker2 = new Worker('js/workers/analiser.js');
                        worker2.postMessage({
                            // sent ImageData to worker
                            imagedata: ctx.getImageData(x, y + height, width, oldHeight - height),
                            width: width,
                            height: oldHeight - height,
                            deep: deep,
                            dW: udtW,
                            dH: udtH
                        });

                        worker2.onmessage = function (event) {
                            if (event.data.status == 'complite') {
                                var points = event.data.points,
                                    dY = oldHeight - height;

                                each(points, function (k, p) {
                                    points[k].y += dY;
                                });
                                preCompleteFunc(points);
                            }
                        }
                    }


                    var _POINTS_ = [],
                        parts = 0,
                        completeFunc = function (_points) {
                            _points.sort(function(a,b){
                                return a.x < b.x ? -1 : 1;
                            });

                            each(_points, function (k, p) {
                                points.push(new Diod({
                                    x: p.x * 100 + viewBox.x + x * 100,
                                    y: p.y * 100 + viewBox.y + y * 100,
                                    deep: deep,
                                    origin:p
                                }, useDiodeType, app));
                            });

                            if (points.length) {
                                callback(points);
                            } else {
                                app.Dialog.showModalWindow({
                                    message: 'Ниодного диода не удалось поставить, попробуйте сделать это вручную в режими редактирования.'
                                });
                                app.WorkArea.isReady(true);
                            }
                            $complete_process.text('');
                        },
                        preCompleteFunc = function (points) {
                            _POINTS_ = _POINTS_.concat(points);
                            parts++;
                            if (parts == 2 || !useParts) {
                                completeFunc(_POINTS_);
                            }
                        };


                    worker.onerror = function (event) {
                        console.log(event);
                    };

                    worker.onmessage = function (event) {
                        if (event.data.status == 'complite') {
                            preCompleteFunc(event.data.points);
                        } else if (event.data.status == 'console') {
                            console.log(event.data.log);
                        } else {
                            //show current complete level
                            var progress = event.data.progress > 100 ? 100 : event.data.progress;
                            $complete_process.text(progress + "%");
                        }
                    }
                }
                else {
                    alert('Ваш браузер не поддерживает Web Workers!');
                }

                try {
                    //TODO NS_ERROR_NOT_INITIALIZED: , 1000 / svg.FRAMERATE); canvg.js 2764
                    ifrm.setAttribute('style','');
                    ifrm.innerHTML = '';
                } catch (e) {
                    console.log(e);
                }

            }});
        })();
    }
};