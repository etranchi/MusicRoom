'use strict'

var fs = require('fs');
var https = require('https');
var privateKey  = fs.readFileSync('./sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('./sslcert/server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};


const express = require('express');
const app = express();
const routes = require('./routes')
const db = require('./db/mongo.js');
const config = require('./config/config.json');
const bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/', routes);

app.get('/', ( req, res) =>  {
	res.status(200).json({"message":"Welcome to Music vroom!"});
});

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(config.port, config.host);

module.exports = httpsServer;
