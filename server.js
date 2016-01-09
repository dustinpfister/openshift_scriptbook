#!/bin/env node

/*    OpenShift_demo by Dustin Pfister
 *    https://github.com/dustinpfister/openshift_demo
 *
 *    A simple openshift.com demo app using express, and mongoose.
 */

var express = require('express'),
openShift = require('./lib/openshift.js').openShiftObj,

// express app
app = express();

// root path get requests
app.get('/', function(req, res) {

    res.send('scriptbook');

});

// start server
app.listen(openShift.port, openShift.ipaddress);