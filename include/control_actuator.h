#ifndef CONTROL_ACTUATOR_H
#define CONTROL_ACTUATOR_H

#include <iostream>
#include <vector>
#include <thread>
#include <cmath>
#include <limits>
#include <algorithm>

#define DELTA_TEMP 3
#define AC_TURN_ON_TIME_REF 900
#define MAXIMUM_TEMP_FOR_INFINITE_PERIOD 29
#define SPEED_STEP 2
#define PMV_DIFF_THRESHOLD 0.02

void pmv_ppd(
    const double& ta,
    const double& v,
    const double& rh,
    const double& met,
    const double& clo,
    double& pmv
);

class PMV_Data {
    public:
        PMV_Data(int sensor_id_, double temp_, double humid_, double wind_);
        int sensor_id;
        double temp;
        double humid;
        double wind;
        double pmv;
        double wind_max;

        void get_data(int id);
        void send_data(double met, double clo, double pmv_ref);
        void get_max_air_speed(int id);
        void cal_pmv(int id);
};

class FanNode {
    private:
        std::vector<int> fan_sensorlinks;
        int control_mode;
        int period;
    public:
        int fan_id;
        int speed;
        double pmv_avg;
        double max_speed;

        void cal_pmv_avg(std::vector<PMV_Data>& sensor_env_list);
        void get_sensor_link(std::vector<int> sensorlinks);
        void set_speed(int s);
        void set_control_mode(int i);
        void set_time(int second);
        void control_fan_pmv_model(std::vector<PMV_Data>& sensor_env_list, double& pmv_ref);
};

class ACNode {
    private:
        std::vector<int> ac_sensorlinks;
        int control_mode;
        int period;
    public:
        int ac_temp;
        int ac_id;
        bool state;
        double pmv_avg;

        void cal_pmv_avg(std::vector<PMV_Data>& sensor_env_list);
        void get_sensor_link(std::vector<int> sensorlinks);
        void set_temp(int t);
        void set_control_mode(int value);
        void set_state(bool s);
        void set_time(int value);
};

// void get_room_infomation(double& met, double& clo, double& pmv_ref, double& outdoor_temp);

#endif // CONTROL_ACTUATOR_H
