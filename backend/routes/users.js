const express = require('express');
const { getLeaderboard, updateScore, getUserStats, getHistory, getNotifications, markNotificationRead, markAllNotificationsRead } = require('../controllers/users');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.post('/update-score', protect, updateScore);
router.get('/me/stats', protect, getUserStats);
router.get('/me/history', protect, getHistory);
router.get('/me/notifications', protect, getNotifications);
router.post('/me/notifications/read-all', protect, markAllNotificationsRead);
router.post('/me/notifications/:id/read', protect, markNotificationRead);

module.exports = router;
