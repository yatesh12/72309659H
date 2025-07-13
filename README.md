# 📊 Stock Analytics Full-Stack Web App

This web application provides interactive tools for analyzing stock performance and relationships between different tickers over selected time intervals. Built with a full-stack architecture to ensure responsiveness and scalability.

## 🔧 Features

- **Stock Price Chart**
  - View historical stock prices based on user-defined ticker symbol and time interval.
  - Dynamic rendering using charting library (e.g. Chart.js or D3.js).

- **API-Based Data Fetching**
  - Real-time and historical data fetched via financial APIs.
  - Modular backend for easy extension and throttling control.

- **Correlation Heatmap**
  - Visualize pairwise correlations of selected tickers over a time window.
  - Highlights pattern similarity and outliers using color gradients.

## 🛠️ Tech Stack

- **Frontend:** React (with CSS3 and Framer Motion for UI)
- **Backend:** Node.js + Express
- **Data Source:** Financial market API (e.g. Alpha Vantage, Yahoo Finance)
- **Visualization:** Chart.js / D3.js / custom canvas components

## 🚀 Usage

1. Clone the repo
2. Install dependencies (`npm install`)
3. Add your API key in `.env`
4. Run with `npm start`

