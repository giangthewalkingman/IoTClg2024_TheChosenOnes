import time
import mysql.connector
import paho.mqtt.client as mqtt

# Cấu hình MySQL
MYSQL_HOST = 'localhost'
MYSQL_USER = 'root'
MYSQL_PASSWORD = '12345678'
MYSQL_DATABASE = 'schema_gateway'

# Cấu hình MQTT
MQTT_BROKER = 'test.mosquitto.org'
MQTT_PORT = 1883
MQTT_TOPIC_PMV = 'pmv_data'
MQTT_TOPIC_SENSOR = 'sensor_data'
MQTT_TOPIC_AC = 'air_conditioner_data'
MQTT_TOPIC_FAN = 'fan_data'
MQTT_TOPIC_EM = 'energy_measure_data'

# pmvtable
def fetch_pmv_data():
    try:
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE
        )
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM pmvtable")
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return result
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

# sensornode
def fetch_sensor_data():
    try:
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE
        )
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sensornode")
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return result
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

# fan
def fetch_fan_data():
    try:
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE
        )
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM fan")
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return result
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

# energymeasure
def fetch_em_data():
    try:
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE
        )
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM energymeasure")
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return result
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

# air_conditioner
def fetch_ac_data():
    try:
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE
        )
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM airconditioner")
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return result
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

# Callback khi kết nối thành công
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT Broker!")
    else:
        print(f"Failed to connect, return code {rc}")

# Callback khi ngắt kết nối
def on_disconnect(client, userdata, rc):
    if rc != 0:
        print("Unexpected disconnection.")
    else:
        print("Disconnected from MQTT Broker")

# Callback khi một tin nhắn được gửi thành công
def on_publish(client, userdata, mid):
    print("Message published.")

# Hàm kết nối tới MQTT và gửi dữ liệu
def publish_to_mqtt(data, topic):
    message = ', '.join(map(str, data))
    result = client.publish(topic, message)
    if result[0] == mqtt.MQTT_ERR_SUCCESS:
        print(f"Published to {topic}: {message}")
    else:
        print(f"Failed to publish to {topic}")

if __name__ == "__main__":
    client = mqtt.Client()

    # Gán các callback
    client.on_connect = on_connect
    client.on_disconnect = on_disconnect
    client.on_publish = on_publish

    # Thiết lập tự động kết nối lại
    client.reconnect_delay_set(min_delay=1, max_delay=120)

    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_start()

    while True:
        pmv_data = fetch_pmv_data()
        if pmv_data:
            publish_to_mqtt(pmv_data, MQTT_TOPIC_PMV)

        sensor_data = fetch_sensor_data()
        if sensor_data:
            publish_to_mqtt(sensor_data, MQTT_TOPIC_SENSOR)

        fan_data = fetch_fan_data()
        if fan_data:
            publish_to_mqtt(fan_data, MQTT_TOPIC_FAN)

        em_data = fetch_em_data()
        if em_data:
            publish_to_mqtt(em_data, MQTT_TOPIC_EM)

        ac_data = fetch_ac_data()
        if ac_data:
            publish_to_mqtt(ac_data, MQTT_TOPIC_AC)

        time.sleep(60 * 15)

    client.loop_stop()
    client.disconnect()
