require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { computeAverage, computeCorrelation, alignByTimestamp } = require('./utils');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 4000;
const TEST_BASE = process.env.TEST_SERVER_BASE_URL; // e.g. http://28.244.56.144/evaluation-service
const CACHE_TTL = parseInt(process.env.CACHE_TTL_SEC, 10) || 30;

const historyCache = new Map();

async function fetchPriceHistory(ticker, minutes) {
  const cacheKey = `${ticker}|${minutes}`;
  const nowSec = Math.floor(Date.now() / 1000);
  if (historyCache.has(cacheKey)) {
    const { timestamp, data } = historyCache.get(cacheKey);
    if (nowSec - timestamp < CACHE_TTL) return data;
  }

  const url = `${TEST_BASE}/stocks/${ticker}?minutes=${minutes}`;
  try {
    const resp = await axios.get(url);
    let arr = [];
    if (Array.isArray(resp.data)) {
      arr = resp.data;
    } else if (resp.data && Array.isArray(resp.data.prices)) {
      arr = resp.data.prices;
    } else {
      for (const key in resp.data) {
        const obj = resp.data[key];
        if (obj && obj.price != null && obj.lastUpdatedAt) {
          arr.push({ price: obj.price, lastUpdatedAt: obj.lastUpdatedAt });
        }
      }
    }
    arr.sort((a, b) => new Date(a.lastUpdatedAt) - new Date(b.lastUpdatedAt));
    historyCache.set(cacheKey, { timestamp: nowSec, data: arr });
    return arr;
  } catch (err) {
    console.warn(`⚠️  Unable to fetch "${ticker}" from test‐server (${url}). Reason: ${err.message}`);
    console.warn(`   → Falling back to dummy data for "${ticker}".`);

    const nowMs = Date.now();
    const baseTimeMs = nowMs - minutes * 60 * 1000;
    const dummyArr = [];
    for (let i = 0; i < 4; i++) {
      const ts = new Date(
        baseTimeMs + ((i + 1) * (minutes * 60 * 1000)) / 4
      ).toISOString();
      const price = 100 + Math.random() * 50;
      dummyArr.push({ price, lastUpdatedAt: ts });
    }
    historyCache.set(cacheKey, { timestamp: nowSec, data: dummyArr });
    return dummyArr;
  }
}

// ─── NEW: Proxy route to get the list of all tickers from the test server ───────────
app.get('/stocks/list', async (req, res) => {
  try {
    const resp = await axios.get(`${TEST_BASE}/stocks`);
    // resp.data.stocks is expected to be an object, e.g. { "Apple Inc.": "AAPL", … }
    return res.json({ stocks: resp.data.stocks });
  } catch (err) {
    console.error('Error in /stocks/list:', err.message);
    return res.status(500).json({ error: 'Failed to fetch list of stocks.' });
  }
});

// GET /stocks/:ticker?minutes=<m>&aggregation=average
app.get('/stocks/:ticker', async (req, res) => {
  const { ticker } = req.params;
  const minutes = parseInt(req.query.minutes, 10);
  const aggregation = req.query.aggregation || '';
  if (!ticker || isNaN(minutes) || aggregation !== 'average') {
    return res.status(400).json({
      error: 'Usage: GET /stocks/:ticker?minutes=<m>&aggregation=average',
    });
  }

  try {
    const history = await fetchPriceHistory(ticker, minutes);
    if (!history.length) {
      return res.status(404).json({ error: 'No data available.' });
    }
    const prices = history.map((pt) => Number(pt.price));
    const avg = computeAverage(prices);
    return res.json({ averageStockPrice: avg, priceHistory: history });
  } catch (err) {
    console.error('Error in /stocks/:ticker:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /stockcorrelation?minutes=<m>&ticker=<T1>&ticker=<T2>
app.get('/stockcorrelation', async (req, res) => {
  const minutes = parseInt(req.query.minutes, 10);
  const tickers = req.query.ticker;
  let arrTickers = [];
  if (Array.isArray(tickers)) arrTickers = tickers;
  else if (typeof tickers === 'string') arrTickers = [tickers];

  if (isNaN(minutes) || arrTickers.length !== 2) {
    return res.status(400).json({
      error: 'Usage: GET /stockcorrelation?minutes=<m>&ticker=<T1>&ticker=<T2>',
    });
  }

  const [t1, t2] = arrTickers;
  try {
    const [hist1, hist2] = await Promise.all([
      fetchPriceHistory(t1, minutes),
      fetchPriceHistory(t2, minutes),
    ]);
    if (!hist1.length || !hist2.length) {
      return res.status(404).json({ error: 'No data for one or both tickers.' });
    }
    const { aligned1, aligned2 } = alignByTimestamp(hist1, hist2);
    if (aligned1.length < 2) {
      return res.status(422).json({ error: 'Not enough overlapping data to compute correlation.' });
    }

    const prices1 = aligned1.map((pt) => Number(pt.price));
    const prices2 = aligned2.map((pt) => Number(pt.price));
    const corr = computeCorrelation(prices1, prices2);

    const avg1 = computeAverage(hist1.map((pt) => Number(pt.price)));
    const avg2 = computeAverage(hist2.map((pt) => Number(pt.price)));

    return res.json({
      correlation: corr,
      stocks: {
        [t1]: { averagePrice: avg1, priceHistory: hist1 },
        [t2]: { averagePrice: avg2, priceHistory: hist2 },
      },
    });
  } catch (err) {
    console.error('Error in /stockcorrelation:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🟢 Stock‐Aggregation API listening on port ${PORT}`);
  console.log(`   (test-server base: ${TEST_BASE})`);
});
