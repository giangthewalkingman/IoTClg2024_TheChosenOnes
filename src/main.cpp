// #include <iostream>
// #include <chrono>
// #include <zmq.hpp>
// #include <string>
// #include <stdlib.h>
// #include <thread>
// #include <atomic>
// #include <csignal>
// #include <sstream>
// #include <mariadb/mysql.h>
// #include "../include/database_access.h"
// #include "../include/control_actuator.h"
// // #include "../lib/z3gateway_comm.cpp"

// //Private variables

// //Private functions
// void databaseSetup();
// void databaseInsertSample(DatabaseAccess& db);
// void control_program(DatabaseAccess& db, zmq::socket_t &socket);
// // Signal handler to reset control program manually
// std::atomic<bool> reset_requested(false);
// void signalHandler(int signum);
// bool checkForNodeChanges(DatabaseAccess& db);
// void reset_control_program(DatabaseAccess& db, zmq::socket_t &socket);
// void send_data(zmq::socket_t &socket, const std::vector<int>& data);

// // 
// int main(int argc, char *argv[]) {
//     std::cout << "This is the start of main function\n";

//     std::cout << "Create ZeroMQ\n";
//     zmq::context_t context(1);
//     zmq::socket_t socket(context, ZMQ_PUSH);
//     socket.bind("tcp://*:5432");


//     // Tạo một socket kiểu PUSH
//     std::cout << "Create DB connection\n";
//     // std::signal(SIGINT, signalHandler); // Handle Ctrl+C signal to manually reset
//     DatabaseAccess db;
//     // db.databaseInsertSample();
//     // control_program(db);
//     std::thread resetThread(reset_control_program, std::ref(db), std::ref(socket));
//     resetThread.join();
//     // while (true) {
//     //     reset_requested.store(false);
//     //     std::thread control_program_thread(runControlProgramWithReset, std::ref(db));

//     //     // Monitor for manual reset signal
//     //     while (!reset_requested.load()) {
//     //         if (checkForNodeChanges(db)) {
//     //             reset_requested.store(true);
//     //         }
//     //         std::this_thread::sleep_for(std::chrono::milliseconds(50));
//     //     }

//     //     // Signal to stop the control program thread
//     //     control_program_thread.detach();
//     //     std::cout << "Resetting control program..." << std::endl;
//     // }
//     return 0;
// }


// void send_data(zmq::socket_t &socket, const std::vector<int>& data) {
//     // Tạo một socket kiểu PUSH
//     // zmq::socket_t socket(context, ZMQ_PUSH);
//     // socket.bind("tcp://*:5432");

//     // Chuẩn bị dữ liệu dưới dạng chuỗi phân cách bởi dấu phẩy
//     std::ostringstream oss;
//     for (size_t i = 0; i < data.size(); ++i) {
//         oss << data[i];
//         if (i != data.size() - 1) {
//             oss << ",";
//         }
//     }
//     std::string data_str = oss.str();

//     // Tạo một ZeroMQ message và gửi nó
//     zmq::message_t message(data_str.size());
//     memcpy(message.data(), data_str.data(), data_str.size());
//     socket.send(message, zmq::send_flags::none);
// }

// void control_program(DatabaseAccess& db, zmq::socket_t &socket) {

//     std::cout << "Control Program is running\n";
//     std::vector<PMV_Data> sensor_env_list;
//     std::vector<FanNode> fan_node_list;
//     std::vector<ACNode> ac_node_list;
//     // std::vector<int> fan_sensorlink_list;
//     // std::vector<int> ac_sensorlink_list;

//     //  room information
//     double met, pmv_ref, outdoor_temp, clo;
//     // pmv information
//     double temp, humid, wind, pm25;
//     int sensor_time;

//     // truy van db lay so luong cac node
//     ThingsIds things_ids_array = db.getThingsIds(con);
//     std::cout << "truy van db lay so luong cac node - Success.\n";
//     // std::cout << things_ids_array.sensor_ids.size() << " sensors\n";
//     // std::cout << things_ids_array.fan_ids.size() << " fans\n";
//     // std::cout << things_ids_array.ac_ids.size() << " ACs\n";

//     FanNode fan_node;
//     ACNode ac_node;

//     // truy van de lay room info
//     db.getPMVData(met, clo, pmv_ref, outdoor_temp);
//     std::cout << "truy van de lay room info - Success\n";
//     std::cout << "met = " << met << "\n";
//     std::cout << "clo = " << clo << "\n";
//     std::cout << "pmv_ref = " << pmv_ref << "\n";
//     std::cout << "outdoor temp = " << outdoor_temp << "\n";
    
//     // calculate params initially
//     for (int id = 1; id < things_ids_array.sensor_ids.size()+1; id++) {
//         // lay du lieu cua sensor tu database: temp, humid, ...
//         // khai bao PMV:
//         // tinh pmv
//         // tinh max speed
//         // gui len server data: temp, humid, wind, pmv, wind_max
//         db.getSensorNodeData(temp, humid, wind, pm25, sensor_time, id);
//         std::cout << "truy van de lay Sensor node data - Success\n";
//         PMV_Data pmv_data(id, temp, humid, wind);
//         std::cout << "clo = " << clo << "\n";
//         pmv_ppd(temp, wind, humid, met, clo, pmv_data.pmv);
//         pmv_data.get_max_air_speed(id);
//         sensor_env_list.push_back(pmv_data);
//         std::cout << "Current pmv is " << pmv_data.pmv << "\n";
//     }
    
//     for (int id = 1; id < things_ids_array.fan_ids.size()+1; id++) {
//         std::cout << "before get fan sensor link "<< id <<"\n";
//         fan_node.fan_id = id;
//         std::vector<int> fan_sensor_links;
//         db.getFanSensorLinks(id, fan_sensor_links);
//         fan_node.get_sensor_link(fan_sensor_links); // truy van
//         // std::cout << "after get sensor link\n";
//         fan_node.cal_pmv_avg(sensor_env_list);
//         std::cout << "While getting fan sensor link" << fan_node.pmv_avg << "\n";
//         fan_node_list.push_back(fan_node);
//         std::cout << "after get fan sensor link "<< id <<"\n";
//     }
//     for (int id = 1; id < things_ids_array.ac_ids.size()+1; id++) {
//         ac_node.ac_id = id;
//         std::cout << "before get ac sensor link "<< id <<"\n";
//         std::vector<int>ac_sensor_links;
//         db.getACSensorLinks(id, ac_sensor_links);
//         ac_node.get_sensor_link(ac_sensor_links);
//         std::cout << "after get ac sensor link "<< id <<"\n";
//         ac_node.cal_pmv_avg(sensor_env_list);
//         ac_node_list.push_back(ac_node);
//     }

//     // control ACs
//     for (auto & item : ac_node_list) {
//         if (outdoor_temp - item.ac_temp > DELTA_TEMP) {
//             item.set_temp(MAXIMUM_TEMP_FOR_INFINITE_PERIOD);
//             item.set_time(-1);  // -1 = infinite
//             if (item.state == false)
//                 item.set_state(true);
//                 std::vector<int> send_ac_data = {1, item.ac_id, (int)item.state, item.ac_temp};
//                 send_data(socket,  send_ac_data);
//             continue;
//         }
//         if (item.pmv_avg > 0.5) {
//             if (item.state == false) {
//                 item.set_time(AC_TURN_ON_TIME_REF);
//                 item.set_state(true);
//             }
//         }
//         else {
//             item.set_state(false);
//         }
//         std::vector<int> send_ac_data = {1, item.ac_id, (int)item.state, item.ac_temp};
//         send_data(socket,  send_ac_data);
//     }
//     // sensor thread for cal pmv
//     // 
//     printf("before thread\n");
//     // control fans in multithreads
//     std::vector<std::thread> control_fan_thread;
//     for (auto& item : fan_node_list) {
//         control_fan_thread.emplace_back([&item, &pmv_ref, &sensor_env_list, &db, &met, &clo,
//                                         &socket]() {
//             // item.control_fan_pmv_model(sensor_env_list, pmv_ref);
//             double temp, humid, wind, pm25;
//             int sensor_time;
//             printf("thread test\n");
//             printf("pmv is %lf\n", item.pmv_avg);
//             if (item.pmv_avg <= 0.5 && item.pmv_avg >= -0.5) {
//                 if (item.speed == 0)
//                     item.set_speed(0);
//                     printf("control fan: %d%\n", item.speed);
//                     std::vector<int> send_fan_data = {0, item.fan_id, (int)item.speed};
//                     send_data(socket,  send_fan_data);
//                 double pmv_diff;
//                 // fan will reduce speed as pmv is convergent to pmv_ref
//                 do {
//                     for (auto& item2 : sensor_env_list) {
//                         std::cout << "here\n";
//                         db.getSensorNodeData(temp, humid, wind, pm25, sensor_time, item2.sensor_id);
//                         item2.temp = temp;
//                         item2.humid = humid;
//                         item2.wind = wind;
//                         double pmv;
//                         pmv_ppd(temp, wind, humid, met, clo, pmv);
//                         item2.pmv = pmv;
//                         printf("pmv is %lf\n", item2.pmv);
//                     }
//                     item.set_speed(item.speed - SPEED_STEP);
//                     printf("control fan: %d%\n", item.speed);
//                     item.cal_pmv_avg(sensor_env_list);
//                     pmv_diff = item.pmv_avg - pmv_ref;
//                 } while (pmv_diff < PMV_DIFF_THRESHOLD && pmv_diff > (-1 * PMV_DIFF_THRESHOLD));
//                 if (item.speed > item.max_speed) {
//                     if (item.pmv_avg > -0.5) {
//                         item.set_speed(item.max_speed);
//                         printf("control fan: %d%\n", item.speed);
//                     }
//                     else {
//                         item.set_speed(0);
//                         printf("control fan: %d%\n", item.speed);
//                     }
//                     std::vector<int> send_fan_data = {0, item.fan_id, (int)item.speed};
//                     send_data(socket,  send_fan_data);
//                 }
//             } else if (item.pmv_avg >= 0.5) {
//                 item.set_speed(item.max_speed);
//                 printf("control fan: %d%\n", item.speed);
//                 std::vector<int> send_fan_data = {0, item.fan_id, (int)item.speed};
//                 send_data(socket,  send_fan_data);
//             } else {
//                 item.set_speed(0);
//                 printf("control fan: %d%\n", item.speed);
//                 std::vector<int> send_fan_data = {0, item.fan_id, (int)item.speed};
//                 send_data(socket,  send_fan_data);
//             }
//         });
//     }
//     // wait for all threads complete
//     for (auto& thread : control_fan_thread) {
//         thread.join();
//     }
//     printf("thread done\n");
// }

// void reset_control_program(DatabaseAccess& db, zmq::socket_t &socket) {
//     while (true) {
//         auto start = std::chrono::high_resolution_clock::now();

//         // Start a new thread to run control_program
//         std::thread control_thread(control_program, std::ref(db), std::ref(socket));
//         control_thread.detach(); // Detach the thread to allow it to run independently

//         auto end = std::chrono::high_resolution_clock::now();
//         std::chrono::duration<double> elapsed = end - start;
        
//         // Print the working time of control_program
//         // std::cout << "control_program started at: " << start.time_since_epoch().count() << " and took: " << elapsed.count() << " seconds\n";

//         // Sleep for 10 seconds before starting the next control program
//         std::this_thread::sleep_for(std::chrono::minutes(5)); //Reset after 5 mins
//     }
// }

// bool checkForNodeChanges(DatabaseAccess& db) {
//     static ThingsIds previous_things_ids;

//     ThingsIds current_things_ids = db.getThingsIds(con); // Fetch the current state of nodes

//     if (current_things_ids != previous_things_ids) {
//         previous_things_ids = current_things_ids; // Update the previous state
//         return true;
//     }

//     return false;
// }

#include <iostream>
#include <chrono>
#include <zmq.hpp>
#include <string>
#include <stdlib.h>
#include <thread>
#include <atomic>
#include <csignal>
#include <sstream>
#include <mariadb/mysql.h>
#include "../include/database_access.h"
#include "../include/control_actuator.h"
#include "../include/connection_pool.h"
#include "../include/database_access_cnp.h"
// #include "../lib/z3gateway_comm.cpp"

//Private variables

//Private functions

// Example control program function
void control_program(DatabaseAccessCnp& db, ConnectionPool& connectionPool, zmq::socket_t& socket);
void send_data(zmq::socket_t &socket, const std::vector<int>& data);

int main() {
    // Database connection parameters
    const char* host = "localhost";
    const char* user = "giang_mariadb";
    const char* password = "k";
    const char* dbname = "iot_clg_db";
    size_t poolSize = 10;  // Example pool size

    // Create a connection pool with the specified size
    ConnectionPool connectionPool(poolSize, host, user, password, dbname);

    // Initialize ZeroMQ context and socket
    zmq::context_t context(1);
    zmq::socket_t socket(context, ZMQ_PUSH);
    socket.bind("tcp://*:5432");

    // Create a DatabaseAccessCnp instance
    DatabaseAccessCnp dbAccess(connectionPool);

    // Run the control program
    control_program(dbAccess, connectionPool, socket);

    return 0;
}

void control_program(DatabaseAccessCnp& db, ConnectionPool& connectionPool, zmq::socket_t& socket) {
    std::cout << "Control Program is running\n";
    std::vector<PMV_Data> sensor_env_list;
    std::vector<FanNode> fan_node_list;
    std::vector<ACNode> ac_node_list;

    double met, pmv_ref, outdoor_temp, clo;
    double temp, humid, wind, pm25;
    int sensor_time;

    ThingsIdsCnp things_ids_array = db.getThingsIds();
    std::cout << "Retrieved node IDs from database - Success.\n";

    FanNode fan_node;
    ACNode ac_node;

    db.getPMVData(met, clo, pmv_ref, outdoor_temp);
    std::cout << "Retrieved room info - Success\n";
    std::cout << "met = " << met << "\n";
    std::cout << "clo = " << clo << "\n";
    std::cout << "pmv_ref = " << pmv_ref << "\n";
    std::cout << "outdoor temp = " << outdoor_temp << "\n";

    for (int id = 1; id <= things_ids_array.sensor_ids.size(); id++) {
        db.getSensorNodeData(temp, humid, wind, pm25, sensor_time, id);
        std::cout << "Retrieved sensor node data - Success\n";
        PMV_Data pmv_data(id, temp, humid, wind);
        pmv_ppd(temp, wind, humid, met, clo, pmv_data.pmv);
        pmv_data.get_max_air_speed(id);
        sensor_env_list.push_back(pmv_data);
        std::cout << "Current pmv is " << pmv_data.pmv << "\n";
    }

    for (int id = 1; id <= things_ids_array.fan_ids.size(); id++) {
        fan_node.fan_id = id;
        std::vector<int> fan_sensor_links;
        db.getFanSensorLinks(id, fan_sensor_links);
        fan_node.get_sensor_link(fan_sensor_links);
        fan_node.cal_pmv_avg(sensor_env_list);
        fan_node_list.push_back(fan_node);
    }

    for (int id = 1; id <= things_ids_array.ac_ids.size(); id++) {
        ac_node.ac_id = id;
        std::vector<int> ac_sensor_links;
        db.getACSensorLinks(id, ac_sensor_links);
        ac_node.get_sensor_link(ac_sensor_links);
        ac_node.cal_pmv_avg(sensor_env_list);
        ac_node_list.push_back(ac_node);
    }

    // Example of controlling ACs
    for (auto & item : ac_node_list) {
        if (outdoor_temp - item.ac_temp > DELTA_TEMP) {
            item.set_temp(MAXIMUM_TEMP_FOR_INFINITE_PERIOD);
            item.set_time(-1);  // -1 = infinite
            if (!item.state) {
                item.set_state(true);
                std::vector<int> send_ac_data = {1, item.ac_id, static_cast<int>(item.state), item.ac_temp};
                send_data(socket, send_ac_data);
            }
            continue;
        }
        if (item.pmv_avg > 0.5) {
            if (!item.state) {
                item.set_time(AC_TURN_ON_TIME_REF);
                item.set_state(true);
            }
        } else {
            item.set_state(false);
        }
        std::vector<int> send_ac_data = {1, item.ac_id, static_cast<int>(item.state), item.ac_temp};
        send_data(socket, send_ac_data);
    }

    printf("before thread\n");
    // control fans in multithreads
    std::vector<std::thread> control_fan_thread;
    for (auto& item : fan_node_list) {
        control_fan_thread.emplace_back([&item, &pmv_ref, &sensor_env_list, &db, &met, &clo,
                                        &socket]() {
            // item.control_fan_pmv_model(sensor_env_list, pmv_ref);
            double temp, humid, wind, pm25;
            int sensor_time;
            printf("thread test\n");
            printf("pmv is %lf\n", item.pmv_avg);
            if (item.pmv_avg <= 0.5 && item.pmv_avg >= -0.5) {
                if (item.speed == 0)
                    item.set_speed(0);
                    printf("control fan: %d%\n", item.speed);
                    std::vector<int> send_fan_data = {0, item.fan_id, (int)item.speed};
                    send_data(socket,  send_fan_data);
                double pmv_diff;
                // fan will reduce speed as pmv is convergent to pmv_ref
                do {
                    for (auto& item2 : sensor_env_list) {
                        std::cout << "here\n";
                        db.getSensorNodeData(temp, humid, wind, pm25, sensor_time, item2.sensor_id);
                        item2.temp = temp;
                        item2.humid = humid;
                        item2.wind = wind;
                        double pmv;
                        pmv_ppd(temp, wind, humid, met, clo, pmv);
                        item2.pmv = pmv;
                        printf("pmv is %lf\n", item2.pmv);
                    }
                    item.set_speed(item.speed - SPEED_STEP);
                    printf("control fan: %d%\n", item.speed);
                    item.cal_pmv_avg(sensor_env_list);
                    pmv_diff = item.pmv_avg - pmv_ref;
                } while (pmv_diff < PMV_DIFF_THRESHOLD && pmv_diff > (-1 * PMV_DIFF_THRESHOLD));
                if (item.speed > item.max_speed) {
                    if (item.pmv_avg > -0.5) {
                        item.set_speed(item.max_speed);
                        printf("control fan: %d%\n", item.speed);
                    }
                    else {
                        item.set_speed(0);
                        printf("control fan: %d%\n", item.speed);
                    }
                    std::vector<int> send_fan_data = {0, item.fan_id, (int)item.speed};
                    send_data(socket,  send_fan_data);
                }
            } else if (item.pmv_avg >= 0.5) {
                item.set_speed(item.max_speed);
                printf("control fan: %d%\n", item.speed);
                std::vector<int> send_fan_data = {0, item.fan_id, (int)item.speed};
                send_data(socket,  send_fan_data);
            } else {
                item.set_speed(0);
                printf("control fan: %d%\n", item.speed);
                std::vector<int> send_fan_data = {0, item.fan_id, (int)item.speed};
                send_data(socket,  send_fan_data);
            }
        });
    }
    // wait for all threads complete
    for (auto& thread : control_fan_thread) {
        thread.join();
    }
    printf("thread done\n");
}

void send_data(zmq::socket_t &socket, const std::vector<int>& data) {
    // Tạo một socket kiểu PUSH
    // zmq::socket_t socket(context, ZMQ_PUSH);
    // socket.bind("tcp://*:5432");

    // Chuẩn bị dữ liệu dưới dạng chuỗi phân cách bởi dấu phẩy
    std::ostringstream oss;
    for (size_t i = 0; i < data.size(); ++i) {
        oss << data[i];
        if (i != data.size() - 1) {
            oss << ",";
        }
    }
    std::string data_str = oss.str();

    // Tạo một ZeroMQ message và gửi nó
    zmq::message_t message(data_str.size());
    memcpy(message.data(), data_str.data(), data_str.size());
    socket.send(message, zmq::send_flags::none);
}