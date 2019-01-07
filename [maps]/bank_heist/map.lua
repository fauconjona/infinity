addLobby 'mp_m_freemode_01' { x = -802.311, y = 175.056, z = 72.8446 }

--Teams

addTeam 'police' { name = 'Police', minPlayer = 1, maxPlayer = 16 }
addTeam 'robbers' { name = 'Robbers', minPlayer = 1, maxPlayer = 16 }

addTeamHeadQuarter 'police' { x = -970.25, y = -3002.77, z = 13.95, radius = 5.0 }
addTeamHeadQuarter 'robbers' { x = 1730.63, y = 3310.0, z = 41.22, radius = 5.0 }

addTeamSpawn 'police' { x = 446.12, y = -1020.91, z = 28.5, radius = 5.0 }
addTeamSpawn 'robbers' { x = 235.24, y = 216.89, z = 106.29, radius = 2.5 }

--Rules

setGameConfig 'minPlayer' { value = 2 }
setGameConfig 'minPlayerReady' { value = 2 }
setGameConfig 'forceStart' { value = 180 } --secondes
setGameConfig 'gameStartDelay' { value = 10 } --secondes
setGameConfig 'spectator' { value = true }

addTeamRule 'police' { name = 'disableWanted' }
addTeamRule 'robbers' { name = 'disableWanted' }

--Objectives

addObjective 'bank' { x = 255.59, y = 224.6, z = 100.88, heading = 252.2, type = 'object', model = "prop_anim_cash_pile_02", showBlip = true }

addObjectiveCollect 'bank' { action = 'timer', range = 1.5, params = { time = 60 } }

addObjectiveMarker 'bank' { type = 1, scale = 3.0, color = { red = 0, green = 0, blue = 200 } }

addObjectiveDestination 'robbers' { objective = "bank", x = 3628.71, y = 3758.22, z = 27.4  }

addObjectiveDestinationMarker 'bank' { type = 1, scale = 6.0, color = { red = 0, green = 150, blue = 0 } }

--Win and Lose

addObjectiveEvent 'bank' { on = 'collect', trigger = 'win', target = 'police' }
addObjectiveEvent 'bank' { on = 'complete', trigger = 'win', target = 'robbers' }
addObjectiveEvent 'bank' { on = 'collect', trigger = 'setRule', target = 'robbers', params = { name = "disableWanted", value = false } }
addObjectiveEvent 'bank' { on = 'collect', trigger = 'setRule', target = 'robbers', params = { name = "visibleOnMap", value = true } }
addObjectiveEvent 'bank' { on = 'collect', trigger = 'setWanted', target = 'robbers', params = { level = 4 } }
addObjectiveEvent 'bank' { on = 'collect', trigger = 'displayMessage', target = 'robbers', params = { text = 'Go to the extraction point', time = 10 } }
addObjectiveEvent 'bank' { on = 'collect', trigger = 'notification', target = 'any', params = { text = '%playerName% has stolen the vault' } }
addObjectiveEvent 'bank' { on = 'collect', trigger = 'createVehicle', target = 'robbers', params = { model = 'Burrito2', pos = { x = 257.76, y = 277.62, z = 105.76, heading = 67.7 } } }

addTeamEvent 'police' { on = 'allTeamDead', trigger = 'lose' }
addTeamEvent 'robbers' { on = 'allTeamDead', trigger = 'lose' }

addEvent 'any' { on = "partyStarted", trigger = 'createVehicle', params = { model = 'Police3', pos = { x = 435.37, y = -1015.37, z = 28.76, heading = 80 } }  }
addEvent 'any' { on = "partyStarted", trigger = 'createVehicle', params = { model = 'Police3', pos = { x = 422.61, y = -1014.97, z = 29.06, heading = 80 } }  }
addEvent 'any' { on = "partyStarted", trigger = 'createVehicle', params = { model = 'Police3', pos = { x = 422.71, y = -1028.52, z = 29.07, heading = 80 } }  }
addEvent 'any' { on = "partyStarted", trigger = 'createVehicle', params = { model = 'Police3', pos = { x = 432.32, y = -1026.59, z = 28.9, heading = 80 } }  }

addEvent 'robbers' { on = "partyStarted", trigger = 'displayMessage', params = { text = 'Capture the cash in the vault', time = 10 } }
addEvent 'police' { on = "partyStarted", trigger = 'displayMessage', params = { text = 'Robbery in progress', time = 10 } }

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
