/*
 * file: main.js
 * author: fauconjona
 * description: handle game cycle
**/

var teams = [];
var objectives = [];
var players = [];
var events = [];
var gameState = 'lobby';
var timerStarted = false;
var missionEntities = [];

var gameConfig = {
    minPlayer: 1,
    minPlayerReady: 1,
    forceStart: 60000,
    gameStartDelay: 10000,
    noTeam: false
};

function resetInfinity() {
    teams = [];
    objectives = [];
    players = [];
    events = [];
    gameState = 'lobby';
    timerStarted = false;
    missionEntities = [];

    gameConfig = {
        minPlayer: 1,
        minPlayerReady: 1,
        forceStart: 60000,
        gameStartDelay: 10000,
        noTeam: false
    };
}

//map init

function addTeam(identifier, name, minPlayer, maxPlayer) {
    var newTeam = new Team(identifier, name, minPlayer, maxPlayer);
    teams[identifier] = newTeam;
    return newTeam;
}

function addPlayer(identifier, team) {
    var playerName = GetPlayerName(identifier);
    var newPlayer = new Player(identifier, playerName, team);
    players[identifier] = newPlayer;
    return newPlayer;
}

function addObjective(identifier, options) {
    var pos = {
        x: options.x,
        y: options.y,
        z: options.z,
        heading: options.heading
    }
    var newObjective = new Objective(identifier, pos, options.type, options.model, options.showBlip, options.disabled != null ? !options.disabled : true, options.team);
    objectives[identifier] = newObjective;
    return newObjective;
}

function addEvent(type, target, options, data) {
    var newEvent = new Event(type, data, options.on, target, options.trigger, options.params);

    if (events.find(e => JSON.stringify(e) == JSON.stringify(newEvent)) != undefined)
        return;

    events.push(newEvent);

    return newEvent;
}

function createObjectives() {
    for (var i in objectives) {
        if (objectives[i].enabled) {
            objectives[i].create(false);
        }
    }
}

function forceStart() {
    timerStarted = true;
    setTimeout(function () {
        timerStarted = false;
        if (canStartParty() && gameState == "lobby") {
            startParty(gameConfig.gameStartDelay);
        } else if (!canStartParty() && gameState == "lobby") {
            forceStart();
        }
    }, gameConfig.forceStart);
}

function startParty(ms) {
    TriggerClientEvent('infinity:showNotification', -1, "Party start in ~r~" + Math.round(ms / 1000) + "~w~ sec");

    setTimeout(function () {
        for (i in players) {
            var player = players[i];
            var team = teams[player.team];
            emitNet('infinity:startParty', player.identifier, team.spawn);
        }

        gameState = "playing";

        createObjectives();
        sendScore();

        var startEvents = events.filter(e => (e != null && e.on == "partyStarted"));

        for (var i = 0; i < startEvents.length; i++) {
            var e = startEvents[i];
            e.triggered(null);
        }
    }, ms);
}

function teamWin(teamIdentifier) {
    gameState = "end";

    if (teams[teamIdentifier] != null) {
        var team = teams[teamIdentifier];

        for (var identifier in players) {
            var player = players[identifier];

            if (player.team == teamIdentifier) {
                TriggerClientEvent('infinity:winMessage', player.identifier, "~g~SUCCESS", team.name + " win", 10000);
            } else {
                TriggerClientEvent('infinity:winMessage', player.identifier, "~r~FAILED", team.name + " win", 10000);
            }
        }
    } else if (players[teamIdentifier] != null) {
        var winner = players[teamIdentifier];

        for (var identifier in players) {
            var player = players[identifier];

            if (player.identifier == teamIdentifier) {
                TriggerClientEvent('infinity:winMessage', player.identifier, "~g~SUCCESS", winner.name + " win", 10000);
            } else {
                TriggerClientEvent('infinity:winMessage', player.identifier, "~r~FAILED", winner.name + " win", 10000);
            }
        }
    }

    for (var i in missionEntities) {
        TriggerClientEvent('infinity:deleteEntity', -1, missionEntities[i]);
    }

    setTimeout(() => {
        resetInfinity();
        TriggerClientEvent("infinity:restartParty", -1);
    }, 9000);

    setTimeout(function () {
        TriggerEvent("mapLoader:loadNewMap");
    }, 10000);
}

function teamLose(teamIdentifier) {
    if (teams[teamIdentifier] != null) {
        var team = teams[teamIdentifier];

        if (team != null) {
            team.lose = true;
        }
    } else if (players[teamIdentifier] != null) {
        var player = players[teamIdentifier];

        if (player != null) {
            player.lose = true;
        }
    }
}

function equality() {
    gameState = "end";

    for (var identifier in players) {
        TriggerClientEvent('infinity:winMessage', players[identifier].identifier, "~r~FAILED", "Equality", 10000);
    }

    for (var i in missionEntities) {
        TriggerClientEvent('infinity:deleteEntity', -1, missionEntities[i]);
    }

    setTimeout(() => {
        resetInfinity();
        TriggerClientEvent("infinity:restartParty", -1);
    }, 9000);

    setTimeout(function () {
        TriggerEvent("mapLoader:loadNewMap");
    }, 10000);
}

function sendScore() {
    var globalScore = [];

    for (var idTeam in teams)    {
        var team = teams[idTeam];
        if (team) {
            var teamScore = {
                identifier: team.identifier,
                name: team.name,
                score: team.score,
                players: []
            }

            for (var idPlayer in players) {
                var player = players[idPlayer];
                if (player && player.team == team.identifier) {
                    teamScore.players.push({
                        name: player.name,
                        score: player.score
                    });
                }
            }
            globalScore.push(teamScore);
        }
    }

    TriggerClientEvent("infinity:updateScore", -1, globalScore);
}

function addTeamScore(identifier, score) {
    var team = teams[identifier];

    if (team) {
        team.addScore(score);
    }

    teams[identifier] = team;

    sendScore();
}

function addPlayerScore(identifier, score) {
    var player = players[identifier];

    if (player) {
        player.addScore(score);
    }

    players[identifier] = player;

    sendScore();
}

function canStartParty() {
    var canStart = players.filter(p => p != null).length >= gameConfig.minPlayer;

    if (!canStart) {
        return canStart;
    }

    for (var identifier in teams) {
        var team = teams[identifier];
        var nbPlayers = players.filter(p => (p != null && p.team == team.identifier)).length

        if (nbPlayers < team.minPlayer) {
            canStart = false;
            break;
        }
    }

    return canStart;
}

setTick(() => {
    if (gameState == 'lobby') {
        var readyCount = players.filter(p => p != null && p.ready).length;

        if (readyCount >= gameConfig.minPlayerReady && canStartParty()) {
            gameState = "starting";
            startParty(gameConfig.gameStartDelay);
        }
    }

    if (gameState == 'playing') {
        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            event.check();
        }

        if (!gameConfig.noTeam) {
            var teamWinners = [];
            var isEquality = true;

            for (var identifier in teams) {
                var t = teams[identifier];

                if (t != null && !t.lose) {
                    teamWinners.push(t);
                    isEquality = false;
                }
            }

            if (teamWinners.length == 1) {
                teamWinners[0].win = true;
                teamWin(teamWinners[0].identifier);
            } else if (isEquality) {
                equality();
            }
        } else {
            var playerWinners = [];
            var isEquality = true;

            for (var identifier in players) {
                var p = players[identifier];

                if (p != null && !p.lose) {
                    playerWinners.push(p);
                    isEquality = false;
                }
            }

            if (playerWinners.length == 1) {
                playerWinners[0].win = true;
                teamWin(playerWinners[0].identifier);
            } else if (isEquality) {
                equality();
            }
        }
    }
});

setTick(() => {
    var s_players = [];

    for (var pidx = 0; pidx < GetNumPlayerIndices(); pidx++) {
        s_players.push(GetPlayerFromIndex(pidx));
    }

    for (var identifier in players) {
        var player = players[identifier];
        if (player != null && s_players.indexOf(identifier) == -1) {
            delete players[identifier];
        }
    }

    if (s_players.length == 0 && gameState != "lobby") {
        resetInfinity();
        setTimeout(() => {
            TriggerEvent("mapLoader:reloadMap");
        }, 500);
    }
});

RegisterCommand('startParty', function(source, args, raw) {
    startParty(gameConfig.gameStartDelay);
}, true);

RegisterCommand('restartParty', function(source, args, raw) {

    for (var i in missionEntities) {
        TriggerClientEvent('infinity:deleteEntity', -1, missionEntities[i]);
    }

    setTimeout(() => {
        resetInfinity();
        TriggerClientEvent("infinity:restartParty", -1);
    }, 900);

    setTimeout(() => {
        TriggerEvent("mapLoader:loadNewMap");
    }, 1000);
}, true);

RegisterCommand('startSpectate', function(source, args, raw) {
    TriggerClientEvent('infinity:startSpectating', source);
}, true);

RegisterCommand('stopSpectate', function(source, args, raw) {
    TriggerClientEvent('infinity:stopSpectating', source);
}, true);

RegisterCommand('deleteObjectiveObject', function(source, args, raw) {
    if (args.length == 0) {
        console.log("Error: need an objective identifier");
        return;
    }

    var objective = objectives[args[0]];

    if (objective != null) {
        TriggerClientEvent('infinity:deleteEntity', -1, objective.objectId);
    } else {
        console.log("Error: invalid identifier");
    }
}, true);
