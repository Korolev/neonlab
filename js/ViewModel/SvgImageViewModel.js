/**
 * Created by mk-sfdev on 5/6/14.
 */

var SvgImageViewModel = function(app,editor){

    var self = this,
        greedStep = 100,
        i;

    this.canvas = Snap('#editor_svg');
    this.canvasZomRate = 1;
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

    this.setSvg = function(svgDom){
        var baseWidth = parseInt(svgDom.getAttribute('width'),10),
            baseHeight = parseInt(svgDom.getAttribute('height'),10);

        svgDom.setAttribute('width',baseWidth);
        svgDom.setAttribute('height',baseHeight);
        self.canvas.append(svgDom);

        self.svgObjWidth(baseWidth);
        self.svgObjHeight(baseHeight);
        self.svgObject(svgDom);
        var serializer = new XMLSerializer(),
            svg = serializer.serializeToString(svgDom);
        self.svgOrignHTML(svg);

        var s = self.canvas.select('svg');
        self.setZoom();
    };

    this.removeSvg = function(){
        var a = self.canvas.select('svg');
        if(!a){
            return;
        }
        a.remove();
        self.svgObject(false);
        self.svgObjHeight(0);
        self.svgObjWidth(0);
        self.svgOrignHTML('');
    };

    this.setZoom = function (zoom) {
        zoom = zoom || 'fit';
        var a = self.canvas.select('svg');
        if(!a){
            return;
        }
        var pToMM = self.canvas.node.pixelUnitToMillimeterX,
            svgW = self.svgObjWidth(),
            svgH = self.svgObjHeight(),
            workarea_width = editor.width(),
            workarea_height = editor.height(),
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
console.log(svgW);
        self.canvasZomRate = self.svgObjWidth()/svgW;
    };

};