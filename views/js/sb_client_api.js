var _ = (function () {

    // post to server
    var httpPost = function (path, header, data, done) {
        var xhr = new XMLHttpRequest();

        // default done callback
        if (done === undefined) {

            done = function (response) {

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

        // get by id
        get: function (id) {
            return document.getElementById(id);
        },

        // image to DataURL
        getImageDataURL: function (img) {

            // Create an empty canvas element
            var canvas = document.createElement("canvas"),
                ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;

            // Copy the image contents to the canvas
            ctx.drawImage(img, 0, 0);

            var dataURL = canvas.toDataURL("image/png");

            console.log(dataURL.length);

            return dataURL; //dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
        },

        // generic HTTP send function
        send: function (path, scriptbookHeader, data, done) {

            httpPost(path, scriptbookHeader, data, done);

        }

    };

}());