const axios = require('axios');
const express = require('express');
const server = express();
const cors = require('cors');
const dayjs = require('dayjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const pathPrefix = process.env.PATH_PREFIX || '';
const port = 3001;

const checkOrigin = (req, callback) => {
  const app = req.query.app;
  const allowedOrigins = process.env[app.toUpperCase() + '_ORIGIN'];
  if (allowedOrigins) {
    callback(null, { origin: allowedOrigins.split(',').includes(req.header('Origin')) });
  } else {
    // if no allowed origins are configured for an app, allow all
    callback(null, { origin: true });
  }
};

server.get(pathPrefix + '/', cors(checkOrigin), async (req, res) => {
  const app = req.query.app;
  const code = req.query.code;
  if (app && code) {
    const client_id = process.env[app.toUpperCase() + '_ID'];
    const client_secret = process.env[app.toUpperCase() + '_SECRET'];
    if (client_id && client_secret) {
      try {
        const auth = await axios.post('https://github.com/login/oauth/access_token', {
          client_id,
          client_secret,
          code
        }, {
          headers: {
            Accept: 'application/json'
          }
        });

        res.cookie("github_oauth_token", auth.data.access_token, {
          secure: false,
          httpOnly: true,
          expires: dayjs().add(30, "days").toDate(),
        });

        res.json(auth.data);
      } catch (e) {
        res.status(e.response.status).json({ error: 'internal_error', error_description: e.message });
      }
    } else {
      res.status(400).json({ error: 'bad_request', error_description: `App ${app} is not configured. Requires client_id and client_secret` });
    }
  } else {
    res.status(400).json({ error: 'bad_request', error_description: 'No app or code provided.' });
  }
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
