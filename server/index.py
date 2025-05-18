from flask import Flask, jsonify, request
import yfinance as yf
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 允許跨域請求

def get_stock_data(stock_code):
    try:
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

        latest_data = data.tail(1).to_dict(orient='records')[0]
        latest_date = data.index[-1].strftime('%Y-%m-%d')

        translated_data = {
            '日期': latest_date,
            '開盤價': latest_data.get('Open', None),
            '最高價': latest_data.get('High', None),
            '最低價': latest_data.get('Low', None),
            '收盤價': latest_data.get('Close', None),
            '成交量': latest_data.get('Volume', None),
            '股息': latest_data.get('Dividends', None),
            '分割': latest_data.get('Stock Splits', None)
        }

        return jsonify(translated_data)
    except Exception as e:
        print(f"伺服器錯誤: {e}")
        return jsonify({'error': '伺服器內部錯誤'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)
