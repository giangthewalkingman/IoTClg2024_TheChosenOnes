#include <iostream>
#include <stdlib.h>
#include <mariadb/mysql.h>

struct connection_details {
    const char *server, *user, *password, *database;
};

MYSQL *con;
void finish_with_error(MYSQL *con);
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

class DatabaseAccess {
    public: 
    DatabaseAccess();
    ~DatabaseAccess();
    private:
    void getSensorNodeData(double &temp, double &humid, double &wind, int &pm25, int &time, int &sensor_id);
    void getEnergyMeasureData(double &voltage, double &current, int &frequency, double &active_power, double &power_factor, int &time, int &em_id);
    void getFanData(double &set_speed, int &control_mode, int &set_time, int &time, int &fan_id);
    void getPMVData(double &met, int &clo, int &pmvref);
    void getAirConditionerData(double &set_temp, bool &state, bool &control_mode, int &time, int &ac_id);
    void finishWithError(MYSQL* con);
};

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

void DatabaseAccess::getSensorNodeData(double &temp, double &humid, double &wind, int &pm25, int &time, int &sensor_id) {
    if (mysql_query(con, "SELECT temp, humid, wind, pm25, sensor_id FROM SensorNode")) {
        finish_with_error(con);
    }

    MYSQL_RES *result = mysql_store_result(con);

    if (result == NULL) {
        finish_with_error(con);
    }
    int num_fields = mysql_num_fields(result);
    MYSQL_ROW row;

    while ((row = mysql_fetch_row(result))) {
        temp = atof(row[0]);
        humid = atof(row[1]);
        wind = atof(row[2]);
        pm25 = atoi(row[3]);
        time = atoi(row[4]);
        sensor_id = atoi(row[5]);
    }
}

void DatabaseAccess::getEnergyMeasureData(double &voltage, double &current, int &frequency, double &active_power, double &power_factor, int &time, int &em_id) {
    if (mysql_query(con, "SELECT voltage, current, frequency, active_power, power_factor, time, em_id FROM EnergyMeasure")) {
        finish_with_error(con);
    }

    MYSQL_RES *result = mysql_store_result(con);

    if (result == NULL) {
        finish_with_error(con);
    }

    int num_fields = mysql_num_fields(result);
    MYSQL_ROW row;

    while ((row = mysql_fetch_row(result))) {
        voltage = atof(row[0]);
        current = atof(row[1]);
        frequency = atoi(row[2]);
        active_power = atof(row[3]);
        power_factor = atof(row[4]);
        time = atoi(row[5]);
        em_id = atoi(row[6]);
    }

    mysql_free_result(result);
}


void DatabaseAccess::getFanData(double &set_speed, int &control_mode, int &set_time, int &time, int &fan_id) {
    if (mysql_query(con, "SELECT set_speed, control_mode, set_time, time, fan_id FROM Fan")) {
        finish_with_error(con);
    }

    MYSQL_RES *result = mysql_store_result(con);

    if (result == NULL) {
        finish_with_error(con);
    }

    int num_fields = mysql_num_fields(result);
    MYSQL_ROW row;

    while ((row = mysql_fetch_row(result))) {
        set_speed = atof(row[0]);
        control_mode = atoi(row[1]);
        set_time = atoi(row[2]);
        time = atoi(row[3]);
        fan_id = atoi(row[4]);
    }

    mysql_free_result(result);
}


void DatabaseAccess::getAirConditionerData(double &set_temp, bool &state, bool &control_mode, int &time, int &ac_id) {
    if (mysql_query(con, "SELECT set_temp, state, control_mode, time, ac_id FROM AirConditioner")) {
        finish_with_error(con);
    }

    MYSQL_RES *result = mysql_store_result(con);

    if (result == NULL) {
        finish_with_error(con);
    }

    int num_fields = mysql_num_fields(result);
    MYSQL_ROW row;

    while ((row = mysql_fetch_row(result))) {
        set_temp = atof(row[0]);
        state = atoi(row[1]);
        control_mode = atoi(row[2]);
        time = atoi(row[3]);
        ac_id = atoi(row[4]);
    }

    mysql_free_result(result);
}


void DatabaseAccess::getPMVData(double &met, int &clo, int &pmvref) {
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
    } else {
        // Handle no rows found, if necessary
    }

    mysql_free_result(result);
}



void finish_with_error(MYSQL *con) {
    fprintf(stderr, "%s\n", mysql_error(con));
    mysql_close(con);      
}