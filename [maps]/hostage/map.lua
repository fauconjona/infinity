addLobby 'mp_m_freemode_01' { x = -802.311, y = 175.056, z = 72.8446 }

--Teams

addTeam 'police' { name = 'Police' }
addTeam 'criminals' { name = 'Criminals' }

addTeamHeadQuarter 'police' { x = -970.25, y = -3002.77, z = 13.95, radius = 5.0 }
addTeamHeadQuarter 'criminals' { x = 1730.63, y = 3310.0, z = 41.22, radius = 5.0 }

addTeamSpawn 'police' { x = -526.31, y = -962.45, z = 23.55, radius = 7.0 }
addTeamSpawn 'criminals' { x = -489.68, y = -1037.61, z = 40.81, radius = 4.0 }

--Rules

setGameConfig 'minPlayer' { value = 2 }
setGameConfig 'minPlayerReady' { value = 2 }
setGameConfig 'forceStart' { value = 60 } --secondes
setGameConfig 'gameStartDelay' { value = 10 } --secondes
setGameConfig 'canJoinDuringGame' { value = false }
setGameConfig 'spectator' { value = true }
setGameConfig 'weather' { value = "EXTRASUNNY" }
setGameConfig 'time' { value = "12:00" }

addTeamRule 'police' { name = 'disableWanted' }
addTeamRule 'criminals' { name = 'disableWanted' }

--Objectives

addObjective 'objective' { x = -489.68, y = -1037.61, z = 39.81, heading = 180, type = 'ped', model = 'a_f_m_eastsa_01', showBlip = true }

addObjectiveDestination 'police' { objective = 'objective', x = -970.25, y = -3002.77, z = 12.95 }

addObjectiveDestinationMarker 'objective' { type = 1, scale = 2.0, color = { red = 0, green = 150, blue = 0 } }

--Win and Lose

addObjectiveEvent 'objective' { on = 'complete', trigger = 'win', target = 'police' }

addObjectiveEvent 'objective' { on = 'destroy', trigger = 'lose', target = 'police' }
addObjectiveEvent 'objective' { on = 'destroy', trigger = 'lose', target = 'criminals' }

addTeamEvent 'police' { on = 'allTeamDead', trigger = 'lose' }
addTeamEvent 'criminals' { on = 'allTeamDead', trigger = 'lose' }

addEvent 'police' { on = "partyStarted", trigger = 'displayMessage', params = { text = 'Save the hostage', time = 10 } }
addEvent 'criminals' { on = "partyStarted", trigger = 'displayMessage', params = { text = 'Kill the police', time = 10 } }

--Classes

addTeamClass 'police' {
    identifier = "teamAassault",
    name = "Assault",
    model = "s_m_y_cop_01",
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

addTeamClass 'police' {
    identifier = "teamAsniper",
    name = "Sniper",
    model = "s_m_y_swat_01",
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

addTeamClass 'criminals' {
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

addTeamClass 'criminals' {
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

addClassMenu 'police' { x = -976.93, y = -2996.31, z = 12.95, radius = 2.0, marker = { type = 1, scale = 1.0, color = { red = 0, green = 0, blue = 200 } } }
addClassMenu 'criminals' { x = 1725.03, y = 3307.18, z = 40.22, radius = 2.0, marker = { type = 1, scale = 1.0, color = { red = 0, green = 0, blue = 200 } } }
