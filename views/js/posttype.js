/*
    posttype.js

    posttype.js is a scriptbook front-end for handeling the posting, and injecting of wall posts on the client system.

    depends:

        * marked_min.js
        * posttype_say.js , posttype_quickcanvas.js ( and any additional plug-ins )

*/

var postType = (function () {

    var state = {

            defaultType: 'say',
            postTypes: {},
            json: [],
            wallPostContainer: document.body

        },

        setOnAction = function (container) {

            (function () {

                var pt = container.dataset.posttype;

                container.addEventListener('click', function (e) {

                    var actionObj = state.postTypes[pt].onAction,
                        action = actionObj[String('ifID_' + e.target.id)] || actionObj[String('ifClass_' + e.target.className)];

                    // if there is an action for that id, call it
                    if (action) {
                        action(e, this, e.target);
                    }

                });

            }());

            // call the posttypes autorun if it has one
            if (state.postTypes[container.dataset.posttype].autoRun) {

                state.postTypes[container.dataset.posttype].autoRun(container);

            }

        },

        setActive = function (postType) {

            var active = document.getElementById('posttype_interface_' + postType),

                oldActive = document.getElementsByClassName('posttype_active_interface');

                [].forEach.call(oldActive, function (old) {
                old.className = 'posttype_inactive_interface';
            });

            active.className = 'posttype_active_interface';

        };

    return {

        // make state public
        state: state,

        // add plugin method
        add: function (plugin) {

            //state.postTypes.push(plugin);
            state.postTypes[plugin.postType] = plugin;

        },

        addJSON: function (aurgObj) {

            state.json.push(aurgObj);

        },

        setWallPostContainer: function (el) {

            state.wallPostContainer = el;

        },

        // attach event handlers to any given posts that may have been generated server side
        attachToGiven: function () {

            var posts = document.getElementsByClassName('post_container');
            [].forEach.call(posts, function (post) {

                // set onAction for each server given post
                setOnAction(post);

            });

        },

        // inject the posttype interface
        injectInterface: function (container) {

            // gen radio buttons
            var html = '<div id="posttype_typeselect">';
            Object.keys(state.postTypes).forEach(function (st, i) {

                html += '<input type="radio" name="posttype_select" id="posttype_radio_"' + st + ' value="' + st + '" ' + (function () {
                    return i === 0 ? 'checked' : '';
                }()) + ' ><span>' + st + '<\/span>';

            });
            html += '<\/div>';

            // gen ui html
            for (var postType in state.postTypes) {

                html += '<div data-posttype=\"' + postType + '\" id=\"posttype_interface_' + postType + '\" class=\"posttype_inactive_interface\">' +
                    state.postTypes[postType].ui(state) +
                    '<\/div>';

            }

            // inject interface into container
            container.innerHTML = html;

            // now that we have the html, attach handlers
            for (var postType in state.postTypes) {

                setOnAction(_.get('posttype_interface_' + postType));

            }

            // show current posttype interface and hide others
            _.get('posttype_typeselect').addEventListener('click', function (e) {

                if (!(e.target === this)) {

                    setActive(e.target.value);

                }

            });

            setActive(state.defaultType);

        },

        injectFromDialHome: function (resStack) {

            var i = resStack.length;
            while (i--) {
                this.injectPost(resStack[i]);
            }

        },

        injectPost: function (response) {

            var post_container = document.createElement('div'),
                parrent = _.get('wall_posts');

            post_container.id = 'post_container_' + response._id;
            post_container.className = "post_container";
            post_container.dataset.posttype = response.postType;

            // attach event handler
            setOnAction(post_container);

            post_container.innerHTML = ' <div class=\"post_info\"> var fromUser = \"<a href=\"/users/' + response.postOwner + '\">' + response.postOwner +
                '</a>", at = new Date(\"' + response.postTime + '\"), postType = \"' + response.postType + '\";<\/div>' +

                // rest of content depends on postType
                (function () {

                    var pt = state.postTypes[response.postType],

                        // mark content
                        content = pt.marked ? marked(response.postContent) : response.postContent;

                    return pt.postTemplate(content);

                }());

            if (parrent.children.length > 0) {
                parrent.insertBefore(post_container, parrent.children[0]);
            }

        }

    }

}());