/**
 * Created by mk-sfdev on 4/17/14.
 */
//147.svg - KARO

var ApplicationViewModel = function(){
    var self = this,
        messages = {
            base:"Пожалуйста, введите Ваши данные,<br>\
            технический расчет будет отправлен на Ваш электронный адрес<br>\
                и Вы всегда сможете вернуться к нему."
        }
        uploadUrl = 'http://neonlab.studiovsemoe.com/upload.php',
        downloadUrl = 'http://neonlab.studiovsemoe.com/upload/',
        editor_holder = $('.editor_base'),
        workrarea_width = editor_holder.width(),
        workarea_height = editor_holder.height();

    this.canvas = Snap('#editor_svg').attr({
        width: workrarea_width,
        height: workarea_height
    });
    this.svgDomObject = ko.observable();
    this.svgObject = ko.observable();
    this.svgStartunitType = 0;
    this.svgScale = ko.observable(1);
    this.greedDeep = ko.observable();

/* =============== */
    this.showDialog = ko.observable(false);
    this.currentMessage = ko.observable(messages.base);
    this.userName = ko.observable('');
    this.userEmail = ko.observable('');
    this.userPhone = ko.observable('');
    this.userPhoneMask = ko.observable('+7(9999)-999-99-99');
/* =============== */
    this.pointsCount = ko.observable(0);
/* =============== */

    this.fileUploadStatus = {
        ready:{
            cssClass:'question'
        },
        loading:{
            cssClass:'loading'
        },
        success:{
            cssClass: 'success'
        },
        error:{
            cssClass: 'error'
        }
    };

    this.uploadStatus = ko.observable('ready');
    this.fileName = ko.observable('');

    this.statusClass = ko.computed(function(){
        var st = self.fileUploadStatus[self.uploadStatus()];
        return st ? st.cssClass : 'none__';
    },this).extend({throttle:1});

    this.getSvgImg = ko.computed(function(){
        var html = '';
        if(self.svgObject()){
//            var bStr = window.btoa(self.svgObject().outerHTML);
//            html = '<img src="data:image/svg+xml;base64,'+bStr+'" style="width:550px">'
        }
        return html;
    },this).extend({throttle:100});

    self.svgScale.subscribe(function(val){
        if(val && val > 0){
            self.svgObject().setAttribute('transform','scale('+val+')');
        }
    });

    self.greedDeep.subscribe(function(val){
       var v = parseInt(val,10);
        if(isNaN(v)){
            v = 80;
        }else if (v < 60){
            v = 80;
        }else if(v > 250){
            v = 200;
        }
        self.greedDeep(v);
    });

    this.calculateDiod = function(){
        /*
        * 20x9(d:60-100)
        * 25x25(d:80-150)
        * 25x25(d:150-200)
        * 25x25(d:180-250)
        * */
        var ifrm = document.createElement('IFRAME'),
            svgDom = self.svgObject();

        ifrm.setAttribute('src',location.origin+location.pathname+'iframe.html');
        ifrm.style.width = '250mm';
        ifrm.style.height = '250mm';
        document.body.appendChild(ifrm);
        self.ifrm = ifrm;


        var ifrmWin = ifrm.contentWindow,
            ifrmDoc = ifrmWin.document;


        $(ifrm).load(function(){
            var _Sanp = ifrmWin.Snap,
                deep = self.greedDeep();

            var b = _Sanp(ifrmWin.document.body);
            b.append(svgDom);

            var canvas = _Sanp(svgDom),
                canvasWidth = parseInt(canvas.attr('width'),10),
                canvasHeight = parseInt(canvas.attr('height'),10),
                viewBox = canvas.attr('viewBox'),
                pixelUnitToMillimeterX = canvas.node.pixelUnitToMillimeterX,
                scrollX = 0,
                scrollY = 0,
                pointsCount = 0;

            self.pixelUnitToMillimeterX = pixelUnitToMillimeterX;


            while(scrollX < canvasWidth){
                while(scrollY < canvasHeight){
                    var _figure_ = _Sanp.getElementByPoint(deep/pixelUnitToMillimeterX, deep/pixelUnitToMillimeterX);
                    if(_figure_ && _figure_.attr('fill') == "rgb(255, 255, 255)"){
                        canvas.rect(
                            scrollX*100+viewBox.x+5000,
                            scrollY*100+viewBox.y+5000,
                            2500,2500);
                        pointsCount++;
                    }
                    scrollY += deep;
                    ifrmWin.scrollTo(scrollX/pixelUnitToMillimeterX,scrollY/pixelUnitToMillimeterX);
                }
                scrollY = 0;
                scrollX += deep;
            }

            ifrmWin.scrollTo(0,0);
            self.canvas.append(canvas.node);
            self.canvas.select('svg').drag();
            self.pointsCount(pointsCount);
            self.setZoom('fit');
            $(ifrm).remove();
            setTimeout(function(){
                self.showDialog(true);
            },1000);
        });

    };

    this.setZoom = function(zoom){
        zoom = zoom || 'fit';
        var a = self.canvas.select('svg'),
            svgWidth = parseFloat(a.attr('width'))/self.pixelUnitToMillimeterX,
            svgHeight = parseFloat(a.attr('height'))/self.pixelUnitToMillimeterX,
            kX = svgWidth/workrarea_width,
            kY = svgHeight/workarea_height,
            k = kX < kY ? kX : kY,
            s = 1;

        switch (zoom){
            case 'fit':
                k = kX > kY ? kX : kY;
                s = 1/k;
                break;
            case 'height':
                k = kX < kY ? kX : kY;
                s = 1/k;
                break;
            case 'zoomIn':
                s = self.svgScale()+self.svgScale()*0.05;
                break;
            case 'zoomOut':
                s = self.svgScale()-self.svgScale()*0.05;
                break;
            case '1:1':
                s = 1;
                break;
        }

        self.svgScale(s);
    };

    this.changeInputFile = function(el,event){
        var element = event.target,
            file = element.files[0],
            data = new FormData();

        self.fileName(file.name);
        self.uploadStatus('loading');
        data.append('cdrfile',file);

//TODO check file extension in JavaScript before upload
        $.ajax({
//            url: '/upload',
            url: uploadUrl,
            type: "POST",
            data: data,
            processData: false,  // tell jQuery not to process the data
            contentType: false,   // tell jQuery not to set contentType
            success:function(r){
                if(r.file){
//                    downloadUrl = '/upload/?f=';
                    $.get(downloadUrl+ r.file,function(r){
                        self.uploadStatus('success');

                        var svgDom = r.firstChild;


                        var recusiveWalk = function(node){
                            if(node.childNodes && node.childNodes.length){
                                $.each(node.childNodes,function(i,_node){
                                    if(_node.getAttribute && _node.tagName){
                                        var fill = _node.getAttribute('fill');
                                        if(fill){
                                            if(fill != 'none'){
                                                _node.setAttribute('fill','#ffffff');
                                            }
                                            _node.setAttribute('stroke','#000000');
                                            _node.setAttribute('stroke-width','100');
                                        }
                                    }
                                    recusiveWalk(_node);
                                });
                            }
                        };

                        recusiveWalk(svgDom);


                        self.svgObject(svgDom);
                        self.svgDomObject(r);
                    });
                }
            },
            error:function(r){
                self.uploadStatus('error');
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