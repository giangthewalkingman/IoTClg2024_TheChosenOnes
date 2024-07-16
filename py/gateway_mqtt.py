import time
import mysql.connector
import paho.mqtt.client as mqtt
import mysql.connector
import json
from mysql.connector import Error
from getmac import get_mac_address

MAC = get_mac_address()     # MAC address here

# Cấu hình MySQL
MYSQL_HOST = 'localhost' # change w.r.t. gateway
MYSQL_USER = 'root'
MYSQL_PASSWORD = ''
MYSQL_DATABASE = 'schema_gateway'

# Cấu hình MQTT
MQTT_BROKER = '192.168.91.7' # change to local IP server
MQTT_PORT = 1883

# publish topic
MQTT_GATEWAY_REGISTRY =         'server/connect'
MQTT_TOPIC_CONNECT_KEY_ACK =    'server/connect_key_ack'
MQTT_SENSOR_NODE_CONNECT =      'server/sensor/connect'
MQTT_ENERGY_NODE_CONNECT =      'server/energy/connect'
MQTT_FAN_NODE_CONNECT =         'server/fan/connect'
MQTT_AC_NODE_CONNECT =          'server/ac/connect'
MQTT_SENSOR_SEND_NODE_INFO_ACK =    'server/sensor/node_info_ack'
MQTT_ENERGY_SEND_NODE_INFO_ACK =    'server/energy/node_info_ack'
MQTT_FAN_SEND_NODE_INFO_ACK =       'server/fan/node_info_ack'
MQTT_AC_SEND_NODE_INFO_ACK =        'server/ac/node_info_ack'
MQTT_TOPIC_KEEPALIVE_ACK =          'server/keepalive_ack'

MQTT_TOPIC_PMV_DATA =           'server/pmv_data'
MQTT_TOPIC_SENSOR_DATA =        'server/sensor_data'
MQTT_TOPIC_FAN_DATA =           'server/fan_data'
MQTT_TOPIC_EM_DATA =            'server/energy_measure_data'
MQTT_TOPIC_AC_DATA =            'server/air_conditioner_data'

MQTT_TOPIC_CONTROL_FAN_ACK =    'server/fan/control_ack'
MQTT_TOPIC_CONTROL_AC_ACK =     'server/ac/control_ack'

# subscribe topic
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

# Hàm lấy dữ liệu từ MySQL
def fetch_data_from_mysql(query):
    try:
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE
        )
        cursor = conn.cursor()
        cursor.execute(query)
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return result
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None
    
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
    
# Connect to MQTT broker
def connect_mqtt():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    print("Connected to MQTT")
    return client

# Callback khi kết nối thành công tới MQTT Broker
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT Broker!")
    else:
        print(f"Failed to connect, return code {rc}")

# Callback khi ngắt kết nối với MQTT Broker
def on_disconnect(client, userdata, rc):
    if rc != 0:
        print("Unexpected disconnection.")
    else:
        print("Disconnected from MQTT Broker")

# Callback khi một tin nhắn được gửi thành công
def on_publish(client, userdata, mid):
    print("Message published.")

def on_message(client, userdata, msg):
    print(msg.topic + " " + str(msg.payload))
    message = json.loads(msg.payload.decode())
    if msg.topic == MQTT_GATEWAY_LINKING:
        print("From topic " + MQTT_GATEWAY_LINKING)
        gatewayLinking(message)
    elif msg.topic == MQTT_TOPIC_CONNECT_KEY:
        print("From topic " + MQTT_TOPIC_CONNECT_KEY)
        connectKey(message)
    elif msg.topic == MQTT_TOPIC_KEEPALIVE:
        print("From topic " + MQTT_TOPIC_KEEPALIVE)
        send_keepalive(message)
    elif msg.topic == MQTT_SENSOR_SEND_NODE_INFO:
        print("From topic " + MQTT_SENSOR_SEND_NODE_INFO)
        addSensorNode(message)
    elif msg.topic == MQTT_ENERGY_SEND_NODE_INFO:
        print("From topic " + MQTT_ENERGY_SEND_NODE_INFO)
        addEnergyNode(message)
    elif msg.topic == MQTT_FAN_NODE_SEND_NODE_INFO:
        print("From topic " + MQTT_FAN_NODE_SEND_NODE_INFO)
        addFanNode(message)
    elif msg.topic == MQTT_AC_SEND_NODE_INFO:
        print("From topic " + MQTT_AC_SEND_NODE_INFO)
        addACNode(message)
    elif msg.topic == MQTT_SEND_ENV_PARAMS:
        print("From topic " + MQTT_SEND_ENV_PARAMS)
        setEnvPmv(message)
    elif msg.topic == MQTT_TOPIC_CONTROL_FAN:
        print("From topic " + MQTT_TOPIC_CONTROL_FAN)
        controlFan(message)
    elif msg.topic == MQTT_TOPIC_CONTROL_AC:
        print("From topic " + MQTT_TOPIC_CONTROL_AC)
        controlAC(message)

# Hàm kết nối tới MQTT Broker và gửi dữ liệu
def publish_to_mqtt(data, topic):
    message = ', '.join(map(str, data))
    result = client.publish(topic, message)
    if result.rc == mqtt.MQTT_ERR_SUCCESS:
        print(f"Published to {topic}: {message}")
    else:
        print(f"Failed to publish to {topic}")

# Hàm gửi keepalive
def send_keepalive(message):
    status = message["status"]
    if status == 1:
        keepalive_message = {
            "operator": "keepalive_ack",
            "status": 1,
            "info": {
                "mac": MAC
            }
        }
        publish_to_mqtt(MQTT_TOPIC_KEEPALIVE_ACK, keepalive_message)

def gatewayLinking(client, message):
    mac = message["info"]["mac"]
    allowed = message["info"]["allowed"]
    if mac == MAC and allowed == 1:
        # client subscribe all
        client.subscribe(MQTT_TOPIC_CONNECT_KEY)
        client.subscribe(MQTT_TOPIC_KEEPALIVE)
        client.subscribe(MQTT_SENSOR_SEND_NODE_INFO)
        client.subscribe(MQTT_ENERGY_SEND_NODE_INFO)
        client.subscribe(MQTT_FAN_NODE_SEND_NODE_INFO)
        client.subscribe(MQTT_AC_SEND_NODE_INFO)
        client.subscribe(MQTT_SEND_ENV_PARAMS)
        client.subscribe(MQTT_TOPIC_CONTROL_FAN)
        client.subscribe(MQTT_TOPIC_CONTROL_AC)
    elif allowed == 0:
        print("Access to database failed")

def connectKey(message):
    # mac = message["info"]["mac"]
    # type_node = message["info"]["type_node"]
    # connect_key = message["info"]["connect_key"]
    
    # if mac == MAC:
    #     # open BLE network for node
    pass

def addSensorNode(client, message):
    status = message["status"]
    mac = message["info"]["mac"]
    if status == 1 and mac == MAC:
        sensor_id = message["info"]["sensor_id"]

        db = create_connection()
        if db is None:
            print("Unable to connect to database")
            return

        cursor = db.cursor()
        query = "INSERT INTO RegistrationSensor (id) VALUES ('%s')"
        cursor.execute(query, (sensor_id,))
        db.commit()
        cursor.close()
        db.close()

        mqtt_pub_message = {
            'operator': 'add_sensor_node_ack',
            'status': 1
        }
        client.publish(MQTT_SENSOR_SEND_NODE_INFO_ACK, json.dumps(mqtt_pub_message))

def addEnergyNode(message):
    status = message["status"]
    mac = message["info"]["mac"]
    if status == 1 and mac == MAC:
        id = message["info"]["id"]

        db = create_connection()
        if db is None:
            print("Unable to connect to database")
            return

        cursor = db.cursor()
        query = "INSERT INTO RegistrationEnergy (id) VALUES ('%s')"
        cursor.execute(query, (id,))
        db.commit()
        cursor.close()
        db.close()

        mqtt_pub_message = {
            'operator': 'add_em_node_ack',
            'status': 1
        }
        client.publish(MQTT_ENERGY_SEND_NODE_INFO_ACK, json.dumps(mqtt_pub_message))

def addFanNode(message):
    status = message["status"]
    mac = message["info"]["mac"]
    if status == 1 and mac == MAC:
        id = message["info"]["id"]

        db = create_connection()
        if db is None:
            print("Unable to connect to database")
            return

        cursor = db.cursor()
        query = "INSERT INTO RegistrationFan (id, model, sensor_link) VALUES ('%s', 'pmv_model', 'None')"
        cursor.execute(query, (id,))
        db.commit()
        cursor.close()
        db.close()

        mqtt_pub_message = {
            'operator': 'add_fan_node_ack',
            'status': 1
        }
        client.publish(MQTT_FAN_SEND_NODE_INFO_ACK, json.dumps(mqtt_pub_message))

def addACNode(message):
    status = message["status"]
    mac = message["info"]["mac"]
    if status == 1 and mac == MAC:
        id = message["info"]["id"]

        db = create_connection()
        if db is None:
            print("Unable to connect to database")
            return

        cursor = db.cursor()
        query = "INSERT INTO RegistrationAC (id, model, sensor_link) VALUES ('%s', 'pmv_model', 'None')"
        cursor.execute(query, (id,))
        db.commit()
        cursor.close()
        db.close()

        mqtt_pub_message = {
            'operator': 'add_ac_node_ack',
            'status': 1
        }
        client.publish(MQTT_AC_SEND_NODE_INFO_ACK, json.dumps(mqtt_pub_message))


def setEnvPmv(message):
    status = message["status"]
    mac = message["info"]["mac"]
    if status == 1 and mac == MAC:
        met = message["info"]["met"]
        clo = message["info"]["clo"]
        pmv_ref = message["info"]["pmv_ref"]

        db = create_connection()
        if db is None:
            print("Unable to connect to database")
            return

        cursor = db.cursor()
        query = "INSERT INTO PMVtable (met, clo, pmv_ref) VALUES ('%s', '%s', '%s')"
        cursor.execute(query, (met, clo, pmv_ref,))
        db.commit()
        cursor.close()
        db.close()

def controlFan(message):
    pass
def controlAC(message):
    pass


if __name__ == "__main__":
    client = mqtt.Client()

    # Gán các callback và thiết lập kết nối
    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.on_publish = on_publish

    # Thiết lập tự động kết nối lại
    client.reconnect_delay_set(min_delay=1, max_delay=120)

    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_start()

    while True:
        # Lấy dữ liệu từ các bảng MySQL
        pmv_data = fetch_data_from_mysql("SELECT * FROM pmvtable")
        sensor_data = fetch_data_from_mysql("SELECT * FROM sensornode")
        fan_data = fetch_data_from_mysql("SELECT * FROM fan")
        em_data = fetch_data_from_mysql("SELECT * FROM energymeasure")
        ac_data = fetch_data_from_mysql("SELECT * FROM airconditioner")

        # Gửi dữ liệu lên MQTT Broker với các topic tương ứng
        if pmv_data:
            publish_to_mqtt(pmv_data, MQTT_TOPIC_PMV_DATA)

        if sensor_data:
            publish_to_mqtt(sensor_data, MQTT_TOPIC_SENSOR_DATA)

        if fan_data:
            publish_to_mqtt(fan_data, MQTT_TOPIC_FAN_DATA)

        if em_data:
            publish_to_mqtt(em_data, MQTT_TOPIC_EM_DATA)

        if ac_data:
            publish_to_mqtt(ac_data, MQTT_TOPIC_AC_DATA)

        # Gửi keepalive mỗi 30 phút (1800 giây)
        send_keepalive()
        time.sleep(1800)

    client.loop_stop()
    client.disconnect()
