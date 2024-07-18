#include <zmq.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    void *context = zmq_ctx_new();
    void *subscriber = zmq_socket(context, ZMQ_SUB);

    zmq_connect(subscriber, "tcp://localhost:5555");
    zmq_setsockopt(subscriber, ZMQ_SUBSCRIBE, "", 0);

    char buffer[256];
    while (1) {
        int size = zmq_recv(subscriber, buffer, 255, 0);
        if (size != -1) {
            buffer[size] = '\0';
            printf("Received: %s\n", buffer);
        }
    }
    
    zmq_close(subscriber);
    zmq_ctx_destroy(context);
    return 0;
}
