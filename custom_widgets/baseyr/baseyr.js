function baseyr(widget_id, url, skin, parameters) {
    var self = this;
    // the api should probably be changed so this isn't necessary
    self.parameters = parameters;

    // yr stuff
    var symbols = function(forecast) {
        var prev_symbol = '';
        var symbol_count = 0;
        var symbols = [];

        var addSymbol = function(name, count) {
            symbols.push({
                name: name,
                count: count,
                asset: self.parameters.assets + '/b48/' + name + '.png',
            });
        };

        Object.keys(forecast).forEach(function(key) {
            var value = forecast[key];
            
            if (prev_symbol == value["symbol"]) {
                symbol_count++;
            } else {
                if (symbol_count != 0) {
                    addSymbol(prev_symbol, symbol_count);
                }
            
                prev_symbol = value["symbol"];
                symbol_count = 1;
            }
        });

        return symbols;
    };

    var zeroPad = function(value, length) {
        value = value + '';
        var numPads = length - value.length;
        if (numPads > 0) {
            value = new Array(numPads + 1).join('0') + value;
        }
        return value;
    };
    
    var intervalRounded = function(value, interval) {
        return Math.round(parseFloat(value) / interval) * interval;
    }
    
    var getWindAsset = function(speed, direction) {
        if (parseFloat(speed) <= 0.2) {
            return "vindstille";
        }
        
        var speedAsset = zeroPad(intervalRounded(speed, 2.5) * 10, 4);
        var directionAsset = zeroPad(intervalRounded(direction, 5) % 360, 3);
        
        var file = "vindpil." + speedAsset + "." + directionAsset;
        return self.parameters.assets + '/w24/' + file + '.png';
    }

    var hours = function(forecast) {
        var hours = [];

        for (var i = 0; i < forecast.length; i += 2) {
            hours.push({
                hour: forecast[i].from,
                wind1: getWindAsset(forecast[i].windSpeed, forecast[i].windDirection),
                wind2: getWindAsset(forecast[i+1].windSpeed, forecast[i+1].windDirection),
            });
        }
    
        return hours;
    };

    // hook up callbacks and widget stuff
    self.onData = function(self, data) {
        var forecast = data.attributes;
        self.set_field(self, "symbols", symbols(forecast));
        self.set_field(self, "hours", hours(forecast));
        self.set_field(self, "forecast", forecast);
    };

    var callbacks = [];
    var monitored_entities = [
        {
            "entity": parameters.entity,
            "initial": self.onData,
            "update": self.onData,
        },
    ];

    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks);
}

