var express = require('express')
var serveStatic = require('serve-static')
var bodyParser = require('body-parser')
var app = express()
var controlDB = require('./controldb.js');
var request = require('request');
var pushServiceUrl = 'http://localhost:3000';

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json())

app.post('/api/save-subscription/', function(req, res) {
    var endpoint = req.body.endpoint;
    var expirationTime = req.body.expirationTime;
    var key256 = req.body.keys.p256dh;
    var keyAuth = req.body.keys.auth;

    // endpoint and keys are required, expirationTime is optional
    if (endpoint && key256 && keyAuth) {
        controlDB.insert(endpoint, expirationTime, key256, keyAuth, function(result) {

            if (result) {
                sendHelloWorldMessage();

                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify({
                    success: true
                }));

            } else {
                res.setHeader('Content-Type', 'application/json');
                res.status(400)
                res.send(JSON.stringify({
                    success: false
                }));
            }
        });

    } else {
        res.setHeader('Content-Type', 'application/json');
        res.status(400)
        res.send(JSON.stringify({
            success: false
        }));
    }
})

app.get('/statistics/', function(req, res) {
    controlDB.getSubscriptionDates(function(data) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({
            'status': 'success',
            'data': data
        }));
    });
})


function sendHelloWorldMessage() {
    var json = {
        "body": "Bem vindo",
        "title": "Aqui é Galo",
        "icon": "images/galo.png"
    }

    var msg = JSON.stringify(json);

    request.post(pushServiceUrl, {
        form: {
            team: 'galo',
            message: msg
        }
     }, function(error, response, body) {
         console.log('error: ', error);
         console.log('statusCode: ', response && response.statusCode);
         console.log('body: ', body);
     });
}

app.listen(8080, 'localhost')

module.exports = app; // for testing
