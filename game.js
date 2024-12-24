const version = "Alpha 1.8-dev";
const blocks = new Map(); // will be replaced with chunk loading at some point (2025)
var envTime = 0; // 0 to 23999 (24000+ just gets set back to 0)
var player = {x: 0, y: 0, mx: 0, my: 0, air: false, acc: false, fly: false, flyx: false, flyy: false, inWater: false, speedmult: 1, jumpmult: 1, noclip: false};
var camera = {x: 0, y: 0, scale: 1};
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
    'a': false,
    'w': false,
    'd': false,
    'ArrowLeft': false,
    'ArrowRight': false,
    'ArrowUp': false,
    'Space': false,
}

var currentblock = 0; // current block in the block selector
const blocknames = { // blocks without a proper name will use their ID in the block selector
    stone1: 'Stone',
    stone2: 'Dark Stone',
    stone3: 'Very Dark Stone',
    stone4: 'Unbreakable Stone',
    dirt: 'Dirt',
    grass1: 'Grass',
    grass2: 'Meadow Grass',
    grass3: 'Woods Grass',
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
const allblocks = ['dirt','grass1','grassbg1','grassbg2','grassbg3','grassbg4','grassbg5','grassbg6a','grassbg6b','grassbg7a','grassbg7b','leaves1','leaves2','leaves3','leaves4','log1','log2','log3','player','sand','stone1','stone2','stone3','stone4','test','water','watertop_render1','watertop_render2','watertop_render3','watertop_render4','watertop','leaves5','leaves6','bricks','stonebricks','dirtbricks','goldbricks','cactus','crate','grass2','grass3','glass','planks1','planks2','planks3','flower1','flower2','flower3','flower4','flower5','flower6','flower7','flower8'];

// blocks that never have collision
const nocollision = ['grassbg1','grassbg2','grassbg3','grassbg4','grassbg5','grassbg6a','grassbg6b','grassbg7a','grassbg7b','watertop','water','flower1','flower2','flower3','flower4','flower5','flower6','flower7','flower8'];

// selectable blocks
const selblocks = ['dirt','planks1','planks2','planks3','glass','crate','bricks','stonebricks','dirtbricks','goldbricks','log1','log2','log3','sand','stone1','stone2','stone3','water','grass1','grass2','grass3','cactus','leaves1','leaves2','leaves3','leaves4','leaves5','leaves6','sand','grassbg1','grassbg2','grassbg3','grassbg4','grassbg5','grassbg6','grassbg7','flower1','flower2','flower3','flower4','flower5','flower6','flower7','flower8'];

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

// key events (keydown)
window.addEventListener('keydown', (event) => {
    keys[event.key] = true;
    if (event.key == ' ') { // bind ' ' (can't access) to 'Space' in keys object
        keys.Space = true;
    }
    if (event.key == '`') { // debug mode toggle
        if (debug == false) {
            debug = true;
        } else {
            debug = false;
        }
    }
    if (event.key == 'c') { // fly mode toggle
        if (player.fly) {
            player.fly = false;
        } else {
            player.fly = true;
        }
    }
    if (event.key == 'm') { // next block
        currentblock++;
        if (currentblock >= selblocks.length) {
            currentblock = 0;
        }
    }
    if (event.key == 'n') { // previous block
        currentblock--;
        if (currentblock < 0) {
            currentblock = selblocks.length - 1;
        }
    }
    if (event.key == '-') { // zoom out
        camera.scale *= 0.5;
        if (camera.scale < 0.25) {
            camera.scale = 0.25;
        }
        camera.scale = Math.round(camera.scale*1000)/1000;
    }
    if (event.key == '=') { // zoom in
        camera.scale *= 2;
        if (camera.scale > 2) {
            camera.scale = 2;
        }
        camera.scale = Math.round(camera.scale*1000)/1000;
    }
    if (event.key == '0') { // reset zoom
        camera.scale = 1;
    }
})

// key events (keyup)
window.addEventListener('keyup', (event) => {
    keys[event.key] = false;
    if (event.key == ' ') {
        keys.Space = false;
    }
})

// update mouse pos
document.addEventListener('mousemove', (event) => {
    mx = event.clientX;
    my = event.clientY;
});

function setBlock(x, y, block = 'test', bg = false) {
    blocks.set(`${x},${y}`, [block, bg]);
}
function getBlock(x, y) {
    return blocks.get(`${x},${y}`) || [null, true];
}
function deleteBlock(x, y) {
    blocks.delete(`${x},${y}`);
}
function getBlockCollision(x, y) {
    const block = getBlock(x,y);
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
var cells1d = [[],[],[],[],[],[]]; // 6 levels of noise
var scale1d = [];
var biome1d = [];
for (var i1 = 0; i1 < cells1d.length; i1++) {
    for (var i = 0; i < 32768; i++) {
        cells1d[i1].push(mapgenrandom(-10 + (i / 100000)));
    }
    console.log(`${Math.floor(i1/(cells1d.length)*100)}% finished generating map noise (${i1+1}/${cells1d.length+1})`);
}
// do something similar for scale1d (256 blocks per integer)
for (var i = 0; i < 32768; i++) {
    scale1d.push(mapgenrandom(-9 + (i / 100000)));
}

// do something similar for biome1d (512 blocks per integer)
for (var i = 0; i < 32768; i++) {
    biome1d.push(mapgenrandom(-19 + (i / 100000)));
}
console.log(`100% finished generating map noise (7/7)`);
var treerate = 0.12;
const waterlevel = 48;

function worldGen(start, end) {
    worldgen = {x:start, y:0, scale:1, treedelay:0, biome:0};
    for (var z = start; z < end; z++) {
        worldgen.y = (noise1d(cells1d[0], 16384 + worldgen.x / 128) * 64); // 128 blocks per integer, 64 blocks range
        for (var noiselayer = 1; noiselayer < cells1d.length; noiselayer++) {
            worldgen.y += (noise1d(cells1d[noiselayer], 16384 + worldgen.x / (128/(2 ** noiselayer))) * (32/(2 ** noiselayer)));
        }
        worldgen.scale = noise1d(scale1d, 16384 + worldgen.x / 256) * 1.2 + 0.8;
		worldgen.biome = Math.floor(noise1d(biome1d, 16384 + worldgen.x / 512) * 4)
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
        if (worldgen.y <= waterlevel) {
            underwater = true;
        }
        
        layerOffset0 = Math.round(mapgenrandom(6)); // -1 to 1
        layerOffset1 = Math.round(mapgenrandom(7) * 2 - 1); // -1 to 1
        layerOffset2 = Math.round(mapgenrandom(8) * 2 - 1); // -1 to 1
        layerOffset3 = Math.round(mapgenrandom(9) * 2 - 1); // -1 to 1
        // layers of the world
        if (!underwater) {
			if (worldgen.biome == 0) { // autumn hills
				setBlock(worldgen.x, worldgen.y, 'grass1');
				for (var i = worldgen.y - 1; i > worldgen.y - 5 + layerOffset0; i--) {
					setBlock(worldgen.x, i, 'dirt');
				}
			}
			if (worldgen.biome == 1) { // meadows
				setBlock(worldgen.x, worldgen.y, 'grass2');
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
				setBlock(worldgen.x, worldgen.y, 'grass3');
				for (var i = worldgen.y - 1; i > worldgen.y - 5 + layerOffset0; i--) {
					setBlock(worldgen.x, i, 'dirt');
				}
			}
        } else {
            setBlock(worldgen.x, waterlevel, 'watertop');
            setBlock(worldgen.x, worldgen.y, 'sand');
            for (var i = waterlevel - 1; i > worldgen.y; i--) {
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
							setBlock(worldgen.x - 1 + b, worldgen.y + logsize + 1 + a, `leaves${leaftype}`, true);
						}
					}
					setBlock(worldgen.x, worldgen.y + logsize + 3, `leaves${leaftype}`, true);
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
							setBlock(worldgen.x - 1 + b, worldgen.y + logsize + 1 + a, 'leaves5', true);
						}
					}
					setBlock(worldgen.x, worldgen.y + logsize + 3, 'leaves5', true);
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
							setBlock(worldgen.x - 2 + i, worldgen.y + logsize + 1 + (leaf1 * 3), 'leaves6', true);
						}
						for (var i = 0; i < 4; i++) {
							setBlock(worldgen.x - 1 + i, worldgen.y + logsize + 2 + (leaf1 * 3), 'leaves6', true);
						}
						for (var i = 0; i < 2; i++) {
							setBlock(worldgen.x + i, worldgen.y + logsize + 3 + (leaf1 * 3), 'leaves6', true);
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
            if (-y + Math.floor(camy) < -26) {
                showBlock(globalCtx, x - camx2, -y - camy2, 'stone4');
                blocksRendered++;
            } else {
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

// manages both physics/collision and movement
function playerPhysics() {
    // movement
    var inWater = getBlock(Math.round(player.x),Math.floor(player.y))[0] == 'water' || getBlock(Math.round(player.x),Math.floor(player.y + 0.5))[0] == 'watertop';
    player.inWater = inWater;
    if (inWater) {
        player.air = false;
    }
    if (player.fly == false) {
        if (keys.ArrowLeft == true || keys.a == true) {
            player.mx += -0.04 * player.speedmult;
            if (player.mx < -0.12 * player.speedmult) {
                player.mx = -0.12 * player.speedmult;
            }
            player.acc = true;
        }
        if (keys.ArrowRight == true || keys.d == true) {
            player.mx += 0.04 * player.speedmult;
            if (player.mx > 0.12 * player.speedmult) {
                player.mx = 0.12 * player.speedmult;
            }
            player.acc = true;
        }
        if (!inWater) {
            if ((keys.ArrowUp == true || keys.w == true || keys.Space == true) && player.air == false) {
                player.my = 0.2 * player.jumpmult;
                player.air = true;
            }
        }
        // water movement (up/down)
        else {
            if (keys.ArrowUp == true || keys.w == true || keys.Space == true) {
                player.my += 0.005 * player.jumpmult;
            }
            if (keys.ArrowDown == true || keys.s == true ) {
                player.my -= 0.01 * player.jumpmult;
            }
        }
    }
    
    // fly movement

    else {
        if (keys.ArrowLeft || keys.a) {
            player.mx += -0.12 * player.speedmult;
            if (player.mx < -0.4 * player.speedmult) {
                player.mx = -0.4 * player.speedmult;
            }
            player.flyx = true;
        }
        if (keys.ArrowRight || keys.d) {
            player.mx += 0.12 * player.speedmult;
            if (player.mx > 0.4 * player.speedmult) {
                player.mx = 0.4 * player.speedmult;
            }
            player.flyx = true;
        }
        if (keys.ArrowUp || keys.w || keys.Space) {
            player.my += 0.04 * player.jumpmult;
            if (player.my > 0.2 * player.jumpmult) {
                player.my = 0.2 * player.jumpmult;
            }
            player.flyy = true;
        }
        if (keys.ArrowDown || keys.s) {
            player.my -= 0.04 * player.jumpmult;
            if (player.my < -0.2 * player.jumpmult) {
                player.my = -0.2 * player.jumpmult;
            }
            player.flyy = true;
        }
    }

    // disable acceleration mode when needed (prevents endless sliding)
    if (player.fly == false) {
        if (!((keys.ArrowLeft == true || keys.a == true) || (keys.ArrowRight == true || keys.d == true))) {
            player.acc = false;
        }
    } else {
        if (!((keys.ArrowLeft == true || keys.a == true) || (keys.ArrowRight == true || keys.d == true))) {
            player.flyx = false;
        }
        if (!((keys.ArrowUp == true || keys.w == true) || (keys.ArrowDown == true || keys.s == true) || keys.Space)) {
            player.flyy = false;
        }
    }
    

    // gravity
    if (player.fly == false) {
        if (inWater) { // buoyancy
            player.my += 0.005;
            player.my *= 0.98;
        } else {
            player.my -= 0.01;
        }
    }
    
    // momentum & friction
    player.x += player.mx;
    player.y += player.my;
    if (player.fly == false) { // normal non-flying friction
        if (player.acc == false) {
            if (player.air && (player.mx > 0.12 || player.mx < -0.12)) { // air friction (fast)
                player.mx *= 0.97;
            } else if (player.air) { // air friction
                player.mx *= 0.65;
            } else { // ground friction
                player.mx *= 0.5;
            }
        }
    } else { // flying friction
        if (player.flyx == false) {
            player.mx *= 0.8
        }
        if (player.flyy == false) {
            player.my *= 0.8
        }
        
    }
    
    // basic collision (buggy)
    playertop = player.y + 0.5;
    playerbottom = player.y - 0.5;
    playerleft = player.x - 0.5;
    playerright = player.x + 0.5;

    if (!(player.noclip == true)) {
        // right of player collides with left of right block
        if (!(getBlockCollision(Math.round(playerright),Math.round(player.y)) == null)) {
            player.mx = 0;
            player.x = Math.round(playerright) - 1;
        }

        // left of player collides with right of left block
        else if (!(getBlockCollision(Math.round(playerleft),Math.round(player.y)) == null)) {
            player.mx = 0;
            player.x = Math.round(playerleft) + 1;
        }

        // bottom of player collides with top of bottom block
        if ((!(getBlockCollision(Math.round(playerright - 0.001), Math.round(playerbottom)) == null) || !(getBlockCollision(Math.round(playerleft + 0.001), Math.round(playerbottom)) == null)) && (player.air == false || player.my < 0)) {
            player.air = false;
            player.my = 0;
            player.y = Math.round(playerbottom) + 1;
        } else {
            if (!inWater) {
                player.air = true;
            }
        }

        // top of player collides with bottom of top block
        if (!(getBlockCollision(Math.round(player.x),Math.round(playertop)) == null)) {
            player.my = 0;
            player.y = Math.round(playertop) - 1;
        }
    }
}

function renderInfoText() {
    if (debug == true) {
        infoLn1.innerHTML = `<b>player</b>: (<red>${Math.round(player.x * 100) / 100}</red>, <cyan>${Math.round(player.y * 100) / 100}</cyan>) | momentum (<yellow>${Math.round(player.mx * 100) / 100}</yellow>, <yellow>${Math.round(player.my * 100) / 100}</yellow>) | air <${player.air}>${player.air}</${player.air}>, acc <${player.acc}>${player.acc}</${player.acc}>, fly <${player.fly}>${player.fly}</${player.fly}>, water <${player.inWater}>${player.inWater}</${player.inWater}>`;
        infoLn2.innerHTML = `<b>world</b>: <yellow>${blocksRendered}</yellow> blocks rendered, <yellow>${blocks.size}</yellow> blocks stored, <yellow>${mapxsize}</yellow> map x size, <yellow>${camera.scale}</yellow> camera scale`;
        infoLn3.innerHTML = `<b>time</b>: tick <yellow>${ticknum}</yellow>, env tick <yellow>${envTime}</yellow> | target rate <cyan>${tickrate}</cyan>, actual rate <magenta>${tickrateComputed}</magenta>, max <green>${tickrateHigh}</green>, min <red>${tickrateLow}</red>`;
    } else {
        infoLn1.innerHTML = `Position: (<red>${Math.round(player.x)}</red>, <cyan>${Math.round(player.y)}</cyan>)`;

        // 100% readable code
        var timestring1 = envTime.toString().padStart(5,'0');
        var timestring2 = Math.floor(timestring1.slice(2,5) / 1000 * 60).toString().padStart(2,'0');
        var timestring = `${timestring1.slice(0,2)}:${timestring2}`;

        infoLn2.innerHTML = `Time: <yellow>${timestring}<yellow>`;

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
    blockSelector.innerHTML = `${blocknames[selblocks[currentblock]] || selblocks[currentblock]} (${currentblock + 1}/${selblocks.length})`;
}

function getColor(c1, c2, p1, p2) {
    const r = Math.round((c1.r * p1) + (c2.r * p2));
    const g = Math.round((c1.g * p1) + (c2.g * p2));
    const b = Math.round((c1.b * p1) + (c2.b * p2));
    return {r, g, b};
}

function updateTime() {
    waterimg = `watertop_render${Math.floor(ticknum/8+1)-(Math.floor(ticknum/32)*4)}`;

    // day 36, 125, 207
    // night 56, 15, 122
    // sunset/sunrise 143, 61, 7
    if (envTime >= 0 && envTime <= 11999) {
        document.body.style.backgroundColor = `rgb(36, 125, 207)`;
    }
    if (envTime >= 16000 && envTime <= 16999) { // sunset stage 1
        const c = getColor({r:36,g:125,b:207},{r:143,g:61,b:7},(16999-envTime)/1000,(envTime-16000)/1000);
        document.body.style.backgroundColor = `rgb(${c.r},${c.g},${c.b})`;
    }
    if (envTime >= 17000 && envTime <= 17999) { // sunset stage 2
        const c = getColor({r:143,g:61,b:7},{r:56,g:15,b:122},(17999-envTime)/1000,(envTime-17000)/1000);
        document.body.style.backgroundColor = `rgb(${c.r},${c.g},${c.b})`;
    }
    if (envTime >= 18000 && envTime <= 21999) {
        document.body.style.backgroundColor = `rgb(56, 15, 122)`;
    }
    if (envTime >= 22000 && envTime <= 22999) { // sunrise stage 1
        const c = getColor({r:56,g:15,b:122},{r:143,g:61,b:7},(22999-envTime)/1000,(envTime-22000)/1000);
        document.body.style.backgroundColor = `rgb(${c.r},${c.g},${c.b})`;
    }
    if (envTime >= 23000 && envTime <= 23999) { // sunrise stage 2
        const c = getColor({r:143,g:61,b:7},{r:36,g:125,b:207},(23999-envTime)/1000,(envTime-23000)/1000);
        document.body.style.backgroundColor = `rgb(${c.r},${c.g},${c.b})`;
    }
    if (envTime >= 24000) {
        envTime = 0;
    }
    envTime += 1;
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
        if (!(getBlock(blockx, blocky)[0] == 'stone4' || blocky < -26 || (Math.round(player.x) == blockx && Math.round(player.y) == blocky))) {
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
    updateTime();
    playerPhysics();
    // visible
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
	window.clock = setInterval(tick, 1000/tickrate);
}