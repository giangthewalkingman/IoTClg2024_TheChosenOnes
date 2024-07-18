FROM ubuntu:latest

# Thiết lập các biến môi trường
ENV DEBIAN_FRONTEND=noninteractive

# Cập nhật và cài đặt các gói cần thiết
RUN apt-get update && apt-get install -y \
    git \
    wget \
    curl \
    python3.12 \
    python3.12-venv \
    nodejs \
    npm

# Cài đặt XAMPP
RUN wget https://www.apachefriends.org/xampp-files/7.4.29/xampp-linux-x64-7.4.29-1-installer.run \
    && chmod +x xampp-linux-x64-7.4.29-1-installer.run \
    && ./xampp-linux-x64-7.4.29-1-installer.run --mode unattended

# Clone repository
RUN git clone https://github.com/giangthewalkingman/IoTClg2024_TheChosenOnes.git /IoTClg2024_TheChosenOnes

# Cài đặt các phụ thuộc Python
RUN cd /IoTClg2024_TheChosenOnes \
    && python3.12 -m venv venv \
    && . venv/bin/activate \
    && pip install -r backend/requirement.txt

# Cấu hình Mosquitto
RUN echo "allow_anonymous true" >> /etc/mosquitto/mosquitto.conf \
    && echo "listener 1883 0.0.0.0" >> /etc/mosquitto/mosquitto.conf

# Cài đặt các phụ thuộc Node.js
RUN cd /IoTClg2024_TheChosenOnes/frontend/MyApp \
    && npm install

# Mở các cổng cần thiết
EXPOSE 8000 1883 3000

# CMD để khởi động các dịch vụ khi container chạy
CMD service mosquitto start \
    && cd /IoTClg2024_TheChosenOnes/backend/Server \
    && . ../venv/bin/activate \
    && python main.py \
    && cd /IoTClg2024_TheChosenOnes/frontend/MyApp \
    && npm start
