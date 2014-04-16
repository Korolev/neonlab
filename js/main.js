/**
 * Created by mk-sfdev on 4/14/14.
 */
(function(document, window, $){

    $(function(){
        var form = $('#file_upload'),
            button = form.find('.button'),
            inputFile = form.find('input'),
            indicator = form.find('.blue_button_after'),
            editor_holder = $('.editor_base'),
            workrarea_width = editor_holder.width(),
            workarea_height = editor_holder.height();

        var canvas = Snap('#editor_svg').attr({
            width: workrarea_width,
            height: workarea_height
        });

        button.on('click',function(){
           inputFile.trigger('click');
        });
        inputFile.on('change',function(e){
            console.log('start upload');
            var data = new FormData(document.getElementById('file_upload'));
            indicator.addClass('loading');

            //$.get('http://neonlab.studiovsemoe.com/upload/51.svg',function(r){
//            $.get('/upload/51.svg',function(r){
//                indicator.removeClass('loading');
//
//                var svgDom = r.firstChild;
//                svgDom.width.baseVal.convertToSpecifiedUnits(5);
//                svgDom.height.baseVal.convertToSpecifiedUnits(5);
//
//                canvas.append(svgDom);
//                var a = canvas.select('svg'),
//                    svgWidth = parseFloat(a.attr('width')),
//                    svgHeight = parseFloat(a.attr('height'));
//                a.drag();
//
//                var kX = svgWidth/workrarea_width,
//                    kY = svgHeight/workarea_height,
//                    k = kX < kY ? kX : kY;
//                svgDom.setAttribute('transform','scale('+1/k+')');
//
//                var recusiveWalk = function(node){
//                    if(node.childNodes && node.childNodes.length){
//                        $.each(node.childNodes,function(i,_node){
//                            if(_node.getAttribute && _node.tagName){
//                                var fill = _node.getAttribute('fill');
//                                console.log(_node.tagName,_node.getAttribute('fill'));
//                                if(fill){
//                                    _node.setAttribute('fill','#ffffff');
//                                    _node.setAttribute('stroke','#000000');
//                                }
//                            }
//                            recusiveWalk(_node);
//                        });
//                    }
//                };
//
//                recusiveWalk(svgDom);
//            });

            $.ajax({
                url: "http://neonlab.studiovsemoe.com/upload.php",
                type: "POST",
                data: data,
                processData: false,  // tell jQuery not to process the data
                contentType: false,   // tell jQuery not to set contentType
                success:function(r){
                    console.log(r);
                    if(r.file){
                        $.get('http://neonlab.studiovsemoe.com/upload/'+ r.file,function(r){
                            indicator.removeClass('loading');

                            var svgDom = r.firstChild;
                            svgDom.width.baseVal.convertToSpecifiedUnits(5);
                            svgDom.height.baseVal.convertToSpecifiedUnits(5);

                            canvas.append(svgDom);
                            var a = canvas.select('svg'),
                                svgWidth = parseFloat(a.attr('width')),
                                svgHeight = parseFloat(a.attr('height'));
                            a.drag();

                            var kX = svgWidth/workrarea_width,
                                kY = svgHeight/workarea_height,
                                k = kX < kY ? kX : kY;
                            svgDom.setAttribute('transform','scale('+1/k+')');

                            var recusiveWalk = function(node){
                                if(node.childNodes && node.childNodes.length){
                                    $.each(node.childNodes,function(i,_node){
                                        if(_node.getAttribute && _node.tagName){
                                            var fill = _node.getAttribute('fill');
                                            console.log(_node.tagName,_node.getAttribute('fill'));
                                            if(fill){
                                                _node.setAttribute('fill','#ffffff');
                                                _node.setAttribute('stroke','#000000');
                                            }
                                        }
                                        recusiveWalk(_node);
                                    });
                                }
                            };

                            recusiveWalk(svgDom);
                        });
                    }
                },
                error:function(r){
                      indicator.removeClass('loading');
                    alert(r.statusText);
                }
            });
        });
    });

})(document, window, jQuery);