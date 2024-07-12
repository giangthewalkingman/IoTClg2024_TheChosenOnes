#include "database_access.h"

MYSQL *con;

void finish_with_error(MYSQL *con) {
    fprintf(stderr, "%s\n", mysql_error(con));
    mysql_close(con); 
    exit(1);     
}

MYSQL* mysql_connection_setup(struct connection_details mysql_details) {
    MYSQL *connection = mysql_init(NULL);

    if (!mysql_real_connect(connection, mysql_details.server, mysql_details.user, mysql_details.password, mysql_details.database, 0, NULL, 0)) {
        std::cout << "Connection Error: " << mysql_error(connection) << std::endl;
        exit(1);
    }

    return connection;
}

MYSQL_RES* mysql_execute_query(MYSQL *connection, const char *sql_query) {
    if (mysql_query(connection, sql_query)) {
        std::cout << "MySQL Query Error: " << mysql_error(connection) << std::endl;
        exit(1);
    }

    return mysql_use_result(connection);
}

bool check_sensor_id_exists(MYSQL *connection, int sensor_id) {
    char query[256];
    snprintf(query, sizeof(query), "SELECT id FROM RegistrationSensor WHERE id = %d;", sensor_id);

    if (mysql_query(connection, query)) {
        std::cout << "MySQL Query Error: " << mysql_error(connection) << std::endl;
        exit(1);
    }

    MYSQL_RES *res = mysql_store_result(connection);
    bool exists = mysql_num_rows(res) > 0;
    mysql_free_result(res);

    return exists;
}

DatabaseAccess::DatabaseAccess() {
    struct connection_details mysqlD;
    mysqlD.server = "localhost";
    mysqlD.user = "giang_mariadb";
    mysqlD.password = "k";
    mysqlD.database = "iot_clg_db";

    con = mysql_connection_setup(mysqlD);
}

DatabaseAccess::~DatabaseAccess() {
    mysql_close(con);
}

void DatabaseAccess::getSensorNodeData(double &temp, double &humid, double &wind, int &pm25, int &time, int sensor_id) {
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
}

void DatabaseAccess::getEnergyMeasureData(double &voltage, double &current, int &frequency, double &active_power, double &power_factor, int &time, int em_id) {
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
}

void DatabaseAccess::getFanData(double &set_speed, int &control_mode, int &set_time, int &time, int fan_id) {
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
}

void DatabaseAccess::getAirConditionerData(double &set_temp, bool &state, bool &control_mode, int &time, int ac_id) {
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
}

void DatabaseAccess::getPMVData(double &met, double &clo, double &pmvref, double &outdoor_temp) {
    if (mysql_query(con, "SELECT met, clo, pmvref FROM PMVtable")) {
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
}

ThingsIds DatabaseAccess::getThingsIds(MYSQL *conn) {
    MYSQL_RES *res;
    MYSQL_ROW row;
    ThingsIds thingsIds;

    conn = mysql_init(NULL);

    // Query to get sensor IDs
    if (mysql_query(conn, "SELECT id FROM RegistrationSensor")) {
        std::cerr << "SELECT id FROM RegistrationSensor failed. " << mysql_error(conn) << "\n";
        exit(EXIT_FAILURE);
    }

    res = mysql_store_result(conn);
    if (res == NULL) {
        std::cerr << "mysql_store_result() failed. " << mysql_error(conn) << "\n";
        exit(EXIT_FAILURE);
    }

    while ((row = mysql_fetch_row(res)) != NULL) {
        thingsIds.sensor_ids.push_back(std::stoi(row[0]));
    }
    mysql_free_result(res);

    // Query to get fan IDs
    if (mysql_query(conn, "SELECT id FROM RegistrationFan")) {
        std::cerr << "SELECT id FROM RegistrationFan failed. " << mysql_error(conn) << "\n";
        mysql_close(conn);
        exit(EXIT_FAILURE);
    }

    res = mysql_store_result(conn);
    if (res == NULL) {
        std::cerr << "mysql_store_result() failed. " << mysql_error(conn) << "\n";
        mysql_close(conn);
        exit(EXIT_FAILURE);
    }

    while ((row = mysql_fetch_row(res)) != NULL) {
        thingsIds.fan_ids.push_back(std::stoi(row[0]));
    }
    mysql_free_result(res);

    // Query to get AC IDs
    if (mysql_query(conn, "SELECT id FROM RegistrationAC")) {
        std::cerr << "SELECT id FROM RegistrationAC failed. " << mysql_error(conn) << "\n";
        exit(EXIT_FAILURE);
    }

    res = mysql_store_result(conn);
    if (res == NULL) {
        std::cerr << "mysql_store_result() failed. " << mysql_error(conn) << "\n";
        exit(EXIT_FAILURE);
    }

    while ((row = mysql_fetch_row(res)) != NULL) {
        thingsIds.ac_ids.push_back(std::stoi(row[0]));
    }
    mysql_free_result(res);

    // Close the connection
    mysql_close(conn);

    return thingsIds;
}
