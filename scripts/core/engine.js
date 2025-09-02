// world doesn't store variables and stuff, env stores that. world stores the map

function chunkKey(cx, cy, layer = 'fg') {
    return `${layer}:${cx},${cy}`;
}
function blockKey(bx, by) {
    return `${bx},${by}`;
}

const world = {
    fg: new Map(), // Map<chunkKey, Map<blockKey, block>>
    bg: new Map(),
    light: new Map()
};
const client = {
    gameTickrateComputed: 60, // computed game tickrate
    renderTickrateComputed: 60, // computed render tickrate
    lastGameTick: Date.now(), // last game tick time
    lastRenderTick: Date.now(), // last render tick time
    blocksRendered: 0, // number of blocks rendered in the last render tick
    mobsRendered: 0,
    debug: false,
    mx: 0, // mouse x position
    my: 0, // mouse y position
    oldMx: 0, // previous mouse x position
    oldMy: 0, // previous mouse y position
    waterimg: 'watertop_render1', // current water image
    inventorySelectedSlot: null,
    withinReach: true,
}
const globalImages = {};
player.inventory.fullInit();

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

function setBlock(x, y, block = 'test', layer = 'fg', data = '') {
    const { cx, cy, bx, by } = getChunkAndBlock(x, y);
    const chunk = getChunkMap(layer, cx, cy, true);
    if (data == '' || data == undefined || data == null) {
        chunk.set(blockKey(bx, by), {id: block}); // no data
    } else {
        chunk.set(blockKey(bx, by), {id: block, data: data});
    }
}
function getBlock(x, y, layer = 'fg') {
    const { cx, cy, bx, by } = getChunkAndBlock(x, y);
    const chunk = getChunkMap(layer, cx, cy, false);
    let block = chunk ? chunk.get(blockKey(bx, by)) : null;
    if (block == undefined) block = null;
    if (y <= -27 && env.global.worldBottomEnabled && block == null) { // for world bottom
        return env.global.worldBottomBlock;
    } else if (block) {
        return block.id || null;
    } else {return null;};
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
    if (block == undefined || block == null) return null;
    if (nocollision.includes(block)) {
        return null;
    } else {
        return true;
    }
}
function showBlock(ctx, x, y, block, bg = false, darkenLevel = 0) { // x and y are relative to document
    // ctx added in alpha 1.5.5 to draw onto a canvas context
    if (darkenLevel != 0 || bg) {
        if (!transparentblocks.includes(block)) {
            ctx.fillStyle = 'black';
            ctx.fillRect(Math.floor(x * 64 * camera.scale), Math.floor(-y * 64 * camera.scale), 64 * camera.scale, 64 * camera.scale);
        }
        if (!bg) {
            ctx.globalAlpha = 1 - darkenLevel;
        } else {
            ctx.globalAlpha = 0.7 * (1 - darkenLevel);
        }
    }
    if (darkenLevel < 1) {
        try {
            ctx.drawImage(globalImages[block], Math.floor(x * 64 * camera.scale), Math.floor(-y * 64 * camera.scale), 64 * camera.scale, 64 * camera.scale);
        } catch (e) {
            ctx.drawImage(globalImages['test'], Math.floor(x * 64 * camera.scale), Math.floor(-y * 64 * camera.scale), 64 * camera.scale, 64 * camera.scale);
        }
    }
    if (bg || darkenLevel != 0) {
        ctx.globalAlpha = 1.0;
    }
}
function showMob(ctx, x, y, mob) { // same as showBlock, but things like water transparency are handled based on mob properties
    // ctx added in alpha 1.5.5 to draw onto a canvas context
    let image = mob.image ?? mob.type ?? 'player';
    if (mob == player) mobType = 'player';
    if (mob.inWater) {
        ctx.globalAlpha = 0.5; // water transparency
    } else {
        ctx.globalAlpha = 1.0;
    }
    try {
        ctx.drawImage(globalImages[image], Math.floor(x * 64 * camera.scale), Math.floor(-y * 64 * camera.scale), 64 * camera.scale, 64 * camera.scale);
    }
    catch (e) {
        ctx.drawImage(globalImages['test'], Math.floor(x * 64 * camera.scale), Math.floor(-y * 64 * camera.scale), 64 * camera.scale, 64 * camera.scale);
    }
    ctx.globalAlpha = 1.0; // reset alpha
}

// notes about light: 0 to 8, affects render darkness of both layers.
function setLight(x, y, value = 8) {
    const { cx, cy, bx, by } = getChunkAndBlock(x, y);
    const chunk = getChunkMap('light', cx, cy, true);
    chunk.set(blockKey(bx, by), value);
}

var lightTempChunk = null; // temporary chunk for light calculations
function getLight(x, y, invert = false) { // invert returns darken level rather than light level (for rendering)
    const { cx, cy, bx, by } = getChunkAndBlock(x, y);
    let chunk;
    if (
        lightTempChunk &&
        lightTempChunk.cx === cx &&
        lightTempChunk.cy === cy
    ) {
        chunk = lightTempChunk.chunk;
    } else {
        chunk = getChunkMap('light', cx, cy, false);
        lightTempChunk = { cx, cy, chunk };
    }
    let lightValue = chunk ? chunk.get(blockKey(bx, by)) : null;
    if (lightValue == undefined) lightValue = null;
    if (!invert) {
        if (lightValue === null) {
            return 8; // max value
        } else {
            return lightValue;
        }
    } else {
        if (lightValue === null) {
            return 0;
        } else {
            return (8 - lightValue) * (1 / 8);
        }
    }
}

function updateLightmap() {
    if (!env.global.lightEnabled) return;
    
    // Check cooldown - skip update if not enough time has passed
    const currentTime = Date.now();
    if (currentTime - env.global.lastLightUpdate < env.global.lightUpdateCooldown) {
        return; // Skip update silently
    }
    
    // Update the last light update timestamp
    env.global.lastLightUpdate = currentTime;
    
    // start timer
    const startTime = performance.now();
    // Use getNearChunks to only update lightmap near the player
    const nearChunks = getNearChunks(env.global.simulationRadius); // radius can be adjusted as needed
    
    // Build a collision map for only the near chunks, cache getBlock/getBlockCollision
    const collisionMap = new Set();
    const blockCache = new Map();
    const collisionCache = new Map();
    function cachedGetBlock(x, y) {
        const key = `${x},${y}`;
        if (blockCache.has(key)) return blockCache.get(key);
        const val = getBlock(x, y);
        blockCache.set(key, val);
        return val;
    }
    function cachedGetBlockCollision(x, y) {
        const key = `${x},${y}`;
        if (collisionCache.has(key)) return collisionCache.get(key);
        const val = getBlockCollision(x, y);
        collisionCache.set(key, val);
        return val;
    }
    for (const {cx, cy} of nearChunks) {
        const chunk = getChunkMap('fg', cx, cy, false);
        if (!chunk) continue;
        for (const [blockKey, block] of chunk) {
            if (!nocollision.includes(block.id)) {
                const [bx, by] = blockKey.split(',').map(Number);
                const x = cx * env.global.chunksize + bx;
                const y = cy * env.global.chunksize + by;
                collisionMap.add(`${x},${y}`);
            }
        }
    }
    
    // Create height map - find highest collision block for each column
    const heightMap = new Map();
    const minX = Math.min(...nearChunks.map(c => c.cx * env.global.chunksize));
    const maxX = Math.max(...nearChunks.map(c => (c.cx + 1) * env.global.chunksize - 1));
    
    for (let x = minX; x <= maxX; x++) {
        let highestY = -1000;
        for (let y = 175; y >= -32; y--) {
            if (collisionMap.has(`${x},${y}`)) {
                highestY = y;
                break;
            }
        }
        heightMap.set(x, highestY);
    }
    
    (async () => {
        // --- OPTIMIZED LIGHTMAP ---
        // Define simulation area
        const minY = -32, maxY = 175;
        const minX = Math.min(...nearChunks.map(c => c.cx * env.global.chunksize));
        const maxX = Math.max(...nearChunks.map(c => (c.cx + 1) * env.global.chunksize - 1));
        const width = maxX - minX + 1;
        const height = maxY - minY + 1;
        // Flat arrays for light and queue membership
        const lightArr = new Uint8Array(width * height);
        const inQueue = new Uint8Array(width * height);
        // Helper to index
        function idx(x, y) { return (x - minX) + (y - minY) * width; }
        // Phase 1: Sky light
        for (let x = minX; x <= maxX; x++) {
            const highestBlockY = heightMap.get(x) || -1000;
            for (let y = minY; y <= maxY; y++) {
                let skyLight = 0;
                if (y > highestBlockY) skyLight = env.global.skyLightLevel;
                lightArr[idx(x, y)] = skyLight;
            }
        }
        // Phase 2: Propagation
        const queue = [];
        // Enqueue all sky-lit blocks
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                if (lightArr[idx(x, y)] === env.global.skyLightLevel) {
                    queue.push([x, y, env.global.skyLightLevel]);
                    inQueue[idx(x, y)] = 1;
                }
            }
        }
        // Propagate
        while (queue.length) {
            const [x, y, light] = queue.shift();
            if (light <= 1) continue;
            const directions = [[0,1],[0,-1],[1,0],[-1,0]];
            for (const [dx, dy] of directions) {
                const nx = x + dx, ny = y + dy;
                if (nx < minX || nx > maxX || ny < minY || ny > maxY) continue;
                const nidx = idx(nx, ny);
                if (lightArr[nidx] + 1 < light) {
                    lightArr[nidx] = light - 1;
                    if (!inQueue[nidx]) {
                        queue.push([nx, ny, light - 1]);
                        inQueue[nidx] = 1;
                    }
                }
            }
        }
        // Phase 3: Ambient light for air blocks
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                const pos = `${x},${y}`;
                if (!collisionMap.has(pos) && !cachedGetBlock(x, y)) {
                    if (lightArr[idx(x, y)] < env.global.minLightLevel) {
                        lightArr[idx(x, y)] = env.global.minLightLevel;
                        queue.push([x, y, 1 + env.global.minLightLevel]);
                        inQueue[idx(x, y)] = 1;
                    }
                }
            }
        }
        // Propagate ambient
        while (queue.length) {
            const [x, y, light] = queue.shift();
            if (light <= 1) continue;
            const directions = [[0,1],[0,-1],[1,0],[-1,0]];
            for (const [dx, dy] of directions) {
                const nx = x + dx, ny = y + dy;
                if (nx < minX || nx > maxX || ny < minY || ny > maxY) continue;
                const nidx = idx(nx, ny);
                if (lightArr[nidx] + 1 < light) {
                    lightArr[nidx] = light - 1;
                    if (!inQueue[nidx]) {
                        queue.push([nx, ny, light - 1]);
                        inQueue[nidx] = 1;
                    }
                }
            }
        }
        // Phase 4: Write back to world
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                const val = lightArr[idx(x, y)];
                if (getLight(x, y) !== val) setLight(x, y, val);
            }
        }
        // report total time spent
        const endTime = performance.now();
        console.log(`Advanced lightmap updated in ${Math.round(endTime - startTime)}ms`);
    })();
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
                    player.inventory.fullInit();
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
// this says player physics but its also for mobs, just not renaming it cause it will break a LOT.
function playerPhysics(target) {
    let movement = {};
    if (target == player) {
        movement = movementKeys;
    } else if (target.movement) {
        movement = target.movement;
    };
    // user-triggered actions aka movement
    if (target.controlAllowed) {
        if (target.fly == false) {
            if (movement.left) {
                target.mx += -env.global.baseSpeedVelocity / 3 / (client.renderTickrateComputed / 60) * target.speedMult;
                if (target.mx < -env.global.baseSpeedVelocity * target.speedMult) {
                    target.mx = -env.global.baseSpeedVelocity * target.speedMult;
                }
                target.acc = true;
            }
            if (movement.right) {
                target.mx += env.global.baseSpeedVelocity / 3 / (client.renderTickrateComputed / 60) * target.speedMult;
                if (target.mx > env.global.baseSpeedVelocity * target.speedMult) {
                    target.mx = env.global.baseSpeedVelocity * target.speedMult;
                }
                target.acc = true;
            }
            if (!target.inWater) {
                // took me an insanely long amount of time to find this
                // but this is for the target ** JUMP **
                if (movement.up && target.air == false) {
                    // 0.21 y vel = around 2.1 block jump height and 0.2 is under 2 blocks
                    target.my = env.global.baseJumpVelocity * target.jumpMult;
                    target.air = true;
                }
            }
            else { // water movement
                if (movement.up) {
                    target.my += 0.1 / (client.renderTickrateComputed / 60) * target.jumpMult;
                }
                if (movement.down) {
                    target.my -= 0.4 / (client.renderTickrateComputed / 60) * target.jumpMult;
                }
            }
        }
        
        // fly movement

        else if (target.fly == true) {
            if (movement.left) {
                target.mx += -7.2 / (client.renderTickrateComputed / 60) * target.speedMult;
                if (target.mx < -24 * target.speedMult) {
                    target.mx = -24 * target.speedMult;
                }
                target.flyx = true;
            }
            if (movement.right) {
                target.mx += 7.2 / (client.renderTickrateComputed / 60) * target.speedMult;
                if (target.mx > 24 * target.speedMult) {
                    target.mx = 24 * target.speedMult;
                }
                target.flyx = true;
            }
            if (movement.up) {
                target.my += 2.4 / (client.renderTickrateComputed / 60) * target.jumpMult;
                if (target.my > 12 * target.jumpMult) {
                    target.my = 12 * target.jumpMult;
                }
                target.flyy = true;
            }
            if (movement.down) {
                target.my -= 2.4 / (client.renderTickrateComputed / 60) * target.jumpMult;
                if (target.my < -12 * target.jumpMult) {
                    target.my = -12 * target.jumpMult;
                }
                target.flyy = true;
            }
        }
    }

    // check if in water
    let previousWater = target.inWater;
    target.inWater = getBlock(Math.round(target.x),Math.floor(target.y)) == 'water' || getBlock(Math.round(target.x),Math.floor(target.y + 0.5)) == 'watertop';
    if (target.inWater) {
        target.air = false;
    }
    if (target.inWater && !previousWater) {
        // this is very loud.
        // playSound('sfx/splash.wav', 0.4);
    }

    // disable acceleration mode when needed (prevents endless sliding)
    if (target.fly == false) {
        if (!(movement.left || movement.right)) {
            target.acc = false;
        }
    } else {
        if (!(movement.left || movement.right)) {
            target.flyx = false;
        }
        if (!(movement.up || movement.down)) {
            target.flyy = false;
        }
    }
    

    // gravity
    if (target.fly == false) {
        if (target.inWater) { // buoyancy
            target.my += 0.2 / (client.renderTickrateComputed / 60);
            target.my *= Math.pow(0.99, 60 / client.renderTickrateComputed);
        } else {
            target.my += env.global.gravity * (60 / client.renderTickrateComputed);
        }
    }
    
    for (let i = 0; i < env.global.physicsQuality; i++) {
        // momentum & friction
        target.x += target.mx / client.renderTickrateComputed / env.global.physicsQuality;
        target.y += target.my / client.renderTickrateComputed / env.global.physicsQuality;
        if (target.fly == false) { // normal non-flying friction
            if (!target.acc) {
                if (target.air || target.inWater) { // air friction
                    target.mx *= Math.pow(0.65, 60 / client.renderTickrateComputed / env.global.physicsQuality);
                } else { // ground friction
                    target.mx *= Math.pow(0.5, 60 / client.renderTickrateComputed / env.global.physicsQuality);
                }
            }
            if (Math.abs(target.mx) > env.global.baseSpeedVelocity * target.speedMult) {
                if (target.mx > 0) {
                    target.mx = env.global.baseSpeedVelocity * target.speedMult;
                } else {
                    target.mx = -env.global.baseSpeedVelocity * target.speedMult;
                }
            }
        } else { // flying friction
            if (target.flyx == false) {
                target.mx *= Math.pow(0.8, 60 / client.renderTickrateComputed / env.global.physicsQuality);
            }
            if (target.flyy == false) {
                target.my *= Math.pow(0.8, 60 / client.renderTickrateComputed / env.global.physicsQuality);
            }
        }
        
        // COLLISION
        // rewritten in alpha 1.8 - should be much better
        // this is actually AMAZING.
        if (!target.noclip) {
            playertop = target.y;
            playerbottom = target.y - 1;
            playerleft = target.x;
            playerright = target.x + 1;
            playerLeftTouching = (getBlockCollision(Math.floor(playerleft), Math.round(target.y)));
            playerRightTouching = (getBlockCollision(Math.floor(playerright), Math.round(target.y)));
            // target bottom collision
            if (playerLeftTouching) {
                target.mx = 0;
                target.x = Math.ceil(playerleft);
            }
            if (playerRightTouching) {
                target.mx = 0;
                target.x = Math.floor(playerleft);
            }
            playerBottomTouching = (getBlockCollision(Math.floor(playerleft + (1/8)), Math.ceil(playerbottom)) || getBlockCollision(Math.floor(playerright - (1/8)), Math.ceil(playerbottom)));
            if (playerBottomTouching) {
                if (target.my < -21.6 && !target.invulnerable) {
                    // fall damage based on the target's vertical velocity
                    target.health -= ((target.my*2/60) * (target.my*2/60) * (target.my*2/60) * (target.my*2/60)) * 160;
                    handlePlayerHealth(target);
                    playSound('sfx/hitHurt.wav');
                };
                target.air = false;
                target.my = 0;
                target.y = Math.ceil(target.y);
            } else {
                if (!target.inWater) {
                    target.air = true;
                }
            }
            playerTopTouching = (getBlockCollision(Math.floor(playerleft + (1/8)), Math.floor(playertop + 1)) || getBlockCollision(Math.floor(playerright - (1/8)), Math.floor(playertop + 1)))
            if (playerTopTouching && !playerBottomTouching) {
                target.my = 0;
                target.y = Math.floor(playertop);
            }
        }
    }
}

// not currently used - but might be useful later
function getColor(c1, c2, p1, p2) {
    const r = Math.round((c1.r * p1) + (c2.r * p2));
    const g = Math.round((c1.g * p1) + (c2.g * p2));
    const b = Math.round((c1.b * p1) + (c2.b * p2));
    return {r, g, b};
}

function updateTime() {
    // update the water image
    const waterImages = ['watertop_render1', 'watertop_render2', 'watertop_render3', 'watertop_render4'];
    waterimg = waterImages[Math.floor((Date.now() % 500) / 125)];

    // Update the time of day (7200 game ticks = 1 day)
    let startingHour = 7; // 7 AM is the starting hour, in Sunrise stage 2. startingHour isn't meant to be changed.
    let hour = ((env.global.gameTickNum + (startingHour * 300)) % 7200) / 7200 * 24;
    env.global.time = hour;

    // code taken from an old version and slightly modified. and by slightly i mean a lot.
    const min = env.global.minLightLevel ?? 4;

    // Define cycle colors outside the daylight cycle logic for easier customization
    const DAY_COLOR = { r: 36, g: 125, b: 207 };
    const SUNSET_COLOR = { r: 143, g: 61, b: 7 };
    const NIGHT_COLOR = { r: 24, g: 14, b: 41 };

    if (hour >= 8 && hour < 16) {
        // Day: full sky light
        env.global.primarySkyboxColor = `rgb(${DAY_COLOR.r},${DAY_COLOR.g},${DAY_COLOR.b})`;
        env.global.skyLightLevel = 8;
    } else if (hour >= 16 && hour < 20) { // sunset
        // Transition sky color from day to night via sunset
        const t = (hour - 16) / (20 - 16);
        // Blend: day -> sunset -> night
        let c;
        if (t < 0.5) {
            // Day to sunset
            const t2 = t * 2;
            c = getColor(DAY_COLOR, SUNSET_COLOR, 1 - t2, t2);
        } else {
            // Sunset to night
            const t2 = (t - 0.5) * 2;
            c = getColor(SUNSET_COLOR, NIGHT_COLOR, 1 - t2, t2);
        }
        env.global.primarySkyboxColor = `rgb(${c.r},${c.g},${c.b})`;
        // Transition sky light from 8 to min
        env.global.skyLightLevel = Math.round(8 - (8 - min) * t);
        updateLightmap();
    } else if (hour >= 20 || hour < 4) { // night
        env.global.primarySkyboxColor = `rgb(${NIGHT_COLOR.r},${NIGHT_COLOR.g},${NIGHT_COLOR.b})`;
        env.global.skyLightLevel = min;
    } else if (hour >= 4 && hour < 8) { // sunrise (reverse sunset)
        const t = (hour - 4) / (8 - 4);
        let c;
        if (t < 0.5) {
            // Night to sunset
            const t2 = t * 2;
            c = getColor(NIGHT_COLOR, SUNSET_COLOR, 1 - t2, t2);
        } else {
            // Sunset to day
            const t2 = (t - 0.5) * 2;
            c = getColor(SUNSET_COLOR, DAY_COLOR, 1 - t2, t2);
        }
        env.global.primarySkyboxColor = `rgb(${c.r},${c.g},${c.b})`;
        let pastLightLevel = env.global.skyLightLevel;
        env.global.skyLightLevel = Math.round(min + (8 - min) * t);
        if (pastLightLevel != env.global.skyLightLevel) updateLightmap();
    }
    
    // update the skybox
    // Dynamically update skybox colors based on current primarySkyboxColor
    // Parse the primary color
    const primaryColor = env.global.primarySkyboxColor.match(/\d+/g).map(Number);

    // Helper to clamp values
    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    // High blue: darker version of primary (multiply by 0.5)
    const highBlue = `rgb(${primaryColor.map(c => clamp(Math.round(c * 0.5), 0, 255)).join(',')})`;

    // Light blue (cloud layer): blend with white, lower saturation
    // Blend 60% primary, 40% white
    const lightBlue = `rgb(${primaryColor.map(c => clamp(Math.round(c * 0.6 + 255 * 0.4), 0, 255)).join(',')})`;

    // Compose the skybox array
    env.global.skybox = [
        ['rgb(0,0,0)', 800],          // Space/black at high altitudes
        [highBlue, 400],              // Dynamic high blue
        ['rgb(25,76,151)', 192],      // Dusk/dawn blue (static)
        [lightBlue, 128],             // Dynamic light blue (cloud layer)
        [env.global.primarySkyboxColor, 96], // Dynamic primary color
        [env.global.primarySkyboxColor, 0],  // Dynamic primary color at ground
        ['rgb(0,0,0)', -200]          // Underground/black
    ];

    // Calculate the sky color based on player's y position
    // TODO: fix this being inconsistent and not actually working right on firefox
    let gradientStops = env.global.skybox.map(([color, y]) => {
    let position = ((player.y - y)) * 10 + 50;
    return `${color} ${position}%`;
    }).join(', ');

    document.body.style.background = `linear-gradient(to bottom, ${gradientStops})`;
    document.body.style.height = '100vh';
    document.body.style.margin = '0';
    
    // a fragment of legacy code. avoids issues.
    env.global.gravity = env.global.baseGravity;
}

function blockModification() {
    if (!player.modificationAllowed) return;
    let layer = player.interactionLayer;

    let blockX, blockY

    // get the coordinates for the block position under the mouse
    if (getMobileStatus()) {
        blockX = Math.floor(mobileInputSelection.x / 64 / camera.scale + camera.x);
        blockY = Math.ceil(-mobileInputSelection.y / 64 / camera.scale + camera.y);
    } else {
        blockX = Math.floor(client.mx / 64 / camera.scale + camera.x);
        blockY = Math.ceil(-client.my / 64 / camera.scale + camera.y);
    }

    // block breaking
    if (keybinds.delete.some(key => keys[key]) && player.breakingBlock == false) {
        player.breakingBlock = true;
    }
    if (!keybinds.delete.some(key => keys[key]) && player.breakingBlock == true) {
        player.breakingBlock = false;
    }

    // make sure this block is within reach.
    if (Math.abs(blockX - player.x) > player.reachDistance || Math.abs(blockY - player.y) > player.reachDistance) {
        client.withinReach = false;
        return; // out of reach
    } else {
        client.withinReach = true;
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
                    player.inventory.addItem(drop, 1);
                }
                // lower durability
                player.inventory.lowerDurability(player.currentSlot);
                createInventoryUI();
                if (blockactions[block] && blockactions[block].onBreak) {
                    blockactions[block].onBreak(player.blockX, player.blockY, layer);
                }
                updateLightmap();
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

        // make sure the block will be placed either in front of a background block or right next to a block
        let hasBgBlock = getBlock(blockX, blockY, 'bg') !== null;
        let hasNearBlock = getBlockCollision(blockX - 1, blockY) || getBlockCollision(blockX + 1, blockY) || getBlockCollision(blockX, blockY - 1) || getBlockCollision(blockX, blockY + 1) || getBlockCollision(blockX + 1, blockY + 1) || getBlockCollision(blockX - 1, blockY + 1) || getBlockCollision(blockX + 1, blockY - 1) || getBlockCollision(blockX - 1, blockY - 1);
        let hasNearBgBlock = getBlock(blockX - 1, blockY, 'bg') || getBlock(blockX + 1, blockY, 'bg') || getBlock(blockX, blockY - 1, 'bg') || getBlock(blockX, blockY + 1, 'bg') || getBlock(blockX + 1, blockY + 1, 'bg') || getBlock(blockX - 1, blockY + 1, 'bg') || getBlock(blockX + 1, blockY - 1, 'bg') || getBlock(blockX - 1, blockY - 1, 'bg');
        if (!hasBgBlock && !hasNearBlock && !hasNearBgBlock) return;

        // place the block if there's empty space and the held item is a block.
        if ((getBlockCollision(blockX, blockY, layer) == null && layer == 'fg' || block == null && layer == 'bg') && allblocks.includes(player.currentItem)) {
            setBlock(blockX, blockY, player.currentItem, layer);
            player.inventory.removeSlot(player.currentSlot, 1);
            if (player.inventory.getSlot(player.currentSlot).amount <= 0) {
                player.inventory.getSlot(player.currentSlot).id = null; // remove the block from the inventory if amount is 0
            }
            createInventoryUI();
            if (blockactions[player.currentItem] && blockactions[player.currentItem].onPlace) {
                blockactions[player.currentItem].onPlace(blockX, blockY, layer);
            }
            updateLightmap();
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

    // sand-like
    const fallingBlocks = ['sand', 'dirt', 'grass1', 'grass2', 'grass3', 'grass4', 'cobblestone1', 'cobblestone2', 'cobblestone3', 'flower1', 'flower2','flower3','flower4','flower5','flower6','flower7','flower8','cactus','grassbg1','grassbg2','grassbg3','grassbg4','grassbg5','grassbg6a','grassbg6b','grassbg7a','grassbg7b','crafter','crate'];

    let blockPhysicsOccurred = false;

    // sand/gravity block physics
    // 1. look for falling blocks in the near chunks
    for (const {cx, cy} of nearChunks) {
        const chunk = getChunkMap('fg', cx, cy, false);
        if (!chunk) continue;
        for (const [blockKey, block] of chunk.entries()) {
            if (fallingBlocks.includes(block.id)) {
                const [bx, by] = blockKey.split(',').map(Number);
                const x = cx * env.global.chunksize + bx;
                const y = cy * env.global.chunksize + by;
                // Skip if this block was already updated after falling
                if (sandUpdated.has(`${x},${y}`)) continue;
                // check if the block below is empty
                if (getBlockCollision(x, y - 1) == null) {
                    deleteBlock(x, y);
                    setBlock(x, y - 1, block.id);
                    sandUpdated.add(`${x},${y-1}`);
                    blockPhysicsOccurred = true;
                }
            }
        }
    }
    // 2. same thing for background
    for (const {cx, cy} of nearChunks) {
        const chunk = getChunkMap('bg', cx, cy, false);
        if (!chunk) continue;
        for (const [blockKey, block] of chunk.entries()) {
            if (fallingBlocks.includes(block.id)) {
                const [bx, by] = blockKey.split(',').map(Number);
                const x = cx * env.global.chunksize + bx;
                const y = cy * env.global.chunksize + by;
                // Skip if this block was already updated after falling
                if (sandUpdated.has(`bg:${x},${y}`)) continue;
                // check if the block below is empty in bg layer
                if (getBlock(x, y - 1, 'bg') == null) {
                    deleteBlock(x, y, 'bg');
                    setBlock(x, y - 1, block.id, 'bg');
                    sandUpdated.add(`bg:${x},${y-1}`);
                    blockPhysicsOccurred = true;
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
            if (block.id == 'watertop') {
                const [bx, by] = blockKey.split(',').map(Number);
                const x = cx * env.global.chunksize + bx;
                const y = cy * env.global.chunksize + by;
                if (watertopUpdated.has(`${x},${y}`)) continue;
                if (getBlockCollision(x - 1, y) == null && getBlock(x - 1, y) !== 'watertop') setBlock(x - 1, y, 'watertop'), watertopUpdated.add(`${x-1},${y}`), blockPhysicsOccurred = true;
                if (getBlockCollision(x + 1, y) == null && getBlock(x + 1, y) !== 'watertop') setBlock(x + 1, y, 'watertop'), watertopUpdated.add(`${x+1},${y}`), blockPhysicsOccurred = true;
                // place water below
                if (getBlockCollision(x, y - 1) == null && getBlock(x, y - 1) !== 'water') {
                    setBlock(x, y - 1, 'water');
                    waterUpdated.add(`${x},${y-1}`);
                    blockPhysicsOccurred = true;
                }
            }
        }
    }
    // then, expand water blocks downwards, left, and right
    for (const {cx, cy} of nearChunks) {
        const chunk = getChunkMap('fg', cx, cy, false);
        if (!chunk) continue;
        for (const [blockKey, block] of chunk.entries()) {
            if (block && block.id == 'water') {
                const [bx, by] = blockKey.split(',').map(Number);
                const x = cx * env.global.chunksize + bx;
                const y = cy * env.global.chunksize + by;
                if (waterUpdated.has(`${x},${y}`)) continue;
                if (getBlockCollision(x, y - 1) == null && getBlock(x, y - 1) !== 'water') {
                    setBlock(x, y - 1, 'water');
                    waterUpdated.add(`${x},${y-1}`);
                    blockPhysicsOccurred = true;
                }
                if (getBlockCollision(x - 1, y) == null && getBlock(x - 1, y) !== 'water') {
                    setBlock(x - 1, y, 'water');
                    waterUpdated.add(`${x-1},${y}`);
                    blockPhysicsOccurred = true;
                }
                if (getBlockCollision(x + 1, y) == null && getBlock(x + 1, y) !== 'water') {
                    setBlock(x + 1, y, 'water');
                    waterUpdated.add(`${x+1},${y}`);
                    blockPhysicsOccurred = true;
                }
            }
        }
    }

    // If any block physics occurred, update the lightmap
    if (blockPhysicsOccurred) {
        updateLightmap();
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
    updateLightmap();
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

function openCrateGUI(x, y) {
    // Ensure crates is initialized as a Map // safety check from bröt
    if (!(player.crates instanceof Map)) {
        player.crates = new Map();
    }
    
    const crateKey = `${x},${y}`;
    
    if (!player.crates.has(crateKey)) {
        const crateData = {
            items: {},
            size: 27
        };
        for (let i = 1; i <= crateData.size; i++) {
            crateData.items[i] = {id: null, amount: 0};
        }
        player.crates.set(crateKey, crateData);
    }
    
    player.currentCrate = crateKey;
    player.crateOpen = true;
    player.inventoryOpen = true;
    createInventoryUI();
    document.body.appendChild(inventoryGrid);
    player.modificationAllowed = false;
}

function roamingAround() { // this function idk what to call it, but it just checks if the player is in a new chunk since the last frame, and does things if it does
    const cx = Math.floor(player.x / env.global.chunksize);
    const cy = Math.floor(player.y / env.global.chunksize);
    if (cx !== player.lastChunkX || cy !== player.lastChunkY) {
        player.lastChunkX = cx;
        player.lastChunkY = cy;
        // do things here, like update lightmap or spawn mobs
        updateLightmap();
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