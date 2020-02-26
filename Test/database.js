

class DataBase{
    constructor(){
        console.log('create DB');
        let me = this;
        let sqlite3 = require('sqlite3').verbose();
        me.db = new sqlite3.Database('dbsqlite','OPEN_READWRITE');
        //me.initData(me);
        me.returnAllDataFromTable('answers')
    };


    initialization(){
        console.log('initialization');
        let me = this;
        me.db.serialize(function() {
            me.db.run('Create TABLE if not exists users     (idUser Integer primary key AUTOINCREMENT, ' +
                'fName TEXT, ' +
                'sName TEXT, ' +
                'testMark NUM)');

            me.db.run('Create TABLE if not exists questions (idQuest Integer primary key AUTOINCREMENT , ' +
                'content TEXT, ' +
                'idAnswer Integer,' +
                'FOREIGN KEY (idAnswer) REFERENCES answers(idAnswer) ON DELETE CASCADE ON UPDATE CASCADE)');

            me.db.run('Create TABLE if not exists answers   (idAnswer Integer primary key AUTOINCREMENT , ' +
                'content TEXT)');

            me.db.run('Create TABLE if not exists results   (idResult Integer primary key AUTOINCREMENT , ' +
                'idUser Integer, ' +
                'idQuest Integer, ' +
                'idAnswer Integer, ' +
                'FOREIGN KEY (idUser) REFERENCES users(idUser) ON DELETE CASCADE ON UPDATE CASCADE ' +
                'FOREIGN KEY (idAnswer) REFERENCES answers(idAnswer) ON DELETE CASCADE ON UPDATE CASCADE ' +
                'FOREIGN KEY (idQuest) REFERENCES questions(idQuest) ON DELETE CASCADE ON UPDATE CASCADE)');
            console.log('Create TABLE users');
            //me.initData(me);
        });

    };

    initDataAnswers(me){//answers
        me.insertValue('answers','Другое.');
        me.insertValue('answers','Числа от 0 до 9.');
        me.insertValue('answers','Числа от 0 до 10.');
        me.insertValue('answers','10 раз число 0.');
        me.insertValue('answers','10 раз число 10.');
        me.insertValue('answers','undefined');
        me.insertValue('answers','Будет ошибка.');
        me.insertValue('answers','null');
        me.insertValue('answers','Три: for, while и do...while.');
        me.insertValue('answers','0');
        me.insertValue('answers','1');
        me.insertValue('answers','2');
        me.insertValue('answers','3');
        me.insertValue('answers','4');
        me.insertValue('answers','9');
        me.insertValue('answers','10');
        me.insertValue('answers','Больше.');
        me.insertValue('answers','instanceof');
        me.insertValue('answers','constructor');
        me.insertValue('answers','parent');
        me.insertValue('answers','new');
        me.insertValue('answers','Все имеют специальное использование.');
        me.insertValue('answers','this');
        me.insertValue('answers','Да.');
        me.insertValue('answers','Объекту user.');
        me.insertValue('answers','Нет.');
        me.insertValue('answers','new Array.prototype.constructor(1, 2)');
        me.insertValue('answers','new Array(1, 2)');
        me.insertValue('answers','Array(1, 2)');
        me.insertValue('answers','[1, 2]');
        me.insertValue('answers','1..2');
        me.insertValue('answers','Все варианты правильные.');
        me.insertValue('answers','В первом выражении ошибка, что еще за «!!» ??');
        me.insertValue('answers','true');
        me.insertValue('answers','false');
        me.insertValue('answers','< script type="text/javascript" src="my.js"></script>');
        me.insertValue('answers','< script src="my.js"></script>');
        me.insertValue('answers','< script src="my.js"/>');
        me.insertValue('answers','< хачу-javascript отсюда="my.js">');
        me.insertValue('answers','\"truefalse\"');
        me.insertValue('answers','NaN');
        me.insertValue('answers','Одна и та же.');
        me.insertValue('answers','Разные.');
        me.insertValue('answers','С большой буквы переменные называть нельзя.');
        me.insertValue('answers','Слово «apple» является зарезервированным, нельзя использовать.');
        me.insertValue('answers','Ошибка: переменная не определена.');
        me.insertValue('answers','Только две: for и while.');
        me.insertValue('answers','Только одна: for.');
        me.insertValue('answers','В коде ошибка.');
        me.insertValue('answers','В коде ошибка.');
        me.insertValue('answers','*');
        me.insertValue('answers','/');
        me.insertValue('answers','+');
        me.insertValue('answers','-');
        me.insertValue('answers','>>>');
        me.insertValue('answers','Разница в значении, которое возвращает такой вызов.');
        me.insertValue('answers','Разница в значении i после вызова.');
        me.insertValue('answers','Нет никакой разницы.');
        me.insertValue('answers','Да, существует значение x, для которого они работают по-разному.');
        me.insertValue('answers','Нет, они полностью взаимозаменяемы.');
        me.insertValue('answers','Нет никакой разницы.');
        me.insertValue('answers','Зависит от браузера.');
        me.insertValue('answers','Нет, вызов должен стоять после объявления.');
        me.insertValue('answers','Нет такой переменной после цикла.');
        me.insertValue('answers','Да, X – это undefined.');
        me.insertValue('answers','Да, X – это null.');
        me.insertValue('answers','Да, другое.');
        me.insertValue('answers','Нет, не бывает.');
    };
    initDataQuestions(me){
        me.insertValue('questions','Что выведет alert?\nlet str = "Hello";\nstr.something = 5;\nalert(str.something); // ?',7);
        me.insertValue('questions','Что выведет этот код?\nf.call(null);\nfunction f() {\nalert(this);\n}',8);
        me.insertValue('questions','Что выведет этот код?\nf.call(null);\nfunction f() {\nalert(this);\n}',8);

    };
    insertValue(tableName,...values){
        let me = this;
        console.log(values);
        values.unshift(null);
        let placeholders = values.map((value) => '?').join(',');
        me.db.serialize(function() {
            let stmt = me.db.prepare('INSERT INTO '+ tableName +' VALUES (' + placeholders + ')');
            stmt.run(values, function (err) {
                if (err) return console.log(err.message);
                console.log('Success insert into \''+ tableName + '\'');
            });

        });
    };


    returnAllDataFromTable(table){
        console.log('returnAllDataFromTable');
        let me = this;
        me.db.each('SELECT * FROM ' + table, function(err, row) {
            console.log(row);
        });
    };

    getTest(){
        console.log('getTest');
        let me = this;
        me.db.each('SELECT * FROM questions', function(err, row) {
            return ;
        });
    }

    serializeDB(){
        let me = this;
        me.db.serialize(function() {

            me.db.run('Create TABLE lorem (info TEXT)');
            let stmt = me.db.prepare('INSERT INTO lorem VALUES (?)');

            for (let i = 0; i < 10; i++) {
                stmt.run('Ipsum ' + i);
            }

            me.db.each('SELECT rowid AS id, info FROM lorem', function(err, row) {
                console.log(row.id + ': ' + row.info);
            });
        });
    };

    calcResult(userId){
        let me = this;
        me.db.each('SELECT questions.idQuest, questions.idAnswer, results.idAnswer as userAnswer from results join questions on questions.idQuest = results.idQuest where idUser = ' + userId, function(err, row) {
            console.log(row);
        });
    }

    nextTest() {
        console.log('nextTest');
    }

    tableDelete(table){
        let me = this;
        me.db.run('Drop TABLE '+table);
    };

    DBClose(){
      this.db.close();
    };
}

let db = new DataBase();

exports = module.exports;
exports.DataBase = DataBase;
