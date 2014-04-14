/**
 * Created by mk-sfdev on 4/14/14.
 */
(function(document, window, $){

    $(function(){
        var form = $('#file_upload'),
            button = form.find('.button'),
            inputFile = form.find('input'),
            indicator = form.find('.blue_button_after');

        button.on('click',function(){
           inputFile.trigger('click');
        });
        inputFile.on('change',function(e){
            console.log('start upload');
            var data = new FormData(document.getElementById('file_upload'));
            console.log(data);
            $.ajax({
                url: "http://neonlab.studiovsemoe.com/upload.php",
                type: "POST",
                data: data,
                processData: false,  // tell jQuery not to process the data
                contentType: false   // tell jQuery not to set contentType
            });
        });
    });

})(document, window, jQuery);