#!/bin/bash

# Database credentials
DB_USER="giang_mariadb"
DB_PASS="k"
DB_NAME="iot_clg_db"

# Function to delete data in tables in the correct order
delete_data_in_tables() {
    TABLES=(
        "AirConditioner"
        "Fan"
        "EnergyMeasure"
        "SensorNode"
        "RegistrationAC"
        "RegistrationFan"
        "RegistrationEnergy"
        "RegistrationSensor"
        "PMVtable"
    )

    for TABLE in "${TABLES[@]}"; do
        echo "Deleting data in table $TABLE..."
        mysql -u "$DB_USER" -p"$DB_PASS" -e "DELETE FROM $DB_NAME.$TABLE;"
    done
}

# Function to disable foreign key checks
disable_foreign_key_checks() {
    mysql -u "$DB_USER" -p"$DB_PASS" -e "SET FOREIGN_KEY_CHECKS = 0;" $DB_NAME
}

# Function to enable foreign key checks
enable_foreign_key_checks() {
    mysql -u "$DB_USER" -p"$DB_PASS" -e "SET FOREIGN_KEY_CHECKS = 1;" $DB_NAME
}

# Main script execution
echo "Starting to delete data in tables in database $DB_NAME..."

disable_foreign_key_checks
delete_data_in_tables
enable_foreign_key_checks

echo "All data in tables in database $DB_NAME have been deleted."
