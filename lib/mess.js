var mongoose = require('mongoose'),
openShift = require('./openshift.js').openShiftObj,
Schema = mongoose.Schema,

db = mongoose.createConnection(openShift.mongo),

messBox = db.model('messbox', new Schema({

    username : String,       // each user has a message box.
    messCount : Number,  // used to make id's for outgoing messages
    newMessCount : Number, // number of new messages

    sent : [
        {
            toUser: String,     // the usernam the message is sent to
            messID: Number   // the message id is stored here, but the content is stored in the messbox of the user it is sent to
        }
    ],

    inbox : [
        {
            fromUser : String,    // the name of the user that sent it
            messID : Number,    // the id of the message that was sent
            content : String,       // the content of the message

            read : Boolean,        // has the message been read
            sent : Date            // when was it sent
        }
    ]

}));

// make a new messBox for the given user
exports.createMessBox = function(username, done){

    var mb = new messBox({
        username : username,
        messCount : 0,
        newMessCount : 0,
        sent : [],
        inbox : []
    });

    mb.save(function(){

        console.log('new messBox saved for user: ' + username);
        done();

    });
 
};

// send a message
exports.sendMess = function(fromUser, toUser, content, done){

    if(!done){
        done = function(status){ console.log('no done function set for messBox.sendMess call! status mess: ' + status.mess); };
    }

    // find the fromUser
    messBox.findOne({'username': fromUser}, '', function(err, fromBox ){

        if(fromBox){

            // find the box you are sending a message to
            messBox.findOne({'username': toUser}, '', function(err, toBox ){

                if(toBox){

                    // user fromUsers current messCount as message ID
                    var mess = {
                        fromUser : fromUser,
                        messID : fromBox.messCount,
                        content : content,

                        read : false,
                        sent : new Date()
                    };

                    toBox.newMessCount += 1;  // add one to new message count
                    toBox.inbox.push(mess);     // push the new message to the box
                    toBox.save(function(){
                        console.log('message sent');                    
                        fromBox.sent.push({
                            toUser : toUser,
                            messID : fromBox.messCount
                        });
                        fromBox.messCount += 1;
                        fromBox.save(function(){
                            console.log('messCount updates');
                            done({mess: 'message sent'});
                        });
                    });

                }else{
                    done({mess: 'the receving user was not found'});
                }

            });

        }else{
            done({mess: 'the sending user was not found'});
        }

    });

};

// get inbox messages for the given username
exports.getInbox = function(username, page, pageSize, done){

    page = !page ? 0 : page;
    pageSize = !pageSize ? 5 : pageSize;

    var index = page * pageSize, len;
    messBox.findOne({'username': username}, '', function(err, userBox){

        done(userBox);
         
    });

};

// just get basic info about a user, such as if they have any new messages, and if so how many.
exports.getInfo = function(username, done){

    messBox.findOne({'username': username}, '', function(err, userBox){

        var messCount = userBox.newMessCount;

       done({newMessCount: messCount});
         
    });

};