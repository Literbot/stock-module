from flask import Flask, jsonify, request
import yfinance as yf
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 允許跨域請求

def get_stock_data(stock_code):
    try:
        # 假設 stock_code 已經包含完整代碼，例如 '2330.TW'
        stock = yf.Ticker(stock_code)
        data = stock.history(period='1d', interval='1d')
        print("取得資料:", data)
        if data.empty:
            raise ValueError("沒有資料")
        return data
    except Exception as e:
        print(f"錯誤: {e}")
        return None

@app.route('/api/stock_data', methods=['GET'])
def stock_data():
    stock_code = request.args.get('stock_code', '2330.TW')  # 預設帶上 .TW
    
    try:
        data = get_stock_data(stock_code)
        if data is None:
            return jsonify({'error': '無法獲取資料，請檢查股票代碼'}), 400

        # 修正關鍵點：轉成 records 形式，取第一筆
        latest_data = data.tail(1).to_dict(orient='records')[0]

        return jsonify(latest_data)
    except Exception as e:
        print(f"伺服器錯誤: {e}")
        return jsonify({'error': '伺服器內部錯誤'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)
