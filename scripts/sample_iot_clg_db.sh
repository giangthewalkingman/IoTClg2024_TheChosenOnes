#!/bin/bash

# MySQL credentials
DB_HOST="localhost"
DB_USER="giang_mariadb"
DB_PASS="k"
DB_NAME="iot_clg_db"

# Function to execute a query
execute_query() {
  local query="$1"
  mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "$query"
  if [ $? -ne 0 ]; then
    echo "QUERY FAILED: $query"
    exit 1
  fi
}

# Insert data into PMVtable
pmv_query="INSERT INTO PMVtable (id, met, clo, pmvref, outdoor_temp) VALUES
(1, 1.2, 0.5, 0.5, 27.0),
(2, 1.5, 0.7, 0.6, 26.5)"
execute_query "$pmv_query"

# Insert data into RegistrationSensor
reg_sensor_query="INSERT INTO RegistrationSensor (id) VALUES (1), (2)"
execute_query "$reg_sensor_query"

# Insert data into SensorNode
sensor_node_query="INSERT INTO SensorNode (temp, humid, wind, pm25, time, sensor_id) VALUES
(27.5, 60.0, 1.5, 35, 1622559182, 1),
(24.8, 55.0, 1.0, 30, 1622559182, 2)"
execute_query "$sensor_node_query"

# Insert data into RegistrationEnergy
reg_energy_query="INSERT INTO RegistrationEnergy (id) VALUES (1)"
execute_query "$reg_energy_query"

# Insert data into EnergyMeasure
energy_measure_query="INSERT INTO EnergyMeasure (voltage, current, frequency, active_power, power_factor, time, em_id) VALUES
(230.0, 5.0, 50, 1150.0, 0.98, 1622559182, 1)"
execute_query "$energy_measure_query"

# Insert data into RegistrationFan
reg_fan_query="INSERT INTO RegistrationFan (id, sensor_links, model) VALUES
(1, '[1]', 'Model A'),
(2, '[2]', 'Model B')"
execute_query "$reg_fan_query"

# Insert data into Fan
fan_query="INSERT INTO Fan (set_speed, control_mode, set_time, time, fan_id) VALUES
(2.5, 1, 3600, 1622559182, 1),
(3.0, 0, 3600, 1622559182, 2)"
execute_query "$fan_query"

# Insert data into RegistrationAC
reg_ac_query="INSERT INTO RegistrationAC (id, sensor_links, model) VALUES
(1, '[1,2]', 'AC Model 1')"
execute_query "$reg_ac_query"

# Insert data into AirConditioner
ac_query="INSERT INTO AirConditioner (set_temp, state, control_mode, time, ac_id) VALUES
(22.0, true, false, 1622559182, 1)"
execute_query "$ac_query"

echo "All queries executed successfully."
