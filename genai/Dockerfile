FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

COPY . .

# IMPORTANT: Use shell form so $PORT is expanded
CMD sh -c "uvicorn main:app --host 0.0.0.0 --port $PORT"
