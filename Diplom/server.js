    const express = require('express');
    const app = express();
    const port = 3000;
    const bodyParser = require('body-parser');
    var jsonParser = bodyParser.json();
    var urlencodedParser = bodyParser.urlencoded({ extended: false });

    app.get('/', (request, response) => {
        response.sendFile(__dirname + '/Pages/MainPage.html');
    });
    app.get('/styles/prompt.js', (request, response) => {
        response.sendFile(__dirname + '/Pages/styles/prompt.js');

    });
    app.get('/styles/styles.css', (request, response) => {
        response.sendFile(__dirname + '/Pages/styles/styles.css');

    });

    app.get('/registration', (request, response) => {
        response.send('Registration from Express!')
    });

    app.post('/', urlencodedParser, function (req, res) {
        console.log(req.body);
        response.sendFile(__dirname + '/Pages/styles/styles.css');
        res.send('welcome, ' + req.body.secondName);
    });

    app.use((request, response, next) => {
        console.log(request.headers);
        next()
    });

    app.use((request, response, next) => {
        request.chance = Math.random();
        next()
    });

    app.listen(port, (err) => {
        if (err) {
            return console.log('something bad happened', err)
        }
        console.log(`server is listening on ${port}`)
    });
