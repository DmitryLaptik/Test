

class DataBase{
    constructor(){
        let me = this;
        let sqliteSync = require('sqlite-sync');
        me.dbSync = sqliteSync.connect('dbsqlite.sqlite');
        let sqlite3 = require('sqlite3').verbose();
        me.db = new sqlite3.Database('dbsqlite.sqlite','SQLITE_OPEN_FULLMUTEX');
        //me.initializationTables();
        // me.initDataThemes(me);
        // me.initDataAnswers(me);
        // me.initDataQuestions(me);
        // me.initDataPositions(me);
    };


    initializationTables(){
        let me = this;
        me.db.serialize(function() {
            me.db.run('Create TABLE if not exists positions (idPosition Integer primary key AUTOINCREMENT , ' +
                'name TEXT UNIQUE)');
            me.db.run('Create TABLE if not exists users  (idUser Integer primary key AUTOINCREMENT, ' +
                'fName TEXT, ' +
                'sName TEXT, ' +
                'countFinishTests integer, ' +
                'testMark NUM,' +
                'idPosition integer,' +
                'FOREIGN KEY (idPosition) REFERENCES positions(idPosition) ON DELETE CASCADE ON UPDATE CASCADE)');

            me.db.run('Create TABLE if not exists questions (idQuest Integer primary key AUTOINCREMENT , ' +
                'content1 TEXT, ' +
                'content2 TEXT, ' +
                'idAnswer1 Integer default null, ' +
                'idAnswer2 Integer default null, ' +
                'idAnswer3 Integer default null, ' +
                'idAnswer4 Integer default null, ' +
                'idAnswer5 Integer default null, ' +
                'idAnswer6 Integer default null, ' +
                'idAnswer7 Integer default null, ' +
                'idRightAnswer Integer, ' +
                'idTheme Integer, ' +
                'FOREIGN KEY (idRightAnswer) REFERENCES answers(idRightAnswer) ON DELETE CASCADE ON UPDATE CASCADE,'+
                'FOREIGN KEY (idTheme) REFERENCES themes (idTheme) ON DELETE CASCADE ON UPDATE CASCADE)');

            me.db.run('Create TABLE if not exists answers (idAnswer Integer primary key AUTOINCREMENT , ' +
                'content TEXT UNIQUE)');

            me.db.run('Create TABLE if not exists themes (idTheme Integer primary key AUTOINCREMENT , ' +
                'name TEXT UNIQUE)');

            me.db.run('Create TABLE if not exists results   (idResult Integer primary key AUTOINCREMENT , ' +
                'idUser Integer, ' +
                'idQuest Integer, ' +
                'idAnswer Integer, ' +
                'FOREIGN KEY (idUser) REFERENCES users(idUser) ON DELETE CASCADE ON UPDATE CASCADE ' +
                'FOREIGN KEY (idQuest) REFERENCES questions(idQuest) ON DELETE CASCADE ON UPDATE CASCADE)');

            me.db.run('CREATE TRIGGER IF NOT EXISTS addResTest \n' +
                '   AFTER INSERT ON results ' +
                'BEGIN\n' +
                ' update users \n' +
                ' set countFinishTests = countFinishTests + 1 \n' +
                ' where idUser = NEW.idUser;\n' +
                ' END');

        });

    };

    returnUserById(userId){
        let me = this;
        console.log(me.dbSync.run('SELECT * FROM users where idUser = ' + userId)[0]);
    }

    returnQusetionByUserId(userId){
        let me = this, questions, returnResult = [];
        let answerIdArr = [], answerArr = [];
        let results = me.dbSync.run(`select idQuest, idAnswer from results where results.idUser = ${userId}`);
        for(let i = 0 ; i < results.length; i++) {

            questions = me.dbSync.run('SELECT * FROM questions where idQuest = ' + results[i].idQuest)[0];
            returnResult[i] = {};
            returnResult[i].content1 = questions.content1;
            returnResult[i].content2 = questions.content2;
            returnResult[i].idRightAnswer = questions.idRightAnswer;
            returnResult[i].idAnswer = results[i].idAnswer;

            answerIdArr.push(questions.idAnswer1);
            answerIdArr.push(questions.idAnswer2);
            answerIdArr.push(questions.idAnswer3);
            answerIdArr.push(questions.idAnswer4);
            answerIdArr.push(questions.idAnswer5);
            answerIdArr.push(questions.idAnswer6);
            answerIdArr.push(questions.idAnswer7);


            answerArr.push(me.returnAnswerById(questions.idAnswer1));
            answerArr.push(me.returnAnswerById(questions.idAnswer2));
            answerArr.push(me.returnAnswerById(questions.idAnswer3));
            answerArr.push(me.returnAnswerById(questions.idAnswer4));
            answerArr.push(me.returnAnswerById(questions.idAnswer5));
            answerArr.push(me.returnAnswerById(questions.idAnswer6));
            answerArr.push(me.returnAnswerById(questions.idAnswer7));

            answerArr = answerArr.filter(function (el) {
                return el != null;
            });
            answerIdArr = answerIdArr.filter(function (el) {
                return el != null;
            });

            returnResult[i].arrAnswers = answerArr;
            returnResult[i].answerIdArr = answerIdArr;
            answerIdArr = [];
            answerArr = [];
        }
        return returnResult
    }
    initDataThemes(me) {//answers
        me.insertValue('themes', 'JavaScript');
        me.insertValue('themes', 'ООП');
        me.insertValue('themes', 'HTML');
    }
    initDataPositions(me) {//answers
        me.insertValue('positions', 'Техник-программист');
        me.insertValue('positions', 'Инженер-программист');
    }
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
        me.insertValue('answers','5');
        me.insertValue('answers','6');
        me.insertValue('answers','7');
        me.insertValue('answers','8');
        me.insertValue('answers','9');
        me.insertValue('answers','10');
        me.insertValue('answers','12');
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
        me.insertValue('answers','Hello');
        me.insertValue('answers','Возводит в степень.');
        me.insertValue('answers','Умножает число само на себя.');
        me.insertValue('answers','Нет такого оператора.');
        me.insertValue('answers','Вася.');
        me.insertValue('answers','Петя.');
        me.insertValue('answers','[object Object]');
        me.insertValue('answers','код функции f.');
        me.insertValue('answers','ошибка: слишком глубокая рекурсия.');
        me.insertValue('answers','ошибка: переменная f не определена.');
        me.insertValue('answers','другое.');
        me.insertValue('answers','\"\"');
        me.insertValue('answers','function');
        me.insertValue('answers','object');
        me.insertValue('answers','false, false.');
        me.insertValue('answers','false, true.');
        me.insertValue('answers','true, false.');
        me.insertValue('answers','true, true.');
        me.insertValue('answers','дудкин.');
        me.insertValue('answers','дупкин.');
        me.insertValue('answers','пупкин.');
        me.insertValue('answers','ляпкин-тяпкин.');
        me.insertValue('answers','string');

        me.insertValue('answers','Модульность, наследование, однозначность');
        me.insertValue('answers','Модульность, наследование, разделение обязанностей');
        me.insertValue('answers','Инкапсуляция, наследование, полиморфизм');
        me.insertValue('answers','Строгая типизация, однозначность, полиморфизм');

        me.insertValue('answers','является отношением part-of');
        me.insertValue('answers','синоним агрегации');
        me.insertValue('answers','указывает на логическое включение');
        me.insertValue('answers','является отношением is-a');

        me.insertValue('answers','Класс A - генерализация класса B');
        me.insertValue('answers','Класс B - генерализация класса A');
        me.insertValue('answers','Класс A - реализация класса B');
        me.insertValue('answers','Класс B - реализация класса A');

        me.insertValue('answers','полиморфизм никак не связан с наследованием');
        me.insertValue('answers','клиенты полиморфных классов всегда знают о всех вариантах реализации полиморфного поведения');
        me.insertValue('answers','полиморфизм - это возможность существования разных вариантов реализации одноименного действия');
        me.insertValue('answers','полиморфизм реализуется только с помощью шаблонов (параметризуемых классов)');
        //110
        me.insertValue('answers','это процесс сокрытия компонентов данных и кода, реализующего функциональность, за интерфейсом, не позволяющим пользователю искажать данные.');
        me.insertValue('answers','это механизм, который объединяет данные и методы, манипулирующие этими данными, и защищает и то и другое от внешнего вмешательства или неправильного использования.');
        me.insertValue('answers','это принцип ООП, согласно которому каждый объект может использоваться более чем в одной программе.');
        me.insertValue('answers','это механизм, позволяющий создавать классы объектов на основе других классов, расширяя и частично изменяя их функциональность и набор атрибутов.');
        me.insertValue('answers','Все определения не верны');
        //115
        me.insertValue('answers','Коллекция является динамическим набором группы связанных объектов. Массив фиксированным набором связанных объектов.');
        me.insertValue('answers','Коллекция инкапсулирует реализацию объектов. Массив не применяет инкапсуляцию объектов');
        me.insertValue('answers','Коллекция фиксировано определяет набор объектов. Массив хранит временные параметры объектов.');
        me.insertValue('answers','Нет верных вариантов ответа');
        //119
        me.insertValue('answers','Селектор');
        me.insertValue('answers','Модификатор');
        me.insertValue('answers','Сеттер');
        me.insertValue('answers','Конструктор');
        me.insertValue('answers','Деструктор');
        //124
        me.insertValue('answers','Полиморфизм');
        me.insertValue('answers','Инкапсуляция');
        me.insertValue('answers','Агрегация');
        me.insertValue('answers','Композиция');
        me.insertValue('answers','Персистентность');
        //129
        me.insertValue('answers','Идентичность означает, что у объектов есть общий не абстрактный предок, а равенство - любой общий предок');
        me.insertValue('answers','Идентичность означает, что у объектов одинаковые поля, а равенство - что они содержат одинаковые данные');
        me.insertValue('answers','Идентичность означает, что объекты являются экземплярами одного и того же класса, а равенство - что они содержат одинаковые данные');
        me.insertValue('answers','Идентичность означает, что две ссылки указывают на один и тот же объект, а равенство - что они содержат одинаковые данные');
        //133
        me.insertValue('answers','Позволяет определять функцию или тип данных обобщённо, так что значения обрабатываются идентично вне зависимости от их типа');
        me.insertValue('answers','Позволяет давать одинаковые имена программным сущностям с различным поведением');
        me.insertValue('answers','Доступен в нескольких объектно-ориентированных языках, где он часто идет под названием "дженерик" или "шаблоны"');
        me.insertValue('answers','Не поддерживается в языках Java и С++');
        //137
        me.insertValue('answers','...вами и вашими друзьями');
        me.insertValue('answers','...вашей комнатой и комнатой ваших соседей');
        me.insertValue('answers','...вами и вашими руками');
        me.insertValue('answers','...вашей комнатой и мебелью в ней');
        //141
        me.insertValue('answers','Отличий нет, это одинаковые элементы класса');
        me.insertValue('answers','Поля подобны переменным, могут быть прочитанны или изменены напрямую. Свойства пренадлежат полям.');
        me.insertValue('answers','Поля подобны переменным, могут быть прочитанны или изменены напрямую. Свойства определяются с использованием расширяющих процедур (get, set)');
        //144
        me.insertValue('answers','Множественное наследование');
        me.insertValue('answers','Наследование');
        //146
        me.insertValue('answers','В производных классах присутствует часть состояния родительского класса.');
        me.insertValue('answers','Производные классы содержат поля и методы родительского.');
        me.insertValue('answers','Производные классы содержат методы родительского класса.');
        me.insertValue('answers','Производные классы наследуют поля родительского класса.');
        me.insertValue('answers','это процесс сокрытия компонентов данных и кода, реализующего функциональность, за некоторым интерфейсом');
        me.insertValue('answers','это процесс создания классов более высокого уровня, от которых можно создать более специфические сущности.');
        ///
        me.insertValue('answers','<input type="datafile">');
        me.insertValue('answers','<input type="file">');
        me.insertValue('answers','<input type="folder">');
        me.insertValue('answers','<input type="filelist">');

        me.insertValue('answers','Вставить все переключатели внутрь < label >.');
        me.insertValue('answers','Добавить к каждому переключателю атрибут value с одинаковым значением.');
        me.insertValue('answers','Вставить все переключатели внутрь < section >.');
        me.insertValue('answers','Добавить к каждому переключателю атрибут name с одинаковым значением.');

        me.insertValue('answers','rows');
        me.insertValue('answers','length');
        me.insertValue('answers','size');
        me.insertValue('answers','cols');

        me.insertValue('answers','<action>');
        me.insertValue('answers','<form >');
        me.insertValue('answers','<p>');
        me.insertValue('answers','<input>');

        me.insertValue('answers','<input type="radio">');
        me.insertValue('answers','<input type="checkbox">');
        me.insertValue('answers','<input type="button">');
        me.insertValue('answers','<input type="switch">');

        me.insertValue('answers','<input type="checkbox" selected>');
        me.insertValue('answers','<input type="checkbox" autofocus>');
        me.insertValue('answers','<input type="checkbox" checked>');
        me.insertValue('answers','<input type="checkbox" required>');

        me.insertValue('answers','hidden');
        me.insertValue('answers','autofocus');
        me.insertValue('answers','disabled');
        me.insertValue('answers','check');

        me.insertValue('answers','<textarea>');
        me.insertValue('answers','title');
        me.insertValue('answers','label');
        me.insertValue('answers','text');

        me.insertValue('answers','name');
        me.insertValue('answers','type');
        me.insertValue('answers','type');
        me.insertValue('answers','value');
        me.insertValue('answers','<input type="file" accept="music/*">');
        me.insertValue('answers','<input type="file" accept="sound/*">');
        me.insertValue('answers','<input type="file" accept="mp3/*">');
        me.insertValue('answers','<input type="file" accept="audio/*">');

        me.insertValue('answers','post');
        me.insertValue('answers','form');
        me.insertValue('answers','action');
        me.insertValue('answers','method');
        me.insertValue('answers','legend');
        me.insertValue('answers','id');
        me.insertValue('answers','<input type="submit">');
        me.insertValue('answers','<input type="return">');
        me.insertValue('answers','<input type="send">');
    };
    initDataQuestions(me){
        me.insertValue('questions','Чему равна длина arr.length массива arr?', 'let arr = [];\n' +
            'arr[1] = 1;\n' +
            'arr[3] = 33;}',10,11,12,13,14,22,null,14,1);
        me.insertValue('questions','Есть ли различия между проверками:','if( x <= 100 ) {...}\n' +
            '// и\n' +
            'if( !(x > 100) ) {...}',63,64,65,null,null,null,null,63,1);

        me.insertValue('questions','Какое будет выведено значение?','let x = 5;\nalert( x++ )',15,16,1,null,null,null,null,15,1);

        me.insertValue('questions','Что выведет alert?','alert(str); // ?\nvar str = "Hello";',71,6,7,null,null,null,null,6,1);

        me.insertValue('questions','Что делает оператор **?',null,73,74,75,null,null,null,null,73,1);

        me.insertValue('questions','Чему равно 0 || "" || 2 || undefined || true || falsе ?',null,10,83,12,6,39,40,null,12,1);

        me.insertValue('questions','Что выведет этот код?','f.call(f);\n' +
            '\n' +
            'function f() {\n' +
            '  alert( this );\n' +
            '}',78,79,80,81,82,null,null,79,1);

        me.insertValue('questions','Что выведет этот код?','if (function f(){}) {\nalert(typeof f);\n}',6,84,8,85,54,null,null,6,1);

        me.insertValue('questions','Что получится, если сложить true + false?',null,45,10,11,46,null,null,null,11,1);

        me.insertValue('questions','Чему равна переменная name?','let name = "пупкин".replace("п", "д")',90,91,92,93,null,null,null,91,1);

        me.insertValue('questions','Чему равен typeof null в режиме use strict?',null,8,6,85,94,null,null,null,85,1);

        me.insertValue('questions','Что выведет этот код?','let obj = {\n' +
            ' "0": 1,\n' +
            ' 0: 2\n' +
            '};\n' +
            '\n' +
            'alert( obj["0"] + obj[0] );',12,13,14,21,54,null,null,14,1);

        me.insertValue('questions','Что выведет этот код?','function F() { return F; }\n' +
            '\n' +
            'alert( new F() instanceof F );\n' +
            'alert( new F() instanceof Function );',86,87,88,89,null,null,null,87,1);

        me.insertValue('questions','Что выведет alert?','let str = "Hello";\n' +
            'str.something = 5;\n' +
            'alert(str.something); // ?',15,6,7,null,null,null,null,6,1);

        me.insertValue('questions','Что выведет этот код?','for(let i=0; i<10; i++) {\n' +
            '  setTimeout(function() {\n' +
            '    alert(i);\n' +
            '  }, 100);\n' +
            '}',2,3,4,5,46,null,null,2,1);

        me.insertValue('questions','Чему равно arr.length?','function MyArray() { }\n' +
            'MyArray.prototype = [];\n' +
            '\n' +
            'let arr = new MyArray();\n' +
            'arr.push(1, 2, 3);\n' +
            'alert(arr.length);',10,6,13,54,null,null,null,13,1);

        me.insertValue('questions','Что выведет sayHi при вызове через setTimeout?','let name = "Вася";\n' +
            'function sayHi() {\n' +
            '  alert(name);\n' +
            '}\n' +
            '\n' +
            'setTimeout(function() {\n' +
            '  let name = "Петя";\n' +
            '  sayHi();\n' +
            '}, 1000);',76,77,6,7,null,null,null,76,1);

        me.insertValue('questions','Что из ниже перечисленного относится к трем китам ООП (три основных понятия ООП)?',null,95,96,97,98,null,null,null,97,2);
        me.insertValue('questions','Отношение композиции - ',null,99,100,101,102,null,null,null,99,2);
        me.insertValue('questions','Класс B расширяет класс A. Какое утверждение из перечисленных верно:',null,103,104,105,106,null,null,null,103,2);
        me.insertValue('questions','Выберите корректное утверждение, связанное с понятием полиморфизма :',null,107,108,109,110,null,null,null,109,2);
        me.insertValue('questions','Выберите наиболее точное определение наследованию:',null,111,112,113,114,115,null,null,114,2);
        me.insertValue('questions','В чём отличие Коллекции и Массива группы связанных объектов?',null,116,117,118,119,null,null,null,116,2);
        me.insertValue('questions','Метод, который определяет состояние объекта, не изменяя его.',null,120,121,122,123,124,null,null,120,2);
        me.insertValue('questions','Какой принцип ООП необходимо использовать, чтобы заменить конструкции if-then-else в данном фрагменте кода:',null,125,126,127,128,129,null,null,125,2);
        me.insertValue('questions','Какая разница между идентичностью (identity) и равенством (equality) объектов в ООП?',null,130,131,132,133,null,null,null,133,2);
        me.insertValue('questions','Выберите правильные утверждения по отношению к ad hoc полиморфизму:',null,134,135,136,137,null,null,null,135,2);
        me.insertValue('questions','Словом "агрегация" (включение, композиция) точнее всего описывается отношение между...',null,138,139,140,141,null,null,null,141,2);
        me.insertValue('questions','В чем отличие Свойств и Полей',null,142,143,144,null,null,null,null,144,2);
        me.insertValue('questions','Драконы умеют летать (как, например, птицы) и ползать (как, например, ящерицы). С точки зрения ООП, примером чего является данная ситуация (выберите наиболее точный вариант)?',null,125,126,128,148,149,null,null,125,2);
        me.insertValue('questions','Термин "наследование" обозначает, что...',null,147,148,149,150,null,null,null,148,2);
        me.insertValue('questions','Выберете наиболее точное определение абстракции:',null,110,114,151,152,null,null,null,152,2);


        me.insertValue('questions','Как сделать поле для загрузки файлов?',null,153,154,155,156,null,null,null,154,3);//
        me.insertValue('questions','Как объединить несколько переключателей в группу?',null,157,158,159,160,null,null,null,160,3);//
        me.insertValue('questions','Какой атрибут устанавливает высоту списка?',null,161,162,163,164,null,null,null,163,3);//
        me.insertValue('questions','Какой элемент создаёт форму?',null,165,166,167,168,null,null,null,166,3);//
        me.insertValue('questions','Какой код создаёт переключатели?',null,169,170,171,172,null,null,null,169,3);//
        me.insertValue('questions','Как сделать флажок заранее выделенным?',null,173,174,175,176,null,null,null,175,3);//
        me.insertValue('questions','Какой код создаёт флажки?',null,169,170,171,172,null,null,null,170,3);//
        me.insertValue('questions','Какой атрибут элемента <input> блокирует поле для ввода данных?',null,177,178,179,180,null,null,null,179,3);
        me.insertValue('questions','Какой элемент создаёт многострочное текстовое поле?',null,170,171,169,181,null,null,null,181,3);
        me.insertValue('questions','Какой атрибут элемента <optgroup> устанавливает заголовок группы?',null,182,183,184,196,null,null,null,183,3);

        me.insertValue('questions','Какой атрибут элемента <form> задаёт обработчик формы?',null,185,186,194,187,null,null,null,194,3);//
        me.insertValue('questions','Как указать загружать только аудиофайлы?',null,188,189,190,191,null,null,null,191,3);//
        me.insertValue('questions','Какой атрибут элемента <form> задаёт метод отправки формы?',null,192,193,194,195,null,null,null,195,3);//
        me.insertValue('questions','Через какой атрибут поле формы можно связать с самой формой?',null,194,193,197,195,null,null,null,193,3);//
        me.insertValue('questions','Как сделать кнопку для отправки формы?',null,198,199,200,171,null,null,null,198,3);//







    };
    insertValue(tableName,...values){
        let me = this;
        values.unshift(null);
        let placeholders = values.map((value) => '?').join(',');
        var last_insert_id = me.dbSync.run(`INSERT INTO ${tableName} VALUES (${placeholders})`,values);
    };

    updateResult(tableName, userId, questId,result){
        var last_insert_id = this.dbSync.run(`UPDATE ${tableName} set idAnswer = ${result} where idUser = ${userId} and idQuest = ${questId}`);
        console.log(this.dbSync.run(`SELECT *  FROM ${tableName}  where idUser = ${userId} and idQuest = ${questId}`))
    };

    updateUserMark(userId, testMark){
        var last_insert_id = this.dbSync.run(`UPDATE users set testMark = ${testMark} where idUser = ${userId}`);};

    removeDataFromTable(tableName){
        console.log('removeDataFromTable ' + tableName );
        this.dbSync.run('delete from ' +tableName);
    }
    returnUserId(fName,secName) {
        let me = this;
        let results = me.dbSync.run(`SELECT idUser FROM users where fName = '${fName}' and sName = '${secName}'`);
        if(results.length!==0) {

            return results[0].idUser;
        }
        else return null;
    }

    showAllDataFromTable(table){
        let me = this;
        let result = me.dbSync.run(`SELECT * FROM  ${table}`);
        console.log(result)
    };

    selectIdFromPositions(table){
        let me = this;
        let result = me.dbSync.run(`SELECT idPosition FROM positions WHERE name = '${table}'`)[0].idPosition;
        return result;
    };

    selectIdFromThemes(name){
        let me = this;
        let result = me.dbSync.run(`SELECT idTheme FROM themes WHERE name = '${name}' `)[0].idTheme;
        return result;
    };

    clearTable(tableName){
        let me = this;
        me.dbSync.run(`DELETE FROM ${tableName}`);
    }
    getTest(userId, themeId){

        let me = this, arrId = [], randomId = null;
        let results = me.dbSync.run(`SELECT idResult, idQuest FROM results where idUser =  '${userId}' and idAnswer IS NULL`);
        if(results.length === 0) {
            results = me.dbSync.run(`SELECT idResult, idQuest FROM results where idUser =  '${userId}'`);

            for(let i = 0; i <results.length;i++) arrId.push(results[i].idQuest);
            if(arrId.length !== 15) {
                while(true) {
                    if(themeId == 1) randomId = me.getRandomInt(1,18);
                    if(themeId == 2)  randomId = me.getRandomInt(18,33);
                    if(themeId == 3)  randomId = me.getRandomInt(33,48);
                    if(!arrId.includes(randomId)) break;
                }
            }

        } else randomId = results[0].idQuest;

        let test =  me.dbSync.run(`SELECT * FROM questions where idQuest = ${randomId} and idTheme = ${themeId}`)[0];

        return test;
    };
    returnAnswerById(idAnswer){

        let me  = this;
        if(idAnswer === null) return null;
        let answer =  me.dbSync.run('SELECT content FROM answers where idAnswer = ' + idAnswer)[0];
        // console.log(answer.content);
        return answer.content;
    }


    checkResult(userId,questId){
        let me = this;
        let answer =  me.dbSync.run(`SELECT idAnswer FROM results where idUser = ${userId} and idQuest = ${questId}`)[0];
        if(answer) return false;
        else return true;
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
    }

    returnTestCount(userId){
        return  this.dbSync.run(`SELECT countFinishTests FROM users where idUser = ${userId} `)[0].countFinishTests;

    }

    resetTestCount(userId, mark){
        let me = this;
        let result = me.dbSync.run(`update users set countFinishTests = 0, testMark = ${mark} where idUser = ${userId}`);
        let user = me.dbSync.run(`select * from users where idUser = ${userId}`);
        console.log(user);
    }

    nextTest() {
        console.log('nextTest');
    }

    tableDelete(table){
        let me = this;
        me.db.run('Drop TABLE '+table);
    };

    clearResultsUser(userId){
        let me = this;
        me.dbSync.run(`delete from results where idUser = ${Number(userId)}`);
    }
    calcUserResult(userId){
        let me = this;
        let count = me.dbSync.run(`SELECT * from results, questions where questions.idQuest 
            = results.idQuest and results.idAnswer = questions.idRightAnswer and idUser = ${userId} order by results.idResult desc limit 15`).length;
        let countAllQuestions = me.dbSync.run(`SELECT * from results, questions where questions.idQuest = results.idQuest 
        and idUser = ${userId} order by results.idResult desc limit 15`).length;
        return count/countAllQuestions * 100;
    }

    DBClose(){
      this.db.close();
    };
}

let db = new DataBase();
console.log(db.dbSync.run(`select * from users`));

// console.log(db.seectIdFromPositions('Техник-программист'));
// console.log(db.selectIdFromPositions('JavaScript'));

//console.log(db.dbSync.run(`select * from questions join results on results.idQuest = questions.idQuest where results.idUser = 89 `));
//db.returnQusetionByUserId(89);
//console.log(db.dbSync.run(`select * from results  where results.idUser = 86 `));
//db.showAllDataFromTable('themes');
//db.clearResultsUser(74);
// db.calcUserResult(62);
//db.resetTestCount(80,33.3);
//let result = db.dbSync.run(`SELECT * FROM users where idUser = 80`);
//console.log(result)
exports = module.exports;

exports.DataBase = DataBase;
