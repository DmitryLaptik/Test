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
    let themes = db.selectAllThemesForTest();
    res.render('chooseTest', {data: themes})
});


app.post('/test',urlencodedP,function (req,res) {//регистрация
    if(!req.body) return res.sendStatus(400);

    let DBdata = null,  isExist = false,idPosition, userId, result;

    if(req.body.firstName && req.body.secondName) {
        DBdata = {firstName:req.body.firstName, secName:req.body.secondName,position:req.body.position};
        idPosition = db.selectIdFromPositions(DBdata.position);
        let isExist = db.returnUserId(DBdata.firstName,DBdata.secName, req.body.choose, idPosition);
        if(isExist == null) db.insertValue('users',DBdata.firstName,DBdata.secName,0, null, db.selectIdFromPositions(DBdata.position), req.body.choose);
        userId = db.returnUserId(DBdata.firstName,DBdata.secName, req.body.choose, idPosition);
    }
    else{
        console.log(req.body);
        userId = req.body.idUser;
    }
    let countFinishQuest  = db.returnTestCount(Number(userId));
    if (req.body.answer) {
        if(countFinishQuest <= 15) {
            let arrId = req.body.answersIds.split(',');
            db.updateResult('results', userId, req.body.idQuest, arrId[Number(req.body.answer)]);
        }
    }
    if(countFinishQuest >= 15 || db.getCountResult(userId, req.body.idTheme) >= 15){
        let result = db.calcUserResult(userId);
        let data = {};
        data.result =  result.toFixed(1).toString();
        db.updateUserMark(userId, result.toFixed(1));
        db.resetTestCount(userId, result.toFixed(1));
        let position = db.selectIdPositionsFromUsers(userId);
        data.questResults = db.returnQusetionByUserId(userId);
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

        answerIdArr = answerIdArr.filter(function (el) { return el != null; });

        answerIdArr = db.randSort(answerIdArr);
        let answerArr = [];
        for(let i = 0;i < answerIdArr.length;i++){
            answerArr.push(db.returnAnswerById(answerIdArr[i]));
        }

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
            let data =  db.getAllUserResults();

            for(let i = 0; i < data.length;i++) {
                data[i].position = db.returnPositionById(data[i].idPosition);
            }
            res.render('getAllResults', {usersData: data });
        }
    }

});



app.post('/find', urlencodedP, function (req, res) {
    if(!req.body) return res.sendStatus(400);
    else{
        let userId = db.returnUserId(req.body.firstName, req.body.secondName, req.body.theme, db.selectIdFromPositions(req.body.position));
        if (userId !== null) {
            let data = db.returnUserById(userId);
            data.position = req.body.position;
            data.questResults = db.returnQusetionByUserId(userId);
            res.render('findUser', {usersData: data});
        }
        else{
            res.sendFile(PROJ_DIR + 'views/adminPages/MainPage.html');
        }

    }
});
