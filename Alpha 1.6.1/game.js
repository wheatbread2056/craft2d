const version = "Alpha 1.6.1";
const blocks = new Map();
var envTime = 0; // 0 to 23999 (24000+ just gets set back to 0)
var player = {x: 0, y: 0, mx: 0, my: 0, air: false, acc: false, fly: false, flyx: false, flyy: false, inWater: false};
var camera = {x: 0, y: 0, scale: 1};
const blockimages = {}
const tickrate = 60;
const mapseed = Math.round(Math.random() * (2147483647*2) - 2147483647);
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

var currentblock = 0;
const selblocks = ['stone1','stone2','stone3','dirt','grass','sand','gravel','log1','watertop','water','leaves1','leaves2','leaves3','leaves4','grassbg1','grassbg2','grassbg3','grassbg4','grassbg5','grassbg6','grassbg7'];
const allblocks = ['dirt','grass','grassbg1','grassbg2','grassbg3','grassbg4','grassbg5','grassbg6a','grassbg6b','grassbg7a','grassbg7b','gravel','leaves1','leaves2','leaves3','leaves4','log1','player','sand','stone1','stone2','stone3','stone4','test','water','watertop_render1','watertop_render2','watertop_render3','watertop_render4','watertop'];
const nocollision = ['leaves1','log1','grassbg1','grassbg2','grassbg3','grassbg4','grassbg5','leaves2','leaves3','leaves4','grassbg6a','grassbg6b','grassbg7a','grassbg7b','watertop','water'];

// generate block images
for (const i in allblocks) {
    blk = allblocks[i];
    const imagekey = `block_${blk}`
    blockimages[imagekey] = new Image();
    blockimages[imagekey].src = `images/block_${blk}.png`;
}

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

function setBlock(x, y, block) {
    blocks.set(`${x},${y}`, block);
}
function getBlock(x, y) {
    return blocks.get(`${x},${y}`) || null;
}
function deleteBlock(x, y) {
    blocks.delete(`${x},${y}`);
}
function getBlockCollision(x, y) {
    const block = blocks.get(`${x},${y}`);
    if (x < mapstart || x > mapend - 1) {
        return 'stone4';
    } else if (!(nocollision.includes(block))) {
        return block || null;
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
function worldGen(start, end) {
    var worldgen = {x:start, y:0, scale:1, noisex:start, treedelay:0};
    function random(id) { // makes random number generation easier, id doesn't repeat for 100k blocks
        return new Math.seedrandom(mapseed + worldgen.x + (id * 100000))();
    }
    blocks.clear();
    var cells1d = [[],[],[],[],[],[]]; // 6 levels of noise
    var scale1d = [];
    for (var i1 = 0; i1 < cells1d.length; i1++) {
        for (var i = 0; i < Math.abs(start)+Math.abs(end)+1; i++) {
            cells1d[i1].push(random(-10 + (i / 100000)));
        }
    }
    // do something similar for scale1d (256 blocks per integer)
    for (var i1 = 0; i1 < cells1d.length; i1++) {
        for (var i = 0; i < Math.abs(start)+Math.abs(end)+1; i++) {
            scale1d.push(random(-9 + (i / 100000)));
        }
    }
    var lakeblocks = 0;
    var lakeblock = 'sand';
    var laketotallength = 0;
    var treerate = 0.12 
    for (var z = start; z < end; z++) {
        worldgen.y = (noise1d(cells1d[0], (worldgen.noisex - start) / 128) * 64); // 128 blocks per integer, 64 blocks range
        for (var noiselayer = 1; noiselayer < cells1d.length; noiselayer++) {
            worldgen.y += (noise1d(cells1d[noiselayer], (worldgen.noisex - start) / (128/(2 ** noiselayer))) * (32/(2 ** noiselayer)));
        }
        worldgen.scale = noise1d(scale1d, (worldgen.noisex - start) / 256) * 0.8 + 0.2;
        worldgen.y *= worldgen.scale;
        worldgen.y = Math.floor(worldgen.y);

        treerate += (random(1) * 0.01 - 0.005);
        if (treerate > 0.16) {
            treerate = 0.16;
        }
        if (treerate < 0.02) {
            treerate = 0.02;
        }
        const treerng = random(2) // if this number is lower than treerate, a tree WILL spawn

        var lakerng = random(3); // chance = .4% per block, lake size = 4 to 64 blocks
        var lakelength = Math.round(random(4) * 60 + 4)
        if (lakerng < 0.004 && lakeblocks == 0) {
            lakeblocks = lakelength;
            laketotallength = lakelength;
            var blocktype = random(5)
            if (blocktype < 0.5) {
                lakeblock = 'sand';
            } else {
                lakeblock = 'gravel';
            }
        }
        
        layerOffset0 = Math.round(random(6)); // -1 to 1
        layerOffset1 = Math.round(random(7) * 2 - 1); // -1 to 1
        layerOffset2 = Math.round(random(8) * 2 - 1); // -1 to 1
        layerOffset3 = Math.round(random(9) * 2 - 1); // -1 to 1
        if (lakeblocks == 0) { // normal non-lake generation
            // layers of the world
            setBlock(worldgen.x, worldgen.y, 'grass');
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
            if (treerng < treerate && worldgen.treedelay == 0) {
                // log
                logsize = Math.round(random(10) * 2 + 2) // 2 to 4
                for (var i = 0; i < logsize; i++) {
                    setBlock(worldgen.x, worldgen.y + i + 1, 'log1');
                }
                // leaves
                var leaftype = Math.round(random(11) * 3 + 1);
                for (var a = 0; a < 2; a++) {
                    for (var b = 0; b < 3; b++) {
                        setBlock(worldgen.x - 1 + b, worldgen.y + logsize + 1 + a, `leaves${leaftype}`);
                    }
                }
                setBlock(worldgen.x, worldgen.y + logsize + 3, `leaves${leaftype}`);
                worldgen.treedelay = 4;
            }

            // make grass
            if (!(treerng < treerate) && (random(12) < (random(13) * 0.5))) {
                let grasstype = Math.round(random(14) * 6 + 1);
                if (grasstype == 6 || grasstype == 7) {
                    setBlock(worldgen.x, worldgen.y + 1, `grassbg${grasstype}a`);
                    setBlock(worldgen.x, worldgen.y + 2, `grassbg${grasstype}b`);
                } else {
                    setBlock(worldgen.x, worldgen.y + 1, `grassbg${grasstype}`);
                }
            }
            
            // reduce treedelay
            if (worldgen.treedelay > 0) {
                worldgen.treedelay--;
            }

        } else { // lake generation
            const lakey = Math.round(-Math.sin((-(lakeblocks-laketotallength)/laketotallength)*Math.PI)*laketotallength/3);
            const lakegeny = worldgen.y + lakey;
            if (lakey > -2) {
                setBlock(worldgen.x, worldgen.y, lakeblock);
                for (var i = 0; i < -lakey+2; i++) {
                    setBlock(worldgen.x, worldgen.y - 1 - i, lakeblock);
                }
            } else {
                setBlock(worldgen.x, worldgen.y, 'watertop');
                for (var i = 0; i < -lakey; i++) {
                    setBlock(worldgen.x, worldgen.y - 1 - i, 'water');
                }
                for (var i = 0; i < 2; i++) {
                    setBlock(worldgen.x, lakegeny - 1 - i, lakeblock);
                }
            }
            for (var i = worldgen.y - 1; i > worldgen.y - 5; i--) {
                if (i < lakegeny - 2) {
                    setBlock(worldgen.x, i, 'dirt');
                }
            }
            for (var i = worldgen.y - 5; i > 0 + layerOffset1; i--) {
                if (i < worldgen.y - 4 + layerOffset0 && i < lakegeny - 2) {
                    setBlock(worldgen.x, i, 'stone1');
                }
            }
            for (var i = 0 + layerOffset1; i > -12 + layerOffset2; i--) {
                if (i < worldgen.y - 4 + layerOffset0 && i < lakegeny - 2) {
                    setBlock(worldgen.x, i, 'stone2');
                }
            }
            for (var i = -12 + layerOffset2; i > -24 + layerOffset3; i--) {
                if (i < lakegeny - 2) {
                    setBlock(worldgen.x, i, 'stone3');
                }
            }
            for (var i = -24 + layerOffset3; i > -27; i--) {
                if (i < lakegeny - 2) {
                    setBlock(worldgen.x, i, 'stone4');
                }
            }
        }
        worldgen.x++;
        if (lakeblocks > 0) {
            lakeblocks--;
        } else {
            worldgen.noisex++;
        }
    }
    mapxsize = Math.abs(start) + Math.abs(end);
    mapstart = start;
    mapend = end;
    console.log(`Generated map of size ${blocks.size}, spanning ${mapxsize} blocks`);
}

function renderWorld(camx, camy) {
    document.body.innerHTML = ' '
    blocksRendered = 0;

    const canvas = document.createElement('canvas');
    canvas.style = `position:absolute;top:0;left:0;margin:0`;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const camx2 = camx - Math.floor(camx);
    const camy2 = camy - Math.floor(camy);
    
    for (var y = -1; y < 17 / camera.scale * (window.innerHeight / 1080); y++) {
        for (var x = 0; x < 31 / camera.scale * (window.innerWidth / 1920); x++) {
            if (-y + Math.floor(camy) < -26 || x + Math.floor(camx) < mapstart || x + Math.floor(camx) > mapend-1) {
                showBlock(ctx, x - camx2, -y - camy2, 'stone4');
                blocksRendered++;
            } else {
                const block = getBlock(x + Math.floor(camx), -y + Math.floor(camy));
                if (!(block == null)) {
                    if (block == 'watertop') { // show water animated
                        showBlock(ctx, x - camx2, -y - camy2, waterimg);
                    } else {
                        showBlock(ctx, x - camx2, -y - camy2, block);
                    }
                    blocksRendered++;
                }
            }
        }
    }
    renderPlayer(ctx, camera.x, camera.y);
    document.body.appendChild(canvas);
}

function spawnPlayer(spawnx) {
    var spawnCoords = [0, 0];
    var foundBlock = false;
    var i = -1024;
    while (true) {
        if (getBlock(spawnx,i) == null && foundBlock == true) {
            spawnCoords = [spawnx, i];
            console.log(`Spawned player at ${spawnCoords}`);
            break;
        } else if (!(getBlock(spawnx, i) == null)) {
            foundBlock = true;
        }
        i++;
    }
    player.x = spawnCoords[0];
    player.y = spawnCoords[1];
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
    var inWater = getBlock(Math.round(player.x),Math.floor(player.y)) == 'water';
    player.inWater = inWater;
    if (inWater) {
        player.air = false;
    }
    if (player.fly == false) {
        if (keys.ArrowLeft == true || keys.a == true) {
            player.mx += -0.04;
            if (player.mx < -0.12) {
                player.mx = -0.12;
            }
            player.acc = true;
        }
        if (keys.ArrowRight == true || keys.d == true) {
            player.mx += 0.04;
            if (player.mx > 0.12) {
                player.mx = 0.12;
            }
            player.acc = true;
        }
        if (!inWater) {
            if ((keys.ArrowUp == true || keys.w == true || keys.Space == true) && player.air == false) {
                player.my = 0.2;
                player.air = true;
            }
        }
        // water movement (up/down)
        else {
            if (keys.ArrowUp == true || keys.w == true || keys.Space == true) {
                player.my += 0.005;
            }
            if (keys.ArrowDown == true || keys.s == true ) {
                player.my -= 0.01;
            }
        }
    }
    
    // fly movement

    else {
        if (keys.ArrowLeft || keys.a) {
            player.mx += -0.12;
            if (player.mx < -0.4) {
                player.mx = -0.4;
            }
            player.flyx = true;
        }
        if (keys.ArrowRight || keys.d) {
            player.mx += 0.12;
            if (player.mx > 0.4) {
                player.mx = 0.4;
            }
            player.flyx = true;
        }
        if (keys.ArrowUp || keys.w || keys.Space) {
            player.my += 0.04;
            if (player.my > 0.2) {
                player.my = 0.2;
            }
            player.flyy = true;
        }
        if (keys.ArrowDown || keys.s) {
            player.my -= 0.04;
            if (player.my < -0.2) {
                player.my = -0.2;
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
    if ((!(getBlockCollision(Math.round(playerright - 0.001), Math.round(playerbottom)) == null) || !(getBlockCollision(Math.round(playerleft + 0.001), Math.round(playerbottom)) == null)) && (player.air == false || player.my < 0) && !inWater) {
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

function renderInfoText() {
    if (debug == true) {
        const infotext1 = document.createElement('p');
        infotext1.setAttribute('class', 'infotext');
        infotext1.innerHTML = `player: x ${Math.round(player.x * 100) / 100}; y ${Math.round(player.y * 100) / 100}; mx ${Math.round(player.mx * 100) / 100}; my ${Math.round(player.my * 100) / 100}; air ${player.air}; acc ${player.acc}; fly ${player.fly}; water ${player.inWater}`
        document.body.appendChild(infotext1);
        const infotext2 = document.createElement('p');
        infotext2.setAttribute('class', 'infotext');
        infotext2.setAttribute('style', 'top:24px');
        infotext2.innerHTML = `world: ${blocksRendered} blocks rendered; ${blocks.size} total blocks; ${mapxsize} map size; ${camera.scale} scale`
        document.body.appendChild(infotext2);
        const infotext3 = document.createElement('p');
        infotext3.setAttribute('class', 'infotext');
        infotext3.setAttribute('style', 'top:48px');
        infotext3.innerHTML = `time: tick ${ticknum}; env ${envTime}; target rate ${tickrate}; rate ${tickrateComputed}; max ${tickrateHigh}; min ${tickrateLow}`
        document.body.appendChild(infotext3);
    } else {
        const infotext1 = document.createElement('p');
        infotext1.setAttribute('class', 'infotext');
        infotext1.innerHTML = `Coordinates: (${Math.round(player.x)}, ${Math.round(player.y)})`
        document.body.appendChild(infotext1);
        const infotext2 = document.createElement('p');
        infotext2.setAttribute('class', 'infotext');
        infotext2.setAttribute('style', 'top:24px');
        var timestring1 = envTime.toString().padStart(5,'0');
        var timestring2 = Math.floor(timestring1.slice(2,5) / 1000 * 60).toString().padStart(2,'0');
        var timestring = `${timestring1.slice(0,2)}:${timestring2}`;
        infotext2.innerHTML = `Time: ${timestring}`;
        document.body.appendChild(infotext2);
        if (!(camera.scale == 1)) {
            const infotext3 = document.createElement('p');
            infotext3.setAttribute('class', 'infotext');
            infotext3.setAttribute('style', 'top:48px');
            infotext3.innerHTML = `Camera scale: ${camera.scale}x`
            document.body.appendChild(infotext3);
        }
    }
    const infotext4 = document.createElement('p');
    infotext4.setAttribute('class', 'infotext2');
    infotext4.innerHTML = `${version}`
    document.body.appendChild(infotext4);
    const infotext5 = document.createElement('p');
    infotext5.setAttribute('class', 'blockselector');
    infotext5.innerHTML = `${selblocks[currentblock]} (${currentblock + 1}/${selblocks.length})`;
    document.body.appendChild(infotext5);
    if (!keys.q) {
        const controlk = document.createElement('p');
        controlk.setAttribute('class', 'infotext3');
        controlk.innerHTML = `show controls: q`;
        document.body.appendChild(controlk);
    } else {
        const controlk = document.createElement('pre');
        controlk.setAttribute('class', 'infotext3');
        controlk.textContent = `move: WASD / arrows
delete block: z
place block: x
toggle fly mode: c
choose block: n / m
change zoom: - / 0 / +`;
        document.body.appendChild(controlk);
    }
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
    if (keys.z) { // destroy block
        if (!(getBlock(Math.floor(mx/64 / camera.scale + camera.x), Math.ceil(-my/64 / camera.scale + camera.y)) == 'stone4')) {
            deleteBlock(Math.floor(mx/64 / camera.scale + camera.x), Math.ceil(-my/64 / camera.scale + camera.y));
        }
    }
    if (keys.x) { // place block
        // rules for special blocks
        if (!(getBlockCollision(Math.floor(mx/64 / camera.scale + camera.x), Math.ceil(-my/64 / camera.scale + camera.y)) == 'stone4' || Math.ceil(-my/64 / camera.scale + camera.y) < -26 || (Math.round(player.x) == Math.floor(mx/64 / camera.scale + camera.x) && Math.round(player.y) == Math.ceil(-my/64 / camera.scale + camera.y)))) {
            if (selblocks[currentblock] == 'grassbg6' || selblocks[currentblock] == 'grassbg7') {
                setBlock(Math.floor(mx/64 / camera.scale + camera.x), Math.ceil(-my/64 / camera.scale + camera.y), selblocks[currentblock]+'a');
                setBlock(Math.floor(mx/64 / camera.scale + camera.x), Math.ceil(-my/64 / camera.scale + camera.y)+1, selblocks[currentblock]+'b');
            }
            else {
                setBlock(Math.floor(mx/64 / camera.scale + camera.x), Math.ceil(-my/64 / camera.scale + camera.y), selblocks[currentblock]);
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
    blockModification();
    // log tick
    if (Number.isInteger(ticknum/tickrate/10)) {
        console.log(`Tick ${ticknum} (second ${ticknum/tickrate})`);
    }
    ticknum++;
}

worldGen(-1024, 1024);
spawnPlayer(Math.round((mapstart / 2) + (mapend / 2))); // should just be 0
tick();

const clock = setInterval(tick, 1000/tickrate);