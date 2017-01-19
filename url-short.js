/* 
	TURL Shortener Microservice for FreeCodeCamp
	by: Sergio Gaspar
	date: 2017/01/19
	
	Create miscroservice with the below user stories:
	
	US1: I can pass a URL as a parameter and I will receive a shortened URL in the JSON response.
	US2: If I pass an invalid URL that doesn't follow the valid http://www.example.com format, the JSON response will contain an error instead.
	US3: When I visit that shortened URL, it will redirect me to my original link.
*/
var express = require('express');
var fs = require('fs');
var url = require('url');
var mongo = require('mongodb').MongoClient

var app = express();

// MongoDB specs
var dbuser='fccuser';
var dbpassword='XXXX';
var dbURL = 'mongodb://'+dbuser+':'+dbpassword+'@ds117849.mlab.com:17849/smg-fcc';

var port = process.env.PORT || 3000;
var isDebug = false;
var html = fs.readFileSync('index.html');


mongo.connect(dbURL, function(err, db) {
    var shortURLS = db.collection('url-short');
	Log('I', 'connected to MongoDB');
   /* parrots.find({
      age: { $gt: parseInt(process.argv[2], 10) }
    }).toArray(function(err, documents) {
        //console.log("GOT: "+ JSON.stringify(documents));
        console.log(documents);
        /*documents.map(function(obj){ 
          return console.log(obj);;
        });
    })*/
    db.close();
});


// Simple Log function to print to console
function Log(level, logStr){
	if (isDebug && level === 'D') console.log("DEBUG: "+logStr);
		else if (level === 'I') console.log("INFO: "+logStr);
			else if (level === 'E') console.log("ERROR: "+logStr);
				else console.log(level+": "+logStr);
};

// Handle the site icon request... return nothing
app.get('/favicon.ico', function(req, res) {
	res.writeHead(204);
	res.end();
});

// Express app handles all GET regardless of URL (no routing)
app.get('/*', function(req, res) {
	var parts = url.parse(req.url, true);
	var path = parts.path;
		
	if (path === '/') {
		// return index.html if no timestamp requested
		res.writeHead(200);
		res.write(html);
		res.end();
	} else if (path === '/favicon.ico') {
		// Handle the site icon request... return nothing
		res.writeHead(200);
		res.end();
		} else {
			path = path.slice(1);				// Remove '/'
			path = replaceAll(path,'%20',' ');	// Handles spaces in the URL
			
			Log('I','URL: '+path);
			res.writeHead(200);
			
			if ((isNaN(path)) && (isNaN(Date.parse(path)))) {
				Log("D","Not a proper date inserted, returning null.");
				res.write(getNullResponse());
			} else {
				Log("D","Date inserted, determining output");
				res.write(getResponse(path));
			}
			res.end();
	}
	
});

// Listen on port 3000 by default, IP defaults to 127.0.0.1
app.listen(port);

// Logs port it is running on
Log('I','Server running at http://127.0.0.1:' + port + '/');
// URL to execute:  http://npm.sergiomgaspar.c9users.io/
