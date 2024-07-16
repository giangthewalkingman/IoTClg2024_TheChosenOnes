#include <iostream>
#include <chrono>
#include <stdlib.h>
#include <thread>
#include <atomic>
#include <csignal>
#include <mariadb/mysql.h>
#include "../include/database_access.h"
#include "../include/control_actuator.h"
// #include "../lib/z3gateway_comm.cpp"

//Private variables

//Private functions
void databaseSetup();
void databaseInsertSample(DatabaseAccess& db);
void runControlProgramWithReset(DatabaseAccess& db);
void control_program();
// Signal handler to reset control program manually
std::atomic<bool> reset_requested(false);
void signalHandler(int signum);
bool checkForNodeChanges(DatabaseAccess& db);


// 
int main(int argc, char *argv[]) {
    // std::signal(SIGINT, signalHandler); // Handle Ctrl+C signal to manually reset
    DatabaseAccess db;
    databaseInsertSample(db);
    while (true) {
        reset_requested.store(false);
        std::thread control_program_thread(runControlProgramWithReset, std::ref(db));

        // Monitor for manual reset signal
        while (!reset_requested.load()) {
            if (checkForNodeChanges(db)) {
                reset_requested.store(true);
            }
            std::this_thread::sleep_for(std::chrono::milliseconds(50));
        }

        // Signal to stop the control program thread
        control_program_thread.detach();
        std::cout << "Resetting control program..." << std::endl;
    }
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

// Function to run the control program and reset after 5 minutes
void runControlProgramWithReset(DatabaseAccess& db) {
    std::atomic<bool> running(true);

    auto control_program_thread = [&]() {
        while (running.load()) {
            control_program(db);
        }
    };

    auto reset_thread = [&]() {
        using namespace std::chrono_literals;
        std::this_thread::sleep_for(5min);
        running.store(false);
    };

    std::thread cp_thread(control_program_thread);
    std::thread rt_thread(reset_thread);

    cp_thread.join();
    rt_thread.join();
}

void databaseInsertSample(DatabaseAccess& db) {
    // Insert sample data into PMVtable
    const char* pmv_query = "INSERT INTO PMVtable (met, clo, pmvref, outdoor_temp) VALUES "
                            "(1.2, 0.5, 0.5, 25.0), "
                            "(1.5, 0.7, 0.6, 30.0)";
    mysql_execute_query(con, pmv_query);

    // Insert sample data into RegistrationSensor
    const char* reg_sensor_query = "INSERT INTO RegistrationSensor (id) VALUES (1), (2)";
    mysql_execute_query(con, reg_sensor_query);

    // Insert sample data into SensorNode
    const char* sensor_node_query = "INSERT INTO SensorNode (temp, humid, wind, pm25, time, sensor_id) VALUES "
                                    "(24.5, 60.0, 1.5, 35, 1622559182, 1), "
                                    "(25.5, 55.0, 1.0, 30, 1622559182, 2)";
    mysql_execute_query(con, sensor_node_query);

    // Insert sample data into RegistrationEnergy
    const char* reg_energy_query = "INSERT INTO RegistrationEnergy (id) VALUES (1)";
    mysql_execute_query(con, reg_energy_query);

    // Insert sample data into EnergyMeasure
    const char* energy_measure_query = "INSERT INTO EnergyMeasure (voltage, current, frequency, active_power, power_factor, time, em_id) VALUES "
                                       "(230.0, 5.0, 50, 1150.0, 0.98, 1622559182, 1)";
    mysql_execute_query(con, energy_measure_query);

    // Insert sample data into RegistrationFan
    const char* reg_fan_query = "INSERT INTO RegistrationFan (id, sensor_link, model) VALUES "
                                "(1, 1, 'Model A'), "
                                "(2, 2, 'Model B')";
    mysql_execute_query(con, reg_fan_query);

    // Insert sample data into Fan
    const char* fan_query = "INSERT INTO Fan (set_speed, control_mode, set_time, time, fan_id) VALUES "
                            "(2.5, 1, 3600, 1622559182, 1), "
                            "(3.0, 0, 3600, 1622559182, 2)";
    mysql_execute_query(con, fan_query);

    // Insert sample data into RegistrationAC
    const char* reg_ac_query = "INSERT INTO RegistrationAC (id, sensor_link, model) VALUES "
                               "(1, 1, 'AC Model 1')";
    mysql_execute_query(con, reg_ac_query);

    // Insert sample data into AirConditioner
    const char* ac_query = "INSERT INTO AirConditioner (set_temp, state, control_mode, time, ac_id) VALUES "
                           "(22.0, true, false, 1622559182, 1)";
    mysql_execute_query(con, ac_query);
}

// Signal handler to reset control program manually
void signalHandler(int signum) {
    reset_requested.store(true);
}

void databaseSetup() {
    //
}

bool checkForNodeChanges(DatabaseAccess& db) {
    static ThingsIds previous_things_ids;

    ThingsIds current_things_ids = db.getThingsIds(con); // Fetch the current state of nodes

    if (current_things_ids != previous_things_ids) {
        previous_things_ids = current_things_ids; // Update the previous state
        return true;
    }

    return false;
}
