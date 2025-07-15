const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const GITHUB_API = 'https://api.github.com';
const GITHUB_RAW = 'https://raw.githubusercontent.com';

app.get('/github/folder', async (req, res) => {
  const { repo, path, branch = 'main' } = req.query;
  if (!repo || !path) return res.status(400).send('Missing repo or path');

  try {
    const treeUrl = `${GITHUB_API}/repos/${repo}/git/trees/${branch}?recursive=1`;
    const headers = process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {};
    const { data } = await axios.get(treeUrl, { headers });

    const files = data.tree.filter(item => item.path.startsWith(path + '/') && item.type === 'blob');
    const results = [];

    for (const file of files) {
      const rawUrl = `${GITHUB_RAW}/${repo}/${branch}/${file.path}`;
      try {
        const fileRes = await axios.get(rawUrl);
        results.push({ filename: file.path, content: fileRes.data });
      } catch (err) {
        results.push({ filename: file.path, content: '[ERROR READING FILE]' });
      }
    }

    res.json(results);
  } catch (error) {
    res.status(500).send('Failed to fetch folder contents');
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
