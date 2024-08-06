const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const port = process.env.PORT || 3000;
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Genny@800',
  database: 'expense_tracker'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database!');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Define your routes here

app.post('/auth/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Store the hashed password in your database
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    connection.query(query, [username, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ error: 'An error occurred during registration' });
      } else {
        res.json({ message: 'Registration successful' });
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred during registration' });
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT id, password FROM users WHERE username = ?';
  connection.query(query, [username], async (err, result) => {
    if (err) {
      console.error('Error logging in:', err);
      res.status(500).json({ message: 'Error logging in' });
    } else if (result.length > 0) {
      const userId = result[0].id;
      const hashedPassword = result[0].password;

      const isValidPassword = await bcrypt.compare(password, hashedPassword);
      if (isValidPassword) {
        const ipAddress = req.connection.remoteAddress; // Get the user's IP address

        const loginQuery = 'INSERT INTO login_history (user_id, ip_address) VALUES (?, ?)';
        connection.query(loginQuery, [userId, ipAddress], (err, result) => {
          if (err) {
            if (err.code === 'ER_NO_DEFAULT_FOR_FIELD') {
              // Handle the "Field 'ip_address' doesn't have a default value" error
              console.error('Error logging in:', err);
              res.status(500).json({ message: 'An error occurred while logging in.' });
            } else {
              console.error('Error logging in:', err);
              res.status(500).json({ message: 'An error occurred while logging in.' });
            }
          } else {
            console.log('Login history recorded successfully.');
            res.status(200).json({ message: 'Login successful' });
          }
        });
      } else {
        res.status(401).json({ message: 'Invalid username or password' });
      }
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  });
});

app.post('/register', (req, res) => {
  const { username, password, email } = req.body;
  const query = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
  connection.query(query, [username, password, email], (err, result) => {
    if (err) {
      console.error('Error registering user:', err);
      res.status(500).json({ message: 'Error registering user' });
    } else {
      res.status(201).json({ message: 'User registered successfully' });
    }
  });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Expense tracking
app.post('/expenses', (req, res) => {
  const { userId, description, amount, date } = req.body;
  const query = 'INSERT INTO expenses (user_id, description, amount, date) VALUES (?, ?, ?, ?)';
  connection.query(query, [userId, description, amount, date], (err, result) => {
    if (err) {
      console.error('Error adding expense:', err);
      res.status(500).json({ message: 'Error adding expense' });
    } else {
      res.status(201).json({ message: 'Expense added successfully' });
    }
  });
});

// API endpoint to add a new expense
app.post('/api/expenses', (req, res) => {
  try {
    const { name, amount, description, date } = req.body;

    // Save the expense data to your database
    saveExpenseToDatabase(name, amount, description, date);

    res.status(200).json({ message: 'Expense added successfully' });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// Helper function to save the expense to the database
function saveExpenseToDatabase(name, amount, description, date) {
  // Implement your database logic here
  console.log('Saving expense to the database:', { name, amount, description, date });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});