import os

import pandas as pd
import numpy as np
import sqlite3
import pandas 
import json

import requests

from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, jsonify, render_template,request
from flask_sqlalchemy import SQLAlchemy
from shapely.geometry import shape, Point
from math import sin, cos, sqrt, atan2, radians
from datetime import tzinfo, timedelta, datetime
import seaborn as sns

from sklearn.externals import joblib
from sklearn.preprocessing import LabelEncoder

# Import SQLAlchemy `automap` and other dependencies here
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, inspect, func

app = Flask(__name__)
engine = create_engine("sqlite:///crimenew.sqlite")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///crimenew.sqlite"
db = SQLAlchemy(app)

# loaded_model = joblib.load('finalized_model.sav')

with open('sfpd_districts2.json') as f:
    js = json.load(f)

police_district_lat_lon_map ={'CENTRAL' : [37.7986453192461, -122.4098629092911], 
                 'PARK' : [37.7678486242834, -122.4552665971872], 
                 'SOUTHERN' :[37.7749888994694, -122.4043283015447],
                 'RICHMOND':[37.7800012925707, -122.4644607286463],
                 'TENDERLOIN':[37.7837040581307, -122.4128957522243],
                 'BAYVIEW':[37.729641718322, -122.3980865549364],
                 'INGLESIDE':[37.7247701343562, -122.4462510450206],
                 'MISSION':[37.7626807026424, -122.4219696654014],
                 'TARAVAL':[37.743733794625, -122.4814607671523],
                 'NORTHERN':[37.7801611403781, -122.432390435179]} 

# TODO: replace code with actual encoded police district
police_district_encode_map = {'CENTRAL': 1, 
                 'PARK': 5, 
                 'SOUTHERN': 7,
                 'RICHMOND': 6,
                 'TENDERLOIN': 9,
                 'BAYVIEW':0,
                 'INGLESIDE': 2,
                 'MISSION': 3,
                 'TARAVAL': 8,
                 'NORTHERN': 4}

# Create a list to hold our data
# crimedata = pd.read_csv('crimedata_all.csv')
# print(len(crimedata))
crime = Base.classes.crimedata

@app.route("/")
def home():
    return render_template("index.html")



@app.route("/crimedata")
def data():
    sel = [crime.Category, 
           crime.Date,
           crime.DayOfWeek,
           crime.Description,
           crime.Latitude, 
           crime.Longitude,
           crime.PdDistrict,
           crime.month,
           crime.year,
           crime.Hour]
    results = db.session.query(*sel).all()
    crimedatalist=[]
    for result in results:
        crimedata = {}
        crimedata["Category"] = result[0]
        crimedata["IncidentDate"] = result[1]
        crimedata["IncidentDayofWeek"] = result[2]
        crimedata["IncidentDescription"] = result[3]
        crimedata["Latitude"] = result[4]
        crimedata["Longtitude"] = result[5]
        crimedata["PoliceDistrict"] = result[6]
        crimedata["month"] = result[7]
        crimedata["year"] = result[8]
        crimedata["Hour"] = result[9]

        crimedatalist.append(crimedata)
    return jsonify(crimedatalist)


@app.route("/send", methods=["GET", "POST"])
def senduserlatlon():
    if request.method == "POST":
        data = request.get_json()
        # find date information (year, month, day, day of week)
        user_date = data["date"]
        (year, month, day, weekday) = get_date(user_date)
        print(year, month, day, weekday)
        
        # find relative time
        user_time = data["time"]
        (hour, user_relative_time) = delta_origin_time(user_time)
        print(hour, user_relative_time)

        # find lon and lat from address, find police district name and distance from user input
        address = data["address"]
        (user_lon, user_lat) = get_lat_lon_from_address(address)

        userloc = {"lat":user_lat,"lon":user_lon}
        print(user_lat, user_lon)
        police_district_found_for_user_address = find_police_district(user_lon, user_lat)
        print(police_district_found_for_user_address)
        police_district_encode = police_district_encode_map[police_district_found_for_user_address]

        (police_depart_lat, police_depart_lon) = police_district_lat_lon_map[police_district_found_for_user_address]
        distance = find_distance(police_depart_lat, police_depart_lon, user_lat, user_lon)

        # 'month','RelativeTime','Date','pdDistrict','Distance to PDoffice','Hour','year'
        prediction_input = [month, user_relative_time, weekday, police_district_encode, distance, hour, year]
        print(prediction_input)
        
        # x_predict = [8, 0.5833333333333334, 3, 8, 1.02, 14, 2019]
        # y_predict = loaded_model.predict([x_predict])
        #print(y_predict)
        #crimetype = label_encoder.inverse_transform(y_predict)[0]
       
    return {"lat":user_lat,"lon":user_lon}


def find_police_district(lon, lat):
    # construct point based on lon/lat returned by geocoder
    point = Point(lon, lat)
    # check each polygon to see if it contains the point
    for feature in js['features']:
        polygon = shape(feature['geometry'])
        if polygon.contains(point):
            return feature['properties']['DISTRICT']
    print('No Police District Found :( ')         
    return None


def get_lat_lon_from_address(address):
    api_key = "AIzaSyDQFf4ZmW6ithxv_CjYJxrnkJAox9CYfkg"
    api_response = requests.get('https://maps.googleapis.com/maps/api/geocode/json?address={0}&key={1}'.format(address, api_key))
    api_response_dict = api_response.json()
    latitude = api_response_dict['results'][0]['geometry']['location']['lat']
    longitude = api_response_dict['results'][0]['geometry']['location']['lng']
    return (longitude, latitude)

def find_distance(lat1, lon1, lat2, lon2):
    R = 6373.0
    lat1=radians(lat1)
    lat2=radians(lat2)
    lon1=radians(lon1)
    lon2=radians(lon2)
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    distance = R * c
    return round(distance,2)


def delta_origin_time(dt):
    origin_time = datetime.strptime('00:00','%H:%M')
    time = datetime.strptime(dt,'%H:%M')
    time = time - origin_time
    hour = datetime.strptime(dt,'%H:%M').hour
    return (hour, (time.seconds * 1.0 / 86400))

def get_date(dt):
    month = datetime.strptime(dt,'%m/%d/%Y').month
    year = datetime.strptime(dt,'%m/%d/%Y').year
    day = datetime.strptime(dt,'%m/%d/%Y').day
    weekday = datetime.strptime(dt,'%m/%d/%Y').weekday()
    return (year, month, day, weekday)
#     if request.method == "POST":
#         nickname = request.form["nickname"]
#         age = request.form["age"]

#         form_data = {
#             "nickname": nickname,
#             "age": int(age)
#         }

#         my_data.append(form_data)

#         return "Thanks for the form data!"

#     return render_template("form.html")


if __name__ == "__main__":
    app.run(debug=True)
