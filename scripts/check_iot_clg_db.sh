#!/bin/bash

# Database credentials
DB_USER="giang_mariadb"
DB_PASS="k"
DB_NAME="iot_clg_db"

# Function to check tables for data
check_tables_for_data() {
    TABLES=$(mysql -u "$DB_USER" -p"$DB_PASS" -e "SHOW TABLES IN $DB_NAME;" | grep -v "Tables_in")

    for TABLE in $TABLES; do
        ROW_COUNT=$(mysql -u "$DB_USER" -p"$DB_PASS" -N -e "SELECT COUNT(*) FROM $DB_NAME.$TABLE;")
        if [ "$ROW_COUNT" -gt 0 ]; then
            echo "Table $TABLE has $ROW_COUNT rows."
        else
            echo "Table $TABLE is empty."
        fi
    done
}

# Main script execution
echo "Checking tables in database $DB_NAME for data..."

check_tables_for_data
