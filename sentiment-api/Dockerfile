FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (core + ML with CPU-only torch)
COPY requirements.txt requirements-ml.txt ./

# Install torch CPU-only first (much smaller than full torch with CUDA)
RUN pip install --no-cache-dir torch==2.5.1 --index-url https://download.pytorch.org/whl/cpu

# Then install the rest
RUN pip install --no-cache-dir -r requirements-ml.txt

# Pre-download the IndoBERT model during build so it's cached in the image
# (avoids downloading on every container start)
RUN python -c "from transformers import AutoTokenizer, AutoModelForSequenceClassification; \
    AutoTokenizer.from_pretrained('mdhugol/indonesia-bert-sentiment-classification'); \
    AutoModelForSequenceClassification.from_pretrained('mdhugol/indonesia-bert-sentiment-classification')"

# Copy application code
COPY . .

# Railway injects $PORT at runtime. Default to 5000 for local runs.
ENV PORT=5000
EXPOSE 5000

# Use shell form so ${PORT} is expanded by the shell at runtime.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-5000}"]
