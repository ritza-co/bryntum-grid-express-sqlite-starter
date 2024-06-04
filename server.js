import bodyParser from 'body-parser';
import express from 'express';
import path from 'path';
import sequelize from './config/database.js';
import Player from './models/Player.js';

global.__dirname = path.resolve();

const port = 1337;
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/node_modules/@bryntum/grid')));

app.use(bodyParser.json());

app.get('/read', async(req, res) => {
    try {
        const players = await Player.findAll();

        res.send({
            success : true,
            data    : players
        });
    }
    catch (error) {
        res.send({
            success : false,
            message : 'Players data could not be read.'
        });
    }
});

app.post('/create', async(req, res) => {
    try {
        const newPlayer = await Player.create(req.body);

        res.send({ success : true, data : [newPlayer] });
    }
    catch (error) {
        console.error(error);
        res.send({
            success : false,
            message : 'Players could not be loaded'
        });
    }
});

app.patch('/update/:itemId/', async(req, res) => {
    try {
        const data = req.body;
        const itemId = req.params.itemId;
        // Perform the update and fetch in a single transaction
        const result = await sequelize.transaction(async(t) => {
            // Update the player
            const [updated] = await Player.update(data, {
                where       : { id : itemId },
                transaction : t
            });

            if (updated) {
                // Fetch the updated player
                const updatedPlayer = await Player.findOne({
                    where       : { id : itemId },
                    transaction : t
                });
                return { updatedPlayer };
            }
            else {
                throw new Error('Player not found');
            }
        });

        res.send({ success : true, data : [result.updatedPlayer] });
    }
    catch (error) {
        console.error(error);
        res.send({
            success : false,
            message : 'Player could not be updated'
        });
    }
});

app.delete('/delete', async(req, res) => {
    try {
        const { ids } = req.body;

        // Perform the delete operations in a single transaction
        await sequelize.transaction(async(t) => {
            // Delete players whose ID is in the ids array
            await Player.destroy({
                where       : { id : ids },
                transaction : t
            });
        });

        res.send({ success : true });
    }
    catch (error) {
        console.error(error);
        const message = 'Could not delete selected player record(s)';
        res.send({
            success : false,
            message
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
