const express = require('express');
const path = require('path');
const bodyP = require('body-parser');
const { DataBase } = require('../database.js');

const app = express(), PROJ_DIR = path.dirname(__dirname) + '\\';

const db = new DataBase();

const jsonParser = bodyP.json();
const urlencodedP = bodyP.urlencoded({extended: false});

app.set('view engine','ejs');

app.use(express.static(PROJ_DIR));

app.get('/', (req, res) => {

    if(req.body && req.body.userId) {
        let userId = req.body.userId;
        let result = db.calcUserResult(userId);
        db.updateUserMark(userId, result.toFixed(1));
        db.resetTestCount(userId, result.toFixed(1));
        //db.clearResultsUser(userId);
    }
    res.sendFile(PROJ_DIR + 'views/MainPage.html')
});

app.post('/',urlencodedP, (req, res) => {

    if(req.body && req.body.userId) {
        let userId = req.body.userId;
        let result = db.calcUserResult(userId);
        db.updateUserMark(userId, result.toFixed(1));
        db.resetTestCount(userId, result.toFixed(1));
        db.clearResultsUser(userId);
    }

    res.sendFile(PROJ_DIR + 'views/MainPage.html')
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening tto ${PORT}....`);
    console.log('Press Ctrl+C to quit.');
    console.log(PROJ_DIR);
});

app.get('/page/:id', (req, res) => {
    res.sendFile(PROJ_DIR + 'html/page' + req.params.id +'.html');
});

app.post('/choose',(req, res) => {
    res.sendFile(PROJ_DIR + 'views/chooseTest.html')
});


app.post('/test',urlencodedP,function (req,res) {//регистрация
    if(!req.body) return res.sendStatus(400);

    let DBdata = null,  isExist = false, userId, result;

    if(req.body.firstName && req.body.secondName) {
        DBdata = {firstName:req.body.firstName, secName:req.body.secondName,position:req.body.position};
        let isExist = db.returnUserId(DBdata.firstName,DBdata.secName, req.body.choose, db.selectIdFromPositions(DBdata.position));
        if(isExist == null) db.insertValue('users',DBdata.firstName,DBdata.secName,0, null, db.selectIdFromPositions(DBdata.position), req.body.choose);
        userId = db.returnUserId(DBdata.firstName,DBdata.secName, req.body.choose, db.selectIdFromPositions(DBdata.position));
    }
    else{
        console.log(req.body);
        userId = req.body.idUser;
    }

    if (req.body.answer) {
        let arrId = req.body.answersIds.split(',');
        db.updateResult('results', userId, req.body.idQuest, arrId[Number(req.body.answer)]);
    }
    let countFinishQuest  = db.returnTestCount(Number(userId));
    if(countFinishQuest >= 15){
        let text = [];
        text[0] = "Извините, с таким уровнем знаний вы нам не подходите.";
        text[1] = "Поздравляем! Вы нам подходите!";
        let result = db.calcUserResult(userId);
        let data = {};
        data.result =  result.toFixed(1).toString();
        let position = db.selectIdPositionsFromUsers(userId);
        data.questResults = db.returnQusetionByUserId(userId);
        data.resultAnswer = '';
        if(position == 1) {
            if(data.result >=50)    data.resultAnswer = text[1];
            else                    data.resultAnswer = text[0];
        }
        if(position == 2) {
            if(data.result >=80)    data.resultAnswer = text[1];
            else                    data.resultAnswer = text[0];
        }

        data.userId = userId;
        res.render('resultpage', {data:data});
    }
    else {
        let themeId;
        if(req.body.idTheme) themeId = req.body.idTheme;
        else themeId = db.selectIdFromThemes(req.body.choose);
        result = db.getTest(userId, themeId);
        let answerIdArr = [];
        if(!result) return res.sendStatus(400);
        answerIdArr.push(result.idAnswer1);
        answerIdArr.push(result.idAnswer2);
        answerIdArr.push(result.idAnswer3);
        answerIdArr.push(result.idAnswer4);
        answerIdArr.push(result.idAnswer5);
        answerIdArr.push(result.idAnswer6);
        answerIdArr.push(result.idAnswer7);

        let answerArr = [];

        answerArr.push(db.returnAnswerById(result.idAnswer1));
        answerArr.push(db.returnAnswerById(result.idAnswer2));
        answerArr.push(db.returnAnswerById(result.idAnswer3));
        answerArr.push(db.returnAnswerById(result.idAnswer4));
        answerArr.push(db.returnAnswerById(result.idAnswer5));
        answerArr.push(db.returnAnswerById(result.idAnswer6));
        answerArr.push(db.returnAnswerById(result.idAnswer7));

        answerArr = answerArr.filter(function (el) {
            return el != null;
        });
        answerIdArr = answerIdArr.filter(function (el) {
            return el != null;
        });

        let isNewResult = db.checkResult(userId, result.idQuest);

        if (isNewResult) db.insertValue('results', userId, result.idQuest, null);

        let test = {};
        test.idQuest = result.idQuest;
        test.content1 = result.content1;
        test.content2 = result.content2;
        test.userId = userId;
        test.idTheme = themeId;

        test.answers = answerArr;
        test.answersIds = answerIdArr;
        test.countFinishQuest = db.returnTestCount(userId);
        res.render('testpage', {testData: test});
    }
});


app.post('/next',urlencodedP,function (req,res) {
    if(!req.body) return res.sendStatus(400);
    let data = {firstName:req.body.firstName, secName:req.body.secondName};
    //db.insertValue('users',data.firstName,data.secName, null);

    db.showAllDataFromTable('users');
    res.render('testpage',{data:data});
});

app.get('/admin', function (req, res) {
    res.sendFile(PROJ_DIR + 'views/adminPages/authorization.html')
});

app.post('/admin_reg', urlencodedP, function (req, res) {
    if(!req.body) return res.sendStatus(400);
    else{
        let isAccess = db.checkAdminInTable(req.body.login, req.body.password);
        if(isAccess === false) res.sendFile(PROJ_DIR + 'views/adminPages/authorization.html');
        else                   res.sendFile(PROJ_DIR + 'views/adminPages/administration.html');
    }
});

app.post('/get_all', urlencodedP, function (req, res) {
    if(!req.body) return res.sendStatus(400);
    else{
        let isAccess = db.checkAdminInTable(req.body.login, req.body.password);
        if(isAccess === false) res.sendFile(PROJ_DIR + 'views/MainPage.html');
        else {
            res.render('getAllResults', {usersData: db.getAllUserResults() });
        }
    }

});

app.post('/find_user', urlencodedP, function (req, res) {
    if(!req.body) return res.sendStatus(400);
    else{
        let isAccess = db.checkAdminInTable(req.body.login, req.body.password);
        if(isAccess === false) res.sendFile(PROJ_DIR + 'views/MainPage.html');
        else                   res.sendFile(PROJ_DIR + 'views/adminPages/findResult.html');

    }

});

app.post('/find', urlencodedP, function (req, res) {
    if(!req.body) return res.sendStatus(400);
    else{
        let isAccess = db.checkAdminInTable(req.body.login, req.body.password);
        if(isAccess === false) res.sendFile(PROJ_DIR + 'views/MainPage.html');
        else {
            let userId = db.returnUserId(req.body.firstName, req.body.secName, req.body.theme, db.selectIdFromPositions(req.body.position));
            if (userId !== null) {
                let result = db.calcUserResult(userId);
                let data = {
                    fName: req.body.firstName,
                    sName: req.body.secName,
                    theme: req.body.theme,
                    position: req.body.position
                };
                data.result = result.toFixed(1).toString();
                data.questResults = db.returnQusetionByUserId(userId);
                res.render('findUser', {usersData: db.getAllUserResults()});
            }
            else{
                res.sendFile(PROJ_DIR + 'views/adminPages/findResult.html');
            }
        }
    }
});
