const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path'); // Added for serving static files
const app = express();
const port = 5000;
// Middleware
app.use(bodyParser.json());
app.use(cors());
// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));
// MySQL Connection
const db = mysql.createConnection({
 host: 'localhost',
 user: 'root', // Replace with your MySQL username
 password: 'Chennai*4321', // Replace with your MySQL password
 database: 'evolveai_auth', // Use the auth database
});
db.connect((err) => {
 if (err) {
 console.error('Error connecting to MySQL:', err);
 return;
 }
 console.log('Connected to MySQL database');
});
// Right after db.connect()
db.query('SELECT 1 + 1 AS solution', (err, results) => {
  if (err) throw err;
  console.log('Database test query result:', results[0].solution);
});
// Signup Endpoint
app.post('/signup', async (req, res) => {
 const { email, password, name } = req.body;
 // Validate input
 if (!email || !password || !name) {
 return res.status(400).json({ message: 'All fields are required'
});
 }
 try {
 // Hash the password
 const salt = await bcrypt.genSalt(10);
 const hashedPassword = await bcrypt.hash(password, salt);
 const query = `
 INSERT INTO users (email, password, name)
 VALUES (?, ?, ?)
 `;
 db.query(query, [email, hashedPassword, name], (err, result) => {
 if (err) {
 console.error('Error signing up:', err);

 // Check for duplicate email
 if (err.code === 'ER_DUP_ENTRY') {
 return res.status(409).json({ message: 'Email already in use'
});
 }

 return res.status(500).json({ message: 'Error signing up' });
 }

 console.log('User signed up:', result);
 res.status(201).json({ message: 'Signup successful' });
 });
 } catch (error) {
 console.error('Error hashing password:', error);
 res.status(500).json({ message: 'Server error' });
 }
});
// Login Endpoint
app.post('/login', async (req, res) => {
 const { email, password } = req.body;
 const query = `
 SELECT * FROM users WHERE email = ?
 `;
 db.query(query, [email], async (err, result) => {
 if (err) {
 console.error('Error logging in:', err);
 return res.status(500).json({ message: 'Error logging in' });
 }
 if (result.length === 0) {
 return res.status(404).json({ message: 'User not found' });
 }
 // Compare hashed password
 const user = result[0];
 const isPasswordValid = await bcrypt.compare(password,
user.password);
 if (!isPasswordValid) {
 return res.status(401).json({ message: 'Invalid password' });
 }
 console.log('User logged in:', user);
 res.status(200).json({ message: 'Login successful', userId: user.id
});
 });
});
// Start Server
app.listen(port, () => {
 console.log(`Server running on http://localhost:${port}`);
});
// Add these to your server.js

// Get user data
app.get('/user/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      
      // Get user habits
      const habitsQuery = 'SELECT * FROM habits WHERE user_id = ?';
      const [habits] = await db.promise().query(habitsQuery, [userId]);
      
      // Get user stats
      const statsQuery = 'SELECT * FROM user_stats WHERE user_id = ?';
      const [statsRows] = await db.promise().query(statsQuery, [userId]);
      const stats = statsRows[0] || {
        points: 0,
        current_streak: 0,
        level: 1,
        xp: 0,
        xp_to_next_level: 100
      };
  
      res.json({
        habits,
        stats: {
          points: stats.points,
          currentStreak: stats.current_streak,
          level: stats.level,
          xp: stats.xp,
          xpToNextLevel: stats.xp_to_next_level
        }
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ message: 'Error fetching user data' });
    }
  });
  
  // Update habit completion
  app.put('/habits/:habitId', async (req, res) => {
    try {
      const { completed, userId } = req.body;
      const habitId = req.params.habitId;
      
      // Update habit in database
      // Add your database update logic here
      
      // Update user stats
      // Add your stats calculation logic here
      
      res.json({
        updatedHabit: { /* updated habit data */ },
        updatedStats: { /* updated stats data */ }
      });
    } catch (error) {
      console.error('Error updating habit:', error);
      res.status(500).json({ message: 'Error updating habit' });
    }
  });