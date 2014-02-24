/**
 * New node file
 */
var fs = require('fs');

var Logger ={
	
	_logStream: null,
	
	SetLogFilePath: function(path){
		try{
			_logStream= fs.createWriteStream(path);
		}catch(err){
			fs.mkdir(path, function(){
				_logStream= fs.createWriteStream(path, {flags: 'r+'});
			});
		}
	},
	
	Write: function(data){
		_logStream.write(this._ToString(data, 1) +"\n");
	},
	
	_ToString: function(data, depth){
		if(typeof(data) == "object"){
			var string = "{\n";
			for(var key in data){
				string+= "	".repeat(depth) + this._ToString(key, depth+1) +" : "+ 
				this._ToString(data[key], depth +1)+ "\n";
			}
			string +="	".repeat(depth-1) +"}";
			return string;
		}
		else
			return data;
	}
}

String.prototype.repeat = function( num )
{
    return new Array( num + 1 ).join( this );
}

module.exports = Logger;
