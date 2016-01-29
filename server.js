#!/bin/env node

/*    OpenShift_scriptbook
 *    Copyright 2015-2016 by Dustin Pfister (GPL-3.0)
 *    dustin.pfister@gamil.com
 *    
 *    https://github.com/dustinpfister/openshift_scriptbook
 *
 *    Social media for people who love javascript
 */

var express = require('express'),
session = require('express-session'),
MongoStore = require('connect-mongo/es5')(session)
openShift = require('./lib/openshift.js').openShiftObj,
expressLayouts = require('express-ejs-layouts'),

// passport
passport = require('passport'),
Strategy = require('passport-local').Strategy,

// child process
spawn = require('child_process').spawn,
exec = require('child_process').exec,

// users
users = require('./lib/users.js'),
wallpost = require('./lib/wallpost.js'),
posttype_templates = require('./lib/posttype_templates.js'),

//messbox
messBox = require('./lib/mess.js'),

// express app
app = express(),

// mongoDB
mongoose = require('mongoose'),
db = mongoose.createConnection(openShift.mongo),
Schema = mongoose.Schema,

// mongo example
IPLOGGER = db.model('client', new Schema({

    ip: String,
    count: Number

}));

// use passport local strategy
// following example at : https://github.com/passport/express-4.x-local-example/blob/master/server.js
passport.use(new Strategy(

    function(username, password, cb) {

        users.findByUsername(username, function(err, user) {

            if (err) {
                return cb(err);
            }
            if (!user) {
                return cb(null, false);
            }
            if (user.password != password) {
                return cb(null, false);
            }
            return cb(null, user);
        });

    }


));

passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {

    users.findById(id, function(err, user) {

        if (err) {
            return cb(err);
        }

        cb(null, user);
    });

});

// Use application-level middleware for common functionality, including logging, parsing, and session handling.
app.use(require('cookie-parser')());
app.use(require('body-parser').json({limit: '5mb'}));
app.use(require('body-parser').urlencoded({extended: true,limit: '5mb'}));
app.use( session({
    secret: 'keyboard cat', // ALERT! look into express-session and why the secret is important
    resave: false,
    store: new MongoStore({
        url: openShift.mongo
    }),
    saveUninitialized: false,
    limit: '5mb'
}));
app.use(passport.initialize());  // Initialize Passport and restore authentication state, if any, from the session
app.use(passport.session());

// use EJS for rendering
app.set( 'view engine', 'ejs' );
app.use( expressLayouts );
app.set( 'layout', 'layout_visit' );  // default to layout_visit.ejs, not layout.ejs
app.use( express.static('views') ); // must do this to get external files

// Paths
// ip logger
app.get('*', function(req,res,next){

    IPLOGGER.findOne({'ip': req.ip }, '', function(err, IP){

        if(!IP){

            IP = new IPLOGGER({

                ip : req.ip,
                count : 1

            });

            IP.save(function(){

                next();

            });

        }else{

            IP.count += 1;
            IP.save();
            next();

        }

    });

},

// redirrect visiters
function(req, res, next) {

    var visitPaths = ['/login', '/signup'], // paths that are okay to visit without being logged in
    i =0, len = visitPaths.length, okay;

    // if a user is not logged in
    if(!req.user){
        
        i=0;
        okay = false;
        while(i < len){
            if(req.path === visitPaths[i]){
                okay = true;
                break;
            }
            i++;
        }

        // if not okay redirrect
        if(!okay){
            res.redirect('/login')
        }else{
            next();
        }

    }else{

        // if we make it this far continue to next path
        next();

    }

}

);

app.post('*', function(req,res,next){

    require('./lib/allposts.js').all(req,res, next);

});

// login
app.get('/login', function(req, res){

    app.set('layout', 'layout_visit');
    res.render('login', {

        data : {
            time: new Date(),
            activePath: req.path
        }

    });

});

// login post
app.post('/login',
    // pre login
    function(req,res,next){

        console.log(req.body);

        next();
    },
    // authenticate
    passport.authenticate('local', {
            failureRedirect: '/login'
    }),
    // success
    function(req, res) {

        console.log(req.user.name +' loggin!');

        res.redirect('/');
    }
);

app.get('/signup', function(req,res,next){

    app.set('layout', 'layout_visit');
    res.render('signup', {
        data : {
            time: new Date(),
            activePath: req.path
        }
    });

});
app.post('/signup', function(req,res,next){

    users.createUser(req.body);

    res.redirect('/login');

});

// logout namespace
app.get('/logout', function(req, res) {

    req.logout();
    res.redirect('/login');
});

// root path get requests
app.get('/', function(req, res) {

    app.set('layout', 'layout_member');
    
    wallpost.getLatestPost(req.user.name, function(post){

        res.render('root', {
            user : req.user,
           // lastPost : posttype_templates.templates[post.postType](post.postContent),
            lastPost: !post.postType ? 'why not post something? ' : posttype_templates.templates[post.postType](post.postContent),
            data : {
                time: new Date(),
                activePath: req.path
            }
        });

    });

});

// the user namespace ( /user /user/ /user/username )
app.get(/wall(\/.*)?/, function(req, res) {

    var username;

    // if visiter is logged in
    if (req.user) {

        username = req.user.name

        if (req.url.length > 6) {

            username = req.url.replace(/\/wall\//, '');

        }

        users.findProfile(username, function(err, user) {

            // if user found
            if (user) {

                // find the users profile
                users.findProfile(username, function(err, user) {

                    // ALERT! call wallposts something other then wallposts to stop confusion with wallpost
                    // do they have posts?
                    wallpost.getPosts(req, user.name, function(wallposts) {

                        var len, i, html, currentPost;

                        if (wallposts !== '') {

                            // render posts
                            len = wallposts.length;
                            i = len;
                            html = '';

                            // render all posts for now
                            while (i--) {

                                // html context that will be in all posts
                                html += '<div data-postowner =\"'+ wallposts[i].postOwner +'\" data-posttype=\"' + wallposts[i].postType + '\" id=\"post_container_' + wallposts[i]._id + '\" class=\"post_container\">' +
                                    ' <div class=\"post_info\"> var fromUser = \"<a href="/users/'+wallposts[i].postOwner+'">' + 
                                    wallposts[i].postOwner + '</a>\", at = new Date(\"' + wallposts[i].postTime + '\")' +
                                    ', postType = \"' + wallposts[i].postType + '\";<\/div>';

                                    // inject html using the template for the wallpost's posttype
                                    html += posttype_templates.templates[ wallposts[i].postType ]( wallposts[i].postContent );

                                // end post container
                                html += '<\/div><!-- end post -->';
                            }

                            // render
                            app.set('layout', 'layout_member');
                            res.render('wall', {
                                user : req.user,
                                data : {
                                    time: new Date(),
                                    activePath: req.path
                                },
                                wall : {
                                    owner: user.name,
                                    posts: html
                                }
                            });

                        } else {

                            app.set('layout', 'layout_member');
                            res.render('wall', {
                                user : req.user,
                                data : {
                                    time: new Date(),
                                    activePath: req.path
                                },
                                wall : {
                                    owner: user.name,
                                    posts: '<div>why not post something<\/div>'
                                }
                            });

                        }

                    });

                });

            } else {

                app.set('layout', 'layout_member');
                res.render('usernotfound', {
                    user : req.user,
                    data : {
                        time: new Date(),
                        activePath: req.path
                    }
                });

            }

        });

    }

});
app.post(/wall(\/.*)?/, function(req, res) {

    // if wall post
    if (req.get('scriptbook-post') === 'wallpost') {

        wallpost.postToUserPage(req, function(status, post) {

            // if success send back the wallpost object
            if (status === 'success') {

                res.send(post);

                // send null if not sucess
            } else {

                res.send(null);

            }

        });

        // else if not a wall post
    } else {

        //if(req.get('postcheck')){
        if (req.get('scriptbook-post') === 'postcheck') {

            wallpost.postCheck(req, function(post) {

                res.send(JSON.stringify(post));

            });

        } else {

            res.send(JSON.stringify({
                nullpost: true
            }));

        }

    }

});

// the user namespace ( /user /user/ /user/username )
app.get(/users(\/.*)?/, function(req, res) {

    var username = req.user.name,
    atHome = true;

    if (req.url.length > 7) {

        username = req.url.replace(/\/users\//, '');
        atHome = false;
    }

    // get the user profile
    users.findProfile(username, function(err, user) {

        if(user){
            
            if(atHome){

               users.getUserNames(function(names) {

                   app.set('layout', 'layout_member');
                res.render('users', {
                    user : req.user,
                    data : {
                        time: new Date(),
                        activePath: req.path
                    }
                });

                });

           // we are visiting a users profile
            }else{

                wallpost.getPostInfo(user.name, function(postInfo){
  
                    app.set('layout', 'layout_member');
                res.render('userprofile', {
                    user : req.user,
                    data : {
                        time: new Date(),
                        activePath: req.path
                    },
                    profileUser : user,
                    postInfo: postInfo
                });


                });

            }

            
        }else{


            app.set('layout', 'layout_member');
                res.render('usernotfound', {
                    user : req.user,
                    data : {
                        time: new Date(),
                        activePath: req.path
                    }
                });

        }

    });

});
app.post(/user(\/.*)?/, function(req, res) {

    users.search(req, function(query){

        var html = '';

        query.forEach(function(user){
            html += '<div class=\"user_query\">'+
                '<p><span>username: <a href=\"/users/'+user.name+'\">'+user.name+'</a>, </span> <span>sex: '+user.sex+'; </span></p>'+
                '<ul> <li> lat:  '+user.location.lat+'</li> <li>long: '+user.location.lon+'</li> <li> country: '+user.location.country+', state: '+user.location.state+', city: '+user.location.city+' </li> </ul>'+
                
            '</div>';
        });

        app.set('layout', 'layout_member');
        res.render('usersearch', {
            user : req.user,
            data : {
                time: new Date(),
                activePath: req.path
            },
            query : html
        });
    });

});

// settings path
app.get('/settings', function(req,res){

    app.set('layout', 'layout_member');
        res.render('settings', {
            user : req.user,
            data : {
                time: new Date(),
                activePath: req.path
            }
    });

});
app.post('/settings', function(req,res){

    
    users.update(req, 'password', function(status){
        
        app.set('layout', 'layout_member');
        res.render('settingsupdate', {
            user : req.user,
            data : {
                time: new Date(),
                activePath: req.path
            },
            status : status
        });

    });

});

// about path
app.get('/about', function(req,res){

    app.set('layout', 'layout_member');
                res.render('about', {
                    user : req.user,
                    data : {
                        time: new Date(),
                        activePath: req.path
                    }
    });

});

// admin path
app.get('/admin', function(req, res){

    app.set('layout', 'layout_member');
    res.render('admin_'+req.user.admin, {
         user : req.user,
         data : {
             time: new Date(),
             activePath: req.path
         }
    });

});
app.post('/admin', function(req, res){


    if(req.user.admin >= 2){

        console.log('admin post from user '+req.user.name);
    
        if(req.get('scriptbook-post') === 'command'){
            console.log('command given!');

            var com = exec(req.body.command, []);

            com.stdout.on('data', function(data){

                res.send(JSON.stringify({success:'true', stdout: data }));

            })


        }

        

    }else{

        // just end the request
        res.send(JSON.stringify({success:'false'}));

    }

});

app.get('/messbox', function(req,res){

    messBox.getInbox(req.user.name, 0, 5, function(messages){
    
    app.set('layout', 'layout_member');
    res.render('messbox', {
         user : req.user,
         data : {
             time: new Date(),
             activePath: req.path
         },
         messages : messages
    });

    });


});
app.post('/messbox', function(req, res){

    console.log('well here it is...');
    console.log(req.body);

    
    messBox.sendMess(req.user.name, req.body.touser, req.body.content, function(status){

        app.set('layout', 'layout_member');
        res.render('messbox_sent', {
             user : req.user,
             data : {
                 time: new Date(),
                 activePath: req.path
             },
             status : status
    });

    });

});


var onStart = require('./lib/onstart.js');
// mongoDB check...
onStart.mongoCheck(

    // if mongodb check is good, start the app :-)
    function(){

        // start the server
        app.listen(openShift.port, openShift.ipaddress, function(){

            console.log('scriptbook lives');

            // call on start
            onStart.onStart(users);
   
        });

    },

    // if mongo check is bad run error app :-(
    function(){

        var errApp = express();

        console.log('looks like we do not have mongodb, launching static site');
        
        errApp.get('*', function(req,res){

            res.send('looks like mongoDB is not installed');

        });

        errApp.listen(openShift.port, openShift.ipaddress, function(){

            console.log('err app running.');

        });

    }

);