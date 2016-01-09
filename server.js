#!/bin/env node

var express = require('express'),
openShift = require('./lib/openshift.js').openShiftObj,

// express app
app = express();

app.get('/', function(req,res){

   res.send('scriptbook');

});

app.listen(openShift.port, openShift.host, function(){

    console.log('i live');

});