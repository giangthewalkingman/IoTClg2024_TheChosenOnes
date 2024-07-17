import serial
import csv

# Configure the serial port (adjust as necessary)
serial_port = '/dev/ttyACM0'  # Replace with your serial port
baud_rate = 9600              # Replace with your baud rate

# Open the serial port
ser = serial.Serial(serial_port, baud_rate, timeout=1)

# Open a CSV file to save the data
with open('../output/output.csv', 'w', newline='') as csvfile:
    csvwriter = csv.writer(csvfile)
    
    # Optionally write a header row
    csvwriter.writerow(['Data'])

    try:
        while True:
            # Read a line from the serial port
            line = ser.readline().decode('utf-8', errors='ignore').strip()
            if line:
                print(f"Received: {line}")  # Print the line (optional)
                # Write the line to the CSV file
                csvwriter.writerow([line])
    except KeyboardInterrupt:
        # Exit the loop on Ctrl+C
        print("Exiting...")
    finally:
        # Close the serial port
        ser.close()
