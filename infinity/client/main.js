var firstSpawn = true;

var lobby = null;
var teams = [];
var objectives = [];
var objectiveHeld = null;
var objectiveBlips = [];
var objectiveCollecting = null;
var objectiveTimeleft = 0;
var objectiveCapturing = null;
var rules = [];
var currentTeam = null;
var hqPos = null;
var partyPos = null;
var classes = [];
var currentClass = null;
var classMenus = [];
var messageScaleform = {
    ready: false,
    scaleform: null
};
var messageToDisplay = null;

var gameState = "";
var globalScore = [];

var gameConfig = {
    disableWanted: false,
    respawn: null,
    autoFill: false
};

var respawnButtonEnabled = false;

function resetInfinity() {

    for (var id in objectiveBlips) {
        TriggerEvent('infinity:deleteObjectiveBlip', id);
    }

    firstSpawn = true;

    lobby = null;
    teams = [];
    objectives = [];
    objectiveHeld = null;
    objectiveBlips = [];
    objectiveCollecting = null;
    objectiveTimeleft = 0;
    objectiveCapturing = null;
    rules = [];
    currentTeam = null;
    hqPos = null;
    partyPos = null;
    classes = [];
    currentClass = null;
    classMenus = [];
    messageScaleform = {
        ready: false,
        scaleform: null
    };
    messageToDisplay = null;

    gameState = "";
    globalScore = [];

    gameConfig = {
        disableWanted: false,
        respawn: null,
        autoFill: false
    };

    respawnButtonEnabled = false;


}

async function loadLobby() {
    while (lobby == null) {
        await Utils.delay(1);
    }
    lobby.idx = exports.spawnmanager.addSpawnPoint(lobby);
    exports.spawnmanager.spawnPlayer();
}

function changeTeam(teamIdentifier) {
    var canJoin = true;

    for (var identifier in teams) {
        var team = teams[identifier];

        if (team.identifier == teamIdentifier) {
            if (team.nbPlayers + 1 > team.maxPlayer && team.maxPlayer > 0) {
                canJoin = false;
            }
            break;
        }
    }

    if (!canJoin) {

        setTimeout(() => {
            openTeamMenu();
        }, 1000);
        return;
    }

    currentTeam = team;
    TriggerServerEvent('infinity:teamChanged', team.identifier);
}

function randomTeam() {
    var lessPlayerTeam = null;
    var lessTeams = [];

    for (var identifier in teams) {
        var team = teams[identifier];

        if (team != null && (lessPlayerTeam == null || team.nbPlayers <= lessPlayerTeam.nbPlayers) && (team.maxPlayer == 0 || team.nbPlayers < team.maxPlayer)) {
            lessPlayerTeam = team;
            lessTeams.push(team);
        }
    }

    if (lessTeams.length > 0) {
        var tmp = lessTeams.filter(t => t.nbPlayers <= lessPlayerTeam.nbPlayers);
        lessPlayerTeam = tmp.length > 1 ? Utils.selectRandom(tmp) : lessPlayerTeam;
    }

    if (lessPlayerTeam != null) {
        TriggerServerEvent('infinity:teamChanged', lessPlayerTeam.identifier);
    }
}

async function changeClass(teamClass) {
    var pedHash = GetHashKey(teamClass.model);

    if (IsModelValid(pedHash)) {
        RequestModel(pedHash);
        while (!HasModelLoaded(pedHash)) {
            await Utils.delay(1);
        }

        SetPlayerModel(PlayerId(), pedHash);
        SetPedDefaultComponentVariation(PlayerPedId());

        for (var i = 0; i < teamClass.weapons.length; i++) {
            var weapon = teamClass.weapons[i];
            var hash = GetHashKey(weapon.name);
            GiveWeaponToPed(GetPlayerPed(-1), hash, weapon.ammo, true, true);
        }
    }

    currentClass = teamClass;
}

function openTeamMenu() {
    var buttons = [];

    for (var identifier in teams) {
        buttons.push({
            text: teams[identifier].name + "  (" + teams[identifier].nbPlayers + (teams[identifier].maxPlayer > 0 ? ("/" + teams[identifier].maxPlayer) : "") + ")",
            action: changeTeam,
            param: teams[identifier].identifier,
            close: true
        });
    }

    buttons.push({
        text: "Auto fill",
        action: randomTeam,
        param: {},
        close: true
    });

    createMenu("Choose a team", buttons, true);
}

function openClassMenu(coords, radius) {
    var buttons = [];

    for (var identifier in classes) {
        if (classes[identifier].team == currentTeam) {
            buttons.push({
                text: classes[identifier].name,
                action: changeClass,
                param: classes[identifier],
                close: false
            });
        }
    }

    buttons.push({
        text: "Close",
        action: null,
        param: {},
        close: true
    });

    createMenu("Choose a class", buttons, true, coords, radius);
}

function playerDead() {
    if (objectiveHeld != null && objectives[objectiveHeld] != null) {
        var [playerX, playerY, playerZ] = GetEntityCoords(PlayerPedId());
        var objective = objectives[objectiveHeld];
        TriggerServerEvent('infinity:objectiveDropped', objectiveHeld, { x: playerX, y: playerY - 1.0, z: playerZ, heading: objective.pos.heading });
        objectiveHeld = null;
    }

    if (gameConfig.respawn != null) {

        if (gameConfig.respawn.type == 'always' && gameConfig.respawn.button) {
            if (gameConfig.respawn.delay != 0) {
                setTimeout(function () {
                    displayReadyInstruction("Respawn ");
                    respawnButtonEnabled = true;
                }, gameConfig.respawn.delay);
            } else {
                displayReadyInstruction("Respawn ");
                respawnButtonEnabled = true;
            }
        } else if (gameConfig.respawn.type == 'always' && !gameConfig.respawn.button) {
            if (gameConfig.respawn.delay != 0) {
                setTimeout(function () {
                    exports.spawnmanager.spawnPlayer();
                }, gameConfig.respawn.delay);
            } else {
                exports.spawnmanager.spawnPlayer();
            }
        }
    }
}

async function startCollecting(objective) {
    if (objective == null || objective.collect == null || objective.collect.params == null || objective.collect.params.time == null) {
        return;
    }

    objectiveCollecting = objective.identifier;

    for (var i = 0; i < objective.collect.params.time; i++) {
        objectiveTimeleft = objective.collect.params.time - i;
        await Utils.delay(1000);
        var coords = GetEntityCoords(GetPlayerPed(-1), true);
        var distance = Vdist(coords[0], coords[1], coords[2], objective.pos.x, objective.pos.y, objective.pos.z);
        if (distance > objective.collect.range || IsEntityDead(GetPlayerPed(-1))) {
            objectiveCollecting = null;
            return;
        }
    }

    objective.collected = true;
    objectives[objective.identifier] = objective;
    objectiveCollecting = null;
    TriggerServerEvent('infinity:objectiveCollected', objective.identifier);
}

setTick(() => {

    if (messageToDisplay != null) {
        drawString(0.5, 0.1, 0.0062 * messageToDisplay.length, 0.05, 0.8, messageToDisplay, 255, 255, 255, 255);
    }

    if (gameState == "playing") {

        if (objectiveCollecting != null && objectiveTimeleft > 0) {
            var text = "Capture in " + objectiveTimeleft + " secondes";
            drawString(0.5, 0.9, 0.0062 * text.length, 0.05, 0.8, text, 255, 255, 255, 255);
        }

        if (objectiveCapturing != null) {
            var objective = objectives[objectiveCapturing];
            if (objective != null) {
                var text = objective.captureCount + " / " + objective.collect.params.count;
                drawString(0.5, 0.9, 0.0062 * text.length, 0.05, 0.8, text, 255, 255, 255, 255);
            }
        }

        for (i in objectives) {
            var objective = objectives[i];

            if (objective == null || !objective.enabled || (objective.team != null && objective.team != currentTeam)) {
                continue;
            }

            if (objective.type == "object" || objective.type == "area") {
                var coords = GetEntityCoords(GetPlayerPed(-1), true);
                var distance = Vdist(coords[0], coords[1], coords[2], objective.pos.x, objective.pos.y, objective.pos.z);

                if (objective.marker != null && !objective.collected && distance < 50) {
                    DrawMarker(objective.marker.type, objective.pos.x, objective.pos.y, objective.pos.z, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                        objective.marker.scale, objective.marker.scale, 1.0, objective.marker.color.red, objective.marker.color.green,
                        objective.marker.color.blue, 255, false, true, 2, true, false, false, false);
                }

                if (objective.destinationMarker != null && objective.destinations.length > 0 && objective.collected && !objective.complete) {
                    for (var i = 0; i < objective.destinations.length; i++) {
                        var destination = objective.destinations[i];

                        if (destination.team == currentTeam) {
                            DrawMarker(objective.destinationMarker.type, destination.x, destination.y, destination.z - 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                                objective.destinationMarker.scale, objective.destinationMarker.scale, objective.destinationMarker.scale, objective.destinationMarker.color.red, objective.destinationMarker.color.green,
                                objective.destinationMarker.color.blue, 255, false, true, 2, true, false, false, false);
                            break;
                        }
                    }
                }

                if (objective.collect != null && !objective.collected && objectiveHeld == null && !IsEntityDead(GetPlayerPed(-1)) && distance <= objective.collect.range && objectiveCollecting != objective.identifier && objectiveCapturing == null) {
                    switch (objective.collect.action) {
                        case "auto":
                            objective.collected = true;
                            objectives[objective.identifier] = objective;
                            objectiveHeld = objective.identifier;
                            TriggerServerEvent('infinity:objectiveCollected', objective.identifier);
                            break;
                        case "timer":
                            startCollecting(objective);
                            break;
                        case "capture":
                            objectiveCapturing = objective.identifier;
                            TriggerServerEvent('infinity:playerEnterArea', objective.identifier);
                            break;
                        default:

                    }
                } else if (objectiveCapturing == objective.identifier && (IsEntityDead(GetPlayerPed(-1)) || distance > objective.collect.range)) {
                    objectiveCapturing = null;
                    TriggerServerEvent('infinity:playerExitArea', objective.identifier);
                }

                if (objective.destinations.length > 0 && objective.collected && !objective.complete) {
                    for (var i = 0; i < objective.destinations.length; i++) {
                        var destination = objective.destinations[i];

                        if (destination.team == currentTeam) {
                            distance = Vdist(coords[0], coords[1], coords[2], destination.x, destination.y, destination.z);

                            if (distance <= 2) {
                                objective.complete = true;
                                objectives[objective.identifier] = objective;
                                TriggerServerEvent('infinity:objectiveComplete', objective.identifier);
                                objectiveHeld = null;
                            }
                            break;
                        }
                    }
                }
            } else if (objective.type == "vehicle") {

                if (GetVehiclePedIsIn(GetPlayerPed(-1), false) == objective.objectId && !objective.collected && objectiveHeld == null && !IsEntityDead(GetPlayerPed(-1))) {
                    objective.collected = true;
                    objectives[objective.identifier] = objective;
                    objectiveHeld = objective.identifier;
                    TriggerServerEvent('infinity:objectiveCollected', objective.identifier);
                }

                if (objectiveHeld == objective.identifier) {
                    if (objective.destinationMarker != null && objective.destinations.length > 0 && objective.collected && !objective.complete) {
                        for (var i = 0; i < objective.destinations.length; i++) {
                            var destination = objective.destinations[i];

                            if (destination.team == currentTeam) {
                                DrawMarker(objective.destinationMarker.type, destination.x, destination.y, destination.z - 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                                    objective.destinationMarker.scale, objective.destinationMarker.scale, objective.destinationMarker.scale, objective.destinationMarker.color.red, objective.destinationMarker.color.green,
                                    objective.destinationMarker.color.blue, 255, false, true, 2, true, false, false, false);
                                break;
                            }
                        }
                    }

                    if (GetVehiclePedIsIn(GetPlayerPed(-1), false) != objective.objectId) {
                        var [playerX, playerY, playerZ] = GetEntityCoords(objective.objectId);
                        var heading = GetEntityHeading(objective.objectId);
                        var objective = objectives[objectiveHeld];
                        TriggerServerEvent('infinity:objectiveDropped', objectiveHeld, { x: playerX, y: playerY - 1.0, z: playerZ, heading: heading });
                        objectiveHeld = null;
                    } else {
                        var coords = GetEntityCoords(GetPlayerPed(-1), true);
                        for (var i = 0; i < objective.destinations.length; i++) {
                            var destination = objective.destinations[i];

                            if (destination.team == currentTeam) {
                                var distance = Vdist(coords[0], coords[1], coords[2], destination.x, destination.y, destination.z);

                                if (distance <= 3) {
                                    objective.complete = true;
                                    objectives[objective.identifier] = objective;
                                    TriggerServerEvent('infinity:objectiveComplete', objective.identifier);
                                    objectiveHeld = null;
                                }
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    if (gameState == "lobby" || gameState == "end") {
        DisableControlAction(0, 30, true);
        DisableControlAction(0, 31, true);
		DisableControlAction(0, 32, true);
		DisableControlAction(0, 33, true);
        DisableControlAction(0, 34, true);
        DisableControlAction(0, 35, true);
    }

    if (gameState == "lobby" || gameState == "preparing" || gameState == "ready" || gameState == "end") {
		DisableControlAction(0, 24, true);
        DisableControlAction(0, 25, true);
        DisableControlAction(0, 50, true);
        DisableControlAction(0, 68, true);
        DisableControlAction(0, 69, true);
        DisableControlAction(0, 70, true);
        DisableControlAction(0, 91, true);
        DisableControlAction(0, 92, true);
        DisableControlAction(0, 114, true);
        DisableControlAction(0, 121, true);
        DisableControlAction(0, 140, true);
        DisableControlAction(0, 141, true);
        DisableControlAction(0, 142, true);
        DisableControlAction(0, 257, true);
        DisableControlAction(0, 263, true);
        DisableControlAction(0, 264, true);
        DisableControlAction(0, 331, true);

        SetEntityInvincible(GetPlayerPed(-1), true);
        SetPlayerInvincible(GetPlayerPed(-1), true);
		SetPedCanRagdoll(GetPlayerPed(-1), false);
    } else {
        SetEntityInvincible(GetPlayerPed(-1), false);
        SetPlayerInvincible(GetPlayerPed(-1), false);
		SetPedCanRagdoll(GetPlayerPed(-1), true);

        for (var i = 0; i < 32; i++) {
            if (NetworkIsPlayerActive(i)) {
                SetCanAttackFriendly(GetPlayerPed(i), true, true);
                NetworkSetFriendlyFireOption(true);
            }
        }
    }

    if ((gameState == "preparing" || gameState == "ready") && hqPos != null) {
        var coords = GetEntityCoords(GetPlayerPed(-1), true);
        var distance = Vdist(coords[0], coords[1], coords[2], hqPos.x, hqPos.y, hqPos.z);

        if (distance > 50.0) {
            SetEntityCoords(GetPlayerPed(-1), hqPos.x, hqPos.y, hqPos.z, 1, 0, 0, 1);
        }
    }

    if (gameState == "preparing" || gameState == "ready") {
        if (IsControlJustReleased( 1, 288 ) && !IsPauseMenuActive()){
            if (gameState == "preparing") {
                gameState = "ready";
                displayReadyInstruction("To be unready press ");
                TriggerServerEvent('infinity:playerReady', true);
            } else {
                gameState = "preparing";
                displayReadyInstruction("To be ready press ");
                TriggerServerEvent('infinity:playerReady', false);
            }
        }

        for (var team in classMenus) {
            if (team == currentTeam) {
                var classMenu = classMenus[team];
                DrawMarker(classMenu.marker.type, classMenu.x, classMenu.y, classMenu.z, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                    classMenu.radius, classMenu.radius, classMenu.marker.scale, classMenu.marker.color.red, classMenu.marker.color.green,
                    classMenu.marker.color.blue, 255, false, true, 2, true, false, false, false);

                var coords = GetEntityCoords(GetPlayerPed(-1), true);
                var distance = Vdist(coords[0], coords[1], coords[2], classMenu.x, classMenu.y, classMenu.z);

                if (distance <= classMenu.radius) {
                    if (IsControlJustReleased( 1, 38 ) && !IsPauseMenuActive()){
                        openClassMenu({x: classMenu.x, y: classMenu.y, z: classMenu.z}, classMenu.radius);
                    }
                }
            }
        }
    }

    if (gameState == "playing") {
        if (IsControlPressed( 1, 48 ) && !IsPauseMenuActive()) {
            if (globalScore != null && globalScore.length > 0) {
                displayScore(globalScore);
            }
        }
    }

    if (gameConfig.disableWanted && GetPlayerWantedLevel(PlayerId()) != 0) {
        SetPlayerWantedLevel(PlayerId(), 0, false);
        SetPlayerWantedLevelNow(PlayerId(), false);
    }

    if (messageScaleform.ready) {
        DrawScaleformMovieFullscreen(messageScaleform.scaleform, 255, 255, 255, 255);
    }

    if (respawnButtonEnabled) {
        if (IsControlJustReleased( 1, 288 ) && !IsPauseMenuActive()){
            respawnButtonEnabled = false;
            exports.spawnmanager.spawnPlayer();
            messageScaleform.ready = false;
            messageScaleform.scaleform = null;
        }
    }
});
