/* 
	URL Shortener Microservice for FreeCodeCamp
	by: Sergio Gaspar
	date: 2017/01/19
	
	Create miscroservice with the below user stories:
	
	US1: I can pass a URL as a parameter and I will receive a shortened URL in the JSON response.
	US2: If I pass an invalid URL that doesn't follow the valid http://www.example.com format, the JSON response will contain an error instead.
	US3: When I visit that shortened URL, it will redirect me to my original link.
*/
// Dependencies definitions 
var express = require('express');
var fs = require('fs');
var url = require('url');
var mongo = require('mongodb').MongoClient
var url = require('url');
var validUrl = require('valid-url');

// Instantiate express
var app = express();

/************ UPDATE DB INFO WITH YOUR OWN... WILL NOT WORK !!!   ************/
// MongoDB specs (NOTE: THE U/P are not correct.. setup your own and set them in the env variables)
// Hint: never upload REAL USER/PASS to GIT_HUB!!!
var dbuser = process.env.DBUSER || 'user';
var dbpassword = process.env.DBPASS || 'pass';
var dbURL = 'mongodb://' + dbuser + ':' + dbpassword + '@ds117849.mlab.com:17849/smg-fcc';
var db; // Global var to hold the ConnectionPool Object

// Application specs
var port = process.env.PORT || 3000;
var isDebug = false;
var baseURL = 'https://smg-url-short.herokuapp.com/';

/* Connect to MongoDB (only start APP is connection OK) */
/* Use connection pool from MongoClient and connect only once */
mongo.connect(dbURL, function(err, database) {
	if (err) throw err;

	db = database;
	Log('I', 'connected to MongoDB');

	// Listen on port 3000 by default, IP defaults to 127.0.0.1
	app.listen(port);

	// Logs port it is running on
	Log('I', 'Server running at http://127.0.0.1:' + port + '/');
});


// START: Simple Log functions to print to console
function Log(level, logStr) {
	if (isDebug && level === 'D') console.log("DEBUG: " + logStr);
	else if (level === 'I') console.log("INFO: " + logStr);
	else if (level === 'E') console.log("ERROR: " + logStr);
	else console.log(level + ": " + logStr);
};

function LogD(logStr) {
	Log('D', logStr);
}

function LogI(logStr) {
	Log('I', logStr);
}
// END: Simple Log functions to print to console

// This function inserts the URL in the DB and returns the JSON to send in the HTTP response
function insertURL(origURL, callback) {

	getNextSequence("url-short", function(err, seqnum) {
		if (err) throw err;
		// Got Sequence, insert in DB
		LogD("CALLBACK SEQ: " + seqnum);
		storeURL(origURL, seqnum, function(err, urlList) {
			if (err) throw err;
			// URL stored, return JSON to user
			LogD("BBBB");
			callback(err, JSON.stringify({
				original_url: origURL,
				short_url: baseURL + seqnum
			}));
		});
	});
}

// This function gets (and reserves) next URL sequence
// More on why the use of sequence: https://docs.mongodb.com/v3.0/tutorial/create-an-auto-incrementing-field/
// use: getNextSequence("url-short")
function getNextSequence(name, callback) {
	var counter = db.collection('counters');
	var ret = 0;

	counter.findAndModify({
			counter: name
		}, [
			['_id', 'asc']
		], {
			$inc: {
				seqno: 1
			}
		}, {
			new: true
		}, {}, // options
		function(err, object) {
			if (err) throw err;
			Log('D', 'Reserved new URL ID: ' + object.value.seqno);
			callback(err, object.value.seqno);
		});
}

// This function gets the old URL, the seqnum and stores them in the DB
function storeURL(origURL, seqnum, callback) {
	var urlList = db.collection('url-short');
	var urlShorted = {
		original_url: origURL,
		short_url: baseURL + seqnum,
		url_id: seqnum
	};

	urlList.insert(urlShorted, function(err, data) {
		if (err) throw err;
		callback(err);
	})
}

// Function to get the URL from the ID
function redirectURL(urlID, callback) {
	var urlList = db.collection('url-short');

	urlList.find({
		url_id: Number(urlID)
	}).toArray(function(err, urlDoc) {
		if (err) throw err;
		if (urlDoc.length === 1)
			callback(null, urlDoc[0].original_url);
		else
			callback(null, 'N/A');
	})
}

// Handle the site icon request... return nothing
app.get('/favicon.ico', function(req, res) {
	res.writeHead(204);
	res.end();
});

// Receive homepage reguest and send the index.html file
app.get('/', function(req, res) {
	Log('D', 'Requested homepage');

	// ASSINC file read
	fs.readFile('index.html', function(err, contents) {
		res.writeHead(200);
		if (err) throw err;
		res.write(contents);
		res.end();
	});
});

// Receive request to get new shortened URL
app.get('/new/*', function(req, res) {
	//var parts = url.parse(req.url, true);
	var origURL = url.parse(req.url, true).path;
	origURL = origURL.substr(5, origURL.length); // Remove the /new/ from the origURL

	if (validUrl.isWebUri(origURL)) {
		Log('D', 'Got a valid URL to encode: ' + origURL);
		res.writeHead(200);

		insertURL(origURL, function(err, answer) {
			if (err) throw err;
			LogD('CCCCC');
			res.write(answer);
			res.end();
		});
	} else {
		// Invalid URL, send error messange back
		Log('D', 'Got a invalid URL to encode: ' + origURL);
		res.writeHead(200);
		res.write(JSON.stringify({
			"error": "Wrong url format, make sure you have a valid protocol and real site."
		}));
		res.end();
	}
});

// Recieved request to redirect
app.get('/:id', function(req, res) {
	Log('D', 'Requested redirect to: id = ' + req.params.id);

	redirectURL(req.params.id, function(err, newURL) {
		if (err) throw err;

		if (newURL === 'N/A') {
			res.writeHead(200);
			res.write(JSON.stringify({
				"error": "This url is not on the database."
			}));
			res.end();
		} else {
			res.redirect(newURL);
		}
	});

});