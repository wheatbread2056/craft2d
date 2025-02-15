// world doesn't store variables and stuff, env stores that. world stores the map
const world = {
    fg: new Map(),
    bg: new Map()
}
const env = {
    global: {
        paused: false,
        targetRate: 60,
        baseGravity: -0.6,
        gravity: 0,
        respawnEnabled: true,
        walljumpEnabled: false,
        flyAllowed: true,
        baseSpeedVelocity: 7.2,
        baseJumpVelocity: 12.6,
        worldSeaLevel: 48,
        worldGenType: 'none',
        worldBottomEnabled: true,
        worldBottomBlock: 'stone4',
        worldBottomImmutable: true,
    },
    player: {
        defaultMaxHealth: 1000,
        defaultSpeedMultiplier: 1,
        defaultJumpMultiplier: 1,
        defaultInvincibility: false,
        defaultRegenRate: 7.5,
    },
};
const player = {
    x: 0, // player x position
    y: 0, // player y position
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
    invulnerable: env.player.defaultInvincibility, // true = no damage & infinite regen rate
    regenRate: env.player.defaultRegenRate, // hp regenerated every second
};
const camera = {
    x: 0,
    y: 0, 
    scale: 1
};
const blockimages = {}
var tickrate = 60;
var mapseed = Math.round(Math.random() * (2147483647*2) - 2147483647);
// var mapseed = 0;
var ticknum = 0;
var lastTick = Date.now();
var tickrateComputed = 60;
var tickrateLow = tickrate;
var tickrateHigh = 0;
var blocksRendered = 0;
var waterimg = `watertop_render1`;
var mapxsize = 0;
var mapstart = null;
var mapend = null;
var debug = false;
var mx = 0; // mouse x
var my = 0; // mouse y
var oldMx = 0;
var oldMy = 0;
var currentblock = 0; // current block in the block selector

function setBlock(x, y, block = 'test', layer = 'fg') {
    // yeah this is going to break everything.
    world[layer].set(`${x},${y}`, block);
}
function getBlock(x, y, layer = 'fg') {
    let block = world[layer].get(`${x},${y}`) || null
    if (y <= -27 && env.global.worldBottomEnabled && block == null) { // for world bottom
        return env.global.worldBottomBlock;
    } else {
        return block;
    }
}
function deleteBlock(x, y, layer = 'fg') {
    world[layer].delete(`${x},${y}`);
}
// no layer for this one because background blocks will never have collision
function getBlockCollision(x, y) {
    let block = getBlock(x,y);
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
        ctx.globalAlpha = 0.8;
    }
    if (isPlayer) {
        ctx.globalAlpha = 0.5;
    }
    ctx.drawImage(blockimages[block], Math.floor(x * 64 * camera.scale), Math.floor(-y * 64 * camera.scale), 64 * camera.scale, 64 * camera.scale);
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
                    if (spawnx < mapstart + 1) {
                        spawnx = mapend - 1;
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
        if (env.global.respawnEnabled) {
            alert('You have died. (press OK to play again)');
            spawnPlayer(0);
            player.health = player.maxHealth;
        } else {
            alert('You have died. (player respawn is disabled - reload or enable respawn, then run managePlayerHealth() in the console');
            player.controlAllowed = false;
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
                    player.mx += -env.global.baseSpeedVelocity / 3 * player.speedMult;
                    if (player.mx < -env.global.baseSpeedVelocity * player.speedMult) {
                        player.mx = -env.global.baseSpeedVelocity * player.speedMult;
                    }
                    player.acc = true;
                }
                if (movementKeys.right) {
                    player.mx += env.global.baseSpeedVelocity / 3 * player.speedMult;
                    if (player.mx > env.global.baseSpeedVelocity * player.speedMult) {
                        player.mx = env.global.baseSpeedVelocity * player.speedMult;
                    }
                    player.acc = true;
                }
            } else {
                if (movementKeys.left) {
                    player.mx += -env.global.baseSpeedVelocity / 24 * player.speedMult;
                }
                if (movementKeys.right) {
                    player.mx += env.global.baseSpeedVelocity / 24 * player.speedMult;
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
                    player.my += 0.1 * player.jumpMult;
                }
                if (movementKeys.down) {
                    player.my -= 0.2 * player.jumpMult;
                }
            }
        }
        
        // fly movement

        else if (player.fly == true) {
            if (movementKeys.left) {
                player.mx += -7.2 * player.speedMult;
                if (player.mx < -24 * player.speedMult) {
                    player.mx = -24 * player.speedMult;
                }
                player.flyx = true;
            }
            if (movementKeys.right) {
                player.mx += 7.2 * player.speedMult;
                if (player.mx > 24 * player.speedMult) {
                    player.mx = 24 * player.speedMult;
                }
                player.flyx = true;
            }
            if (movementKeys.up) {
                player.my += 2.4 * player.jumpMult;
                if (player.my > 12 * player.jumpMult) {
                    player.my = 12 * player.jumpMult;
                }
                player.flyy = true;
            }
            if (movementKeys.down) {
                player.my -= 2.4 * player.jumpMult;
                if (player.my < -12 * player.jumpMult) {
                    player.my = -12 * player.jumpMult;
                }
                player.flyy = true;
            }
        }
    }

    // check if in water
    player.inWater = getBlock(Math.round(player.x),Math.floor(player.y)) == 'water' || getBlock(Math.round(player.x),Math.floor(player.y + 0.5)) == 'watertop';
    if (player.inWater) {
        player.air = false;
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
            player.my += 0.1;
            player.my *= 0.98;
        } else {
            player.my += env.global.gravity;
        }
    }
    
    // momentum & friction
    player.x += player.mx / 60;
    player.y += player.my / 60;
    if (player.fly == false) { // normal non-flying friction
        if (player.air || player.inWater) { // air friction
            player.mx *= 0.98;
        } else if (!player.acc) { // ground friction
            player.mx *= 0.5;
        }
    } else { // flying friction
        if (player.flyx == false) {
            player.mx *= 0.8
        }
        if (player.flyy == false) {
            player.my *= 0.8
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
            };
            player.air = false;
            player.my = 0;
            player.y = Math.ceil(player.y);
        } else {
            if (!player.inWater) {
                player.air = true;
            }
        }
        playerTopTouching = (getBlockCollision(Math.floor(playerleft + (1/8)), Math.floor(playertop + 1)) || getBlockCollision(Math.floor(playerright) - (1/8), Math.floor(playertop + 1)))
        if (playerTopTouching && !playerBottomTouching) {
            player.my = 0;
            player.y = Math.ceil(playerbottom);
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
}

// not currently used - but might be useful later
function getColor(c1, c2, p1, p2) {
    const r = Math.round((c1.r * p1) + (c2.r * p2));
    const g = Math.round((c1.g * p1) + (c2.g * p2));
    const b = Math.round((c1.b * p1) + (c2.b * p2));
    return {r, g, b};
}

function updateTime() {
    waterimg = `watertop_render${Math.floor(ticknum/8+1)-(Math.floor(ticknum/32)*4)}`;

    // sky color changes, up is space and down is void or caves idk which one
    document.body.style.background = `linear-gradient(to bottom, rgb(0, 0, 0) ${player.y - 2500}%, rgb(28, 24, 56) ${player.y - 800}%, rgb(25, 76, 151) ${player.y - 400}%, rgb(36, 125, 207) ${player.y}%, rgb(0,0,0) ${player.y + 200}%)`;
    document.body.style.height = '1000vh';
    document.body.style.margin = '0';

    // update gravity for space
    if (player.y > 400) {
        env.global.gravity = env.global.baseGravity / (player.y/400);
    } else {
        env.global.gravity = env.global.baseGravity;
    }
}

function blockModification() {
    // get the coordinates for the old and new block positions
    let oldBlockX = Math.floor(oldMx / 64 / camera.scale + camera.x);
    let oldBlockY = Math.ceil(-oldMy / 64 / camera.scale + camera.y);
    let newBlockX = Math.floor(mx / 64 / camera.scale + camera.x);
    let newBlockY = Math.ceil(-my / 64 / camera.scale + camera.y);

    // use the burgerham algorhitm for line
    let dx = Math.abs(newBlockX - oldBlockX);
    let dy = Math.abs(newBlockY - oldBlockY);
    let sx = (oldBlockX < newBlockX) ? 1 : -1;
    let sy = (oldBlockY < newBlockY) ? 1 : -1;
    let err = dx - dy;

    while (true) {
        // check if the delete key is pressed to destroy the block
        if (keybinds.delete.some(key => keys[key])) {
            if (getBlock(oldBlockX, oldBlockY) !== 'stone4') {
                deleteBlock(oldBlockX, oldBlockY);
            }
        }
        // check if the place key is pressed to place a block
        if (keybinds.place.some(key => keys[key])) {
            let block = getBlock(oldBlockX, oldBlockY);
            let isWorldBottom = oldBlockY < -26 && env.global.worldBottomEnabled && env.global.worldBottomImmutable;
            let isPlayerPosition = Math.round(player.x) === oldBlockX && Math.round(player.y) === oldBlockY;

            // place the block if it is not restricted
            if (block !== 'stone4' && !isWorldBottom && !isPlayerPosition) {
                if (selblocks[currentblock] === 'grassbg6' || selblocks[currentblock] === 'grassbg7') {
                    setBlock(oldBlockX, oldBlockY, selblocks[currentblock] + 'a');
                    setBlock(oldBlockX, oldBlockY + 1, selblocks[currentblock] + 'b');
                } else {
                    setBlock(oldBlockX, oldBlockY, selblocks[currentblock]);
                }
            }
        }

        // break the loop if the end of the line is reached
        if (oldBlockX === newBlockX && oldBlockY === newBlockY) break;
        let e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            oldBlockX += sx;
        }
        if (e2 < dx) {
            err += dx;
            oldBlockY += sy;
        }
    }
}

function killClock() {
	clearInterval(clock);
}
function setTickrate(rate) {
	tickrate = rate;
	killClock();
	window.clock = setInterval(tick, 1000/tickrate);
}