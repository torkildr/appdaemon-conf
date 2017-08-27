function basecalendar(widget_id, url, skin, parameters) {
    var self = this;
    // the api should probably be changed so this isn't necessary
    self.parameters = parameters;

    var humanizeDuration = function(beginDate, endDate) {
        var begin = moment(beginDate);
        var end = moment(endDate);
        var diff = moment.duration(end.diff(begin));
        var fromNow = moment.duration(end.diff(moment()));

        var dateFormat = (fromNow.asDays() < 7) ? "ddd" : "ddd, D MMM";
        var hourFormat = "HH:mm";
        var dateAndHourFormat = dateFormat + ", " + hourFormat;
        var separator = "\nto ";

        if (diff.asHours() % 24 === 0) {
            if (diff.asHours() === 24) {
                return begin.format(dateFormat);
            }
            return begin.format(dateFormat) + separator + end.format(dateFormat);
        }

        var format = (fromNow.asHours() < 24) ? hourFormat : dateAndHourFormat;

        if (diff.asMinutes() === 0) {
            return begin.format(format);
        }

        var endFormat = (diff.asHours() < 24) ? hourFormat : dateAndHourFormat;
        return begin.format(format) + separator + end.format(endFormat);
    };
    

    // hook up callbacks and widget stuff
    self.onData = function(self, state) {
        var events = state.attributes.map(function (event) {
            return {
                name: event.name,
                location: event.location,
                duration: humanizeDuration(event.begin, event.end),
            };
        });

        self.set_field(self, 'events', events);
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

