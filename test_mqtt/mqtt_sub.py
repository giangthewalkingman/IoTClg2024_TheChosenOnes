import paho.mqtt.client as mqtt
import constant

# Define the MQTT broker details

broker = "127.0.0.1"
port = 1883

# Define the topic to subscribe to
topic = "test/topic"

# Callback function when a message is received
def on_message(client, userdata, message):
    print(f"Received message '{message.payload.decode()}' on topic '{message.topic}'")

# Create a new MQTT client instance
client = mqtt.Client()

# Attach the message callback function
client.on_message = on_message

# Connect to the broker
client.connect(broker, port)

# Subscribe to the topic
client.subscribe(topic)

# Start the loop to process received messages
client.loop_start()

# Keep the script running to listen for messages
try:
    while True:
        pass
except KeyboardInterrupt:
    # Graceful exit
    client.loop_stop()
    client.disconnect()
