
window.onload = function() {
    var socket = io.connect('http://localhost:8080');      //local test
//   var socket = io.connect('http://192.168.12.187:8080');  //office Address
//   var socket = io.connect('http://37.117.40.223:8080');   //home address
     
  
   var Game={
        playarea: {
            canvas: document.getElementById('tutorial'),
            context : document.getElementById('tutorial').getContext('2d'),
            divider:{
                pos: null,
                width: null
            },
            attributes:{
                width: null,
                height: null,
                player_margin: null,
                foreground: null,
                background: null,
                paddle_inc: null
            }
        },
        ball:{
            size: null,
            direction: null,
            speed: null,
            x: null,
            y: null
        },
        players:{
            mul: 1,
            ioPlayer:{//1
			    id:0,
			    score:0,
			    direction:null,
			    paddle: {
                    width: null,
                    height: null,
                    x: null,
                    y: null
                }
		    },
            avversario: {//2
			    id:1,
			    score:0,
			    direction:null,
			    paddle: {
                    width: null,
                    height: null,
                    x: null,
                    y: null
                }
		    }
        }
    }; 
    
    Game.playarea.canvas.width = 400;
    Game.playarea.canvas.height = 300;
    
    up = -1;
    down = 1;

    //key codes
    key_up = 38;
    key_down = 40;

    function init(settings)
    {	
        console.log(settings);

        Game.playarea.attributes.width = settings.playerArea.width;
        Game.playarea.attributes.height = settings.playerArea.height;
        Game.playarea.attributes.player_margin = settings.playerArea.player_margin;
        Game.playarea.attributes.foreground = settings.playerArea.foreground;
        Game.playarea.attributes.background = settings.playerArea.background;
        Game.playarea.attributes.paddle_inc = settings.playerArea.paddle_inc;

        Game.playarea.divider.pos = settings.divider.position;
        Game.playarea.divider.width = settings.divider.width;

        Game.players.avversario.paddle.width = settings.players.paddle.width;
        Game.players.avversario.paddle.height = settings.players.paddle.height;
        Game.players.avversario.paddle.x = Game.playarea.attributes.player_margin;
        Game.players.avversario.paddle.y = (Game.playarea.attributes.height/2)-(Game.players.avversario.paddle.height/2);

        Game.players.ioPlayer.paddle.width = settings.players.paddle.width;
        Game.players.ioPlayer.paddle.height = settings.players.paddle.height;
        Game.players.ioPlayer.paddle.x = Game.playarea.attributes.width - Game.playarea.attributes.player_margin - settings.players.paddle.width;
        Game.players.ioPlayer.paddle.y = (Game.playarea.attributes.height/2)-(Game.players.avversario.paddle.height/2);

        Game.ball.speed = settings.ball.speed;
        Game.ball.size = settings.ball.size;
        Game.ball.x = settings.ball.x;
        Game.ball.y = settings.ball.y;
    }

    function renderPlayarea()
    {
        
        Game.playarea.context.beginPath();

        Game.playarea.context.clearRect(0,0, Game.playarea.attributes.width, Game.playarea.attributes.height);
        Game.playarea.context.fillStyle = Game.playarea.attributes.background;
        Game.playarea.context.strokeStyle = Game.playarea.attributes.foreground;
        Game.playarea.context.fillRect(0,0, Game.playarea.attributes.width, Game.playarea.attributes.height);
        
        if(Game.players.ioPlayer.direction != null)
        {
            if(Game.players.ioPlayer.direction == up)
            	Game.players.ioPlayer.paddle.y = Game.players.ioPlayer.paddle.y - Game.playarea.attributes.paddle_inc;
            else
            	Game.players.ioPlayer.paddle.y = players.ioPlayer.paddle.y + Game.playarea.attributes.paddle_inc;

            socket.emit('paddle_position', Game.players.ioPlayer.paddle.y);  
        }
        //disegna i paddle sul campo di gioco
        Game.playarea.context.rect(Game.players.avversario.paddle.x, Game.players.avversario.paddle.y,
        		Game.players.avversario.paddle.width, Game.players.avversario.paddle.height);
        
        Game.playarea.context.rect(Game.players.ioPlayer.paddle.x, Game.players.ioPlayer.paddle.y,
        		Game.players.ioPlayer.paddle.width, Game.players.ioPlayer.paddle.height);

        //disegna la palla sul campo di gioco
        Game.playarea.context.rect(Game.ball.x, Game.ball.y, 
        		Game.ball.size, Game.ball.size);

        Game.playarea.context.fillStyle = Game.playarea.attributes.foreground;
        Game.playarea.context.fill();

        Game.playarea.context.beginPath();
        //redraw divider
        Game.playarea.context.lineWidth = Game.playarea.divider.width;
        Game.playarea.context.lineTo(Game.playarea.divider.pos, 0);
        Game.playarea.context.lineTo(Game.playarea.divider.pos, Game.playarea.pa.height);
        Game.playarea.context.lineWidth = 1;

        Game.playarea.context.stroke();
        Game.playarea.context.closePath();
        
        /*
        console.log("Paddle mio "+ Game.players[ioPlayer].paddle.y);
        console.log("Paddle avversario " + Game.players[avversario].paddle.y);
        console.log("Ball Position "+ Game.ball.x +" - "+ Game.ball.y, "Direction: "+ Game.ball.direction);
        */
    }

    function testCollisions()
    {
        //make sure paddles don't go beyond play area
        if(((Game.players.ioPlayer.paddle.y <= 0) && (Game.players.ioPlayer.direction == up)) || 
        		((Game.players.ioPlayer.paddle.y >= (Game.playarea.attributes.height - Game.players.ioPlayer.paddle.height)) 
        				&& (Game.players.ioPlayer.direction == down)))
        	Game.players.ioPlayer.direction = null;
    
        //spostamento della ball
        Game.ball.x = Game.ball.x + Math.cos((Game.ball.direction)*Math.PI/180) * Game.ball.speed;
        Game.ball.y = Game.ball.y + Math.sin((Game.ball.direction)*Math.PI/180) * Game.ball.speed;
        
        //Ball bounce against ring border
        if((Game.ball.y >= Game.playarea.attributes.height - Game.ball.size) || Game.ball.y <= 0)
            Game.ball.direction = -Game.ball.direction;
    }

    document.onkeydown = function(ev)
    {
        switch(ev.keyCode)
        {
            case key_up:
            	Game.players.ioPlayer.direction = up;
            	break;
            case key_down:
            	Game.players.ioPlayer.direction = down;
            	break;
        }
    }

    document.onkeyup = function(ev)
    {
        switch(ev.keyCode)
        {
            case key_up:
            case key_down:
            	Game.players.ioPlayer.direction = null;
            break;
        }
    }
    
    socket.on('userIdAssegnation', function(data){
        if(data.mul != 0)
            Game.players.mul=data.mul;
        console.log("Mul: "+data);
        socket.emit('getGameConfiguration');
    });
    
    socket.on('setGameConfiguration', function(data){
        init(data);
        socket.emit('readyToPlay');
    });
    
    socket.on('renderGame', function(data){
        testCollisions();
    	renderPlayarea(data);
    });

    socket.on("startGame", function(data){
        Game.ball.direction = calculateBallDirection(data);
        setInterval(function(){
            testCollisions();
            renderPlayarea();
        }, 25);
    });
    
    socket.on("paddle_position", function(data){
        Game.players.avversario.paddle.y= data;    
    });

    socket.on('score', function(data){
    /*	var scores = $(".score");
    	$(scores[ioPlayer]).html(data[ioPlayer]);
        Game.players[ioPlayer].score = data[ioPlayer];
    	$(scores[avversario]).html(data[avversario]);
        Game.players[avversario].score = data[avversario];*/
    });

    function calculateBallDirection(direction){
        if(Game.players.mul!=0)
            return 180 - direction;
        else
            return direction;
    }
}

