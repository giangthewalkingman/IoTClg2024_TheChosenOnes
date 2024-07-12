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
    double& pmv,
    double& ppd
) {
    double vr = (met > 1) ? std::round((v + 0.3 * (met - 1)) * 1000) / 1000.0 : v;
    double clo_d = (met > 1.2) ? std::round(clo * (0.6 + 0.4 / met) * 1000) / 1000.0 : clo;
    double pa = rh * 10 * std::exp(16.6536 - 4030.183 / (ta + 235));
    double icl = 0.155 * clo_d;
    double m = met * 58.15;
    double f_cl = (icl <= 0.078) ? (1 + 1.29 * icl) : (1.05 + 0.645 * icl);
    double hcf = 12.1 * std::sqrt(vr);
    double hc = hcf;
    double taa = ta + 273;
    double t_cla = taa + (35.5 - ta) / (3.5 * icl + 0.1);

    double p1 = icl * f_cl;
    double p2 = p1 * 3.96;
    double p3 = p1 * 100;
    double p4 = p1 * taa;
    double p5 = (308.7 - 0.028 * m) + (p2 * std::pow((taa / 100.0), 4));
    double xn = t_cla / 100;
    double xf = t_cla / 50;
    double eps = 0.00015;

    int n = 0;
    while (std::abs(xn - xf) > eps) {
        xf = (xf + xn) / 2;
        double hcn = 2.38 * std::pow(std::abs(100.0 * xf - taa), 0.25);
        hc = (hcf > hcn) ? hcf : hcn;
        xn = (p5 + p4 * hc - p2 * std::pow(xf, 4)) / (100 + p3 * hc);
        n += 1;
        if (n > 300) throw std::runtime_error("Max iterations exceeded");
    }

    double tcl = 100 * xn - 273;
    double hl1 = 3.05 * 0.001 * (5733 - (6.99 * m) - pa);
    double hl2 = (m > 58.15) ? (0.42 * (m - 58.15)) : 0;
    double hl3 = 1.7 * 0.00001 * m * (5867 - pa);
    double hl4 = 0.0014 * m * (34 - ta);
    double hl5 = 3.96 * f_cl * (std::pow(xn, 4) - std::pow((taa / 100.0), 4));
    double hl6 = f_cl * hc * (tcl - ta);

    double ts = 0.303 * std::exp(-0.036 * m) + 0.028;
    pmv = round(100 * ts * (m - hl1 - hl2 - hl3 - hl4 - hl5 - hl6)) / 100.0;
    ppd = round(10 * (100.0 - 95.0 * std::exp(-0.03353 * std::pow(pmv, 4.0) - 0.2179 * std::pow(pmv, 2.0)))) / 10;
}


class PMV_Data {
    public:
        PMV_Data(int sensor_id_, double temp_, double humid_, double wind_);
        int sensor_id;
        double temp;
        double humid;
        double wind;
        double pmv;
        double wind_max;
        // function to get data from database 
        void get_data(int id) {
            // instuction here

        };
        // function to send data after execute algorithm
        void send_data(double met, double clo, double pmv_ref) {
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

PMV_Data::PMV_Data(int sensor_id_, double temp_, double humid_, double wind_) {
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
        double pmv_avg;
        double max_speed;
        void cal_pmv_avg (std::vector<PMV_Data>& sensor_env_list) {
            double pmv_sum = 0;
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
        void set_speed(double s) {
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
        void control_fan_pmv_model (std::vector<PMV_Data>& sensor_env_list, double& pmv_ref) {
            if (pmv_avg <= 0.5 && pmv_avg >= -0.5) {
                if (speed == 0)
                    set_speed(0);
                double pmv_diff;
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
        double pmv_avg;
        void cal_pmv_avg (std::vector<PMV_Data>& sensor_env_list) {
            double pmv_sum = 0;
            for (int i = 0; i < sizeof(sensor_link); i++) {
                for (auto& item : sensor_env_list) {
                    if (item.sensor_id == sensor_link[i]) {
                        item.get_data(i); // truy van
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

void get_room_infomation(double& met, double& clo, double& pmv_ref, double& outdoor_temp) {
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