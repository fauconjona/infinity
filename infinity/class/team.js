/*
 * file: team.js
 * author: fauconjona
 * description: team class
**/

class Team {
    constructor(identifier, name, minPlayer, maxPlayer) {
        this.identifier = identifier;
        this.name = name;
        this.minPlayer = minPlayer;
        this.maxPlayer = maxPlayer;
        this.score = 0;
        this.spawn = null;
        this.HQ = null;
        this.win = false;
        this.lose = false;
    }

    setScore(score) {
        this.score = score;
    }

    addScore(score) {
        this.score += score;

        return this.score;
    }

    setSpawn(pos) {
        this.spawn = pos;
    }

    setHQ(pos) {
        this.HQ = pos;
    }
}
