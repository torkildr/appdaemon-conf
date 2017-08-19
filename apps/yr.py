import appdaemon.appapi as appapi
import requests
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta

"""

Get detailed Yr weather data

Arguments:
 - event: Entity name when publishing event
 - interval: Update interval, in minutes
 - source: Yr xml source

"""
class Yr(appapi.AppDaemon):
    def initialize(self):
        self.url = self.args['source']
        self.entity = self.args['event']

        inOneMinute = datetime.now() + timedelta(minutes = 1)
        interval = int(self.args['interval'])

        # delay first launch with one minute, run every 'interval' minutes
        self.run_every(self.updateState, inOneMinute, interval * 60)

    def updateState(self, kwargs):
        forecast = self.fetchForecast()
        self.set_app_state(self.entity, {
            'state': "",
            'attributes': forecast
        })
        

    def fetchData(self):
        res = requests.get(self.url)
        return res.text

    def fetchForecast(self):
        data = self.fetchData()
        root = ET.fromstring(data)
        periods = root.find('.//tabular')
        return [{
            'from': x.get('from'),
            'to': x.get('to'),
            'weather': x.find('symbol').get('name'),
            'symbol': x.find('symbol').get('var'),
            'precip': x.find('precipitation').get('value'),
            'windSpeed': x.find('windSpeed').get('mps'),
            'windDirection': x.find('windDirection').get('deg'),
            'temp': x.find('temperature').get('value')
        } for x in periods[:12]]
 
