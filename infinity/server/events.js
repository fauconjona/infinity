/*
 * file: events.js
 * author: fauconjona
 * description: handle all events
**/

on("getMapDirectives", function(add) {

    add('addTeam', function(state, data){
        return function (teamInfo) {
            if (teamInfo.name) {
                addTeam(data, teamInfo.name, teamInfo.minPlayer != null ? teamInfo.minPlayer : 1, teamInfo.maxPlayer != null ? teamInfo.maxPlayer : 0);
            } else {
                Utils.error("'addTeam' error: missing name");
            }
        }
    },(state, data)=>{
        teams = [];
    });

    add('addTeamHeadQuarter', function(state, data){
        return function (pos) {
            var team = teams[data];

            if (team && pos.x && pos.y && pos.z && pos.radius) {
                team.setHQ(pos);
                teams[data] = team;
            } else {
                Utils.error("'addTeamHeadQuarter' error: paramters missing");
            }
        }
    },()=>{});

    add('addTeamSpawn', function(state, data){
        return function (pos) {
            var team = teams[data];

            if (team && pos.x && pos.y && pos.z && pos.radius) {
                team.setSpawn(pos);
                teams[data] = team;
            } else {
                Utils.error("'addTeamSpawn' error: paramters missing");
            }
        }
    },()=>{});

    add('addObjective', function(state, data){
        return function (options) {
            if (options.x && options.y && options.z && options.heading && options.type) {
                addObjective(data, options);
            } else {
                Utils.error("'addObjective' error: paramters missing");
            }
        }
    },(state, data)=>{
        objectives = [];
    });

    add('addObjectiveCollect', function(state, data){
        return function (options) {
            if (options.action && options.range) {
                var objective = objectives[data];

                if (!objective)
                    return;

                objective.collect = options;

                objectives[data] = objective;
            } else {
                Utils.error("'addObjectiveCollect' error: paramters missing");
            }
        }
    },()=>{});

    add('addObjectiveDestination', function(state, data){
        return function (options) {
            if (options.x && options.y && options.z && options.objective) {
                var objective = objectives[options.objective];
                var destination = {
                    x: options.x,
                    y: options.y,
                    z: options.z,
                    team: data
                }

                if (!objective)
                    return;

                objective.addDestination(destination);

                objectives[options.objective] = objective;
            } else {
                Utils.error("'addObjectiveDestination' error: paramters missing");
            }
        }
    },()=>{});

    add('addObjectiveMarker', function(state, data){
        return function (options) {
            if (options.type && options.scale && options.color) {
                var objective = objectives[data];

                if (!objective)
                    return;

                objective.marker = options;

                objectives[data] = objective;
            } else {
                Utils.error("'addObjectiveMarker' error: paramters missing");
            }
        }
    },()=>{});

    add('addObjectiveDestinationMarker', function(state, data){
        return function (options) {
            if (options.type && options.scale && options.color) {
                var objective = objectives[data];

                if (!objective)
                    return;

                objective.destinationMarker = options;

                objectives[data] = objective;
            } else {
                Utils.error("'addObjectiveDestinationMarker' error: paramters missing");
            }
        }
    },()=>{});

    add('addObjectiveEvent', function(state, data){
        return function (options) {
            if (options.on && options.trigger && options.target) {
                addEvent('objective', options.target, options, data);
            } else {
                Utils.error("'addObjectiveEvent' error: paramters missing");
            }
        }
    },(state, data)=>{
        events = [];
    });

    add('addTeamEvent', function(state, data){
        return function (options) {
            if (options.on && options.trigger) {
                addEvent('team', data, options, null);
            } else {
                Utils.error("'addTeamEvent' error: paramters missing");
            }
        }
    },(state, data)=>{
        events = [];
    });

    add('addEvent', function(state, data){
        return function (options) {
            if (options.on && options.trigger) {
                addEvent('global', data, options, null);
            } else {
                Utils.error("'addEvent' error: paramters missing");
            }
        }
    },(state, data)=>{
        events = [];
    });

    add('setGameConfig', function(state, data){
        return function (options) {
            if (data == "minPlayer" && options.value) {
                gameConfig.minPlayer = options.value;
            } else if (data == "minPlayerReady" && options.value) {
                gameConfig.minPlayerReady = options.value;
            } else if (data == "forceStart" && options.value) {
                gameConfig.forceStart = options.value * 1000;
            } else if (data == "gameStartDelay" && options.value) {
                gameConfig.gameStartDelay = options.value * 1000;
            } else if (data == "noTeam" && options.value) {
                gameConfig.noTeam = options.value;
            }
        }
    },(state, data)=>{
        var gameConfig = {
            minPlayer: 1,
            minPlayerReady: 1,
            forceStart: 60000,
            gameStartDelay: 10000,
            noTeam: false
        };
    });
});

on('playerDropped', function(reason){
    var player = players[source];

    if (player != null) {
        delete players[player.identifier];
    }
});

RegisterNetEvent('infinity:playerConnected');
onNet('infinity:playerConnected', function(){
    var identifier = source;
    var teamsLite = [];
    for (i in teams) {
        teamsLite.push({
            identifier: teams[i].identifier,
            name: teams[i].name,
            minPlayer: teams[i].minPlayer,
            maxPlayer: teams[i].maxPlayer,
            nbPlayers: players.filter(p => (p != null && p.team == i)).length
        });
    }

    if (gameState != "lobby") {
        emitNet('infinity:startSpectating', identifier);
    } else {
        emitNet('infinity:teamsReceived', identifier, teamsLite);
    }

    var playerName = GetPlayerName(identifier);

    TriggerClientEvent('infinity:showNotification', -1, playerName + " ~r~connected");

});

RegisterNetEvent('baseevents:onPlayerKilled');
onNet('baseevents:onPlayerKilled', function(killerId, infos){
    var playerKilled = players[source];
    var killer = players[killerId];

    if (playerKilled != null) {
        playerKilled.killed();
    }

    if (killer != null) {
        TriggerClientEvent('infinity:showNotification', -1, killer.name + " ~r~killed~w~ " + playerKilled.name);

        if (killer.team != playerKilled.team || gameConfig.noTeam) {
            var killEvents = events.filter(e => e.on == 'kill');

            for (var i = 0; i < killEvents.length; i++) {
                var event = killEvents[i];
                if (event.target == 'player') {
                    event.triggered(killer);
                }
            }
        } else {
            var killEvents = events.filter(e => e.on == 'killFriend');

            for (var i = 0; i < killEvents.length; i++) {
                var event = killEvents[i];
                if (event.target == 'player') {
                    event.triggered(killer);
                }
            }
        }
    } else {
        TriggerClientEvent('infinity:showNotification', -1, playerKilled.name + " ~r~died");
    }
});

RegisterNetEvent('baseevents:onPlayerDied');
onNet('baseevents:onPlayerDied', function(killerType, pos){
    var playerKilled = players[source];

    if (playerKilled != null) {
        playerKilled.killed();
        TriggerClientEvent('infinity:showNotification', -1, playerKilled.name + " ~r~died");
    }
});

RegisterNetEvent('infinity:teamChanged');
onNet('infinity:teamChanged', function(teamIdentifier){
    var player = players[source];
    var team = teams[teamIdentifier];

    if (!team){
        //error message
        return;
    }

    if (player) {
        player.setTeam(teamIdentifier);
    } else {
        player = addPlayer(source, teamIdentifier);
    }

    emitNet('infinity:spawnToHeadQuarter', source, team.HQ);

    var teamLite = {
        identifier: teamIdentifier,
        name: team.name,
        minPlayer: team.minPlayer,
        maxPlayer: team.maxPlayer,
        nbPlayers: players.filter(p => (p != null && p.team == team.identifier)).length
    };

    emitNet('infinity:teamUpdate', -1, teamIdentifier, teamLite);

    if (!timerStarted && gameState == "lobby" && canStartParty()) {
        forceStart();
    }

    TriggerClientEvent('infinity:showNotification', -1, player.name + " joined ~g~" + team.name);
});

RegisterNetEvent('infinity:playerReady');
onNet('infinity:playerReady', function(ready){
    var player = players[source];

    if (player != null) {
        player.ready = ready;

        if (ready) {
            TriggerClientEvent('infinity:showNotification', -1, player.name + " is ~g~ready");
        } else {
            TriggerClientEvent('infinity:showNotification', -1, player.name + " is ~r~not ready");
        }
    }
});

RegisterNetEvent('infinity:objectiveCreated');
onNet('infinity:objectiveCreated', function(identifier, objectId){
    var objective = objectives[identifier];

    objective.objectId = objectId;

    objectives[identifier] = objective;

    TriggerClientEvent('infinity:updateObjective', -1, objective);
});

RegisterNetEvent('infinity:objectiveCollected');
onNet('infinity:objectiveCollected', function(identifier){
    var playerId = source;
    var objective = objectives[identifier];
    var player = players[playerId];

    objective.collectedBy(player);
    objective.showDestination(player);

    objectives[identifier] = objective;
});

RegisterNetEvent('infinity:objectiveDropped');
onNet('infinity:objectiveDropped', function(identifier, pos){
    var objective = objectives[identifier];

    if (objective) {
        objective.pos = pos;
        objective.dropped();
        objectives[identifier] = objective;
    }
});

RegisterNetEvent('infinity:objectiveComplete');
onNet('infinity:objectiveComplete', function(identifier){
    var playerId = source;
    var objective = objectives[identifier];
    var player = players[playerId];

    objective.completeBy(player);

    objectives[identifier] = objective;
});

RegisterNetEvent('infinity:playerEnterArea');
onNet('infinity:playerEnterArea', function(objective){
    var playerId = source;
    var objective = objectives[objective];
    var player = players[playerId];

    objective.addPlayerInArea(player);

    objectives[objective] = objective;
});

RegisterNetEvent('infinity:playerExitArea');
onNet('infinity:playerExitArea', function(objective){
    var playerId = source;
    var objective = objectives[objective];
    var player = players[playerId];

    objective.removePlayerInArea(player);

    objectives[objective] = objective;
});

RegisterNetEvent('infinity:isDead');
onNet('infinity:isDead', function(objectId, dead, exist, identifier){
    var objective = objectives[identifier];

    if (!exist) {
        objective.create(true);
    } else if (objective != null && dead) {
        objective.destroy = true;
        var destroyEvents = events.filter(e => e.on == 'destroy' && e.type == "objective" && e.data == objective.identifier);
        for (var i = 0; i < destroyEvents.length; i++) {
            destroyEvents[i].triggered(null);
        }
    }
});

RegisterNetEvent('infinity:entityCreated');
onNet('infinity:entityCreated', function(objectId){
    missionEntities.push(objectId);
});

RegisterNetEvent('infinity:entityFreeze');
onNet('infinity:entityFreeze', function(objectId, freeze){
    TriggerClientEvent('infinity:entityFreeze', -1, objectId, freeze);
});

RegisterNetEvent('infinity:taskGoTo');
onNet('infinity:taskGoTo', function(objectId, pos){
    TriggerClientEvent('infinity:taskGoTo', -1, objectId, pos);
});

RegisterNetEvent('infinity:showNotification');
onNet('infinity:showNotification', function(text){
    TriggerClientEvent('infinity:showNotification', -1, text);
});
