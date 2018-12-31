/*
 * file: menu.js
 * author: fauconjona
 * description: allow to create menus
**/

var buttonSelected = 0;
var menuTitle = "";
var menuButtons = [];
var menuIsOpen = false;
var menuCoords = null;
var menuRadius = 1.0;

function createMenu(title, buttons, open, coords, radius) {
    menuTitle = title;
    menuButtons = buttons;
    menuIsOpen = open;
    menuCoords = coords;
    menuRadius = radius;
}

function closeMenu() {
    buttonSelected = 0;
    menuTitle = "";
    menuButtons = [];
    menuIsOpen = false;
}

function drawMenu() {
    var height = 0.05 * menuButtons.length + 0.02;
    var startY = 0.5 - height / 2 + 0.035;

    //draw Title
    if (menuTitle.length > 0) {
        drawString(0.5, startY - 0.07, 0.0095 * menuTitle.length, 0.05, 1.0, menuTitle, 255, 255, 255, 255);
    }

    //draw background
    DrawRect(0.5, 0.5, 0.334, height, 50, 50, 50, 220);

    for (var i = 0; i < menuButtons.length; i++) {
        var button = menuButtons[i];

        if (buttonSelected == i) {
            DrawRect(0.5, startY + (0.05 * i), 0.32, 0.05, 200, 200, 200, 200);
            drawString(0.5, startY + (0.05 * i) - 0.01, 0.0062 * button.text.length, 0.05, 0.8, button.text, 0, 0, 0, 255);
        } else {
            drawString(0.5, startY + (0.05 * i) - 0.01, 0.0062 * button.text.length, 0.05, 0.8, button.text, 255, 255, 255, 255);
        }
    }
}

function drawString(x, y, width, height, scale, text, r, g, b, a) {
    SetTextFont(4);
    SetTextProportional(0);
    SetTextScale(scale, scale);
    SetTextColour(r, g, b, a);
    SetTextEdge(1, 0, 0, 0, 255);
    SetTextEntry("STRING");
    AddTextComponentString(text);
    DrawText(x - width/2, y - height/2 + 0.005);
}

setTick(() => {
    if (menuIsOpen) {
        if (IsControlJustReleased( 1, 172 ) && !IsPauseMenuActive()){
            buttonSelected--;
        }

        if (IsControlJustReleased( 1, 173 ) && !IsPauseMenuActive()){
            buttonSelected++;
        }

        buttonSelected = buttonSelected % menuButtons.length;

        if (buttonSelected < 0) {
            buttonSelected = menuButtons.length - 1;
        }

        if (IsControlJustReleased( 1, 176 ) && !IsPauseMenuActive()){
            var button = menuButtons[buttonSelected];
            if (button.action) {
                button.action(button.param);
            }
            if (button.close) {
                closeMenu();
            }
        }

        if (menuCoords != null) {
            var coords = GetEntityCoords(GetPlayerPed(-1), true);
            var distance = Vdist(coords[0], coords[1], coords[2], menuCoords.x, menuCoords.y, menuCoords.z);

            if (distance > menuRadius) {
                closeMenu();
            }
        }

        drawMenu();
    }
});
