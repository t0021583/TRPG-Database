const axios = require('axios');

exports.handler = async function(event, context) {
  const { repo, file, branch = 'main' } = event.queryStringParameters;
  if (!repo || !file) {
    return {
      statusCode: 400,
      body: 'Missing repo or file'
    };
  }
  const rawUrl = `https://raw.githubusercontent.com/${repo}/${branch}/${file}`;
  try {
    const fileRes = await axios.get(rawUrl);
    return {
      statusCode: 200,
      body: JSON.stringify({
        filename: file,
        content: typeof fileRes.data === "string" ? fileRes.data : JSON.stringify(fileRes.data)
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: '[ERROR READING FILE]'
    };
  }
};
