require('dotenv').config()
const express = require('express')
const cors = require('cors')
const pool = require('./db')

const app = express()
const port = process.env.PORT || 3001

app.use(cors();

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
