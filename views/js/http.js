
var allHttp = (function(){

    // post to server
    var httpPost = function (path, header, data, done) {
        var xhr = new XMLHttpRequest();

        // default done callback
        if(done === undefined){

            done = function(response){

                console.log('you did not give a callback for the response but here it is in the console: ');
                console.log(response);

            }

        }

        xhr.open('POST', path);

        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.setRequestHeader('scriptbook-post', header); // header should just be used to tell scriptbook what kind of post it is.

        xhr.onreadystatechange = function () {

            if (this.readyState === 4) {

                done(JSON.parse(this.response));

            }

        };

        xhr.send(JSON.stringify(data));

    };

    return {

        sendCommand : function(data, done){

            httpPost('/admin', 'command', data, done);

        }

/*
        // send a wall post
        sendWallPost : function(data, done){

            httpPost('wallpost', data, done);

        },

        // send a post check
        sendPostCheck : function(data,done){

            httpPost('postcheck',data,done);

        }
*/

    }

}());