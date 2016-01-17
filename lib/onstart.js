
var openShift = require('./openshift.js').openShiftObj,

// check version.ejs in the ejs namespace, set it to the current app version in package.json
versionCheck = function(){

    var fs = require('fs'),
    version = '0.0.0';

    console.log('updaing version.ejs based on package.json');

    // update version.ejs based on package.json
    fs.readFile('package.json', 'utf8', function (err,data) {

        if (err) {
            return console.log(err);
        }

        version = JSON.parse(data).version;
        fs.writeFile('views/version.ejs', version, function (err) {
    
            if (err) return console.log(err);
            console.log('version.ejs updated for: ' + version);

        });    
    
    });

},

// check for dustin acount, create it if it is not there, and always set admin status to true 
checkForDustin = function(){


};

// call this in the callback for app.listen or other such method.
exports.onStart = function(){

    // check views/version.ejs and updated to what is given in main package.json at app root
    versionCheck();

    checkForDustin();

};