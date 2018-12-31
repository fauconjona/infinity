/*
 * file: player.js
 * author: fauconjona
 * description: player class
**/

class Player {
    constructor(identifier, name, team) {
        this.identifier = identifier;
        this.name = name;
        this.team = team; //team identifier
        this.score = 0;
        this.ready = false;
        this.alive = true;
        this.win = false;
        this.lose = false;

        TriggerClientEvent('infinity:newTeam', this.identifier, this.team);
    }

    setTeam(team) {
        this.team = team;
    }

    setScore(score) {
        this.score = score;
    }

    addScore(score) {
        this.score += score;

        for (var identifier in teams) {
            var team = teams[identifier];

            if (team != null && this.team == identifier) {
                team.addScore(score);
                teams[identifier] = team;
            }
        }

        var scoreEvents = events.filter(e => e.on == 'haveScore');

        for (var i = 0; i < scoreEvents.length; i++) {
            var event = scoreEvents[i];
            if (event.target == 'player') {
                event.triggered(this);
            }
        }

        return this.score;
    }

    killed() {
        this.alive = false;

        var killEvents = events.filter(e => e.on == 'killed');

        for (var i = 0; i < killEvents.length; i++) {
            var event = killEvents[i];
            if (event.target == 'player') {
                event.triggered(killer);
            }
        }
    }
}
