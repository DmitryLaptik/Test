const express = require('express');
const bodyP = require('body-parser');

const app = express(),
    DIST_DIR = __dirname,
    PROJ_DIR = 'D:/Site/Test/';
const jsonParser = bodyP.json();
console.log(jsonParser);
const urlencodedP = bodyP.urlencoded({extended: false});

app.set('views engine','ejs');

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
   console.log('Arguments: ' + req.body.firstName + ' ' +  req.body.secondName);
   res.render('page1',{firstName:req.body.firstName, secName:req.body.secondName});
});