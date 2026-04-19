const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const Quiz = require('./models/Quiz');

const mernQuizzes = [
  {
    subject: 'MongoDB',
    title: 'MongoDB Mastery: Basics to Advanced',
    description: 'Test your knowledge on MongoDB schema design, aggregation pipelines, and indexing.',
    difficulty: 'Intermediate',
    iconColor: '#4db33d',
    authorName: 'Database Guru',
    questions: [
      {
        questionText: 'What is the primary way to represent data relationships in MongoDB?',
        options: ['Foreign Keys', 'References or Embedding', 'Joins', 'Circular Links'],
        correctAnswer: 'References or Embedding'
      },
      {
        questionText: 'Which stage in aggregation pipeline is used for filtering documents?',
        options: ['$group', '$match', '$project', '$sort'],
        correctAnswer: '$match'
      },
      {
        questionText: 'How do you create an index on the "name" field in a collection?',
        options: ['createIndex({name: 1})', 'addIndex("name")', 'ensureIndex("name")', 'makeIndex({name: 1})'],
        correctAnswer: 'createIndex({name: 1})'
      }
    ]
  },
  {
    subject: 'Express.js',
    title: 'Express.js Web Specialist',
    description: 'Master the art of building robust APIs with Express middleware, routing, and error handling.',
    difficulty: 'Beginner',
    iconColor: '#61dafb',
    authorName: 'Middleware Mage',
    questions: [
      {
        questionText: 'Which function is used to apply middleware for every request?',
        options: ['app.get()', 'app.use()', 'app.listen()', 'app.set()'],
        correctAnswer: 'app.use()'
      },
      {
        questionText: 'How do you access the query string parameters in Express?',
        options: ['req.query', 'req.params', 'req.body', 'req.data'],
        correctAnswer: 'req.query'
      }
    ]
  },
  {
    subject: 'React',
    title: 'React Wizardry: The Modern Way',
    description: 'Deep dive into React Hooks, State management, and component architecture.',
    difficulty: 'Intermediate',
    iconColor: '#00d8ff',
    authorName: 'Frontend Wizard',
    questions: [
      {
        questionText: 'What is the purpose of React.memo()?',
        options: ['To remember variable values', 'To prevent unnecessary re-renders of a component', 'To store global state', 'To fetch data from API'],
        correctAnswer: 'To prevent unnecessary re-renders of a component'
      },
      {
        questionText: 'Which hook returns the previous state value?',
        options: ['usePrevious', 'useState', 'useEffect', 'None of the above (must handle manually)'],
        correctAnswer: 'None of the above (must handle manually)'
      }
    ]
  },
  {
    subject: 'Node.js',
    title: 'Node.js Backend Architecture',
    description: 'Explore the internal workings of Node.js, event loops, and non-blocking I/O.',
    difficulty: 'Advanced',
    iconColor: '#43853d',
    authorName: 'Node Overlord',
    questions: [
      {
        questionText: 'Which internal Node.js module handles the Event Loop?',
        options: ['V8 Engine', 'Libuv', 'OpenSSL', 'Zlib'],
        correctAnswer: 'Libuv'
      },
      {
        questionText: 'What does the "path.join()" method do?',
        options: ['Joins two files together', 'Combines segments into a path string', 'Deletes a path', 'Splits a path into segments'],
        correctAnswer: 'Combines segments into a path string'
      }
    ]
  }
];

async function seedDatabase() {
  try {
    console.log('📡 Connecting to MongoDB for seeding...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.');

    // Clear existing quizzes (optional, but requested "dedicated" cards)
    console.log('🧹 Clearing old quizzes...');
    await Quiz.deleteMany({});

    console.log('🌱 Seeding MERN Quizzes...');
    await Quiz.insertMany(mernQuizzes);

    console.log('✨ Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  }
}

seedDatabase();
