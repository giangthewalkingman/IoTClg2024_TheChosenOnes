#include <iostream>
#include <chrono>
#include <thread>

void runFunction() {
    std::this_thread::sleep_for(std::chrono::seconds(20));
    std::cout << "Function ran after 20 secs." << std::endl;
}

void otherFunction() {
    std::cout << "Other function is running concurrently." << std::endl;
    // Simulate some work with sleep
    std::this_thread::sleep_for(std::chrono::seconds(5));
    std::cout << "Other function finished after 5 secs." << std::endl;
}

int main() {
    std::thread thread1(runFunction);
    std::thread thread2(otherFunction);

    // Wait for both threads to finish
    thread1.join();
    thread2.join();

    std::cout << "Both functions have completed." << std::endl;
    return 0;
}
