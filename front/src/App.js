import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [stockCode, setStockCode] = useState('2330.TW');
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState(null);

  // 載入 TradingView 小工具（K 線圖）
  useEffect(() => {
    if (stockCode && window.TradingView) {
      const container = document.getElementById('tv_chart_container');
      container.innerHTML = ''; // 清空舊圖
      new window.TradingView.widget({
        autosize: true,
        symbol: stockCode,
        interval: 'D',
        timezone: 'Asia/Taipei',
        theme: 'light',
        style: '1',
        locale: 'zh_TW',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        container_id: 'tv_chart_container',
      });
    }
  }, [stockCode]);

  // 查詢股票資料 API
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

  // 千分位格式化函數
  function formatNumberWithCommas(x) {
    if (x === null || x === undefined) return '-';
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  return (
    <div className="container">
      {/* 左側查詢資料 */}
      <div className="left-panel">
        <h2>股票查詢</h2>
        <div className="input-group">
          <input
            className="input-text"
            type="text"
            value={stockCode}
            onChange={(e) => setStockCode(e.target.value)}
            placeholder="輸入股票代碼，例如 2330.TW"
          />
          <button className="button" onClick={fetchStockData}>查詢</button>
        </div>

        {error && <p className="error-message">{error}</p>}

        {stockData && (
          <div>
            <h3>最新股價資料：</h3>
            <table className="result-table">
              <tbody>
                {Object.entries(stockData).map(([key, value]) => (
                  <tr key={key}>
                    <td className="label-cell">{key}</td>
                    <td className="value-cell">
                      {key === '成交量' ? formatNumberWithCommas(value) : value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 右側K線圖 */}
      <div className="right-panel">
        <div id="tv_chart_container" style={{ width: '100%', height: '100%', minHeight: '430px' }}></div>
      </div>
    </div>
  );
}

export default App;
