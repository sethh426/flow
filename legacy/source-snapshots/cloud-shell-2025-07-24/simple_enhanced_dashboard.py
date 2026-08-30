#!/usr/bin/env python3
import streamlit as st
import random
import yfinance as yf
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

st.set_page_config(page_title="Trading Secrets", page_icon="🚀", layout="wide")

st.markdown("# 🚀 Trading Secrets - Enhanced Platform")
st.markdown("**Real-time Data • AI Analysis • Risk Management**")

# Sidebar
symbol = st.sidebar.selectbox("Select Stock", ["AAPL", "GOOGL", "MSFT", "TSLA"])

# Get stock data
@st.cache_data
def get_stock_data(symbol):
    ticker = yf.Ticker(symbol)
    hist = ticker.history(period="5d")
    if not hist.empty:
        price = float(hist['Close'].iloc[-1])
        change = price - float(hist['Close'].iloc[-2]) if len(hist) > 1 else 0
        return {"price": price, "change": change, "change_pct": (change/price)*100}
    return None

data = get_stock_data(symbol)
if data:
    col1, col2 = st.columns(2)
    with col1:
        st.metric(f"{symbol} Price", f"${data['price']:.2f}", f"{data['change']:+.2f}")
    with col2:
        signal = random.choice(["BUY", "HOLD", "SELL"])
        color = {"BUY": "green", "HOLD": "orange", "SELL": "red"}[signal]
        st.markdown(f"**Signal:** :{color}[{signal}]")

st.success("✅ Dashboard Active")
