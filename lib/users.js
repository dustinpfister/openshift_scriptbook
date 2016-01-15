var mongoose = require('mongoose'),
openShift = require('./openshift.js').openShiftObj,
Schema = mongoose.Schema,

db = mongoose.createConnection(openShift.mongo),

userRecord = db.model('userrecord', new Schema({

    // required 
    id: Number,
    name: String,
    password: String,
    admin: Boolean,

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

 console.log('**********');
   console.log(formData.skills.constructor.name );
   console.log(formData.skills);

   var DOB = new Date(formData.dob_year, formData.dob_month -1, formData.dob_day),

  

   newUser = new userRecord({

       id: 0, // need to get the latest id
       name: formData.name,
       password: formData.password,
       admin: false,  // new users always default to non-admin

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

                // we have a problem, or we are starting over with a new database.
                }else{

                    var newInfo = new userInfo({infoID: 'main', userCount: 1});

                    newInfo.save(function(){
                        console.log('saved new main user info record!');
                    });

                }

            });

        } // end if user

    }); // end userRecord.findOne

};