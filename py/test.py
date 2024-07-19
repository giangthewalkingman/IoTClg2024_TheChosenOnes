import zmq

def read_data():
    context = zmq.Context()
    socket = context.socket(zmq.PULL)
    socket.connect("tcp://localhost:5432")

    while True:
        message = socket.recv()
        data_str = message.decode('utf-8')
        data = list(map(int, data_str.split(',')))
        print(f"Received data: {data}")

if __name__ == "__main__":
    read_data()
