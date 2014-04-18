/**
 * Created by mk-sfdev on 4/17/14.
 */
var ApplicationViewModel = function(){
    var self = this,
        uploadUrl = 'http://neonlab.studiovsemoe.com/upload.php',
        downloadUrl = 'http://neonlab.studiovsemoe.com/upload/',
        editor_holder = $('.editor_base'),
        workrarea_width = editor_holder.width(),
        workarea_height = editor_holder.height();

    this.canvas = Snap('#editor_svg').attr({
        width: workrarea_width,
        height: workarea_height
    });
    this.svgObject = ko.observable();
    this.svgStartunitType = 0;
    this.svgScale = ko.observable(1);
    this.greedDeep = ko.observable();

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

    self.svgScale.subscribe(function(val){
        if(val && val > 0){
            self.svgObject().setAttribute('transform','scale('+val+')');
        }
    });

    this.calculateDiod = function(){
        /*
        * 20x9(d:60-100)
        * 25x25(d:80-150)
        * 25x25(d:150-200)
        * 25x25(d:180-250)
        * */
        var svgDom = self.svgObject(),
            w,
            h;

        svgDom.width.baseVal.convertToSpecifiedUnits(self.svgStartUnitType);
        svgDom.height.baseVal.convertToSpecifiedUnits(self.svgStartUnitType);

        w = svgDom.width.baseVal.value;
        h = svgDom.height.baseVal.value;

        console.log(w);
        console.log(h);

        console.log(self.greedDeep());
        var svg = self.canvas.select('svg');

    };

    this.setZoom = function(zoom){
        zoom = zoom || 'fit';
        var a = self.canvas.select('svg'),
            svgWidth = parseFloat(a.attr('width')),
            svgHeight = parseFloat(a.attr('height')),
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
            url: uploadUrl,
            type: "POST",
            data: data,
            processData: false,  // tell jQuery not to process the data
            contentType: false,   // tell jQuery not to set contentType
            success:function(r){
                if(r.file){
                    $.get(downloadUrl+ r.file,function(r){
                        self.uploadStatus('success');

                        var svgDom = r.firstChild;
                        if(self.svgObject()){
                            self.canvas.select('svg').remove();
                        }
                        self.svgObject(svgDom);
                        self.svgStartUnitType = svgDom.width.baseVal.unitType;
                        svgDom.width.baseVal.convertToSpecifiedUnits(5);
                        svgDom.height.baseVal.convertToSpecifiedUnits(5);



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
                                        }
                                    }
                                    recusiveWalk(_node);
                                });
                            }
                        };

                        recusiveWalk(svgDom);
                        self.canvas.append(svgDom);
                        var a = self.canvas.select('svg');
                        a.drag();

                        self.setZoom('height');
                    });
                }
            },
            error:function(r){
                indicator.removeClass('loading');
                alert(r.statusText);
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