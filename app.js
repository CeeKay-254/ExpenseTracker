require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cookieParser = require('cookie-parser'); // Add this line
const app = express();
const port = process.env.PORT || 3000;

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    process.exit(1); // Exit the process if the database connection fails
  }
  console.log('Connected to MySQL database!');
});

const sessionStore = new MySQLStore({}, connection);

app.use(cookieParser()); // Add this line
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  key: 'user_sid',
  secret: 'your_secret_key', // Change this to your secret key
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

app.use((req, res, next) => {
  if (req.cookies && req.cookies.user_sid && !req.session.user) {
    res.clearCookie('user_sid');
  }
  next();
});

const sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    res.redirect('/manage-expenses.html');
  } else {
    next();
  }
};

const ensureAuthenticated = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    next();
  } else {
    res.redirect('/login.html');
  }
};

// Serve static files from the "public" directory
app.use(express.static('public'));

// Registration route
app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ success: false, message: 'Username, password, and email are required' });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
    connection.query(query, [username, hashedPassword, email], (err) => {
      if (err) {
        console.error('Error registering user:', err);
        return res.status(500).json({ success: false, message: 'An error occurred during registration' });
      }

      res.status(201).json({ success: true, message: 'Registration successful' });
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ success: false, message: 'An error occurred during registration' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  const query = 'SELECT id, password FROM users WHERE username = ?';
  connection.query(query, [username], async (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const user = results[0];
    try {
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (isValidPassword) {
        req.session.user = { id: user.id }; // Save user id in session
        res.status(200).json({ success: true, message: 'Login successful' });
      } else {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
    } catch (compareError) {
      console.error('Error comparing passwords:', compareError);
      res.status(500).json({ success: false, message: 'Error during password comparison' });
    }
  });
});

// Logout route
app.get('/logout', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.clearCookie('user_sid');
    req.session.destroy((err) => {
      if (err) {
        console.error('Error during logout:', err);
        return res.status(500).json({ success: false, message: 'Logout error' });
      }
      res.redirect('/login.html');
    });
  } else {
    res.redirect('/login.html');
  }
});

// Serve the main page
app.get('/', sessionChecker, (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Route to add an expense
app.post('/expenses', ensureAuthenticated, (req, res) => {
  const { description, amount, date, category } = req.body;
  const userId = req.session.user.id;

  if (!description || !amount || !date || !category) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const query = 'INSERT INTO expenses (user_id, description, amount, date, category) VALUES (?, ?, ?, ?, ?)';
  connection.query(query, [userId, description, amount, date, category], (err) => {
    if (err) {
      console.error('Error adding expense:', err);
      return res.status(500).json({ success: false, message: 'Error adding expense' });
    }

    res.status(201).json({ success: true, message: 'Expense added successfully' });
  });
});

// Route to get expenses for a specific user
app.get('/expenses/:userId', ensureAuthenticated, (req, res) => {
  const userId = req.params.userId;
  const query = 'SELECT * FROM expenses WHERE user_id = ?';
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching expenses:', err);
      res.status(500).json({ success: false, message: 'Error fetching expenses' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Route to delete an expense
app.delete('/expenses/:id', ensureAuthenticated, (req, res) => {
  const expenseId = req.params.id;
  const userId = req.session.user.id;

  const query = 'DELETE FROM expenses WHERE id = ? AND user_id = ?';
  connection.query(query, [expenseId, userId], (err, result) => {
    if (err) {
      console.error('Error deleting expense:', err);
      res.status(500).json({ success: false, message: 'Error deleting expense' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Expense not found or not authorized' });
    } else {
      res.status(200).json({ success: true, message: 'Expense deleted successfully' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
