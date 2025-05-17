import React, { useState } from 'react';

function App() {
  const [stockCode, setStockCode] = useState('2330.TW');
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState(null);

  const fetchStockData = async () => {
    setError(null);
    setStockData(null);
    if (!stockCode) {
      setError('請輸入股票代碼');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/stock_data?stock_code=${encodeURIComponent(stockCode)}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || '請求錯誤');
      }
      const data = await response.json();
      setStockData(data);
    } catch (err) {
      setError('請求錯誤: ' + err.message);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h2>股票查詢</h2>
      <input
        type="text"
        value={stockCode}
        onChange={(e) => setStockCode(e.target.value)}
        placeholder="輸入股票代碼，例如 2330.TW"
        style={{ width: 200, padding: 5 }}
      />
      <button onClick={fetchStockData} style={{ marginLeft: 10, padding: '5px 10px' }}>查詢</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {stockData && (
        <div style={{ marginTop: 20 }}>
          <h3>最新股價資料：</h3>
          <pre>{JSON.stringify(stockData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
