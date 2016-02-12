var mongoose = require('mongoose'),
Schema = mongoose.Schema,
openShift = require('./openshift.js').openShiftObj,
db = mongoose.createConnection(openShift.mongo),

// markdown
marked = require('marked');

//var spawn = require('child_process').spawn;


var Userposts = db.model('userpost', new Schema({
    username : String,
    lastPostCheck : Date, // just stores the last time a postcheck was preformed for the users wall
    wallVisitCount : Number,
    wallVisits : [
        new Schema({
            who : String, // the username of the visitor
            when : String // the time that they visited
        })
    ],
    wallposts : [
        new Schema({
           postTime: String,
           postOwner: String,
           postType: String,
           //postContent: String
           postContent: Object
        })
    ]
}));

exports.postUpdate = function(req, done){
    
    console.log('post update!');
 
    console.log(req.body.owner);
    Userposts.findOne({'username': req.body.owner},'wallposts', function(err, user){
    //Userposts.wallposts.findOne({'_.id': req.body._id},'', function(err, post){
    
    
        if(user){
            
            console.log('user found');
            console.log(user);
            
        }
        
    });
    
};

// post something to a page
exports.postToUserPage = function(req, done){
    
   var thePost = req.body;

    console.log('the body: {');
    console.log(req.body);
    console.log('}')
    
    // post owner is poster?
    // ALERT! do we even need this in the wallpost object? isn't this always the case?
    if(thePost.postOwner === '?user'){
        thePost.postOwner = req.user.name;
    }

    // posting to poster?
    if(thePost.postTo === '?user'){
        thePost.postTo = req.user.name;
    }
    
    Userposts.findOne({'username': thePost.postTo}, '', function(err,userPosts){

        var newUserPosts;

        // if the user made posts before
        if(userPosts){

           userPosts.wallposts.push({
                //toPage: toPage,
                postTime: new Date(),
                postOwner: thePost.postOwner,
                postType: thePost.postType,
                postContent: thePost.postContent
            });


            userPosts.save(function(){

               // call done callback
               done('success', JSON.stringify(userPosts.wallposts[userPosts.wallposts.length-1]));

            });


        // users first post
        }else{

           newUserPosts = new Userposts();
           newUserPosts.username = thePost.postTo;

           // visit count starts at zero
           newUserPosts.wallVisitCount = 0;

           newUserPosts.wallposts.push({
                postTime: new Date(),
                postOwner: thePost.postOwner,
                postType: thePost.postType,
                postContent: thePost.postContent
           });

           newUserPosts.save(function(){

               // call done callback
               done('success', JSON.stringify(newUserPosts.wallposts[0]));

           });

        }
        
    });

};

// check for new posts and return any new ones
/*
    {
        checkType: 'newposts',
        latestID: latestID,
        oldestID: oldestID
    }

*/
exports.postCheck = function(req, done){

    //var postCheck = JSON.parse(req.get('postcheck'));
    var postCheck = req.body;

    
    if(postCheck.checkType === 'newposts'){

       // for logged in user? no not always.
       //Userposts.findOne({'username': req.user.name}, '', function(err,user){
       Userposts.findOne({'username': postCheck.forUser}, '', function(err,user){

           if(user){
           var wp = user.wallposts,
           i = wp.length-1,
           newPosts = [];

           // update postcheck Date!
           user.lastPostCheck = new Date();
           user.save();

           while(i >= 0){

               // if latest is found break
              
               if( wp[i]._id.toString() === postCheck.latestID ){

                   break;

               }

               // else it's a new post! push it to new posts.
               newPosts.push(wp[i]);

               i--;
           }

           done({posts: newPosts });
           
           // if not user
           }else{

              done({posts: [] });

           }

       });


/*
        Userposts.findOne({'_id': postCheck.latestID}, '', function(err,post){

            done(post);

        });
*/
    }else{

        done(null);

    }

};

// call this when you just want to get post info, and not the posts themselfs
exports.getPostInfo = function(username, done){

    Userposts.findOne({'username':username}, 'wallVisitCount wallVisits', function(err, postInfo){

        if(postInfo){
            done(postInfo);
        }else{
            done('');
        }

    });

};

// get the most recent post of the given user, and call the given callback when you get it
exports.getLatestPost = function(username, done){

    Userposts.findOne({'username': username}, '', function(err, posts){

         var last = {
             postContent : 'why don\'t you post something?'
         }
         
         if(posts){

             if(posts.wallposts.length > 0){
                 last = posts.wallposts[ posts.wallposts.length-1 ];
             }
         }
        
         done(last);

    });

};

/*
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


},
*/

// get a users posts (this loggs a visit)
exports.getPosts = function(req, username, done){

   
   Userposts.findOne({'username':username}, '', function(err,userPosts){

       // return posts, or empty string   
       if(userPosts){

           // log a visit
           userPosts.wallVisits.push({
               who: req.user.name,
               when : new Date()
           });
           userPosts.wallVisitCount += 1;

           userPosts.save(function(){

               console.log(req.user.name + ' visited the wall of ' + userPosts.username);

           });

           done(userPosts.wallposts);

       }else{

           done('');

       }
   });

};