const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const db = require('../utils/dataHandler');

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const userId = user._id || user.id;
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: userId,
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar || ''
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user exists
    const existingUser = await db.findOne(User, 'users', { email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await db.create(User, 'users', {
      fullName,
      email,
      password: hashedPassword,
      avatar: ''
    });

    return sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error('Registration Error:', err.message);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: err.message || 'Internal Server Error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Find user (manual find because we need password)
    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email }).select('+password');
    } else {
      user = await db.findOne(User, 'users', { email });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    return sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(400).json({ success: false, message: err.message || 'Login failed' });
  }
};

// @desc    Update/Change Password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    const userId = req.user._id || req.user.id;

    // Manual find needed for password
    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(userId).select('+password');
    } else {
      user = await db.findById(User, 'users', userId);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Old password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const updatedUser = await db.update(User, 'users', userId, { password: hashedPassword });
    sendTokenResponse(updatedUser, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update Profile Details
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { fullName } = req.body;
    const userId = req.user._id || req.user.id;
    
    const updatedUser = await db.update(User, 'users', userId, { fullName });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    sendTokenResponse(updatedUser, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update Avatar (Base64)
// @route   PUT /api/auth/update-avatar
// @access  Private
exports.updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    const userId = req.user._id || req.user.id;
    
    if (!avatar) {
      return res.status(400).json({ success: false, message: 'Missing avatar string.' });
    }

    const updatedUser = await db.update(User, 'users', userId, { avatar });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    sendTokenResponse(updatedUser, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Check if email exists
// @route   POST /api/auth/check-email
// @access  Public
exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const user = await db.findOne(User, 'users', { email });
    res.status(200).json({ 
      success: true, 
      exists: !!user,
      method: user ? (user.googleId ? 'google' : user.githubId ? 'github' : 'password') : null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const { SMTPClient } = require('emailjs');
const { promisify } = require('util');

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await db.findOne(User, 'users', { email });

    if (!user) {
      return res.status(200).json({ 
        success: true, 
        message: 'If an account with that email exists, we have sent a reset link.' 
      });
    }

    if (user.googleId || user.githubId) {
       return res.status(200).json({ 
        success: true, 
        message: 'This email is linked to a social account. Try signing in with Google or GitHub.' 
      });
    }

    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    await db.update(User, 'users', user._id || user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpire: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    const resetUrl = `http://localhost:5176/#auth?mode=reset&token=${resetToken}`;

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT, 10) || 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const fromAddress = process.env.EMAIL_FROM || `Quizzard <${smtpUser || 'no-reply@quizzard.app'}>`;
    const testRecipient = process.env.EMAIL_RECEIVER;
    const sendTo = testRecipient || user.email;

    if (testRecipient && testRecipient !== user.email) {
      console.warn(`EmailJS is using EMAIL_RECEIVER=${testRecipient}. Redirecting password reset email for ${user.email} to ${testRecipient} in test mode.`);
    }

    if (smtpHost && smtpUser && smtpPass) {
      const client = new SMTPClient({
        user: smtpUser,
        password: smtpPass,
        host: smtpHost,
        port: smtpPort,
        tls: { rejectUnauthorized: false }
      });

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #fdfdfd; border-radius: 10px;">
          <h2 style="color: #6c5ce7;">🪄 Password Reset Request</h2>
          <p>Fellow wizard, we received a request to forge a new password for your account.</p>
          <p>Click the magical link below to cast your new protection spell:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6c5ce7; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Reset Password</a>
          <p style="margin-top: 20px; font-size: 12px; color: #888;">If you did not request this scroll, ignore it. It will expire in 10 minutes.</p>
        </div>
      `;

      const sendMail = promisify(client.send.bind(client));
      await sendMail({
        from: fromAddress,
        to: sendTo,
        subject: 'Quizzard Password Reset Scroll',
        attachment: [
          { data: emailHtml, alternative: true }
        ]
      });

      return res.status(200).json({ 
        success: true, 
        message: 'If an account with that email exists, we have sent a reset link to it.' 
      });
    }

    console.log(`[Email Service Mock (SMTP Unconfigured)] Reset URL: ${resetUrl}`);
    res.status(200).json({ 
      success: true, 
      message: 'Demo mode active. Check screen or console.',
      isDemo: true,
      demoResetToken: resetToken
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: err.message || 'Could not send reset email' });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    // Find user by token and ensure token hasn't expired
    const user = await db.findOne(User, 'users', { 
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user and clear reset token fields
    await db.update(User, 'users', user._id || user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpire: null
    });

    res.status(200).json({ 
      success: true, 
      message: 'Password successfully reset! You can now log in.' 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// @route   POST /api/auth/forgot-password
// @access  Public

// @desc    Social Login (Handles both Create and Login)
// @route   POST /api/auth/social-login
// @access  Public
exports.socialLogin = async (req, res) => {
  try {
    const { email, fullName, avatar, provider, providerId } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    let user = await db.findOne(User, 'users', { email });

    if (!user) {
      // Create new social user
      user = await db.create(User, 'users', {
        fullName: fullName || email.split('@')[0].toUpperCase(),
        email,
        avatar: avatar || '',
        [provider === 'google' ? 'googleId' : 'githubId']: providerId || 'social-' + Date.now(),
        // No password required for social users
      });
    } else {
      // Link social ID if not present
      const updateData = {};
      if (provider === 'google' && !user.googleId) updateData.googleId = providerId;
      if (provider === 'github' && !user.githubId) updateData.githubId = providerId;
      if (avatar && !user.avatar) updateData.avatar = avatar;
      
      if (Object.keys(updateData).length > 0) {
        user = await db.update(User, 'users', user._id || user.id, updateData);
      }
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Social Login Error:', err.message);
    res.status(500).json({ success: false, message: 'Social authentication failed' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await db.findById(User, 'users', userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
