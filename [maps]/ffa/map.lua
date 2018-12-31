addLobby 'mp_m_freemode_01' { x = -802.311, y = 175.056, z = 72.8446 }

--Teams

addTeam 'ffa' { name = 'Drunk people', minPlayer = 1, maxPlayer = 32 }

addTeamHeadQuarter 'ffa' { x = -970.25, y = -3002.77, z = 13.95, radius = 5.0 }

addTeamSpawn 'ffa' { x = -555.64, y = 285.41, z = 82.18, radius = 3.0 }

--Rules

setGameConfig 'minPlayer' { value = 2 }
setGameConfig 'minPlayerReady' { value = 2 }
setGameConfig 'forceStart' { value = 90 } --secondes
setGameConfig 'gameStartDelay' { value = 10 } --secondes
setGameConfig 'noTeam' { value = true }
setGameConfig 'autoFill' { value = true }

addTeamRule 'ffa' { name = 'disableWanted' }

addTeamRule 'ffa' { name = 'respawn', type = 'always', delay = 8, button = true } --secondes

--Win and Lose

addEvent 'player' { on = 'kill', trigger = 'addScore', params = { value = 100 } }
addEvent 'player' { on = 'haveScore', trigger = 'win', params = { value = 1000 } }

--Classes

addTeamClass 'ffa' {
    identifier = "ffa1",
    name = "Ped 1",
    model = "a_m_m_business_01",
    weapons = {

    },
    default = true
}

addTeamClass 'ffa' {
    identifier = "ffa2",
    name = "Ped 2",
    model = "a_m_m_eastsa_01",
    weapons = {

    },
    default = false
}

addTeamClass 'ffa' {
    identifier = "ffa3",
    name = "Ped 3",
    model = "a_m_m_farmer_01",
    weapons = {

    },
    default = false
}

addTeamClass 'ffa' {
    identifier = "ffa4",
    name = "Ped 4",
    model = "a_m_m_hillbilly_02",
    weapons = {

    },
    default = false
}

addTeamClass 'ffa' {
    identifier = "ffa5",
    name = "Ped 5",
    model = "a_m_y_beach_03",
    weapons = {

    },
    default = false
}

addTeamClass 'ffa' {
    identifier = "ffa6",
    name = "Ped 6",
    model = "g_f_y_vagos_01",
    weapons = {

    },
    default = false
}

addTeamClass 'ffa' {
    identifier = "ffa7",
    name = "Ped 7",
    model = "u_m_y_imporage",
    weapons = {

    },
    default = false
}

addTeamClass 'ffa' {
    identifier = "ffa8",
    name = "Ped 8",
    model = "csb_stripper_01",
    weapons = {

    },
    default = false
}

addTeamClass 'ffa' {
    identifier = "ffa9",
    name = "Ped 9",
    model = "u_f_y_corpse_01",
    weapons = {

    },
    default = false
}

addClassMenu 'ffa' { x = -976.93, y = -2996.31, z = 12.95, radius = 2.0, marker = { type = 1, scale = 1.0, color = { red = 0, green = 0, blue = 200 } } }
