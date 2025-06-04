import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Tabs, Tab, Container, Box, useMediaQuery } from '@mui/material';

import StockPage from './pages/StockPage';
import HeatmapPage from './pages/HeatmapPage';

const theme = createTheme({
  palette: {
    primary: { main: '#121212', contrastText: '#fff' },
    secondary: { main: '#c62828', contrastText: '#fff' },
    background: { default: '#f4f6f8', paper: '#fff' },
  },
  typography: {
    h6: { fontWeight: 600, letterSpacing: '0.5px' },
    button: { textTransform: 'none' },
  },
  components: {
    MuiAppBar: { defaultProps: { elevation: 4 } },
    MuiTabs: {
      styleOverrides: {
        root: { marginLeft: 'auto' },
        indicator: { backgroundColor: '#fff' },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
          minWidth: 120,
          '&.Mui-selected': { fontWeight: 600 },
        },
      },
    },
    MuiContainer: { defaultProps: { maxWidth: 'lg' } },
  },
});

function NavTabs() {
  const { pathname } = useLocation();
  const value = pathname.startsWith('/heatmap') ? 1 : 0;

  return (
    <Tabs value={value} textColor="inherit" TabIndicatorProps={{ children: <span /> }}>
      <Tab label="Stock Price" component={Link} to="/stock" />
      <Tab label="Correlation Heatmap" component={Link} to="/heatmap" />
    </Tabs>
  );
}

export default function App() {
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppBar position="sticky" color="primary">
          <Toolbar sx={{ minHeight: isSmall ? 56 : 64 }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Stock Analytics
            </Typography>
            <NavTabs />
          </Toolbar>
        </AppBar>
        <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', py: 4 }}>
          <Container sx={{ backgroundColor: 'background.paper', borderRadius: 2, boxShadow: 2, p: 3 }}>
            <Routes>
              <Route path="/" element={<Navigate to="/stock" replace />} />
              <Route path="/stock" element={<StockPage />} />
              <Route path="/heatmap" element={<HeatmapPage />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}
