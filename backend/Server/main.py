import json
import threading
import time
from datetime import datetime, timedelta
from multiprocessing import Process

import flask
import requests
from flask import Flask, jsonify, request
import mysql.connector
from mysql.connector import Error
from flask_cors import CORS
import paho.mqtt.client as mqtt

app = Flask(__name__)
CORS(app)

# Hàm để tạo kết nối MySQL
def create_connection():
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="schema_server"
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print("Error while connecting to MySQL:", e)
        return None

# init mqtt
mqtt_broker = 'test.mosquitto.org' # address broker
mqtt_port = 1883
mqtt_topic_connect_key = 'gateway/connect_key'
mqtt_topic_connect_key_ack = 'server/connect_key_ack'

# MQTT Callbacks
def on_connect(client, userdata, flags, rc):
    print("Connected with result code " + str(rc))
    client.subscribe(mqtt_topic_connect_key_ack)

def on_message(client, userdata, msg):
    print(msg.topic + " " + str(msg.payload))
    if msg.topic == mqtt_topic_connect_key_ack:
        handle_ack(json.loads(msg.payload))

# Connect MQTT
def connect_mqtt():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(mqtt_broker, mqtt_port, 60)
    return client

mqtt_client = connect_mqtt()

ack_received = threading.Event()
ack_info = None

def handle_ack(message):
    global ack_info
    ack_info = message
    ack_received.set()

def run_mqtt_client():
    mqtt_client.loop_forever()

@app.route('/')
def home():
    return 'Welcome to Flask REST API!'

@app.route('/building/getall', methods=['GET'])
def buildingGetAll():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    cursor.execute("SELECT * FROM building")
    key = [desc[0] for desc in cursor.description]
    result = [dict(zip(key, row)) for row in cursor.fetchall()]

    cursor.close()
    db.close()

    return jsonify(result), 200

@app.route('/building/insert', methods=['POST'])
def insertBuilding():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    name = request.json.get('name')
    location = request.json.get('location')
    data = (name, location)

    cursor.execute("INSERT INTO building (name, location) VALUES (%s, %s)", data)
    db.commit()

    last_inserted_id = cursor.lastrowid  # Lấy ID của hàng vừa được thêm

    # Lấy thông tin của bản ghi vừa được thêm
    cursor.execute("SELECT * FROM building WHERE building_id = %s", (last_inserted_id,))
    key = [desc[0] for desc in cursor.description]
    new_record = dict(zip(key, cursor.fetchone()))

    cursor.close()
    db.close()

    return jsonify(new_record), 201  # Trả lại bản ghi mới với mã trạng thái 201 (Created)

@app.route('/building/update/<building_id>', methods=['PUT'])
def updateBuilding(building_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()

    # Kiểm tra các trường bắt buộc
    name = request.json.get('name')
    location = request.json.get('location')

    if not name and not location:
        cursor.close()
        db.close()
        return jsonify({"error": "No updateable fields provided"}), 400  # Bad Request

    # Xây dựng truy vấn UPDATE
    update_query_parts = []
    update_values = []

    if name:
        update_query_parts.append("name = %s")
        update_values.append(name)

    if location:
        update_query_parts.append("location = %s")
        update_values.append(location)

    # Thực hiện truy vấn UPDATE
    query = f"UPDATE building SET {', '.join(update_query_parts)} WHERE building_id = %s"
    update_values.append(building_id)

    try:
        cursor.execute(query, tuple(update_values))
        db.commit()

        # Lấy bản ghi vừa được cập nhật
        cursor.execute("SELECT * FROM building WHERE building_id = %s", (building_id,))
        key = [desc[0] for desc in cursor.description]
        updated_record = dict(zip(key, cursor.fetchone()))

        cursor.close()
        db.close()

        return jsonify(updated_record), 200  # OK

    except Error as e:
        cursor.close()
        db.close()
        print("Error:", e)
        return jsonify({"error": "Failed to update building"}), 500


@app.route('/building/delete/<building_id>', methods=['DELETE'])
def deleteBuilding(building_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()

    try:
        # Kiểm tra xem bản ghi có tồn tại không
        cursor.execute("SELECT * FROM building WHERE building_id = %s", (building_id,))
        record = cursor.fetchone()

        if not record:
            cursor.close()
            db.close()
            return jsonify({"error": "Building not found"}), 404  # Nếu bản ghi không tồn tại

        # Nếu bản ghi tồn tại, tiến hành xóa
        cursor.execute("DELETE FROM building WHERE building_id = %s", (building_id,))
        db.commit()  # Lưu thay đổi

        cursor.close()
        db.close()

        return jsonify({"message": "Delete success"}), 204  # 204 (No Content) nếu xóa thành công

    except Error as e:
        print("Error during deletion:", e)  # Ghi lại lỗi
        cursor.close()
        db.close()
        return jsonify({"error": str(e)}), 500  # Nếu có lỗi, trả lại 500 (Internal Server Error)

# room
@app.route('/room/getall', methods=['GET'])
def roomGetAll():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    cursor.execute("SELECT * FROM room")
    key = [desc[0] for desc in cursor.description]
    result = [dict(zip(key, row)) for row in cursor.fetchall()]

    cursor.close()
    db.close()

    return jsonify(result), 200

@app.route('/room/getById/<room_id>', methods=['GET'])
def room_get_by_id(room_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor(dictionary=True)
    try:
        query = """
            SELECT 
                r.room_id, r.description, r.x_length, r.y_length,
                b.building_id, b.name AS building_name, b.location AS building_location
            FROM 
                room r
            JOIN 
                building b ON r.building_id = b.building_id
            WHERE r.room_id = %s
            """
        cursor.execute(query, (room_id,))
        rows = cursor.fetchall()

        result = []
        for row in rows:
            room_data = {
                "building_info": {
                    "building_id": row["building_id"],
                    "name": row["building_name"],
                    "location": row["building_location"]
                },
                "description": row["description"],
                "room_id": row["room_id"],
                "x_length": row["x_length"],
                "y_length": row["y_length"]
            }
            result.append(room_data)

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        db.close()

    return jsonify(result), 200

@app.route('/room/insert', methods=['POST'])
def insertRoom():
    db = create_connection()
    if db is None:
        print('HEHEHEHEHHEHEHEHE')
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    description = request.json.get('description')
    x_length = request.json.get('x_length')
    y_length = request.json.get('y_length')
    building_id = request.json.get('building_id')
    data = (description, x_length, y_length, building_id)

    cursor.execute("INSERT INTO room (description, x_length, y_length, building_id) "
                   "VALUES (%s, %s, %s, %s)", data)
    db.commit()

    last_inserted_id = cursor.lastrowid  # Lấy ID của hàng vừa được thêm

    # Lấy thông tin của bản ghi vừa được thêm
    cursor.execute("SELECT * FROM room WHERE room_id = %s", last_inserted_id)
    key = [desc[0] for desc in cursor.description]
    new_record = dict(zip(key, cursor.fetchone()))

    cursor.close()
    db.close()

    return jsonify(new_record), 201  # Trả lại bản ghi mới với mã trạng thái 201 (Created)

@app.route('/room/update/<room_id>', methods=['PUT'])
def update_room(room_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()

    try:
        # Lấy dữ liệu đầu vào
        description = request.json.get('description')
        x_length = request.json.get('x_length')
        y_length = request.json.get('y_length')
        building_id = request.json.get('building_id')

        # Chỉ cập nhật các trường có giá trị
        update_values = []
        query_parts = []

        if description:
            query_parts.append("description = %s")
            update_values.append(description)

        if x_length:
            query_parts.append("x_length = %s")
            update_values.append(x_length)

        if y_length:
            query_parts.append("y_length = %s")
            update_values.append(y_length)

        if building_id:
            query_parts.append("building_id = %s")
            update_values.append(building_id)

        # Nếu không có gì để cập nhật
        if not query_parts:
            cursor.close()
            db.close()
            return jsonify({"error": "No fields to update"}), 400  # Lỗi yêu cầu không hợp lệ

        # Xây dựng câu lệnh SQL để cập nhật
        query = f"UPDATE room SET {', '.join(query_parts)} WHERE room_id = %s"
        update_values.append(room_id)

        cursor.execute(query, tuple(update_values))
        db.commit()

        # Lấy bản ghi vừa được cập nhật để trả lại
        cursor.execute("SELECT * FROM room WHERE room_id = %s", (room_id,))
        key = [desc[0] for desc in cursor.description]
        updated_record = dict(zip(key, cursor.fetchone()))

        cursor.close()
        db.close()

        return jsonify(updated_record), 200  # Trả lại dữ liệu với mã trạng thái 200 (OK)

    except Error as e:
        print("Error during update:", e)
        cursor.close()
        db.close()
        return jsonify({"error": "Failed to update room"}), 500

@app.route('/room/delete/<room_id>', methods=['DELETE'])  # Đảm bảo đúng kiểu dữ liệu
def delete_room(room_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()

    try:
        # Kiểm tra xem bản ghi có tồn tại không
        cursor.execute("SELECT * FROM room WHERE room_id = %s", (room_id,))  # Đúng định dạng tham số
        record = cursor.fetchone()

        if not record:
            cursor.close()
            db.close()
            return jsonify({"error": "Room not found"}), 404  # Nếu không tìm thấy bản ghi

        # Nếu bản ghi tồn tại, tiến hành xóa
        cursor.execute("DELETE FROM room WHERE room_id = %s", (room_id,))  # Sử dụng %s và tuple
        db.commit()  # Lưu thay đổi

        cursor.close()
        db.close()

        return jsonify({"message": "Delete success"}), 204  # 204 (No Content) khi xóa thành công

    except Error as e:
        print("Error during deletion:", e)  # Ghi lại lỗi
        cursor.close()
        db.close()
        return jsonify({"error": "Failed to delete room", "details": str(e)}), 500

# air_conditioner
@app.route('/registration_ac/getall', methods=['GET'])
def get_all_registration_ac():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()
    cursor.execute(f"""SELECT registration_ac.*, ac_device.x_pos_device, ac_device.y_pos_device FROM registration_ac
                       	LEFT JOIN ac_device
                        on registration_ac.ac_id = ac_device.ac_id
                        WHERE registration_ac.room_id = {room_id} """)
    key = [desc[0] for desc in cursor.description]
    result = [dict(zip(key, row)) for row in cursor.fetchall()]

    cursor.close()
    db.close()

    return jsonify(result), 200

@app.route('/registration_ac/get_room/<room_id>', methods=['GET'])
def get_registration_ac_by_room_id(room_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()
    cursor.execute("SELECT * FROM registration_ac where room_id = %s", (room_id,))
    key = [desc[0] for desc in cursor.description]
    result = [dict(zip(key, row)) for row in cursor.fetchall()]

    cursor.close()
    db.close()

    return jsonify(result), 200

@app.route('/registration_ac/insert', methods=['POST'])
def insert_registration_ac():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()
    room_id = request.json.get('room_id')  # Dữ liệu nhận từ yêu cầu POST
    x_pos = request.json.get('x_pos')
    y_pos = request.json.get('y_pos')
    model = request.json.get('model')
    sensor_link = request.json.get('sensor_link')

    if room_id is None or x_pos is None or y_pos is None or model is None or sensor_link is None:
        cursor.close()
        db.close()
        return jsonify({"error": "room_id, x_pos, y_pos, model and sensor_link are required"}), 400  # Yêu cầu không hợp lệ

    try:
        cursor.execute(
            "INSERT INTO registration_ac (room_id, x_pos, y_pos, model, sensor_link) VALUES (%s, %s, %s, %s, %s)",
            (room_id, x_pos, y_pos, model, sensor_link)
        )
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        cursor.close()
        db.close()
        return jsonify({"error": str(err)}), 500  # Lỗi khi thực thi truy vấn

    cursor.close()
    db.close()

    return jsonify({"message": "Registration AC added successfully"}), 201

@app.route('/registration_ac/update/<room_id>/<ac_id>', methods=['PUT'])
def update_registration_ac(room_id, ac_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()

    # Lấy dữ liệu đầu vào từ yêu cầu PUT
    x_pos = request.json.get('x_pos')
    y_pos = request.json.get('y_pos')
    model = request.json.get('model')
    sensor_link = request.json.get('sensor_link')

    update_values = []
    query_parts = []

    if x_pos:
        query_parts.append("x_pos = %s")
        update_values.append(x_pos)

    if y_pos:
        query_parts.append("y_pos = %s")
        update_values.append(y_pos)

    if model:
        query_parts.append("model = %s")
        update_values.append(model)

    if sensor_link:
        query_parts.append("sensor_link = %s")
        update_values.append(sensor_link)

    if not query_parts:
        cursor.close()
        db.close()
        return jsonify({"error": "No fields to update"}), 400  # Nếu không có gì để cập nhật

    # Cập nhật dựa trên room_id và ac_id hiện tại
    query = f"UPDATE registration_ac SET {', '.join(query_parts)} WHERE room_id = %s AND ac_id = %s"
    update_values.extend([room_id, ac_id])

    try:
        cursor.execute(query, tuple(update_values))
        db.commit()

        cursor.close()
        db.close()

        return jsonify({"message": "Registration AC updated successfully"}), 200  # 200 (OK)

    except Error as e:
        print("Error during update:", e)  # Ghi lại lỗi
        cursor.close()
        db.close()
        return jsonify({"error": "Failed to update Registration AC"}), 500

@app.route('/registration_ac/delete/<room_id>/<ac_id>', methods=['DELETE'])
def delete_registration_ac(room_id, ac_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()

    try:
        # Xóa dựa trên room_id và ac_id
        cursor.execute("DELETE FROM registration_ac WHERE room_id = %s AND ac_id = %s",
                       (room_id, ac_id))
        db.commit()  # Lưu thay đổi

        cursor.close()
        db.close()

        return jsonify({"message": "Registration AC deleted successfully"}), 204  # 204 (No Content)

    except Error as e:
        print("Error during deletion:", e)
        cursor.close()
        db.close()
        return jsonify({"error": "Failed to delete Registration AC"}), 500

@app.route('/air_conditioner/getall', methods=['GET'])
def acGetAll():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    cursor.execute("SELECT * FROM air_conditioner")
    key = [desc[0] for desc in cursor.description]
    result = [dict(zip(key, row)) for row in cursor.fetchall()]

    cursor.close()
    db.close()

    return jsonify(result), 200

@app.route('/air_conditioner/getlast/<room_id>', methods=['GET'])
def get_last_ac_by_room_id(room_id):
    if room_id.isnumeric(): #isalnum()
        db = create_connection()
        if db is None:
            return jsonify({"error": "Unable to connect to database"}), 500
        cursor = db.cursor()
        cursor.execute(f"""SELECT ac.ac_id, MAX(ac.time) AS latest_time, ac.set_temp, ac.control_mode, ac.state FROM air_conditioner ac
                            LEFT JOIN registration_ac ra
                            ON ra.ac_id = ac.ac_id
                            WHERE ra.room_id = {room_id}
                            GROUP BY ra.ac_id""")
        key = [desc[0] for desc in cursor.description]
        result = [dict(zip(key, row)) for row in cursor.fetchall()]

        cursor.close()
        db.close()

        return jsonify(result), 200
    else: return "I'm a teapot", 429

@app.route('/air_conditioner/getById/<ac_id>', methods=['GET'])
def ac_get_by_id(ac_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    cursor.execute("SELECT * FROM air_conditioner where ac_id = %s", (ac_id,))
    key = [desc[0] for desc in cursor.description]
    result = [dict(zip(key, row)) for row in cursor.fetchall()]

    cursor.close()
    db.close()

    return jsonify(result), 200

@app.route('/air_conditioner/insert', methods=['POST'])
def insertAC():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    try:
        cursor = db.cursor()
        data = request.get_json()

        ac_id = data.get('ac_id')
        set_temp = data.get('set_temp')
        control_mode = data.get('control_mode')
        state = data.get('state')
        status = data.get('status')

        if None in [ac_id, set_temp, control_mode, state, status]:
            return jsonify({"error": "All fields are required"}), 400

        cursor.execute("INSERT INTO air_conditioner (ac_id, set_temp, control_mode, state, status) "
                       "VALUES (%s, %s, %s, %s, %s)", (ac_id, set_temp, control_mode, state, status))
        db.commit()

        return jsonify({"message": "Air Conditioner added successfully"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        db.close()

@app.route('/fan/getall', methods=['GET'])
def get_all_fans():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    cursor.execute("SELECT * FROM fan")
    key = [desc[0] for desc in cursor.description]
    result = [dict(zip(key, row)) for row in cursor.fetchall()]

    cursor.close()
    db.close()

    return jsonify(result), 200

@app.route('/fan/getlast/<room_id>', methods=['GET'])
def get_last_fan_by_room_id(room_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    cursor.execute(f"""SELECT fan1.* FROM fan fan1
                        LEFT JOIN registration_fan rf
                        ON rf.fan_id = fan1.fan_id
                        JOIN (
                            SELECT fan_id, MAX(fan.time) AS latest_time
                            FROM fan
                            GROUP BY fan_id
                        ) fan2
                        ON fan1.time = fan2.latest_time AND fan1.fan_id = fan2.fan_id
                        WHERE rf.room_id = {room_id}""")
    key = [desc[0] for desc in cursor.description]
    result = [dict(zip(key, row)) for row in cursor.fetchall()]

    cursor.close()
    db.close()

    return jsonify(result), 200

@app.route('/fan/getById/<fan_id>', methods=['GET'])
def get_fan_by_id(fan_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    cursor.execute("SELECT * FROM fan where fan_id = %s", (fan_id,))
    key = [desc[0] for desc in cursor.description]
    result = [dict(zip(key, row)) for row in cursor.fetchall()]

    cursor.close()
    db.close()

    return jsonify(result), 200

@app.route('/fan/insert', methods=['POST'])
def insert_fan():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    fan_id = flask.request.json.get('fan_id')
    set_speed = request.json.get('set_speed')
    control_mode = request.json.get('control_mode')
    set_time = request.json.get('set_time')
    status = request.json.get('status')

    if None in (set_speed, control_mode, set_time, status):
        return jsonify({"error": "Missing required fields"}), 400

    query = "INSERT INTO fan (fan_id, set_speed, control_mode, set_time, status) VALUES (%s, %s, %s, %s, %s)"
    cursor.execute(query, (fan_id, set_speed, control_mode, set_time, status))
    db.commit()

    cursor.close()
    db.close()

    return jsonify({"message": "Fan added successfully"}), 201

@app.route('/registration_fan/getall', methods=['GET'])
def get_all_registration_fan():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    cursor.execute("SELECT * FROM registration_fan")
    key = [desc[0] for desc in cursor.description]
    result = [dict(zip(key, row)) for row in cursor.fetchall()]

    cursor.close()
    db.close()

    return jsonify(result), 200

@app.route('/registration_fan/getByRoomId/<room_id>', methods=['GET'])
def get_registration_fan_by_room_id(room_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    cursor.execute(f"""SELECT registration_fan.*, fan_device.x_pos_device, fan_device.y_pos_device FROM registration_fan
                       	LEFT JOIN fan_device
                        on registration_fan.fan_id = fan_device.fan_id
                        WHERE registration_fan.room_id = {room_id} """)
    key = [desc[0] for desc in cursor.description]
    result = [dict(zip(key, row)) for row in cursor.fetchall()]

    cursor.close()
    db.close()

    return jsonify(result), 200

@app.route('/registration_fan/insert', methods=['POST'])
def insert_registration_fan():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    room_id = request.json.get('room_id')
    x_pos = request.json.get('x_pos')
    y_pos = request.json.get('y_pos')
    model = request.json.get('model')
    sensor_link = request.json.get('sensor_link')

    if room_id is None or x_pos is None or y_pos is None or model is None or sensor_link is None:
        cursor.close()
        db.close()
        return jsonify({"error": "room_id, x_pos, y_pos, model, sensor_link are required"}), 400  # Yêu cầu không hợp lệ

    cursor.execute("INSERT INTO registration_fan (room_id, x_pos, y_pos, model, sensor_link) VALUES (%s, %s, %s, %s, %s)", (room_id, x_pos, y_pos, model, sensor_link))
    db.commit()

    cursor.close()
    db.close()

    return jsonify({"message": "Registration Fan added successfully"}), 201  # 201 (Created)

@app.route('/registration_fan/update/<room_id>/<fan_id>', methods=['PUT'])
def update_registration_fan(room_id, fan_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()

    # Lấy dữ liệu đầu vào từ yêu cầu PUT
    x_pos = request.json.get('x_pos')
    y_pos = request.json.get('y_pos')
    model = request.json.get('model')
    sensor_link = request.json.get('sensor_link')

    update_values = []
    query_parts = []

    if x_pos:
        query_parts.append("x_pos = %s")
        update_values.append(x_pos)

    if y_pos:
        query_parts.append("y_pos = %s")
        update_values.append(y_pos)

    if model:
        query_parts.append("model = %s")
        update_values.append(model)

    if sensor_link:
        query_parts.append("sensor_link = %s")
        update_values.append(sensor_link)

    if not query_parts:
        cursor.close()
        db.close()
        return jsonify({"error": "No fields to update"}), 400  # Nếu không có gì để cập nhật

    # Cập nhật dựa trên room_id và ac_id hiện tại
    query = f"UPDATE registration_fan SET {', '.join(query_parts)} WHERE room_id = %s AND fan_id = %s"
    update_values.extend([room_id, fan_id])

    try:
        cursor.execute(query, tuple(update_values))
        db.commit()

        cursor.close()
        db.close()

        return jsonify({"message": "Registration fan updated successfully"}), 200  # 200 (OK)

    except Error as e:
        print("Error during update:", e)  # Ghi lại lỗi
        cursor.close()
        db.close()
        return jsonify({"error": "Failed to update Registration fan"}), 500

@app.route('/registration_fan/delete/<room_id>/<fan_id>', methods=['DELETE'])
def delete_registration_fan(room_id, fan_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()

    try:
        cursor.execute("SELECT * FROM registration_fan WHERE room_id = %s AND fan_id = %s", (room_id, fan_id))
        record = cursor.fetchone()

        if not record:
            cursor.close()
            db.close()
            return jsonify({"error": "Registration Fan not found"}), 404  # Nếu không tìm thấy bản ghi

        cursor.execute("DELETE FROM registration_fan WHERE room_id = %s AND fan_id = %s", (room_id, fan_id))
        db.commit()

        cursor.close()
        db.close()

        return jsonify({"message": "Registration Fan deleted successfully"}), 204

    except Error as e:
        print("Error during deletion:", e)
        cursor.close()
        db.close()
        return jsonify({"error": "Failed to delete Registration Fan"}), 500

@app.route('/energy_measure/getall', methods=['GET'])
def get_all_energy_measure():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()
    cursor.execute("SELECT * FROM energy_measure")
    key = [desc[0] for desc in cursor.description]
    result = [dict(zip(key, row)) for row in cursor.fetchall()]

    cursor.close()
    db.close()

    return jsonify(result), 200  # Trả lại mã trạng thái 200 (OK)

@app.route('/energy_measure/getById/<int:em_id>/', defaults={'time_range': None}, methods=['GET'])
@app.route('/energy_measure/getById/<int:em_id>/<int:time_range>', methods=['GET'])
def get_em_by_id(em_id, time_range):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor(dictionary=True)
    query = "SELECT * FROM energy_measure WHERE em_id = %s"
    params = [em_id]

    if time_range is not None and time_range in [0, 1, 2]:
        if time_range == 0:
            time_threshold = datetime.now() - timedelta(hours=24)
        elif time_range == 1:
            time_threshold = datetime.now() - timedelta(days=7)
        elif time_range == 2:
            time_threshold = datetime.now() - timedelta(days=30)

        # Thêm điều kiện thời gian vào truy vấn
        query += " AND time >= %s"
        params.append(time_threshold.strftime('%Y-%m-%d %H:%M:%S'))

    try:
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        result = [row for row in rows]
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        db.close()

    return jsonify(result), 200  # 200 (OK)

@app.route('/energy_measure/insert', methods=['POST'])
def insert_energy_measure():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()
    em_id = request.json.get('em_id')
    voltage = request.json.get('voltage')
    current = request.json.get('current')
    frequency = request.json.get('frequency')
    active_power = request.json.get('active_power')
    power_factor = request.json.get('power_factor')
    status = request.json.get('status')

    # Kiểm tra các trường bắt buộc
    if None in (em_id, voltage, current, frequency, active_power, power_factor, status):
        cursor.close()
        db.close()
        return jsonify({"error": "Missing required fields"}), 400  # Lỗi yêu cầu không hợp lệ

    query = ("INSERT INTO energy_measure (em_id, voltage, current, frequency, active_power, power_factor, status) "
             "VALUES (%s, %s, %s, %s, %s, %s, %s)")
    cursor.execute(query, (em_id, voltage, current, frequency, active_power, power_factor, status))
    db.commit()

    cursor.close()
    db.close()

    return jsonify({"message": "Energy measure added successfully"}), 201  # 201 (Created)

@app.route('/registration_em/getall', methods=['GET'])
def get_all_registration_em():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    cursor.execute("SELECT * FROM registration_em")
    key = [desc[0] for desc in cursor.description]
    result = [dict(zip(key, row)) for row in cursor.fetchall()]

    cursor.close()
    db.close()

    return jsonify(result), 200

@app.route('/registration_em/getByRoomId/<room_id>', methods=['GET'])
def get_registration_em_by_room_id(room_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    cursor.execute("SELECT * FROM registration_em where room_id = %s", (room_id,))
    key = [desc[0] for desc in cursor.description]
    result = [dict(zip(key, row)) for row in cursor.fetchall()]

    cursor.close()
    db.close()

    return jsonify(result), 200

@app.route('/registration_em/insert', methods=['POST'])
def insert_registration_em():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    room_id = request.json.get('room_id')
    x_pos = request.json.get('x_pos')
    y_pos = request.json.get('y_pos')

    if room_id is None or x_pos is None or y_pos is None:
        cursor.close()
        db.close()
        return jsonify({"error": "room_id, x_pos, and y_pos are required"}), 400  # Yêu cầu không hợp lệ

    cursor.execute("INSERT INTO registration_em (room_id, x_pos, y_pos) VALUES (%s, %s, %s)", (room_id, x_pos, y_pos))
    db.commit()

    cursor.close()
    db.close()

    return jsonify({"message": "Registration Em added successfully"}), 201  # 201 (Created)

@app.route('/registration_em/delete/<room_id>/<em_id>', methods=['DELETE'])
def delete_registration_em(room_id, em_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()

    try:
        cursor.execute("SELECT * FROM registration_em WHERE room_id = %s AND em_id = %s", (room_id, em_id))
        record = cursor.fetchone()

        if not record:
            cursor.close()
            db.close()
            return jsonify({"error": "Registration energy_measure not found"}), 404  # Nếu không tìm thấy bản ghi

        cursor.execute("DELETE FROM registration_em WHERE room_id = %s AND em_id = %s", (room_id, em_id))
        db.commit()

        cursor.close()
        db.close()

        return jsonify({"message": "Registration EM deleted successfully"}), 204

    except Error as e:
        print("Error during deletion:", e)
        cursor.close()
        db.close()
        return jsonify({"error": "Failed to delete Registration EM"}), 500

@app.route('/sensor_node/getall', methods=['GET'])
def get_all_sensor_nodes():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    cursor.execute("SELECT * FROM sensor_node")
    key = [desc[0] for desc in cursor.description]
    result = [dict(zip(key, row)) for row in cursor.fetchall()]

    cursor.close()
    db.close()

    return jsonify(result), 200  # 200 (OK)

@app.route('/sensor_node/getByRoomId/<room_id>', methods=['GET'])
def get_sensor_nodes_by_room_id(room_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor(dictionary=True)

    query = """
        SELECT sn.*
        FROM sensor_node sn
        LEFT JOIN registration_sensor rs
        ON rs.sensor_id = sn.sensor_id
        INNER JOIN (
            SELECT sensor_id, MAX(time) as latest_time
            FROM sensor_node
            GROUP BY sensor_id
        ) latest
        ON sn.sensor_id = latest.sensor_id AND sn.time = latest.latest_time
        WHERE rs.room_id = %s
        ORDER BY sn.sensor_id
        """

    try:
        cursor.execute(query, (room_id,))
        rows = cursor.fetchall()
        result = [row for row in rows]
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        db.close()

    return jsonify(result), 200  # 200 (OK)

@app.route('/sensor_node/getById/<int:sensor_id>/', defaults={'time_range': None}, methods=['GET'])
@app.route('/sensor_node/getById/<int:sensor_id>/<int:time_range>', methods=['GET'])
def get_sensor_nodes_by_id(sensor_id, time_range):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor(dictionary=True)

    query = "SELECT * FROM sensor_node WHERE sensor_id = %s"
    params = [sensor_id]

    if time_range is not None:
        if time_range == 0:
            time_threshold = datetime.now() - timedelta(hours=24)
        elif time_range == 1:
            time_threshold = datetime.now() - timedelta(days=7)
        elif time_range == 2:
            time_threshold = datetime.now() - timedelta(days=30)
        else:
            time_threshold = None

        if time_threshold:
            # Thêm điều kiện thời gian vào truy vấn
            query += " AND time >= %s"
            params.append(time_threshold.strftime('%Y-%m-%d %H:%M:%S'))

    try:
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        result = [row for row in rows]
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        db.close()

    return jsonify(result), 200  # 200 (OK)

@app.route('/sensor_node/insert', methods=['POST'])
def insert_sensor_node():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()
    sensor_id = request.json.get('sensor_id')
    temp = request.json.get('temp')
    wind = request.json.get('wind')
    humid = request.json.get('humid')
    pm25 = request.json.get('pm25')
    status = request.json.get('status')

    if None in (sensor_id, temp, wind, humid, pm25, status):
        cursor.close()
        db.close()
        return jsonify({"error": "Missing required fields"}), 400  # Bad Request

    query = "INSERT INTO sensor_node (sensor_id, temp, wind, humid, pm25, status) VALUES (%s, %s, %s, %s, %s, %s)"
    cursor.execute(query, (sensor_id, temp, wind, humid, pm25, status))
    db.commit()

    cursor.close()
    db.close()

    return jsonify({"message": "Sensor node added successfully"}), 201  # 201 (Created)

@app.route('/registration_sensor/getall', methods=['GET'])
def get_all_registration_sensor():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    cursor.execute("SELECT * FROM registration_sensor")
    key = [desc[0] for desc in cursor.description]
    result = [dict(zip(key, row)) for row in cursor.fetchall()]

    cursor.close()
    db.close()

    return jsonify(result), 200

@app.route('/registration_sensor/getByRoomId/<room_id>', methods=['GET'])
def get_registration_sensor_by_room_id(room_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    cursor.execute("SELECT * FROM registration_sensor where room_id = %s", (room_id,))
    key = [desc[0] for desc in cursor.description]
    result = [dict(zip(key, row)) for row in cursor.fetchall()]

    cursor.close()
    db.close()

    return jsonify(result), 200

@app.route('/registration_sensor/insert', methods=['POST'])
def insert_registration_sensor():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    room_id = request.json.get('room_id')
    x_pos = request.json.get('x_pos')
    y_pos = request.json.get('y_pos')

    if room_id is None or x_pos is None or y_pos is None:
        cursor.close()
        db.close()
        return jsonify({"error": "room_id, x_pos, and y_pos are required"}), 400  # Yêu cầu không hợp lệ

    cursor.execute("INSERT INTO registration_sensor (room_id, x_pos, y_pos) VALUES (%s, %s, %s)", (room_id, x_pos, y_pos))
    db.commit()

    cursor.close()
    db.close()

    return jsonify({"message": "Registration sensor node added successfully"}), 201  # 201 (Created)

@app.route('/registration_sensor/update/<room_id>/<sensor_id>', methods=['PUT'])
def update_registration_sensor(room_id, sensor_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()

    # Lấy dữ liệu đầu vào từ yêu cầu PUT
    x_pos = request.json.get('x_pos')
    y_pos = request.json.get('y_pos')

    update_values = []
    query_parts = []

    if x_pos:
        query_parts.append("x_pos = %s")
        update_values.append(x_pos)

    if y_pos:
        query_parts.append("y_pos = %s")
        update_values.append(y_pos)

    if not query_parts:
        cursor.close()
        db.close()
        return jsonify({"error": "No fields to update"}), 400  # Nếu không có gì để cập nhật

    # Cập nhật dựa trên room_id và ac_id hiện tại
    query = f"UPDATE registration_sensor SET {', '.join(query_parts)} WHERE room_id = %s AND sensor_id = %s"
    update_values.extend([room_id, sensor_id])

    try:
        cursor.execute(query, tuple(update_values))
        db.commit()

        cursor.close()
        db.close()

        return jsonify({"message": "Registration sensor updated successfully"}), 200  # 200 (OK)

    except Error as e:
        print("Error during update:", e)  # Ghi lại lỗi
        cursor.close()
        db.close()
        return jsonify({"error": "Failed to update Registration sensor"}), 500

@app.route('/registration_sensor/delete/<room_id>/<sensor_id>', methods=['DELETE'])
def delete_registration_sensor(room_id, sensor_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()

    try:
        cursor.execute("SELECT * FROM registration_sensor WHERE room_id = %s AND sensor_id = %s", (room_id, sensor_id))
        record = cursor.fetchone()

        if not record:
            cursor.close()
            db.close()
            return jsonify({"error": "Registration sensor not found"}), 404  # Nếu không tìm thấy bản ghi

        # Xóa bản ghi nếu tồn tại
        cursor.execute("DELETE FROM registration_sensor WHERE room_id = %s AND sensor_id = %s", (room_id, sensor_id))
        db.commit()

        cursor.close()
        db.close()

        return jsonify({"message": "Registration sensor deleted successfully"}), 204  # 204 (No Content)

    except Error as e:
        print("Error during deletion:", e)  # Xử lý ngoại lệ
        cursor.close()
        db.close()
        return jsonify({"error": "Failed to delete registration sensor"}), 500  # Lỗi máy chủ nội bộ

@app.route('/local_weather/getlast', methods=['GET'])
def get_last_local_weather():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    cursor.execute("SELECT * FROM local_weather ORDER BY time DESC LIMIT 1")
    key = [desc[0] for desc in cursor.description]
    row = cursor.fetchone()
    result = dict(zip(key, row)) if row else {}

    cursor.close()
    db.close()

    return jsonify(result), 200

@app.route('/local_weather/insert', methods=['POST'])
def local_weather_insert():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    try:
        url = "https://api2.waqi.info/api/feed/@1583/aqi.json"
        response = requests.get(url)
        if response.status_code != 200:
            return jsonify({"error": "Unable to fetch data from AQICN API"}), 500

        data = response.json()
        # print(data)
        try:
            iaqi = data['rxs']['obs'][0]['msg']['iaqi']
            temp = iaqi['t']['v']
            humid = iaqi['h']['v']
            wind = iaqi['w']['v']
            aqi = data['rxs']['obs'][0]['msg']['aqi']
            time = data['rxs']['obs'][0]['msg']['time']['s']

            formatted_data = {
                'temp': temp,
                'humid': humid,
                'wind': wind,
                'aqi': aqi,
                'time': time
            }
        except KeyError as e:
            print(f"Key error: {e}")
            return jsonify({"error": "Unable to format data from AQICN API"}), 500

        cursor = db.cursor()
        insert_query = """
            INSERT INTO local_weather (temp, humid, wind, aqi, time)
            VALUES (%s, %s, %s, %s, %s)
            """
        values = (formatted_data['temp'], formatted_data['humid'], formatted_data['wind'], formatted_data['aqi'],
                  formatted_data['time'])
        cursor.execute(insert_query, values)
        db.commit()

        cursor.close()
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        db.close()

    return jsonify({"message": "Weather data fetched and stored successfully"}), 200

def schedule_weather_insert():
    with app.app_context():
        while True:
            local_weather_insert()
            time.sleep(3600)

@app.route('/pmv/insert', methods=['POST'])
def insert_pmv():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    room_id = request.json.get('room_id')
    sensor_id = request.json.get('sensor_id')
    met = request.json.get('met')
    clo = request.json.get('clo')
    temp = request.json.get('temp')
    wind = request.json.get('wind')
    pmv_ref = request.json.get('pmv_ref')
    pmv = request.json.get('pmv')
    status = request.json.get('status')

    print((room_id, sensor_id, met, clo, temp, wind, pmv_ref, pmv, status))
    # Kiểm tra xem các trường bắt buộc có tồn tại và có kiểu dữ liệu hợp lệ không
    if any(v is None for v in (room_id, sensor_id, met, clo, temp, wind, pmv_ref, pmv, status)):
        cursor.close()
        db.close()
        return jsonify({"error": "Missing required fields"}), 400  # Bad Request

    try:
        # Thêm dữ liệu vào bảng pmv_table
        query = ("INSERT INTO pmv_table (room_id, sensor_id, met, clo, temp, wind, pmv_ref, pmv, status) "
                 "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)")
        cursor.execute(query, (room_id, sensor_id, met, clo, temp, wind, pmv_ref, pmv, status))
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        db.close()

    return jsonify({"message": "pmv added successfully"}), 201  # 201 (Created)

#pmv
@app.route('/pmv/getall', methods=['GET'])
def get_all_pmv():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    cursor.execute("SELECT * FROM pmv_table")
    key = [desc[0] for desc in cursor.description]
    result = [dict(zip(key, row)) for row in cursor.fetchall()]

    cursor.close()
    db.close()

    return jsonify(result), 200  # 200 (OK)

@app.route('/pmv/env', methods=['GET'])
def get_max_env_values():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    cursor.execute("SELECT MAX(met), MAX(clo) FROM pmv_table")
    max_values = cursor.fetchone()

    if max_values is None:
        cursor.close()
        db.close()
        return jsonify({"error": "No data available"}), 404

    max_env_values = {
        'max_met': max_values[0],
        'max_clo': max_values[1]
    }

    cursor.close()
    db.close()

    return jsonify(max_env_values), 200

@app.route('/pmv/env/<room_id>', methods=['GET'])
def get_env_values_by_room_id(room_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    cursor.execute("SELECT met, clo FROM pmv_table WHERE room_id = %s ORDER BY time DESC LIMIT 1", (room_id,))
    max_values = cursor.fetchone()

    if max_values is None:
        cursor.close()
        db.close()
        return jsonify({"error": "No data available"}), 404

    max_env_values = {
        'max_met': max_values[0],
        'max_clo': max_values[1]
    }

    cursor.close()
    db.close()

    return jsonify(max_env_values), 200

@app.route('/pmv/getfull/<room_id>/<sensor_id>', methods=['GET'])
def getfull_pmv(room_id, sensor_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    query = ("SELECT * FROM pmv_table WHERE room_id = %s AND sensor_id = %s ORDER BY time DESC LIMIT 1")
    cursor.execute(query, (room_id, sensor_id))
    row = cursor.fetchone()

    if row:
        key = [desc[0] for desc in cursor.description]
        result = dict(zip(key, row))
    else:
        result = {}

    cursor.close()
    db.close()

    return jsonify(result), 200

#heatmap
@app.route('/heatmap/getlast/<room_id>', methods=['GET'])
def getlast_heatmap(room_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor(dictionary=True)

    # Lấy thông tin các sensor node mới nhất cho từng sensor trong phòng
    query = ("""
        SELECT 
            a.sensor_id, 
            b.temp, 
            a.x_pos, 
            a.y_pos 
        FROM 
            registration_sensor a 
        JOIN 
            sensor_node b ON a.sensor_id = b.sensor_id 
        WHERE 
            a.room_id = %s AND b.time = (
                SELECT MAX(time) 
                FROM sensor_node 
                WHERE sensor_id = a.sensor_id
            )
    """)
    cursor.execute(query, (room_id,))
    sensors = cursor.fetchall()

    # Lấy thông tin kích thước phòng
    query = ("SELECT x_length, y_length FROM room WHERE room_id = %s")
    cursor.execute(query, (room_id,))
    room = cursor.fetchone()

    cursor.close()
    db.close()

    if not room:
        return jsonify({"error": "Room not found"}), 404

    result = {
        "sensor": sensors,
        "room": {
            "x_length": room["x_length"],
            "y_length": room["y_length"]
        }
    }

    return jsonify(result), 200

@app.route('/heatmap/getPosNode/<room_id>', methods=['GET'])
def get_pos_nodes_headmap(room_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor(dictionary=True)

    result = {
        'sensor': [],
        'em': [],
        'fan': [],
        'ac': []
    }

    try:
        # Lấy thông tin các sensor nodes
        cursor.execute("SELECT sensor_id, x_pos, y_pos FROM registration_sensor WHERE room_id = %s", (room_id,))
        result['sensor'] = cursor.fetchall()

        # Lấy thông tin các em
        cursor.execute("SELECT em_id, x_pos, y_pos FROM registration_em WHERE room_id = %s", (room_id,))
        result['em'] = cursor.fetchall()

        # Lấy thông tin các fan
        cursor.execute("SELECT fan_id, x_pos, y_pos FROM registration_fan WHERE room_id = %s", (room_id,))
        result['fan'] = cursor.fetchall()

        # Lấy thông tin các ac
        cursor.execute("SELECT ac_id, x_pos, y_pos FROM registration_ac WHERE room_id = %s", (room_id,))
        result['ac'] = cursor.fetchall()
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        db.close()

    return jsonify(result), 200

# registration_gateway
@app.route('/registration_gateway/getall', methods=['GET'])
def get_all_gateway():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    cursor.execute("SELECT * FROM registration_gateway")
    key = [desc[0] for desc in cursor.description]
    result = [dict(zip(key, row)) for row in cursor.fetchall()]

    cursor.close()
    db.close()

    return jsonify(result), 200  # 200 (OK)

@app.route('/registration_gateway/getByRoomId<room_id>', methods=['GET'])
def get_gateway_by_room_id(room_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    cursor.execute("SELECT * FROM registration_gateway where room_id = %s", (room_id,))
    key = [desc[0] for desc in cursor.description]
    result = [dict(zip(key, row)) for row in cursor.fetchall()]

    cursor.close()
    db.close()

    return jsonify(result), 200  # 200 (OK)

@app.route('/registration_gateway/insert', methods=['POST'])
def insert_gateway():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    room_id = request.json.get('room_id')
    connected = request.json.get('connected')
    mac = request.json.get('mac')
    description = request.json.get('description')
    x_pos = request.json.get('x_pos')
    y_pos = request.json.get('y_pos')

    # Kiểm tra xem các trường bắt buộc có tồn tại và có kiểu dữ liệu hợp lệ không
    if any(v is None for v in (room_id, connected, mac, description, x_pos, y_pos)):
        cursor.close()
        db.close()
        return jsonify({"error": "Missing required fields"}), 400  # Bad Request

    try:
        # Thêm dữ liệu vào bảng pmv_table
        query = ("INSERT INTO registration_gateway (room_id, connected, mac, description, x_pos, y_pos) "
                 "VALUES (%s, %s, %s, %s, %s, %s)")
        cursor.execute(query, (room_id, connected, mac, description, x_pos, y_pos))
        db.commit()
    except mysql.connector.Error as err:
        db.rollback()
        return jsonify({"error": str(err)}), 500
    finally:
        cursor.close()
        db.close()

    return jsonify({"message": "gateway added successfully"}), 201  # 201 (Created)

@app.route('/registration_gateway/update/<room_id>/<gateway_id>', methods=['PUT'])
def update_gateway(room_id, gateway_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    connected = request.json.get('connected')
    mac = request.json.get('mac')
    description = request.json.get('description')
    x_pos = request.json.get('x_pos')
    y_pos = request.json.get('y_pos')

    update_values = []
    query_parts = []

    if connected:
        query_parts.append("connected = %s")
        update_values.append(connected)

    if mac:
        query_parts.append("mac = %s")
        update_values.append(mac)

    if description:
        query_parts.append("description = %s")
        update_values.append(description)

    if x_pos:
        query_parts.append("x_pos = %s")
        update_values.append(x_pos)

    if y_pos:
        query_parts.append("y_pos = %s")
        update_values.append(y_pos)

    if not query_parts:
        cursor.close()
        db.close()
        return jsonify({"error": "No fields to update"}), 400  # Nếu không có gì để cập nhật

    # Cập nhật dựa trên room_id và ac_id hiện tại
    query = f"UPDATE registration_gateway SET {', '.join(query_parts)} WHERE room_id = %s AND gateway_id = %s"
    update_values.extend([room_id, gateway_id])

    try:
        cursor.execute(query, tuple(update_values))
        db.commit()

        cursor.close()
        db.close()

        return jsonify({"message": "Registration gateway updated successfully"}), 200  # 200 (OK)

    except Error as e:
        print("Error during update:", e)  # Ghi lại lỗi
        cursor.close()
        db.close()
        return jsonify({"error": "Failed to update Registration gateway"}), 500

@app.route('/registration_gateway/delete/<room_id>/<gateway_id>', methods=['DELETE'])
def delete_registration_gateway(room_id, gateway_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()

    try:
        cursor.execute("SELECT * FROM registration_gateway WHERE room_id = %s AND gateway_id = %s", (room_id, gateway_id))
        record = cursor.fetchone()

        if not record:
            cursor.close()
            db.close()
            return jsonify({"error": "Registration gateway not found"}), 404  # Nếu không tìm thấy bản ghi

        # Xóa bản ghi nếu tồn tại
        cursor.execute("DELETE FROM registration_gateway WHERE room_id = %s AND gateway_id = %s", (room_id, gateway_id))
        db.commit()

        cursor.close()
        db.close()

        return jsonify({"message": "Registration gateway deleted successfully"}), 204  # 204 (No Content)

    except Error as e:
        print("Error during deletion:", e)  # Xử lý ngoại lệ
        cursor.close()
        db.close()
        return jsonify({"error": "Failed to delete registration gateway"}), 500  # Lỗi máy chủ nội bộ

@app.route('/ac_device/getall', methods=['GET'])
def get_all_ac_device():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    cursor.execute("SELECT * FROM ac_device")
    key = [desc[0] for desc in cursor.description]
    result = [dict(zip(key, row)) for row in cursor.fetchall()]

    cursor.close()
    db.close()

    return jsonify(result), 200
@app.route('/ac_device/insert', methods=['POST'])
def insert_ac_deivce():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    ac_id = flask.request.json.get('ac_id')
    x_pos_device = flask.request.json.get('x_pos_device')
    y_pos_device = flask.request.json.get('y_pos_device')

    if None in (ac_id, x_pos_device, y_pos_device):
        return jsonify({"error": "Missing required fields"}), 400

    query = "INSERT INTO ac_device (ac_id, x_pos_device, y_pos_device) VALUES (%s, %s, %s)"
    cursor.execute(query, (ac_id, x_pos_device, y_pos_device))
    db.commit()

    cursor.close()
    db.close()

    return jsonify({"message": "ac_device added successfully"}), 201

@app.route('/ac_device/update/<ac_id>', methods=['PUT'])
def update_ac_device(ac_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()

    try:
        # Lấy dữ liệu đầu vào
        x_pos_device = request.json.get('x_pos_device')
        y_pos_device = request.json.get('y_pos_device')

        # Chỉ cập nhật các trường có giá trị
        update_values = []
        query_parts = []

        if x_pos_device:
            query_parts.append("x_pos_device = %s")
            update_values.append(x_pos_device)

        if y_pos_device:
            query_parts.append("y_pos_device = %s")
            update_values.append(y_pos_device)

        # Nếu không có gì để cập nhật
        if not query_parts:
            cursor.close()
            db.close()
            return jsonify({"error": "No fields to update"}), 400  # Lỗi yêu cầu không hợp lệ

        # Xây dựng câu lệnh SQL để cập nhật
        query = f"UPDATE ac_device SET {', '.join(query_parts)} WHERE ac_id = %s"
        update_values.append(ac_id)

        cursor.execute(query, tuple(update_values))
        db.commit()

        # Lấy bản ghi vừa được cập nhật để trả lại
        cursor.execute("SELECT * FROM ac_device WHERE ac_id = %s", (ac_id,))
        key = [desc[0] for desc in cursor.description]
        updated_record = dict(zip(key, cursor.fetchone()))

        cursor.close()
        db.close()

        return jsonify(updated_record), 200  # Trả lại dữ liệu với mã trạng thái 200 (OK)

    except Error as e:
        print("Error during update:", e)
        cursor.close()
        db.close()
        return jsonify({"error": "Failed to update ac_device"}), 500

@app.route('/ac_device/delete/<ac_id>', methods=['DELETE'])  # Đảm bảo đúng kiểu dữ liệu
def delete_ac_device(ac_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()

    try:
        # Kiểm tra xem bản ghi có tồn tại không
        cursor.execute("SELECT * FROM ac_device WHERE ac_id = %s", (ac_id,))  # Đúng định dạng tham số
        record = cursor.fetchone()

        if not record:
            cursor.close()
            db.close()
            return jsonify({"error": "ac_device not found"}), 404  # Nếu không tìm thấy bản ghi

        # Nếu bản ghi tồn tại, tiến hành xóa
        cursor.execute("DELETE FROM ac_device WHERE ac_id = %s", (ac_id,))  # Sử dụng %s và tuple
        db.commit()  # Lưu thay đổi

        cursor.close()
        db.close()

        return jsonify({"message": "Delete success"}), 204  # 204 (No Content) khi xóa thành công

    except Error as e:
        print("Error during deletion:", e)  # Ghi lại lỗi
        cursor.close()
        db.close()
        return jsonify({"error": "Failed to delete ac_device", "details": str(e)}), 500


@app.route('/fan_device/getall', methods=['GET'])
def get_all_fan_device():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    cursor.execute("SELECT * FROM fan_device")
    key = [desc[0] for desc in cursor.description]
    result = [dict(zip(key, row)) for row in cursor.fetchall()]

    cursor.close()
    db.close()

    return jsonify(result), 200


@app.route('/fan_device/insert', methods=['POST'])
def insert_fan_deivce():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    fan_id = flask.request.json.get('fan_id')
    x_pos_device = flask.request.json.get('x_pos_device')
    y_pos_device = flask.request.json.get('y_pos_device')

    if None in (fan_id, x_pos_device, y_pos_device):
        return jsonify({"error": "Missing required fields"}), 400

    query = "INSERT INTO fan_device (fan_id, x_pos_device, y_pos_device) VALUES (%s, %s, %s)"
    cursor.execute(query, (fan_id, x_pos_device, y_pos_device))
    db.commit()

    cursor.close()
    db.close()

    return jsonify({"message": "fan_device added successfully"}), 201


@app.route('/fan_device/update/<fan_id>', methods=['PUT'])
def update_fan_device(fan_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()

    try:
        # Lấy dữ liệu đầu vào
        x_pos_device = request.json.get('x_pos_device')
        y_pos_device = request.json.get('y_pos_device')

        # Chỉ cập nhật các trường có giá trị
        update_values = []
        query_parts = []

        if x_pos_device:
            query_parts.append("x_pos_device = %s")
            update_values.append(x_pos_device)

        if y_pos_device:
            query_parts.append("y_pos_device = %s")
            update_values.append(y_pos_device)

        # Nếu không có gì để cập nhật
        if not query_parts:
            cursor.close()
            db.close()
            return jsonify({"error": "No fields to update"}), 400  # Lỗi yêu cầu không hợp lệ

        # Xây dựng câu lệnh SQL để cập nhật
        query = f"UPDATE fan_device SET {', '.join(query_parts)} WHERE fan_id = %s"
        update_values.append(fan_id)

        cursor.execute(query, tuple(update_values))
        db.commit()

        # Lấy bản ghi vừa được cập nhật để trả lại
        cursor.execute("SELECT * FROM fan_device WHERE fan_id = %s", (fan_id,))
        key = [desc[0] for desc in cursor.description]
        updated_record = dict(zip(key, cursor.fetchone()))

        cursor.close()
        db.close()

        return jsonify(updated_record), 200  # Trả lại dữ liệu với mã trạng thái 200 (OK)

    except Error as e:
        print("Error during update:", e)
        cursor.close()
        db.close()
        return jsonify({"error": "Failed to update fan_device"}), 500

@app.route('/node/getall/<int:room_id>', methods=['GET'])
def get_all_nodes(room_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor(dictionary=True)

    data = {
        "sensor": [],
        "em": [],
        "fan": [],
        "ac": [],
        "gateway": []
    }

    try:
        # Lấy thông tin sensor nodes
        cursor.execute("SELECT * FROM registration_sensor WHERE room_id = %s", (room_id,))
        data['sensor'] = cursor.fetchall()

        # Lấy thông tin energy nodes (em)
        cursor.execute("SELECT * FROM registration_em WHERE room_id = %s", (room_id,))
        data['em'] = cursor.fetchall()

        # Lấy thông tin fan nodes
        cursor.execute("SELECT * FROM registration_fan WHERE room_id = %s", (room_id,))
        data['fan'] = cursor.fetchall()

        # Lấy thông tin ac nodes
        cursor.execute("SELECT * FROM registration_ac WHERE room_id = %s", (room_id,))
        data['ac'] = cursor.fetchall()

        # Lấy thông tin gateway nodes
        cursor.execute("SELECT * FROM registration_gateway WHERE room_id = %s", (room_id,))
        data['gateway'] = cursor.fetchall()

    except Error as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        db.close()

    return jsonify(data), 200

@app.route('/fan_device/delete/<fan_id>', methods=['DELETE'])
def delete_fan_device(fan_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()

    try:
        # Kiểm tra xem bản ghi có tồn tại không
        cursor.execute("SELECT * FROM fan_device WHERE fan_id = %s", (fan_id,))  # Đúng định dạng tham số
        record = cursor.fetchone()

        if not record:
            cursor.close()
            db.close()
            return jsonify({"error": "fan_device not found"}), 404  # Nếu không tìm thấy bản ghi

        # Nếu bản ghi tồn tại, tiến hành xóa
        cursor.execute("DELETE FROM fan_device WHERE fan_id = %s", (fan_id,))  # Sử dụng %s và tuple
        db.commit()  # Lưu thay đổi

        cursor.close()
        db.close()

        return jsonify({"message": "Delete success"}), 204  # 204 (No Content) khi xóa thành công

    except Error as e:
        print("Error during deletion:", e)  # Ghi lại lỗi
        cursor.close()
        db.close()
        return jsonify({"error": "Failed to delete fan_device", "details": str(e)}), 500

@app.route('/connect_key', methods=['GET'])
def connect_key():
    data = request.json
    connect_key = data.get('connect_key')
    type_node = data.get('type_node')
    gateway_id = data.get('gateway_id', -1)
    mac = data.get('mac', '')

    if not connect_key or not type_node:
        return jsonify({"error": "Missing required fields"}), 400  # Bad Request

    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Internal Server Error

    cursor = db.cursor(dictionary=True)

    if gateway_id != -1:
        cursor.execute("SELECT * FROM registration_gateway WHERE gateway_id = %s", (gateway_id,))
    else:
        cursor.execute("SELECT * FROM registration_gateway WHERE mac = %s", (mac,))

    gateway = cursor.fetchone()

    if not gateway:
        cursor.close()
        db.close()
        return jsonify({"error": "Gateway not found"}), 500  # Internal Server Error

    cursor.close()
    db.close()

    # Prepare MQTT message
    mqtt_message = {
        "operator": "connect_key",
        "status": 1,
        "info": {
            "mac": gateway['mac'],
            "connect_key": connect_key,
            "type_node": type_node
        }
    }

    ack_received.clear()
    mqtt_client.publish(mqtt_topic_connect_key, json.dumps(mqtt_message))

    # Wait for ack
    if not ack_received.wait(timeout=300):  # 5 minutes timeout
        return jsonify({"error": "No ack received from gateway"}), 504  # Gateway Timeout

    return jsonify({"message": "Install code sent to gateway", "ack": ack_info}), 200  # OK

if __name__ == '__main__':
    weather_process = Process(target=schedule_weather_insert)
    weather_process.start()

    mqtt_thread = threading.Thread(target=run_mqtt_client)
    mqtt_thread.start()

    app.run(debug=True)
