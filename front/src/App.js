import React, { useState } from 'react';

function App() {
  const [stockCode, setStockCode] = useState('2330.TW');
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState(null);

  // 千分位格式化函式
  function formatNumberWithCommas(x) {
    if (x === null || x === undefined) return '-';
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

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
    <div className="container">
      <h2>股票查詢</h2>
      <div className="input-group">
        <input
          type="text"
          value={stockCode}
          onChange={(e) => setStockCode(e.target.value)}
          placeholder="輸入股票代碼，例如 2330.TW"
        />
        <button onClick={fetchStockData}>查詢</button>
      </div>

      {error && <p className="error">{error}</p>}

      {stockData && (
        <div className="result">
          <h3>最新股價資料：</h3>
          <table>
            <tbody>
              {Object.entries(stockData).map(([key, value]) => (
                <tr key={key}>
                  <td className="label">{key}</td>
                  <td className="value">
                    {key === '成交量' ? formatNumberWithCommas(value) : (value !== null ? value.toString() : '-')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
