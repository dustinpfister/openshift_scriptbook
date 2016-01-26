var marked = require('marked');

// templates for generating html for client view of posttypes
exports.templates = {

    // template for generating a says html
    say: function(postContent){ return '<div class="post_say"><p>' + marked(postContent) + '<\/p><\/div>'; },
    
    // template for quickcanvas
    quickcanvas: function(postContent){ 
 
            return '<div class=\"quickcanvas_container\">'+
                '<div class=\"quickcanvas_icon_large\"><img class=\"quickcanvas_image_large\" src=\"'+postContent.thum+'\"><\/div>'+
                '<div class=\"quickcanvas_icon_small\"><img class=\"quickcanvas_image_small\" src=\"'+postContent.thum+'\"><\/div>'+
                '<div class=\"quickcanvas_content row\">'+
                    '<textarea class=\"quickcanvas_code col-md-6\">'+ postContent.code +'<\/textarea>'+
                    '<iframe class=\"quickcanvas_iframe col-md-6\" scrolling=\"no\" seamless=\"seamless\" src=\"\/html\/frame_quick_canvas.html\"><\/iframe>'+
                '<\/div>'+
                '<div class=\"quickcanvas_controls\">'+
                    '<input class=\"quickcanvas_button_runkill\" type=\"button\" value=\"RUN\">'+
                    '<input class=\"quickcanvas_button_hide\" type=\"button\" value=\"hide\">'+
                '<\/div>'+
            '<\/div>';

        }

};