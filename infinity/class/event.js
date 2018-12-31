/*
 * file: event.js
 * author: fauconjona
 * description: event class
**/

class Event {
    constructor(type, data, on, target, trigger, params) {
        this.type = type;
        this.data = data;
        this.on = on;
        this.target = target;
        this.trigger = trigger;
        this.params = params;
    }

    check() {
        if (this.type == "team" && this.on == "allTeamDead") {

            if (teams[this.target] == null)
                return;

            var playerDeads = players.filter(p => (p != null && p.team == this.target && !p.alive)).length;
            var playerCount = players.filter(p => (p != null && p.team == this.target)).length;

            if (playerDeads > 0 && playerDeads == playerCount) {
                this.triggered(null);
            }
        } else if (this.type == "team" && this.on == "haveScore" && this.params != null && this.params.value != null) {

            for (var identifier in teams) {
                var team = teams[identifier];

                if (team != null && team.identifier == this.target && team.score >= this.params.value) {
                    this.triggered(null);
                    break;
                }
            }
        } else if (this.type == "objective" && this.on == "hold") {

            var objective = objectives[this.target];
            if (objective != null && objective.capturedBy != null) {

            }
        }
    }

    triggered(player) {
        switch (this.trigger) {
            case 'win':
                if (player != null) {
                    teamWin(player.identifier);
                } else {
                    teamWin(this.target);
                }
                break;
            case 'lose':
                if (player != null) {
                    teamLose(player.identifier);
                } else {
                    teamLose(this.target);
                }
                break;
            case 'addScore':
                if (this.params != null && this.params.value != null) {
                    if (this.target == 'player') {
                        if (player != null) {
                            addPlayerScore(player.identifier, this.params.value);
                        }
                    } else {
                        addTeamScore(this.target, this.params.value);
                    }
                }
                break;
            case 'createObjective':
                if (this.params != null && this.params.identifier != null) {
                    var objective = objectives[this.params.identifier];
                    if (objective) {
                        objective.create(true);
                    }
                }
                break;
            case 'setRule':
                if (this.params != null && this.params.name != null && this.params.value != null) {
                    if (this.target == 'player' && player != null) {
                        TriggerClientEvent('infinity:setRule', player.identifier, this.params.name, this.params.value);
                    } else if (this.target == 'server') {
                        gameConfig[this.params.name] = this.params.value;
                    } else if (teams[this.target] != null) {
                        var eventPlayers = players.filter(p => p != null && p.team == this.target);
                        for (var i in eventPlayers) {
                            TriggerClientEvent('infinity:setRule', eventPlayers[i].identifier, this.params.name, this.params.value);
                        }
                    } else if (this.target == 'any') {
                        TriggerClientEvent('infinity:setRule', -1, this.params.name, this.params.value);
                    }
                }
                break;
            case 'resetObjective':
                if (this.params != null && this.params.identifier != null) {
                    var objective = objectives[this.params.identifier];
                    if (objective) {
                        objective.create(true);
                    }
                }
                break;
            case 'enableObjective':
                if (this.params != null && this.params.identifier != null) {
                    var objective = objectives[this.params.identifier];
                    if (objective) {
                        objective.enable(true);
                    }
                }
                break;
            case 'disableObjective':
                if (this.params != null && this.params.identifier != null) {
                    var objective = objectives[this.params.identifier];
                    if (objective) {
                        objective.enable(false);
                    }
                }
                break;
            case 'kill':
                if (player != null) {
                    TriggerClientEvent('infinity:kill', player.identifier);
                } else {
                    var team = teams[this.target];
                    if (team != null) {
                        var playerToRevive = players.filter(p => (p != null && p.team == team.identifier));
                        for (var identifier in playerToRevive) {
                            var p = playerToRevive[identifier];
                            TriggerClientEvent('infinity:kill', p.identifier);
                        }
                    }
                }
                break;
            case 'createVehicle':
                if (this.params != null && this.params.model != null && this.params.pos != null) {
                    var host = GetHostId();
                    TriggerClientEvent('infinity:createVehicle', host, this.params.model, this.params.pos, true, null);
                }
                break;
            case 'changeClass':
                if (player != null && this.params != null && this.params.class != null) {
                    TriggerClientEvent('infinity:changeClass', player.identifier, this.params.class);
                }
                break;
            case 'revive':
                if (player != null) {
                    TriggerClientEvent('infinity:revive', player.identifier);
                } else {
                    var team = teams[this.target];
                    if (team != null) {
                        var playerToRevive = players.filter(p => (p != null && p.team == team.identifier));
                        for (var identifier in playerToRevive) {
                            var p = playerToRevive[identifier];
                            TriggerClientEvent('infinity:revive', p.identifier);
                        }
                    }
                }
                break;
            case 'respawn':
                if (player != null) {
                    TriggerClientEvent('infinity:respawn', player.identifier);
                } else {
                    var team = teams[this.target];
                    if (team != null) {
                        var playerToRevive = players.filter(p => (p != null && p.team == team.identifier));
                        for (var identifier in playerToRevive) {
                            var p = playerToRevive[identifier];
                            TriggerClientEvent('infinity:respawn', p.identifier);
                        }
                    }
                }
                break;
            case 'setWanted':
                if (player != null && this.params != null && this.params.level != null) {
                    TriggerClientEvent('infinity:setWanted', player.identifier, this.params.level);
                } else if (this.params != null && this.params.level != null && player == null) {
                    var team = teams[this.target];
                    if (team != null) {
                        var playerToRevive = players.filter(p => (p != null && p.team == team.identifier));
                        for (var identifier in playerToRevive) {
                            var p = playerToRevive[identifier];
                            TriggerClientEvent('infinity:setWanted', p.identifier, this.params.level);
                        }
                    }
                }
                break;
            case 'displayMessage':
                if (player != null && this.params != null && this.params.text != null && this.params.time != null) {
                    TriggerClientEvent('infinity:displayMessage', player.identifier, this.params.text, this.params.time);
                } else if (player == null && this.params != null && this.params.text != null && this.params.time != null) {
                    var team = teams[this.target];
                    if (team != null) {
                        var playerToRevive = players.filter(p => (p != null && p.team == team.identifier));
                        for (var identifier in playerToRevive) {
                            var p = playerToRevive[identifier];
                            TriggerClientEvent('infinity:displayMessage', p.identifier, this.params.text, this.params.time);
                        }
                    } else if (this.target == "any") {
                        for (var identifier in players) {
                            var p = players[identifier];
                            if (p != null) {
                                TriggerClientEvent('infinity:displayMessage', p.identifier, this.params.text, this.params.time);
                            }
                        }
                    }
                }
                break;
            default:

        }
    }

}
