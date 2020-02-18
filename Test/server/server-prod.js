import path from 'path'
import express from 'express'
const app = express(),
    DIST_DIR = __dirname,
    HTML_DIR = '../html/';
app.use(express.static(HTML_DIR));
app.get('/', (req, res) => {
    res.sendFile(HTML_DIR + 'MainPage.html')
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`App listening to ${PORT}....`);
    console.log('Press Ctrl+C to quit.')
});

app.get('/reg', (req, res) => {
    res.sendFile(HTML_DIR + 'MainPage.html');
});
