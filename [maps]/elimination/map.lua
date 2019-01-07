addLobby 'mp_m_freemode_01' { x = -802.311, y = 175.056, z = 72.8446 }

--Teams

addTeam 'teamA' { name = 'Team A', minPlayer = 1, maxPlayer = 16 }
addTeam 'teamB' { name = 'Team B', minPlayer = 1, maxPlayer = 16 }

addTeamHeadQuarter 'teamA' { x = -970.25, y = -3002.77, z = 13.95, radius = 5.0 }
addTeamHeadQuarter 'teamB' { x = 1730.63, y = 3310.0, z = 41.22, radius = 5.0 }

addTeamSpawn 'teamA' { x = 551.0, y = -548.25, z = 24.75, radius = 5.0 }
addTeamSpawn 'teamB' { x = 601.81, y = -444.37, z = 24.74, radius = 4.0 }

--Rules

setGameConfig 'minPlayer' { value = 2 }
setGameConfig 'minPlayerReady' { value = 2 }
setGameConfig 'forceStart' { value = 60 } --secondes
setGameConfig 'gameStartDelay' { value = 10 } --secondes
setGameConfig 'canJoinDuringGame' { value = false }
setGameConfig 'spectator' { value = true }
setGameConfig 'weather' { value = "EXTRASUNNY" }
setGameConfig 'time' { value = "12:00" }

addTeamRule 'teamA' { name = 'disableWanted' }
addTeamRule 'teamB' { name = 'disableWanted' }

--Objectives

addObjective 'objective' { x = 601.81, y = -444.37, z = 23.74, heading = 352, type = 'ped', model = 'a_m_y_golfer_01', showBlip = true }

--Win and Lose

addObjectiveEvent 'objective' { on = 'destroy', trigger = 'win', target = 'teamA' }
addObjectiveEvent 'objective' { on = 'destroy', trigger = 'lose', target = 'teamB' }

addTeamEvent 'teamA' { on = 'allTeamDead', trigger = 'lose' }
addTeamEvent 'teamB' { on = 'allTeamDead', trigger = 'lose' }

addEvent 'teamA' { on = "partyStarted", trigger = 'displayMessage', params = { text = 'Kill the target', time = 10 } }
addEvent 'teamB' { on = "partyStarted", trigger = 'displayMessage', params = { text = 'Protect the boss', time = 10 } }

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
