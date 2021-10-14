const axios = require('axios');
const express = require('express');
const app = express();
const cors = require('cors');
const dayjs = require('dayjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const port = 3001;

app.use(cors({ credentials: true, origin: process.env.ORIGIN_URL }));
app.use(cookieParser());

app.get('/checkAuth', async (req, res) => {
  // MAIN CODE HERE :
  const signedCookies = req.signedCookies; // get signed cookies
  console.log('signed-cookies:', signedCookies);
  const cookies = req.cookies; // get not signed cookies
  console.log('not-signed-cookies:', cookies);
  // or access directly to one cookie by its name :
  const myTestCookie = req.signedCookies.github_oauth_token;
  console.log('our test signed cookie:', myTestCookie);
  res.send('get cookie');
}

app.get('/', async (req, res) => {
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

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
