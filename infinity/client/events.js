/*
 * file: events.js
 * author: fauconjona
 * description: handle all client events
**/

on('onClientMapStop', () => {
    resetInfinity();
});

on('onClientMapStart', () => {
    loadLobby();
});

on('playerSpawned', function() {
    if (firstSpawn) {
        TriggerServerEvent('infinity:playerConnected');
        gameState = "lobby";
        firstSpawn = false;
    } else {
        if (currentClass != null) {
            changeClass(currentClass);
        }
    }
});

on('baseevents:onPlayerKilled', function(killerId, infos) {
    playerDead();
});

on('baseevents:onPlayerDied', function(killerType, pos) {
    playerDead();
});

on("getMapDirectives", function(add) {

    add('addTeamClass', function(state, data){
        return function (options) {
            if (options.identifier && options.name && options.model && options.weapons) {
                var teamClass = {
                    identifier: options.identifier,
                    team: data,
                    name: options.name,
                    model: options.model,
                    weapons: options.weapons,
                    default: options.default != null ? options.default : false
                };

                classes[options.identifier] = teamClass;
            }
        }
    },(state, data)=>{
        classes = [];
    });

    add('addClassMenu', function(state, data){
        return function (options) {
            if (options.x && options.y && options.z && options.radius && options.marker) {
                classMenus[data] = options;
            }
        }
    },(state, data)=>{
        classMenus = [];
    });

    add('addLobby', function(state, data){
        return function (options) {
            if (options.x && options.y && options.z) {
                lobby = {
                    x: options.x,
                    y: options.y,
                    z: options.z,
                    heading: options.heading ? options.heading : 0,
                    model: data
                };
            }
        }
    },(state, data)=>{
        lobby = null;
    });

    add('addTeamRule', function(state, data){
        return function (options) {
            if (options.name) {
                var rule = {
                    type: 'team',
                    options: options,
                    team: data
                };
                var unique = true;

                for (var i = 0; i < rules.length; i++) {
                    var r = rules[i];
                    if (JSON.stringify(r) == JSON.stringify(rule)) {
                        unique = false;
                        break;
                    }
                }

                if (!unique)
                    return;

                rules.push(rule);
            }
        }
    },(state, data)=>{
        rules = [];
    });

    add('setGameConfig', function(state, data){
        return function (options) {
            if (data == "autoFill" && options.value) {
                gameConfig.autoFill = options.value;
            }
        }
    },(state, data)=>{
        gameConfig = {
            disableWanted: false,
            respawn: null,
            autoFill: false
        };
    });
});

RegisterNetEvent('infinity:teamsReceived');
on('infinity:teamsReceived', function(serverTeams) {
    teams = serverTeams;

    if (currentTeam == null) {
        if (gameConfig.autoFill) {
            randomTeam();
        } else {
            openTeamMenu();
        }
    }
});

RegisterNetEvent('infinity:teamUpdate');
on('infinity:teamUpdate', function(identifier, team) {

    for (var i in teams) {
        if (teams[i].identifier == identifier) {
            teams[i] = team;
        }
    }

    if (currentTeam == null) {
        if (gameConfig.autoFill) {
            randomTeam();
        } else {
            openTeamMenu();
        }
    }
});

RegisterNetEvent('infinity:newTeam');
on('infinity:newTeam', function(team) {
    currentTeam = team;
});

RegisterNetEvent('infinity:spawnToHeadQuarter');
on('infinity:spawnToHeadQuarter', function(pos) {
    var defaultClass = null;

    for (var identifier in classes) {
        if (classes[identifier].team == currentTeam && (classes[identifier].default || defaultClass == null)) {
            defaultClass = classes[identifier];
        }
    }

    if (pos.radius > 1) {
        pos.x = pos.x + (Math.random() * 2 * pos.radius) - pos.radius;
        pos.y = pos.y + (Math.random() * 2 * pos.radius) - pos.radius;
    }

    if (defaultClass != null) {
        changeClass(defaultClass);
        hqPos = {
            x: pos.x,
            y: pos.y,
            z: pos.z,
            heading: 0,
            model: defaultClass.model
        };
        exports.spawnmanager.removeSpawnPoint(lobby.idx);
        hqPos.idx = exports.spawnmanager.addSpawnPoint(hqPos);
    } else {
        console.log("Can't load team classes")
        return;
    }

    SetEntityCoords(GetPlayerPed(-1), pos.x, pos.y, pos.z, 1, 0, 0, 1);

    //enabling rules

    for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        if (rule.type == 'team' && rule.team == currentTeam) {
            if (rule.options.name == 'disableWanted') {
                gameConfig.disableWanted = true;
            } else if (rule.options.name == 'respawn') {
                gameConfig.respawn = {
                    type: rule.options.type,
                    delay: rule.options.delay ? rule.options.delay * 1000 : 0,
                    button: rule.options.button ? rule.options.button : -1
                };
            }
        }
    }

    displayReadyInstruction("To be ready press ");

    gameState = "preparing";
});

RegisterNetEvent('infinity:startParty');
on('infinity:startParty', function(pos) {


    messageScaleform.ready = false;
    messageScaleform.scaleform = null;

    if (pos.radius > 1) {
        pos.x = pos.x + (Math.random() * 2 * pos.radius) - pos.radius;
        pos.y = pos.y + (Math.random() * 2 * pos.radius) - pos.radius;
    }

    SetEntityCoords(GetPlayerPed(-1), pos.x, pos.y, pos.z, 1, 0, 0, 1);

    partyPos = {
        x: pos.x,
        y: pos.y,
        z: pos.z,
        heading: 0,
        model: currentClass.model
    };
    exports.spawnmanager.removeSpawnPoint(hqPos.idx);
    partyPos.idx = exports.spawnmanager.addSpawnPoint(partyPos);

    gameState = "playing";
});

RegisterNetEvent('infinity:createObject');
on('infinity:createObject', function(model, pos, isNetwork, objectiveIdentifier) {
    var obj = CreateObjectNoOffset(model, pos.x, pos.y, pos.z, true, false, false);
	SetEntityHeading(obj, pos.heading);
	FreezeEntityPosition(obj, true);

    if (objectiveIdentifier) {
        var objective = objectives[objectiveIdentifier];
        objective.objectId = obj;
        objectives[objectiveIdentifier] = objective;
        TriggerServerEvent('infinity:objectiveCreated', objectiveIdentifier, obj);
    }

    TriggerServerEvent('infinity:entityCreated', obj);
});

RegisterNetEvent('infinity:createVehicle');
on('infinity:createVehicle', async function(model, pos, isNetwork, objectiveIdentifier) {
    var vehHash = GetHashKey(model);

    if (IsModelValid(vehHash)) {
        RequestModel(vehHash);
        while (!HasModelLoaded(vehHash)) {
            await Utils.delay(1);
        }

        var veh = CreateVehicle(vehHash, pos.x, pos.y, pos.z, pos.heading, isNetwork, false);
        var vehId = NetworkGetNetworkIdFromEntity(veh);

		SetEntityAsMissionEntity(veh, true, false);
		SetVehicleHasBeenOwnedByPlayer(veh, true);
		SetVehicleNeedsToBeHotwired(veh, false);

        SetModelAsNoLongerNeeded(vehHash);

        for (var i = 0; i < 32; i++) {
            if (NetworkIsPlayerActive(i) && GetPlayerPed(i) != GetPlayerPed(-1)) {
                SetNetworkIdSyncToPlayer(vehId, i, false);
            }
        }
        if (objectiveIdentifier != null) {
            TriggerServerEvent('infinity:objectiveCreated', objectiveIdentifier, veh);
        }

        TriggerServerEvent('infinity:entityCreated', veh);
    }
});

RegisterNetEvent('infinity:deleteObject');
on('infinity:deleteObject', function(objectId) {
    DeleteObject(objectId);
});

RegisterNetEvent('infinity:newObjective');
on('infinity:newObjective', function(objective) {
    objectives[objective.identifier] = objective;

    if (objective.showBlip && (objective.team == null || objective.team == currentTeam)) {
        if (objective.type == "object" || objective.type == "area") {
            TriggerEvent('infinity:createObjectiveBlip', objective.pos, objective.identifier);
        } else if (objective.type == "vehicle" && objective.objectId != null) {
            TriggerEvent('infinity:createVehicleBlip', objective.objectId, objective.identifier);
        }
    }
});

RegisterNetEvent('infinity:updateObjective');
on('infinity:updateObjective', function(objective) {
    objectives[objective.identifier] = objective;
    var blipInfos = objectiveBlips[objective.identifier];

    if (objective.showBlip && blipInfos == null && (objective.team == null || objective.team == currentTeam)) {
        if (objective.type == "vehicle") {
            TriggerEvent('infinity:createVehicleBlip', objective.objectId, objective.identifier);
        } else {
            TriggerEvent('infinity:createObjectiveBlip', objective.pos, objective.identifier);
        }
    } else if (!objective.showBlip) {
        TriggerEvent('infinity:deleteObjectiveBlip', objective.identifier);
    }
});

RegisterNetEvent('infinity:createObjectiveBlip');
on('infinity:createObjectiveBlip', function(pos, objective) {
    var blipInfos = objectiveBlips[objective];
    var blip = AddBlipForCoord(pos.x, pos.y, pos.z);

    SetBlipRoute(blip, true);

    if (blipInfos) {
        RemoveBlip(blipInfos.blip);
        blipInfos.blip = blip;
        objectiveBlips[objective] = blipInfos;
    } else {
        objectiveBlips[objective] = {
            identifier: objective,
            blip: blip
        };
    }
});

RegisterNetEvent('infinity:createVehicleBlip');
on('infinity:createVehicleBlip', function(veh, objective) {
    var blipInfos = objectiveBlips[objective];
    var blip = AddBlipForEntity(veh);

    SetBlipRoute(blip, true);

    if (blipInfos) {
        RemoveBlip(blipInfos.blip);
        blipInfos.blip = blip;
        objectiveBlips[objective] = blipInfos;
    } else {
        objectiveBlips[objective] = {
            identifier: objective,
            blip: blip
        };
    }
});

RegisterNetEvent('infinity:deleteObjectiveBlip');
on('infinity:deleteObjectiveBlip', function(identifier) {
    var blipInfos = objectiveBlips[identifier];

    if (blipInfos) {
        RemoveBlip(blipInfos.blip);
        objectiveBlips[identifier] = null;
    }
});

RegisterNetEvent('infinity:winMessage');
on('infinity:winMessage', function(title, text, duration) {
    gameState = "end";
    displayWinMessage(title, text, duration);

    if (hqPos != null) {
        exports.spawnmanager.removeSpawnPoint(hqPos.idx);
    }

    if (partyPos != null) {
        exports.spawnmanager.removeSpawnPoint(partyPos.idx);
    }

    if (lobby != null) {
        exports.spawnmanager.removeSpawnPoint(lobby.idx);
    }
});

RegisterNetEvent('infinity:updateScore');
on('infinity:updateScore', function(serverScore) {
    globalScore = serverScore;
});

RegisterNetEvent('infinity:setRule');
on('infinity:setRule', function(name, value) {
    gameConfig[name] = value;
});

RegisterNetEvent('infinity:setWanted');
on('infinity:setWanted', function(level) {
    SetPlayerWantedLevelNow(PlayerId(), true);
    SetPlayerWantedLevel(PlayerId(), level, false);
});

RegisterNetEvent('infinity:kill');
on('infinity:kill', function() {
    SetEntityHealth(GetPlayerPed(-1), 0);
});

RegisterNetEvent('infinity:respawn');
on('infinity:respawn', function() {
    exports.spawnmanager.spawnPlayer();
});

RegisterNetEvent('infinity:revive');
on('infinity:revive', function() {
    var [playerX, playerY, playerZ] = GetEntityCoords(GetPlayerPed(-1), false);
    exports.spawnmanager.spawnPlayer(false, () => {
        SetEntityCoords(GetPlayerPed(-1), playerX, playerY, playerZ, 1, 0, 0, 1);
    });
});

RegisterNetEvent('infinity:changeClass');
on('infinity:changeClass', function(classIdentifier) {
    var teamClass = classes[classIdentifier];

    if (teamClass != null) {
        changeClass(teamClass);
    }
});


RegisterNetEvent('infinity:checkAlive');
on('infinity:checkAlive', function(objectId, objectiveIdentifier) {
    TriggerServerEvent('infinity:isDead', objectId, IsEntityDead(objectId) == 1, objectiveIdentifier);
});

RegisterNetEvent('infinity:deleteEntity');
on('infinity:deleteEntity', function(objectId) {
    DeleteEntity(objectId);
});

RegisterNetEvent('infinity:displayMessage');
on('infinity:displayMessage', function(text, time) {
    messageToDisplay = text;
    setTimeout(() => {
        messageToDisplay = null;
    }, time * 1000);
});

RegisterNetEvent('infinity:restartParty');
on('infinity:restartParty', function() {
    resetInfinity()
});
