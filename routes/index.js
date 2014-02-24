
/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', { title: 'Express' });
};

exports.prova = function(req, res){
  res.render('prova', { title: 'Express' });
};

exports.chat = function(req, res){
    res.render('chat', {title: "Chat page"});    
};

exports.pong = function(req, res){
    res.render('pong', {title: "PONG"});
};