/**
 * Created by mk-sfdev on 5/6/14.
 */

var SvgImageViewModel = function (app, editor) {

    var self = this,
        greedStep = 100,
        i;

    this.canvas = Snap('#editor_svg');
    this.pattern25x25 = '';
    this.pattern20x9 = '';

    var c = self.canvas,
        p = c.group();

    p.add(c.rect(0, 0, 2500, 2500).attr({fill: '#DDDDDD', stroke: '#000000', 'stroke-with': '40'}));
    p.add(c.rect(300, 500, 500, 200).attr({fill: '#FFDE00', stroke: '#000000', 'stroke-with': '20'}));
    p.add(c.rect(1600, 500, 500, 200).attr({fill: '#FFDE00', stroke: '#000000', 'stroke-with': '20'}));
    p.add(c.circle(12500, 12500, 300, 300).attr({fill: '#DDDDDD', stroke: '#000000', 'stroke-with': '20'}));

//    this.pattern25x25 = p.pattern(0,0,2500,2500);
    this.pattern25x25  = p.toDefs();

    p = c.group();
    p.add(c.rect(0, 0, 2000, 900).attr({fill: '#DDDDDD', stroke: '#000000', 'stroke-with': '40'}));
    p.add(c.rect(550, 300, 900, 300).attr({fill: '#FFDE00', stroke: '#000000', 'stroke-with': '20'}));

//    this.pattern20x9 = p.pattern(0,0,2000,900);
    this.pattern20x9 = p.toDefs();

    this.canvas.click(function (e, X, Y) {
        var x = X - editor.offsetLeft(),
            y = Y - editor.offsetTop() - window.scrollY,
            s = self.canvas.select('svg'),
            viewBox = s.attr('viewBox'),
            k = 100,
            r = self.canvasZoomRate,
            sX,sY;

        if(s && editor.editMode() == 'addItem'){
            sX = parseInt(s.attr('x')||0);
            sY = parseInt(s.attr('y')||0);
            //TODO need fix diff
            x = x - sX;
            y = y - sY;

            self.didoGroup = self.didoGroup || s.group();
            self.didoGroup.add(self.canvas.rect(x*k*r+viewBox.x,y*k*r+viewBox.y,2500,2500).attr({
                fill:self.pattern25x25
            }));
        }
    });

    this.canvasZoomRate = 1;
    this.grid = this.canvas.g();
    this.didoGroup = '';

    for (i = greedStep; i <= 2560; i += greedStep) {
        this.grid.add(self.canvas.line(i, 0, i, 1440).attr({"stroke-dasharray": "10 10", stroke: '#d7e2ec'}));
    }
    for (i = greedStep; i <= 1440; i += greedStep) {
        this.grid.add(self.canvas.line(0, i, 2560, i).attr({"stroke-dasharray": "10 10", stroke: '#d7e2ec'}));
    }


    this.svgObject = ko.observable();
    this.svgObjWidth = ko.observable(0);
    this.svgObjHeight = ko.observable(0);
    this.svgOrignHTML = ko.observable();
    this.svgStartunitType = 0;

    this.setSvg = function (svgDom) {
        var baseWidth = parseInt(svgDom.getAttribute('width'), 10),
            baseHeight = parseInt(svgDom.getAttribute('height'), 10);

        svgDom.setAttribute('width', baseWidth);
        svgDom.setAttribute('height', baseHeight);
        self.canvas.append(svgDom);

        self.svgObjWidth(baseWidth);
        self.svgObjHeight(baseHeight);
        self.svgObject(svgDom);
        var serializer = new XMLSerializer(),
            svg = serializer.serializeToString(svgDom);
        self.svgOrignHTML(svg);

        var s = self.canvas.select('svg'),
            d = s.select('defs');



        self.setZoom();
        self.drag();
    };

    this.removeSvg = function () {
        var a = self.canvas.select('svg');
        if (!a) {
            return;
        }
        a.undrag();
        a.remove();
        self.svgObject(false);
        self.svgObjHeight(0);
        self.svgObjWidth(0);
        self.svgOrignHTML('');
    };

    this.setZoom = function (zoom) {
        zoom = zoom || 'fit';
        var c = self.canvas.select('svg');
        if (!c) {
            return;
        }
        var pToMM = self.canvas.node.pixelUnitToMillimeterX,
            svgW = self.svgObjWidth(),
            svgH = self.svgObjHeight(),
            workarea_width = editor.width(),
            workarea_height = editor.height(),
            now_svgW = c.attr('width'),
            now_svgH = c.attr('height'),
            k1 = workarea_width / workarea_height,
            k2 = svgW / svgH,
            nx = parseInt(c.attr('x') || 0),
            ny = parseInt(c.attr('y') || 0);

        switch (zoom) {
            case 'fit':
                if (k1 > k2) {
                    svgH = workarea_height;
                    svgW = svgH * k2;
                    nx = (workarea_width - svgW) / 2;
                    ny = 0;
                } else {
                    svgW = workarea_width;
                    svgH = workarea_width / k2;
                    ny = (workarea_height - svgH) / 2;
                    nx = 0;
                }
                break;
            case 'height':
                //DEPRECATED
//                svgH = workarea_height;
//                svgW = svgH * k2;
                break;
            case 'zoomIn':
                svgW = now_svgW * 1.10;
                svgH = now_svgH * 1.10;
                nx = nx * 1.10;
                ny = ny * 1.10;
                break;
            case 'zoomOut':
                svgW = now_svgW * .90;
                svgH = now_svgH * .90;
                nx = nx * .90;
                ny = ny * .90;
                break;
            case '1:1':
                nx = nx / now_svgW;
                ny = ny / now_svgH;
                svgW = svgW / pToMM;
                svgH = svgH / pToMM;

                nx = nx * svgW;
                ny = ny * svgH;
                break;
        }

        if (c) {
            c.attr({
                width: svgW,
                height: svgH,
                x: nx,
                y: ny
            });
        }
        self.canvasZoomRate = self.svgObjWidth() / svgW;
    };


    this.drag = function () {
        var c = self.canvas.select('svg'),
            k = self.canvasZoomRate;

        if (c) {
            c.drag(function (dx, dy) {
                    if (this.canDrag) {
                        this.attr({
                            x: this.ox + dx,
                            y: this.oy + dy
                        });
                    }

                },
                function () {
                    this.canDrag = false;
                    if (editor.editMode() == 'default') {
                        k = self.canvasZoomRate;
                        this.canDrag = true;
                        this.ox = parseInt(c.attr('x'));
                        this.oy = parseInt(c.attr('y'));
                    }
                },
                function () {
//                    console.log("end",arguments);
                });
        }
    };

    this.unDrag = function () {
        var c = self.canvas.select('svg');
        c && c.undrag();
    };
};