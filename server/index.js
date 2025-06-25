import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const TINYMAN_API_URL = process.env.TINYMAN_API_URL || 'https://mainnet.analytics.tinyman.org';
const PACT_API_URL = process.env.PACT_API_URL || 'https://api.pact.fi';
const VESTIGE_API_URL = process.env.VESTIGE_API_URL || 'https://free-api.vestige.fi';

const ALGO_API_TOKEN = process.env.ALGO_API_TOKEN;
const TINYMAN_API_TOKEN = process.env.TINYMAN_API_TOKEN;
const PACT_API_TOKEN = process.env.PACT_API_TOKEN;
const VESTIGE_API_TOKEN = process.env.VESTIGE_API_TOKEN;

function buildHeaders(token) {
  const headers = { Accept: 'application/json' };
  if (token) headers['X-API-Key'] = token;
  return headers;
}

async function forward(req, res, baseUrl, token) {
  try {
    const url = `${baseUrl}${req.path}`;
    const options = {
      method: req.method,
      headers: { ...buildHeaders(token), ...req.headers },
      params: req.query,
      data: req.body
    };
    const response = await axios(url, options);
    res.status(response.status).json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    res.status(status).json({ error: err.message });
  }
}

app.use(express.json());

app.use('/api/tinyman', (req, res) => forward(req, res, TINYMAN_API_URL, TINYMAN_API_TOKEN || ALGO_API_TOKEN));
app.use('/api/pact', (req, res) => forward(req, res, PACT_API_URL, PACT_API_TOKEN || ALGO_API_TOKEN));
app.use('/api/vestige', (req, res) => forward(req, res, VESTIGE_API_URL, VESTIGE_API_TOKEN || ALGO_API_TOKEN));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
