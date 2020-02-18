const express = require('express');
const app = express(),
    DIST_DIR = __dirname,
    PROJ_DIR = 'D:/Site/Test/';
app.use(express.static(PROJ_DIR));

app.get('*', (req, res) => {
    res.sendFile(PROJ_DIR + 'html/MainPage.html')
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening tto ${PORT}....`);
    console.log('Press Ctrl+C to quit.')
});

app.get('/reg', (req, res) => {
    res.sendFile(PROJ_DIR + 'html/MainPage.html');
});
