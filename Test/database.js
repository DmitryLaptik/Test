

class DataBase{
    constructor(){
        let me = this;
        let sqlite3 = require('sqlite3').verbose();
        me.db = new sqlite3.Database('dbsqlite','OPEN_READWRITE');


        // me.insertValue('users','Имя3','Фамилия3',1);
        // me.db.each('SELECT fName, sName, testMark FROM users' , function(err, row) {
        //     console.log(row);
        // });
    };


    initialization(){
        let me = this;
        me.db.serialize(function() {
            me.db.run('Create TABLE if not exists users (fName TEXT, sName TEXT, testMark NUM)');
            console.log('Create TABLE users');
        });
    };


    insertValue(tableName,...values){
        console.log('insertValue into '+ tableName);
        let me = this;
        console.log(values);
        let placeholders = values.map((value) => '?').join(',');
        me.db.serialize(function() {
            let stmt = me.db.prepare('INSERT INTO '+ tableName +' VALUES (' + placeholders + ')');
            stmt.run(values, function (err) {
                if (err) return console.log(err.message);
                console.log('Success insert into '+ tableName);
            });

        });
    };


    returnAllDataFromTable(table){
        let me = this;
        me.db.each('SELECT * FROM ' + table, function(err, row) {
            console.log(row);
        });
    };

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


    insert(){

    };

    tableDelete(table){
        let me = this;
        me.db.run('Drop TABLE '+table);
    };

    DBClose(){
      this.db.close();
    };
}
exports = module.exports;
exports.DataBase = DataBase;
