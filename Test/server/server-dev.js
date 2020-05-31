const express = require('express');
const path = require('path');
const bodyP = require('body-parser');
const ejs = require('ejs');
const pdf = require('html-pdf');
const { DataBase } = require('../database.js');
const fs = require('fs');
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

    let DBdata = null, countFinishQuest, isExist = null, idPosition, userId, result;

    if(req.body.firstName && req.body.secondName) {
        DBdata = {firstName:req.body.firstName, secName:req.body.secondName,position:req.body.position};
        idPosition = db.selectIdFromPositions(DBdata.position);
        let isExist = db.returnUserId(DBdata.firstName,DBdata.secName, req.body.choose, idPosition);
        if(isExist == null) {
            db.insertValue('users',DBdata.firstName,DBdata.secName,0, null, db.selectIdFromPositions(DBdata.position), req.body.choose);
            userId = db.returnUserId(DBdata.firstName,DBdata.secName, req.body.choose, idPosition);
        }
        else{
            userId = isExist;
            countFinishQuest = db.returnTestCount(Number(userId));
            if(countFinishQuest === 0) db.clearResultsUser(userId);
        }
    }
    else{
        console.log(req.body);
        userId = req.body.idUser;
    }
    countFinishQuest = db.returnTestCount(Number(userId));
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
        data.questResults = db.returnQuestionByUserId(userId);
        data.questResults = data.questResults.reverse();
        data.userId = userId;

        res.render('resultpage', {data:data});
    }
    else {
        let themeId;
        if(req.body.idTheme) themeId = req.body.idTheme;
        else themeId = db.selectIdFromThemes(req.body.choose);
        result = db.getTest(countFinishQuest, userId, themeId);
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
            let data = db.getAllUserResults();
            if(req.body.index) {
                if(req.body.index < 0) req.body.index = 0;
                else if(req.body.index > Math.ceil(data.length/10)-1) req.body.index = Math.ceil(data.length/10)-1;
                let count = 10 * req.body.index;
                data = data.slice(count, 10 + count);
                data.index = req.body.index;
            }
            else if(data.length >= 10){
                data = data.slice(0, 10);
                data.index = 0;
            }
            for(let i = 0; i < data.length;i++) {
                data[i].position = db.returnPositionById(data[i].idPosition);
            }
            res.render('getAllResults', {usersData: data });
        }
    }

});

app.post('/findUser', urlencodedP, function (req, res) {
    let isAccess = db.checkAdminInTable(req.body.login, req.body.password);
    if(isAccess === false) res.sendFile(PROJ_DIR + 'views/MainPage.html');
    else {
        res.sendFile(PROJ_DIR + 'views/adminPages/findResult.html');
    }
});

app.post('/find', urlencodedP, function (req, res) {
    let isAccess = db.checkAdminInTable(req.body.login, req.body.password);
    if(isAccess === false) res.sendFile(PROJ_DIR + 'views/MainPage.html');
    else {
        let userId = db.returnUserId(req.body.firstName, req.body.secondName, req.body.theme, db.selectIdFromPositions(req.body.position));
        if (userId !== null) {
            let data = db.returnUserById(userId);
            data.position = req.body.position;
            data.questResults = db.returnQuestionByUserId(userId);
            data.questResults = data.questResults.reverse();
            data.countGood = db.returnCountGoodQuest(userId);
            res.render('findUser', {usersData: data});
        }
        else{
            res.sendFile(PROJ_DIR + 'views/adminPages/findResult.html');
        }

    }
});

app.post('/addNew', urlencodedP, function (req, res) {
    if(!req.body) return res.sendStatus(400);
    else{
        let isAccess = db.checkAdminInTable(req.body.login, req.body.password);
        if(isAccess === false) res.sendFile(PROJ_DIR + 'views/adminPages/authorization.html');
        else {
            let themes = db.selectAllThemes();
            res.render('addNewQuest',{data: themes});
        }
    }
});

app.post('/add', urlencodedP, function (req, res) {
    if(!req.body) return res.sendStatus(400);
    else{
        let isAccess = db.checkAdminInTable(req.body.login, req.body.password);
        if(isAccess === false) res.sendFile(PROJ_DIR + 'views/adminPages/authorization.html');
        else {
            let newQuest = {
                context1 :req.body.context1,
                context2 :req.body.context2,
                answers :[]
            };
            newQuest.answers.push(req.body.answer1);
            newQuest.answers.push(req.body.answer2);
            newQuest.answers.push(req.body.answer3);
            newQuest.answers.push(req.body.answer4);
            newQuest.answers.push(req.body.answer5);
            newQuest.answers.push(req.body.answer6);
            newQuest.answers.push(req.body.answer7);
            newQuest.idRightAnswer = Number(req.body.answer);
            newQuest.idTheme = req.body.theme;
            db.createNewQuestion(newQuest.context1, newQuest.context2,newQuest.answers,newQuest.idRightAnswer,newQuest.idTheme);
            let themes = db.selectAllThemes();
            res.render('addNewQuest',{data: themes});
        }
    }
});

app.post('/updateQuest', urlencodedP, function (req, res) {
    if(!req.body) return res.sendStatus(400);
    else {
        let isAccess = db.checkAdminInTable(req.body.login, req.body.password);
        if (isAccess === false) res.sendFile(PROJ_DIR + 'views/MainPage.html');
        else {
            let theme;
            let idQuest = (req.body.idQuest === undefined) ? "1" : req.body.idQuest;
            if(req.body.themeId)      theme = db.selectIdFromThemes(req.body.themeId);
            else if(req.body.theme)   theme = db.selectIdFromThemes(req.body.theme);
            else                      theme = 1;
            let maxId = db.returnMaxQuestId(theme);
            if(Number(idQuest) > maxId) idQuest = maxId;
            else if(Number(idQuest) < 0) idQuest = 0;

            let questionData = db.returnQuestionById(idQuest, theme);
            let data = {
                idQuest: idQuest,
                context1: questionData.content1,
                context2: questionData.content2,
                idRightAnswer: questionData.idRightAnswer
            };
            data.theme = db.selectThemeNameById(questionData.idTheme).name;
            let answerIdArr = [];
            answerIdArr.push(questionData.idAnswer1);
            answerIdArr.push(questionData.idAnswer2);
            answerIdArr.push(questionData.idAnswer3);
            answerIdArr.push(questionData.idAnswer4);
            answerIdArr.push(questionData.idAnswer5);
            answerIdArr.push(questionData.idAnswer6);
            answerIdArr.push(questionData.idAnswer7);

            let themes = db.selectAllThemes();

            let answerArr = [];
            for(let i = 0;i < answerIdArr.length;i++){
                if(answerIdArr[i])
                    answerArr.push(db.returnAnswerById(answerIdArr[i]));
                else
                    answerArr.push('');
            }
            data.answers = answerArr;
            data.themes = themes;
            res.render('updateQuestion', {data: data});
        }
    }
});

app.post('/update', urlencodedP, function (req, res) {
    if(!req.body) return res.sendStatus(400);
    else{
        let isAccess = db.checkAdminInTable(req.body.login, req.body.password);
        if(isAccess === false) res.sendFile(PROJ_DIR + 'views/MainPage.html');
        else {
            let theme;
            let idQuest = (req.body.idQuest === undefined) ? "1" : req.body.idQuest;
            if(req.body.themeId)      theme = db.selectIdFromThemes(req.body.themeId);
            else if(req.body.theme)   theme = db.selectIdFromThemes(req.body.theme);
            else                      theme = 1;
            let maxId = db.returnMaxQuestId(theme);
            if(Number(idQuest) > maxId) idQuest = maxId;
            else if(Number(idQuest) < 0) idQuest = 0;
            let newQuest = {
                idQuest: idQuest,
                context1: req.body.context1,
                context2: req.body.context2,
                answers: []
            };
            newQuest.theme = db.selectThemeNameById(theme).name;
            newQuest.answers.push(req.body.answer1);
            newQuest.answers.push(req.body.answer2);
            newQuest.answers.push(req.body.answer3);
            newQuest.answers.push(req.body.answer4);
            newQuest.answers.push(req.body.answer5);
            newQuest.answers.push(req.body.answer6);
            newQuest.answers.push(req.body.answer7);
            newQuest.idRightAnswer = Number(req.body.answer);
            newQuest.idTheme = req.body.theme;
            db.updateQuestion(idQuest,newQuest.context1, newQuest.context2,newQuest.answers,newQuest.idRightAnswer,newQuest.idTheme);
            let themes = db.selectAllThemes();
            newQuest.themes = themes;
            res.render('updateQuestion', {data: newQuest });
        }
    }
});

app.post('/delete', urlencodedP, function (req, res) {
    if(!req.body) return res.sendStatus(400);
    else{
        let isAccess = db.checkAdminInTable(req.body.login, req.body.password);
        if(isAccess === false) res.sendFile(PROJ_DIR + 'views/MainPage.html');
        else {
            let isValid = true, idQuest, theme;
            if(req.body.idQuest === undefined) {
                isValid = false;
                idQuest = "1";
            }else{
                idQuest = req.body.idQuest;
            }
            if(req.body.themeId)      theme = db.selectIdFromThemes(req.body.themeId);
            else if(req.body.theme)   theme = db.selectIdFromThemes(req.body.theme);
            else                      theme = 1;
            let maxId = db.returnMaxQuestId(theme);
            if(Number(idQuest) > maxId) {
                idQuest = maxId;
            }
            else if(Number(idQuest) < 0) {
                idQuest = 0;
            }
            if(!isValid){
                let questionData = db.returnQuestionById(1,theme);
                let data = {
                    idQuest: 1,
                    context1: questionData.content1,
                    context2: questionData.content2,
                    idRightAnswer: questionData.idRightAnswer
                };

                let answerIdArr = [];
                data.theme = db.selectThemeNameById(questionData.idTheme).name;
                answerIdArr.push(questionData.idAnswer1);
                answerIdArr.push(questionData.idAnswer2);
                answerIdArr.push(questionData.idAnswer3);
                answerIdArr.push(questionData.idAnswer4);
                answerIdArr.push(questionData.idAnswer5);
                answerIdArr.push(questionData.idAnswer6);
                answerIdArr.push(questionData.idAnswer7);

                let themes = db.selectAllThemes();

                let answerArr = [];
                for(let i = 0;i < answerIdArr.length;i++){
                    if(answerIdArr[i])
                        answerArr.push(db.returnAnswerById(answerIdArr[i]));
                    else
                        answerArr.push('');
                }
                data.answers = answerArr;
                data.themes = themes;
                res.render('deleteQuestion', {data: data});
            }
            else{
                db.deleteQuestionById(idQuest);
                let questionData = db.returnQuestionById(1,theme);
                let data = {
                    idQuest: 1,
                    context1: questionData.content1,
                    context2: questionData.content2,
                    idRightAnswer: questionData.idRightAnswer
                };

                let answerIdArr = [];
                data.theme = db.selectThemeNameById(questionData.idTheme).name;
                answerIdArr.push(questionData.idAnswer1);
                answerIdArr.push(questionData.idAnswer2);
                answerIdArr.push(questionData.idAnswer3);
                answerIdArr.push(questionData.idAnswer4);
                answerIdArr.push(questionData.idAnswer5);
                answerIdArr.push(questionData.idAnswer6);
                answerIdArr.push(questionData.idAnswer7);

                let themes = db.selectAllThemes();

                let answerArr = [];
                for(let i = 0;i < answerIdArr.length;i++){
                    if(answerIdArr[i])
                        answerArr.push(db.returnAnswerById(answerIdArr[i]));
                    else
                        answerArr.push('');
                }
                data.answers = answerArr;
                data.themes = themes;
                res.render('deleteQuestion', {data: data});
            }
        }
    }
});

app.post('/deleteNext', urlencodedP, function (req, res) {
    if(!req.body) return res.sendStatus(400);
    else {
        let isAccess = db.checkAdminInTable(req.body.login, req.body.password);
        if (isAccess === false) res.sendFile(PROJ_DIR + 'views/MainPage.html');
        else {
            let theme;
            let idQuest = (req.body.idQuest === undefined) ? "1" : req.body.idQuest;
            if(req.body.themeId)      theme = db.selectIdFromThemes(req.body.themeId);
            else if(req.body.theme)   theme = db.selectIdFromThemes(req.body.theme);
            else                      theme = 1;
            let maxId = db.returnMaxQuestId(theme);
            if(Number(idQuest) > maxId) idQuest = maxId;
            else if(Number(idQuest) < 0) idQuest = 0;
            let questionData = db.returnQuestionById(idQuest,theme);
            let data = {
                idQuest: idQuest,
                context1: questionData.content1,
                context2: questionData.content2,
                idRightAnswer: questionData.idRightAnswer
            };
            data.theme = db.selectThemeNameById(questionData.idTheme).name;
            let answerIdArr = [];
            answerIdArr.push(questionData.idAnswer1);
            answerIdArr.push(questionData.idAnswer2);
            answerIdArr.push(questionData.idAnswer3);
            answerIdArr.push(questionData.idAnswer4);
            answerIdArr.push(questionData.idAnswer5);
            answerIdArr.push(questionData.idAnswer6);
            answerIdArr.push(questionData.idAnswer7);

            let themes = db.selectAllThemes();

            let answerArr = [];
            for(let i = 0;i < answerIdArr.length;i++){
                if(answerIdArr[i])
                    answerArr.push(db.returnAnswerById(answerIdArr[i]));
                else
                    answerArr.push('');
            }
            data.answers = answerArr;
            data.themes = themes;
            res.render('deleteQuestion', {data: data});
        }
    }
});
app.post('/print',urlencodedP,(req, res)=>{
    let data =  db.getAllUserResults();
    if(req.body.index) {
        if(req.body.index < 0) req.body.index = 0;
        else if(req.body.index > Math.ceil(data.length/10)-1) req.body.index = Math.ceil(data.length/10)-1;
        let count = 10 * req.body.index;
        data = data.slice(count, 10 + count);
        data.index = req.body.index;
    }
    else if(data.length >= 10){
        data = data.slice(0, 10);
        data.index = 0;
    }
    for(let i = 0; i < data.length;i++) {
        data[i].position = db.returnPositionById(data[i].idPosition);
    }

    ejs.renderFile(PROJ_DIR + 'views\\getAllResults_pdf.ejs', {usersData: data}, (err, html) => {

        let options = { format: 'A4'};
        let fileName = PROJ_DIR + 'views\\file.pdf';

        let renderHtml = html;

        pdf.create(renderHtml, options).toFile(fileName, (err) => {
            if (err) {
                console.log('Ошибка конвертации', err)
            }
            else {
                var file = fs.createReadStream(fileName);
                var stat = fs.statSync(fileName);
                res.setHeader('Content-Length', stat.size);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename=Results.pdf');
                file.pipe(res);
            }
        });

    });
});

