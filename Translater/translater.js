let request = new XMLHttpRequest();

let key = 'trnsl.1.1.20200210T172538Z.5d86ba6fb17e0e22.dd5f5bea9bd80629ca5e4a677e97822a00e1e4b2';
let lang = 'en-ru';
let text = 'Hello World!';
request.responseType = 'document';
request.open('POST','http://translate.google.ru/translate_a/t?client=x&text=' + text + '&hl=en&sl=en&tl=ru');
request.send();
request.onload = function() {
    let responseObj = request.response.all[0];
    alert(responseObj.textContent); // Привет, мир!
};

request.onprogress = function(event) {
    if (event.lengthComputable) {
        alert(`Получено ${event.loaded} из ${event.total} байт`);
    } else {
        alert(`Получено ${event.loaded} байт`); // если в ответе нет заголовка Content-Length
    }

};

request.onerror = function() {
    alert("Запрос не удался");
};