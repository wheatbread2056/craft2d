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
    return new Math.seedrandom(env.global.seed + worldgen.x + (id * 100000))();
}
// noise generation stuff (very inefficient)
var cells1d = [[],[],[],[],[],[]]; // 6 levels of noise
var scale1d = [];
var biome1d = [];

function initialNoiseGeneration(p) { // p = power of 2 for noise size, 65536 = 2^16
    if (env.global.worldGenType == 'normal') {
        for (var i1 = 0; i1 < cells1d.length; i1++) {
            for (var i = 0; i < (2**p)*2; i++) {
                cells1d[i1].push(mapgenrandom(-10 + (i / 100000)));
            }
            console.log(`${Math.floor(i1/(cells1d.length)*100)}% finished generating map noise (${i1+1}/${cells1d.length+1})`);
        }
        // do something similar for scale1d (256 blocks per integer)
        for (var i = 0; i < (2**p); i++) {
            scale1d.push(mapgenrandom(-9 + (i / 100000)));
        }

        // do something similar for biome1d (512 blocks per integer)
        for (var i = 0; i < (2**p); i++) {
            biome1d.push(mapgenrandom(-19 + (i / 100000)));
        }
        console.log(`100% finished generating map noise (7/7)`);
    } else {
        console.log(`Noise generation skipped (worldgen type set to ${env.global.worldGenType})`);
    }
}
var treerate = 0.12;

function worldGen(start, end) {
    let startTime = performance.now() / 1000;
    worldgen = {x:start, y:0, scale:1, treedelay:0, biome:0};
    if (env.global.worldGenType == 'normal') {
        let ores = ['coal', 'iron', 'gold', 'diamond', 'emerald', 'ruby', 'zyrite'];
        let oreProperties = {
            // zyrite is the final ore
            coal: {size: 5, rate: 0.004, minimumStoneType: 1, maxHeight: Infinity},
            iron: {size: 4, rate: 0.003, minimumStoneType: 1, maxHeight: Infinity},
            gold: {size: 4, rate: 0.0015, minimumStoneType: 1, maxHeight: 64},
            diamond: {size: 3, rate: 0.0008, minimumStoneType: 1, maxHeight: 48},
            emerald: {size: 3, rate: 0.0004, minimumStoneType: 2, maxHeight: 2},
            ruby: {size: 3, rate: 0.00016, minimumStoneType: 2, maxHeight: -4},
            zyrite: {size: 1, rate: 0.0001, minimumStoneType: 3, maxHeight: -16},
        }

        function generateOreVein(type, x, y) {
            let veinSize = Math.round(oreProperties[type].size * veinSizeMultiplier);
            let veinRate = oreProperties[type].rate;
            let minimumStoneType = oreProperties[type].minimumStoneType;
            let maxHeight = oreProperties[type].maxHeight;

            if (Math.random() > veinRate * (1 - (y / 120))) {
                return;
            }

            if (y > maxHeight) {
                return;
            }

            let visited = new Set();
            let directions = [
                {dx: -1, dy: 0},
                {dx: 1, dy: 0},
                {dx: 0, dy: -1},
                {dx: 0, dy: 1}
            ];

            function isVisited(x, y) {
                return visited.has(`${x},${y}`);
            }

            function markVisited(x, y) {
                visited.add(`${x},${y}`);
            }

            for (let i = 0; i < veinSize; i++) {
                let retries = 0;
                while (retries < 50) {
                    const block = getBlock(x, y);
                    // avoids generating ores in stone4 or higher, since there aren't any ore textures made for them because stone4 is meant to be unbrakable
                    if (!isVisited(x, y) && block && block.startsWith('stone') && parseInt(block.replace('stone', '')) >= minimumStoneType && parseInt(block.replace('stone', '')) < 4) {
                        let stoneType = getBlock(x, y).replace('stone', '');
                        setBlock(x, y, `ore_${type}${stoneType}`);
                        markVisited(x, y);
                        break;
                    } else {
                        retries++;
                        let direction = directions[Math.floor(Math.random() * directions.length)];
                        x += direction.dx;
                        y += direction.dy;
                    }
                }

                let direction = directions[Math.floor(Math.random() * directions.length)];
                x += direction.dx;
                y += direction.dy;
            }
        }

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

            let underwater = false;
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
                    setBlock(worldgen.x, worldgen.y, 'dirt', 'bg');
                    for (var i = worldgen.y - 1; i > worldgen.y - 5 + layerOffset0; i--) {
                        setBlock(worldgen.x, i, 'dirt');
                        setBlock(worldgen.x, i, 'dirt', 'bg');
                    }
                }
                if (worldgen.biome == 1) { // meadows
                    if (worldgen.y >= 128) {
                        setBlock(worldgen.x, worldgen.y, 'grass4');
                    } else {
                        setBlock(worldgen.x, worldgen.y, 'grass2');
                    }
                    setBlock(worldgen.x, worldgen.y, 'dirt', 'bg');
                    for (var i = worldgen.y - 1; i > worldgen.y - 5 + layerOffset0; i--) {
                        setBlock(worldgen.x, i, 'dirt');
                        setBlock(worldgen.x, i, 'dirt', 'bg');
                    }
                }
                if (worldgen.biome == 2) { // desert
                    for (var i = worldgen.y; i > worldgen.y - 3 + layerOffset0; i--) {
                        setBlock(worldgen.x, i, 'sand');
                        setBlock(worldgen.x, i, 'sand', 'bg');
                    }
                    for (var i = worldgen.y - 2; i > worldgen.y - 5 + layerOffset0; i--) {
                        setBlock(worldgen.x, i, 'dirt');
                        setBlock(worldgen.x, i, 'dirt', 'bg');
                    }
                }
                if (worldgen.biome == 3) { // Woods
                    if (worldgen.y >= 128) {
                        setBlock(worldgen.x, worldgen.y, 'grass4');
                    } else {
                        setBlock(worldgen.x, worldgen.y, 'grass3');
                    }
                    setBlock(worldgen.x, worldgen.y, 'dirt', 'bg');
                    for (var i = worldgen.y - 1; i > worldgen.y - 5 + layerOffset0; i--) {
                        setBlock(worldgen.x, i, 'dirt');
                        setBlock(worldgen.x, i, 'dirt', 'bg');
                    }
                }
            } else {
                setBlock(worldgen.x, env.global.worldSeaLevel, 'watertop');
                setBlock(worldgen.x, worldgen.y, 'sand');
                setBlock(worldgen.x, worldgen.y, 'sand', 'bg');
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
                    setBlock(worldgen.x, i, 'stone1', 'bg');
                }
            }
            for (var i = 0 + layerOffset1; i > -12 + layerOffset2; i--) {
                if (i < worldgen.y - 4 + layerOffset0) {
                    setBlock(worldgen.x, i, 'stone2');
                    setBlock(worldgen.x, i, 'stone2', 'bg');
                }
            }
            for (var i = -12 + layerOffset2; i > -24 + layerOffset3; i--) {
                setBlock(worldgen.x, i, 'stone3');
                setBlock(worldgen.x, i, 'stone3', 'bg');
            }
            for (var i = -24 + layerOffset3; i > -27; i--) {
                setBlock(worldgen.x, i, 'stone4');
            }

            // ore generation
            // vein size multiplier = 0.5 to 1.5
            var veinSizeMultiplier = mapgenrandom(91) + 0.5;
            for (let ore of ores) {
                for (let y = worldgen.y - 1; y >= -24; y--) {
                    generateOreVein(ore, worldgen.x, y);
                }
            }
            
            if (!underwater) {
                // make tree
                if (treerng < treerate && worldgen.treedelay < 1) {
                    if (worldgen.biome == 0) { // autumn trees
                        // log
                        logsize = Math.round(mapgenrandom(10) * 2 + 2) // 2 to 4
                        for (var i = 0; i < logsize; i++) {
                            setBlock(worldgen.x, worldgen.y + i + 1, 'log1', 'bg');
                        }
                        // leaves
                        var leaftype = Math.round(mapgenrandom(11) * 3 + 1);
                        for (var a = 0; a < 2; a++) {
                            for (var b = 0; b < 3; b++) {
                                if (worldgen.y >= 128) {
                                    setBlock(worldgen.x - 1 + b, worldgen.y + logsize + 1 + a, `leaves7`, 'bg');
                                } else {
                                    setBlock(worldgen.x - 1 + b, worldgen.y + logsize + 1 + a, `leaves${leaftype}`, 'bg');
                                }
                            }
                        }
                        if (worldgen.y >= 128) {
                            setBlock(worldgen.x, worldgen.y + logsize + 3, `leaves7`, 'bg');
                        } else {
                            setBlock(worldgen.x, worldgen.y + logsize + 3, `leaves${leaftype}`, 'bg');
                        }
                        worldgen.treedelay = 4;
                    }
                    if (worldgen.biome == 1) { // meadow trees
                        // log 
                        logsize = Math.round(mapgenrandom(10) * 2 + 2) // 2 to 4
                        for (var i = 0; i < logsize; i++) {
                            setBlock(worldgen.x, worldgen.y + i + 1, 'log2', 'bg');
                        }
                        // leaves 
                        for (var a = 0; a < 2; a++) {
                            for (var b = 0; b < 3; b++) {
                                if (worldgen.y >= 128) {
                                    setBlock(worldgen.x - 1 + b, worldgen.y + logsize + 1 + a, 'leaves7', 'bg');
                                } else {
                                    setBlock(worldgen.x - 1 + b, worldgen.y + logsize + 1 + a, 'leaves5', 'bg');
                                }
                            }
                        }
                        if (worldgen.y >= 128) {
                            setBlock(worldgen.x, worldgen.y + logsize + 3, 'leaves7', 'bg');
                        } else {
                            setBlock(worldgen.x, worldgen.y + logsize + 3, 'leaves5', 'bg');
                        }
                        worldgen.treedelay = 4;
                    }
                    if (worldgen.biome == 2) { // desert cactus
                        // cactus size
                        cactuslength = Math.round(mapgenrandom(10) * 2 + 1); // 1 to 3
                        for (var i = 0; i < cactuslength; i++) {
                            setBlock(worldgen.x, worldgen.y + i + 1, 'cactus', 'bg');
                        }
                        worldgen.treedelay = 2;
                    }
                    if (worldgen.biome == 3) { // woods tree
                        logsize = Math.round(mapgenrandom(10) * 4 + 3); // 3 to 7
                        leafamount = Math.round(mapgenrandom(51) + 2); // 2 to 3
                        for (var i = 0; i < logsize; i++) {
                            setBlock(worldgen.x, worldgen.y + i + 1, 'log3', 'bg');
                            setBlock(worldgen.x + 1, worldgen.y + i + 1, 'log3', 'bg');
                            // manually fix floating logs
                            if (getBlock(worldgen.x + 1, worldgen.y) == null) {
                                setBlock(worldgen.x + 1, worldgen.y, 'log3', 'bg');
                            }
                            if (getBlock(worldgen.x + 1, worldgen.y - 1) == null) {
                                setBlock(worldgen.x + 1, worldgen.y - 1, 'log3', 'bg');
                            }
                        }
                        for (var leaf1 = 0; leaf1 < leafamount; leaf1++) {
                            for (var i = 0; i < 6; i++) {
                                if (worldgen.y >= 128) {
                                    setBlock(worldgen.x - 2 + i, worldgen.y + logsize + 1 + (leaf1 * 3), 'leaves7', 'bg');
                                } else {
                                    setBlock(worldgen.x - 2 + i, worldgen.y + logsize + 1 + (leaf1 * 3), 'leaves6', 'bg');
                                }
                            }
                            for (var i = 0; i < 4; i++) {
                                if (worldgen.y >= 128) {
                                    setBlock(worldgen.x - 1 + i, worldgen.y + logsize + 2 + (leaf1 * 3), 'leaves7', 'bg');
                                } else {
                                    setBlock(worldgen.x - 1 + i, worldgen.y + logsize + 2 + (leaf1 * 3), 'leaves6', 'bg');
                                }
                            }
                            for (var i = 0; i < 2; i++) {
                                if (worldgen.y >= 128) {
                                    setBlock(worldgen.x + i, worldgen.y + logsize + 3 + (leaf1 * 3), 'leaves7', 'bg');
                                } else {
                                    setBlock(worldgen.x + i, worldgen.y + logsize + 3 + (leaf1 * 3), 'leaves6', 'bg');
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
                            setBlock(worldgen.x, worldgen.y + 1, `grassbg${grasstype}a`, 'fg');
                            setBlock(worldgen.x, worldgen.y + 2, `grassbg${grasstype}b`, 'fg');
                        } else {
                            setBlock(worldgen.x, worldgen.y + 1, `grassbg${grasstype}`, 'fg');
                        }
                    }
                }
                // make grass for Woods
                if (worldgen.biome == 3) {
                    if (!(treerng < treerate) && (mapgenrandom(12) < (mapgenrandom(13) * 2) && worldgen.treedelay < 6)) {
                        let grasstype = Math.round(mapgenrandom(14) * 6 + 1);
                        if (grasstype == 6 || grasstype == 7) {
                            setBlock(worldgen.x, worldgen.y + 1, `grassbg${grasstype}a`, 'fg');
                            setBlock(worldgen.x, worldgen.y + 2, `grassbg${grasstype}b`, 'fg');
                        } else if (grasstype == 5) {
                            setBlock(worldgen.x, worldgen.y + 1, `grassbg1`, 'fg');
                        } else {
                            setBlock(worldgen.x, worldgen.y + 1, `grassbg${grasstype}`, 'fg');
                        }
                    }
                }
                // make flowers
                if (worldgen.biome == 1) {
                    if (!(treerng < treerate) && (mapgenrandom(12) < (mapgenrandom(13) * 0.5))) {
                        let grasstype = Math.round(mapgenrandom(14) * 7 + 1);
                        setBlock(worldgen.x, worldgen.y + 1, `flower${grasstype}`, 'fg');
                    }
                }
                // make bushes
                if (worldgen.biome == 1) {
                    if (!(treerng < treerate) && mapgenrandom(25) < 0.04 && worldgen.treedelay < 1) {
                        setBlock(worldgen.x, worldgen.y + 1, 'leaves5', 'bg');
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
                    setBlock(worldgen.x, worldgen.y + i + 1, 'log2', 'bg');
                }
                // leaves 
                for (var a = 0; a < 2; a++) {
                    for (var b = 0; b < 3; b++) {
                        if (worldgen.y >= 128) {
                            setBlock(worldgen.x - 1 + b, worldgen.y + logsize + 1 + a, 'leaves7', 'bg');
                        } else {
                            setBlock(worldgen.x - 1 + b, worldgen.y + logsize + 1 + a, 'leaves5', 'bg');
                        }
                    }
                }
                setBlock(worldgen.x, worldgen.y + logsize + 3, 'leaves5', 'bg'); // last leaf on the top
                worldgen.treedelay = 4;
            }


            // make flowers
            if (!(treerng < treerate) && (mapgenrandom(12) < (mapgenrandom(13) * 0.5))) {
                let grasstype = Math.round(mapgenrandom(14) * 7 + 1);
                setBlock(worldgen.x, worldgen.y + 1, `flower${grasstype}`, 'fg');
            }
            // make bushes
            if (!(treerng < treerate) && mapgenrandom(25) < 0.04 && worldgen.treedelay < 1) {
                setBlock(worldgen.x, worldgen.y + 1, 'leaves5', 'bg');
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
    console.log(`Generated map region in ${(performance.now() / 1000 - startTime).toFixed(3)}s - new total size ${mapxsize} (${world.fg.size + world.bg.size} blocks)`);
}