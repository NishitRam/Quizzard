const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const router = express.Router();
const Contact = require('../models/Contact');
const { writeData, readData } = require('../utils/localDB');

// Mail Transporter Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const isOnline = () => mongoose.connection.readyState === 1;

// @desc    Store a contact message (with Magic Ledger Fallback)
// @route   POST /api/contact
// @access  Public
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;
  const finalSubject = subject || 'General Magic Inquiry';

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Please provide name, email, and message.' });
  }

  const messageData = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: finalSubject,
    message: message.trim(),
    timestamp: new Date().toISOString(),
    storedVia: isOnline() ? 'Cloud' : 'Local Ledger'
  };

  try {
    if (isOnline()) {
      await Contact.create(messageData);
    } else {
      const localMessages = await readData('messages');
      localMessages.push(messageData);
      await writeData('messages', localMessages);
    }

    // Send Email Notification (Non-blocking)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const mailOptions = {
        from: `"Quizzard Portal" <${process.env.SMTP_USER}>`,
        to: process.env.EMAIL_RECEIVER || 'admin@quizzard.com',
        replyTo: email,
        subject: `✨ New Magic Message (${messageData.storedVia}): ${finalSubject}`,
        html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong> ${message}</p>`,
      };
      transporter.sendMail(mailOptions).catch(err => console.error('❌ Notification failed:', err.message));
    }

    return res.status(201).json({
      success: true,
      data: messageData,
      message: `✨ Magic Message cast successfully to the ${messageData.storedVia}!`
    });

  } catch (err) {
    console.error('Contact API Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to store message.' });
  }
});

module.exports = router;
