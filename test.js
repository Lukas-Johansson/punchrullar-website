const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); 

const app = express();
const port = 3002;

const pool = mysql.createPool({
  host: 'jupiter.umea-ntig.se', // replace with your MySQL host
  user: 'lukas', // replace with your MySQL username
  password: 'potatis204', // replace with your MySQL password
  database: 'punchrulle' // replace with your MySQL database name
});

app.use(cors()); 
app.use(express.json());

app.get('/', (req, res) => {
  res.redirect('/punchrullar');
});

app.get('/punchrullar', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM punchrullar');
  res.json(rows);
});

app.post('/punchrullar/update', async (req, res) => { // Update this line
    const { newCount } = req.body;
    
    if (newCount !== undefined && typeof newCount === 'number') {
      await pool.query('UPDATE punchrullar SET remaining = ? WHERE id = 1', [newCount]); // Update this line
      res.json({ message: 'Punchrullar count updated successfully' });
    } else {
      res.status(400).json({ error: 'Invalid request. Please provide a valid "newCount" parameter.' });
    }
  });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.post('/punchrullar/insert', async (req, res) => {
  const { remaining } = req.body;
  
  if (remaining !== undefined && typeof remaining === 'number') {
    await pool.query('INSERT INTO punchrullar (remaining) VALUES (?)', [remaining]);
    res.json({ message: 'New punchrullar count inserted successfully' });
  } else {
    res.status(400).json({ error: 'Invalid request. Please provide a valid "remaining" parameter.' });
  }
});
