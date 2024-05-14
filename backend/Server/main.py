import flask
from flask import Flask, jsonify, request
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)

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

@app.route('/room/insert', methods=['POST'])
def insertRoom():
    db = create_connection()
    if db is None:
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

@app.route('/air_conditioner/insert', methods=['POST'])
def insertAC():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    set_temp = flask.request.json.get('set_temp')
    control_mode = flask.request.json.get('control_mode')
    state = flask.request.json.get('state')
    status = flask.request.json.get('status')

    cursor.execute("INSERT INTO air_conditioner (set_temp, control_mode, state, status) "
                   "VALUES (%s, %s, %s, %s)", (set_temp, control_mode, state, status))
    db.commit()

    last_inserted_id = cursor.lastrowid  # Lấy ID của hàng vừa được thêm

    # Lấy thông tin của bản ghi vừa được thêm
    cursor.execute("SELECT * FROM air_conditioner WHERE ac_id = %s", (last_inserted_id,))
    key = [desc[0] for desc in cursor.description]
    new_record = dict(zip(key, cursor.fetchone()))

    cursor.close()
    db.close()

    return jsonify(new_record), 201

@app.route('/air_conditioner/update/<ac_id>', methods=['PUT'])
def updateAC(ac_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()

    # Lấy dữ liệu đầu vào từ yêu cầu
    set_temp = request.json.get('set_temp')
    control_mode = request.json.get('control_mode')
    state = request.json.get('state')
    status = request.json.get('status')

    # Chuẩn bị truy vấn SQL để cập nhật
    query_parts = []
    update_values = []

    if set_temp is not None:
        query_parts.append("set_temp = %s")
        update_values.append(set_temp)

    if control_mode is not None:
        query_parts.append("control_mode = %s")
        update_values.append(control_mode)

    if state is not None:
        query_parts.append("state = %s")
        update_values.append(state)

    if status is not None:
        query_parts.append("status = %s")
        update_values.append(status)

    if not query_parts:
        cursor.close()
        db.close()
        return jsonify({"error": "No updateable fields provided"}), 400  # Không có trường cần cập nhật

    query = f"UPDATE air_conditioner SET {', '.join(query_parts)} WHERE ac_id = %s"
    update_values.append(ac_id)

    try:
        cursor.execute(query, tuple(update_values))
        db.commit()

        cursor.close()
        db.close()

        return jsonify({"message": "Air conditioner updated successfully"}), 200

    except Error as e:
        print("Error during update:", e)
        cursor.close()
        db.close()
        return jsonify({"error": "Failed to update air conditioner"}), 500

@app.route('/air_conditioner/delete/<ac_id>', methods=['DELETE'])
def deleteAC(ac_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()

    try:
        # Kiểm tra xem bản ghi có tồn tại không
        cursor.execute("SELECT * FROM air_conditioner WHERE ac_id = %s", (ac_id,))
        record = cursor.fetchone()

        if not record:
            cursor.close()
            db.close()
            return jsonify({"error": "Air conditioner not found"}), 404  # Nếu không tìm thấy bản ghi

        # Nếu bản ghi tồn tại, tiến hành xóa
        cursor.execute("DELETE FROM air_conditioner WHERE ac_id = %s", (ac_id,))
        db.commit()

        cursor.close()
        db.close()

        return jsonify({"message": "Air conditioner deleted successfully"}), 204  # 204 (No Content)

    except Error as e:
        print("Error during deletion:", e)
        cursor.close()
        db.close()
        return jsonify({"error": "Failed to delete air conditioner"}), 500

@app.route('/registration_ac/getall', methods=['GET'])
def get_all_registration_ac():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()
    cursor.execute("SELECT * FROM registration_ac")
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
    ac_id = request.json.get('ac_id')

    if room_id is None or ac_id is None:
        cursor.close()
        db.close()
        return jsonify({"error": "room_id and ac_id are required"}), 400  # Yêu cầu không hợp lệ

    data = (room_id, ac_id)

    cursor.execute("INSERT INTO registration_ac (room_id, ac_id) VALUES (%s, %s)", data)
    db.commit()

    cursor.close()
    db.close()

    return jsonify({"message": "Registration AC added successfully"}), 201

@app.route('/registration_ac/update/<int:room_id>/<int:ac_id>', methods=['PUT'])
def update_registration_ac(room_id, ac_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()

    # Lấy dữ liệu đầu vào từ yêu cầu PUT
    new_room_id = request.json.get('new_room_id')
    new_ac_id = request.json.get('new_ac_id')

    update_values = []
    query_parts = []

    if new_room_id:
        query_parts.append("room_id = %s")
        update_values.append(new_room_id)

    if new_ac_id:
        query_parts.append("ac_id = %s")
        update_values.append(new_ac_id)

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

@app.route('/fan/insert', methods=['POST'])
def insert_fan():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    set_speed = request.json.get('set_speed')
    control_mode = request.json.get('control_mode')
    set_time = request.json.get('set_time')
    status = request.json.get('status')

    if None in (set_speed, control_mode, set_time, status):
        return jsonify({"error": "Missing required fields"}), 400

    query = "INSERT INTO fan (set_speed, control_mode, set_time, status) VALUES (%s, %s, %s, %s)"
    cursor.execute(query, (set_speed, control_mode, set_time, status))
    db.commit()

    cursor.close()
    db.close()

    return jsonify({"message": "Fan added successfully"}), 201

@app.route('/fan/update/<fan_id>', methods=['PUT'])
def update_fan(fan_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()

    set_speed = request.json.get('set_speed')
    control_mode = request.json.get('control_mode')
    set_time = request.json.get('set_time')
    status = request.json.get('status')

    update_values = []
    query_parts = []

    if set_speed is not None:
        query_parts.append("set_speed = %s")
        update_values.append(set_speed)

    if control_mode is not None:
        query_parts.append("control_mode = %s")
        update_values.append(control_mode)

    if set_time is not None:
        query_parts.append("set_time = %s")
        update_values.append(set_time)

    if status is not None:
        query_parts.append("status = %s")
        update_values.append(status)

    if not query_parts:
        return jsonify({"error": "No fields to update"}), 400  # Không có gì để cập nhật

    query = f"UPDATE fan SET {', '.join(query_parts)} WHERE fan_id = %s"
    update_values.append(fan_id)

    try:
        cursor.execute(query, tuple(update_values))
        db.commit()

        cursor.close()
        db.close()

        return jsonify({"message": "Fan updated successfully"}), 200  # 200 (OK)

    except Error as e:
        print("Error during update:", e)
        cursor.close()
        db.close()
        return jsonify({"error": "Failed to update fan"}), 500

@app.route('/fan/delete/<fan_id>', methods=['DELETE'])
def delete_fan(fan_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()

    try:
        cursor.execute("SELECT * FROM fan WHERE fan_id = %s", (fan_id,))
        record = cursor.fetchone()

        if not record:
            cursor.close()
            db.close()
            return jsonify({"error": "Fan not found"}), 404

        cursor.execute("DELETE FROM fan WHERE fan_id = %s", (fan_id,))
        db.commit()

        cursor.close()
        db.close()

        return jsonify({"message": "Fan deleted successfully"}), 204  # 204 (No Content)

    except Error as e:
        print("Error during deletion:", e)
        cursor.close()
        db.close()
        return jsonify({"error": "Failed to delete fan"}), 500

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

@app.route('/registration_fan/insert', methods=['POST'])
def insert_registration_fan():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    room_id = request.json.get('room_id')
    fan_id = request.json.get('fan_id')

    if room_id is None or fan_id is None:
        return jsonify({"error": "room_id and fan_id are required"}), 400

    cursor.execute("INSERT INTO registration_fan (room_id, fan_id) VALUES (%s, %s)", (room_id, fan_id))
    db.commit()

    cursor.close()
    db.close()

    return jsonify({"message": "Registration Fan added successfully"}), 201  # 201 (Created)

@app.route('/registration_fan/update/<room_id>/<fan_id>', methods=['PUT'])
def update_registration_fan(room_id, fan_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()

    new_room_id = request.json.get('new_room_id')
    new_fan_id = request.json.get('new_fan_id')

    update_values = []
    query_parts = []

    if new_room_id:
        query_parts.append("room_id = %s")
        update_values.append(new_room_id)

    if new_fan_id:
        query_parts.append("fan_id = %s")
        update_values.append(new_fan_id)

    if not query_parts:
        return jsonify({"error": "No fields to update"}), 400

    query = f"UPDATE registration_fan SET {', '.join(query_parts)} WHERE room_id = %s AND fan_id = %s"
    update_values.extend([room_id, fan_id])

    try:
        cursor.execute(query, tuple(update_values))
        db.commit()

        cursor.close()
        db.close()

        return jsonify({"message": "Registration Fan updated successfully"}), 200

    except Error as e:
        print("Error during update:", e)
        cursor.close()
        db.close()
        return jsonify({"error": "Failed to update registration fan"}), 500

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

@app.route('/energy_measure/insert', methods=['POST'])
def insert_energy_measure():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()
    voltage = request.json.get('voltage')
    current = request.json.get('current')
    frequency = request.json.get('frequency')
    active_power = request.json.get('active_power')
    power_factor = request.json.get('power_factor')
    status = request.json.get('status')

    # Kiểm tra các trường bắt buộc
    if None in (voltage, current, frequency, active_power, power_factor, status):
        cursor.close()
        db.close()
        return jsonify({"error": "Missing required fields"}), 400  # Lỗi yêu cầu không hợp lệ

    query = "INSERT INTO energy_measure (voltage, current, frequency, active_power, power_factor, status) VALUES (%s, %s, %s, %s, %s, %s)"
    cursor.execute(query, (voltage, current, frequency, active_power, power_factor, status))
    db.commit()

    cursor.close()
    db.close()

    return jsonify({"message": "Energy measure added successfully"}), 201  # 201 (Created)

@app.route('/energy_measure/update/<em_id>', methods=['PUT'])
def update_energy_measure(em_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()

    voltage = request.json.get('voltage')
    current = request.json.get('current')
    frequency = request.json.get('frequency')
    active_power = request.json.get('active_power')
    power_factor = request.json.get('power_factor')
    status = request.json.get('status')

    update_values = []
    query_parts = []

    if voltage is not None:
        query_parts.append("voltage = %s")
        update_values.append(voltage)

    if current is not None:
        query_parts.append("current = %s")
        update_values.append(current)

    if frequency is not None:
        query_parts.append("frequency = %s")
        update_values.append(frequency)

    if active_power is not None:
        query_parts.append("active_power = %s")
        update_values.append(active_power)

    if power_factor is not None:
        query_parts.append("power_factor = %s")
        update_values.append(power_factor)

    if status is not None:
        query_parts.append("status = %s")
        update_values.append(status)

    if not query_parts:
        return jsonify({"error": "No fields to update"}), 400  # Không có trường để cập nhật

    query = f"UPDATE energy_measure SET {', '.join(query_parts)} WHERE em_id = %s"
    update_values.append(em_id)

    try:
        cursor.execute(query, tuple(update_values))
        db.commit()

        cursor.close()
        db.close()

        return jsonify({"message": "Energy measure updated successfully"}), 200  # 200 (OK)

    except Error as e:
        print("Error during update:", e)
        cursor.close()
        db.close()
        return jsonify({"error": "Failed to update energy measure"}), 500  # Lỗi máy chủ nội bộ

@app.route('/energy_measure/delete/<em_id>', methods=['DELETE'])
def delete_energy_measure(em_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()

    try:
        # Kiểm tra xem bản ghi có tồn tại không
        cursor.execute("SELECT * FROM energy_measure WHERE em_id = %s", (em_id,))
        record = cursor.fetchone()

        if not record:
            cursor.close()
            db.close()
            return jsonify({"error": "Energy measure not found"}), 404  # Nếu không tìm thấy

        cursor.execute("DELETE FROM energy_measure WHERE em_id = %s", (em_id,))
        db.commit()  # Lưu thay đổi

        cursor.close()
        db.close()

        return jsonify({"message": "Energy measure deleted successfully"}), 204  # 204 (No Content)

    except Error as e:
        print("Error during deletion:", e)
        cursor.close()
        db.close()
        return jsonify({"error": "Failed to delete energy measure"}), 500  # Lỗi máy chủ nội bộ

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

@app.route('/registration_em/insert', methods=['POST'])
def insert_registration_em():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    room_id = request.json.get('room_id')
    em_id = request.json.get('em_id')

    if room_id is None or em_id is None:
        return jsonify({"error": "room_id and em_id are required"}), 400

    cursor.execute("INSERT INTO registration_em (room_id, em_id) VALUES (%s, %s)", (room_id, em_id))
    db.commit()

    cursor.close()
    db.close()

    return jsonify({"message": "Registration EM added successfully"}), 201  # 201 (Created)

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

@app.route('/sensor_node/insert', methods=['POST'])
def insert_sensor_node():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()
    temp = request.json.get('temp')
    wind = request.json.get('wind')
    humid = request.json.get('humid')
    pm25 = request.json.get('pm25')
    status = request.json.get('status')

    if None in (temp, wind, humid, pm25, status):
        cursor.close()
        db.close()
        return jsonify({"error": "Missing required fields"}), 400  # Bad Request

    query = "INSERT INTO sensor_node (temp, wind, humid, pm25, status) VALUES (%s, %s, %s, %s, %s)"
    cursor.execute(query, (temp, wind, humid, pm25, status))
    db.commit()

    cursor.close()
    db.close()

    return jsonify({"message": "Sensor node added successfully"}), 201  # 201 (Created)

@app.route('/sensor_node/update/<sensor_id>', methods=['PUT'])
def update_sensor_node(sensor_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()

    # Lấy dữ liệu từ yêu cầu PUT
    temp = request.json.get('temp')
    wind = request.json.get('wind')
    humid = request.json.get('humid')
    pm25 = request.json.get('pm25')
    status = request.json.get('status')

    update_values = []
    query_parts = []

    if temp is not None:
        query_parts.append("temp = %s")
        update_values.append(temp)

    if wind is not None:
        query_parts.append("wind = %s")
        update_values.append(wind)

    if humid is not None:
        query_parts.append("humid = %s")
        update_values.append(humid)

    if pm25 is not None:
        query_parts.append("pm25 = %s")
        update_values.append(pm25)

    if status is not None:
        query_parts.append("status = %s")
        update_values.append(status)

    if not query_parts:
        cursor.close()
        db.close()
        return jsonify({"error": "No fields to update"}), 400  # Nếu không có gì để cập nhật

    query = f"UPDATE sensor_node SET {', '.join(query_parts)} WHERE sensor_id = %s"
    update_values.append(sensor_id)

    try:
        cursor.execute(query, tuple(update_values))
        db.commit()

        cursor.close()
        db.close()

        return jsonify({"message": "Sensor node updated successfully"}), 200  # 200 (OK)

    except Error as e:
        print("Error during update:", e)
        cursor.close()
        db.close()
        return jsonify({"error": "Failed to update sensor node"}), 500  # Lỗi máy chủ nội bộ

@app.route('/sensor_node/delete/<int:sensor_id>', methods=['DELETE'])
def delete_sensor_node(sensor_id):
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500  # Lỗi kết nối

    cursor = db.cursor()

    try:
        cursor.execute("SELECT * FROM sensor_node WHERE sensor_id = %s", (sensor_id,))
        record = cursor.fetchone()

        if not record:
            cursor.close()
            db.close()
            return jsonify({"error": "Sensor node not found"}), 404  # 404 (Not Found)

        cursor.execute("DELETE FROM sensor_node WHERE sensor_id = %s", (sensor_id,))
        db.commit()

        cursor.close()
        db.close()

        return jsonify({"message": "Sensor node deleted successfully"}), 204  # 204 (No Content)

    except Error as e:
        print("Error during deletion:", e)
        cursor.close()
        db.close()
        return jsonify({"error": "Failed to delete sensor node"}), 500


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

@app.route('/registration_sensor/insert', methods=['POST'])
def insert_registration_sensor():
    db = create_connection()
    if db is None:
        return jsonify({"error": "Unable to connect to database"}), 500

    cursor = db.cursor()
    room_id = request.json.get('room_id')  # Dữ liệu từ yêu cầu POST
    sensor_id = request.json.get('sensor_id')

    if room_id is None or sensor_id is None:
        cursor.close()
        db.close()
        return jsonify({"error": "room_id and sensor_id are required"}), 400  # Thiếu tham số

    query = "INSERT INTO registration_sensor (room_id, sensor_id) VALUES (%s, %s)"
    cursor.execute(query, (room_id, sensor_id))
    db.commit()

    cursor.close()
    db.close()

    return jsonify({"message": "Registration sensor added successfully"}), 201  # 201 (Created)

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

if __name__ == '__main__':
    app.run(debug=True)
