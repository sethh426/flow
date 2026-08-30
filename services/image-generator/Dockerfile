# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY api.py .
COPY image_generator.py .

# Expose port (Cloud Run will override this)
EXPOSE 8080

# Set environment variable for Flask
ENV PORT=8080

# Run the Flask app
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 api:app
