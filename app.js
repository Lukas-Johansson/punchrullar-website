const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3000;

let data = JSON.parse(fs.readFileSync('punchrullar.json', 'utf8'));

app.use(cors()); // Enable CORS middleware
app.use(express.json());

app.get('/', (req, res) => {
  res.redirect('/punchrullar');
});

app.get('/punchrullar', (req, res) => {
  res.json(data);
});

app.post('/punchrullar/update', (req, res) => {
  const { newCount } = req.body;

  if (newCount !== undefined && typeof newCount === 'number') {
    data.remaining = newCount;

    fs.writeFileSync('punchrullar.json', JSON.stringify(data), 'utf8');

    res.json({ message: 'Punchrullar count updated successfully', data });
  } else {
    res.status(400).json({ error: 'Invalid request. Please provide a valid "newCount" parameter.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
