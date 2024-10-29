require('dotenv').config();
const express = require('express');
const {sequelize} = require('./src/models/index.js');
const authRoutes = require('./src/routes/auth.js');
const moodRoutes = require('./src/routes/mood.js');
const fs = require("fs");

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/mood', moodRoutes);

async function startServer() {
    try {

        if (!fs.existsSync(".env")) {
            console.log('Please add a .env file with details to root')
            return;
        }
        if(!process.env.PORT ||
            !process.env.DB_HOST ||
            !process.env.DB_USER ||
            !process.env.DB_PASS ||
            !process.env.DB_NAME ||
            !process.env.DB_PORT ||
            !process.env.JWT_SECRET
        ) {
            console.log(`Invalid .env file!
                Please add following details in .env:
                DB_HOST=''
                DB_USER=''
                DB_PASS=''
                DB_NAME=''
                DB_PORT=''
                JWT_SECRET=''
                PORT=''
                    `);
            return;
        }

        const port =  process.env.PORT;

        await sequelize.sync();
        console.log('Database connected!');

        app.listen(port, () => {
            console.log(`Server is listening on port ${port}`)
        });
    }
    catch (error) {
        console.log("Server unable to start", error);
    }
};

startServer();