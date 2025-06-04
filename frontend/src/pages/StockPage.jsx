import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  TextField, 
  Button, 
  MenuItem, 
  Box, 
  CircularProgress, 
  Paper 
} from '@mui/material';
import StockChart from '../components/StockChart';
import { fetchStockAverageAndHistory } from '../api';

const predefinedIntervals = [5, 15, 30, 60, 120]; 

export default function StockPage() {
  const [ticker, setTicker] = useState('AAPL');
  const [minutes, setMinutes] = useState(30);
  const [loading, setLoading] = useState(false);
  const [average, setAverage] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStockAverageAndHistory(ticker.trim().toUpperCase(), minutes);
      setAverage(data.averageStockPrice);
      const transformed = data.priceHistory.map((pt) => ({
        timestamp: new Date(pt.lastUpdatedAt),
        price: Number(pt.price),
      }));
      setHistory(transformed);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setHistory([]);
      setAverage(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetch();
  }, []);

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Stock Price Chart
      </Typography>

      <Box
        component="form"
        sx={{ display: 'flex', gap: 2, alignItems: 'center', marginBottom: 2 }}
        onSubmit={(e) => {
          e.preventDefault();
          handleFetch();
        }}
      >
        <TextField
          label="Ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          required
        />

        <TextField
          select
          label="Minutes Interval"
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          sx={{ width: 150 }}
        >
          {predefinedIntervals.map((m) => (
            <MenuItem key={m} value={m}>
              Last {m} minutes
            </MenuItem>
          ))}
        </TextField>

        <Button variant="contained" type="submit">
          Fetch
        </Button>
      </Box>

      {loading && <CircularProgress />}

      {error && (
        <Typography color="error" sx={{ my: 2 }}>
          {error}
        </Typography>
      )}

      {!loading && !error && history.length > 0 && (
        <StockChart
          data={history}
          average={average}
          ticker={ticker.toUpperCase()}
        />
      )}
    </Paper>
  );
}
