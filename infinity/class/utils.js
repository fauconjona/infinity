/*
 * file: utils.js
 * author: fauconjona
 * description: Utils static class, contain usefull methods
**/

class Utils {
    static findInObjectListByIdentifier(array, identifier) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].identifier == identifier){
                return array[i];
            }
        }
        return null;
    }

    static deleteInObjectListByIdentifier(array, identifier) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].identifier == identifier){
                array.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static selectRandom(array) {
        return array[Math.floor(Math.random()*array.length)];
    }

    static print(txt) {
        console.log("[Infinity]" + txt);
    }

    static error(txt) {
        console.log("^1[Infinity]" + txt + "^7");
    }

    static replaceKeys(text, player, team) {
        if (player != null) {
            text = text.replace('%playerName%', player.name);
        }

        if (team != null) {
            text = text.replace('%teamName', team.name);
        }

        return text;
    }
}
