const express = require('express');
const jwt = require('jsonwebtoken');
const {User} = require('../models/index');
const router = express.Router();

// Auth route exports the following endpoints
// 1. Register a user
// 2. Login as a user

//Register endpoint is used to register a user
router.post('/register', async (req, res) => {
    try{
        const {username, password} = req.body;
        const user = await User.create({username, password});
        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET);
        res.status(201).json({token});
    }
    catch(error) {
        res.status(400).json({error: 'Registration failed'});
    }
});

//Login endpoint - This validates username and password with the credentials
router.post('/login', async (req, res) => {
    try{
        const {username, password} = req.body;
        const user = await User.findOne({where: {username} });
        if(!user){
            return res.status(401)
            .json({error: 'Username doesnot exists'});
        }
        if((password !== user.password)) {
            return res.status(401)
            .json({error: 'Invalid credentials'});
        }
        const token = jwt.sign({userId: user.id}, process.env.JWT_SECRET);
        res.json({token});
    }
    catch(error) {
        res.status(400).json({error: 'Login failed'});
    }
});

module.exports = router;