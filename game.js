const blocks = new Map(); // will be replaced with chunk loading at some point (2025)
const env = {
    global: {
        gravity: -0.6,
        respawnEnabled: true,
        walljumpEnabled: false,
        flyAllowed: true,
        baseSpeedVelocity: 7.2,
        baseJumpVelocity: 12.6,
        worldSeaLevel: 48,
        worldGenType: 'normal',
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
const keys = {
    // example keys
    'a': false,
    'w': false,
    'd': false,
    'ArrowLeft': false,
    'ArrowRight': false,
    'ArrowUp': false,
    'Space': false,
};
const movementKeys = {
    'left': false,
    'right': false,
    'jump': false,
};

var currentblock = 0; // current block in the block selector
const blocknames = { // blocks without a proper name will use their ID in the block selector
    stone1: 'Stone',
    stone2: 'Dark Stone',
    stone3: 'Very Dark Stone',
    stone4: 'Unbreakable Stone',
    dirt: 'Dirt',
    grass1: 'Autumn Grass',
    grass2: 'Meadow Grass',
    grass3: 'Woods Grass',
    grass4: 'Snowy Grass',
    sand: 'Sand',
    log1: 'Autumn Log',
    log2: 'Meadow Log',
    log3: 'Woods Log',
    planks1: 'Autumn Planks',
    planks2: 'Meadow Planks',
    planks3: 'Woods Planks',
    water: 'Water',
    leaves1: 'Yellow Autumn Leaves',
    leaves2: 'Orange Autumn Leaves',
    leaves3: 'Red Autumn Leaves',
    leaves4: 'Bright Yellow Autumn Leaves',
    leaves5: 'Green Meadow Leaves',
    leaves6: 'Dark Woods Leaves',
    leaves7: 'Snowy Leaves',
    bricks: 'Bricks',
    stonebricks: 'Stone Bricks',
    dirtbricks: 'Dirt Bricks',
    goldbricks: 'Gold Bricks',
    cactus: 'Cactus',
    crate: 'Wooden Crate',
    glass: 'Glass',
	flower1: 'Red Flower',
	flower2: 'Orange Flower',
	flower3: 'Yellow Flower',
	flower4: 'Green Flower',
	flower5: 'Teal Flower',
	flower6: 'Blue Flower',
	flower7: 'Violet Flower',
	flower8: 'Pink Flower',
}

// all blocks (required to generate block images for rendering)
const allblocks = ['dirt','grass1','grassbg1','grassbg2','grassbg3','grassbg4','grassbg5','grassbg6a','grassbg6b','grassbg7a','grassbg7b','leaves1','leaves2','leaves3','leaves4','log1','log2','log3','player','sand','stone1','stone2','stone3','stone4','test','water','watertop_render1','watertop_render2','watertop_render3','watertop_render4','watertop','leaves5','leaves6','bricks','stonebricks','dirtbricks','goldbricks','cactus','crate','grass2','grass3','glass','planks1','planks2','planks3','flower1','flower2','flower3','flower4','flower5','flower6','flower7','flower8','leaves7','grass4'];

// blocks that never have collision
const nocollision = ['grassbg1','grassbg2','grassbg3','grassbg4','grassbg5','grassbg6a','grassbg6b','grassbg7a','grassbg7b','watertop','water','flower1','flower2','flower3','flower4','flower5','flower6','flower7','flower8'];

// selectable blocks
const selblocks = ['dirt','planks1','planks2','planks3','glass','crate','bricks','stonebricks','dirtbricks','goldbricks','log1','log2','log3','sand','stone1','stone2','stone3','water','grass1','grass2','grass3','grass4','cactus','leaves1','leaves2','leaves3','leaves4','leaves5','leaves6','leaves7','sand','grassbg1','grassbg2','grassbg3','grassbg4','grassbg5','grassbg6','grassbg7','flower1','flower2','flower3','flower4','flower5','flower6','flower7','flower8'];

// generate block images
for (const i in allblocks) {
    blk = allblocks[i];
    const imagekey = `block_${blk}`
    blockimages[imagekey] = new Image();
    blockimages[imagekey].src = `images/block_${blk}.png`;
}

// set up html

// canvas + ctx
const canvas = document.createElement('canvas');
canvas.style = `position:absolute;top:0;left:0;margin:0`;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const globalCtx = canvas.getContext('2d');
globalCtx.imageSmoothingEnabled = false;
document.body.appendChild(canvas);

// info text
const infoLn1 = document.createElement('p');
infoLn1.setAttribute('class', 'infotext');
infoLn1.innerHTML = 'Coordinates: (x, y)';
document.body.appendChild(infoLn1);

const infoLn2 = document.createElement('p');
infoLn2.setAttribute('class', 'infotext');
infoLn2.setAttribute('style', 'top:24px');
infoLn2.innerHTML = 'Time: hh:mm';
document.body.appendChild(infoLn2);

const infoLn3 = document.createElement('p');
infoLn3.setAttribute('class', 'infotext');
infoLn3.setAttribute('style', 'top:48px');
infoLn3.innerHTML = 'Camera scale: 1.23x';
document.body.appendChild(infoLn3);

// version text
const versionText = document.createElement('p');
versionText.setAttribute('class', 'infotext2');
versionText.innerHTML = version
document.body.appendChild(versionText);

// controls text
const controlsKeybind = document.createElement('p');
controlsKeybind.setAttribute('class', 'infotext3');
controlsKeybind.innerHTML = 'hold <b>q</b> for controls.';
document.body.appendChild(controlsKeybind);

const controlsList = document.createElement('pre');
controlsList.setAttribute('class', 'infotext3');
controlsList.innerHTML = `blocks are deleted and placed at the <b>mouse</b>
<b>move</b>: WASD / arrows
<b>delete block</b>: z
<b>place block</b>: x
<b>toggle fly mode</b>: c
<b>choose block</b>: n / m
<b>change zoom</b>: - / 0 / +`;
document.body.appendChild(controlsList);

// block selector (replacing soon)
const blockSelector = document.createElement('p');
blockSelector.setAttribute('class', 'blockselector');
blockSelector.innerHTML = 'Block (1/99)';
document.body.appendChild(blockSelector);

// key events . part 1
function keydownEvent(key) {
    if (key == ' ') { // bind ' ' (can't access) to 'Space' in keys object
        keys.Space = true;
    }
    if (key == '`') { // debug mode toggle
        if (debug == false) {
            debug = true;
        } else {
            debug = false;
        }
    }
    if (key == 'c' && env.global.flyAllowed) { // fly mode toggle
        if (player.fly) {
            player.fly = false;
        } else {
            player.fly = true;
        }
    }
    if (key == 'm') { // next block
        currentblock++;
        if (currentblock >= selblocks.length) {
            currentblock = 0;
        }
    }
    if (key == 'n') { // previous block
        currentblock--;
        if (currentblock < 0) {
            currentblock = selblocks.length - 1;
        }
    }
    if (key == '-') { // zoom out
        camera.scale *= 0.5;
        if (camera.scale < 0.25) {
            camera.scale = 0.25;
        }
        camera.scale = Math.round(camera.scale*1000)/1000;
    }
    if (key == '=') { // zoom in
        camera.scale *= 2;
        if (camera.scale > 2) {
            camera.scale = 2;
        }
        camera.scale = Math.round(camera.scale*1000)/1000;
    }
    if (key == '0') { // reset zoom
        camera.scale = 1;
    }
    // fixes for capslock / shift
    if (key == 'CapsLock' || key == 'Shift') { // when capslock or shift is pressed
        for (possiblyLowerKey in keys) { // check all the keys in the object
            if (possiblyLowerKey == possiblyLowerKey.toLowerCase()) { // see if the keys are lowercase
                keyupEvent(possiblyLowerKey); // if the keys are lowercase, set them to false
            }
        }
    }
    keys[key] = true;
}

function keyupEvent(key) {
    keys[key] = false;
    if (key == ' ') {
        keys.Space = false; 
    }
}

// key events
window.addEventListener('keydown', (event) => {keydownEvent(event.key)});
window.addEventListener('keyup', (event) => {keyupEvent(event.key)})

// ensure that movement keys get updated
function updateMovementKeys() {
    movementKeys.left = (keys.a || keys.A || keys.ArrowLeft);
    movementKeys.right = (keys.d || keys.D || keys.ArrowRight);
    movementKeys.up = (keys.Space || keys.w || keys.W || keys.ArrowUp);
    movementKeys.down = (keys.s || keys.S || keys.ArrowDown);
}

// update mouse pos
document.addEventListener('mousemove', (event) => {
    mx = event.clientX;
    my = event.clientY;
});

function setBlock(x, y, block = 'test', bg = false) {
    blocks.set(`${x},${y}`, [block, bg]);
}
function getBlock(x, y) {
    let block = blocks.get(`${x},${y}`) || [null, true]
    if (y <= -27 && env.global.worldBottomEnabled && block[0] == null) { // for world bottom
        return [env.global.worldBottomBlock, false];
    } else {
        return block;
    }
}
function deleteBlock(x, y) {
    blocks.delete(`${x},${y}`);
}
function getBlockCollision(x, y) {
    let block = getBlock(x,y);
    if (nocollision.includes(block[0])) {
        return null;
    } else if (block[1] == true) {
        return null;
    } else {
        return true;
    }
}
function showBlock(ctx, x, y, block) { // x and y are relative to document
    // ctx added in alpha 1.5.5 to draw onto a canvas context
    const isPlayer = (block == 'player' && player.inWater == true && player.fly == false);
    if (isPlayer) {
        ctx.globalAlpha = 0.5;
    }
    ctx.drawImage(blockimages['block_' + block], Math.floor(x * 64 * camera.scale), Math.floor(-y * 64 * camera.scale), 64 * camera.scale, 64 * camera.scale);
    if (isPlayer) {
        ctx.globalAlpha = 1;
    }
}

// functions for noise world gen
// code credit https://observablehq.com/@bensimonds/perlin-noise
function fade(t) {
    return t*t*t*(t*(t*6-15)+10);
}
function lerp(a,b,t) {
    return ((1-t) * a) + (t * b);
}
function noise1d(cells, x) {
    const _x = Math.floor(x); // get unit
    x = x - _x; // distance within integer
    const g1 = cells[_x]; 
    const g2 = cells[_x+1];
    return lerp(g1, g2, fade(x))
}

// world gen
var worldgen = {x:0, y:0, scale:1, treedelay:0};
function mapgenrandom(id) { // makes random number generation easier, id doesn't repeat for 100k blocks
    return new Math.seedrandom(mapseed + worldgen.x + (id * 100000))();
}
// noise generation stuff (very inefficient)
if (env.global.worldGenType == 'normal') {
    var cells1d = [[],[],[],[],[],[]]; // 6 levels of noise
    var scale1d = [];
    var biome1d = [];
    for (var i1 = 0; i1 < cells1d.length; i1++) {
        for (var i = 0; i < 131072; i++) {
            cells1d[i1].push(mapgenrandom(-10 + (i / 100000)));
        }
        console.log(`${Math.floor(i1/(cells1d.length)*100)}% finished generating map noise (${i1+1}/${cells1d.length+1})`);
    }
    // do something similar for scale1d (256 blocks per integer)
    for (var i = 0; i < 65536; i++) {
        scale1d.push(mapgenrandom(-9 + (i / 100000)));
    }

    // do something similar for biome1d (512 blocks per integer)
    for (var i = 0; i < 65536; i++) {
        biome1d.push(mapgenrandom(-19 + (i / 100000)));
    }
    console.log(`100% finished generating map noise (7/7)`);
} else {
    console.log(`Noise generation skipped (worldgen type set to ${env.global.worldGenType})`);
}
var treerate = 0.12;

function worldGen(start, end) {
    worldgen = {x:start, y:0, scale:1, treedelay:0, biome:0};
    if (env.global.worldGenType == 'normal') {
        for (var z = start; z < end; z++) {
            worldgen.y = (noise1d(cells1d[0], 32768 + worldgen.x / 128) * 64); // 128 blocks per integer, 64 blocks range
            for (var noiselayer = 1; noiselayer < cells1d.length; noiselayer++) {
                worldgen.y += (noise1d(cells1d[noiselayer], 32768 + worldgen.x / (128/(2 ** noiselayer))) * (32/(2 ** noiselayer)));
            }
            worldgen.scale = noise1d(scale1d, 32768 + worldgen.x / 256) * 1.2 + 0.8;
            worldgen.biome = Math.floor(noise1d(biome1d, 32768 + worldgen.x / 512) * 4)
            // biome 0 = autumn hills, biome 1 = meadows, biome 2 = desert, biome 3 = woods
            worldgen.y *= worldgen.scale;
            worldgen.y = Math.floor(worldgen.y);

            treerate += (mapgenrandom(1) * 0.01 - 0.005);
            if (treerate > 0.16) {
                treerate = 0.16;
            }
            if (treerate < 0.02) {
                treerate = 0.02;
            }
            const treerng = mapgenrandom(2) // if this number is lower than treerate, a tree WILL spawn

            underwater = false;
            if (worldgen.y <= env.global.worldSeaLevel) {
                underwater = true;
            }
            
            layerOffset0 = Math.round(mapgenrandom(6)); // -1 to 1
            layerOffset1 = Math.round(mapgenrandom(7) * 2 - 1); // -1 to 1
            layerOffset2 = Math.round(mapgenrandom(8) * 2 - 1); // -1 to 1
            layerOffset3 = Math.round(mapgenrandom(9) * 2 - 1); // -1 to 1
            // layers of the world
            if (!underwater) {
                if (worldgen.biome == 0) { // autumn hills
                    if (worldgen.y >= 128) {
                        setBlock(worldgen.x, worldgen.y, 'grass4');
                    } else {
                        setBlock(worldgen.x, worldgen.y, 'grass1');
                    }
                    for (var i = worldgen.y - 1; i > worldgen.y - 5 + layerOffset0; i--) {
                        setBlock(worldgen.x, i, 'dirt');
                    }
                }
                if (worldgen.biome == 1) { // meadows
                    if (worldgen.y >= 128) {
                        setBlock(worldgen.x, worldgen.y, 'grass4');
                    } else {
                        setBlock(worldgen.x, worldgen.y, 'grass2');
                    }
                    for (var i = worldgen.y - 1; i > worldgen.y - 5 + layerOffset0; i--) {
                        setBlock(worldgen.x, i, 'dirt');
                    }
                }
                if (worldgen.biome == 2) { // desert
                    for (var i = worldgen.y; i > worldgen.y - 3 + layerOffset0; i--) {
                        setBlock(worldgen.x, i, 'sand');
                    }
                    for (var i = worldgen.y - 2; i > worldgen.y - 5 + layerOffset0; i--) {
                        setBlock(worldgen.x, i, 'dirt');
                    }
                }
                if (worldgen.biome == 3) { // Woods
                    if (worldgen.y >= 128) {
                        setBlock(worldgen.x, worldgen.y, 'grass4');
                    } else {
                        setBlock(worldgen.x, worldgen.y, 'grass3');
                    }
                    for (var i = worldgen.y - 1; i > worldgen.y - 5 + layerOffset0; i--) {
                        setBlock(worldgen.x, i, 'dirt');
                    }
                }
            } else {
                setBlock(worldgen.x, env.global.worldSeaLevel, 'watertop');
                setBlock(worldgen.x, worldgen.y, 'sand');
                for (var i = env.global.worldSeaLevel - 1; i > worldgen.y; i--) {
                    setBlock(worldgen.x, i, 'water');
                }
                for (var i = worldgen.y - 1; i > worldgen.y - 5 + layerOffset0; i--) {
                    setBlock(worldgen.x, i, 'dirt');
                }
            }
            
            for (var i = worldgen.y - 5 + layerOffset0; i > layerOffset1; i--) {
                if (i < worldgen.y - 4 + layerOffset0) {
                    setBlock(worldgen.x, i, 'stone1');
                }
            }
            for (var i = 0 + layerOffset1; i > -12 + layerOffset2; i--) {
                if (i < worldgen.y - 4 + layerOffset0) {
                    setBlock(worldgen.x, i, 'stone2');
                }
            }
            for (var i = -12 + layerOffset2; i > -24 + layerOffset3; i--) {
                setBlock(worldgen.x, i, 'stone3');
            }
            for (var i = -24 + layerOffset3; i > -27; i--) {
                setBlock(worldgen.x, i, 'stone4');
            }
            
            if (!underwater) {
                // make tree
                if (treerng < treerate && worldgen.treedelay < 1) {
                    if (worldgen.biome == 0) { // autumn trees
                        // log
                        logsize = Math.round(mapgenrandom(10) * 2 + 2) // 2 to 4
                        for (var i = 0; i < logsize; i++) {
                            setBlock(worldgen.x, worldgen.y + i + 1, 'log1', true);
                        }
                        // leaves
                        var leaftype = Math.round(mapgenrandom(11) * 3 + 1);
                        for (var a = 0; a < 2; a++) {
                            for (var b = 0; b < 3; b++) {
                                if (worldgen.y >= 128) {
                                    setBlock(worldgen.x - 1 + b, worldgen.y + logsize + 1 + a, `leaves7`, true);
                                } else {
                                    setBlock(worldgen.x - 1 + b, worldgen.y + logsize + 1 + a, `leaves${leaftype}`, true);
                                }
                            }
                        }
                        if (worldgen.y >= 128) {
                            setBlock(worldgen.x, worldgen.y + logsize + 3, `leaves7`, true);
                        } else {
                            setBlock(worldgen.x, worldgen.y + logsize + 3, `leaves${leaftype}`, true);
                        }
                        worldgen.treedelay = 4;
                    }
                    if (worldgen.biome == 1) { // meadow trees
                        // log 
                        logsize = Math.round(mapgenrandom(10) * 2 + 2) // 2 to 4
                        for (var i = 0; i < logsize; i++) {
                            setBlock(worldgen.x, worldgen.y + i + 1, 'log2', true);
                        }
                        // leaves 
                        for (var a = 0; a < 2; a++) {
                            for (var b = 0; b < 3; b++) {
                                if (worldgen.y >= 128) {
                                    setBlock(worldgen.x - 1 + b, worldgen.y + logsize + 1 + a, 'leaves7', true);
                                } else {
                                    setBlock(worldgen.x - 1 + b, worldgen.y + logsize + 1 + a, 'leaves5', true);
                                }
                            }
                        }
                        if (worldgen.y >= 128) {
                            setBlock(worldgen.x, worldgen.y + logsize + 3, 'leaves7', true);
                        } else {
                            setBlock(worldgen.x, worldgen.y + logsize + 3, 'leaves5', true);
                        }
                        worldgen.treedelay = 4;
                    }
                    if (worldgen.biome == 2) { // desert cactus
                        // cactus size
                        cactuslength = Math.round(mapgenrandom(10) * 2 + 1); // 1 to 3
                        for (var i = 0; i < cactuslength; i++) {
                            setBlock(worldgen.x, worldgen.y + i + 1, 'cactus', true);
                        }
                        worldgen.treedelay = 2;
                    }
                    if (worldgen.biome == 3) { // woods tree
                        logsize = Math.round(mapgenrandom(10) * 4 + 3); // 3 to 7
                        leafamount = Math.round(mapgenrandom(51) + 2); // 2 to 3
                        for (var i = 0; i < logsize; i++) {
                            setBlock(worldgen.x, worldgen.y + i + 1, 'log3', true);
                            setBlock(worldgen.x + 1, worldgen.y + i + 1, 'log3', true);
                            // manually fix floating logs
                            if (getBlock(worldgen.x + 1, worldgen.y)[0] == null) {
                                setBlock(worldgen.x + 1, worldgen.y, 'log3', true);
                            }
                            if (getBlock(worldgen.x + 1, worldgen.y - 1)[0] == null) {
                                setBlock(worldgen.x + 1, worldgen.y - 1, 'log3', true);
                            }
                        }
                        for (var leaf1 = 0; leaf1 < leafamount; leaf1++) {
                            for (var i = 0; i < 6; i++) {
                                if (worldgen.y >= 128) {
                                    setBlock(worldgen.x - 2 + i, worldgen.y + logsize + 1 + (leaf1 * 3), 'leaves7', true);
                                } else {
                                    setBlock(worldgen.x - 2 + i, worldgen.y + logsize + 1 + (leaf1 * 3), 'leaves6', true);
                                }
                            }
                            for (var i = 0; i < 4; i++) {
                                if (worldgen.y >= 128) {
                                    setBlock(worldgen.x - 1 + i, worldgen.y + logsize + 2 + (leaf1 * 3), 'leaves7', true);
                                } else {
                                    setBlock(worldgen.x - 1 + i, worldgen.y + logsize + 2 + (leaf1 * 3), 'leaves6', true);
                                }
                            }
                            for (var i = 0; i < 2; i++) {
                                if (worldgen.y >= 128) {
                                    setBlock(worldgen.x + i, worldgen.y + logsize + 3 + (leaf1 * 3), 'leaves7', true);
                                } else {
                                    setBlock(worldgen.x + i, worldgen.y + logsize + 3 + (leaf1 * 3), 'leaves6', true);
                                }
                            }
                        }
                        worldgen.treedelay = 7;
                    }
                }

                // make grass
                if (worldgen.biome == 0) {
                    if (!(treerng < treerate) && (mapgenrandom(12) < (mapgenrandom(13) * 0.5))) {
                        let grasstype = Math.round(mapgenrandom(14) * 6 + 1);
                        if (grasstype == 6 || grasstype == 7) {
                            setBlock(worldgen.x, worldgen.y + 1, `grassbg${grasstype}a`, true);
                            setBlock(worldgen.x, worldgen.y + 2, `grassbg${grasstype}b`, true);
                        } else {
                            setBlock(worldgen.x, worldgen.y + 1, `grassbg${grasstype}`, true);
                        }
                    }
                }
                // make grass for Woods
                if (worldgen.biome == 3) {
                    if (!(treerng < treerate) && (mapgenrandom(12) < (mapgenrandom(13) * 2) && worldgen.treedelay < 6)) {
                        let grasstype = Math.round(mapgenrandom(14) * 6 + 1);
                        if (grasstype == 6 || grasstype == 7) {
                            setBlock(worldgen.x, worldgen.y + 1, `grassbg${grasstype}a`, true);
                            setBlock(worldgen.x, worldgen.y + 2, `grassbg${grasstype}b`, true);
                        } else if (grasstype == 5) {
                            setBlock(worldgen.x, worldgen.y + 1, `grassbg1`, true);
                        } else {
                            setBlock(worldgen.x, worldgen.y + 1, `grassbg${grasstype}`, true);
                        }
                    }
                }
                // make flowers
                if (worldgen.biome == 1) {
                    if (!(treerng < treerate) && (mapgenrandom(12) < (mapgenrandom(13) * 0.5))) {
                        let grasstype = Math.round(mapgenrandom(14) * 7 + 1);
                        setBlock(worldgen.x, worldgen.y + 1, `flower${grasstype}`, true);
                    }
                }
                // make bushes
                if (worldgen.biome == 1) {
                    if (!(treerng < treerate) && mapgenrandom(25) < 0.04 && worldgen.treedelay < 1) {
                        setBlock(worldgen.x, worldgen.y + 1, 'leaves5', true);
                    }
                }
            }
            
            // reduce treedelay
            worldgen.treedelay--;

            worldgen.x++;
        }
    }
    else if (env.global.worldGenType == 'flat') {
        for (var z = start; z < end; z++) {
            worldgen.y = 16;
            worldgen.scale = 1;
            worldgen.biome = 1;
            // biome 0 = autumn hills, biome 1 = meadows, biome 2 = desert, biome 3 = woods
            worldgen.y = Math.floor(worldgen.y);

            treerate += (mapgenrandom(1) * 0.01 - 0.005);
            if (treerate > 0.16) {
                treerate = 0.16;
            }
            if (treerate < 0.02) {
                treerate = 0.02;
            }
            const treerng = mapgenrandom(2) // if this number is lower than treerate, a tree WILL spawn
            
            layerOffset0 = Math.round(mapgenrandom(6)); // -1 to 1
            layerOffset1 = Math.round(mapgenrandom(7) * 2 - 1); // -1 to 1
            layerOffset2 = Math.round(mapgenrandom(8) * 2 - 1); // -1 to 1
            layerOffset3 = Math.round(mapgenrandom(9) * 2 - 1); // -1 to 1
            // layers of the world
            setBlock(worldgen.x, worldgen.y, 'grass2');
            for (var i = worldgen.y - 1; i > worldgen.y - 5 + layerOffset0; i--) {
                setBlock(worldgen.x, i, 'dirt');
            }
            
            for (var i = worldgen.y - 5 + layerOffset0; i > layerOffset1; i--) {
                if (i < worldgen.y - 4 + layerOffset0) {
                    setBlock(worldgen.x, i, 'stone1');
                }
            }
            for (var i = 0 + layerOffset1; i > -12 + layerOffset2; i--) {
                if (i < worldgen.y - 4 + layerOffset0) {
                    setBlock(worldgen.x, i, 'stone2');
                }
            }
            for (var i = -12 + layerOffset2; i > -24 + layerOffset3; i--) {
                setBlock(worldgen.x, i, 'stone3');
            }
            for (var i = -24 + layerOffset3; i > -27; i--) {
                setBlock(worldgen.x, i, 'stone4');
            }
            
            // make tree
            if (treerng < treerate && worldgen.treedelay < 1) {
                // log 
                logsize = Math.round(mapgenrandom(10) * 2 + 2) // 2 to 4
                for (var i = 0; i < logsize; i++) {
                    setBlock(worldgen.x, worldgen.y + i + 1, 'log2', true);
                }
                // leaves 
                for (var a = 0; a < 2; a++) {
                    for (var b = 0; b < 3; b++) {
                        if (worldgen.y >= 128) {
                            setBlock(worldgen.x - 1 + b, worldgen.y + logsize + 1 + a, 'leaves7', true);
                        } else {
                            setBlock(worldgen.x - 1 + b, worldgen.y + logsize + 1 + a, 'leaves5', true);
                        }
                    }
                }
                setBlock(worldgen.x, worldgen.y + logsize + 3, 'leaves5', true); // last leaf on the top
                worldgen.treedelay = 4;
            }


            // make flowers
            if (!(treerng < treerate) && (mapgenrandom(12) < (mapgenrandom(13) * 0.5))) {
                let grasstype = Math.round(mapgenrandom(14) * 7 + 1);
                setBlock(worldgen.x, worldgen.y + 1, `flower${grasstype}`, true);
            }
            // make bushes
            if (!(treerng < treerate) && mapgenrandom(25) < 0.04 && worldgen.treedelay < 1) {
                setBlock(worldgen.x, worldgen.y + 1, 'leaves5', true);
            }
            
            worldgen.treedelay--;
            worldgen.x++;
        }
    } else {
        for (var z = start; z < end; z++) {
            worldgen.x++;
        }
    }
    if (start < mapstart) {
        mapstart = start;
    }
    if (end > mapend) {
        mapend = end;
    }
    mapxsize = Math.abs(mapstart) + Math.abs(mapend);
    console.log(`Generated map of size ${blocks.size}, spanning ${mapxsize} blocks`);
}

function renderWorld(camx, camy) {
    blocksRendered = 0;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    globalCtx.imageSmoothingEnabled = false;

    const camx2 = camx - Math.floor(camx);
    const camy2 = camy - Math.floor(camy);
    
    for (var y = -1; y < 17 / camera.scale * (window.innerHeight / 1080); y++) {
        for (var x = 0; x < 31 / camera.scale * (window.innerWidth / 1920); x++) {
            if (x + Math.floor(camx) < mapstart) {
                worldGen(mapstart - 64, mapstart);
            }
            if (x + Math.floor(camx) > mapend) {
                worldGen(mapend, mapend + 64);
            }
            else {
                const block = getBlock(x + Math.floor(camx), -y + Math.floor(camy))[0];
                if (!(block == null)) {
                    if (block == 'watertop') { // show water animated
                        showBlock(globalCtx, x - camx2, -y - camy2, waterimg);
                    } else {
                        showBlock(globalCtx, x - camx2, -y - camy2, block);
                    }
                    blocksRendered++;
                }
            }
        }
    }
    renderPlayer(globalCtx, camera.x, camera.y);
}

function spawnPlayer(spawnx) {
    var spawnCoords = [0, 0];
    function asdfhjkhagdbsf() {
        var foundBlock = false;
        var i = -1024;
        while (true) {
            if (getBlock(spawnx,i)[0] == null && foundBlock == true) {
                if (!(getBlock(spawnx,i-1)[0] == 'watertop')) {
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
            } else if (!(getBlock(spawnx, i)[0] == null)) {
                foundBlock = true;
            }
            i++;
        }
        player.x = spawnCoords[0];
        player.y = spawnCoords[1];
    }
    asdfhjkhagdbsf();
}

function renderPlayer(ctx, camx, camy) {
    showBlock(ctx, player.x - camx, player.y - camy, 'player');
}

function moveCamera() {
    if (camera.scale < 1) {
        if (camera.scale == 0.25) {
            camera.x = player.x - ((window.innerWidth/2-32)/64/camera.scale-(camera.scale-1.75));
            camera.y = player.y - (-(window.innerHeight/2-32)/64/camera.scale+(camera.scale-1.75));
        } else {
            camera.x = player.x - ((window.innerWidth/2-32)/64/camera.scale-(camera.scale-1));
            camera.y = player.y - (-(window.innerHeight/2-32)/64/camera.scale+(camera.scale-1));
        }
    } else {
        camera.x = player.x - ((window.innerWidth/2-32)/64/camera.scale-((camera.scale-1)/4));
        camera.y = player.y - (-(window.innerHeight/2-32)/64/camera.scale+((camera.scale-1)/4));
    }
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
            if (!player.air) {
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
    player.inWater = getBlock(Math.round(player.x),Math.floor(player.y))[0] == 'water' || getBlock(Math.round(player.x),Math.floor(player.y + 0.5))[0] == 'watertop';
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
            player.my += 0.03;
            player.my *= 0.98;
        } else {
            player.my += env.global.gravity;
        }
    }
    
    // momentum & friction
    player.x += player.mx / 60;
    player.y += player.my / 60;
    if (player.fly == false) { // normal non-flying friction
        if (player.air) { // air friction
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

function renderInfoText() {
    if (debug == true) {
        infoLn1.innerHTML = `<b>player</b>: (<red>${player.x.toFixed(2)}</red>, <cyan>${player.y.toFixed(2)}</cyan>) | velocity (<yellow>${player.mx.toFixed(2)}</yellow>, <yellow>${player.my.toFixed(2)}</yellow>) | air <${player.air}>${player.air}</${player.air}>, acc <${player.acc}>${player.acc}</${player.acc}>, fly <${player.fly}>${player.fly}</${player.fly}>, water <${player.inWater}>${player.inWater}</${player.inWater}>`;
        infoLn2.innerHTML = `<b>world</b>: <yellow>${blocksRendered}</yellow> blocks rendered, <yellow>${blocks.size}</yellow> blocks stored, <yellow>${mapxsize}</yellow> map x size, <yellow>${camera.scale}</yellow> camera scale`;
        infoLn3.innerHTML = `<b>time</b>: tick <yellow>${ticknum}</yellow> | target rate <cyan>${tickrate}</cyan>, actual rate <magenta>${tickrateComputed}</magenta>, max <green>${tickrateHigh}</green>, min <red>${tickrateLow}</red>`;
    } else {
        infoLn1.innerHTML = `Position: (<red>${Math.round(player.x)}</red>, <cyan>${Math.round(player.y)}</cyan>)`;

        infoLn2.innerHTML = `Time: <yellow>${(Math.floor(ticknum/60*10)/10).toFixed(1)}</yellow> seconds`;

        if (!(camera.scale == 1)) {
            infoLn3.innerHTML = `Camera scale: <yellow>${camera.scale}x</yellow>`;
        } else {
            infoLn3.innerHTML = '';
        }
    }
    if (!keys.q) {
        controlsKeybind.setAttribute('style', 'opacity:1');
        controlsList.setAttribute('style', 'opacity:0');
    } else {
        controlsKeybind.setAttribute('style', 'opacity:0');
        controlsList.setAttribute('style', 'opacity:1');
    }
    blockSelector.innerHTML = `${blocknames[selblocks[currentblock]] || selblocks[currentblock]} (${currentblock + 1}/${selblocks.length}) | hp ${Math.ceil(player.health)}/${player.maxHealth} (${Math.round(player.health/player.maxHealth*1000)/10}%)`;
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
}

function blockModification() {
    let blockx = Math.floor(mx/64 / camera.scale + camera.x);
    let blocky = Math.ceil(-my/64 / camera.scale + camera.y);
    if (keys.z) { // destroy block
        if (!(getBlock(blockx, blocky)[0] == 'stone4')) {
            deleteBlock(blockx, blocky);
        }
    }
    if (keys.x) { // place block
        // rules for special blocks
        if (!(getBlock(blockx, blocky)[0] == 'stone4' || (blocky < -26 && env.global.worldBottomEnabled && env.global.worldBottomImmutable) || (Math.round(player.x) == blockx && Math.round(player.y) == blocky))) {
            if (selblocks[currentblock] == 'grassbg6' || selblocks[currentblock] == 'grassbg7') {
                setBlock(blockx, blocky, selblocks[currentblock]+'a');
                setBlock(blockx, blocky+1, selblocks[currentblock]+'b');
            }
            else {
                setBlock(blockx, blocky, selblocks[currentblock]);
            }
        }
    }
}

function tick() {
    tickrateComputed = Math.round(1000 / (Date.now() - lastTick));
    if (Number.isInteger(ticknum / 60)) { // every 60 ticks reset low and high
        tickrateLow = tickrate; tickrateHigh = 0;
    }
    if (tickrateComputed < tickrateLow) {
        tickrateLow = tickrateComputed;
    }
    if (tickrateComputed > tickrateHigh) {
        tickrateHigh = tickrateComputed;
    }
    lastTick = Date.now();
    // non-visible (functional)
    updateMovementKeys();
    playerPhysics();
    player.health += (player.regenRate/60); if (player.invulnerable) {player.health = player.maxHealth}
    if (player.health > player.maxHealth) {
        player.health = player.maxHealth;
    }
    // visible
    updateTime();
    moveCamera();
    renderWorld(camera.x, camera.y);
    renderInfoText();
    ticknum++;
}

worldGen(-256, 256);
spawnPlayer(Math.round((mapstart / 2) + (mapend / 2))); // should just be 0
tick();

var clock = setInterval(tick, 1000/tickrate);
var blockModificationTick = setInterval(blockModification, 0); // do block modification seperately to feel smoother

function killClock() {
	clearInterval(clock);
}
function setTickrate(rate) {
	tickrate = rate;
	killClock();
	window.clock = setInterval(`tick`, 1000/tickrate);
}