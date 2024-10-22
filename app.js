const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

// Create an Express app
const app = express();

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Body parser middleware to handle POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure MySQL connection
const db = mysql.createConnection({
  host: 'mydb.crgk0smao6ui.us-east-1.rds.amazonaws.com', // Your AWS RDS endpoint
  user: 'admin',
  password: 'mahesh100',
  database: 'mydb'
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
  } else {
    console.log('Connected to AWS RDS MySQL database.');
  }
});

// Route to serve the index.html (home page)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Adjust path to index.html
});

// Route to serve the feedbackData.html
app.get('/feedback-data', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'feedbackData.html')); // Adjust path to feedbackData.html
});

// Route to handle feedback form submission
app.post('/feedback', (req, res) => {
  const { name, email, review } = req.body;

  // Ensure the input data is present
  if (!name || !email || !review) {
    return res.status(400).json({ message: 'Please provide all the required fields.' });
  }

  // Insert feedback into the MySQL database
  const sql = 'INSERT INTO feedback (name, email, review) VALUES (?, ?, ?)';
  db.query(sql, [name, email, review], (err, result) => {
    if (err) {
      console.error('Error submitting feedback:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.status(200).json({ message: 'Feedback submitted successfully!' });
  });
});

// Route to fetch feedback data from the database
app.get('/getFeedbackData', (req, res) => {
  const sql = 'SELECT * FROM feedback ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching feedback:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.status(200).json(results);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} : http://localhost:${PORT}`);
});
