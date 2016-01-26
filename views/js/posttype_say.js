/*
 *    posttype_say.js
 *    Copyright 2015-2016 by Dustin Pfister ( GPL-3.0 )
 *
 *    A posttype.js plugin intened for use at scriptBook
 *
 */


postType.add((function(){

    // return the posttype object
    return {

        postType: 'say',
        marked: true,        // this posttypes content is subject to markdown formatting

        // user interface for creating a "say"
        ui: function(){

            return  '<label>Say:</label>'+
                '<textarea id="say_input" ></textarea>'+
                '<input id="say_post" type="submit" value="post">';

        },

        // onAction methods
        onAction : {

            // the container
            ifClass_post_container : function(){

            },

            // input
            ifID_say_input: function(){

            },

            // post button
            ifID_say_post: function(){
         
                var saying = _.get('say_input').value;
                
                if(saying === ''){
                    console.log('invalid say.');
                    return;
                }

                // send home new say.
                myHttp.sendWallPost(
                    {
                        postOwner: '?user', // ALERT! the post owner should always just be the logged in user, this is not needed.
                        postTo: _.get('wall_username').innerHTML, // ALERT! this can be discorvered server side as well by looking at the namespace.
                        postType: 'say',  // let the server know the posttype
                        postContent: saying
                    },

                    postType.injectPost

                );
                
            }

        },

        // template for generating a says html
        postTemplate: function(postContent){ return '<div class="post_say"><p>' + postContent + '<\/p><\/div>'; }
    }

}()));