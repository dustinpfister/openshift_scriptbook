#!/bin/env node

/*    OpenShift_demo by Dustin Pfister
 *    https://github.com/dustinpfister/openshift_demo
 *
 *    A simple openshift.com demo app using express, and mongoose.
 */

var express = require('express'),
openShift = require('./lib/openshift.js').openShiftObj,
expressLayouts = require('express-ejs-layouts'),

// passport
passport = require('passport'),
Strategy = require('passport-local').Strategy,

// users
users = require('./lib/users.js'),

// express app
app = express();

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
// ALERT! check out: npmjs.com/package/express-session
app.use(require('express-session')({
    secret: 'keyboard cat', // ALERT! look into express-session and why the secret is important
    resave: false,
    saveUninitialized: false,
    limit: '5mb'
}));
app.use(passport.initialize());  // Initialize Passport and restore authentication state, if any, from the session
app.use(passport.session());

// mongoDB
var mongoose = require('mongoose'),
db = mongoose.createConnection(openShift.mongo),
Schema = mongoose.Schema,

// mongo example
IPLOGGER = db.model('client', new Schema({

    ip: String,
    count: Number

}));

// app.use

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

    console.log('hello???');

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
    res.render('root', {
        user : req.user,
        data : {
            time: new Date(),
            activePath: req.path
        }
    });

});

// root path get requests
app.get('/users', function(req, res) {

    app.set('layout', 'layout_member');
    res.render('users', {
        user : req.user,
        data : {
            time: new Date(),
            activePath: req.path
        }
    });

});

// start server
app.listen(openShift.port, openShift.ipaddress, function(){

    console.log('it lives');

});