FROM python:3.9-slim
WORKDIR /app
RUN pip install streamlit yfinance vaderSentiment
COPY simple_enhanced_dashboard.py ./
EXPOSE 8501
CMD ["streamlit", "run", "simple_enhanced_dashboard.py", "--server.port=8501", "--server.address=0.0.0.0"]
