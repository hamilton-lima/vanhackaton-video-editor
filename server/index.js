var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('video-builder.db');
var check;

db.serialize(function() {
  db.run("CREATE TABLE if not exists story ( " 
  	+ "id INTEGER PRIMARY KEY AUTOINCREMENT, " 
  	+ "email VARCHAR, data TEXT, "
  	+ "lastupdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ");

  db.run("CREATE TABLE if not exists answer ( " 
  	+ "id INTEGER PRIMARY KEY AUTOINCREMENT, " 
  	+ "story_id INTEGER, question_id INTEGER, option_id INTEGER,"
  	+ "lastupdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ");
});

var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

app.use('/', express.static(__dirname + '/client'));

app.post('/api/story/save', function (req, res) {
	console.log('/api/story/save', req.body );

	if( req.body.data.id ){
	  	var update = db.run("UPDATE story set data = ? WHERE id = ?", 
	  		[JSON.stringify(req.body.data), req.body.data.id],
	  		function(err){
	  			if(err){
					console.log('error: ', err );
	  				res.status(500).send({ error: err });
	  				return;
	  			}

				var result = { id: req.body.data.id };
				console.log('story UPDATED: ', result );
				res.json(result);
	  	});

	} else {
	  	var insert = db.run("INSERT INTO story(email,data) VALUES (?,?)", 
	  		[req.body.email, JSON.stringify(req.body.data)],
	  		function(err){
	  			if(err){
					console.log('error: ', err );
	  				res.status(500).send({ error: err });
	  				return;
	  			}

				var result = { id: this.lastID };
				console.log('story saved: ', result );
				res.json(result);
	  	});
	}

});

app.post('/api/story/remove', function (req, res) {
	console.log('/api/story/remove', req.body.id );

  	var insert = db.run("DELETE FROM story WHERE id = ?", req.body.id,
  		function(err){
  			if(err){
				console.log('error: ', err );
  				res.status(500).send({ error: err });
  				return;
  			}

			var result = { id: req.body.id };
			console.log('story removed: ', result );
			res.json(result);
  	});

});


app.post('/api/answer/create', function (req, res) {
	console.log('/api/answer/create', req.body );

  	var insert = db.run("INSERT INTO answer(story_id,question_id,option_id) VALUES (?,?,?)", 
  		[req.body.story_id, req.body.question_id, req.body.option_id],
  		function(err){
  			if(err){
				console.log('error: ', err );
  				res.status(500).send({ error: err });
  				return;
  			}

			var result = { id: this.lastID };
			console.log('answer saved: ', result );
			res.json(result);
  	});

});

app.get('/api/story/:id', function (req, res) {
	var msg = 'get story from id: ' + req.params.id;
	console.log(msg);

	var result = db.all('SELECT * FROM story WHERE id = ? ', req.params.id, 
	function(err,rows){
		if(err){
			console.log('error: ', err );
  			res.status(500).send({ error: err });
  			return;
  		}

		console.log(JSON.stringify(rows));
		res.json(rows);
	}); 
});

app.get('/api/stories/:email', function (req, res) {
	var msg = 'get story from email: ' + req.params.email;
	console.log(msg);

	var result = db.all('SELECT * FROM story WHERE email = ? ', req.params.email, 
	function(err,rows){
		if(err){
			console.log('error: ', err );
  			res.status(500).send({ error: err });
  			return;
  		}

		console.log(JSON.stringify(rows));
		res.json(rows);
	}); 
});

app.listen(3000, function () {
  console.log('listening on port 3000');
});
