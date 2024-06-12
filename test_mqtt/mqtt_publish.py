import paho.mqtt.client as mqtt


BROKER = "127.0.0.1"
PORT = 1883

# Define the MQTT broker details
broker = BROKER
port = PORT

# Define the topic to publish to
topic = "test/topic"

# Create a new MQTT client instance
client = mqtt.Client()

# Connect to the broker
client.connect(broker, port)

# Function to publish a message
def publish_message(message):
    result = client.publish(topic, message)
    status = result[0]
    if status == 0:
        print(f"Message '{message}' sent to topic '{topic}'")
    else:
        print(f"Failed to send message to topic {topic}")

# Publish a test message
publish_message("Hello MQTT")

# Disconnect the client
client.disconnect()
