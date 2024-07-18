import mariadb

class DatabaseAccess:
    def __init__(self, connection):
        self.connection = connection

    def execute_query(self, query):
        cursor = self.connection.cursor()
        cursor.execute(query)
        self.connection.commit()
        cursor.close()

def database_insert_sample(db):
    # Insert sample data into PMVtable
    pmv_query = """
        INSERT INTO PMVtable (met, clo, pmvref, outdoor_temp) VALUES 
        (1.2, 0.5, 0.5, 25.0), 
        (1.5, 0.7, 0.6, 30.0)
    """
    db.execute_query(pmv_query)

    # Insert sample data into RegistrationSensor
    reg_sensor_query = """
        INSERT INTO RegistrationSensor (id) VALUES 
        (1), 
        (2)
    """
    db.execute_query(reg_sensor_query)

    # Insert sample data into SensorNode
    sensor_node_query = """
        INSERT INTO SensorNode (temp, humid, wind, pm25, time, sensor_id) VALUES 
        (24.5, 60.0, 1.5, 35, 1622559182, 1), 
        (25.5, 55.0, 1.0, 30, 1622559182, 2)
    """
    db.execute_query(sensor_node_query)

    # Insert sample data into RegistrationEnergy
    reg_energy_query = """
        INSERT INTO RegistrationEnergy (id) VALUES 
        (1)
    """
    db.execute_query(reg_energy_query)

    # Insert sample data into EnergyMeasure
    energy_measure_query = """
        INSERT INTO EnergyMeasure (voltage, current, frequency, active_power, power_factor, time, em_id) VALUES 
        (230.0, 5.0, 50, 1150.0, 0.98, 1622559182, 1)
    """
    db.execute_query(energy_measure_query)

    # Insert sample data into RegistrationFan
    reg_fan_query = """
        INSERT INTO RegistrationFan (id, sensor_links, model) VALUES 
        (1, '[1]', 'Model A'), 
        (2, '[2]', 'Model B')
    """
    db.execute_query(reg_fan_query)

    # Insert sample data into Fan
    fan_query = """
        INSERT INTO Fan (set_speed, control_mode, set_time, time, fan_id) VALUES 
        (2.5, 1, 3600, 1622559182, 1), 
        (3.0, 0, 3600, 1622559182, 2)
    """
    db.execute_query(fan_query)

    # Insert sample data into RegistrationAC
    reg_ac_query = """
        INSERT INTO RegistrationAC (id, sensor_links, model) VALUES 
        (1, '[1,2]', 'AC Model 1')
    """
    db.execute_query(reg_ac_query)

    # Insert sample data into AirConditioner
    ac_query = """
        INSERT INTO AirConditioner (set_temp, state, control_mode, time, ac_id) VALUES 
        (22.0, true, false, 1622559182, 1)
    """
    db.execute_query(ac_query)

# Example usage

# Establish the database connection (adjust parameters as needed)
connection = mariadb.connect(
    host='localhost',
    user='giang_mariadb',
    password='k',
    database='iot_clg_db'
)

# Create an instance of DatabaseAccess with the connection
db_access = DatabaseAccess(connection)

# Call the function to insert sample data
database_insert_sample(db_access)

# Close the database connection
connection.close()
