const User = require('../models/User');
const mongoose = require('mongoose');
const db = require('../utils/dataHandler');

// @desc    Get Global Leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
  try {
    const { timeframe } = req.query; // 'weekly', 'monthly', 'allTime'
    const sortField = timeframe === 'weekly' ? 'weeklyScore' : 'totalScore';
    
    // Sort logic is a bit specific for DB, but we can simplify
    const users = await db.find(User, 'users');
    
    // Manual sort because localDB doesn't sort
    const sortedUsers = [...users]
      .sort((a, b) => (b[sortField] || 0) - (a[sortField] || 0))
      .slice(0, 50);
      
    // Format response
    const formatted = sortedUsers.map((u, index) => {
      return {
        id: u._id,
        name: u.fullName || 'Anonymous User',
        score: timeframe === 'weekly' ? (u.weeklyScore || 0) : (u.totalScore || 0),
        quizzes: u.quizzesCompleted || 0,
        streak: u.highestStreak || 0,
        rank: index + 1,
        avatar: u.avatar || ''
      };
    });
    
    res.status(200).json({ 
      success: true, 
      count: formatted.length, 
      data: formatted, 
      source: mongoose.connection.readyState === 1 ? 'cloud' : 'Local Ledger' 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error fetching leaderboard' });
  }
};

// @desc    Submit score and update user stats
// @route   POST /api/users/update-score
// @access  Private
exports.updateScore = async (req, res) => {
  try {
    const { score } = req.body;
    const userId = req.user._id || req.user.id;
    const quizDate = new Date();

    const user = await db.findById(User, 'users', userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const updates = {
      totalScore: (user.totalScore || 0) + Math.floor(score),
      weeklyScore: (user.weeklyScore || 0) + Math.floor(score),
      quizzesCompleted: (user.quizzesCompleted || 0) + 1,
      lastQuizDate: quizDate.toISOString(),
      highestStreak: user.highestStreak || 0
    };
    
    // Calculate Streak
    if(user.lastQuizDate) {
      const msDiff = quizDate - new Date(user.lastQuizDate);
      const hoursDiff = msDiff / (1000 * 60 * 60);
      if (hoursDiff > 24 && hoursDiff < 48) updates.highestStreak += 1;
      else if (hoursDiff >= 48) updates.highestStreak = 1;
    } else {
      updates.highestStreak = 1;
    }
    
    // Create history entry
    const historyEntry = {
      topic: req.body.topic || 'General',
      score: Math.floor(score),
      totalQuestions: req.body.totalQuestions || 0,
      correctAnswers: req.body.correctAnswers || 0,
      passed: score >= 60,
      date: quizDate
    };

    // Push to history array using MongoDB $push
    if (mongoose.connection.readyState === 1) {
      await User.findByIdAndUpdate(userId, { 
        $set: updates, 
        $push: { history: { $each: [historyEntry], $position: 0 } } 
      }, { returnDocument: 'after', runValidators: true });
    } else {
      const user = await db.findById(User, 'users', userId);
      const history = user.history || [];
      history.unshift(historyEntry);
      await db.update(User, 'users', userId, { ...updates, history });
    }

    return res.status(200).json({ 
      success: true, 
      data: {
        totalScore: updates.totalScore,
        weeklyScore: updates.weeklyScore,
        quizzesCompleted: updates.quizzesCompleted,
        highestStreak: updates.highestStreak,
        historyEntry
      },
      source: mongoose.connection.readyState === 1 ? 'cloud' : 'Local Ledger'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update user score' });
  }
};

// @desc    Get current user stats & rank
// @route   GET /api/users/me/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const currentUser = await db.findById(User, 'users', userId);
    
    if (!currentUser) return res.status(404).json({ success: false, message: 'User not found' });

    // Calculate Rank
    let rank = 1;
    if (mongoose.connection.readyState === 1) {
      rank = (await User.countDocuments({ totalScore: { $gt: currentUser.totalScore } })) + 1;
    } else {
      const users = await db.find(null, 'users');
      rank = users.filter(u => (u.totalScore || 0) > (currentUser.totalScore || 0)).length + 1;
    }

    return res.status(200).json({
      success: true,
      data: {
        totalScore: currentUser.totalScore || 0,
        weeklyScore: currentUser.weeklyScore || 0,
        quizzesCompleted: currentUser.quizzesCompleted || 0,
        highestStreak: currentUser.highestStreak || 0,
        rank: rank
      },
      source: mongoose.connection.readyState === 1 ? 'cloud' : 'Local Ledger'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error retrieving stats' });
  }
};

// @desc    Get user notifications
// @route   GET /api/users/me/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await db.findById(User, 'users', userId);
    
    // Seed notifications if empty
    let notifications = user.notifications || [];
    if (notifications.length === 0) {
      notifications = [
        {
          _id: new mongoose.Types.ObjectId(),
          message: 'Welcome to your new magical dashboard! 🪄',
          type: 'info',
          read: false,
          createdAt: new Date()
        },
        {
          _id: new mongoose.Types.ObjectId(),
          message: 'Try your first Quick Play quiz to test your magic! ⚡',
          type: 'info',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 5) // 5 mins ago
        },
        {
          _id: new mongoose.Types.ObjectId(),
          message: 'Check out the Global Leaderboard to see top Wizards! 🏆',
          type: 'success',
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
        }
      ];
      await db.update(User, 'users', userId, { notifications });
    }

    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
};

// @desc    Mark notification as read
// @route   POST /api/users/me/notifications/:id/read
// @access  Private
exports.markNotificationRead = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await db.findById(User, 'users', userId);
    
    const notifications = (user.notifications || []).map(n => {
      const plainN = n.toObject ? n.toObject() : n;
      if (plainN._id.toString() === req.params.id) return { ...plainN, read: true };
      return plainN;
    });

    await db.update(User, 'users', userId, { notifications });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating notification' });
  }
};

// @desc    Mark all notifications as read
// @route   POST /api/users/me/notifications/read-all
// @access  Private
exports.markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await db.findById(User, 'users', userId);
    
    const notifications = (user.notifications || []).map(n => {
      const plainN = n.toObject ? n.toObject() : n;
      return { ...plainN, read: true };
    });

    await db.update(User, 'users', userId, { notifications });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating notifications' });
  }
};

// @desc    Get user history
// @route   GET /api/users/me/history
// @access  Private
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await db.findById(User, 'users', userId);
    res.status(200).json({ success: true, data: user.history || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching history' });
  }
};
