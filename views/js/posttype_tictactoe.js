/*
 *    posttype_tictactoe.js
 *    Copyright 2015-2016 by Dustin Pfister ( GPL-3.0 )
 *
 *    A simple tic tact toe game for scriptbook
 *
 */


postType.add((function(){

    // draw the game state to the given canvas, using the given gride
    var drawGame = function(canvas, grid){

        var ctx = canvas.getContext('2d');

        ctx.fillStyle = '#222222';
        ctx.fillRect(0,0,320,240);
        ctx.lineWidth = 3;
        
        var i=0, len = grid.length,x,y;
        while(i < len){

            ctx.fillStyle='#555555';
            ctx.strokeStyle='#ffffff';
            x = i % 3 * 80 + 40;
            y = Math.floor(i / 3) * 80;

           ctx.fillRect( x, y, 79, 79);

            if(grid[i].side === 'X'){

                ctx.fillRect( x, y, 1, 1);

                ctx.beginPath();
                ctx.moveTo(x+10,y+10);
                ctx.lineTo(x+70, y+70);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(x + 70 , y+10);
                ctx.lineTo(x+10, y+70);
                ctx.stroke();

            }

            if(grid[i].side === '0'){
                ctx.fillRect( x, y, 10, 10);
            }


            i++;

        }

    };


    // return the posttype object
    return {

        postType: 'tictactoe',

        // user interface for creating a "say"
        ui: function(){

            return   '<input id="tictactoe_post" type="submit" value="post">';

        },

        // what to do once when the post is loaded
        autoRun : function(container){

          var canvas = container.getElementsByTagName('canvas')[0], grid;

          if(canvas){

              // get the gird
              grid = JSON.parse(canvas.dataset.state).grid;

              // draw the game to the canvas
              drawGame(canvas, grid);

          }


        },

        // onAction methods
        onAction : {

            ifClass_tictactoe : function(e){

                var box = e.target.getBoundingClientRect(),
                x = e.clientX - box.left,
                y = e.clientY - box.top;

                console.log(x + ',' + y);

               var username = _.get('username').innerHTML,
               state = JSON.parse(e.target.dataset.state),
               owner = e.target.parentElement.dataset.postowner; 

               // is the logged in user the owner?
               if(username === owner){

                   if(state.ownersTurn){

                       console.log('okay')

                   }else{
                       console.log('it is not your turn')
                   }

               // else another user
               }else{

                   console.log('hello non-owner user');

               }
                              


               console.log(username);
               console.log(owner);
               console.log(state);


            },

            // the container
            ifClass_post_container : function(){

            },

            // input
            ifID_tictactoe_input: function(){

            },

            // post button
            ifID_tictactoe_post: function(){
       
                // send home new say.
                myHttp.sendWallPost(
                    {
                        postOwner: '?user', // ALERT! the post owner should always just be the logged in user, this is not needed.
                        postTo: _.get('wall_username').innerHTML, // ALERT! this can be discorvered server side as well by looking at the namespace.
                        postType: 'tictactoe',  // let the server know the posttype
                        postContent: {
                            ownersTurn: false, 
                            grid: [

                                { poster: '', side: '' },
                                { poster: '', side: '' },
                                { poster: '', side: '' },
                                { poster: '', side: '' },
                                { poster: 'username', side: 'X' },
                                { poster: '', side: '' },
                                { poster: '', side: '' },
                                { poster: '', side: '' },
                                { poster: '', side: '' }

                           ] 
                       }

                    },

                    postType.injectPost

                );

         
            }

        },

        // template for generating a says html
        postTemplate: function(postContent){ return '<canvas class=\"tictactoe\" width=\"320\" height=\"240\" style="background: #ff0000;" ></canvas>';  }
    }

}()));