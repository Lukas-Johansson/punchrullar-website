const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
const port = 3001;

const dbConfig = {
  host: 'jupiter.umea-ntig.se',
  user: 'lukas',
  password: 'potatis204',
  database: 'punchrulle',
  connectionLimit: 1000,
  connectTimeout: 60 * 60 * 1000
};

const pool = mysql.createPool(dbConfig);

app.use(cors());
app.use(express.json());

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
    const sqlQuery = action === 'add' ? 'UPDATE punchrullar SET remaining = remaining + 1' : 'UPDATE punchrullar SET remaining = GREATEST(0, remaining - 1)';

    pool.query(sqlQuery, (error, results) => {
      if (error) {
        console.error('Error updating Punchrullar count:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        pool.query('SELECT * FROM punchrullar', (fetchError, fetchResults) => {
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
  console.log(`Server is running on http://localhost:${port}`);
});


