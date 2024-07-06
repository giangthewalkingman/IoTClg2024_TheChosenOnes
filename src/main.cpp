#include <iostream>
#include <stdlib.h>
#include <mariadb/mysql.h>
#include "lib/database_access.cpp"
#include "lib/control_actuator.cpp"
#include "lib/z3gateway_comm.cpp"

int main(int argc, char *argv[]) {
    std::vector<int> sensor_id = {1,2,3,4}; // get list sensor_id
    std::vector<int> fan_id = {1,2};
    std::vector<int> ac_id = {1};
    std::vector<PMV_Data> sensor_env_list;
    std::vector<FanNode> fan_node_list;
    std::vector<ACNode> ac_node_list;

    PMV_Data pmv_data_1(fan_id[0], 24.5, 3.5, 15);
    PMV_Data pmv_data_2(fan_id[1], 34.5, 2.5, 25);
    FanNode fan_node;
    ACNode ac_node;
    DatabaseAccess db1;
    databaseTest();

    float outdoor_temp, met, clo, pmv_ref;
    get_room_infomation(met, clo, pmv_ref, outdoor_temp);
    
    // calculate params initially
    for (int id = 0; id < sensor_id.size(); id++) {
        pmv_data_1.sensor_id = id;
        pmv_data_2.sensor_id = id;
        // pmv_data.get_data(id);
        // pmv_data.cal_pmv(id);
        pmv_data_1.get_max_air_speed(id);
        pmv_data_2.get_max_air_speed(id);
        sensor_env_list.push_back(pmv_data_1);
        sensor_env_list.push_back(pmv_data_2);
    }
    for (int id = 0; id < fan_id.size(); id++) {
        fan_node.fan_id = id;
        fan_node.get_sensor_link();
        fan_node.cal_pmv_avg(sensor_env_list);
        fan_node_list.push_back(fan_node);
    }
    for (int id = 0; id < ac_id.size(); id++) {
        ac_node.ac_id = id;
        ac_node.get_sensor_link();
        ac_node.cal_pmv_avg(sensor_env_list);
        ac_node_list.push_back(ac_node);
    }


    // control ACs
    for (auto & item : ac_node_list) {
        if (outdoor_temp - item.ac_temp > DELTA_TEMP) {
            item.set_temp(MAXIMUM_TEMP_FOR_INFINITE_PERIOD);
            item.set_time(-1);
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
    return 0;
}

int databaseTest() {

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
        return 1;
    }

    // Prepare the SQL query
    char query[256];
    snprintf(query, sizeof(query), "INSERT INTO SensorNode (temp, humid, wind, pm25, time, sensor_id) VALUES (%f, %f, %f, %d, %d, %d);",
             temp, humid, wind, pm25, time, sensor_id);

    // Execute the query
    mysql_execute_query(con, query);

    std::cout << "Data inserted successfully into SensorNode table." << std::endl;

    return 0;
}