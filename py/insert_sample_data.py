import mariadb
import sys

def database_insert_sample():
    try:
        # Setup database connection
        con = mariadb.connect(
            user="giang_mariadb",
            password="k",
            host="localhost",
            port=3306,
            database="iot_clg_db"
        )
    except mariadb.Error as e:
        print(f"Error connecting to MariaDB: {e}")
        sys.exit(1)

    # Create a cursor object
    cur = con.cursor()

    try:
        # Clear tables and reset auto-increment starting point
        tables = ["SensorNode", "RegistrationSensor", "EnergyMeasure", "RegistrationEnergy", "Fan", "RegistrationFan", "AirConditioner", "RegistrationAC"]
        for table in tables:
            cur.execute(f"DELETE FROM {table}")
            cur.execute(f"ALTER TABLE {table} AUTO_INCREMENT = 0")

        # Insert sample data into PMVtable
        pmv_query = """
        INSERT INTO PMVtable (met, clo, pmvref, outdoor_temp) VALUES 
        (1.2, 0.5, 0.5, 25.0), 
        (1.5, 0.7, 0.6, 30.0)
        """
        cur.execute(pmv_query)
        
        # Insert sample data into RegistrationSensor
        reg_sensor_query = "INSERT INTO RegistrationSensor (id) VALUES (0), (1)"
        cur.execute(reg_sensor_query)
        
        # Insert sample data into SensorNode
        sensor_node_query = """
        INSERT INTO SensorNode (temp, humid, wind, pm25, time, sensor_id) VALUES 
        (24.5, 60.0, 1.5, 35, 1622559182, 0), 
        (25.5, 55.0, 1.0, 30, 1622559182, 1)
        """
        cur.execute(sensor_node_query)
        
        # Insert sample data into RegistrationEnergy
        reg_energy_query = "INSERT INTO RegistrationEnergy (id) VALUES (0)"
        cur.execute(reg_energy_query)
        
        # Insert sample data into EnergyMeasure
        energy_measure_query = """
        INSERT INTO EnergyMeasure (voltage, current, frequency, active_power, power_factor, time, em_id) VALUES 
        (230.0, 5.0, 50, 1150.0, 0.98, 1622559182, 0)
        """
        cur.execute(energy_measure_query)
        
        # Insert sample data into RegistrationFan
        reg_fan_query = """
        INSERT INTO RegistrationFan (id, sensor_links, model) VALUES 
        (0, '[0]', 'Model A'), 
        (1, '[1]', 'Model B')
        """
        cur.execute(reg_fan_query)
        
        # Insert sample data into Fan
        fan_query = """
        INSERT INTO Fan (set_speed, control_mode, set_time, time, fan_id) VALUES 
        (2.5, 1, 3600, 1622559182, 0), 
        (3.0, 1, 3600, 1622559182, 1)
        """
        cur.execute(fan_query)
        
        # Insert sample data into RegistrationAC
        reg_ac_query = """
        INSERT INTO RegistrationAC (id, sensor_links, model) VALUES 
        (0, '[0,1]', 'AC Model 1')
        """
        cur.execute(reg_ac_query)
        
        # Insert sample data into AirConditioner
        ac_query = """
        INSERT INTO AirConditioner (set_temp, state, control_mode, time, ac_id) VALUES 
        (22.0, true, false, 1622559182, 0)
        """
        cur.execute(ac_query)

        # Commit the transactions
        con.commit()

    except mariadb.Error as e:
        print(f"Error executing query: {e}")
        con.rollback()
    finally:
        # Close the connection
        con.close()

# Call the function to insert sample data
database_insert_sample()
