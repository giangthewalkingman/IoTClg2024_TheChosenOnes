# Define the C++ compiler to use
CXX := g++

# Define any compile-time flags
CXXFLAGS := -std=c++17 -g -I./include

# Define the library directories
LDFLAGS := -L/usr/include/mariadb/mysql -lmariadbclient -lzmq

# Define the source files
SOURCES := src/main.cpp lib/control_actuator.cpp lib/database_access.cpp lib/z3gateway_comm.cpp lib/connection_pool.cpp lib/database_access_cnp.cpp

# Define the output executable
OUTPUT := main

# Build the executable
all: $(OUTPUT)

$(OUTPUT): $(SOURCES)
	$(CXX) $(CXXFLAGS) $(SOURCES) $(LDFLAGS) -o $(OUTPUT)

# Clean up build files
clean:
	rm -f $(OUTPUT) src/*.o lib/*.o lib/*.d src/*.d
