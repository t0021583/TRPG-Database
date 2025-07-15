const axios = require('axios');

exports.handler = async function(event, context) {
  // 解析 query 參數
  const { repo, path, branch = 'main' } = event.queryStringParameters;
  if (!repo || !path) {
    return {
      statusCode: 400,
      body: 'Missing repo or path'
    };
  }

  const GITHUB_API = 'https://api.github.com';
  const GITHUB_RAW = 'https://raw.githubusercontent.com';

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

    return {
      statusCode: 200,
      body: JSON.stringify(results)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: 'Failed to fetch folder contents'
    };
  }
};
