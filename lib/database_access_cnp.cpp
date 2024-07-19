#include "database_access_cnp.h"

void DatabaseAccessCnp::finish_with_error(MYSQL *connection) {
    fprintf(stderr, "%s\n", mysql_error(connection));
    mysql_close(connection); 
}

DatabaseAccessCnp::DatabaseAccessCnp(ConnectionPool& pool) : connectionPool(pool) {}

DatabaseAccessCnp::~DatabaseAccessCnp() {}

void DatabaseAccessCnp::getSensorNodeData(double &temp, double &humid, double &wind, double &pm25, int &time, int sensor_id) {
    MYSQL* con = connectionPool.getConnection();
    if (con == NULL) {
        return;
    }

    std::ostringstream query;
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
    connectionPool.releaseConnection(con);
}

void DatabaseAccessCnp::getEnergyMeasureData(double &voltage, double &current, int &frequency, double &active_power, double &power_factor, int &time, int em_id) {
    MYSQL* con = connectionPool.getConnection();
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
    connectionPool.releaseConnection(con);
}

void DatabaseAccessCnp::getFanData(double &set_speed, int &control_mode, int &set_time, int &time, int fan_id) {
    MYSQL* con = connectionPool.getConnection();
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
    connectionPool.releaseConnection(con);
}

void DatabaseAccessCnp::getAirConditionerData(double &set_temp, bool &state, bool &control_mode, int &time, int ac_id) {
    MYSQL* con = connectionPool.getConnection();
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
    connectionPool.releaseConnection(con);
}

void DatabaseAccessCnp::getPMVData(double &met, double &clo, double &pmvref, double &outdoor_temp) {
    MYSQL* con = connectionPool.getConnection();
    if (con == NULL) {
        return;
    }

    if (mysql_query(con, "SELECT met, clo, pmvref, outdoor_temp FROM PMVtable")) {
        finish_with_error(con);
    }

    MYSQL_RES *result = mysql_store_result(con);

    if (result == NULL) {
        finish_with_error(con);
    }

    MYSQL_ROW row = mysql_fetch_row(result);
    if (row != NULL) {
        met = atof(row[0]);
        clo = atof(row[1]);
        pmvref = atof(row[2]);
        outdoor_temp = atof(row[3]);
    }

    mysql_free_result(result);
    connectionPool.releaseConnection(con);
}

ThingsIdsCnp DatabaseAccessCnp::getThingsIds() {
    MYSQL* con = connectionPool.getConnection();
    if (con == NULL) {
        return ThingsIdsCnp();
    }

    ThingsIdsCnp thingsIds;
    MYSQL_RES *res;
    MYSQL_ROW row;

    if (mysql_query(con, "SELECT id FROM RegistrationSensor")) {
        finish_with_error(con);
        return thingsIds;
    }

    res = mysql_store_result(con);
    if (res == NULL) {
        finish_with_error(con);
        return thingsIds;
    }

    while ((row = mysql_fetch_row(res)) != NULL) {
        thingsIds.sensor_ids.push_back(std::stoi(row[0]));
    }
    mysql_free_result(res);

    if (mysql_query(con, "SELECT id FROM RegistrationFan")) {
        finish_with_error(con);
        return thingsIds;
    }

    res = mysql_store_result(con);
    if (res == NULL) {
        finish_with_error(con);
        return thingsIds;
    }

    while ((row = mysql_fetch_row(res)) != NULL) {
        thingsIds.fan_ids.push_back(std::stoi(row[0]));
    }
    mysql_free_result(res);

    if (mysql_query(con, "SELECT id FROM RegistrationAC")) {
        finish_with_error(con);
        return thingsIds;
    }

    res = mysql_store_result(con);
    if (res == NULL) {
        finish_with_error(con);
        return thingsIds;
    }

    while ((row = mysql_fetch_row(res)) != NULL) {
        thingsIds.ac_ids.push_back(std::stoi(row[0]));
    }
    mysql_free_result(res);

    connectionPool.releaseConnection(con);
    return thingsIds;
}

void DatabaseAccessCnp::getFanSensorLinks(int fan_id, std::vector<int>& sensor_links) {
    MYSQL* con = connectionPool.getConnection();
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
    connectionPool.releaseConnection(con);
}

void DatabaseAccessCnp::getACSensorLinks(int ac_id, std::vector<int>& sensor_links) {
    MYSQL* con = connectionPool.getConnection();
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
    connectionPool.releaseConnection(con);
}

void DatabaseAccessCnp::parseSensorLinks(const std::string& links_str, std::vector<int>& sensor_links) {
    std::stringstream ss(links_str.substr(1, links_str.size() - 2)); // Remove '[' and ']'
    std::string item;
    while (std::getline(ss, item, ',')) {
        sensor_links.push_back(std::stoi(item));
    }
}

void DatabaseAccessCnp::databaseInsertSample() {
    MYSQL* con = connectionPool.getConnection();
    if (con == NULL) {
        return;
    }

    const char* pmv_query = "INSERT INTO PMVtable (met, clo, pmvref, outdoor_temp) VALUES "
                            "(1.2, 0.5, 0.5, 25.0), "
                            "(1.5, 0.7, 0.6, 30.0)";
    mysql_execute_query(con, pmv_query);

    const char* reg_sensor_query = "INSERT INTO RegistrationSensor (id) VALUES (0), (1)";
    mysql_execute_query(con, reg_sensor_query);

    const char* sensor_node_query = "INSERT INTO SensorNode (temp, humid, wind, pm25, time, sensor_id) VALUES "
                                    "(24.5, 60.0, 1.5, 35, 1622559182, 0), "
                                    "(25.5, 55.0, 1.0, 30, 1622559182, 1)";
    mysql_execute_query(con, sensor_node_query);

    const char* reg_energy_query = "INSERT INTO RegistrationEnergy (id) VALUES (0)";
    mysql_execute_query(con, reg_energy_query);

    const char* energy_measure_query = "INSERT INTO EnergyMeasure (voltage, current, frequency, active_power, power_factor, time, em_id) VALUES "
                                       "(230.0, 5.0, 50, 1150.0, 0.98, 1622559182, 0)";
    mysql_execute_query(con, energy_measure_query);

    const char* reg_fan_query = "INSERT INTO RegistrationFan (id, sensor_links, model) VALUES "
                                "(0, '[0]', 'Model A'), "
                                "(1, '[1]', 'Model B')";
    mysql_execute_query(con, reg_fan_query);

    const char* fan_query = "INSERT INTO Fan (set_speed, control_mode, set_time, time, fan_id) VALUES "
                            "(2.5, 1, 3600, 1622559182, 0), "
                            "(3.0, 1, 3600, 1622559182, 1)";
    mysql_execute_query(con, fan_query);

    const char* reg_ac_query = "INSERT INTO RegistrationAC (id, sensor_links, model) VALUES "
                               "(0, '[0,1]', 'AC Model 1')";
    mysql_execute_query(con, reg_ac_query);

    const char* ac_query = "INSERT INTO AirConditioner (set_temp, state, control_mode, time, ac_id) VALUES "
                           "(22.0, true, false, 1622559182, 0)";
    mysql_execute_query(con, ac_query);

    connectionPool.releaseConnection(con);
}
