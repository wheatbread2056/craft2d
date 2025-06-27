// functions for noise world gen
// code credit https://observablehq.com/@bensimonds/perlin-noise
function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}
function lerp(a, b, t) {
    return ((1 - t) * a) + (t * b);
}

function noise1d(seed, x, freq = 1) {
    // freq: how many blocks per integer step (default 1)
    // seed: a unique number for each noise layer
    // x: position (float)
    const xi = Math.floor(x / freq);
    const xf = (x / freq) - xi;

    // use a deterministic seeded random for each integer position.
    function grad(ix) {
        // unique seed for each integer position
        return new Math.seedrandom(env.global.seed + seed + ix * 100003)();
    }

    const g1 = grad(xi);
    const g2 = grad(xi + 1);

    return lerp(g1, g2, fade(xf));
}

// world gen propertis
var worldgen = { x: 0, y: 0, scale: 1, treedelay: 0 };
function mapgenrandom(id) { // makes random number generation easier, id doesn't repeat for 100k blocks
    return new Math.seedrandom(env.global.seed + worldgen.x + (id * 100000))();
}
var caveX = []; // store x positions where caves need to be generated, generating them during worldgen causes issues.

// fix this in a later update?
var treerate = 0.12;

function worldGen(start, end) {
    let startTime = performance.now() / 1000;
    worldgen = { x: start, y: 0, scale: 1, treedelay: 0, biome: 0 };
    if (env.global.worldGenType == 'normal') {
        let ores = ['coal', 'copper', 'iron', 'gold', 'diamond', 'emerald', 'ruby', 'zyrite'];
        let oreProperties = {
            coal: { size: 5, rate: 0.004, maxHeight: Infinity },
            copper: {size: 4, rate: 0.0032, maxHeight: Infinity },
            iron: { size: 4, rate: 0.0025, maxHeight: Infinity },
            gold: { size: 4, rate: 0.0015, maxHeight: 48 },
            diamond: { size: 3, rate: 0.0008, maxHeight: 32 },
            emerald: { size: 3, rate: 0.0004, maxHeight: 16 },
            ruby: { size: 3, rate: 0.00016, maxHeight: 0 },
            zyrite: { size: 1, rate: 0.0001, maxHeight: -12 },
        }

        function generateOreVein(type = null, x, y, guaranteed = false) {
            if (!type || !oreProperties[type]) {
                type = ores[Math.floor(Math.random() * ores.length)];
            }
            let veinSizeMultiplier = Math.random() * 0.5 + 1;
            let veinSize = Math.round(oreProperties[type].size * veinSizeMultiplier);
            let veinRate = oreProperties[type].rate;
            if (guaranteed) veinRate = Infinity;
            let maxHeight = oreProperties[type].maxHeight;

            if (Math.random() > veinRate) {
                return;
            }

            if (y > maxHeight) {
                return;
            }

            let visited = new Set();
            let directions = [
                { dx: -1, dy: 0 },
                { dx: 1, dy: 0 },
                { dx: 0, dy: -1 },
                { dx: 0, dy: 1 }
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
                    if (!isVisited(x, y) && block && block.startsWith('stone') && parseInt(block.replace('stone', '')) < 4) {
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
            // On-demand noise: use unique seeds for each layer
            worldgen.y = (noise1d(100, 32768 + worldgen.x, 128) * 64); // 128 blocks per integer, 64 blocks range
            for (var noiselayer = 1; noiselayer < 6; noiselayer++) {
                worldgen.y += (noise1d(100 + noiselayer, 32768 + worldgen.x, 128 / (2 ** noiselayer)) * (32 / (2 ** noiselayer)));
            }
            worldgen.scale = noise1d(200, 32768 + worldgen.x, 256) * 1.2 + 0.8;
            worldgen.biome = Math.floor(noise1d(300, 32768 + worldgen.x, 512) * 4);
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
            const treerng = mapgenrandom(2);

            let underwater = false;
            if (worldgen.y <= env.global.worldSeaLevel) {
                underwater = true;
            }

            layerOffset0 = Math.round(mapgenrandom(6));
            layerOffset1 = Math.round(mapgenrandom(7) * 2 - 1);
            layerOffset2 = Math.round(mapgenrandom(8) * 2 - 1);
            layerOffset3 = Math.round(mapgenrandom(9) * 2 - 1);

            // ... (rest of worldGen function unchanged)
            // (copy the rest of your worldGen function here, unchanged)
            // Only the noise1d calls above are changed
            // (for brevity, not repeating unchanged code)
            
            // --- BEGIN UNCHANGED CODE ---
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
                setBlock(worldgen.x, env.global.worldSeaLevel, 'water');
                setBlock(worldgen.x, worldgen.y, 'sand');
                setBlock(worldgen.x, worldgen.y, 'sand', 'bg');
                setBlock(worldgen.x, worldgen.y-1, 'sand');
                setBlock(worldgen.x, worldgen.y-1, 'sand', 'bg');
                for (var i = env.global.worldSeaLevel - 1; i > worldgen.y; i--) {
                    setBlock(worldgen.x, i, 'water');
                }
                for (var i = worldgen.y - 2; i > worldgen.y - 5 + layerOffset0; i--) {
                    setBlock(worldgen.x, i, 'dirt');
                    setBlock(worldgen.x, i, 'dirt', 'bg');
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

            // this is very hard to find

            // so heres an ascii art of a square, to make it easy to find.
            // #######################################
            // #######################################
            // ###                                 ###
            // ###                                 ###
            // ###                                 ###
            // ###                                 ###
            // ###                                 ###
            // ###       ore generation            ###
            // ###                                 ###
            // ###                                 ###
            // ###                                 ###
            // ###                                 ###
            // #######################################
            for (var i = worldgen.y - 4; i > -27; i--) {
                // console.log('trying', worldgen.x, i);
                for (var tsVariableisNotUsedsoIcanNameItWhateverIWant_TylerGregoryOkonma_aka_tyler_the_creator_is_a_famous_rapper_with_a_net_worth_of_1_billion_Craft2d_coins_in_version_beta_1000_oh_icantTypePeriodsOrCommasThatsReallyUnfortunate_andYouMayhaveNoticedICanOnlyUseUnderscoresAsSpacesSoThatIsAlsoABitAnnoyingButItsFine_butOneDayWhileExploringTheVastPixelatedWorldOfCraft2dHeStumbledUponASecretCaveFilledWithGlowingOres_andAsHeVenturedDeeperHeRealizedThatEachOreHadASpecialPowerGrantingHimAbilitiesLikeSuperJumpAndSpeedBoost_soonHeBecameTheLegendaryMinerKnownThroughoutTheServerForHisEpicAdventures_andEveryPlayerWouldGatherToHearHisTalesOfDiscoveryAndDanger_inspiredByHisJourneyManySetOutToFindTheirOwnHiddenTreasuresButNoneCouldMatchTheLuckAndSkillOfTylerTheCreatorWhoEventuallyBuiltACastleOutOfDiamondBlocksAndHostedTheGreatestPartyCraft2dHadEverSeen in oreProperties) {
                    generateOreVein(null, worldgen.x, i);
                }
            }

            if (!underwater) {
                // make tree
                if (treerng < treerate && worldgen.treedelay < 1) {
                    if (worldgen.biome == 0) { // autumn trees
                        logsize = Math.round(mapgenrandom(10) * 2 + 2)
                        for (var i = 0; i < logsize; i++) {
                            setBlock(worldgen.x, worldgen.y + i + 1, 'log1', 'bg');
                        }
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
                        logsize = Math.round(mapgenrandom(10) * 2 + 2)
                        for (var i = 0; i < logsize; i++) {
                            setBlock(worldgen.x, worldgen.y + i + 1, 'log2', 'bg');
                        }
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
                        cactuslength = Math.round(mapgenrandom(10) * 2 + 1);
                        for (var i = 0; i < cactuslength; i++) {
                            setBlock(worldgen.x, worldgen.y + i + 1, 'cactus', 'bg');
                        }
                        worldgen.treedelay = 2;
                    }
                    if (worldgen.biome == 3) { // woods tree
                        logsize = Math.round(mapgenrandom(10) * 4 + 3);
                        leafamount = Math.round(mapgenrandom(51) + 2);
                        for (var i = 0; i < logsize; i++) {
                            setBlock(worldgen.x, worldgen.y + i + 1, 'log3', 'bg');
                            setBlock(worldgen.x + 1, worldgen.y + i + 1, 'log3', 'bg');
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
                if (worldgen.biome == 1) {
                    if (!(treerng < treerate) && (mapgenrandom(12) < (mapgenrandom(13) * 0.5))) {
                        let grasstype = Math.round(mapgenrandom(14) * 7 + 1);
                        setBlock(worldgen.x, worldgen.y + 1, `flower${grasstype}`, 'fg');
                    }
                }
                if (worldgen.biome == 1) {
                    if (!(treerng < treerate) && mapgenrandom(25) < 0.04 && worldgen.treedelay < 1) {
                        setBlock(worldgen.x, worldgen.y + 1, 'leaves5', 'bg');
                    }
                }
            }

            // make surface "noodle" caves.
            let noodleCave = mapgenrandom(911);
            if (noodleCave < 0.008) {
                caveX.push(worldgen.x);
            }
            
            worldgen.treedelay--;

            worldgen.x++;
            // --- END UNCHANGED CODE ---
        }
        function noodleCave(x, y = 'get it from worldgen', horizontal = false, branching = true) {
            worldgen.x = x;
            let direction = true; // if horizontal, true = right and false = left
            // figure out worldgen.y by just copying how the generation does it
            if (y == 'get it from worldgen') {
                worldgen.y = (noise1d(100, 32768 + worldgen.x, 128) * 64);
                for (var noiselayer = 1; noiselayer < 6; noiselayer++) {
                    worldgen.y += (noise1d(100 + noiselayer, 32768 + worldgen.x, 128 / (2 ** noiselayer)) * (32 / (2 ** noiselayer)));
                }
                worldgen.scale = noise1d(200, 32768 + worldgen.x, 256) * 1.2 + 0.8;
                worldgen.y *= worldgen.scale;
                worldgen.y = Math.floor(worldgen.y);
            }
            
            let caveLength = Math.round(mapgenrandom(180) * 95 + 5); // 5 to 100.
            // figure out if the cave can go past y=-16, if it can then limit its length
            if (worldgen.y - caveLength < -16) {
                caveLength = worldgen.y + 16;
            }
            let caveWidth = Math.round(mapgenrandom(195) * 3 + 2); // 2 to 5
            let directions = [
                { dx: -1, dy: -1 }, // small left
                { dx: 1, dy: -1 }, // small right
                { dx: -3, dy: -1}, // big left
                { dx: 3, dy: -1 }, // big right
                { dx: 0, dy: -1 }, // straight down
            ]; // no up because the caves shouldnt go up
            if (horizontal) {
                direction = Math.random() < 0.5;
                directions = [
                    { dx: 1, dy: -1 }, // small down
                    { dx: 1, dy: 1 }, // small up
                    { dx: 1, dy: -2 }, // big down
                    { dx: 1, dy: 2 }, // big up
                    { dx: 1, dy: -1 }, // straight
                ];
            }
            let currentCaveX = worldgen.x;
            let currentCaveY = worldgen.y;
            if (y != 'get it from worldgen') {
                let currentCaveY = y;
            }
            for (let i = 0; i < caveLength; i++) {
                // explode (this is how caves are made)
                explosion(currentCaveX, currentCaveY, caveWidth, true, false); // preserves bg blocks
                // if this cave is a branching cave, branch into a horizontal cave
                if (branching && Math.random() < 0.05 && currentCaveY < env.global.worldSeaLevel) {
                    noodleCave(currentCaveX, currentCaveY, true, false); // horizontal cave
                }
                // choose a random direction
                let direction = directions[Math.floor(mapgenrandom(92 + Math.random()) * directions.length)];
                if (horizontal) {
                    direction.dx = direction.dx * (direction ? 1 : -1); // if horizontal, flip the direction based on the boolean
                }
                currentCaveX += direction.dx;
                currentCaveY += direction.dy;
            }
            console.log(`noodle. entrance: ${worldgen.x},${worldgen.y} length: ${caveLength} width: ${caveWidth}. this is ${horizontal ? 'a' : 'not a'} horizontal cave.`);
        }
        // now that the loop is finished, do things that need to be done after loop

        // first step. caves.
        for (let cavepos of caveX) {
            noodleCave(cavepos);
        }
    }
    else if (env.global.worldGenType == 'flat') {
        // (flat world code unchanged)
        for (var z = start; z < end; z++) {
            worldgen.y = 16;
            worldgen.scale = 1;
            worldgen.biome = 1;
            worldgen.y = Math.floor(worldgen.y);

            treerate += (mapgenrandom(1) * 0.01 - 0.005);
            if (treerate > 0.16) {
                treerate = 0.16;
            }
            if (treerate < 0.02) {
                treerate = 0.02;
            }
            const treerng = mapgenrandom(2)

            layerOffset0 = Math.round(mapgenrandom(6));
            layerOffset1 = Math.round(mapgenrandom(7) * 2 - 1);
            layerOffset2 = Math.round(mapgenrandom(8) * 2 - 1);
            layerOffset3 = Math.round(mapgenrandom(9) * 2 - 1);

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

            if (treerng < treerate && worldgen.treedelay < 1) {
                logsize = Math.round(mapgenrandom(10) * 2 + 2)
                for (var i = 0; i < logsize; i++) {
                    setBlock(worldgen.x, worldgen.y + i + 1, 'log2', 'bg');
                }
                for (var a = 0; a < 2; a++) {
                    for (var b = 0; b < 3; b++) {
                        if (worldgen.y >= 128) {
                            setBlock(worldgen.x - 1 + b, worldgen.y + logsize + 1 + a, 'leaves7', 'bg');
                        } else {
                            setBlock(worldgen.x - 1 + b, worldgen.y + logsize + 1 + a, 'leaves5', 'bg');
                        }
                    }
                }
                setBlock(worldgen.x, worldgen.y + logsize + 3, 'leaves5', 'bg');
                worldgen.treedelay = 4;
            }

            if (!(treerng < treerate) && (mapgenrandom(12) < (mapgenrandom(13) * 0.5))) {
                let grasstype = Math.round(mapgenrandom(14) * 7 + 1);
                setBlock(worldgen.x, worldgen.y + 1, `flower${grasstype}`, 'fg');
            }
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
    if (start < env.global.mapstart) {
        env.global.mapstart = start;
    }
    if (end > env.global.mapend) {
        env.global.mapend = end;
    }
    env.global.mapxsize = Math.abs(env.global.mapstart) + Math.abs(env.global.mapend);
    console.log(`Generated map region in ${(performance.now() / 1000 - startTime).toFixed(3)}s - new total size ${env.global.mapxsize} (${world.fg.size + world.bg.size} chunks)`);
}
