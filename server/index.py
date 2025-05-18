from flask import Flask, request, jsonify
import yfinance as yf
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 允許跨域

@app.route('/api/stock_data')
def stock_data():
    stock_code = request.args.get('stock_code')
    if not stock_code:
        return jsonify({'error': '請提供股票代碼'}), 400

    # 自動補 .TW 或 .US
    if not (stock_code.endswith('.TW') or stock_code.endswith('.US')):
        if stock_code.isdigit():
            stock_code += '.TW'
        else:
            stock_code += '.US'

    try:
        stock = yf.Ticker(stock_code)
        info = stock.info

        data = {
            '股票代碼': stock_code,
            '公司名稱': info.get('shortName', '無資料'),
            '最新價格': info.get('regularMarketPrice', '無資料'),
            '開盤價': info.get('regularMarketOpen', '無資料'),
            '最高價': info.get('regularMarketDayHigh', '無資料'),
            '最低價': info.get('regularMarketDayLow', '無資料'),
            '成交量': info.get('regularMarketVolume', '無資料'),
            '市值': info.get('marketCap', '無資料'),
            '本益比': info.get('trailingPE', '無資料'),
            '股息殖利率': info.get('dividendYield', '無資料'),
        }
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': f'後端錯誤：{str(e)}'}), 500


@app.route('/api/kline_data')
def get_kline_data():
    stock_code = request.args.get('stock_code')
    if not stock_code:
        return jsonify({'error': '請提供股票代碼'}), 400

    # 自動補 .TW 或 .US
    if not (stock_code.endswith('.TW') or stock_code.endswith('.US')):
        if stock_code.isdigit():
            stock_code += '.TW'
        else:
            stock_code += '.US'

    try:
        ticker = yf.Ticker(stock_code)
        data = ticker.history(period='10d')  # 最近10天

        if data.empty:
            return jsonify({'error': '查無資料，可能是代碼錯誤、休市日或資料延遲'}), 404

        result = []
        for date, row in data.iterrows():
            result.append({
                '日期': date.strftime('%Y-%m-%d'),
                '開盤': round(row['Open'], 2),
                '最高': round(row['High'], 2),
                '最低': round(row['Low'], 2),
                '收盤': round(row['Close'], 2),
                '成交量': int(row['Volume'])
            })

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': f'後端錯誤：{str(e)}'}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
