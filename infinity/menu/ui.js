/*
 * file: events.js
 * author: fauconjona
 * description: Some ui functions like scaleforms
**/

function scaleformAddButton(text) {
    BeginTextCommandScaleformString("STRING");
    AddTextComponentScaleform(text);
    EndTextCommandScaleformString();
}

function getButton(control) {
    N_0xe83a3e3557a56640(control);
}

async function displayReadyInstruction(text) {
    var scaleform = RequestScaleformMovie("instructional_buttons");

    while (!HasScaleformMovieLoaded(scaleform)) {
        await Utils.delay(0);
    }

    PushScaleformMovieFunction(scaleform, "CLEAR_ALL");
    PopScaleformMovieFunctionVoid();

    PushScaleformMovieFunction(scaleform, "SET_CLEAR_SPACE");
    PushScaleformMovieFunctionParameterInt(200);
    PopScaleformMovieFunctionVoid();

    PushScaleformMovieFunction(scaleform, "SET_DATA_SLOT");
    PushScaleformMovieFunctionParameterInt(0);
    getButton(GetControlInstructionalButton(2, 288, true));
    scaleformAddButton(text);
    PopScaleformMovieFunctionVoid();

    PushScaleformMovieFunction(scaleform, "DRAW_INSTRUCTIONAL_BUTTONS");
    PopScaleformMovieFunctionVoid();

    PushScaleformMovieFunction(scaleform, "SET_BACKGROUND_COLOUR");
    PushScaleformMovieFunctionParameterInt(0);
    PushScaleformMovieFunctionParameterInt(0);
    PushScaleformMovieFunctionParameterInt(0);
    PushScaleformMovieFunctionParameterInt(80);
    PopScaleformMovieFunctionVoid();

    messageScaleform.ready = true;
    messageScaleform.scaleform = scaleform;
}

async function displayWinMessage(title, text, duration) {
    var scaleform = RequestScaleformMovie('mp_big_message_freemode');

    while (!HasScaleformMovieLoaded(scaleform)) {
        await Utils.delay(0);
    }

    BeginScaleformMovieMethod(scaleform, "SHOW_SHARD_WASTED_MP_MESSAGE");
    PushScaleformMovieMethodParameterString(title);
    PushScaleformMovieMethodParameterString(text);
    PushScaleformMovieMethodParameterInt(5);
    EndScaleformMovieMethod();

    messageScaleform.scaleform = scaleform;
    messageScaleform.ready = true;

    await Utils.delay(duration);

    messageScaleform.ready = false;
    messageScaleform.scaleform = null;
}

async function displayCountdown(timer) {
    var scaleform = RequestScaleformMovie('countdown');

    while (!HasScaleformMovieLoaded(scaleform)) {
        await Utils.delay(0);
    }

    for (var i = timer; i > 0; i--) {
        BeginScaleformMovieMethod(scaleform, "SET_MESSAGE");
        PushScaleformMovieMethodParameterString(i.toString());
        PushScaleformMovieMethodParameterInt(255);
        PushScaleformMovieMethodParameterInt(165);
        PushScaleformMovieMethodParameterInt(0);
        PushScaleformMovieMethodParameterBool(true);
        EndScaleformMovieMethod();
        PlaySound(-1, "3_2_1", "HUD_MINI_GAME_SOUNDSET", 0, 0, 1);
        messageScaleform.scaleform = scaleform;
        messageScaleform.ready = true;
        await Utils.delay(1000);
    }

    BeginScaleformMovieMethod(scaleform, "SET_MESSAGE");
    PushScaleformMovieMethodParameterString("Go");
    PushScaleformMovieMethodParameterInt(255);
    PushScaleformMovieMethodParameterInt(255);
    PushScaleformMovieMethodParameterInt(255);
    PushScaleformMovieMethodParameterBool(true);
    EndScaleformMovieMethod();
    PlaySound(-1, "3_2_1", "HUD_MINI_GAME_SOUNDSET", 1, 0, 1);
    messageScaleform.scaleform = scaleform;
    messageScaleform.ready = true;
    await Utils.delay(1000);

    messageScaleform.ready = false;
    messageScaleform.scaleform = null;
}

async function displaySpectatorOverlay() {
    var scaleform = RequestScaleformMovie('mp_spectator_overlay');

    while (!HasScaleformMovieLoaded(scaleform)) {
        await Utils.delay(0);
    }

    messageScaleform.scaleform = scaleform;
    messageScaleform.ready = true;
}

function scoreToString(score) {
    return score + " pts";
}

function displayScore(score) {
    var height = score.length * 0.04;
    var startY = 0;
    var offset = 0;

    for (var i = 0; i < score.length; i++) {
        height = height + score[i].players.length * 0.03;
    }

    startY =  0.5 - height / 2 + 0.035;

    DrawRect(0.5, 0.5, 0.334, height, 50, 50, 50, 220);

    for (var i = 0; i < score.length; i++) {
        var team = score[i];

        DrawRect(0.5, startY + (0.04 * i + 0.03 * offset) - 0.015, 0.334, 0.04, 10, 10, 10, 200);
        drawString(0.4, startY + (0.04 * i + 0.03 * offset) - 0.025, 0.004875 * team.name.length, 0.03, 0.6, team.name, 220, 220, 220, 255);
        drawString(0.6 - 0.004875 * scoreToString(team.score).length, startY + (0.04 * i + 0.03 * offset) - 0.025, 0.004875 * scoreToString(team.score).length, 0.03, 0.6, scoreToString(team.score), 220, 220, 220, 255);
        for (var j = 0; j < team.players.length; j++) {
            var player = team.players[j];
            offset++;
            drawString(0.45, startY + (0.04 * i + 0.03 * offset) - 0.018, 0.0040625 * player.name.length, 0.03, 0.5, player.name, 0, 0, 0, 255);
            drawString(0.6 - 0.0040625 * scoreToString(player.score).length, startY + (0.04 * i + 0.03 * offset) - 0.018, 0.0040625 * scoreToString(player.score).length, 0.03, 0.5, scoreToString(player.score), 0, 0, 0, 255);
        }
    }
}
