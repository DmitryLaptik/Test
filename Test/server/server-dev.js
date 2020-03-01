const express = require('express');
const bodyP = require('body-parser');
const { DataBase } = require('../database.js');

const app = express(),
    DIST_DIR = __dirname,
    PROJ_DIR = 'D:/Site/Test/',
    WORK_PROJ_DIR = 'D:/Диплом/Site/Test/';

// const PROJ_DIR = WORK_PROJ_DIR;

const db = new DataBase();

db.initializationTables();

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

app.post('/',urlencodedP,function (req,res) {//регистрация
    if(!req.body) return res.sendStatus(400);
    let DBdata = {firstName:req.body.firstName, secName:req.body.secondName};

    db.insertValue('users',DBdata.firstName,DBdata.secName,0, null);

    let result = db.getTest(db.returnUserId(DBdata.firstName,DBdata.secName));
    console.log(result);
    let answerArr = [];

    answerArr.push(db.returnAnswerById(result.idAnswer1));
    answerArr.push(db.returnAnswerById(result.idAnswer2));
    answerArr.push(db.returnAnswerById(result.idAnswer3));
    answerArr.push(db.returnAnswerById(result.idAnswer4));
    answerArr.push(db.returnAnswerById(result.idAnswer5));
    answerArr.push(db.returnAnswerById(result.idAnswer6));
    answerArr.push(db.returnAnswerById(result.idAnswer7));

    let test = {};
    test.idQuest = result.idQuest;
    test.content1 = result.content1;
    test.content2 = result.content2;
    test.firstName  = req.body.firstName;
    test.secName  = req.body.secondName;
    test.countFinishTests  = result.countFinishTests;
    test.answers = answerArr;
    console.log(test);
    res.render('testpage',{testData:test});
});


app.post('/next',urlencodedP,function (req,res) {
    if(!req.body) return res.sendStatus(400);
    let data = {firstName:req.body.firstName, secName:req.body.secondName};
    //db.insertValue('users',data.firstName,data.secName, null);

    db.returnAllDataFromTable('users');

    console.log('Arguments: ' + req.body.firstName + '1 ' +  req.body.secondName + '1 ');
    res.render('testpage',{data:data});
});