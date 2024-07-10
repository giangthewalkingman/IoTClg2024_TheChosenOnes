import json
import paho.mqtt.client as mqtt
import threading
import time
import mysql.connector
from mysql.connector import Error

# MQTT configurations
mqtt_broker = '0.0.0.0'  # broker IP is local machine IP
mqtt_port = 1883

# PUBLISH TOPIC
MQTT_GATEWAY_LINKING =          'gateway/permission'
MQTT_TOPIC_CONNECT_KEY =        'gateway/connect_key'
MQTT_TOPIC_KEEPALIVE =          'gateway/keepalive'
MQTT_SENSOR_SEND_NODE_INFO =    'gateway/sensor/node_info'
MQTT_ENERGY_SEND_NODE_INFO =    'gateway/energy/node_info'
MQTT_FAN_NODE_SEND_NODE_INFO =  'gateway/fan/node_info'
MQTT_AC_SEND_NODE_INFO =        'gateway/ac/node_info'

MQTT_SEND_ENV_PARAMS =          'gateway/env_params'
MQTT_TOPIC_CONTROL_FAN =        'gateway/fan/control'
MQTT_TOPIC_CONTROL_AC =         'gateway/ac/control'

# SUBCRIBE TOPIC
MQTT_GATEWAY_REGISTRY =         'server/connect'
MQTT_TOPIC_CONNECT_KEY_ACK =    'server/connect_key_ack'
MQTT_SENSOR_NODE_CONNECT =      'server/sensor/connect'
MQTT_ENERGY_NODE_CONNECT =      'server/energy/connect'
MQTT_FAN_NODE_CONNECT =         'server/fan/connect'
MQTT_AC_NODE_CONNECT =          'server/ac/connect'
MQTT_SENSOR_SEND_NODE_INFO_ACK =    'gateway/sensor/node_info'
MQTT_ENERGY_SEND_NODE_INFO_ACK =    'gateway/energy/node_info'
MQTT_FAN_SEND_NODE_INFO_ACK =  'gateway/energy/node_info'
MQTT_AC_SEND_NODE_INFO_ACK =        'gateway/energy/node_info'
MQTT_TOPIC_KEEPALIVE_ACK =          'server/keepalive_ack'

MQTT_TOPIC_PMV_DATA =           'server/pmv_data'
MQTT_TOPIC_SENSOR_DATA =        'server/sensor_data'
MQTT_TOPIC_FAN_DATA =           'server/fan_data'
MQTT_TOPIC_EM_DATA =            'server/energy_measure_data'
MQTT_TOPIC_AC_DATA =            'server/air_conditioner_data'

MQTT_SEND_ENV_PARAMS_ACK =      'server/env_params_ack'
MQTT_TOPIC_CONTROL_FAN_ACK =    'server/fan/control_ack'
MQTT_TOPIC_CONTROL_AC_ACK =     'server/ac/control_ack'

# Connect to MQTT broker
def connect_mqtt():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(mqtt_broker, mqtt_port, 60)
    print("Connected to MQTT")
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
    
# MQTT callbacks
def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    client.subscribe(MQTT_GATEWAY_REGISTRY)
    client.subscribe(MQTT_TOPIC_CONNECT_KEY_ACK)
    client.subscribe(MQTT_SENSOR_NODE_CONNECT)
    client.subscribe(MQTT_ENERGY_NODE_CONNECT)
    client.subscribe(MQTT_FAN_NODE_CONNECT)
    client.subscribe(MQTT_AC_NODE_CONNECT)
    client.subscribe(MQTT_SENSOR_SEND_NODE_INFO_ACK)
    client.subscribe(MQTT_ENERGY_SEND_NODE_INFO_ACK)
    client.subscribe(MQTT_FAN_SEND_NODE_INFO_ACK)
    client.subscribe(MQTT_AC_SEND_NODE_INFO_ACK)
    client.subscribe(MQTT_TOPIC_KEEPALIVE_ACK)
    client.subscribe(MQTT_TOPIC_PMV_DATA, 0)
    client.subscribe(MQTT_TOPIC_SENSOR_DATA, 0)
    client.subscribe(MQTT_TOPIC_FAN_DATA, 0)
    client.subscribe(MQTT_TOPIC_EM_DATA, 0)
    client.subscribe(MQTT_TOPIC_AC_DATA, 0)
    client.subscribe(MQTT_TOPIC_CONTROL_AC_ACK)
    client.subscribe(MQTT_TOPIC_CONTROL_FAN_ACK)

def on_message(client, userdata, msg):
    print(msg.topic + " " + str(msg.payload))
    message = json.loads(msg.payload.decode())
    if msg.topic == MQTT_TOPIC_CONNECT_KEY_ACK:
        print("From topic " + MQTT_TOPIC_CONNECT_KEY_ACK)
        sendConnectKeyAck(message)
    elif msg.topic == MQTT_GATEWAY_REGISTRY:
        print("From topic " + MQTT_GATEWAY_REGISTRY)
        gatewayRegistry(message)
    elif msg.topic == MQTT_SENSOR_NODE_CONNECT:
        print("From topic " + MQTT_SENSOR_NODE_CONNECT)
        notifyNodeConnected(message, "sensor")
    elif msg.topic == MQTT_ENERGY_NODE_CONNECT:
        print("From topic " + MQTT_ENERGY_NODE_CONNECT)
        notifyNodeConnected(message, "energy")
    elif msg.topic == MQTT_FAN_NODE_CONNECT:
        print("From topic " + MQTT_FAN_NODE_CONNECT)
        notifyNodeConnected(message, "fan")
    elif msg.topic == MQTT_AC_SEND_NODE_INFO:
        print("From topic " + MQTT_AC_SEND_NODE_INFO)
        notifyNodeConnected(message, "ac")
    elif msg.topic == MQTT_TOPIC_PMV_DATA:
        print("From topic " + MQTT_TOPIC_PMV_DATA)
        save_pmv_data(message)
    elif msg.topic == MQTT_TOPIC_SENSOR_DATA:
        print("From topic " + MQTT_TOPIC_SENSOR_DATA)
        save_sensor_data(message)
    elif msg.topic == MQTT_TOPIC_FAN_DATA:
        print("From topic " + MQTT_TOPIC_FAN_DATA)
        save_fan_data(message)
    elif msg.topic == MQTT_TOPIC_EM_DATA:
        print("From topic " + MQTT_TOPIC_EM_DATA)
        save_em_data(message)
    elif msg.topic == MQTT_TOPIC_AC_DATA:
        print("From topic " + MQTT_TOPIC_AC_DATA)
        save_ac_data(message)
    elif msg.topic == MQTT_SENSOR_SEND_NODE_INFO_ACK:
        print("From topic " + MQTT_SENSOR_SEND_NODE_INFO_ACK)
        sendNodeInfoAck(message)
    elif msg.topic == MQTT_ENERGY_SEND_NODE_INFO_ACK:
        print("From topic " + MQTT_ENERGY_SEND_NODE_INFO_ACK)
        sendNodeInfoAck(message)
    elif msg.topic == MQTT_FAN_SEND_NODE_INFO_ACK:
        print("From topic " + MQTT_FAN_SEND_NODE_INFO_ACK)
        sendNodeInfoAck(message)
    elif msg.topic == MQTT_AC_SEND_NODE_INFO_ACK:
        print("From topic " + MQTT_AC_SEND_NODE_INFO_ACK)
        sendNodeInfoAck(message)
    elif msg.topic == MQTT_TOPIC_KEEPALIVE_ACK:
        # handle_keepalive_ack(message)
        # distinguish each ack
        print(message)
    elif msg.topic == MQTT_SEND_ENV_PARAMS_ACK:
        print("From topic " + MQTT_SEND_ENV_PARAMS_ACK)
        sendEnvSettingsAck(message)
    elif msg.topic == MQTT_TOPIC_CONTROL_FAN_ACK:
        print("From topic " + MQTT_TOPIC_CONTROL_FAN_ACK)
        controlFanAck(message)
    elif msg.topic == MQTT_TOPIC_CONTROL_AC_ACK:
        print("From topic " + MQTT_TOPIC_CONTROL_AC_ACK)
        controlACAck(message)

# Global variables for ACK
ack_received = threading.Event() # pass this to other py program
node_info_ack_received = threading.Event()
send_env_params_ack_received = threading.Event()
send_env_params_ack_count = 0
send_env_params_ack_max = 0
ack_info = None

def gatewayRegistry(message):
    db = create_connection()
    if db is None:
        print("Unable to connect to database")
        return
    
    mac = message["info"]["mac"]
    if mac is None:
        print("Unexpected MAC Address")
        return
    
    cursor = db.cursor()
    query = """INSERT INTO `registration_gateway`(`room_id`, `connected`, `mac`, `description`, `x_pos`, `y_pos`) 
    VALUES ('-1','0',%s,'%s','-1','-1')"""
    cursor.execute(query, (mac, mac,))
    cursor.commit()
    print(f"Gateway with MAC address {mac} is ready to join network")
    cursor.close()
    db.close()

# This function will be executed if MAC address is found in database
def gatewayLinking(mac):
    message = {
        "operator": "gateway_permission",
        "status": 1,
        "info": {
            "mac": mac,
            "allowed": 1,
        }
    }
    mqtt_pub_message = json.dumps(message)
    result = mqtt_client.publish(MQTT_GATEWAY_LINKING, mqtt_pub_message)
    status = result[0]
    if status == 0:
        # Return true for update gateway infomation
        return True
    return False

# This function is executed after checking mac address or gateway ID
def sendConnectKey(node_type, mac, connect_key):
    message = {
        "operator": "connect_key",
        "status": 1,
        "info": {
            "mac": mac,
            "connect_key": connect_key,
            "type_node": node_type,
        }
    }
    print(message);
    mqtt_pub_message = json.dumps(message)
    result = mqtt_client.publish(MQTT_GATEWAY_LINKING, mqtt_pub_message)
    status = result[0]
    if status == 0:
        if not ack_received.wait(timeout=60):  # 1 minutes timeout
            return False
    print("Network is opened for 60 seconds for device to join")
    return True

# Catch ack message when waiting device to be connected
def sendConnectKeyAck(message):
    operator = message["operator"]
    status = message["status"]
    if operator == "connect_key_ack" and status == 1:
        ack_received.set()
    
def notifyNodeConnected(message, type_node):
    mac = message["mac"]
    mqtt_topic = None
    add_query = None
    find_query = None
    if mac == '':
        print("Unknown MAC Address")
        return
    if type_node == "sensor":
        mqtt_topic = MQTT_SENSOR_SEND_NODE_INFO
        add_query = "INSERT INTO `registration_sensor`(`room_id`, `x_pos`, `y_pos`, `gateway_id`) VALUES ('%s','-1','-1','%s')"
        find_query = "SELECT sensor_id AS id FROM `registration_sensor` ORDER BY sensor_id DESC LIMIT 1"
    elif type_node == "energy":
        mqtt_topic = MQTT_ENERGY_SEND_NODE_INFO
        add_query = "INSERT INTO `registration_em`(`room_id`, `x_pos`, `y_pos`, `gateway_id`) VALUES ('%s','-1','-1','%s')"
        find_query = "SELECT em_id AS id FROM `registration_em` ORDER BY em_id DESC LIMIT 1"
    elif type_node == "fan":
        mqtt_topic = MQTT_FAN_NODE_SEND_NODE_INFO
        add_query = "INSERT INTO `registration_fan`(`room_id`, `x_pos`, `y_pos`, `model`, `sensor_link`, `gateway_id`) VALUES ('%s','-1','-1','','','%s')"
        find_query = "SELECT fan_id AS id FROM `registration_fan` ORDER BY fan_id DESC LIMIT 1"
    elif type_node == "ac":
        mqtt_topic = MQTT_AC_SEND_NODE_INFO
        add_query = "INSERT INTO `registration_ac`(`room_id`, `x_pos`, `y_pos`, `model`, `sensor_link`, `gateway_id`) VALUES ('%s','-1','-1','','','%s')"
        find_query = "SELECT ac_id AS id FROM `registration_ac` ORDER BY ac_id DESC LIMIT 1"
    else:
        print("Wrong type node in notifyNodeConnected")
        return
    db = create_connection()
    if db is None:
        print("Unable to connect to database")
        return
    cursor = db.cursor()
    query = "SELECT `gateway_id`, `room_id` FROM `registration_gateway` WHERE mac = %s"
    cursor.execute(query, (mac, ))
    gateway = cursor.fetchone()
    
    if not gateway:
        cursor.close()
        db.close()
        return
    
    cursor.execute(add_query, (gateway["room_id"], gateway["gateway_id"],))
    db.commit()
    cursor.execute(find_query)
    node_id = cursor.fetchone()["id"]
    sendNodeInfo(type_node, node_id, mac, mqtt_topic)

def sendNodeInfo(type_node, node_id, mac, mqtt_topic):
    message = None
    if type_node == "sensor":
        message = {
            "operator": "sensor_join",
            "status": 1,
            "info": {
                "mac": mac,
                "sensor_id": node_id,
            }
        }
    elif type_node == "energy":
        message = {
            "operator": "em_join",
            "status": 1,
            "info": {
                "mac": mac,
                "em_id": node_id,
            }
        }
    elif type_node == "fan":
        message = {
            "operator": "fan_join",
            "status": 1,
            "info": {
                "mac": mac,
                "fan_id": node_id,
            }
        }
    elif type_node == "ac":
        message = {
            "operator": "ac_join",
            "status": 1,
            "info": {
                "mac": mac,
                "ac_id": node_id,
            }
        }
    mqtt_pub_message = json.dumps(message)
    result = mqtt_client.publish(mqtt_topic, mqtt_pub_message)
    status = result[0]
    if status != 0:
        print("Can not send node info to gateway")
    
def sendNodeInfoAck(message):
    operator = message["operator"]
    status = message["status"]
    if status == 1:
        if operator == "sensor_join_ack" or operator == "em_join_ack" or operator == "fan_join_ack" or operator == "ac_join_ack":
            node_info_ack_received.set()

def save_pmv_data(data):
    db = create_connection()
    if db is None:
        print("Unable to connect to database")
        return
    
    cursor = db.cursor()
    find_query = "SELECT room_id FROM `registration_sensor` WHERE sensor_id = %s"
    cursor.execute(find_query, (data["sensor_id"],))
    room_id = cursor.fetchone()["room_id"]
    query = """INSERT INTO `pmv_table`
    (`room_id`, `sensor_id`, `met`, `clo`, `temp`, `wind`, `pmv_ref`, `pmv`, `status`) 
    VALUES ('%s','%s','%s','%s','%s','%s','%s','%s','1')"""
    cursor.execute(query, (room_id, data['sensor_id'], data['met'], data['clo'], data['temp'], data['wind'], data['pmv_ref'], data["pmv"],))
    db.commit()
    print(f"Saved pmv data: {data}")
    cursor.close()
    db.close()

# Function to save sensor data to MySQL database
def save_sensor_data(data):
    db = create_connection()
    if db is None:
        print("Unable to connect to database")
        return
    
    cursor = db.cursor()
    query = "INSERT INTO sensor_node (sensor_id, temp, wind, humid, pm25, status) VALUES (%s, %s, %s, %s, %s, %s)"
    cursor.execute(query, (data['sensor_id'], data['temp'], data['wind'], data['humid'], data['pm25'], data['status']))
    db.commit()
    print(f"Saved sensor data: {data}")
    cursor.close()
    db.close()

# Function to save fan data to MySQL database
def save_fan_data(data):
    db = create_connection()
    if db is None:
        print("Unable to connect to database")
        return
    
    cursor = db.cursor()
    query = "INSERT INTO fan (fan_id, set_speed, control_mode, set_time, status) VALUES (%s, %s, %s, %s, %s)"
    cursor.execute(query, (data['fan_id'], data['set_speed'], data['control_mode'], data['set_time'], data['status']))
    db.commit()
    print(f"Saved sensor data: {data}")
    cursor.close()
    db.close()

# Function to save energy measure data to MySQL database
def save_em_data(data):
    db = create_connection()
    if db is None:
        print("Unable to connect to database")
        return
    
    cursor = db.cursor()
    query = "INSERT INTO energy_measure (em_id, voltage, current, frequency, active_power, power_factor, status) VALUES (%s, %s, %s, %s, %s, %s, %s)"
    cursor.execute(query, (data['em_id'], data['voltage'], data['current'], data['frequency'], data['active_power'], data['power_factor'], data['status']))
    db.commit()
    print(f"Saved sensor data: {data}")
    cursor.close()
    db.close()

# Function to save air conditioner data to MySQL database
def save_ac_data(data):
    db = create_connection()
    if db is None:
        print("Unable to connect to database")
        return
    
    cursor = db.cursor()
    query = "INSERT INTO air_conditioner (ac_id, set_temp, control_mode, state) VALUES (%s, %s, %s, %s)"
    cursor.execute(query,(data['ac_id'], data['set_temp'], data['control_mode'], data['state']))
    db.commit()
    print(f"Saved sensor data: {data}")
    cursor.close()
    db.close()

# This function is executed in send_pmv_env
def sendEnvSettings(gateways, met, clo, pmv_ref):
    send_env_params_ack_received.clear()
    send_env_params_ack_count = 0
    mqtt_client.subscribe(MQTT_SEND_ENV_PARAMS_ACK)
    for gateway in gateways:
        mqtt_message = {
            "operator": "env_params_setting",
            "status": 1,
            "info": {
                "mac": gateway["mac"],
                "met": met,
                "clo": clo,
                "pmv_ref": pmv_ref,
            }
        }
        mqtt_client.publish(MQTT_SEND_ENV_PARAMS, json.dumps(mqtt_message))
    if not send_env_params_ack_received.wait(timeout=120):
        print(f"Only send env params successfully to {send_env_params_ack_count}/{len(gateways)} gateways")
        return False
    print("Send env params successfully")
    return True
    
def sendEnvSettingsAck(message):
    operator = message["operator"]
    status = message["status"]
    if operator == "env_params_setting_ack" and status == 1:
        send_env_params_ack_count += 1
    if (send_env_params_ack_count >= send_env_params_ack_max):
        send_env_params_ack_received.set()
        mqtt_client.unsubscribe(MQTT_SEND_ENV_PARAMS_ACK)
    
def controlFan(mac, fan_id, set_speed, control_mode, set_time):
    ack_received.clear()
    message = {
        'operator': 'fan_control',
        'status': 1,
        'info': {
            'mac': mac,
            'fan_id': fan_id,
            'set_speed': set_speed,
            'control_mode': control_mode,
            'set_time': set_time,
        }
    }
    mqtt_pub_message = json.dumps(message)
    result = mqtt_client.publish(MQTT_TOPIC_CONTROL_FAN, mqtt_pub_message)
    status = result[0]
    if status == 0:
        if not ack_received.wait(timeout=30):
            print(f"Control fan with fan_id = {fan_id} failed due to timeout")
            return False
    else:
        return False
    return True

def controlFanAck(message):
    operator = message["operator"]
    status = message["status"]
    if operator == "control_fan_ack" and status == 1:
        ack_received.set()

def controlAC(mac, ac_id, set_temp, control_mode, state):
    ack_received.clear()
    message = {
        'operator': 'fan_control',
        'status': 1,
        'info': {
            'mac': mac,
            'ac_id': ac_id,
            'set_temp': set_temp,
            'control_mode': control_mode,
            'state': state,
        }
    }
    mqtt_pub_message = json.dumps(message)
    result = mqtt_client.publish(MQTT_TOPIC_CONTROL_AC, mqtt_pub_message)
    status = result[0]
    if status == 0:
        if not ack_received.wait(timeout=30):
            print(f"Control fan with fan_id = {ac_id} failed due to timeout")
            return False
    else:
        return False
    return True

def controlACAck(message):
    operator = message["operator"]
    status = message["status"]
    if operator == "control_ac_ack" and status == 1:
        ack_received.set()

# def handle_keepalive_ack(message):
#     global ack_info
#     ack_info = message
#     ack_received.set()

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
            mqtt_client.publish(MQTT_TOPIC_KEEPALIVE, json.dumps(mqtt_message))
        time.sleep(3600)  # Sleep for 1 hour


# # Initialize MQTT client
mqtt_client = connect_mqtt()

# # Start the threads
mqtt_thread = threading.Thread(target=run_mqtt_client)
keepalive_thread = threading.Thread(target=keepalive_thread)

mqtt_thread.start()
keepalive_thread.start()

# mqtt_client.loop_forever()