# HOW TO SETUP APPLICATION ON UBUNTU

## Settings up MySQL with XAMPP (later)

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
- **Python 3.12**
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
- **Nagivate to folder MyApp**
  ```
  cd frontend/MyApp
  ```
- **Install packages for UI**
  ```
  npm install
  ```
- **Run application**
  ```
  npm start
  ```

