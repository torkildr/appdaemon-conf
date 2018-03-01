function basenews(widget_id, url, skin, parameters) {
    var self = this;
    // the api should probably be changed so this isn't necessary
    self.parameters = parameters;
    
    // hook up callbacks and widget stuff
    self.onData = function(self, state) {
        self.set_field(self, 'entries', state.feed.entries);
    };

    var callbacks = [];
    var monitored_entities = [
        {
            'entity': parameters.entity,
            'initial': self.onData,
            'update': self.onData,
        },
    ];

    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks);
}

