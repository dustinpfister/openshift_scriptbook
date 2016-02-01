var _http = (function(){

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

        // generic send function
        send : function(path, scriptbookHeader, data, done){

            httpPost(path, scriptbookHeader,data, done);

        },

        // ALERT! don't i just need the single send function

        // site wide
        sendSiteWide : function(path, data, done){

           console.log(path);

            httpPost(path, 'site_wide_dial_home', data, done);

        },

        // send command for admin path
        sendCommand : function(data, done){

            httpPost('/admin', 'command', data, done);

        },

         // send a wall post
        sendWallPost : function(data, done){

            httpPost('/wall','wallpost', data, done);

        },

        // send a post check
        sendPostCheck : function(data,done){

            httpPost('/wall','postcheck',data,done);

        },

        // send command 
         sendCommand : function(data, done){

            httpPost('/admin', 'command', data, done);

        }

    };

}());