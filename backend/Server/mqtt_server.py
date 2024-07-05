import json
import paho.mqtt.client as mqtt
import threading
import time
import mysql.connector
from mysql.connector import Error

# MQTT configurations
mqtt_broker = '0.0.0.0'  # broker IP is local machine IP
mqtt_port = 1883
mqtt_topic_connect_key = 'gateway/connect_key'
mqtt_topic_connect_key_ack = 'server/connect_key_ack'
mqtt_topic_keepalive = 'gateway/keepalive'
mqtt_topic_keepalive_ack = 'server/keepalive_ack'
mqtt_topic_control_fan = 'gateway/fan/control'
mqtt_topic_control_fan_ack = 'server/fan/control_ack'
mqtt_topic_control_ac = 'gateway/ac/control'
mqtt_topic_control_ac_ack = 'server/ac/control_ack'

# MQTT callbacks
def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    client.subscribe(mqtt_topic_connect_key_ack)
    client.subscribe(mqtt_topic_keepalive_ack)
    client.subscribe(mqtt_topic_control_fan_ack)
    client.subscribe(mqtt_topic_control_ac_ack)

def on_message(client, userdata, msg):
    print(msg.topic + " " + str(msg.payload))
    if msg.topic == mqtt_topic_connect_key_ack:
        handle_ack(json.loads(msg.payload))
    elif msg.topic == mqtt_topic_keepalive_ack:
        handle_keepalive_ack(json.loads(msg.payload))
    elif msg.topic == mqtt_topic_control_fan_ack:
        handle_fan_control_ack(json.loads(msg.payload))
    elif msg.topic == mqtt_topic_control_ac_ack:
        handle_ac_control_ack(json.loads(msg.payload))

# Global variables for ACK
ack_received = threading.Event()
ack_info = None

def handle_ack(message):
    global ack_info
    ack_info = message
    ack_received.set()

def handle_keepalive_ack(message):
    global ack_info
    ack_info = message
    ack_received.set()

def handle_fan_control_ack(message):
    global ack_info
    ack_info = message
    ack_received.set()

def handle_ac_control_ack(message):
    global ack_info
    ack_info = message
    ack_received.set()

# Connect to MQTT broker
def connect_mqtt():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(mqtt_broker, mqtt_port, 60)
    return client

# Start the MQTT client
def run_mqtt_client():
    mqtt_client.loop_forever()

# Function to create MySQL connection
def create_connection():
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="schema_server"
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print("Error while connecting to MySQL:", e)
        return None


# Function to fetch all gateways
def fetch_gateways():
    connection = create_connection()
    if connection is None:
        return []

    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT mac FROM registration_gateway")
    gateways = cursor.fetchall()
    cursor.close()
    connection.close()

    return gateways


# Keepalive function
def keepalive_thread():
    while True:
        gateways = fetch_gateways()
        for gateway in gateways:
            mqtt_message = {
                "operator": "keepalive",
                "status": 1,
                "info": {
                    "mac": gateway["mac"]
                }
            }
            mqtt_client.publish(mqtt_topic_keepalive, json.dumps(mqtt_message))
        time.sleep(3600)  # Sleep for 1 hour


# Initialize MQTT client
mqtt_client = connect_mqtt()

# Start the threads
mqtt_thread = threading.Thread(target=run_mqtt_client)
keepalive_thread = threading.Thread(target=keepalive_thread)

mqtt_thread.start()
keepalive_thread.start()
