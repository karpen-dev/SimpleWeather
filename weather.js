(function() {
    const plugin = require('plugin');
    const defaultCity = "Tokyo";

    function httpGet(url) {
        try {
            var connection = new java.net.URL(url).openConnection();
            connection.setRequestMethod("GET");
            
            var reader = new java.io.BufferedReader(
                new java.io.InputStreamReader(connection.getInputStream())
            );
            var response = new java.lang.StringBuilder();
            var line;
            
            while ((line = reader.readLine()) != null) {
                response.append(line);
            }
            reader.close();
            
            return JSON.parse(response.toString());
        } catch (e) {
            plugin.logger.severe("HTTP Request failed: " + e);
            return {cod: 500, message: "Request failed"};
        }
    }

    function getWeather(city) {
        try {
            var data = httpGet("https://karpendev.ru/api/weather?city=" + encodeURI(city));
            
            if (data.cod !== 200) {
                throw new Error(data.message || "API error");
            }
            
            return data.weather[0].main + ", " + data.main.temp + "°C";
        } catch (e) {
            plugin.logger.warning("Weather error: " + e);
            return "Could not get weather data";
        }
    }

    plugin.onEvent("PlayerJoinEvent", function(event) {
        var weather = getWeather(defaultCity);
        event.getPlayer().sendMessage("Weather in " + defaultCity + ": " + weather);
    });

    plugin.onCommand("getweather", function(cmd) {
        if (cmd.args.length === 0) {
            cmd.sender.sendMessage("Usage: /getweather <city>");
            return true;
        }
        
        var city = cmd.args[0];
        var weather = getWeather(city);
        cmd.sender.sendMessage("Weather in " + city + ": " + weather);
        
        return true;
    });

    function onEnable() {
        plugin.logger.info("Weather script loaded");
    }

    function onDisable() {
        plugin.logger.info("Weather script unloaded");
    }
})();