import json
import mysql.connector
from mysql.connector import Error
import paho.mqtt.client as mqtt

# MQTT configurations
mqtt_broker = '0.0.0.0'  # example broker address
mqtt_port = 1883
mqtt_topic_pmv = 'gateway/pmv_data'
mqtt_topic_sensor = 'gateway/sensor_data'
mqtt_topic_fan = 'gateway/fan_data'
mqtt_topic_em = 'gateway/energy_measure_data'
mqtt_topic_ac = 'gateway/air_conditioner_data'

# MySQL configurations
mysql_host = 'localhost'
mysql_user = 'root'
mysql_password = 'your_password'
mysql_database = 'schema_server'

# Callback when connecting to MQTT broker
def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")
    client.subscribe([(mqtt_topic_pmv, 0), (mqtt_topic_sensor, 0), (mqtt_topic_fan, 0), (mqtt_topic_em, 0), (mqtt_topic_ac, 0)])

# Callback when receiving a message from MQTT broker
def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload)
        topic = msg.topic
        if topic == mqtt_topic_pmv:
            save_pmv_data(payload)
        elif topic == mqtt_topic_sensor:
            save_sensor_data(payload)
        elif topic == mqtt_topic_fan:
            save_fan_data(payload)
        elif topic == mqtt_topic_em:
            save_em_data(payload)
        elif topic == mqtt_topic_ac:
            save_ac_data(payload)
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")

# Function to save PMV data to MySQL database
def save_pmv_data(data):
    pass

# Function to save sensor data to MySQL database
def save_sensor_data(data):
    try:
        connection = mysql.connector.connect(
            host=mysql_host,
            user=mysql_user,
            password=mysql_password,
            database=mysql_database
        )
        if connection.is_connected():
            cursor = connection.cursor()
            query = "INSERT INTO sensor_node (sensor_id, temp, wind, humid, pm25, status) VALUES (%s, %s, %s, %s, %s, %s)"
            cursor.execute(query, (data['sensor_id'], data['temp'], data['wind'], data['humid'], data['pm25'], data['status']))
            connection.commit()
            print(f"Saved sensor data: {data}")
            cursor.close()
    except Error as e:
        print(f"Error saving sensor data to MySQL: {e}")
    finally:
        if connection and connection.is_connected():
            connection.close()

# Function to save fan data to MySQL database
def save_fan_data(data):
    try:
        connection = mysql.connector.connect(
            host=mysql_host,
            user=mysql_user,
            password=mysql_password,
            database=mysql_database
        )
        if connection.is_connected():
            cursor = connection.cursor()
            query = "INSERT INTO fan (fan_id, set_speed, control_mode, set_time, status) VALUES (%s, %s, %s, %s, %s)"
            cursor.execute(query,
                           (data['fan_id'], data['set_speed'], data['control_mode'], data['set_time'], data['status']))
            connection.commit()
            print(f"Saved fan data: {data}")
            cursor.close()
    except Error as e:
        print(f"Error saving fan data to MySQL: {e}")
    finally:
        if connection and connection.is_connected():
            connection.close()

# Function to save energy measure data to MySQL database
def save_em_data(data):
    try:
        connection = mysql.connector.connect(
            host=mysql_host,
            user=mysql_user,
            password=mysql_password,
            database=mysql_database
        )
        if connection.is_connected():
            cursor = connection.cursor()
            query = "INSERT INTO energy_measure (em_id, voltage, current, frequency, active_power, power_factor, status) VALUES (%s, %s, %s, %s, %s, %s, %s)"
            cursor.execute(query,
                           (data['em_id'], data['voltage'], data['current'], data['frequency'], data['active_power'], data['power_factor'], data['status']))
            connection.commit()
            print(f"Saved em data: {data}")
            cursor.close()
    except Error as e:
        print(f"Error saving fan em to MySQL: {e}")
    finally:
        if connection and connection.is_connected():
            connection.close()

# Function to save air conditioner data to MySQL database
def save_ac_data(data):
    try:
        connection = mysql.connector.connect(
            host=mysql_host,
            user=mysql_user,
            password=mysql_password,
            database=mysql_database
        )
        if connection.is_connected():
            cursor = connection.cursor()
            query = "INSERT INTO air_conditioner (ac_id, set_temp, control_mode, state) VALUES (%s, %s, %s, %s)"
            cursor.execute(query,
                           (data['ac_id'], data['set_temp'], data['control_mode'], data['state']))
            connection.commit()
            print(f"Saved ac data: {data}")
            cursor.close()
    except Error as e:
        print(f"Error saving fan ac to MySQL: {e}")
    finally:
        if connection and connection.is_connected():
            connection.close()

# Initialize MQTT client
mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
mqtt_client.connect(mqtt_broker, mqtt_port, 60)

# Start the MQTT client loop
mqtt_client.loop_forever()
