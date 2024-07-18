import serial
import csv
import os
import zmq

# Configure the serial port (adjust as necessary)
serial_port = '/dev/ttyACM0'  # Replace with your serial port
baud_rate = 9600              # Replace with your baud rate

# Open the serial port
ser = serial.Serial(serial_port, baud_rate, timeout=1)

# Path to the CSV file
csv_file_path = '/home/giang/Documents/iot-clg-db/output/output.csv'

# ZeroMQ configuration
context = zmq.Context()
socket = context.socket(zmq.PUB)
socket.bind("tcp://*:5555")

# Initialize a list to store the lines
lines = []

# Read existing data if the file already exists
if os.path.exists(csv_file_path):
    with open(csv_file_path, 'r', newline='') as csvfile:
        csvreader = csv.reader(csvfile)
        for row in csvreader:
            lines.append(row[0])  # Assuming each row has one column named 'Data'

# Function to write the current lines to the CSV file
def write_to_csv():
    with open(csv_file_path, 'w', newline='') as csvfile:
        csvwriter = csv.writer(csvfile)
        csvwriter.writerow(['Data'])  # Write the header row
        for line in lines:
            csvwriter.writerow([line])

try:
    while True:
        # Read a line from the serial port
        line = ser.readline().decode('utf-8', errors='ignore').strip()
        if line:
            print(f"Received: {line}")  # Print the line (optional)
            # Add the new line to the list
            lines.append(line)
            # Publish the line to the ZeroMQ socket
            socket.send_string(line)
            # If the list exceeds 1000 lines, remove the oldest line
            if len(lines) > 1000:
                lines.pop(0)
            # Write the updated list to the CSV file
            write_to_csv()
except KeyboardInterrupt:
    # Exit the loop on Ctrl+C
    print("Exiting...")
finally:
    # Close the serial port
    ser.close()
    socket.close()
    context.term()
