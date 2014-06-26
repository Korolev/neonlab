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
    this.pattern25x25hl = '';
    this.pattern20x9hl = '';

    var createDiodePattern = function (c) {
        var p = c.group(),
            selectedColor = "#ff6900",
            fillColor = "#b7b7b7";

        p.add(c.circle(1250, 1250, 3000, 3000).attr({fill: '#FFFFFF', stroke: '#FFFFFF', 'stroke-with': '1', opacity: '0.1'}));
        p.add(c.rect(0, 0, 2500, 2500).attr({fill: fillColor, stroke: '#000000', 'stroke-with': '40'}));
        p.add(c.rect(300, 500, 500, 200).attr({fill: '#FFDE00', stroke: '#000000', 'stroke-with': '20'}));
        p.add(c.rect(1600, 500, 500, 200).attr({fill: '#FFDE00', stroke: '#000000', 'stroke-with': '20'}));
        p.add(c.circle(1250, 1250, 300, 300).attr({fill: '#FFFFFF', stroke: '#000000', 'stroke-with': '20'}));
        self.pattern25x25 = p.toDefs();

        p = c.group();
        p.add(c.circle(1250, 1250, 3000, 3000).attr({fill: '#FFFFFF', stroke: '#FFFFFF', 'stroke-with': '1', opacity: '0.1'}));
        p.add(c.rect(0, 0, 2500, 2500).attr({fill: selectedColor, stroke: '#000000', 'stroke-with': '40'}));
        self.pattern25x25hl = p.toDefs();

        p = c.group();
        p.add(c.circle(1000, 450, 2500, 2500).attr({fill: '#FFFFFF', stroke: '#FFFFFF', 'stroke-with': '1', opacity: '0.1'}));
        p.add(c.rect(0, 0, 2000, 900).attr({fill: fillColor, stroke: '#000000', 'stroke-with': '40'}));
        p.add(c.rect(800, 325, 400, 250).attr({fill: '#FFDE00', stroke: '#000000', 'stroke-with': '20'}));
        self.pattern20x9 = p.toDefs();

        p = c.group();
        p.add(c.circle(1000, 450, 2500, 2500).attr({fill: '#FFFFFF', stroke: '#FFFFFF', 'stroke-with': '1', opacity: '0.1'}));
        p.add(c.rect(0, 0, 2000, 900).attr({fill: selectedColor, stroke: '#000000', 'stroke-with': '40'}));
        self.pattern20x9hl = p.toDefs();
    };

    this.canvas.click(function (e, X, Y) {
        var x = X - editor.offsetLeft(),
            y = Y - editor.offsetTop() - window.scrollY,
            s = self.canvas.select('svg'),
            viewBox,
            k = 100,
            r = self.canvasZoomRate,
            sX, sY;

        if (s && editor.editMode() == 'addItem') {
            viewBox = s.attr('viewBox');
            sX = parseInt(s.attr('x') || 0);
            sY = parseInt(s.attr('y') || 0);
            x = x - sX;
            y = y - sY;

            var svgClientRect = self.canvas.node.getBoundingClientRect();

            x = x - svgClientRect.left * 5;
            y = y - svgClientRect.left * 4;

            self.addDiode(x * k * r + viewBox.x, y * k * r + viewBox.y);
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

    //***** SELECT ITEMS
    var dashoffset = 0,
        selRectX,
        selRectY;
    this.selectBoxCoords = {x1: 0, x2: 0, y1: 0, y2: 0};
    this.selectRect = self.canvas.rect(10, 10, 200, 100).attr({
        'stroke': '#000000',
        'stroke-width': '1px',
        'fill': 'none',
        'stroke-dasharray': '5 3',
        'stroke-dashoffset': dashoffset,
        opacity: 0
    });
    setInterval(function () {
        dashoffset++;
        dashoffset = dashoffset > 8 ? 0 : dashoffset;
        self.selectRect.attr({
            'stroke-dashoffset': dashoffset
        })
    }, 40);
    this.canvas.mousedown(function (e) {
        selRectX = e.pageX - editor.offsetLeft();
        selRectY = e.pageY - editor.offsetTop() - window.scrollY;

        if (editor.editMode() == 'selectItem') {
            self.selectRect.attr({
                opacity: 1,
                x: selRectX,
                y: selRectY,
                width: 1,
                height: 1
            })
        }
    });

    this.canvas.mousemove(function (e) {
        if (editor.editMode() == 'selectItem') {
            var x = e.pageX - editor.offsetLeft(),
                y = e.pageY - editor.offsetTop() - window.scrollY,
                dX = x - selRectX, dY = y - selRectY,
                abs = Math.abs,
                opts = {
                    width: dX || 0,
                    height: dY || 0
                };
            if (dX < 0) {
                opts.x = x;
                opts.width = abs(dX);
            }
            if (dY < 0) {
                opts.y = y;
                opts.height = abs(dY);
            }
            self.selectRect.attr(opts);
        }
    });

    this.canvas.mouseup(function (e) {
        var x1 = parseFloat(self.selectRect.attr('x')),
            y1 = parseFloat(self.selectRect.attr('y')),
            x2 = parseFloat(self.selectRect.attr('width')) + x1,
            y2 = parseFloat(self.selectRect.attr('height')) + y1,
            s = self.canvas.select('svg'),
            viewBox,
            k = 100,
            r = self.canvasZoomRate,
            sX, sY, x, y,
            selElems = [],
            settingsLeft = (x2 - 50),
            settingsTop = y2 / 2,
            deltaLeft = editor.width() - settingsLeft - 243;

        if(deltaLeft < 0){
            settingsLeft = settingsLeft + deltaLeft - 30;
        }

        app.settingsPosition('left:' + settingsLeft + 'px;top:' + settingsTop + 'px;');

        self.selectRect.attr({opacity: 0});
        if (editor.editMode() == 'selectItem' && s && !editor.selectedDiodes().length) {
            viewBox = s.attr('viewBox');
            sX = parseInt(s.attr('x') || 0);
            sY = parseInt(s.attr('y') || 0);
            x1 = x1 - sX;
            y1 = y1 - sY;
            x2 = x2 - sX;
            y2 = y2 - sY;

            x1 = parseInt(x1 * r * k + viewBox.x, 10);
            y1 = parseInt(y1 * r * k + viewBox.y, 10);
            x2 = parseInt(x2 * r * k + viewBox.x, 10);
            y2 = parseInt(y2 * r * k + viewBox.y, 10);

            self.selectBoxCoords = {
                x1: x1,
                x2: x2,
                y1: y1,
                y2: y2
            };

            each(editor.diodesArr(), function (k, d) {
                d.highlight(false);
                if (d.x >= x1 && d.x <= x2 && d.y >= y1 && d.y <= y2) {
                    selElems.push(d);
                }

            });
            each(selElems, function (k, d) {
                d.highlight(true);
            });
            if(selElems[0]){
                app.additionalDeep(selElems[0].deep);
                app.additionalDiode(selElems[0].info);
            }
            editor.selectedDiodes(selElems);
        }
    });
//*****


    this.setSvg = function (svgDom) {
        var baseWidth = parseInt(svgDom.getAttribute('width'), 10),
            baseHeight = parseInt(svgDom.getAttribute('height'), 10);

        svgDom.setAttribute('width', baseWidth);
        svgDom.setAttribute('height', baseHeight);
        self.selectRect.before(svgDom);

        self.svgObjWidth(baseWidth);
        self.svgObjHeight(baseHeight);
        self.svgObject(svgDom);
        var serializer = new XMLSerializer(),
            svg = serializer.serializeToString(svgDom);
        self.svgOrignHTML(svg);

        var s = self.canvas.select('svg'),
            viewBox = s.attr('viewBox');

        createDiodePattern(s);

        try{
            each(s.node.children, function (k, el) {
                var bb = el.getBoundingClientRect(),
                    nodeName,
                    nodeClass,
                    g;
                if (bb.width) {
                    nodeName = el.nodeName;
                    nodeClass = el.getAttribute('class');
                    g = s.select(nodeClass ? nodeName + '.' + nodeClass : nodeName);
                    //TODO maybe remove this rect before sent SVG
                    self.canvas.rect(viewBox.x, viewBox.y, bb.width * 100, bb.height * 100).attr({fill: '#cccccc', 'opacity': '0.01'}).prependTo(g);
                }
            });

        }catch (e){
            console.log(e);
        }


        self.drag();
        self.setZoom();
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

    this.addDiode = function (x, y) {
        if (app.greedDeep()) {
            var usedDiodeType = app.usedDiodTypes()[0],
                s = self.canvas.select('svg'),
                diode = new Diod({x: x, y: y}, usedDiodeType, app);

            editor.diodesArr.push(diode);

            diode = diode.draw(s);
            self.didoGroup = self.didoGroup || s.group();
            self.didoGroup.add(diode);
        }
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