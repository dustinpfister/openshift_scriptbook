var mongoose = require('mongoose'),
openShift = require('./openshift.js').openShiftObj,
Schema = mongoose.Schema,

db = mongoose.createConnection(openShift.mongo),

messBox = db.model('messbox', new Schema({

    username : String,       // each user has a message box.
    messCount : Number,  // used to make id's for outgoing messages

    sent : [
        {
            toUser: String,     // the usernam the message is sent to
            messID: Number   // the message id is stored here, but the content is stored in the messbox of the user it is sent to
        }
    ],

    inbox : [
        {
            fromUser : String,  // the name of the user that sent it
            messID : Number,    // the id of the message that was sent
            content : String    // the content of the message
        }
    ]

}));

// make a new messBox for the given user
exports.createMessBox = function(username, done){

    var mb = new messBox({
        username : username,
        messCount : 0,
        sent : [],
        inbox : []
    });

    mb.save(function(){

        console.log('new messBox saved for user: ' + username);
        done();

    });
 
};

// send a message
exports.sendMess = function(fromUser, toUser, content){

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
                        content : content
                    };

                    toBox.inbox.push(mess);
                    toBox.save(function(){
                        console.log('message sent');                    
                        fromBox.sent.push({
                            toUser : toUser,
                            messID : fromBox.messCount
                        });
                        fromBox.messCount += 1;
                        fromBox.save(function(){
                            console.log('messCount updates');
                        });
                    });

                }

            });

        }

    });

};