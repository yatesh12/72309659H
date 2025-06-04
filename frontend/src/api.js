import axios from 'axios';

const API_BASE = 'http://localhost:4000';

export async function fetchTickerList() {
  const resp = await axios.get(`${API_BASE}/stocks/list`);
  return resp.data.stocks; 
}

export async function fetchStockAverageAndHistory(ticker, minutes) {

  const resp = await axios.get(
    `${API_BASE}/stocks/${ticker}`,
    { params: { minutes, aggregation: 'average' } }
  );
  return resp.data; 

}

export async function fetchTwoTickerCorrelation(t1, t2, minutes) {
  const resp = await axios.get(
    `${API_BASE}/stockcorrelation`,
    { params: { minutes, ticker: [t1, t2] } } 
  );
  return resp.data; 
}
