#include "connection_pool.h"
#include <iostream>

ConnectionPool::ConnectionPool(size_t poolSize, const char* host, const char* user, const char* password, const char* db) {
    for (size_t i = 0; i < poolSize; ++i) {
        MYSQL* connection = mysql_init(NULL);
        if (!connection || !mysql_real_connect(connection, host, user, password, db, 0, NULL, 0)) {
            std::cerr << "mysql_real_connect() failed\n";
            if (connection) {
                mysql_close(connection);
            }
            exit(EXIT_FAILURE);
        }
        pool.push_back(connection);
    }
}

ConnectionPool::~ConnectionPool() {
    for (MYSQL* connection : pool) {
        mysql_close(connection);
    }
}

MYSQL* ConnectionPool::getConnection() {
    std::unique_lock<std::mutex> lock(poolMutex);
    poolCondition.wait(lock, [this]() { return !pool.empty(); });
    MYSQL* connection = pool.back();
    pool.pop_back();
    return connection;
}

void ConnectionPool::releaseConnection(MYSQL* connection) {
    std::lock_guard<std::mutex> lock(poolMutex);
    pool.push_back(connection);
    poolCondition.notify_one();
}
