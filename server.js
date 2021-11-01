const axios = require('axios');
const express = require('express');
const app = express();
const cors = require('cors');
const dayjs = require('dayjs');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const port = 3001;

app.use(cors({ credentials: true, origin: process.env.ORIGIN_URL }));
app.use(cookieParser('entropydfnjd23'));

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

				res.cookie('github_oauth_token', auth.data.access_token, {
					signed: true,
					secure: false,
					httpOnly: true,
					expires: dayjs().add(30, 'days').toDate(),
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

app.get('/checkAuth', async (req, res) => {
	const oauthToken = req.signedCookies.github_oauth_token;
	if (typeof oauthToken == 'undefined') {
		return res.status(200).json({ isAuthenticated: false });
	} else {
		return res.status(200).json({ isAuthenticated: true });
	}
});

app.get('/logout', async (req, res) => {
	res.clearCookie('github_oauth_token');
	return res.status(200).json({ isAuthenticated: false });
});

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
