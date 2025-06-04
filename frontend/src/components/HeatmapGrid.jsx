import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';

function getColorForCorrelation(r) {
  const clamped = Math.max(-1, Math.min(1, r));
  if (clamped >= 0) {
    const t = clamped; 
    const r0 = 255, g0 = 255, b0 = 255;
    const r1 = 198, g1 = 40,  b1 = 40; 
    const R = Math.round(r0 + (r1 - r0) * t);
    const G = Math.round(g0 + (g1 - g0) * t);
    const B = Math.round(b0 + (b1 - b0) * t);
    return `rgb(${R},${G},${B})`;
  } else {
    const t = -clamped; 
    const r0 = 255, g0 = 255, b0 = 255;
    const r1 = 21,  g1 = 101, b1 = 192; 
    const R = Math.round(r0 + (r1 - r0) * t);
    const G = Math.round(g0 + (g1 - g0) * t);
    const B = Math.round(b0 + (b1 - b0) * t);
    return `rgb(${R},${G},${B})`;
  }
}

export default function HeatmapGrid({ tickers, correlations, stats }) {
  const N = tickers.length;

  return (
    <Box sx={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 600 }}>
      <Box
        component="table"
        sx={{
          borderCollapse: 'collapse',
          width: '100%',
          tableLayout: 'fixed',
        }}
      >
        <Box component="thead">
          <Box component="tr">
            <Box component="th" sx={{ border: 1, width: 100, height: 40 }} />
            {tickers.map((t) => (
              <Box
                key={`col-${t}`}
                component="th"
                sx={{
                  border: 1,
                  width: 80,
                  height: 40,
                  writingMode: 'vertical-rl',
                  textOrientation: 'upright',
                  textAlign: 'center',
                  position: 'relative',
                  backgroundColor: '#f5f5f5',
                  cursor: 'default',
                }}
              >
                <Tooltip
                  title={
                    <React.Fragment>
                      <Typography variant="body2">
                        Ticker: {t}
                      </Typography>
                      <Typography variant="body2">
                        Avg: ${stats[t]?.average.toFixed(2)}
                      </Typography>
                      <Typography variant="body2">
                        Std Dev: ${stats[t]?.stddev.toFixed(2)}
                      </Typography>
                    </React.Fragment>
                  }
                >
                  <span>{t}</span>
                </Tooltip>
              </Box>
            ))}
          </Box>
        </Box>

        <Box component="tbody">
          {tickers.map((rowT, i) => (
            <Box component="tr" key={`row-${rowT}`}>
              <Box
                component="th"
                sx={{
                  border: 1,
                  width: 100,
                  height: 40,
                  backgroundColor: '#f5f5f5',
                  cursor: 'default',
                }}
              >
                <Tooltip
                  title={
                    <React.Fragment>
                      <Typography variant="body2">
                        Ticker: {rowT}
                      </Typography>
                      <Typography variant="body2">
                        Avg: ${stats[rowT]?.average.toFixed(2)}
                      </Typography>
                      <Typography variant="body2">
                        Std Dev: ${stats[rowT]?.stddev.toFixed(2)}


                      </Typography>
                    </React.Fragment>
                  }
                >
                  <span>{rowT}</span>
                </Tooltip>
              </Box>

              {tickers.map((colT, j) => {
                const r = correlations[rowT]?.[colT] ?? 0;
                const bgColor = getColorForCorrelation(r);
                return (
                  <Box
                    key={`cell-${rowT}-${colT}`}
                    component="td"
                    sx={{
                      border: 1,
                      width: 80,
                      height: 40,
                      backgroundColor: bgColor,
                      textAlign: 'center',
                      fontSize: '0.8rem',
                      position: 'relative',
                    }}
                  >
                    <Tooltip title={`r = ${r.toFixed(3)}`}>
                      <span>{r.toFixed(2)}</span>
                    </Tooltip>
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
