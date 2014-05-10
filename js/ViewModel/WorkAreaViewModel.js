/**
 * Created by mk-sfdev on 5/6/14.
 */

var Diod = function (data, info, app) {
    var self = this;

    this.app = app;
    this.info = info || {};

    this.x = data.x;
    this.y = data.y;

    this.setSize(info);

};

Diod.prototype.setInfo = function (data) {
    this.info = data;
};

Diod.prototype.setSize = function (info) {
    var size = info && info.size && info.size.split('x');
    this.w = size ? size[0] * 100 | 0 : 0;
    this.h = size ? size[1] * 100 | 0 : 0;
};

Diod.prototype.draw = function (canvas) {
    var app = this.app,
        self = this,
        k = 0;
    this.paper = canvas.rect(this.x, this.y, this.w, this.h);
    this.paper.drag(function(dx,dy){
       if(this.canDrag){
           self.x = this.ox + dx * k *100;
           self.y = this.oy + dy * k *100;
           this.attr({
               x:self.x,
               y:self.y
           })
       }
    },
    function(){
        this.canDrag = false;
        if(app.WorkArea.editMode() == 'moveItem'){
            k = app.WorkArea.SvgImage.canvasZomRate;
            this.canDrag = true;
            this.ox = self.x;
            this.oy = self.y;
        }else if(app.WorkArea.editMode() == 'removeItem'){
            this.undrag();
            this.remove();
        }
    },
    function(){
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

    this.winWidth = ko.observable($(window).width());
    this.winHeight = ko.observable($(window).height());

    this.width = ko.observable(workareaStartWidth);
    this.height = ko.observable(workareaStartHeight);

    this.isReady = ko.observable(true);
    this.fullScreen = ko.observable(false);
    this.baseStyle = ko.computed(function () {
        return 'height:' + self.height() + 'px;width:' + self.width() + 'px;';
    }, this).extend({throttle: 10});

    this.SvgImage = new SvgImageViewModel(app, self);

    this.setSvg = function (svg) {
        self.SvgImage.setSvg(svg);
    };

    /* =============== */
    this.editMode = ko.observable('default');
    this.setMode = function (mode) {
        mode = mode == self.editMode() ? 'default' : mode || 'default';
        var c = self.SvgImage.canvas.select('svg');
        switch (mode) {
            case 'moveItem':
//                c && c.undrag();
//
//                var set = c.selectAll('rect');
//                $.each(set, function (k, el) {
//                    if (el.attr('fill') == 'rgb(0, 0, 0)') {
//                        el.drag();
//                    }
//                });

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

    this.changeEditMode = function () {
        var mode = !self.fullScreen();
        self.fullScreen(mode);

        if (mode) {

        } else {

        }

        setTimeout(function () {
            self.resizeBase();
        }, 50);

    };

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

        this.SvgImage.setZoom();
    };

    this.resizeBase();

    this.calculateDiod = function () {
        if (!app.File.fileName()) {
            console.log('load .cdr first');
            app.Dialog.showModalWindow({
                message: "Загрузите фаил с исходными размерами конструкции в формате <b>.cdr</b> или <b>.plt</b>"
            });

            return false;
        }
        if (!app.greedDeep()) {
            app.Dialog.showModalWindow({
                message: "Задайте глубину вывески."
            });
            return false;
        }

        var ifrm = document.createElement('IFRAME'),
            svgHtml = self.SvgImage.svgOrignHTML(),
            svgWidth = self.SvgImage.svgObjWidth(),
            svgHeight = self.SvgImage.svgObjHeight(),
            useDiodeType = app.usedDiodTypes()[0],
            waCanvas = self.SvgImage.canvas.select('svg'),
            viewBox = waCanvas.attr('viewBox');

        app.WorkArea.isReady(false);

        ifrm.setAttribute('src', location.origin + location.pathname + 'iframe.html');
        ifrm.style.width = '100px';
        ifrm.style.height = '100px';
        document.body.appendChild(ifrm);

        var ifrmWin = ifrm.contentWindow,
            ifrmDoc = ifrmWin.document;


        $(ifrm).load(function () {
            var _Snap = ifrmWin.Snap,
                deep = app.greedDeep();

            var b = _Snap(ifrmWin.document.body);
            //b.append(_Snap.parse(svgHtml));

            var
                canvasId = 'wr_canvas',
                c = document.createElement('canvas');

            c.width = svgWidth;
            c.height = svgHeight;
            ifrmWin.$('body').append(c);
            if (typeof FlashCanvas != "undefined") {
                FlashCanvas.initElement(c);
            }
            ifrmWin.canvg(c, svgHtml, { renderCallback: function (dom) {
                var ctx = c.getContext('2d');
                self.__canvas = c;
                self.__canvasCtx = ctx;

                var x = 0, y = 0, points = [];

                //ctx.getImageData(100,1903,1,1).data[0] == 255;

                while (x <= svgWidth) {
                    while (y <= svgHeight) {
                        if (ctx.getImageData(x, y, 1, 1).data[0] == 255) {
                            points.push(new Diod({
                                x: x * 100 + viewBox.x,
                                y: y * 100 + viewBox.y
                            }, useDiodeType, app));
                        }
                        y += deep;
                    }
                    y = 0;
                    x += deep;
                }

                if (points.length) {
                    if (self.SvgImage.didoGroup) {
                        self.SvgImage.didoGroup.remove();
                    }
                    self.SvgImage.didoGroup = waCanvas.g();
                    self.diodesArr(points);
                }
                console.log('DRAW!');
                for (var i = 0; i < points.length; i++) {
                    setTimeout(function (i) {
                        var p = points[i].draw(waCanvas);
                        self.SvgImage.didoGroup.add(p);
                        if (i == points.length - 1) {
                            app.WorkArea.isReady(true);
                            app.usedDiodTypes()[0].itemsCount = points.length;
                            app.pointsCount(points.length);
                        }
                    }, i * 9, i);
                }


                try {
                    //TODO NS_ERROR_NOT_INITIALIZED: , 1000 / svg.FRAMERATE); canvg.js 2764
                    $(ifrm).remove();
                } catch (e) {
                    console.log(e);
                }

            }});
        });

    };
};