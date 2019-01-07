/*
 * file: objective.js
 * author: fauconjona
 * description: objective class
**/

class Objective {
    constructor(identifier, pos, type, model, showBlip, enabled, team) {
        this.identifier = identifier;
        this.pos = pos;
        this.type = type;
        this.model = model;
        this.showBlip = showBlip;
        this.collect = {};
        this.collected = false;
        this.ownerId = null;
        this.destinations = [];
        this.marker = null;
        this.destinationMarker = null;
        this.objectId = null;
        this.complete = false;
        this.completedBy = null;
        this.destroy = false;

        this.showBlipDefault = showBlip;
        this.posDefault = pos;

        //startCapture
        this.teamCapturing = null;
        this.capturedBy = null;
        this.playersInArea = [];
        this.captureCount = 0;
        this.capturing = false;

        this.enabled = enabled;
        this.team = team;

        this.holdingThread = false;
        this.checkThread = false;
    }

    addDestination(destination) {
        this.destinations.push(destination);
    }

    enable(enabled) {
        if (this.enabled == enabled) {
            return;
        }

        this.enabled = enabled;

        if (this.enabled) {
            this.create(true);
        } else {
            this.clear();
        }
    }

    create(reset) {

        if (!this.enabled) {
            return;
        }

        if (reset) {
            this.complete = false;
            this.completedBy = null;
            this.collected = false;
            this.ownerId = null;
            this.showBlip = this.showBlipDefault;
            this.pos = this.posDefault;
            this.destroy = false;
        }

        var host = GetHostId();

        if (players[host] == null) {
            var host = Utils.selectRandom(players).identifier;
        }

        TriggerClientEvent('infinity:newObjective', -1, this);

        switch (this.type) {
            case "object":
                TriggerClientEvent('infinity:createObject', host, this.model, this.pos, true, this.identifier);
                break;
            case "vehicle":
                TriggerClientEvent('infinity:createVehicle', host, this.model, this.pos, true, this.identifier);
                break;
            case "ped":
                TriggerClientEvent('infinity:createPed', host, this.model, this.pos, true, this.identifier);
                break;
            default:

        }

        if (this.type == "area" && this.collect != null && this.collect.action == "capture") {
            this.holding();
        }

        if (this.type == "vehicle" || this.type == "ped") {
            this.checkAlive();
        }

    }

    clear() {

        switch (this.type) {
            case "vehicle":
                TriggerClientEvent('infinity:deleteVehicle', -1, this.objectId);
                break;
            case "object":
                TriggerClientEvent('infinity:deleteObject', -1, this.objectId);
                break;
            default:

        }

        TriggerClientEvent('infinity:updateObjective', -1, this);
    }

    collectedBy(player) {

        if (this.type == "area") {
            this.completeBy(player);
        }

        this.collected = true;
        this.ownerId = player.identifier;
        if (this.type != "vehicle" && this.type != "ped") {
            this.showBlip = false;
        }

        if (this.type == "ped") {
            TriggerClientEvent('infinity:entityFreeze', -1, this.objectId, false);
        }

        if (this.destinations.length == 0) {
            this.completeBy(player);
        }

        switch (this.type) {
            case "object":
                TriggerClientEvent('infinity:deleteObject', -1, this.objectId);
                break;
            default:

        }

        var collectEvents = events.filter(e => e.on == 'collect' && e.type == "objective" && e.data == this.identifier && (e.target == player.team || e.target == "player" || e.target == 'any'));

        for (var i = 0; i < collectEvents.length; i++) {
            if (collectEvents[i].target == "player") {
                collectEvents[i].triggered(player, player);
            } else {
                collectEvents[i].triggered(null, player);
            }
        }

        TriggerClientEvent('infinity:updateObjective', -1, this);
    }

    completeBy(player) {
        this.complete = true;
        this.completedBy = player.identifier;

        var completeEvents = events.filter(e => e.on == 'complete' && e.type == "objective" && e.data == this.identifier && (e.target == player.team || e.target == 'any'));

        if (this.type == "vehicle") {
            TriggerClientEvent('infinity:deleteVehicle', -1, this.objectId);
        } else if (this.type == "ped") {
            TriggerClientEvent('infinity:deletePed', -1, this.objectId);
        }

        for (var i = 0; i < completeEvents.length; i++) {
            completeEvents[i].triggered(player);
        }

        TriggerClientEvent('infinity:updateObjective', -1, this);
    }

    showDestination(player) {
        for (var i = 0; i < this.destinations.length; i++) {
            var destination = this.destinations[i];

            if (destination.team == player.team) {
                TriggerClientEvent('infinity:createObjectiveBlip', player.identifier, destination, this.identifier);
                break;
            }
        }
    }

    dropped() {
        this.collected = false;
        this.ownerId = null;
        this.showBlip = this.showBlipDefault;

        if (this.type == "object") {
            this.create(false);
        } else if (this.type == "vehicle") {
            TriggerClientEvent('infinity:newObjective', -1, this);
        } else if (this.type == "ped") {
            TriggerClientEvent('infinity:entityFreeze', -1, this.objectId, true);
        }
    }

    removePlayerInArea(player) {
        if (this.playersInArea[player.identifier] != null) {
            this.playersInArea[player.identifier] = null;
        }
    }

    addPlayerInArea(player) {
        if (this.playersInArea[player.identifier] == null) {
            this.playersInArea[player.identifier] = player;
        }

        if (!this.capturing) {
            this.startCapture();
        }
    }

    async startCapture() {
        if (this.capturing) {
            return;
        }

        if (this.collect == null || this.collect.params == null || this.collect.params.count == null) {
            console.log("Objective " + this.identifier + " error: Can't start capture because missing config");
            return;
        }

        if (this.collect.params.countPerPlayer == null) {
            this.collect.params.countPerPlayer = 1;
        }

        this.capturing = true;

        while (this != null && this.captureCount < this.collect.params.count) {
            var players = this.playersInArea.filter(p => p != null);
            if (players.length == 0) {
                break;
            }

            var countPerTeam = [];
            var maxCountTeam = null;
            var maxCount = 0

            for (var player in players) {
                var team = players[player].team;
                countPerTeam.push(team);
            }

            for (var team in teams) {
                if (team != null) {
                    var teamCount = countPerTeam.filter(c => c == team).length * this.collect.params.countPerPlayer;
                    if (teamCount > maxCount) {
                        maxCountTeam = team;
                        maxCount = teamCount;
                    }
                }
            }

            if (maxCountTeam == null) {
                break;
            }

            if (this.teamCapturing == null) {
                this.teamCapturing = maxCountTeam;
                this.captureCount = maxCount;
            } else if (this.teamCapturing == maxCountTeam) {
                this.captureCount = this.captureCount + maxCount;
            } else {
                var otherCount = countPerTeam.filter(c => (c != null && c == this.teamCapturing)).length * this.collect.params.countPerPlayer;
                this.captureCount = this.captureCount - (maxCount - otherCount);
            }

            if (this.captureCount < 0) {
                this.captureCount = 0;
                this.teamCapturing = null;
                this.capturedBy = null;
            } else if (this.captureCount >= this.collect.params.count) {
                this.capturedBy = maxCountTeam;
                break;
            }

            TriggerClientEvent("infinity:updateObjective", -1, this);

            await Utils.delay(1000);
        }

        if (this.captureCount > this.collect.params.count) {
            this.captureCount = this.collect.params.count;
        }

        if (this.capturedBy != null) {
            var completeEvents = events.filter(e => e.on == 'captured' && e.type == "objective" && e.data == this.identifier && e.target == this.capturedBy);

            for (var i = 0; i < completeEvents.length; i++) {
                completeEvents[i].triggered(null);
            }
        }

        TriggerClientEvent('infinity:updateObjective', -1, this);

        this.capturing = false;
    }

    async holding() {
        if (this.holdingThread) {
            return;
        }
        this.holdingThread = true;
        while (this != null && !this.complete) {
            await Utils.delay(1000);

            if (this.capturedBy != null) {
                var holdingEvents = events.filter(e => e.on == 'holding' && e.type == "objective" && e.data == this.identifier && e.target == this.capturedBy);

                for (var i = 0; i < holdingEvents.length; i++) {
                    holdingEvents[i].triggered(null);
                }
            }
        }
        this.holdingThread = false;
    }

    async checkAlive() {
        if (this.checkThread) {
            return;
        }
        this.checkThread = true;
        while (this != null && !this.destroy) {
            await Utils.delay(1000);

            var host = GetHostId();

            TriggerClientEvent('infinity:checkAlive', host, this.objectId, this.identifier);
        }
        this.checkThread = false;
    }
}
