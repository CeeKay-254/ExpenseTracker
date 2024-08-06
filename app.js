const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();
const port = process.env.PORT || 3000;

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Genny@800',
  database: 'expense_tracker'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    process.exit(1); // Exit the process if the database connection fails
  }
  console.log('Connected to MySQL database!');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
        const ipAddress = req.ip;

        const loginQuery = 'INSERT INTO login_history (user_id, ip_address) VALUES (?, ?)';
        connection.query(loginQuery, [user.id, ipAddress], (err) => {
          if (err) {
            console.error('Error recording login history:', err);
            return res.status(500).json({ success: false, message: 'Error recording login history' });
          }

          console.log('Login history recorded successfully.');
          res.status(200).json({ success: true, message: 'Login successful' });
        });
      } else {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
    } catch (compareError) {
      console.error('Error comparing passwords:', compareError);
      res.status(500).json({ success: false, message: 'Error during password comparison' });
    }
  });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Route to add an expense
app.post('/expenses', (req, res) => {
  const { userId, description, amount, date, category } = req.body;

  if (!userId || !description || !amount || !date || !category) {
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
app.get('/expenses/:userId', (req, res) => {
  const userId = req.params.userId;
  const query = 'SELECT * FROM expenses WHERE user_id = ?';
  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching expenses:', err);
      res.status(500).json({ message: 'Error fetching expenses' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Route to delete an expense
app.delete('/expenses/:id', (req, res) => {
  const expenseId = req.params.id;
  const query = 'DELETE FROM expenses WHERE id = ?';
  connection.query(query, [expenseId], (err, result) => {
    if (err) {
      console.error('Error deleting expense:', err);
      res.status(500).json({ message: 'Error deleting expense' });
    } else {
      res.status(200).json({ message: 'Expense deleted successfully' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
