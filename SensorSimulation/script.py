import boto3
import json
import random
import time
from dotenv import load_dotenv
import os
from datetime import datetime

load_dotenv()

aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
aws_region = os.getenv("AWS_REGION")
iot_endpoint = os.getenv("IOT_ENDPOINT")
iot_topic = os.getenv("IOT_TOPIC")

iot_client = boto3.client(
    'iot-data',
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key,
    region_name=aws_region,
    endpoint_url=f'https://{iot_endpoint}'
)

def simulate_sensor_data():
    # Simulate NPK sensor data with two decimal places
    nitrogen = round(random.uniform(0, 100), 2)
    phosphorus = round(random.uniform(0, 100), 2)
    potassium = round(random.uniform(0, 100), 2)

    # Simulate soil moisture sensor data with two decimal places
    soil_moisture = round(random.uniform(0, 100), 2)

    # Simulate humidity sensor data with two decimal places
    humidity = round(random.uniform(0, 100), 2)

    sensor_data = {
        'nitrogen': nitrogen,
        'phosphorus': phosphorus,
        'potassium': potassium,
        'soil_moisture': soil_moisture,
        'humidity': humidity,
    }

    return sensor_data

def publish_sensor_data():
    while True:
        sensor_data = simulate_sensor_data()

        # Publish data to IoT Core
        payload = json.dumps(sensor_data)
        response = iot_client.publish(
            topic=iot_topic,
            payload=payload
        )

        print(f"Published data: {payload}")

        time.sleep(5)  # Adjust the sleep duration based on your requirements

if __name__ == "__main__":
    publish_sensor_data()
