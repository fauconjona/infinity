addLobby 'mp_m_freemode_01' { x = -802.311, y = 175.056, z = 72.8446 }

--Teams

addTeam 'teamA' { name = 'Team A', minPlayer = 1, maxPlayer = 16 }
addTeam 'teamB' { name = 'Team B', minPlayer = 1, maxPlayer = 16 }

addTeamHeadQuarter 'teamA' { x = -970.25, y = -3002.77, z = 13.95, radius = 5.0 }
addTeamHeadQuarter 'teamB' { x = 1730.63, y = 3310.0, z = 41.22, radius = 5.0 }

addTeamSpawn 'teamA' { x = -219.81, y = 3641.98, z = 51.75, radius = 5.0 }
addTeamSpawn 'teamB' { x = 64.53, y = 3478.8, z = 42.03, radius = 5.0 }

--Rules

setGameConfig 'minPlayer' { value = 2 }
setGameConfig 'minPlayerReady' { value = 2 }
setGameConfig 'forceStart' { value = 60 } --secondes
setGameConfig 'gameStartDelay' { value = 10 } --secondes

addTeamRule 'teamA' { name = 'disableWanted' }
addTeamRule 'teamB' { name = 'disableWanted' }

addTeamRule 'teamA' { name = 'respawn', type = 'always', delay = 8, button = true } --secondes
addTeamRule 'teamB' { name = 'respawn', type = 'always', delay = 8, button = true } --secondes

--Objectives

addObjective 'objective' { x = 73.32, y = 3710.9, z = 38.75, heading = 72.6, type = 'area', showBlip = true }

addObjectiveCollect 'objective' { action = 'capture', range = 10.0, params = { count = 30, countPerPlayer = 1 } }

addObjectiveMarker 'objective' { type = 1, scale = 20.0, color = { red = 0, green = 0, blue = 200 } }

--Win and Lose

addObjectiveEvent 'objective' { on = 'holding', trigger = 'addScore', target = 'teamA', params = { value = 10 } }
addObjectiveEvent 'objective' { on = 'holding', trigger = 'addScore', target = 'teamB', params = { value = 10 } }

addTeamEvent 'teamA' { on = 'haveScore', trigger = 'win', params = { value = 3000 } }
addTeamEvent 'teamB' { on = 'haveScore', trigger = 'win', params = { value = 3000 } }

addEvent 'any' { on = "partyStarted", trigger = 'displayMessage', params = { text = 'Capture the objective and hold it until you have 5000 points', time = 10 } }

--Classes

addTeamClass 'teamA' {
    identifier = "teamAassault",
    name = "Assault",
    model = "g_m_y_famdnf_01",
    weapons = {
        {
            name = "WEAPON_CARBINERIFLE",
            ammo = 300
        },
        {
            name = "WEAPON_PISTOL",
            ammo = 90
        },
        {
            name = "WEAPON_PUMPSHOTGUN",
            ammo = 60
        }
    },
    default = true
}

addTeamClass 'teamA' {
    identifier = "teamAsniper",
    name = "Sniper",
    model = "g_m_y_famfor_01",
    weapons = {
        {
            name = "WEAPON_SNIPERRIFLE",
            ammo = 90
        },
        {
            name = "WEAPON_PISTOL",
            ammo = 90
        },
        {
            name = "WEAPON_ASSAULTSMG",
            ammo = 280
        }
    }
}

addTeamClass 'teamB' {
    identifier = "teamBassault",
    name = "Assault",
    model = "g_m_y_ballaeast_01",
    weapons = {
        {
            name = "WEAPON_ASSAULTRIFLE",
            ammo = 300
        },
        {
            name = "WEAPON_PISTOL",
            ammo = 90
        },
        {
            name = "WEAPON_PUMPSHOTGUN",
            ammo = 60
        }
    },
    default = true
}

addTeamClass 'teamB' {
    identifier = "teamBsniper",
    name = "Sniper",
    model = "g_m_y_ballaorig_01",
    weapons = {
        {
            name = "WEAPON_SNIPERRIFLE",
            ammo = 90
        },
        {
            name = "WEAPON_PISTOL",
            ammo = 90
        },
        {
            name = "WEAPON_ASSAULTSMG",
            ammo = 280
        }
    }
}

addClassMenu 'teamA' { x = -976.93, y = -2996.31, z = 12.95, radius = 2.0, marker = { type = 1, scale = 1.0, color = { red = 0, green = 0, blue = 200 } } }
addClassMenu 'teamB' { x = 1725.03, y = 3307.18, z = 40.22, radius = 2.0, marker = { type = 1, scale = 1.0, color = { red = 0, green = 0, blue = 200 } } }
