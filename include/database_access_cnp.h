#ifndef DATABASE_ACCESS_CNP_H
#define DATABASE_ACCESS_CNP_H

#include <mariadb/mysql.h>
#include <vector>
#include <string>
#include <sstream>
#include <iostream>
#include "connection_pool.h"

struct connection_details_cnp {
    const char* server;
    const char* user;
    const char* password;
    const char* database;
};

extern MYSQL *con;
void finish_with_error(MYSQL *con);
MYSQL* mysql_connection_setup(struct connection_details_cnp mysql_details);
MYSQL_RES* mysql_execute_query(MYSQL *connection, const char *sql_query);
bool check_sensor_id_exists(MYSQL *connection, int sensor_id);

struct ThingsIdsCnp {
    std::vector<int> sensor_ids;
    std::vector<int> fan_ids;
    std::vector<int> ac_ids;

    bool operator!=(const ThingsIdsCnp& other) const {
        return sensor_ids != other.sensor_ids || fan_ids != other.fan_ids || ac_ids != other.ac_ids;
    }
};

class DatabaseAccessCnp {
public:
    DatabaseAccessCnp(ConnectionPool& pool);
    ~DatabaseAccessCnp();

    void getSensorNodeData(double &temp, double &humid, double &wind, double &pm25, int &time, int sensor_id);
    void getEnergyMeasureData(double &voltage, double &current, int &frequency, double &active_power, double &power_factor, int &time, int em_id);
    void getFanData(double &set_speed, int &control_mode, int &set_time, int &time, int fan_id);
    void getAirConditionerData(double &set_temp, bool &state, bool &control_mode, int &time, int ac_id);
    void getPMVData(double &met, double &clo, double &pmvref, double &outdoor_temp);
    void getFanSensorLinks(int fan_id, std::vector<int>& sensor_links);
    void getACSensorLinks(int ac_id, std::vector<int>& sensor_links);
    void databaseInsertSample();
    ThingsIdsCnp getThingsIds();

private:
    ConnectionPool& connectionPool;
    void finish_with_error(MYSQL *connection);
    void parseSensorLinks(const std::string& links_str, std::vector<int>& sensor_links);
};



#endif // DATABASE_ACCESS_CNP_H
