const express = require('express');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'build')));

app.get('/commit-hash', (req, res) => {
  exec('git rev-parse HEAD', (err, stdout, stderr) => {
    if (err) {
      res.status(500).send('Error retrieving commit hash');
      return;
    }
    res.send(stdout.trim());
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
