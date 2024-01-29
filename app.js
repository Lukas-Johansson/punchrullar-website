require('dotenv').config()
const express = require('express')
const cors = require('cors')
const pool = require('./db')

const app = express()
const port = process.env.PORT || 3001

var bodyParser = require('body-parser')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(cors());

app.get('/punchrullar/count', (req, res) => {
  pool.query('SELECT remaining FROM punchrullar', (error, results) => {
    if (error) {
      console.error('Error fetching Punchrullar count:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      try {
        if (results.length === 0 || results[0].remaining === undefined) {
          throw new Error('No Punchrullar data found');
        }
        res.json({ remaining: results[0].remaining });
      } catch (fetchError) {
        console.error('Error processing Punchrullar count response:', fetchError);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  });
});

app.post('/punchrullar/update', (req, res) => {
  const { action } = req.body;
  if (action === 'add' || action === 'remove') {
    const remainingChange = action === 'add' ? 1 : -1;
    const sqlQuery = 'INSERT INTO punchrullar (remaining, timetable) VALUES (?, CURRENT_TIMESTAMP);';

    pool.query(sqlQuery, [remainingChange], (error, results) => {
      if (error) {
        console.error('Error creating new timetable:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        pool.query('SELECT * FROM punchrullar ORDER BY timetable DESC LIMIT 1', (fetchError, fetchResults) => {
          if (fetchError) {
            console.error('Error fetching updated Punchrullar count:', fetchError);
            res.status(500).json({ error: 'Internal Server Error' });
          } else {
            res.json({ message: `Punchrullar count ${action === 'add' ? 'added' : 'removed'} successfully`, data: fetchResults[0] });
          }
        });
      }
    });
  } else {
    res.status(400).json({ error: 'Invalid request. Please provide a valid "action" parameter.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http:localhost:${port}`);
});

