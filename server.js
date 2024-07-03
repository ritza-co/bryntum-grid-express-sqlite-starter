import bodyParser from 'body-parser';
import express from 'express';
import path from 'path';

global.__dirname = path.resolve();

const port = 1337,
    app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

// Start server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
