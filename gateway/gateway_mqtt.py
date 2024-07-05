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
MQTT_BROKER = '0.0.0.0'
MQTT_PORT = 1883
MQTT_TOPIC_GATEWAY_SENSORS = 'gateway/sensors'
MQTT_TOPIC_GATEWAY_KEEPALIVE = 'gateway/keepalive'

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
            publish_to_mqtt(pmv_data, MQTT_TOPIC_GATEWAY_SENSORS)

        if sensor_data:
            publish_to_mqtt(sensor_data, MQTT_TOPIC_GATEWAY_SENSORS)

        if fan_data:
            publish_to_mqtt(fan_data, MQTT_TOPIC_GATEWAY_SENSORS)

        if em_data:
            publish_to_mqtt(em_data, MQTT_TOPIC_GATEWAY_SENSORS)

        if ac_data:
            publish_to_mqtt(ac_data, MQTT_TOPIC_GATEWAY_SENSORS)

        # Gửi keepalive mỗi 30 phút (1800 giây)
        send_keepalive()
        time.sleep(1800)

    client.loop_stop()
    client.disconnect()
