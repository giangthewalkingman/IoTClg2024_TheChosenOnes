# HOW TO SETUP APPLICATION ON UBUNTU
Locate to repository directory .../IoTClg2024_TheChosenOnes
Install Git to clone this repository
```
git clone https://github.com/giangthewalkingman/IoTClg2024_TheChosenOnes.git
```
Install git tutorial: https://www.youtube.com/watch?v=bc3_FL9zWWs

## Settings up MySQL with XAMPP
- Install XAMPP: https://www.youtube.com/watch?v=XoKUkdmfTZQ&t=82s
- Go to phpMyAdmin, create schema_server
- Copy text file at backend/Server/schema_server.txt to SQL terminal to create database

## Setting up Mosquitto (MQTT Broker):
- **Ubuntu 22.04**
  - Install mosquitto and mosquitto-client:
    ```
    sudo apt install mosquitto mosquitto-client
    ```
  - Add the following lines to the file `/etc/mosquitto/mosquitto.conf`:
    ```
    allow_anonymous true  # Allow subscription/publishing without authentication
    listener 1883 0.0.0.0  # Use local machine's IP as the broker on port 1883
    ```

## Setting up Python 3.12 and Dependencies:
- **Python 3.12** install tutorial https://www.youtube.com/watch?v=OBz1uW5mmlE&t=490s
- **Make sure you in direcory .../IoTClg2024_TheChosenOnes**
- **Install Virtual Environment:**
  ```
  python -m venv venv
  ```
- **Activate Virtual Environment:**
  ```
  source venv/bin/activate
  ```
- **Nagivate to folder /backend**
  ```
  cd backend/
  ```
- **Install Dependency Packages:**
  ```
  pip install -r requirement.txt
  ```
- **After installing dependency, navigate to folder Server and run the Server on Specified IP (0.0.0.0) and Port (8000):**
  ```
  cd Server/
  python main.py
  ```
## Settings up ReactJS
- **Make sure dependency for ReactJS is installed**
  Install NodeJs: https://www.youtube.com/watch?v=KtTe_ckT3iM
- **Nagivate to folder MyApp**
  ```
  cd frontend/MyApp
  ```
- **Install packages for UI** (for the first installation only)
  ```
  npm install
  ```
- **Run application**
  ```
  npm start
  ```

