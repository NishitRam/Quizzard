/**
 * ─────────────────────────────────────────────────────────────────
 * Quizzard - Curated MERN Stack Question Bank
 * 
 * Structure: Each question has:
 *   - question (string)
 *   - options   (array of 4 strings)
 *   - correctAnswer (string, must match one of options exactly)
 *   - topic     ('mongodb' | 'express' | 'react' | 'node' | 'js')
 *   - difficulty ('easy' | 'medium' | 'hard')
 * ─────────────────────────────────────────────────────────────────
 */
const MERN_QUESTIONS = [

  // ─────────────────────────────────────────────────────────────
  // MONGODB
  // ─────────────────────────────────────────────────────────────
  {
    question: "What does MongoDB stand for?",
    options: ["Massive Data Base", "Humongous Database", "Multi-Object Relational DB", "None of the above"],
    correctAnswer: "Humongous Database",
    topic: "mongodb", difficulty: "easy"
  },
  {
    question: "Which format does MongoDB use to store data?",
    options: ["XML", "CSV", "BSON", "JSON-Schema"],
    correctAnswer: "BSON",
    topic: "mongodb", difficulty: "easy"
  },
  {
    question: "What is the equivalent of a 'table' in MongoDB?",
    options: ["Document", "Collection", "Schema", "Row"],
    correctAnswer: "Collection",
    topic: "mongodb", difficulty: "easy"
  },
  {
    question: "Which MongoDB method is used to read all documents?",
    options: ["findAll()", "find()", "getAll()", "select()"],
    correctAnswer: "find()",
    topic: "mongodb", difficulty: "easy"
  },
  {
    question: "By default, MongoDB runs on which port?",
    options: ["3000", "5432", "27017", "3306"],
    correctAnswer: "27017",
    topic: "mongodb", difficulty: "easy"
  },
  {
    question: "Which operator is used for partial text matches in MongoDB?",
    options: ["$match", "$regex", "$search", "$text"],
    correctAnswer: "$regex",
    topic: "mongodb", difficulty: "medium"
  },
  {
    question: "What does the $lookup aggregation stage do?",
    options: ["Finds a document by ID", "Performs a left outer join", "Sorts documents", "Groups documents"],
    correctAnswer: "Performs a left outer join",
    topic: "mongodb", difficulty: "medium"
  },
  {
    question: "What is Mongoose in the MERN stack?",
    options: ["A MongoDB GUI tool", "A Node.js ORM/ODM for MongoDB", "A REST API library", "A database testing tool"],
    correctAnswer: "A Node.js ORM/ODM for MongoDB",
    topic: "mongodb", difficulty: "medium"
  },
  {
    question: "Which aggregation stage is used to filter documents based on conditions?",
    options: ["$group", "$filter", "$match", "$where"],
    correctAnswer: "$match",
    topic: "mongodb", difficulty: "medium"
  },
  {
    question: "How do you create a unique index in Mongoose schema?",
    options: ["{ index: true }", "{ unique: true }", "{ primary: true }", "{ distinct: true }"],
    correctAnswer: "{ unique: true }",
    topic: "mongodb", difficulty: "medium"
  },
  {
    question: "What is the purpose of MongoDB's `_id` field?",
    options: ["Human-readable identifier", "Auto-incremented integer", "Unique document identifier (ObjectId)", "Foreign key reference"],
    correctAnswer: "Unique document identifier (ObjectId)",
    topic: "mongodb", difficulty: "hard"
  },
  {
    question: "What does a Mongoose 'virtual' field do?",
    options: ["Stores data in a separate collection", "Computes properties not stored in DB", "Creates an index", "Validates schema fields"],
    correctAnswer: "Computes properties not stored in DB",
    topic: "mongodb", difficulty: "hard"
  },
  {
    question: "In MongoDB, what does 'sharding' accomplish?",
    options: ["Encrypts data at rest", "Distributes data across multiple servers", "Backs up data automatically", "Compresses documents"],
    correctAnswer: "Distributes data across multiple servers",
    topic: "mongodb", difficulty: "hard"
  },
  {
    question: "What is the difference between $push and $addToSet in MongoDB?",
    options: [
      "$push allows duplicates, $addToSet does not",
      "$addToSet allows duplicates, $push does not",
      "They are identical operators",
      "$push works on objects, $addToSet on arrays"
    ],
    correctAnswer: "$push allows duplicates, $addToSet does not",
    topic: "mongodb", difficulty: "hard"
  },

  // ─────────────────────────────────────────────────────────────
  // EXPRESS.JS
  // ─────────────────────────────────────────────────────────────
  {
    question: "What is Express.js?",
    options: ["A database system", "A minimal Node.js web framework", "A frontend library", "A CSS preprocessor"],
    correctAnswer: "A minimal Node.js web framework",
    topic: "express", difficulty: "easy"
  },
  {
    question: "Which function handles GET requests in Express?",
    options: ["app.post()", "app.get()", "app.set()", "app.use()"],
    correctAnswer: "app.get()",
    topic: "express", difficulty: "easy"
  },
  {
    question: "How do you start an Express server on port 5000?",
    options: ["app.start(5000)", "app.run(5000)", "app.listen(5000)", "server.open(5000)"],
    correctAnswer: "app.listen(5000)",
    topic: "express", difficulty: "easy"
  },
  {
    question: "What does `req.body` contain?",
    options: ["URL path parameters", "Query string values", "Data sent in the request body", "Response headers"],
    correctAnswer: "Data sent in the request body",
    topic: "express", difficulty: "easy"
  },
  {
    question: "Which middleware is needed to parse JSON in Express?",
    options: ["app.use(body-parser)", "app.use(express.json())", "app.use(express.text())", "app.use(express.form())"],
    correctAnswer: "app.use(express.json())",
    topic: "express", difficulty: "easy"
  },
  {
    question: "What does the 'next()' function do in Express middleware?",
    options: ["Stops the request", "Calls the next middleware in line", "Restarts the server", "Returns a response"],
    correctAnswer: "Calls the next middleware in line",
    topic: "express", difficulty: "medium"
  },
  {
    question: "How do you access URL parameters in Express (e.g. /users/:id)?",
    options: ["req.query.id", "req.params.id", "req.body.id", "req.url.id"],
    correctAnswer: "req.params.id",
    topic: "express", difficulty: "medium"
  },
  {
    question: "What does `express.Router()` provide?",
    options: ["A mini Express app for modular routing", "A connection to MongoDB", "A JSON parsing utility", "A session manager"],
    correctAnswer: "A mini Express app for modular routing",
    topic: "express", difficulty: "medium"
  },
  {
    question: "How do you handle errors in Express middleware?",
    options: [
      "Using try/catch only",
      "A middleware with 4 params: (err, req, res, next)",
      "By calling next() with no arguments",
      "Using app.catch()"
    ],
    correctAnswer: "A middleware with 4 params: (err, req, res, next)",
    topic: "express", difficulty: "medium"
  },
  {
    question: "What is CORS and why is it needed in Express?",
    options: [
      "A database protocol; needed for MongoDB connections",
      "A browser security policy; needed to allow cross-origin requests",
      "A compression algorithm; needed for performance",
      "A caching mechanism; needed for speed"
    ],
    correctAnswer: "A browser security policy; needed to allow cross-origin requests",
    topic: "express", difficulty: "medium"
  },
  {
    question: "What is the purpose of `res.status(404).json({...})`?",
    options: ["Sets a cookie and returns JSON", "Sends a JSON response with a 404 status code", "Redirects to a 404 page", "Logs a 404 error to the console"],
    correctAnswer: "Sends a JSON response with a 404 status code",
    topic: "express", difficulty: "hard"
  },
  {
    question: "What does the `helmet` middleware do in Express?",
    options: ["Compresses HTTP responses", "Sets security-related HTTP headers", "Manages authentication sessions", "Parses multipart form data"],
    correctAnswer: "Sets security-related HTTP headers",
    topic: "express", difficulty: "hard"
  },
  {
    question: "What is rate limiting in Express and why is it used?",
    options: [
      "Limits database query size; used to reduce I/O",
      "Limits the number of requests per time window; used to prevent abuse",
      "Limits middleware stack size; used for performance",
      "Limits response body size; used for bandwidth control"
    ],
    correctAnswer: "Limits the number of requests per time window; used to prevent abuse",
    topic: "express", difficulty: "hard"
  },

  // ─────────────────────────────────────────────────────────────
  // REACT
  // ─────────────────────────────────────────────────────────────
  {
    question: "What is JSX in React?",
    options: ["A JavaScript extension for writing HTML-like syntax", "A styling library", "A state management tool", "A backend framework"],
    correctAnswer: "A JavaScript extension for writing HTML-like syntax",
    topic: "react", difficulty: "easy"
  },
  {
    question: "Which hook manages local state in a functional component?",
    options: ["useEffect", "useContext", "useRef", "useState"],
    correctAnswer: "useState",
    topic: "react", difficulty: "easy"
  },
  {
    question: "How are props passed to a child component?",
    options: ["Via global variables", "Via HTML attributes in JSX", "Via localStorage", "Via URL parameters"],
    correctAnswer: "Via HTML attributes in JSX",
    topic: "react", difficulty: "easy"
  },
  {
    question: "What does the Virtual DOM do?",
    options: ["Stores cookies", "Provides a lightweight representation of the real DOM", "Manages server state", "Encrypts API calls"],
    correctAnswer: "Provides a lightweight representation of the real DOM",
    topic: "react", difficulty: "easy"
  },
  {
    question: "Which method triggers a re-render in a class component?",
    options: ["this.refresh()", "this.render()", "this.setState()", "this.update()"],
    correctAnswer: "this.setState()",
    topic: "react", difficulty: "easy"
  },
  {
    question: "Which hook performs side effects like data fetching?",
    options: ["useState", "useEffect", "useContext", "useCallback"],
    correctAnswer: "useEffect",
    topic: "react", difficulty: "medium"
  },
  {
    question: "What is the purpose of the `key` prop in a list?",
    options: ["To encrypt list items", "To help React identify which items have changed", "To apply CSS styles", "To sort list items"],
    correctAnswer: "To help React identify which items have changed",
    topic: "react", difficulty: "medium"
  },
  {
    question: "What does React.memo() do?",
    options: ["Creates a global variable", "Memoizes a component to prevent unnecessary re-renders", "Fetches data asynchronously", "Creates a context"],
    correctAnswer: "Memoizes a component to prevent unnecessary re-renders",
    topic: "react", difficulty: "medium"
  },
  {
    question: "What is the Context API used for?",
    options: ["REST API calls", "Sharing state globally without prop drilling", "Database connections", "Server-side rendering"],
    correctAnswer: "Sharing state globally without prop drilling",
    topic: "react", difficulty: "medium"
  },
  {
    question: "What does useCallback() do?",
    options: ["Caches the result of a computation", "Returns a memoized callback function", "Creates a ref object", "Manages async state"],
    correctAnswer: "Returns a memoized callback function",
    topic: "react", difficulty: "medium"
  },
  {
    question: "What does React.lazy() enable?",
    options: ["Slow rendering for animations", "Code splitting for lazy-loaded components", "Backend lazy evaluation", "CSS lazy loading"],
    correctAnswer: "Code splitting for lazy-loaded components",
    topic: "react", difficulty: "hard"
  },
  {
    question: "What is the significance of the dependency array in useEffect?",
    options: [
      "It defines which variables to encrypt",
      "It controls when the effect re-runs",
      "It specifies which props to accept",
      "It lists all state variables"
    ],
    correctAnswer: "It controls when the effect re-runs",
    topic: "react", difficulty: "hard"
  },
  {
    question: "What is the purpose of useReducer()?",
    options: [
      "To reduce array lengths",
      "To handle complex state logic as an alternative to useState",
      "To compress component trees",
      "To batch API calls"
    ],
    correctAnswer: "To handle complex state logic as an alternative to useState",
    topic: "react", difficulty: "hard"
  },
  {
    question: "What does reconciliation mean in React?",
    options: [
      "Saving state to localStorage",
      "The process of diffing the Virtual DOM to update the real DOM efficiently",
      "Merging two React apps",
      "Combining client and server components"
    ],
    correctAnswer: "The process of diffing the Virtual DOM to update the real DOM efficiently",
    topic: "react", difficulty: "hard"
  },

  // ─────────────────────────────────────────────────────────────
  // NODE.JS
  // ─────────────────────────────────────────────────────────────
  {
    question: "What is Node.js?",
    options: ["A frontend CSS framework", "A JavaScript runtime built on Chrome's V8 engine", "A database", "A testing framework"],
    correctAnswer: "A JavaScript runtime built on Chrome's V8 engine",
    topic: "node", difficulty: "easy"
  },
  {
    question: "What does NPM stand for?",
    options: ["Node Project Manager", "Node Package Manager", "New Program Module", "Network Protocol Manager"],
    correctAnswer: "Node Package Manager",
    topic: "node", difficulty: "easy"
  },
  {
    question: "Which built-in module is used to create a web server?",
    options: ["fs", "path", "http", "os"],
    correctAnswer: "http",
    topic: "node", difficulty: "easy"
  },
  {
    question: "What is the purpose of the `fs` module in Node.js?",
    options: ["Formatting strings", "File system operations (read, write, delete)", "Fetch API requests", "Form state management"],
    correctAnswer: "File system operations (read, write, delete)",
    topic: "node", difficulty: "easy"
  },
  {
    question: "What does `process.env` give you access to?",
    options: ["Browser cookies", "Environment variables", "Database connections", "OS memory usage"],
    correctAnswer: "Environment variables",
    topic: "node", difficulty: "easy"
  },
  {
    question: "What is the Event Loop in Node.js?",
    options: [
      "A while loop that runs forever",
      "A mechanism that handles asynchronous operations in a non-blocking way",
      "A scheduler for background jobs",
      "A timer-based function"
    ],
    correctAnswer: "A mechanism that handles asynchronous operations in a non-blocking way",
    topic: "node", difficulty: "medium"
  },
  {
    question: "What does `module.exports` do in Node.js?",
    options: ["Imports a module", "Exports code to be used in other files", "Deletes a module from memory", "Installs an npm package"],
    correctAnswer: "Exports code to be used in other files",
    topic: "node", difficulty: "medium"
  },
  {
    question: "What is the difference between `require()` and `import`?",
    options: [
      "They are identical",
      "`require()` is CommonJS (synchronous); `import` is ES Module (static)",
      "`import` is CommonJS; `require()` is ES Module",
      "`require()` only works for JSON files"
    ],
    correctAnswer: "`require()` is CommonJS (synchronous); `import` is ES Module (static)",
    topic: "node", difficulty: "medium"
  },
  {
    question: "Which library handles environment variables via .env files in Node.js?",
    options: ["env-loader", "dotenv", "config", "process-env"],
    correctAnswer: "dotenv",
    topic: "node", difficulty: "medium"
  },
  {
    question: "What is the purpose of `__dirname` in Node.js?",
    options: [
      "The current user's home directory",
      "The absolute path of the current file's directory",
      "The root of the project",
      "The directory of the installed node_modules"
    ],
    correctAnswer: "The absolute path of the current file's directory",
    topic: "node", difficulty: "medium"
  },
  {
    question: "What is a 'stream' in Node.js?",
    options: [
      "A video streaming protocol",
      "A way to handle continuous data flows (readable/writable) efficiently",
      "A synchronous data buffer",
      "A network socket API"
    ],
    correctAnswer: "A way to handle continuous data flows (readable/writable) efficiently",
    topic: "node", difficulty: "hard"
  },
  {
    question: "What is the libuv library responsible for in Node.js?",
    options: ["Parsing JavaScript", "Managing the Event Loop and async I/O", "Handling HTTP headers", "Compiling TypeScript"],
    correctAnswer: "Managing the Event Loop and async I/O",
    topic: "node", difficulty: "hard"
  },
  {
    question: "What is a memory leak in Node.js and how can you detect it?",
    options: [
      "When memory allocated is never freed; detected with heap snapshots",
      "When variables are undefined; detected with linting",
      "When the server crashes; detected with error logs",
      "When npm packages are outdated; detected with npm audit"
    ],
    correctAnswer: "When memory allocated is never freed; detected with heap snapshots",
    topic: "node", difficulty: "hard"
  },

  // ─────────────────────────────────────────────────────────────
  // JAVASCRIPT
  // ─────────────────────────────────────────────────────────────
  {
    question: "What is the difference between `let` and `var`?",
    options: [
      "`let` is function-scoped; `var` is block-scoped",
      "`let` is block-scoped; `var` is function-scoped",
      "They are the same",
      "`let` is for numbers; `var` is for strings"
    ],
    correctAnswer: "`let` is block-scoped; `var` is function-scoped",
    topic: "js", difficulty: "easy"
  },
  {
    question: "What does `===` do in JavaScript?",
    options: ["Assignment", "Loose equality (type coercion)", "Strict equality (no type coercion)", "Logical AND"],
    correctAnswer: "Strict equality (no type coercion)",
    topic: "js", difficulty: "easy"
  },
  {
    question: "What is an arrow function?",
    options: [
      "A function that runs automatically",
      "A shorter function syntax that doesn't bind its own `this`",
      "A function that returns an array",
      "A function stored in a variable only"
    ],
    correctAnswer: "A shorter function syntax that doesn't bind its own `this`",
    topic: "js", difficulty: "easy"
  },
  {
    question: "What does `Array.map()` do?",
    options: ["Filters an array", "Reduces an array to a single value", "Creates a new array by transforming each element", "Sorts the array"],
    correctAnswer: "Creates a new array by transforming each element",
    topic: "js", difficulty: "easy"
  },
  {
    question: "What is a Promise in JavaScript?",
    options: [
      "A guaranteed function call",
      "An object representing an eventual success or failure of an async operation",
      "A class for storing reusable data",
      "A built-in HTTP client"
    ],
    correctAnswer: "An object representing an eventual success or failure of an async operation",
    topic: "js", difficulty: "easy"
  },
  {
    question: "What does `async/await` do?",
    options: [
      "Makes synchronous code run in parallel",
      "Provides syntactic sugar for Promises, making async code look synchronous",
      "Delays code execution by a fixed amount",
      "Creates background web workers"
    ],
    correctAnswer: "Provides syntactic sugar for Promises, making async code look synchronous",
    topic: "js", difficulty: "medium"
  },
  {
    question: "What is destructuring in JavaScript?",
    options: [
      "Breaking apart HTML elements",
      "Extracting values from arrays or properties from objects into variables",
      "Deleting object keys",
      "Converting a string to an array"
    ],
    correctAnswer: "Extracting values from arrays or properties from objects into variables",
    topic: "js", difficulty: "medium"
  },
  {
    question: "What is the spread operator (...) used for?",
    options: [
      "Multiplying values",
      "Spreading elements of an iterable into a new array or object",
      "Creating generators",
      "Assigning default values"
    ],
    correctAnswer: "Spreading elements of an iterable into a new array or object",
    topic: "js", difficulty: "medium"
  },
  {
    question: "What is event bubbling in JavaScript?",
    options: [
      "When a click event triggers an animation",
      "When an event propagates from the target element up through the DOM",
      "When two events fire simultaneously",
      "When an event is cancelled by the browser"
    ],
    correctAnswer: "When an event propagates from the target element up through the DOM",
    topic: "js", difficulty: "medium"
  },
  {
    question: "What does `localStorage.setItem()` do?",
    options: [
      "Saves data to a database",
      "Stores a key-value pair in browser storage that persists across sessions",
      "Uploads a file to the server",
      "Creates a server-side session"
    ],
    correctAnswer: "Stores a key-value pair in browser storage that persists across sessions",
    topic: "js", difficulty: "medium"
  },
  {
    question: "What is a closure in JavaScript?",
    options: [
      "A method to close a browser window",
      "A function that retains access to its outer scope even after execution",
      "A way to terminate an event listener",
      "An error-catching mechanism"
    ],
    correctAnswer: "A function that retains access to its outer scope even after execution",
    topic: "js", difficulty: "hard"
  },
  {
    question: "What is the prototype chain in JavaScript?",
    options: [
      "A linked list of middleware in Express",
      "The mechanism by which objects inherit from other objects",
      "A sequence of Promises chained with .then()",
      "The order in which modules are loaded"
    ],
    correctAnswer: "The mechanism by which objects inherit from other objects",
    topic: "js", difficulty: "hard"
  },
  {
    question: "What is the difference between `null` and `undefined`?",
    options: [
      "They are identical",
      "`null` is intentional absence of value; `undefined` means a variable hasn't been assigned",
      "`undefined` is for objects; `null` is for primitives",
      "`null` causes errors; `undefined` does not"
    ],
    correctAnswer: "`null` is intentional absence of value; `undefined` means a variable hasn't been assigned",
    topic: "js", difficulty: "hard"
  },
  {
    question: "What does the `Symbol` type do in JavaScript?",
    options: [
      "Creates unique, immutable values typically used as object property keys",
      "Represents a mathematical constant",
      "Imports SVG symbols into JavaScript",
      "Defines regex pattern symbols"
    ],
    correctAnswer: "Creates unique, immutable values typically used as object property keys",
    topic: "js", difficulty: "hard"
  },
  
  // ─────────────────────────────────────────────────────────────
  // SQL & DATABASES
  // ─────────────────────────────────────────────────────────────
  {
    question: "What does SQL stand for?",
    options: ["Structured Query Language", "Strong Question Language", "Simple Query List", "System Query Level"],
    correctAnswer: "Structured Query Language",
    topic: "sql", difficulty: "easy"
  },
  {
    question: "Which SQL statement is used to extract data from a database?",
    options: ["GET", "OPEN", "SELECT", "EXTRACT"],
    correctAnswer: "SELECT",
    topic: "sql", difficulty: "easy"
  },
  {
    question: "Which SQL statement is used to update data in a database?",
    options: ["SAVE", "UPDATE", "MODIFY", "CHANGE"],
    correctAnswer: "UPDATE",
    topic: "sql", difficulty: "easy"
  },
  {
    question: "Which SQL statement is used to delete data from a database?",
    options: ["REMOVE", "COLLAPSE", "DELETE", "DROP"],
    correctAnswer: "DELETE",
    topic: "sql", difficulty: "easy"
  },
  {
    question: "Which SQL statement is used to insert new data in a database?",
    options: ["ADD NEW", "INSERT INTO", "ADD RECORD", "NEW RECORD"],
    correctAnswer: "INSERT INTO",
    topic: "sql", difficulty: "easy"
  },
  {
    question: "With SQL, how do you select all columns from a table named 'Persons'?",
    options: ["SELECT Persons", "SELECT * FROM Persons", "SELECT [all] FROM Persons", "SELECT *.Persons"],
    correctAnswer: "SELECT * FROM Persons",
    topic: "sql", difficulty: "easy"
  },
  {
    question: "How do you select all records from 'Persons' where 'FirstName' is 'Peter'?",
    options: ["SELECT * FROM Persons WHERE FirstName='Peter'", "SELECT * FROM Persons WHERE FirstName LIKE 'Peter'", "SELECT [all] FROM Persons WHERE FirstName='Peter'", "SELECT * FROM Persons LIKE FirstName='Peter'"],
    correctAnswer: "SELECT * FROM Persons WHERE FirstName='Peter'",
    topic: "sql", difficulty: "medium"
  },
  {
    question: "Which SQL keyword is used to sort the result-set?",
    options: ["ORDER BY", "SORT BY", "ALIGN BY", "GROUP BY"],
    correctAnswer: "ORDER BY",
    topic: "sql", difficulty: "medium"
  },
  {
    question: "How can you return all records from 'Persons' sorted descending by 'FirstName'?",
    options: ["SELECT * FROM Persons ORDER BY FirstName DESC", "SELECT * FROM Persons SORT BY FirstName DESC", "SELECT * FROM Persons ORDER FirstName DESC", "SELECT * FROM Persons SORT DESC"],
    correctAnswer: "SELECT * FROM Persons ORDER BY FirstName DESC",
    topic: "sql", difficulty: "medium"
  },
  {
    question: "What is a JOIN in SQL?",
    options: ["Combining rows from two or more tables based on a related column", "Connecting to a database", "Optimizing a query", "Creating a new table"],
    correctAnswer: "Combining rows from two or more tables based on a related column",
    topic: "sql", difficulty: "medium"
  },
  {
    question: "Which JOIN returns all records when there is a match in either left or right table?",
    options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
    correctAnswer: "FULL OUTER JOIN",
    topic: "sql", difficulty: "hard"
  },
  {
    question: "What is an INDEX in a database?",
    options: ["A backup copy", "A performance-tuning tool that speeds up data retrieval", "A primary key", "A database schema"],
    correctAnswer: "A performance-tuning tool that speeds up data retrieval",
    topic: "sql", difficulty: "hard"
  },
  {
    question: "What does ACID stand for in databases?",
    options: [
      "Atomicity, Consistency, Isolation, Durability",
      "Accuracy, Control, Integration, Design",
      "Access, Connectivity, Indexing, Data",
      "Active, Collaborative, Integrated, Distributed"
    ],
    correctAnswer: "Atomicity, Consistency, Isolation, Durability",
    topic: "sql", difficulty: "hard"
  },
  {
    question: "What is Normalization?",
    options: [
      "Process of organizing data to reduce redundancy",
      "Converting data to strings",
      "Creating backups",
      "Scaling a database horizontally"
    ],
    correctAnswer: "Process of organizing data to reduce redundancy",
    topic: "sql", difficulty: "hard"
  }
];

module.exports = MERN_QUESTIONS;
