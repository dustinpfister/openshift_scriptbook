#!/bin/env node

/*    OpenShift_demo by Dustin Pfister
 *    https://github.com/dustinpfister/openshift_demo
 *
 *    A simple openshift.com demo app using express, and mongoose.
 */

var express = require('express'),
openShift = require('./lib/openshift.js').openShiftObj,
expressLayouts = require('express-ejs-layouts'),


// express app
app = express();

// app.use

// use EJS for rendering
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('views')); // must do this to get external files


// root path get requests
app.get('/', function(req, res) {

    console.log(req.path);

    //res.send('scriptbook');
    res.render('root.ejs', {
        data : {
            time: new Date(),
            activePath: req.path
        }
    });

});

// root path get requests
app.get('/users', function(req, res) {

    console.log(req.path);

    //res.send('scriptbook');
    res.render('users.ejs', {
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