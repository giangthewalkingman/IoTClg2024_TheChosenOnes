#include "database_access.h"

MYSQL *con;

void finish_with_error(MYSQL *connection) {
    fprintf(stderr, "%s\n", mysql_error(connection));
    mysql_close(con); 
    // exit(1);     
}

MYSQL* mysql_connection_setup(struct connection_details mysql_details) {
    MYSQL *connection = mysql_init(NULL);

    if (!mysql_real_connect(connection, mysql_details.server, mysql_details.user, mysql_details.password, mysql_details.database, 0, NULL, 0)) {
        std::cout << "Connection Error: " << mysql_error(connection) << std::endl;
        // exit(1);
    } else {
        std::cout << "Connection Success\n";
    }

    return connection;
}

MYSQL_RES* mysql_execute_query(MYSQL *connection, const char *sql_query) {
    if (mysql_query(connection, sql_query)) {
        std::cout << "MySQL Query Error: " << mysql_error(connection) << std::endl;
        // exit(1);
    }

    return mysql_use_result(connection);
}

bool check_sensor_id_exists(MYSQL *connection, int sensor_id) {
    char query[256];
    snprintf(query, sizeof(query), "SELECT id FROM RegistrationSensor WHERE id = %d;", sensor_id);

    if (mysql_query(connection, query)) {
        std::cout << "MySQL Query Error: " << mysql_error(connection) << std::endl;
        // exit(1);
    }

    MYSQL_RES *res = mysql_store_result(connection);
    bool exists = mysql_num_rows(res) > 0;
    mysql_free_result(res);

    return exists;
}

DatabaseAccess::DatabaseAccess() {
    mysqlD.server = "localhost";
    mysqlD.user = "giang_mariadb";
    mysqlD.password = "k";
    mysqlD.database = "iot_clg_db";

    // con = mysql_connection_setup(mysqlD);
}

DatabaseAccess::~DatabaseAccess() {
    // mysql_close(con);
}

void DatabaseAccess::getSensorNodeData(double &temp, double &humid, double &wind, double &pm25, int &time, int sensor_id) {
    std::ostringstream query;
    con = mysql_connection_setup(mysqlD);
    if (con == NULL) {
        return;
    }
    
    query << "SELECT temp, humid, wind, pm25, time FROM SensorNode WHERE sensor_id = " << sensor_id;

    if (mysql_query(con, query.str().c_str())) {
        finish_with_error(con);
    }

    MYSQL_RES *result = mysql_store_result(con);

    if (result == NULL) {
        finish_with_error(con);
    }

    MYSQL_ROW row;
    if ((row = mysql_fetch_row(result))) {
        temp = atof(row[0]);
        humid = atof(row[1]);
        wind = atof(row[2]);
        pm25 = atoi(row[3]);
        time = atoi(row[4]);
    } else {
        std::cerr << "No data found for sensor_id: " << sensor_id << std::endl;
    }

    mysql_free_result(result);
    mysql_close(con);
}

void DatabaseAccess::getEnergyMeasureData(double &voltage, double &current, int &frequency, double &active_power, double &power_factor, int &time, int em_id) {
    con = mysql_connection_setup(mysqlD);
    if (con == NULL) {
        return;
    }
    std::ostringstream query;
    query << "SELECT voltage, current, frequency, active_power, power_factor, time FROM EnergyMeasure WHERE em_id = " << em_id;

    if (mysql_query(con, query.str().c_str())) {
        finish_with_error(con);
    }

    MYSQL_RES *result = mysql_store_result(con);

    if (result == NULL) {
        finish_with_error(con);
    }

    MYSQL_ROW row;
    if ((row = mysql_fetch_row(result))) {
        voltage = atof(row[0]);
        current = atof(row[1]);
        frequency = atoi(row[2]);
        active_power = atof(row[3]);
        power_factor = atof(row[4]);
        time = atoi(row[5]);
    } else {
        std::cerr << "No data found for em_id: " << em_id << std::endl;
    }

    mysql_free_result(result);
    mysql_close(con);
}

void DatabaseAccess::getFanData(double &set_speed, int &control_mode, int &set_time, int &time, int fan_id) {
    
    con = mysql_connection_setup(mysqlD);
    if (con == NULL) {
        return;
    }
    std::ostringstream query;
    query << "SELECT set_speed, control_mode, set_time, time FROM Fan WHERE fan_id = " << fan_id;

    if (mysql_query(con, query.str().c_str())) {
        finish_with_error(con);
    }

    MYSQL_RES *result = mysql_store_result(con);

    if (result == NULL) {
        finish_with_error(con);
    }

    MYSQL_ROW row;
    if ((row = mysql_fetch_row(result))) {
        set_speed = atof(row[0]);
        control_mode = atoi(row[1]);
        set_time = atoi(row[2]);
        time = atoi(row[3]);
    } else {
        std::cerr << "No data found for fan_id: " << fan_id << std::endl;
    }

    mysql_free_result(result);
    mysql_close(con);
}

void DatabaseAccess::getAirConditionerData(double &set_temp, bool &state, bool &control_mode, int &time, int ac_id) {
    
    con = mysql_connection_setup(mysqlD);
    if (con == NULL) {
        return;
    }
    std::ostringstream query;
    query << "SELECT set_temp, state, control_mode, time FROM AirConditioner WHERE ac_id = " << ac_id;

    if (mysql_query(con, query.str().c_str())) {
        finish_with_error(con);
    }

    MYSQL_RES *result = mysql_store_result(con);

    if (result == NULL) {
        finish_with_error(con);
    }

    MYSQL_ROW row;
    if ((row = mysql_fetch_row(result))) {
        set_temp = atof(row[0]);
        state = static_cast<bool>(atoi(row[1]));
        control_mode = static_cast<bool>(atoi(row[2]));
        time = atoi(row[3]);
    } else {
        std::cerr << "No data found for ac_id: " << ac_id << std::endl;
    }

    mysql_free_result(result);
    mysql_close(con);
}

void DatabaseAccess::getPMVData(double &met, double &clo, double &pmvref, double &outdoor_temp) {
    con = mysql_connection_setup(mysqlD);
    if (con == NULL) {
        return;
    }
    std::cout << "hlw\n"; 
    if (mysql_query(con, "SELECT met, clo, pmvref FROM PMVtable")) {
        std::cout << "Query is unsuccessful\n"; 
        finish_with_error(con);
    }

    MYSQL_RES *result = mysql_store_result(con);

    if (result == NULL) {
        finish_with_error(con);
    }

    MYSQL_ROW row = mysql_fetch_row(result);
    if (row != NULL) {
        met = atof(row[0]);
        clo = atoi(row[1]);
        pmvref = atoi(row[2]);
        outdoor_temp = atoi(row[3]);
    } else {
        // Handle no rows found, if necessary
    }

    mysql_free_result(result);
    mysql_close(con);
}

// ThingsIds DatabaseAccess::getThingsIds(MYSQL *connection) {
//     MYSQL_RES *res;
//     MYSQL_ROW row;
//     ThingsIds thingsIds;
//     // Query to get sensor IDs
//     if (mysql_query(connection, "SELECT id FROM RegistrationSensor")) {
//         std::cerr << "SELECT id FROM RegistrationSensor failed. " << mysql_error(connection) << "\n";
//         // exit(EXIT_FAILURE);
//     }

//     res = mysql_store_result(connection);
//     if (res == NULL) {
//         std::cerr << "mysql_store_result() failed. " << mysql_error(connection) << "\n";
//         // exit(EXIT_FAILURE);
//     }

//     while ((row = mysql_fetch_row(res)) != NULL) {
//         thingsIds.sensor_ids.push_back(std::stoi(row[0]));
//     }
//     mysql_free_result(res);

//     // Query to get fan IDs
//     if (mysql_query(connection, "SELECT id FROM RegistrationFan")) {
//         std::cerr << "SELECT id FROM RegistrationFan failed. " << mysql_error(connection) << "\n";
//         mysql_close(connection);
//         // exit(EXIT_FAILURE);
//     }

//     res = mysql_store_result(connection);
//     if (res == NULL) {
//         std::cerr << "mysql_store_result() failed. " << mysql_error(connection) << "\n";
//         mysql_close(connection);
//         // exit(EXIT_FAILURE);
//     }

//     while ((row = mysql_fetch_row(res)) != NULL) {
//         thingsIds.fan_ids.push_back(std::stoi(row[0]));
//     }
//     mysql_free_result(res);

//     // Query to get AC IDs
//     if (mysql_query(connection, "SELECT id FROM RegistrationAC")) {
//         std::cerr << "SELECT id FROM RegistrationAC failed. " << mysql_error(connection) << "\n";
//         // exit(EXIT_FAILURE);
//     }

//     res = mysql_store_result(connection);
//     if (res == NULL) {
//         std::cerr << "mysql_store_result() failed. " << mysql_error(connection) << "\n";
//         // exit(EXIT_FAILURE);
//     }

//     while ((row = mysql_fetch_row(res)) != NULL) {
//         thingsIds.ac_ids.push_back(std::stoi(row[0]));
//     }
//     mysql_free_result(res);

//     // Close the connection
//     mysql_close(connection);

//     return thingsIds;
// }


ThingsIds DatabaseAccess::getThingsIds(MYSQL *connection) {
    con = mysql_connection_setup(mysqlD);
    if (con == NULL) {
        return ThingsIds();
    }
    std::cout << "alo\n";

    MYSQL_RES *res;
    MYSQL_ROW row;
    ThingsIds thingsIds;

    // Query to get sensor IDs
    if (mysql_query(con, "SELECT id FROM RegistrationSensor")) {
        std::cerr << "SELECT id FROM RegistrationSensor failed: " << mysql_error(con) << std::endl;
        mysql_close(con);
        return thingsIds;
    }

    res = mysql_store_result(con);
    if (res == NULL) {
        std::cerr << "mysql_store_result() failed: " << mysql_error(con) << std::endl;
        mysql_close(con);
        return thingsIds;
    }

    while ((row = mysql_fetch_row(res)) != NULL) {
        thingsIds.sensor_ids.push_back(std::stoi(row[0]));
    }
    mysql_free_result(res);

    // Query to get fan IDs
    if (mysql_query(con, "SELECT id FROM RegistrationFan")) {
        std::cerr << "SELECT id FROM RegistrationFan failed: " << mysql_error(con) << std::endl;
        mysql_close(con);
        return thingsIds;
    }

    res = mysql_store_result(con);
    if (res == NULL) {
        std::cerr << "mysql_store_result() failed: " << mysql_error(con) << std::endl;
        mysql_close(con);
        return thingsIds;
    }

    while ((row = mysql_fetch_row(res)) != NULL) {
        thingsIds.fan_ids.push_back(std::stoi(row[0]));
    }
    mysql_free_result(res);

    // Query to get AC IDs
    if (mysql_query(con, "SELECT id FROM RegistrationAC")) {
        std::cerr << "SELECT id FROM RegistrationAC failed: " << mysql_error(con) << std::endl;
        mysql_close(con);
        return thingsIds;
    }

    res = mysql_store_result(con);
    if (res == NULL) {
        std::cerr << "mysql_store_result() failed: " << mysql_error(con) << std::endl;
        mysql_close(con);
        return thingsIds;
    }

    while ((row = mysql_fetch_row(res)) != NULL) {
        thingsIds.ac_ids.push_back(std::stoi(row[0]));
    }
    mysql_free_result(res);

    // Debug output
    std::cout << "Sensor IDs: ";
    for (const auto& id : thingsIds.sensor_ids) {
        std::cout << id << " ";
    }
    std::cout << std::endl;

    std::cout << "Fan IDs: ";
    for (const auto& id : thingsIds.fan_ids) {
        std::cout << id << " ";
    }
    std::cout << std::endl;

    std::cout << "AC IDs: ";
    for (const auto& id : thingsIds.ac_ids) {
        std::cout << id << " ";
    }
    std::cout << std::endl;

    mysql_close(con);

    return thingsIds;
}

void DatabaseAccess::getFanSensorLinks(int fan_id, std::vector<int>& sensor_links) {
    con = mysql_connection_setup(mysqlD);
    if (con == NULL) {
        return;
    }

    std::ostringstream query;
    query << "SELECT sensor_links FROM RegistrationFan WHERE id = " << fan_id;

    if (mysql_query(con, query.str().c_str())) {
        finish_with_error(con);
        return;
    }

    MYSQL_RES *result = mysql_store_result(con);
    if (result == NULL) {
        finish_with_error(con);
        return;
    }

    MYSQL_ROW row;
    if ((row = mysql_fetch_row(result))) {
        std::string links_str(row[0]);
        parseSensorLinks(links_str, sensor_links);
    } else {
        std::cerr << "No data found for fan_id: " << fan_id << std::endl;
    }

    mysql_free_result(result);
    mysql_close(con);
}

void DatabaseAccess::getACSensorLinks(int ac_id, std::vector<int>& sensor_links) {
    con = mysql_connection_setup(mysqlD);
    if (con == NULL) {
        return;
    }

    std::ostringstream query;
    query << "SELECT sensor_links FROM RegistrationAC WHERE id = " << ac_id;

    if (mysql_query(con, query.str().c_str())) {
        finish_with_error(con);
        return;
    }

    MYSQL_RES *result = mysql_store_result(con);
    if (result == NULL) {
        finish_with_error(con);
        return;
    }

    MYSQL_ROW row;
    if ((row = mysql_fetch_row(result))) {
        std::string links_str(row[0]);
        parseSensorLinks(links_str, sensor_links);
    } else {
        std::cerr << "No data found for ac_id: " << ac_id << std::endl;
    }

    mysql_free_result(result);
    mysql_close(con);
}

void DatabaseAccess::parseSensorLinks(const std::string& links_str, std::vector<int>& sensor_links) {
    std::stringstream ss(links_str.substr(1, links_str.size() - 2)); // Remove '[' and ']'
    std::string item;
    while (std::getline(ss, item, ',')) {
        sensor_links.push_back(std::stoi(item));
    }
}

void DatabaseAccess::databaseInsertSample() {
    // Insert sample data into PMVtable
    con = mysql_connection_setup(mysqlD);
    if (con == NULL) {
        return;
    }
    
    const char* pmv_query = "INSERT INTO PMVtable (met, clo, pmvref, outdoor_temp) VALUES "
                            "(1.2, 0.5, 0.5, 25.0), "
                            "(1.5, 0.7, 0.6, 30.0)";
    mysql_execute_query(con, pmv_query);

    // Insert sample data into RegistrationSensor
    const char* reg_sensor_query = "INSERT INTO RegistrationSensor (id) VALUES (0), (1)";
    mysql_execute_query(con, reg_sensor_query);

    // Insert sample data into SensorNode
    const char* sensor_node_query = "INSERT INTO SensorNode (temp, humid, wind, pm25, time, sensor_id) VALUES "
                                    "(24.5, 60.0, 1.5, 35, 1622559182, 0), "
                                    "(25.5, 55.0, 1.0, 30, 1622559182, 1)";
    mysql_execute_query(con, sensor_node_query);

    // Insert sample data into RegistrationEnergy
    const char* reg_energy_query = "INSERT INTO RegistrationEnergy (id) VALUES (0)";
    mysql_execute_query(con, reg_energy_query);

    // Insert sample data into EnergyMeasure
    const char* energy_measure_query = "INSERT INTO EnergyMeasure (voltage, current, frequency, active_power, power_factor, time, em_id) VALUES "
                                       "(230.0, 5.0, 50, 1150.0, 0.98, 1622559182, 0)";
    mysql_execute_query(con, energy_measure_query);

    // Insert sample data into RegistrationFan
    const char* reg_fan_query = "INSERT INTO RegistrationFan (id, sensor_links, model) VALUES "
                                "(0, '[0]', 'Model A'), "
                                "(1, '[1]', 'Model B')";
    mysql_execute_query(con, reg_fan_query);

    // Insert sample data into Fan
    const char* fan_query = "INSERT INTO Fan (set_speed, control_mode, set_time, time, fan_id) VALUES "
                            "(2.5, 1, 3600, 1622559182, 0), "
                            "(3.0, 1, 3600, 1622559182, 1)";
    mysql_execute_query(con, fan_query);

    // Insert sample data into RegistrationAC
    const char* reg_ac_query = "INSERT INTO RegistrationAC (id, sensor_links, model) VALUES "
                               "(0, '[0,1]', 'AC Model 1')";
    mysql_execute_query(con, reg_ac_query);

    // Insert sample data into AirConditioner
    const char* ac_query = "INSERT INTO AirConditioner (set_temp, state, control_mode, time, ac_id) VALUES "
                           "(22.0, true, false, 1622559182, 0)";
    mysql_execute_query(con, ac_query);
    mysql_close(con);
}