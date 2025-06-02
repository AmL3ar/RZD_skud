FROM python:3.9
WORKDIR /app

RUN apt-get update && \
    apt-get install -y libreoffice-writer --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8010"]