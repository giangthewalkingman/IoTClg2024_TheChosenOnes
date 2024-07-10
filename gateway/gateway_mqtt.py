import time
import mysql.connector
import paho.mqtt.client as mqtt
from getmac import get_mac_address

MAC = get_mac_address()     # MAC address here

# Cấu hình MySQL
MYSQL_HOST = 'localhost'
MYSQL_USER = 'root'
MYSQL_PASSWORD = ''
MYSQL_DATABASE = 'schema_gateway'

# Cấu hình MQTT
MQTT_BROKER = '0.0.0.0' # change to local IP server
MQTT_PORT = 1883

# publish topic
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

# Hàm kết nối tới MQTT Broker và gửi dữ liệu
def publish_to_mqtt(data, topic):
    message = ', '.join(map(str, data))
    result = client.publish(topic, message)
    if result.rc == mqtt.MQTT_ERR_SUCCESS:
        print(f"Published to {topic}: {message}")
    else:
        print(f"Failed to publish to {topic}")

# Hàm gửi keepalive
def send_keepalive():
    keepalive_message = {
        "operator": "keepalive",
        "status": 1,
        "info": {
            "mac": MAC
        }
    }
    publish_to_mqtt(keepalive_message, MQTT_TOPIC_GATEWAY_KEEPALIVE)

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
