

// check version.ejs in the ejs namespace, set it to the current app version in package.json
var versionCheck = function(){

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
checkForDustin = function(users){

    users.findByUsername('dustin',  function(err, dustin){

        if(dustin){
            console.log('dustin account found, assuring admin status is set true');
            dustin.admin = true;
            dustin.save(function(){

                console.log('dustins admin status set true.');

            });
        }else{

            console.log('dustins account not found, creating...');
            users.createDustin();

        }

    });


};

// call this in the callback for app.listen or other such method.
exports.onStart = function(users){

    // check views/version.ejs and updated to what is given in main package.json at app root
    versionCheck();

    users.infoCheck(function(emptyDB, info){

        if(emptyDB){
            console.log('ALERT! new Database');
        }

        checkForDustin(users);

    });

};

// check for mongoDB, and call an onSuccess, or onError callback
exports.mongoCheck = function(onSuccess, onError){

    var spawn = require('child_process').spawn,
    mongoTest = spawn('mongod', ['--version']);

    mongoTest.stdout.on('data', function(data){
        //console.log(`stdout: ${data}`);
        console.log('looks like we have mongoDB, lets do this...')

        // fire onSuccess callback
        onSuccess();
   
    });

    mongoTest.stderr.on('data', function(data){        
        //console.log(`stderr: ${data}`);

        console.log('an error happend when checking for mongo!?');

        // fire onError callback
        onError();

    });

    mongoTest.on('close', function(code){
        //console.log(`child process exited with code ${code}`);
        console.log('mongoDB check is done.');
    });

    // if this happens it may mean mongdb is not installed
    mongoTest.on('error', function(code){

        console.log('looks like we do not have mongodb');

        // fire onError callback
        onError();

    });



};