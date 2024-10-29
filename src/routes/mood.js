const express = require('express');
const {Op} = require('sequelize');
const {Mood,User} = require('../models/index');
const auth = require('../authMiddleware');
const router = express.Router();
const jwt = require('jsonwebtoken');



// Mood route exports the following endpoints
// 1. To create/post a mood
// 2. Get statistics of a month
// 3. Updates a mood entry
// 4. Deletes a mood entry
// 5. Statistics of a user filtering by month and emoji
// 6. Sharing mood data of a user
// 7. Unshare or disabling sharing of a user's mood data
// 8. Accessing/retrieving a mood data shared by a user
// 9. Public mood board
// 10. Emoji suggestions based on notes provided
// 11. Dashboard/Chart data useful to represent in a chart



// Creates or posts a mood
router.post('/', auth, async(req, res) => {
    try{
        const {emoji, note, date} = req.body;
        const mood = await Mood.create({
            emoji, 
            note,
            date: date || new Date(),
            UserId: req.user.id
        });
        res.status(201).json({mood});
    }
    catch(error) {
        res.status(400).json({error: 'Failed to create mood entry'});
    }
});


// Get mood stats for a month
router.get('/monthly/:year/:month', auth, async (req, res) => {
    try {
        const {year, month} = req.params;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const moods = await Mood.findAll({
            where: {
                UserId: req.user.id,
                date: {
                    [Op.between]: [startDate, endDate],
                }
            }
        });

        const emojiStats = moods.reduce((acc, mood) => {
            acc[mood.emoji] = (acc[mood.emoji] || 0) + 1;
            return acc;
        }, {});

        res.json({
            totalEntries: moods.length,
            emojiStats,
            entries: moods
        });
    } 
    catch (error) {
        res.status(400).json({error: 'Failed to get monthly summary'});
    }
});


// Update a mood
router.put('/:id', auth, async(req, res) => {
    try{
        const {emoji, note} = req.body;
        const mood = await Mood.findOne({
            where: {
                id: req.params.id, 
                UserId: req.user.id
            }
        });
        if(!mood) {
            return res.status(404)
            .json({error: 'Mood entry not found'});
        }

        await mood.update({emoji, note});
        res.json(mood);
    }
    catch(error) {
        res.status(400).json({error: 'Failed to update mood entry'});
    }
});


//Delete a mood
router.delete('/:id', auth, async(req, res) => {
    try{
        const deleted = await Mood.destroy({
            where: {id: req.params.id, UserId: req.user.id}
        });
        if(!deleted) {
            return res.status(404)
            .json({error: 'Mood entry not found'});
        }
        res.json({ message: 'Mood entry deleted'});
    } 
    catch(error) {
        res.status(400)
        .json({error: 'Failed to delete moon entry'});
    }
});


// Statistics of a user segregated by emoji and month
router.get('/stats', auth, async (req, res) => {
    try{
        const moods = await Mood.findAll({
            where: {UserId: req.user.id},
            attributes: ['emoji', 'date']
        });

        const stats = {
            total: moods.length,
            byEmoji: {},
            byMonth: {}
        };

        moods.forEach(mood => {
            stats.byEmoji[mood.emoji] = 
                (stats.byEmoji[mood.emoji] || 0) + 1;

            const monthKey = mood.date;
            if(!stats.byMonth[monthKey]) {
                stats.byMonth[monthKey] = {};
            }
            stats.byMonth[monthKey][mood.emoji] =
            (stats.byMonth[monthKey][mood.emoji] || 0) + 1;
        });

        res.json(stats);
    }
    catch(error) {
        res.status(400).json({error: 'Failed to get statistics'});
    }
});


// Sharing mood data of a user
router.post('/share', auth, async (req, res) => {
    try{
        const user = await User.findByPk(req.user.id);
        await user.update({ shareEnabled: true});
        const sharedToken = jwt.sign(
            {userId: user.id, shared: true},
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        );
        res.json({shareUrl: `/shared/${sharedToken}`});
    }
    catch (error) {
        res.status(400).json({error: 'Failed to share'});
    }
});


// Disabling share setting for a user
router.post('/unshare', auth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        await user.update({ shareEnabled: false});
        res.json({message: 'Sharing disabled'});
    }
    catch (error) {
        res.status(400).json({error: 'Failed to disable sharing'});
    }
});


// Retrieving a shared data
router.get('/shared/:token', async (req, res) => {
    try{
        const decoded = jwt.verify(req.params.token,
            process.env.JWT_SECRET
        );
        const user = await User.findByPk(decoded.userId);

        if(!user || !user.shareEnabled) {
            return res.status(403)
            .json({error: 'Sharing not enabled'});
        }

        const moods = await Mood.findAll({
            where: {UserId: user.id},
            attributes: ['emoji', 'note', 'date']
        });

        res.json(moods);
    }
    catch(error) {
        res.status(400)
        .json({error: 'Failed to get shared moods'});
    }
});


// Public endpoint to get mood statistics of users
router.get('/public', async(req, res) => {
    try{
        const today = new Date();
        const lastWeek = new Date(today - (7* 24* 60 * 60 * 1000));
        const moods = await Mood.findAll({
            where: {
                date: {
                    [Op.between]: [lastWeek, today]
                }
            },
            attributes: ['emoji', 'date']
        });

        const aggregated = {};
        for(let mood of moods){
            const dateKey = mood.date;
            if(!aggregated[dateKey]) {
                aggregated[dateKey] = {};
            }
            if(!aggregated[dateKey][mood.emoji]) {
                aggregated[dateKey][mood.emoji] = 0;
            }
            aggregated[dateKey][mood.emoji] += 1;
        }
        res.json(aggregated);
    }
    catch(error) {
        res.status(400).json({error: 'Failed to get mood board'});
    }
});


// Suggestions based on text
router.post('/suggest', auth, async(req, res) => {
    const {note} = req.body;

    const suggestions = {
        'happy|joy|excited|wonderful': '😊',
        'sad|down|upset|unhappy': '😢',
        'angry|mad|frustrated': '😠',
        'tired|sleepy|exhausted': '😴',
        'love|heart|caring': '❤️',
        'worried|anxious|nervous': '😰',
        'sick|ill|unwell': '🤒',
        'relaxed|calm|peaceful': '😌'
    };

    const suggestedEmojis = Object.entries(suggestions)
    .filter(([keywords]) => 
        new RegExp(keywords, 'i').test(note)
    )
    .map(([, emoji]) => emoji);
    ;

    res.json({suggestions: suggestedEmojis });
});


// Data to present in a chart or dashboard
router.get('/dashboard', auth, async (req, res) => {
    try{
        const moods = await Mood.findAll({
            where: {UserId: req.user.id},
            attributes: ['emoji', 'date']
        });
        if(!moods){
            res.status(400)
            .json({error: 'No mood entries found'});
        }
        const chartData = {};

   for (let mood of moods) {
       const date = mood.date;
       
       if (!chartData[date]) {
           chartData[date] = {};
       }
       if (!chartData[date][mood.emoji]) {
           chartData[date][mood.emoji] = 0;
       }
       
       chartData[date][mood.emoji] += 1;
   }
   
   const dashboard = {
       labels: Object.keys(chartData),
       datasets: Object.keys(chartData).map(date => ({
           date: date,
           emojiCounts: chartData[date]
       }))
   };
   res.json(dashboard);
    }     
    catch(error) {
        res.status(400)
        .json({error: 'Failed to get dashboard data'});
    }
});

module.exports = router;