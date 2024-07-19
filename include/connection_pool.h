#ifndef CONNECTION_POOL_H
#define CONNECTION_POOL_H

#include <vector>
#include <mutex>
#include <condition_variable>
#include <mariadb/mysql.h>

class ConnectionPool {
public:
    ConnectionPool(size_t poolSize, const char* host, const char* user, const char* password, const char* db);
    ~ConnectionPool();

    MYSQL* getConnection();
    void releaseConnection(MYSQL* connection);

private:
    std::vector<MYSQL*> pool;
    std::mutex poolMutex;
    std::condition_variable poolCondition;
};

#endif // CONNECTION_POOL_H
