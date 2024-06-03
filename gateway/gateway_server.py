import time
from datetime import datetime, timedelta
from multiprocessing import Process

import flask
import requests
from flask import Flask, jsonify, request
import mysql.connector
from mysql.connector import Error
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Hàm để tạo kết nối MySQL
def create_connection():
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="schema_gateway"
        )
        if connection.is_connected():
            return connection
    except Error as e:
        print("Error while connecting to MySQL:", e)
        return None

@app.route('/')
def home():
    return 'Welcome to Gateway API!'

if __name__ == '__main__':
    app.run(debug=True)