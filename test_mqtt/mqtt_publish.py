import json
import paho.mqtt.client as mqtt

BROKER = "0.0.0.0"
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
    # Convert message to JSON string
    message_json = json.dumps(message)
    result = client.publish(topic, message_json)
    status = result[0]
    if status == 0:
        print(f"Message '{message_json}' sent to topic '{topic}'")
    else:
        print(f"Failed to send message to topic {topic}")

# Publish a test message
publish_message(['a', 'b', 'c'])

# Disconnect the client
client.disconnect()
