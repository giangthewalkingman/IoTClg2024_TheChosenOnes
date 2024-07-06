#include <iostream>
#include <vector>
#include <thread>
#include <cmath>
#include <algorithm>
#define DELTA_TEMP 3
#define AC_TURN_ON_TIME_REF 900
#define MAXIMUM_TEMP_FOR_INFINITE_PERIOD 29
#define SPEED_STEP 2
#define PMV_DIFF_THRESHOLD 0.02

// function to calculate the Standard Effective Temperature (SET)
double SET(double ta, double rh, double tr, double va, double clo, double met) {
    // for the actual SET calculation
    return ta + rh + tr + va + clo + met;
}

// function to calculate the Predicted Mean Vote (PMV)
double PMV(double ta, double tr, double va, double clo, double met) {
    // for the actual PMV calculation
    return ta + tr + va + clo + met;
}

// function to estimate the adjusted PMV value
double AdjustedPMV(double ta, double rh, double tr, double velev, double clo, double met) {
    const double vstill = 0.15;
    const double tstep = 0.1;
    const double epsilon = 0.001;
    const int kmax = 100;

    double SETref = SET(ta, rh, tr, velev, clo, met);
    double SETdiff;
    int k = 0;

    do {
        ta -= tstep;
        tr -= tstep;
        double SETcurrent = SET(ta, rh, tr, vstill, clo, met);
        SETdiff = SETcurrent - SETref;
        k++;
    } while (k < kmax && SETdiff > epsilon);

    double taadj = ta;
    double tradj = tr;
    double PMVadj = PMV(taadj, tradj, vstill, clo, met);

    return PMVadj;
}


class PMV_Data {
    public:
        PMV_Data(int sensor_id_, float temp_, float humid_, float wind_);
        int sensor_id;
        float temp;
        float humid;
        float wind;
        float pmv;
        float wind_max;
        // function to get data from database 
        void get_data(int id) {
            // instuction here

        };
        // function to send data after execute algorithm
        void send_data(float met, float clo, float pmv_ref) {
            // instruction here
        };
        void get_max_air_speed (int id) {
            if (temp >= 25.5)
                wind_max = 1.2;
            else if (temp <= 22.5)
                wind_max = 0.15;
            else {
                wind_max = 50.49 - 4.4047*temp + 0.096425*temp*temp;
            }
        }
        void cal_pmv (int id) {
            // pmv calculation instruction here
        }
};

PMV_Data::PMV_Data(int sensor_id_, float temp_, float humid_, float wind_) {
        sensor_id = sensor_id_;
        temp = temp_;
        humid = humid_;
        wind = wind_;
}

class FanNode {
    private:
        int *sensor_link;
        int control_mode;
        int period;
    public:
        int fan_id;
        int speed;
        float pmv_avg;
        float max_speed;
        void cal_pmv_avg (std::vector<PMV_Data>& sensor_env_list) {
            float pmv_sum = 0;
            for (int i = 0; i < sizeof(sensor_link); i++) {
                for (auto& item : sensor_env_list) {
                    if (item.sensor_id == sensor_link[i]) {
                        item.get_data(i);
                        item.cal_pmv(i);
                        pmv_sum += item.pmv;
                        max_speed = item.wind_max;
                    }
                }
            }
            pmv_avg = pmv_sum / sizeof(sensor_link);
        };            
        void get_sensor_link () {};
        void set_speed(float s) {
            speed = s;
            // more instruction here
        }
        void set_control_mode(int i) {
            control_mode = i;
            // more instruction here
        }
        void set_time(int second) {
            period = second;
            // more instruction here
        }
        void control_fan_pmv_model (std::vector<PMV_Data>& sensor_env_list, float& pmv_ref) {
            if (pmv_avg <= 0.5 && pmv_avg >= -0.5) {
                if (speed == 0)
                    set_speed(0);
                float pmv_diff;
                // fan will reduce speed as pmv is convergent to pmv_ref
                do {
                    set_speed(speed - SPEED_STEP);
                    cal_pmv_avg(sensor_env_list);
                    pmv_diff = pmv_avg - pmv_ref;
                }
                while (pmv_diff < PMV_DIFF_THRESHOLD && pmv_diff > (-1 * PMV_DIFF_THRESHOLD));
                if (speed > max_speed) {
                    if (pmv_avg > -0.5)
                        set_speed(max_speed);
                    else
                        set_speed(0);
                }
            }
        }
};

class ACNode {
    private:
        int* sensor_link;
        int control_mode;
        int period;
    public:
        int ac_temp;
        int ac_id;
        bool state;
        float pmv_avg;
        void cal_pmv_avg (std::vector<PMV_Data>& sensor_env_list) {
            float pmv_sum = 0;
            for (int i = 0; i < sizeof(sensor_link); i++) {
                for (auto& item : sensor_env_list) {
                    if (item.sensor_id == sensor_link[i]) {
                        item.get_data(i);
                        item.cal_pmv(i);
                        pmv_sum += item.pmv;
                    }
                }
            }
            pmv_avg = pmv_sum / sizeof(sensor_link);
        };
        void get_sensor_link () {};
        void set_temp(int t) {
            ac_temp = t;
            // more instruction here
        }
        void set_control_mode(int value) {
            control_mode = value;
            // more instruction here
        }
        void set_state(bool s) {
            state = s;
            // more instruction here
        }
        void set_time(int value) {
            period = value;
        }
};

void get_room_infomation(float& met, float& clo, float& pmv_ref, float& outdoor_temp) {
    // instruction here
}

// int main() {
//     std::vector<int> sensor_id = {1,2,3,4}; // get list sensor_id
//     std::vector<int> fan_id = {1,2};
//     std::vector<int> ac_id = {1};
//     std::vector<PMV_Data> sensor_env_list;
//     std::vector<FanNode> fan_node_list;
//     std::vector<ACNode> ac_node_list;

//     PMV_Data pmv_data;
//     FanNode fan_node;
//     ACNode ac_node;

//     // control ACs
//     for (auto & item : ac_node_list) {
//         if (outdoor_temp - item.ac_temp > DELTA_TEMP) {
//             item.set_temp(MAXIMUM_TEMP_FOR_INFINITE_PERIOD);
//             item.set_time(-1);
//             if (item.state == false)
//                 item.set_state(true);
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
//     }

//     // control fans in multithreads
//     std::vector<std::thread> control_fan_thread;
//     for (auto& item : fan_node_list) {
//         control_fan_thread.emplace_back([&item, &pmv_ref, &sensor_env_list]() {
//             item.control_fan_pmv_model(sensor_env_list, pmv_ref);
//         });
//     }
//     // wait for all threads complete
//     for (auto& thread : control_fan_thread) {
//         thread.join();
//     }
// }