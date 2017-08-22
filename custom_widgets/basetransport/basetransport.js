function basetransport(widget_id, url, skin, parameters) {
    var self = this;
    // the api should probably be changed so this isn't necessary
    self.parameters = parameters;

    self.renderTime = function() {
        $(".departure-timestamp").each(function(index, item) {
            var timestamp = moment($(item).text());
            if (!timestamp.isValid())
              return;
  
            var diff = moment.duration(timestamp.diff(moment()));
            var formatted = undefined;
  
            if (diff.asMinutes() < 30) {
              formatted = Math.floor(diff.asMinutes()) + " min";
            } else {
              formatted = timestamp.format("HH:mm");
            }
  
            $(item).next(".departure-time").text(formatted);
        });
    };

    // hook up callbacks and widget stuff
    self.onData = function(self, state) {
        var stops = state.attributes;
        
        var keys = function(obj) {
            return Object.keys(obj).sort();
        };

        var data = keys(stops).map(function(s) {
            var stop = stops[s];
            return keys(stop).map(function(p) {
                var platform = stop[p];
                
                return {
                    name: s + ", " + p,
                    lines: keys(platform).map(function(line) {
                        return {
                            name: line,
                            departures: platform[line],
                        };
                    }),
                };
            });
        });

        self.set_field(self, 'data', data);
        self.renderTime();
    };

    var callbacks = [];
    var monitored_entities = [
        {
            'entity': parameters.entity,
            'initial': self.onData,
            'update': self.onData,
        },
    ];

    setInterval(self.renderTime, 1000);

    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks);
}

