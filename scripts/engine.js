// world doesn't store variables and stuff, env stores that. world stores the map

function chunkKey(cx, cy, layer = 'fg') {
    return `${layer}:${cx},${cy}`;
}
function blockKey(bx, by) {
    return `${bx},${by}`;
}

const world = {
    fg: new Map(), // Map<chunkKey, Map<blockKey, block>>
    bg: new Map()
};
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
        flyAllowed: true,
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
    },
    player: {
        defaultMaxHealth: 1000,
        defaultSpeedMultiplier: 1,
        defaultJumpMultiplier: 1,
        defaultInvincibility: false,
        defaultRegenRate: 7.5,
        defaultGamemode: 'survival', // survival, creative
    },
};
const player = {
    inventory: {
        1: {id: 'pickaxe1', amount: 1},
        2: {id: 'axe1', amount: 1},
        3: {id: 'shovel1', amount: 1},
        4: {id: 'crafter', amount: 1},
        5: {id: null, amount: 0},
        6: {id: null, amount: 0},
        7: {id: null, amount: 0},
        8: {id: null, amount: 0},
        9: {id: 'test', amount: Infinity},
    },
    gamemode: env.player.defaultGamemode,
    currentSlot: 1, // 1 to 9 (first row in the inventory). note 0 does not exist in the inventory
    currentItem: null,
    x: 0, // player x position
    y: 0, // player y position
    blockX: 0, // x pos of interacting block
    blockY: 0, // y pos of interacting block
    blockDamage: 0, // current damage dealt to intreacting block
    currentBlockHardness: 0,
    breakingBlock: false, // if the player is breaking a block
    blockToolType: 'none',
    currentBreakRate: 0, // current break rate of the block
    currentToolType: 'none', // current tool type that the player is holding.
    mx: 0, // player x velocity per tick
    my: 0, // player y velocity per tick
    air: false, // if in midair
    acc: false, // if accelerating
    fly: false, // if flying / has alternate physics
    flyx: false, // if accelerating horizontally during flight
    flyy: false, // if accelerating vertically during flight
    inWater: false, // if underwater
    speedMult: env.player.defaultSpeedMultiplier, // speed velocity multiplier of the player
    jumpMult: env.player.defaultJumpMultiplier, // jump velocity multiplier of the player - does not correspond to blocks, meaning a 20% increase could cause a 50% height increase
    noclip: false, // toggle collision with the player and blocks
    maxHealth: env.player.defaultMaxHealth, // player's maximum health
    health: env.player.defaultMaxHealth, // player's current health
    controlAllowed: true, // if the user is allowed to control the player
    modificationAllowed: true, // if the user is allowed to modify the world
    invulnerable: env.player.defaultInvincibility, // true = no damage & infinite regen rate
    regenRate: env.player.defaultRegenRate, // hp regenerated every second
    regenAllowed: true, // player regen toggle
    deathOverlay: false,
    inventoryOpen: false,
    craftingOpen: false,
    currentRecipe: null, // current recipe being crafted
    interactionLayer: 'fg', // layer to interact with (foreground or background)
};
const camera = {
    x: 0,
    y: 0, 
    scale: 1
};
const client = {
    gameTickrateComputed: 60, // computed game tickrate
    renderTickrateComputed: 60, // computed render tickrate
    lastGameTick: Date.now(), // last game tick time
    lastRenderTick: Date.now(), // last render tick time
    blocksRendered: 0, // number of blocks rendered in the last render tick
    debug: false,
    mx: 0, // mouse x position
    my: 0, // mouse y position
    oldMx: 0, // previous mouse x position
    oldMy: 0, // previous mouse y position
    waterimg: 'watertop_render1', // current water image
    inventorySelectedSlot: null,
}
const globalImages = {}

// create inventory rows
for (let row = 2; row <= 5; row++) { // generates 4 more rows (2-5), each with 9 slots
    for (let col = 1; col <= 9; col++) {
        const slot = (row - 1) * 9 + col;
        player.inventory[slot] = { id: null, amount: 0 };
    }
}

function getChunkAndBlock(x, y) {
    const cx = Math.floor(x / env.global.chunksize);
    const cy = Math.floor(y / env.global.chunksize);
    const bx = ((x % env.global.chunksize) + env.global.chunksize) % env.global.chunksize;
    const by = ((y % env.global.chunksize) + env.global.chunksize) % env.global.chunksize;
    return { cx, cy, bx, by };
}

function getChunkMap(layer, cx, cy, create = false) {
    const w = world[layer];
    const key = chunkKey(cx, cy, layer);
    let chunk = w.get(key);
    if (!chunk && create) {
        chunk = new Map();
        w.set(key, chunk);
    }
    return chunk;
}

function setBlock(x, y, block = 'test', layer = 'fg') {
    const { cx, cy, bx, by } = getChunkAndBlock(x, y);
    const chunk = getChunkMap(layer, cx, cy, true);
    chunk.set(blockKey(bx, by), block);
}
function getBlock(x, y, layer = 'fg') {
    const { cx, cy, bx, by } = getChunkAndBlock(x, y);
    const chunk = getChunkMap(layer, cx, cy, false);
    let block = chunk ? chunk.get(blockKey(bx, by)) : null;
    if (y <= -27 && env.global.worldBottomEnabled && block == null) { // for world bottom
        return env.global.worldBottomBlock;
    } else {
        return block || null;
    }
}
function deleteBlock(x, y, layer = 'fg') {
    const { cx, cy, bx, by } = getChunkAndBlock(x, y);
    const chunk = getChunkMap(layer, cx, cy, false);
    if (chunk) {
        chunk.delete(blockKey(bx, by));
    }
}
// no layer for this one because background blocks will never have collision
function getBlockCollision(x, y) {
    let block = getBlock(x, y);
    if (nocollision.includes(block) || block == null) {
        return null;
    } else {
        return true;
    }
}
function showBlock(ctx, x, y, block, darken = false) { // x and y are relative to document
    // ctx added in alpha 1.5.5 to draw onto a canvas context
    const isPlayer = (block == 'player' && player.inWater == true && player.fly == false);
    if (darken) {
        if (!transparentblocks.includes(block)) {
            ctx.fillStyle = 'black';
            ctx.fillRect(Math.floor(x * 64 * camera.scale), Math.floor(-y * 64 * camera.scale), 64 * camera.scale, 64 * camera.scale);
        }
        ctx.globalAlpha = 0.7;
    }
    if (isPlayer) {
        ctx.globalAlpha = 0.5;
    }
    try {
        ctx.drawImage(globalImages[block], Math.floor(x * 64 * camera.scale), Math.floor(-y * 64 * camera.scale), 64 * camera.scale, 64 * camera.scale);
    } catch (e) {
        ctx.drawImage(globalImages['test'], Math.floor(x * 64 * camera.scale), Math.floor(-y * 64 * camera.scale), 64 * camera.scale, 64 * camera.scale);
    }
    if (isPlayer || darken) {
        ctx.globalAlpha = 1.0;
    }
}

function spawnPlayer(spawnx) {
    var spawnCoords = [0, 0];
    function asdfhjkhagdbsf() {
        var foundBlock = false;
        var i = -1024;
        while (true) {
            if (getBlock(spawnx,i) == null && foundBlock == true) {
                if (!(getBlock(spawnx,i-1) == 'watertop')) {
                    spawnCoords = [spawnx, i];
                    console.log(`Spawned player at ${spawnCoords}`);
                    break;
                } else {
                    spawnx -= 1;
                    if (spawnx < env.global.mapstart + 1) {
                        spawnx = env.global.mapend - 1;
                    }
                    asdfhjkhagdbsf();
                    break;
                }
            } else if (!(getBlock(spawnx, i) == null)) {
                foundBlock = true;
            }
            i++;
        }
        player.x = spawnCoords[0];
        player.y = spawnCoords[1];
    }
    if (env.global.worldGenType == 'none') {
        setBlock(spawnx, -1, 'stone4');
    }
    asdfhjkhagdbsf();
}

// do stuff for player health
function handlePlayerHealth() {
    if (player.health <= 0) {
        player.health = 0;
        player.controlAllowed = false;
        player.modificationAllowed = false;
        player.regenAllowed = false;

        if (!player.deathOverlay) {
            const overlay = document.createElement('div');
            var deathTime = Date.now();

            // this is too long
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(127, 0, 0, 0.5)';
            overlay.style.zIndex = '1000';
            overlay.innerHTML = '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 48px; color: white; text-align: center;">dead.</div>';
            document.body.appendChild(overlay);

            const updateDeathOverlayTimer = setInterval(function () {
                let timeLeft = Math.max(0, env.global.respawnTime - Math.floor((Date.now() - deathTime) / 1000));
                overlay.innerHTML = `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 48px; color: white; text-align: center;">dead (${timeLeft}s)</div>`;
                
                if (timeLeft === 0) {
                    spawnPlayer(0);
                    player.health = player.maxHealth;
                    player.controlAllowed = true;
                    player.regenAllowed = true;
                    player.modificationAllowed = true;
                    player.deathOverlay = false;
                    document.body.removeChild(overlay);
                    clearInterval(updateDeathOverlayTimer);
                }
            }, 100);
            player.deathOverlay = true;
        }
    }
}

// manages both physics/collision and movement
function playerPhysics() {
    // user-triggered actions aka movement
    if (player.controlAllowed) {
        if (player.fly == false) {
            if (!player.air && !player.inWater) {
                if (movementKeys.left) {
                    player.mx += -env.global.baseSpeedVelocity / 3 / (client.renderTickrateComputed / 60) * player.speedMult;
                    if (player.mx < -env.global.baseSpeedVelocity * player.speedMult) {
                        player.mx = -env.global.baseSpeedVelocity * player.speedMult;
                    }
                    player.acc = true;
                }
                if (movementKeys.right) {
                    player.mx += env.global.baseSpeedVelocity / 3 / (client.renderTickrateComputed / 60) * player.speedMult;
                    if (player.mx > env.global.baseSpeedVelocity * player.speedMult) {
                        player.mx = env.global.baseSpeedVelocity * player.speedMult;
                    }
                    player.acc = true;
                }
            } else {
                if (movementKeys.left) {
                    player.mx += -env.global.baseSpeedVelocity / 24 / (client.renderTickrateComputed / 60) * player.speedMult;
                }
                if (movementKeys.right) {
                    player.mx += env.global.baseSpeedVelocity / 24 / (client.renderTickrateComputed / 60) * player.speedMult;
                }
            }
            if (!player.inWater) {
                // took me an insanely long amount of time to find this
                // but this is for the player ** JUMP **
                if (movementKeys.up && player.air == false) {
                    // 0.21 y vel = around 2.1 block jump height and 0.2 is under 2 blocks
                    player.my = env.global.baseJumpVelocity * player.jumpMult;
                    player.air = true;
                }
            }
            else { // water movement
                if (movementKeys.up) {
                    player.my += 0.1 / (client.renderTickrateComputed / 60) * player.jumpMult;
                }
                if (movementKeys.down) {
                    player.my -= 0.2 / (client.renderTickrateComputed / 60) * player.jumpMult;
                }
            }
        }
        
        // fly movement

        else if (player.fly == true) {
            if (movementKeys.left) {
                player.mx += -7.2 / (client.renderTickrateComputed / 60) * player.speedMult;
                if (player.mx < -24 * player.speedMult) {
                    player.mx = -24 * player.speedMult;
                }
                player.flyx = true;
            }
            if (movementKeys.right) {
                player.mx += 7.2 / (client.renderTickrateComputed / 60) * player.speedMult;
                if (player.mx > 24 * player.speedMult) {
                    player.mx = 24 * player.speedMult;
                }
                player.flyx = true;
            }
            if (movementKeys.up) {
                player.my += 2.4 / (client.renderTickrateComputed / 60) * player.jumpMult;
                if (player.my > 12 * player.jumpMult) {
                    player.my = 12 * player.jumpMult;
                }
                player.flyy = true;
            }
            if (movementKeys.down) {
                player.my -= 2.4 / (client.renderTickrateComputed / 60) * player.jumpMult;
                if (player.my < -12 * player.jumpMult) {
                    player.my = -12 * player.jumpMult;
                }
                player.flyy = true;
            }
        }
    }

    // check if in water
    let previousWater = player.inWater;
    player.inWater = getBlock(Math.round(player.x),Math.floor(player.y)) == 'water' || getBlock(Math.round(player.x),Math.floor(player.y + 0.5)) == 'watertop';
    if (player.inWater) {
        player.air = false;
    }
    if (player.inWater && !previousWater) {
        // this is very loud.
        // playSound('sfx/splash.wav', 0.4);
    }

    // disable acceleration mode when needed (prevents endless sliding)
    if (player.fly == false) {
        if (!(movementKeys.left || movementKeys.right)) {
            player.acc = false;
        }
    } else {
        if (!(movementKeys.left || movementKeys.right)) {
            player.flyx = false;
        }
        if (!(movementKeys.up || movementKeys.down)) {
            player.flyy = false;
        }
    }
    

    // gravity
    if (player.fly == false) {
        if (player.inWater) { // buoyancy
            player.my += 0.1 / (client.renderTickrateComputed / 60);
            player.my *= Math.pow(0.98, 60 / client.renderTickrateComputed);
        } else {
            player.my += env.global.gravity * (60 / client.renderTickrateComputed);
        }
    }
    
    for (let i = 0; i < env.global.physicsQuality; i++) {
        // momentum & friction
        player.x += player.mx / client.renderTickrateComputed / env.global.physicsQuality;
        player.y += player.my / client.renderTickrateComputed / env.global.physicsQuality;
        if (player.fly == false) { // normal non-flying friction
            if (player.air || player.inWater) { // air friction
                player.mx *= Math.pow(0.98, 60 / client.renderTickrateComputed / env.global.physicsQuality);
            } else if (!player.acc) { // ground friction
                player.mx *= Math.pow(0.5, 60 / client.renderTickrateComputed / env.global.physicsQuality);
            }
        } else { // flying friction
            if (player.flyx == false) {
                player.mx *= Math.pow(0.8, 60 / client.renderTickrateComputed / env.global.physicsQuality);
            }
            if (player.flyy == false) {
                player.my *= Math.pow(0.8, 60 / client.renderTickrateComputed / env.global.physicsQuality);
            }
        }
        
        // COLLISION
        // rewritten in alpha 1.8 - should be much better
        // this is actually AMAZING.
        if (!player.noclip) {
            playertop = player.y;
            playerbottom = player.y - 1;
            playerleft = player.x;
            playerright = player.x + 1;
            playerLeftTouching = (getBlockCollision(Math.floor(playerleft), Math.round(player.y)));
            playerRightTouching = (getBlockCollision(Math.floor(playerright), Math.round(player.y)));
            // player bottom collision
            if (playerLeftTouching) {
                player.mx = 0;
                player.x = Math.ceil(playerleft);
            }
            if (playerRightTouching) {
                player.mx = 0;
                player.x = Math.floor(playerleft);
            }
            playerBottomTouching = (getBlockCollision(Math.floor(playerleft + (1/8)), Math.ceil(playerbottom)) || getBlockCollision(Math.floor(playerright - (1/8)), Math.ceil(playerbottom)));
            if (playerBottomTouching) {
                if (player.my < -21.6 && !player.invulnerable) {
                    // fall damage based on the player's vertical velocity
                    player.health -= ((player.my*2/60) * (player.my*2/60) * (player.my*2/60) * (player.my*2/60)) * 160;
                    handlePlayerHealth();
                    playSound('sfx/hitHurt.wav');
                };
                player.air = false;
                player.my = 0;
                player.y = Math.ceil(player.y);
            } else {
                if (!player.inWater) {
                    player.air = true;
                }
            }
            playerTopTouching = (getBlockCollision(Math.floor(playerleft + (1/8)), Math.floor(playertop + 1)) || getBlockCollision(Math.floor(playerright - (1/8)), Math.floor(playertop + 1)))
            if (playerTopTouching && !playerBottomTouching) {
                player.my = 0;
                player.y = Math.floor(playertop);
            }
        }
    }
    // walljumping
    if (env.global.walljumpEnabled) {
        if (playerLeftTouching && movementKeys.up && movementKeys.left && player.air) {
            player.mx = 7.2 * (env.global.baseJumpVelocity/12.6) * player.jumpMult;
            player.my = env.global.baseJumpVelocity * player.jumpMult;
            player.air = true;
        }
        if (playerRightTouching && movementKeys.up && movementKeys.right && player.air) {
            player.mx = -7.2 * (env.global.baseJumpVelocity/12.6) * player.jumpMult;
            player.my = env.global.baseJumpVelocity * player.jumpMult;
            player.air = true;
        }
    }
    // get every player-touched block (up to 6, i think?) and run its onTouch action if it exists

    
}

// not currently used - but might be useful later
function getColor(c1, c2, p1, p2) {
    const r = Math.round((c1.r * p1) + (c2.r * p2));
    const g = Math.round((c1.g * p1) + (c2.g * p2));
    const b = Math.round((c1.b * p1) + (c2.b * p2));
    return {r, g, b};
}

function updateTime() {
    const waterImages = ['watertop_render1', 'watertop_render2', 'watertop_render3', 'watertop_render4'];
    waterimg = waterImages[Math.floor((Date.now() % 500) / 125)];

    // Calculate the sky color based on player's y position
    let gradientStops = env.global.skybox.map(([color, y]) => {
        let position = ((player.y - y)) * 10 * camera.scale + 50;
        return `${color} ${position}%`;
    }).join(', ');

    document.body.style.background = `linear-gradient(to bottom, ${gradientStops})`;
    document.body.style.height = '100vh';
    document.body.style.margin = '0';

    // update gravity for space
    if (player.y > 400) {
        env.global.gravity = env.global.baseGravity / (player.y/400);
    } else {
        env.global.gravity = env.global.baseGravity;
    }
}

function blockModification() {
    if (!player.modificationAllowed) return;
    let layer = player.interactionLayer;

    // get the coordinates for the block position under the mouse
    let blockX = Math.floor(client.mx / 64 / camera.scale + camera.x);
    let blockY = Math.ceil(-client.my / 64 / camera.scale + camera.y);

    // block breaking
    if (keybinds.delete.some(key => keys[key]) && player.breakingBlock == false) {
        player.breakingBlock = true;
    }
    if (!keybinds.delete.some(key => keys[key]) && player.breakingBlock == true) {
        player.breakingBlock = false;
    }
    if (player.breakingBlock) {
        if (blockX !== player.blockX || blockY !== player.blockY) {
            // reset block damage if breaking new block
            player.blockDamage = 0;
        }
        player.blockX = blockX;
        player.blockY = blockY;
        let block = getBlock(player.blockX, player.blockY, layer);
        if (block !== null) {
            player.blockToolType = blocktypes[block] || 'none';
            player.blockToolLevel = blocklevels[block] || 0;
            player.currentBlockHardness = hardness[block];
            if (player.currentToolType == player.blockToolType && player.blockToolLevel <= player.currentToolLevel || player.blockToolType == 'none') {
                player.blockDamage += player.currentBreakRate / (client.renderTickrateComputed / 60);
            }
            if (player.blockDamage >= player.currentBlockHardness) {
                // play sound
                // delete the block
                deleteBlock(player.blockX, player.blockY, layer);
                player.blockDamage = 0;
                // add block to player inventory
                // first, look at EVERY inventory slot until theres a slot containing the block. but if its already a full stack, keep looking
                // then, if theres either no slots with the blocks, or all the slots with the block are full stacks, add to first empty slot.
                let added = false;
                let drop = blockdrops[block] || null;
                if (!drop || (Array.isArray(drop) && drop.length == 0)) added = true;
                if (added != true) {
                    for (let slot = 1; slot <= Object.keys(player.inventory).length; slot++) {
                        let invSlot = player.inventory[slot];
                        if (invSlot.id === drop && invSlot.amount < env.global.maxStackSize) {
                            invSlot.amount++;
                            added = true;
                            break;
                        }
                    }
                }
                if (!added) {
                    for (let slot = 1; slot <= Object.keys(player.inventory).length; slot++) {
                        let invSlot = player.inventory[slot];
                        if (invSlot.id === null || invSlot.amount === 0) {
                            invSlot.id = drop;
                            invSlot.amount = 1;
                            break;
                        }
                    }
                }
                createInventoryUI();
                if (blockactions[block] && blockactions[block].onBreak) {
                    blockactions[block].onBreak(player.blockX, player.blockY, layer);
                }
            }
        }
    }

    // placing blocks
    if (keybinds.place.some(key => keys[key])) {
        let block = getBlock(blockX, blockY, layer);
        let isWorldBottom = blockY < -26 && env.global.worldBottomEnabled && env.global.worldBottomImmutable;
        let isPlayerPosition = Math.round(player.x) === blockX && Math.round(player.y) === blockY;

        if (layer === 'fg' && isPlayerPosition) {
            return;
        }

        // place the block if there's empty space and the held item is a block.
        if ((getBlockCollision(blockX, blockY, layer) == null && layer == 'fg' || block == null && layer == 'bg') && allblocks.includes(player.currentItem)) {
            setBlock(blockX, blockY, player.currentItem, layer);
            player.inventory[player.currentSlot].amount--;
            if (player.inventory[player.currentSlot].amount <= 0) {
                player.inventory[player.currentSlot].id = null; // remove the block from the inventory if amount is 0
            }
            createInventoryUI();
            if (blockactions[player.currentItem] && blockactions[player.currentItem].onPlace) {
                blockactions[player.currentItem].onPlace(blockX, blockY, layer);
            }
        } else { // assume placing without those conditions = interact
            if (blockactions[block] && blockactions[block].onInteract) blockactions[block].onInteract(blockX, blockY, layer);
        }
    }
}

function getNearChunks(radius = 1) {
    const cx = Math.floor(player.x / env.global.chunksize);
    const cy = Math.floor(player.y / env.global.chunksize);
    const chunks = [];
    for (let x = cx - radius; x <= cx + radius; x++) {
        for (let y = cy - radius; y <= cy + radius; y++) {
            chunks.push({cx: x, cy: y});
        }
    }
    return chunks;
}

function blockPhysics() {
    // sand falls, and water expands to any empty spaces on the left, bottom, and right.
    const nearChunks = getNearChunks(2);
    // Track positions that have already been updated this tick
    const sandUpdated = new Set();
    const watertopUpdated = new Set();
    const waterUpdated = new Set();
    // sand physics
    // 1. look for sand blocks in the near chunks
    for (const {cx, cy} of nearChunks) {
        const chunk = getChunkMap('fg', cx, cy, false);
        if (!chunk) continue;
        for (const [blockKey, block] of chunk.entries()) {
            if (block == 'sand') {
                const [bx, by] = blockKey.split(',').map(Number);
                const x = cx * env.global.chunksize + bx;
                const y = cy * env.global.chunksize + by;
                // Skip if this sand block was already updated after falling
                if (sandUpdated.has(`${x},${y}`)) continue;
                // check if the block below is empty
                if (getBlockCollision(x, y - 1) == null) {
                    deleteBlock(x, y);
                    setBlock(x, y - 1, block);
                    sandUpdated.add(`${x},${y-1}`);
                }
            }
        }
    }
    // water physics
    // first, expand watertop blocks to left and right
    // Track positions that have already been updated this tick for water
    for (const {cx, cy} of nearChunks) {
        const chunk = getChunkMap('fg', cx, cy, false);
        if (!chunk) continue;
        for (const [blockKey, block] of chunk.entries()) {
            if (block == 'watertop') {
                const [bx, by] = blockKey.split(',').map(Number);
                const x = cx * env.global.chunksize + bx;
                const y = cy * env.global.chunksize + by;
                if (watertopUpdated.has(`${x},${y}`)) continue;
                if (getBlockCollision(x - 1, y) == null && getBlock(x - 1, y) !== 'watertop') setBlock(x - 1, y, 'watertop'), watertopUpdated.add(`${x-1},${y}`);
                if (getBlockCollision(x + 1, y) == null && getBlock(x + 1, y) !== 'watertop') setBlock(x + 1, y, 'watertop'), watertopUpdated.add(`${x+1},${y}`);
                // place water below
                if (getBlockCollision(x, y - 1) == null && getBlock(x, y - 1) !== 'water') {
                    setBlock(x, y - 1, 'water');
                    waterUpdated.add(`${x},${y-1}`);
                }
            }
        }
    }
    // then, expand water blocks downwards, left, and right
    for (const {cx, cy} of nearChunks) {
        const chunk = getChunkMap('fg', cx, cy, false);
        if (!chunk) continue;
        for (const [blockKey, block] of chunk.entries()) {
            if (block == 'water') {
                const [bx, by] = blockKey.split(',').map(Number);
                const x = cx * env.global.chunksize + bx;
                const y = cy * env.global.chunksize + by;
                if (waterUpdated.has(`${x},${y}`)) continue;
                if (getBlockCollision(x, y - 1) == null && getBlock(x, y - 1) !== 'water') {
                    setBlock(x, y - 1, 'water');
                    waterUpdated.add(`${x},${y-1}`);
                }
                if (getBlockCollision(x - 1, y) == null && getBlock(x - 1, y) !== 'water') {
                    setBlock(x - 1, y, 'water');
                    waterUpdated.add(`${x-1},${y}`);
                }
                if (getBlockCollision(x + 1, y) == null && getBlock(x + 1, y) !== 'water') {
                    setBlock(x + 1, y, 'water');
                    waterUpdated.add(`${x+1},${y}`);
                }
            }
        }
    }
}

// explosion for tnt
function explosion(x, y, radius = 3, fg = true, bg = false) {
    for (let i = -radius; i <= radius; i++) {
        for (let j = -radius; j <= radius; j++) {
            const bx = x + i;
            const by = y + j;
            if (Math.sqrt(i * i + j * j) <= radius) {
                if (fg) {
                    deleteBlock(bx, by, 'fg');
                }
                if (bg) {
                    deleteBlock(bx, by, 'bg');
                }
            }
        }
    }
}
function openCraftingGUI() {
    // set crafting mode
    player.craftingOpen = true;
    createInventoryUI(); // reload inventory UI
    // make the inventory open
    player.inventoryOpen = true;
    if (player.inventoryOpen) {
        document.body.appendChild(inventoryGrid);
        player.modificationAllowed = false;
    } else {
        document.body.removeChild(inventoryGrid);
        player.modificationAllowed = true;
    }
}

function killClock() {
	clearInterval(clock);
}
function setTickrate(rate) {
	tickrate = rate;
	killClock();
	window.clock = setInterval(gameTick, 1000/tickrate);
}