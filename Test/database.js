const sqlite3 = require('sqlite3').verbose();

class DataBase{
    constructor(){
        let me = this;
        me.db = new sqlite3.Database('dbsqlite','OPEN_READWRITE');
        //me.initialization();
        // me.insertValue('users','Имя','Фамилия',1);
        me.db.each('SELECT fName ,sName, testMark FROM users' , function(err, row) {
            console.log(row);
        });
    };


    initialization(){
        let me = this;
        me.db.serialize(function() {
            me.db.run('Create TABLE users (fName TEXT, sName TEXT, testMark NUM)');
            console.log('Create TABLE users');
        });
    };


    insertValue(tableName,...values){
        console.log('insertValue into '+ tableName);
        let me = this;
        console.log(values);
        let placeholders = values.map((value) => '?').join(',');
        me.db.serialize(function() {
            let stmt = me.db.prepare('INSERT INTO '+ tableName +' as alias VALUES (' + placeholders + ')');


            stmt.run(values, function (err) {
                if (err) {
                    return console.log(err.message);
                }
                console.log('Success insert into '+ tableName);
            });

            // me.db.each('SELECT fName ,sName, testMark FROM ' + tableName , function(err, row) {
            //     console.log(row.id + ': ' + row.info);
            // });
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

    DBClose(){
      this.db.close();
    };
}


let DB = new DataBase();