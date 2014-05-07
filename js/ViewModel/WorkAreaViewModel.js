/**
 * Created by mk-sfdev on 5/6/14.
 */

var WorkAreaViewModel = function(app){

    var self = this,
        editor_holder = $('.editor_base'),
        workareaStartWidth = editor_holder.width(),
        workareaStartHeight = editor_holder.height();



    this.winWidth = ko.observable($(window).width());
    this.winHeight = ko.observable($(window).height());

    this.width = ko.observable(workareaStartWidth);
    this.height = ko.observable(workareaStartHeight);

    this.isReady = ko.observable(true);
    this.fullScreen = ko.observable(false);
    this.baseStyle = ko.computed(function(){
        var s = self.fullScreen() ? self.winHeight()-36*4 : workareaStartHeight;
        return 'height:'+s+'px';
    },this).extend({throttle:10});

    this.SvgImage = new SvgImageViewModel(app,self);

    this.setSvg = function(svg){
        self.SvgImage.setSvg(svg);
    };

    /* =============== */
    this.editMode = ko.observable('default');
    this.setMode = function(mode){
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
        if (mode) {

        } else {

        }
        self.fullScreen(mode);
        self.resizeBase();
    };

    this.resizeBase = function () {

        self.width(self.fullScreen() ? self.winWidth() : workareaStartWidth);
        self.height(self.fullScreen() ? self.winHeight()-4*36 : workareaStartHeight);
        self.SvgImage.canvas.attr({
            width: self.width(),
            height: self.height()
        });
        this.SvgImage.setZoom();
    };

    this.resizeBase();

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

        self.isReady(false);

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
                self.isReady(true);

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
};