import { Typography } from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';


export default function StockChart({ data, average, ticker }) {
  const chartData = data.map((pt) => ({
    time: pt.timestamp.toLocaleTimeString(), 
    price: pt.price,
    rawTimestamp: pt.timestamp, 
  }));

  return (
    <div style={{ width: '100%', height: 400 }}>
      <Typography variant="h6" gutterBottom>
        {ticker} Price (Last {data.length ? Math.round((data[data.length - 1].timestamp - data[0].timestamp) / 60000) : ''} min)
      </Typography>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip
            labelFormatter={(label) => `Time: ${label}`}
            formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#1976d2"
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />


          <ReferenceLine
            y={average}
            stroke="#d32f2f"
            strokeDasharray="4 4"
            label={{
              position: 'top',
              value: `Avg: $${average.toFixed(2)}`,
              fill: '#d32f2f',
              fontSize: 12,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
