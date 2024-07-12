#include <iostream>
#include <chrono>
#include <stdlib.h>
#include <mariadb/mysql.h>
#include "../lib/database_access.cpp"
#include "../lib/control_actuator.cpp"
#include "../lib/z3gateway_comm.cpp"

//Private variables

//Private functions
void databaseSetup();
void databaseInsertSample();

void control_program();

// 
int main(int argc, char *argv[]) {
    DatabaseAccess db;
    databaseInsertSample();
    return 0;
}

void control_program(DatabaseAccess db) {
    std::vector<PMV_Data> sensor_env_list;
    std::vector<FanNode> fan_node_list;
    std::vector<ACNode> ac_node_list;

    //  room information
    double met, pmv_ref, outdoor_temp, clo;

    // truy van db lay so luong cac node
    ThingsIds things_ids_array = db.getThingsIds(con);

    // PMV_Data pmv_data_1(fan_id[0], 24.5, 3.5, 15);
    // PMV_Data pmv_data_2(fan_id[1], 34.5, 2.5, 25);
    FanNode fan_node;
    ACNode ac_node;

    // truy van de lay room info
    db.getPMVData(met, clo, pmv_ref, outdoor_temp);
    
    // calculate params initially
    for (int id = 0; id < things_ids_array.sensor_ids.size(); id++) {
        // lay du lieu cua sensor tu database: temp, humid, ...
        // khai bao PMV:
        // tinh pmv
        // tinh max speed
        // gui len server data: temp, humid, wind, pmv, wind_max
        PMV_Data pmv_data(things_ids_array.sensor_ids[id], 24.5, 3.5, 15);

        pmv_data.get_max_air_speed(id);
        sensor_env_list.push_back(pmv_data);
    }
    for (int id = 0; id < things_ids_array.fan_ids.size(); id++) {
        fan_node.fan_id = id;
        fan_node.get_sensor_link(); // truy van
        fan_node.cal_pmv_avg(sensor_env_list);
        fan_node_list.push_back(fan_node);
    }
    for (int id = 0; id < things_ids_array.ac_ids.size(); id++) {
        ac_node.ac_id = id;
        ac_node.get_sensor_link();
        ac_node.cal_pmv_avg(sensor_env_list);
        ac_node_list.push_back(ac_node);
    }

    // control ACs
    for (auto & item : ac_node_list) {
        if (outdoor_temp - item.ac_temp > DELTA_TEMP) {
            item.set_temp(MAXIMUM_TEMP_FOR_INFINITE_PERIOD);
            item.set_time(-1);  // -1 = infinite
            if (item.state == false)
                item.set_state(true);
            continue;
        }
        if (item.pmv_avg > 0.5) {
            if (item.state == false) {
                item.set_time(AC_TURN_ON_TIME_REF);
                item.set_state(true);
            }
        }
        else {
            item.set_state(false);
        }
    }

    // sensor thread for cal pmv
    // 

    // control fans in multithreads
    std::vector<std::thread> control_fan_thread;
    for (auto& item : fan_node_list) {
        control_fan_thread.emplace_back([&item, &pmv_ref, &sensor_env_list]() {
            item.control_fan_pmv_model(sensor_env_list, pmv_ref);
        });
    }
    // wait for all threads complete
    for (auto& thread : control_fan_thread) {
        thread.join();
    }
}

void databaseInsertSample() {
    // e.g. for inserting data 
    double temp = 25.3;
    double humid = 60.2;
    double wind = 5.4;
    int pm25 = 12;
    int time = 1622559182;
    int sensor_id = 1;

    // check if sensor_id exists
    if (!check_sensor_id_exists(con, sensor_id)) {
        std::cout << "Error: sensor_id " << sensor_id << " does not exist in RegistrationSensor table." << std::endl;
        mysql_close(con);
        // return 1;
    }

    // Prepare the SQL query
    char query[256];
    snprintf(query, sizeof(query), "INSERT INTO SensorNode (temp, humid, wind, pm25, time, sensor_id) VALUES (%f, %f, %f, %d, %d, %d);",
             temp, humid, wind, pm25, time, sensor_id);

    // Execute the query
    mysql_execute_query(con, query);

    std::cout << "Data inserted successfully into SensorNode table." << std::endl;

}

void databaseSetup() {
    //
}
