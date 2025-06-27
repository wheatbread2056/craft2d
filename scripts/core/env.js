const env = {
    global: {
        // skybox example: [['rgb(1,2,3)',1000]] where its [color, y]
        skybox: [['rgb(0,0,0)', 800],['rgb(28,24,56)', 400],['rgb(25,76,151)', 192],['rgb(138,183,209)', 128],['rgb(57,134,206)', 96],['rgb(36,125,207)', 0], ['rgb(0,0,0)', -200]],
        paused: false,
        physicsQuality: 16, // amount of collisions per player tick, 16 default
        targetRate: 5,
        baseGravity: -0.6,
        gravity: 0,
        respawnEnabled: true,
        respawnTime: 2, // seconds
        walljumpEnabled: false,
        flyAllowed: false,
        baseSpeedVelocity: 7.2,
        baseJumpVelocity: 12.6,
        worldSeaLevel: 48,
        worldGenType: 'none',
        worldBottomEnabled: true,
        worldBottomBlock: 'stone4',
        worldBottomImmutable: true,
        maxStackSize: 99, // max stack size for everything, but some items might have overrides
        tickrate: 5, // 5 ticks per second default
        renderTickNum: 0,
        gameTickNum: 0,
        mapxsize: 0, // size of the map in blocks
        mapstart: -256, // start of the map
        mapend: 256, // end of the map
        simulationRadius: 2, // radius in chunks, to do game ticks
        chunksize: 32, // size of a chunk in blocks (16x16 = 256 blocks (small), 32x32 = 1024 blocks (default), 64x64 = 4096 blocks (large))
        seed: Math.round(Math.random() * (2147483647*2) - 2147483647),
        mobsEnabled: true, // whether mobs are enabled or not
        lightEnabled: true, // Advanced lighting system with sky light and 4-directional propagation
        lightUpdateCooldown: 500, // milliseconds between light updates (2 times per second)
        lastLightUpdate: 0, // timestamp of last light update
        skyLightLevel: 8, // maximum light level from sky
        minLightLevel: 4, // minimum light level for air blocks (ambient light)
    },
    player: {
        defaultMaxHealth: 1000,
        defaultSpeedMultiplier: 1,
        defaultJumpMultiplier: 1,
        defaultInvincibility: false,
        defaultRegenRate: 7.5,
        defaultGamemode: 'survival', // survival, creative
        defaultInventorySize: 5, // rows of 9 (so default = 5x9 = 45 slots)
        defaultInventory: {
            1: {id: 'pickaxe1', amount: 1},
            2: {id: 'axe1', amount: 1},
            3: {id: 'shovel1', amount: 1},
            4: {id: 'crafter', amount: 1},
            5: {id: null, amount: 0},
            6: {id: null, amount: 0},
            7: {id: null, amount: 0},
            8: {id: null, amount: 0},
            9: {id: null, amount: 0},
        },
        defaultReachDistance: 5,
    },
};