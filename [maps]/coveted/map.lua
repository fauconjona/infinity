addLobby 'mp_m_freemode_01' { x = -802.311, y = 175.056, z = 72.8446 }

--Teams

addTeam 'police' { name = 'Police', minPlayer = 1, maxPlayer = 16 }
addTeam 'robbers' { name = 'Robbers', minPlayer = 1, maxPlayer = 16 }

addTeamHeadQuarter 'police' { x = -970.25, y = -3002.77, z = 13.95, radius = 5.0 }
addTeamHeadQuarter 'robbers' { x = 1730.63, y = 3310.0, z = 41.22, radius = 5.0 }

addTeamSpawn 'police' { x = 235.48, y = 205.35, z = 105.36, radius = 5.0 }
addTeamSpawn 'robbers' { x = 968.66, y = -126.23, z = 74.36, radius = 5.0 }

--Rules

setGameConfig 'minPlayer' { value = 2 }
setGameConfig 'minPlayerReady' { value = 2 }
setGameConfig 'forceStart' { value = 60 } --secondes
setGameConfig 'gameStartDelay' { value = 10 } --secondes

addTeamRule 'police' { name = 'disableWanted' }
addTeamRule 'robbers' { name = 'disableWanted' }

--Objectives

addObjective 'objective' { x = 222.2, y = 208.08, z = 105.51, heading = 111.7, type = 'vehicle', model = 'Riot', showBlip = true }

addObjectiveCollect 'objective' { action = 'auto', range = 2.0 }

addObjectiveMarker 'objective' { type = 1, scale = 1.0, color = { red = 0, green = 0, blue = 200 } }

addObjectiveDestination 'police' { objective = "objective", x = -1278.47, y = -3393.08, z = 12.94  }
addObjectiveDestination 'robbers' { objective = "objective", x = 1730.96, y = 3312.27, z = 40.22  }

addObjectiveDestinationMarker 'objective' { type = 1, scale = 4.0, color = { red = 0, green = 150, blue = 0 } }

--Win and Lose

addObjectiveEvent 'objective' { on = 'complete', trigger = 'win', target = 'police' }
addObjectiveEvent 'objective' { on = 'complete', trigger = 'win', target = 'robbers' }

addObjectiveEvent 'objective' { on = 'destroy', trigger = 'lose', target = 'police' }
addObjectiveEvent 'objective' { on = 'destroy', trigger = 'lose', target = 'robbers' }

addTeamEvent 'police' { on = 'allTeamDead', trigger = 'lose' }
addTeamEvent 'robbers' { on = 'allTeamDead', trigger = 'lose' }

addEvent 'any' { on = "partyStarted", trigger = 'createVehicle', params = { model = 'Police3', pos = { x = 228.46, y = 199.91, z = 105.3, heading = 65.6 } }  }
addEvent 'any' { on = "partyStarted", trigger = 'createVehicle', params = { model = 'Police3', pos = { x = 233.5, y = 198.29, z = 105.21, heading = 65.6 } }  }
addEvent 'any' { on = "partyStarted", trigger = 'createVehicle', params = { model = 'Police3', pos = { x = 238.28, y = 196.24, z = 105.13, heading = 65.6 } }  }
addEvent 'any' { on = "partyStarted", trigger = 'createVehicle', params = { model = 'Police3', pos = { x = 244.35, y = 194.45, z = 105.02, heading = 65.6 } }  }

addEvent 'any' { on = "partyStarted", trigger = 'createVehicle', params = { model = 'Kuruma2', pos = { x = 960.66, y = -130.49, z = 74.1, heading = 158.4 } }  }
addEvent 'any' { on = "partyStarted", trigger = 'createVehicle', params = { model = 'Mesa3', pos = { x = 968.35, y = -135.47, z = 74.12, heading = 137.4 } }  }
addEvent 'any' { on = "partyStarted", trigger = 'createVehicle', params = { model = 'Dune3', pos = { x = 965.91, y = -119.49, z = 73.8, heading = 137.8 } }  }
addEvent 'any' { on = "partyStarted", trigger = 'createVehicle', params = { model = 'Rumpo3', pos = { x = 975.81, y = -132.1, z = 74.17, heading = 60.6 } }  }

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

addTeamClass 'robbers' {
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

addTeamClass 'robbers' {
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
addClassMenu 'robbers' { x = 1725.03, y = 3307.18, z = 40.22, radius = 2.0, marker = { type = 1, scale = 1.0, color = { red = 0, green = 0, blue = 200 } } }
