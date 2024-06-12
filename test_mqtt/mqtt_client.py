import paho.mqtt.client as mqtt

# Định nghĩa các thông số kết nối
broker = "192.168.30.7"
port = 1883
username = "your_username"
password = "your_password"

# Hàm callback khi kết nối thành công
def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    client.subscribe("your/topic")

# Hàm callback khi nhận được tin nhắn
def on_message(client, userdata, msg):
    print(msg.topic + " " + str(msg.payload))

# Tạo một client MQTT
client = mqtt.Client()

# Đặt username và password
client.username_pw_set(username, password)

# Đặt các hàm callback
client.on_connect = on_connect
client.on_message = on_message

# Kết nối tới broker
client.connect(broker, port, 60)

# Bắt đầu vòng lặp
client.loop_forever()
