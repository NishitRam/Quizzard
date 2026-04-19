const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ });

// Initialize express
const app = express();

// Body parser with expanded limit for Base64 image payload
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Enable CORS
app.use(cors());

// Route files
const auth = require('./routes/auth');
const quizzes = require('./routes/quizzes');
const contact = require('./routes/contact');
const trivia = require('./routes/trivia');
const users = require('./routes/users');
const webdevQuiz = require('./routes/quiz');

// Mount routes
app.use('/api/auth', auth);
app.use('/api/quizzes', quizzes);
app.use('/api/contact', contact);
app.use('/api/trivia', trivia);
app.use('/api/users', users);
app.use('/api/webdev-quiz', webdevQuiz);  // Legacy: homepage quiz banner
app.use('/api/quiz', webdevQuiz);          // New: dynamic topic-based quiz


const PORT = process.env.PORT || 5000;

// Start Server Wrapper
const startServer = async () => {
  // 1. Attempt Database Connection
  const isConnected = await connectDB();

  if (!isConnected) {
    console.warn('🧙‍♂️ APPRENTICE MODE: The server is running without a cloud connection.');
    console.warn('📝 Messages will be stored in the Local Magic Ledger (messages.json).');
  }

  // 2. Start Listening regardless (Fallback handles the rest)
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    if (!isConnected) console.log('⚠️ WARNING: Using Local Storage Fallback');
  });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      console.log(`Error: ${err.message}`);
    });
};

startServer();
