 var ioPlayer, avversario;

window.onload = function() {
   // var socket = io.connect('http://localhost:8080');
//   var socket = io.connect('http://192.168.12.187:8080');
   var socket = io.connect('http://37.117.40.223:8080');
    
  
    
    // globals
    var playarea = {
		canvas : document.getElementById('tutorial'),
		context : document.getElementById('tutorial').getContext('2d'),
		divider: new Array(),
		ball : new Array(),
		pa: new Array()
    };
    
    playarea.canvas.width = 400;
    playarea.canvas.height = 300;
    
    up = -1;
    down = 1;

    //key codes
    key_up = 38;
    key_down = 40;

    paddle_inc = 10;        //how many pixels paddle can move in either direction

    players = [
		{//1
			id:0,
			score:0,
			direction:null,
			paddle: new Array()
		},
		{//2
			id:1,
			score:0,
			direction:null,
			paddle: new Array()
		}
	];

    function init(settings)
    {	
        playarea.pa['width'] = settings.playerArea.width;
        playarea.pa['height'] = settings.playerArea.height;
        playarea.pa['player_margin'] = settings.playerArea.player_margin;
        playarea.pa['foreground'] = settings.playerArea.foreground;
        playarea.pa['background'] = settings.playerArea.background;

        playarea.divider['pos'] = settings.divider.position;
        playarea.divider['width'] = settings.divider.width;

        players[avversario].paddle['width'] = settings.players[avversario].paddle.width;
        players[avversario].paddle['height'] = settings.players[avversario].paddle.height;
        players[avversario].paddle['x'] = settings.players[avversario].paddle.x;
        players[avversario].paddle['y'] = settings.players[avversario].paddle.y;

        players[ioPlayer].paddle['width'] = settings.players[ioPlayer].paddle.width;
        players[ioPlayer].paddle['height'] = settings.players[ioPlayer].paddle.height;
        players[ioPlayer].paddle['x'] = settings.players[ioPlayer].paddle.x;
        players[ioPlayer].paddle['y'] = settings.players[ioPlayer].paddle.y;

        playarea.ball['width'] = settings.ball.width;
        playarea.ball['height'] = settings.ball.height;
        playarea.ball['x'] = settings.ball.x;
        playarea.ball['y'] = settings.ball.y;
    }

    function renderPlayarea(data)
    {
        playarea.context.beginPath();

        playarea.context.clearRect(0,0,playarea.pa['width'], playarea.pa['height']);
        playarea.context.fillStyle = playarea.pa['background'];
        playarea.context.strokeStyle = playarea.pa['foreground'];
        playarea.context.fillRect(0,0, playarea.pa['width'], playarea.pa['height']);
        
        if(players[ioPlayer].direction != null)
        {
            if(players[ioPlayer].direction == up)
            	players[ioPlayer].paddle['y'] = players[ioPlayer].paddle['y'] - paddle_inc;
            else
            	players[ioPlayer].paddle['y'] = players[ioPlayer].paddle['y'] + paddle_inc;

            socket.emit('paddle_position', players[ioPlayer].paddle['y']);  
        }
        //disegna i paddle sul campo di gioco
        playarea.context.rect(players[avversario].paddle.x, data.players[avversario],
        		players[avversario].paddle.width,players[avversario].paddle.height);
        
        playarea.context.rect(players[ioPlayer].paddle.x, data.players[ioPlayer],
        		players[ioPlayer].paddle.width,players[ioPlayer].paddle.height);

        //disegna la palla sul campo di gioco
        playarea.context.rect(data.ball_x, data.ball_y, 
        		playarea.ball['width'], playarea.ball['height']);

        playarea.context.fillStyle = playarea.pa['foreground'];
        playarea.context.fill();

        playarea.context.beginPath();
        //redraw divider
        playarea.context.lineWidth = playarea.divider['width'];
        playarea.context.lineTo(playarea.divider['pos'], 0);
        playarea.context.lineTo(playarea.divider['pos'], playarea.pa['height']);
        playarea.context.lineWidth = 1;

        playarea.context.stroke();
        playarea.context.closePath();
    }

    function testCollisions()
    {
        //make sure paddles don't go beyond play area
        if(((players[ioPlayer].paddle['y'] <= 0) && (players[ioPlayer].direction == up)) || 
        		((players[ioPlayer].paddle['y'] >= (playarea.pa['height'] - players[ioPlayer].paddle['height'])) 
        				&& (players[ioPlayer].direction == down)))
        	players[ioPlayer].direction = null;

        //
    }

    document.onkeydown = function(ev)
    {
        switch(ev.keyCode)
        {
            case key_up:
            	players[ioPlayer].direction = up;
            	break;
            case key_down:
            	players[ioPlayer].direction = down;
            	break;
        }
    }

    document.onkeyup = function(ev)
    {
        switch(ev.keyCode)
        {
            case key_up:
            case key_down:
            	players[ioPlayer].direction = null;
            break;
        }
    }
    
    socket.on('userIdAssegnation', function(data){
        ioPlayer = data.io;
        avversario = data.avversario;
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

    socket.on("startGame", function(){
        setInterval(function(){
            testCollisions();
            renderPlayarea(data);
        }, 25);
    });
    
    socket.on('score', function(data){
    	var scores = $(".score");
    	$(scores[ioPlayer]).html(data[ioPlayer]);
    	$(scores[avversario]).html(data[avversario]);
    });
}