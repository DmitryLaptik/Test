

class DataBase{
    constructor(){
        console.log('create DB');
        let me = this;
        let sqlite3 = require('sqlite3').verbose();
        me.db = new sqlite3.Database('dbsqlite','OPEN_READWRITE');

        me.calcResult(12);
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
        });

    };


    insertValue(tableName,...values){
        console.log('insertValue into \''+ tableName+ '\'');
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
