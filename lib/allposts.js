/*
 *    allposts.js
 *    Copyright 2016 by Dustin Pfister (GPL-3.0)
 *    
 *    what to do for all post requests.
 */

var messBox = require('./mess.js');

// call this for app.post('*') in server.js
exports.all = function(req, res, next){

    if(req.get('scriptbook-post') === 'site_wide_dial_home'){

        //  check for new messages
        messBox.getInfo(req.user.name, function(info){

            res.send(JSON.stringify(info));

        });

    }else{

        next();

    }

};