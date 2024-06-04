import time
from datetime import datetime, timedelta
from multiprocessing import Process

import flask
import requests
from flask import Flask, jsonify, request
import mysql.connector
from mysql.connector import Error
from flask_cors import CORS
import paho.mqtt.client as mqtt
import json

app = Flask(__name__)
CORS(app)

# MySQL configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'schema_gateway'
}

# MQTT configuration
mqtt_broker = 'your_mqtt_broker'
mqtt_port = 1883
mqtt_topic = 'gateway/sensor_registration'

# Hàm để tạo kết nối MySQL
def create_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        if connection.is_connected():
            return connection
    except Error as e:
        print("Error while connecting to MySQL:", e)
        return None

@app.route('/')
def home():
    return 'Welcome to Gateway API!'

@app.route('/register_sensor', methods=['POST'])
def register_sensor():
    data = request.json
    sensor_id = data.get('sensor_id')
    room_id = data.get('room_id')
    x_pos = data.get('x_pos')
    y_pos = data.get('y_pos')

    if None in (sensor_id, room_id, x_pos, y_pos):
        return jsonify({"error": "Missing required fields"}), 400  # Bad Request

    # Save sensor registration data to MySQL
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Internal Server Error

    cursor = db.cursor()
    query = "INSERT INTO registration_sensor (sensor_id, room_id, x_pos, y_pos) VALUES (%s, %s, %s, %s)"
    cursor.execute(query, (sensor_id, room_id, x_pos, y_pos))
    db.commit()
    cursor.close()
    db.close()

    # Publish sensor registration to MQTT
    mqtt_client.publish(mqtt_topic, json.dumps(data))

    return jsonify({"message": "Sensor registered successfully"}), 201  # 201 (Created)

def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    client.subscribe(mqtt_topic)

def on_message(client, userdata, msg):
    print(msg.topic + " " + str(msg.payload))
    data = json.loads(msg.payload)

    sensor_id = data.get('sensor_id')
    room_id = data.get('room_id')
    x_pos = data.get('x_pos')
    y_pos = data.get('y_pos')

    # Save sensor registration data to MySQL
    db = create_connection()
    if db is None:
        print("Unable to connect to database")
        return

    cursor = db.cursor()
    query = "INSERT INTO registration_sensor (sensor_id, room_id, x_pos, y_pos) VALUES (%s, %s, %s, %s)"
    cursor.execute(query, (sensor_id, room_id, x_pos, y_pos))
    db.commit()
    cursor.close()
    db.close()

def connect_mqtt(client, broker, port, on_connect, on_message):
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(broker, port, 60)

# MQTT client setup for the server
mqtt_client = mqtt.Client()
connect_mqtt(mqtt_client, mqtt_broker, mqtt_port, on_connect, on_message)

# Start the MQTT client loop in a separate thread
import threading
mqtt_thread = threading.Thread(target=mqtt_client.loop_forever)
mqtt_thread.start()

if __name__ == '__main__':
    app.run(debug=True)
