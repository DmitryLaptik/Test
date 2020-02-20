const express = require('express');
const bodyP = require('body-parser');
const { DataBase } = require('../database.js');

const app = express(),
    DIST_DIR = __dirname,
    //PROJ_DIR = 'D:/Site/Test/',
    WORK_PROJ_DIR = 'D:/Диплом/Site/Test/';

const PROJ_DIR = WORK_PROJ_DIR;

const db = new DataBase();

db.initialization();

const jsonParser = bodyP.json();
console.log(jsonParser);
const urlencodedP = bodyP.urlencoded({extended: false});

app.set('view engine','ejs');

app.use(express.static(PROJ_DIR));

app.get('/', (req, res) => {
    res.sendFile(PROJ_DIR + 'html/MainPage.html')
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening tto ${PORT}....`);
    console.log('Press Ctrl+C to quit.')
});

app.get('/reg', (req, res) => {
    res.sendFile(PROJ_DIR + 'html/registryPage.html');
});

app.get('/page/:id', (req, res) => {
    res.sendFile(PROJ_DIR + 'html/page' + req.params.id +'.html');
});

app.post('/',urlencodedP,function (req,res) {
    if(!req.body) return res.sendStatus(400);
    console.log(req.body);
    let data = {firstName:req.body.firstName, secName:req.body.secondName};
    db.insertValue('users',data.firstName,data.secName, null);
    db.returnAllDataFromTable('users');
    console.log('Arguments: ' + req.body.firstName + ' ' +  req.body.secondName);
    res.render('page1',{data:data});
});