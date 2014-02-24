
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var logger = require('./customModules/Logger');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(8080);
var connectedUsers = 0;

// all environments
//app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(express.logger({stream: logFile}));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/prova', routes.prova);
app.get('/chat', routes.chat);

app.get('/pong', routes.pong);

logger.SetLogFilePath("./miofile.log");


logger.Write("-----------------------------------------------------------------");
logger.Write("Distributed PONG\n Application Start");
logger.Write("-----------------------------------------------------------------");

var game;

var settingsConfiguration= {
	playerArea :{
        'width': 400,
        'height' : 300,
        'player_margin': 10,           //area behind player paddles
        'foreground': "#FFFFFF",
        'background': "#000000",
        "paddle_inc" : 10
    },
    divider:{
        'width': 4
    },
    paddle:{
        'width': 8,
        'height': 64},
    ball:{
        'size': 10,
        'speed': 2
    }
};

logger.Write("Configuration: ");
logger.Write(settingsConfiguration);

var model={
	playerArea :{
		width: settingsConfiguration.playerArea.width,
        height : settingsConfiguration.playerArea.height,
        player_margin: settingsConfiguration.playerArea.player_margin,           //area behind player paddles
	    foreground: settingsConfiguration.playerArea.foreground,
        background: settingsConfiguration.playerArea.background,
        paddle_inc: settingsConfiguration.playerArea.paddle_inc
    },
    divider:{
        width: settingsConfiguration.divider.width,    
        position: settingsConfiguration.playerArea.width/2
    },
	ball:{
        size: settingsConfiguration.ball.size,
        speed:settingsConfiguration.ball.speed,
        x:(settingsConfiguration.playerArea.width/2) - (settingsConfiguration.ball.size),
        y:(settingsConfiguration.playerArea.height/2) - (settingsConfiguration.ball.size),
        direction: null
    },
    players:{
        paddle:{
            width:settingsConfiguration.paddle.width,
            height: settingsConfiguration.paddle.height,
        }
    }
};

/* socket.emit('handshake');
    socket.on('handshake', function(dataHand){
        socket.emit('message', { message: 'welcome to the chat ' + dataHand.username, username: "System"});
        socket.broadcast.emit('newUser', {username: dataHand.username});
        socket.on('send', function (data) {
            data.username = dataHand.username;
            io.sockets.emit('message', data);
        });
        socket.on('disconnect', function (socket) {
            io.sockets.emit('leaveUser', {username: dataHand.username});
        });
    });*/


io.sockets.on('connection', function (socket) {
	
    var userId = connectedUsers;
    if(connectedUsers==0){
        socket.emit("userIdAssegnation", { mul : 0});
    }else{
    	socket.emit("userIdAssegnation", { mul : 1});
    }
    console.log("assegnato user id "+userId);
    connectedUsers++;
   
    socket.on('getGameConfiguration', function (data) {
        socket.emit('setGameConfiguration', model);
    });

    socket.on('readyToPlay', function (data) {
    	console.log("users: "+connectedUsers)
    	if(connectedUsers==2){
    		io.sockets.emit('startGame', Math.random()*360);
    		console.log("gameStarted");
    		StartGame();
    	}
    });


    socket.on('paddle_position', function (data) {
        socket.broadcast.emit('paddle_position', data);
    });

    socket.on('disconnect', function (socket) {
        connectedUsers--;
    });
});

function gameLogic(){
	testCollisions(); 
    renderGame();
}

function testCollisions(){
    //collisione bordo palla
/*	if((model.ball.y >= model.playerArea.height - model.ball.height) || model.ball.y <= 0)
        model.ball.direction = -model.ball.direction;
    **/
	//punti segnati
    if(model.ball['x'] <= 0 || model.ball.x >= (model.playerArea.width - model.ball.width)){
		if(model.ball['x'] <= 0){
	        resetGame();
	        clearInterval(game);
	        setTimeout(function(){
	            StartGame();
	        }, 1000);
	        model.players[1].score++;
	    }
	
	    if(model.ball.x >= (model.playerArea.width - model.ball.width))
	    {
	        resetGame();
	        clearInterval(game);
	        setTimeout(function(){
	            StartGame();
	        }, 1000);
	        model.players[0].score++;
	    }
	    io.sockets.emit("score", [model.players[0].score, model.players[1].score])
    }
    
    if((model.ball.x <= (model.players[0].paddle.x + model.players[0].paddle['width'])) && (model.ball['y'] >= model.players[0].paddle['y']) && (model.ball['y'] <= (model.players[0].paddle['y'] + model.players[0].paddle['height'])))
    {
        model.ball.direction= -model.ball.direction/2;
        model.ball.speed += .5;
    }

    if(((model.ball['x'] + model.ball['width']) >= model.players[1].paddle['x']) && (model.ball['y'] >= model.players[1].paddle['y']) && (model.ball['y'] <= (model.players[1].paddle['y'] + model.players[1].paddle['height'])))
    {
        model.ball.direction = (180+model.ball.direction)/2;
        model.ball.speed += .5;
    }

    calculateBallPosition()

}

function calculateBallPosition(){
    /*
	model.ball.x = model.ball.x + Math.cos((model.ball.direction)*Math.PI/180) * model.ball.speed;
    model.ball.y = model.ball.y + Math.sin((model.ball.direction)*Math.PI/180) * model.ball.speed;
    */
}

function renderGame(){
     io.sockets.emit('renderGame', {ball_x: model.ball.x, ball_y: model.ball.y, players: [model.players[0].paddle.y, model.players[1].paddle.y]});    
}

function StartGame(){
	//game = setInterval(gameLogic, 25);
}

function resetGame(){
	model.ball.x =(model.playerArea.width/2) - (model.ball.width),
    model.ball.y =(model.playerArea.height/2) - (model.ball.height),
    model.ball.direction = Math.random()*360;
	model.ball.speed = settingsConfiguration.ball.speed
}