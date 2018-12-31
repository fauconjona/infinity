resource_type 'gametype' { name = 'Infinity Framework' }

dependencies {
    "spawnmanager",
    "mapmanager"
}

client_scripts {
    'client/main.js',
    'client/events.js',
    'class/utils.js',
    'class/objective.js',
    'class/event.js',
    'menu/menu.js',
    'menu/ui.js'
}
server_scripts {
    'server/main.js',
    'server/events.js',
    'class/player.js',
    'class/team.js',
    'class/objective.js',
    'class/utils.js',
    'class/event.js'
}
