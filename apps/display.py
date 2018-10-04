import appdaemon.plugins.hass.hassapi as hass
import json
import requests

"""

Send stuff to display
Arguments:
 - host: HTTP endpoint for display API

"""
class Display(hass.Hass):
    entities = {
        'input_text.display_text': 'text',
        'input_select.display_mode': 'mode',
    }

    def _post(self, path, data):
        requests.post('{}{}'.format(self.host, path), json.dumps(data))

    def update_display(self):
        self.host = self.args['host']

        text = self.values['text']
        mode = self.values['mode']

        self._post('/scroll', { 'arg': 'auto' })

        if mode == 'Text':
            self._post('/text', { 'text': text, 'time': True })
        if mode == 'Date':
            self._post('/time', { 'format': '  %A, %b %-d %H:%M:%S' })

    def initialize(self):
        self.values = {}

        for entity in self.entities.keys():
            name = self.entities[entity]
            self.values[name] = self.get_state(entity)

            self.log('watching entity "{}" for state changes'.format(entity))
            self.listen_state(self.changed, entity)

        #self.update_display()

    def changed(self, entity, attribute, old, new, kwargs):
        if entity in self.entities:
            name = self.entities[entity]
            self.values[name] = new
            self.update_display()

