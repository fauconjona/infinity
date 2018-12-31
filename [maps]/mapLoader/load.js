var currentMap = null;
var currentGameType = null;

function loadNewMap() {
    if (currentMap != null) {
        StopResource(currentMap);
    }
    currentMap = maps[Math.floor(Math.random()*maps.length)];
    console.log("Starting new map: " + currentMap);
    StartResource(currentMap);
}

function reloadMap() {
    if (currentMap == null) {
        return;
    }

    StopResource(currentMap);
    console.log("Restarting map: " + currentMap);
    StartResource(currentMap);
}

on("onResourceStart", function(name) {
    if (name == "mapLoader") {
        loadNewMap();
    } else {
        var nb = GetNumResourceMetadata(name, "resource_type");

        for (var i = 0; i < nb; i++) {
            var resource_type = GetResourceMetadata(name, "resource_type", i);
            if (resource_type == "gametype") {
                currentGameType = name;
            }
        }
    }
});


on("mapLoader:loadNewMap", function() {
    loadNewMap();
});

on("mapLoader:reloadMap", function() {
    reloadMap();
});
