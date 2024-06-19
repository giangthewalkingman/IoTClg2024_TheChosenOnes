#include <iostream>
#include <vector>
#include <thread>
#define DELTA_TEMP 3
#define AC_TURN_ON_TIME_REF 900
#define MAXIMUM_TEMP_FOR_INFINITE_PERIOD 29
#define SPEED_STEP 2
#define PMV_DIFF_THRESHOLD 0.02

class PMV_Data {
    public:
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

int main() {
    std::vector<int> sensor_id = {1,2,3,4}; // get list sensor_id
    std::vector<int> fan_id = {1,2};
    std::vector<int> ac_id = {1};
    std::vector<PMV_Data> sensor_env_list;
    std::vector<FanNode> fan_node_list;
    std::vector<ACNode> ac_node_list;

    PMV_Data pmv_data;
    FanNode fan_node;
    ACNode ac_node;

    float outdoor_temp, met, clo, pmv_ref;
    get_room_infomation(met, clo, pmv_ref, outdoor_temp);
    
    // calculate params initially
    for (int id = 0; id < sensor_id.size(); id++) {
        pmv_data.sensor_id = id;
        // pmv_data.get_data(id);
        // pmv_data.cal_pmv(id);
        pmv_data.get_max_air_speed(id);
        sensor_env_list.push_back(pmv_data);
    }
    for (int id = 0; id < fan_id.size(); id++) {
        fan_node.fan_id = id;
        fan_node.get_sensor_link();
        fan_node.cal_pmv_avg(sensor_env_list);
        fan_node_list.push_back(fan_node);
    }
    for (int id = 0; id < ac_id.size(); id++) {
        ac_node.ac_id = id;
        ac_node.get_sensor_link();
        ac_node.cal_pmv_avg(sensor_env_list);
        ac_node_list.push_back(ac_node);
    }

    // control ACs
    for (auto & item : ac_node_list) {
        if (outdoor_temp - item.ac_temp > DELTA_TEMP) {
            item.set_temp(MAXIMUM_TEMP_FOR_INFINITE_PERIOD);
            item.set_time(-1);
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