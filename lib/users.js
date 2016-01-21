var mongoose = require('mongoose'),
openShift = require('./openshift.js').openShiftObj,
Schema = mongoose.Schema,

db = mongoose.createConnection(openShift.mongo),

userRecord = db.model('userrecord', new Schema({

    // required 
    id: Number,
    name: String,
    password: String,
    admin: Number,

    // basic info
    displayName: String,
    sex: String,
    DOB: Date,
    location: {
        lat: Number,
        lon: Number,
        country: String,
        state: String,
        city: String
    },
    skills: Array

    // status    
    //lastLogin: Date,
    //lastPost: Date,
    //status: String
})),
userInfo = db.model('userinfo',new Schema({
    infoID: String,
    userCount: Number
}));

exports.search = function(req, cb){

    if(req.body.sex === 'any'){
        delete req.body.sex;
    }

    userRecord.find(req.body, 'name sex location', function(err, query){
    
        cb(query);

    });

};

exports.update = function(req, what, cb){

    userRecord.findOne({'username': req.body.name}, '', function(err, user){

        if(user){

            // i may need a switch here
            switch(what){

                // password
                case 'password':

                    // comfirmed, and length >= 4?
                    if(req.body.set_password_0 === req.body.set_password_1 && req.body.set_password_0.length >= 4){

                        // then update it
                        user[what] = req.body.set_password_0;

                        user.save(function(){
                            cb('success');
                        });

                    }else{

                        cb('fail: password length is to short, or could not be comfirmed.');

                    }
                break;

            }

        }else{
            cb('fail: user not found!');
        }

    });

};


// find a user document by the given id
exports.findById = function(id,cb){
    userRecord.findOne({'id': id},'', function(err,user){
        if(user){
           return cb(null, user);
        }else{
            return cb(null,null);
        }
    });
};

// find a user document by the given username
exports.findByUsername = function(username, cb){
    userRecord.findOne({'name': username},'', function(err,user){
        if(user){
            return cb(null, user);
        }else{
            return cb(null,null);
        }
    });
};

// find a user profile by username
exports.findProfile = function(username, done){

    userRecord.findOne({'name': username},'id name displayName DOB admin sex location skills', function(err,user){

        if(user){
            return done(null, user);
        }else{
            return done(null,null);
        }
    });

};

// get all user names
exports.getUserNames = function(done){

    userRecord.find(function(err, data){
        
        var i = 0, len = data.length, names = []
        while(i < len){
            names.push(data[i].name);
            i++
        }

        done(names);

    });

};

exports.createUser = function(formData){

   var DOB = new Date(formData.dob_year, formData.dob_month -1, formData.dob_day),

   newUser = new userRecord({

       id: 0, // need to get the latest id
       name: formData.name,
       password: formData.password,
       admin: 0,  // new users always start at admin level 0

       // basic info
       displayName: formData.displayName,
       sex: formData.sex,
       location : {
           lat: formData.lat,
           lon: formData.lon,
           country: formData.country,
           state: formData.state,
           city: formData.city
       },
       skills: formData.skills,
       DOB: DOB

   });

    userRecord.findOne({'name': newUser.name},'', function(err,user){

        if(user){

            // what to do if the user is found

        }else{
            
            // find current user count
            userInfo.findOne({'infoID': 'main'},'', function(err,info){
            
                // we should have info
                if(info){
                    
                    // save new user
                    newUser.id = info.userCount;

                    // update user info
                    info.userCount += 1;

                    // save data
                    newUser.save(function(){

                        console.log('new user data saved!');
                    
                    });

                    info.save(function(){
                       console.log('user info updated!');
                    });

                // else we have a problem.
                }else{

                    console.log('user info not found!');

                }

            });

        } // end if user

    }); // end userRecord.findOne

};


// create main user info record if it is not there
exports.infoCheck = function(cb){

    var emptyDB = false;

    // find current user count
    userInfo.findOne({'infoID': 'main'},'', function(err,info){

        if(!info){

            console.log('ALERT! user info object not found, creating new one!');
            info = new userInfo({infoID: 'main', userCount: 1});
            info.save(function(){
                console.log('ALERT! saved new main user info record!');
            });

            emptyDB = true;

        }else{
       
            console.log('main user info record found, all is well');
            

        }

        // call callback with emptyDB status, and info object
        cb(emptyDB, info);

     });

};


// create the dustin account
exports.createDustin = function(){

    var dustin;

    // find current user count
    userInfo.findOne({'infoID': 'main'},'', function(err,info){

        if(info){

           dustin = new userRecord({

                id: info.userCount,
                name: 'dustin',
                password: '1234',  // yeah, be sure to change your password
                admin: 4,  

                // basic info
                displayName: 'Dustin',
                sex: 'male',
                location : {
                    lat: 43.2202285,
                    lon: -78.3876954,
                    country: 'USA',
                    state: 'NY',
                    city: 'Albion'
                },
                skills: ['mongodb', 'express', 'node', 'vanilla'],
                DOB: new Date(1983, 3, 6, 10, 5)

            });


            info.userCount += 1;
            info.save(function(){
                console.log('main info saved for dustin account');
            });
            dustin.save(function(){
                console.log('ALERT! new dustin account saved!');
            });


        }

    });

};