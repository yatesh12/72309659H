import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  TextField,
  MenuItem,
  Button,
  Box,
  CircularProgress,
  Paper,
} from '@mui/material';
import { fetchTickerList, fetchTwoTickerCorrelation } from '../api';
import HeatmapGrid from '../components/HeatmapGrid';

const predefinedIntervals = [5, 15, 30, 60, 120];

export default function HeatmapPage() {
  const [tickerMap, setTickerMap] = useState({});
  const [tickers, setTickers] = useState([]);
  const [minutes, setMinutes] = useState(30);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingCorr, setLoadingCorr] = useState(false);
  const [error, setError] = useState(null);

  const [correlations, setCorrelations] = useState({});
  const [stats, setStats] = useState({});

  // 1. Fetch tickers once on mount
  useEffect(() => {
    async function loadTickers() {
      setLoadingList(true);
      try {
        const map = await fetchTickerList();
        setTickerMap(map);
        const codes = Object.values(map).sort();
        setTickers(codes);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoadingList(false);
      }
    }
    loadTickers();
  }, []);

  // 2. Define the heatmap builder function
  const buildHeatmap = useCallback(async () => {
    if (tickers.length === 0) return;

    setLoadingCorr(true);
    setError(null);

    try {
      const N = tickers.length;
      const corrObj = {};
      const statsObj = {};
      for (const t of tickers) {
        corrObj[t] = {};
      }

      for (let i = 0; i < N; i++) {
        const t1 = tickers[i];

        // self-correlation
        {
          const resp = await fetchTwoTickerCorrelation(t1, t1, minutes);
          corrObj[t1][t1] = 1.0;
          const hist = resp.stocks[t1].priceHistory.map((pt) => Number(pt.price));
          const avg = resp.stocks[t1].averagePrice;
          const stddev = hist.length
            ? Math.sqrt(hist.reduce((acc, x) => acc + (x - avg) ** 2, 0) / hist.length)
            : 0;
          statsObj[t1] = { average: avg, stddev };
        }

        for (let j = i + 1; j < N; j++) {
          const t2 = tickers[j];
          const resp = await fetchTwoTickerCorrelation(t1, t2, minutes);
          const r = resp.correlation;
          corrObj[t1][t2] = r;
          corrObj[t2][t1] = r;

          if (!statsObj[t2]) {
            const hist2 = resp.stocks[t2].priceHistory.map((pt) => Number(pt.price));
            const avg2 = resp.stocks[t2].averagePrice;
            const std2 = hist2.length
              ? Math.sqrt(hist2.reduce((acc, x) => acc + (x - avg2) ** 2, 0) / hist2.length)
              : 0;
            statsObj[t2] = { average: avg2, stddev: std2 };
          }
        }
      }

      setCorrelations(corrObj);
      setStats(statsObj);
    } catch (err) {
      console.error('Error generating correlations:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoadingCorr(false);
    }
  }, [tickers, minutes]);

  // 3. Automatically build heatmap once tickers load
  useEffect(() => {
    buildHeatmap();
  }, [tickers, buildHeatmap]);

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Correlation Heatmap (All Tickers)
      </Typography>

      {loadingList ? (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          component="form"
          sx={{ display: 'flex', gap: 2, alignItems: 'center', marginBottom: 2 }}
          onSubmit={(e) => {
            e.preventDefault();
            buildHeatmap();
          }}
        >
          <TextField
            select
            label="Minutes Interval"
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            sx={{ width: 150 }}
          >
            {predefinedIntervals.map((m) => (
              <MenuItem key={m} value={m}>
                Last {m} min
              </MenuItem>
            ))}
          </TextField>

          <Button variant="contained" type="submit">
            Refresh Heatmap
          </Button>
        </Box>
      )}

      {loadingCorr && (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <CircularProgress />
          <Typography>Computing correlations for {tickers.length} tickers…</Typography>
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ my: 2 }}>
          {error}
        </Typography>
      )}

      {!loadingList && !loadingCorr && Object.keys(correlations).length > 0 ? (
        <HeatmapGrid tickers={tickers} correlations={correlations} stats={stats} />
      ) : (
        !loadingList &&
        !loadingCorr &&
        !error && (
          <Typography sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
            No data to display yet.
          </Typography>
        )
      )}
    </Paper>
  );
}
