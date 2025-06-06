// addblock function helps organize everything
const allblocks = [];
const blocknames = {}; // object.
const nocollision = [];
const selblocks = [];
const transparentblocks = []; // used to optimize rendering

const toolTiers = { // wooden, stone, coal, iron, gold, diamond, emerald, ruby, zyrite, developer (special)
    0: { durability: Infinity, efficiency: 0.2, damage: 1 }, // hands (no tool)
    1: { durability: 32, efficiency: 0.5, damage: 3 },
    2: { durability: 64, efficiency: 0.8, damage: 4 },
    3: { durability: 128, efficiency: 0.5, damage: 5 }, // special, pickaxe autosmelts ores & sword burns mobs
    4: { durability: 256, efficiency: 1.2, damage: 7 },
    5: { durability: 512, efficiency: 1.5, damage: 9 },
    6: { durability: 1024, efficiency: 1.8, damage: 12 },
    7: { durability: 2048, efficiency: 2.5, damage: 18 },
    8: { durability: 4096, efficiency: 3.6, damage: 27 },
    9: { durability: 8192, efficiency: 5.0, damage: 48 },
    10: { durability: Infinity, efficiency: Infinity, damage: Infinity },
}

function addBlock(block) {
    let id = block.id;
    let name = block.name;
    let collision = block.col;
    let selectable = block.sel;
    let t = block.t;
    allblocks.push(id);
    if (t) transparentblocks.push(id);
    if (!collision) nocollision.push(id);
    if (selectable) selblocks.push(id);
    if (name) blocknames[id] = name;
}

const initialBlockList = [
    //
    ///// Category: Construction blocks
    //

    // bricks
    { id: 'bricks', name: 'Bricks', col: true, sel: true },
    { id: 'dirtbricks', name: 'Dirt Bricks', col: true, sel: true },
    { id: 'goldbricks', name: 'Gold Bricks', col: true, sel: true },
    { id: 'stonebricks', name: 'Stone Bricks', col: true, sel: true },

    // planks
    { id: 'planks1', name: 'Autumn Planks', col: true, sel: true },
    { id: 'planks2', name: 'Meadow Planks', col: true, sel: true },
    { id: 'planks3', name: 'Woods Planks', col: true, sel: true },

    // other
    { id: 'crate', name: 'Wooden Crate', col: true, sel: true },
    { id: 'glass', name: 'Glass', col: true, sel: true, t: true },

    //
    ///// Category: Natural blocks
    //

    { id: 'water', name: 'Water', col: false, sel: true },
    { id: 'watertop', name: undefined, col: false, sel: true, t: true },

    { id: 'sand', name: 'Sand', col: true, sel: true },
    { id: 'dirt', name: 'Dirt', col: true, sel: true },
    { id: 'cactus', name: 'Cactus', col: true, sel: true },

    // flowers
    { id: 'flower1', name: 'Red Flower', col: false, sel: true, t: true },
    { id: 'flower2', name: 'Orange Flower', col: false, sel: true, t: true },
    { id: 'flower3', name: 'Yellow Flower', col: false, sel: true, t: true },
    { id: 'flower4', name: 'Green Flower', col: false, sel: true, t: true },
    { id: 'flower5', name: 'Teal Flower', col: false, sel: true, t: true },
    { id: 'flower6', name: 'Blue Flower', col: false, sel: true, t: true },
    { id: 'flower7', name: 'Violet Flower', col: false, sel: true, t: true },
    { id: 'flower8', name: 'Pink Flower', col: false, sel: true, t: true },

    // grass (full blocks)
    { id: 'grass1', name: 'Autumn Grass', col: true, sel: true },
    { id: 'grass2', name: 'Meadow Grass', col: true, sel: true },
    { id: 'grass3', name: 'Woods Grass', col: true, sel: true },
    { id: 'grass4', name: 'Snowy Grass', col: true, sel: true },

    // grass (backgrounds)
    { id: 'grassbg1', name: undefined, col: false, sel: false, t: true },
    { id: 'grassbg2', name: undefined, col: false, sel: false, t: true },
    { id: 'grassbg3', name: undefined, col: false, sel: false, t: true },
    { id: 'grassbg4', name: undefined, col: false, sel: false, t: true },
    { id: 'grassbg5', name: undefined, col: false, sel: false, t: true },
    { id: 'grassbg6a', name: undefined, col: false, sel: false, t: true },
    { id: 'grassbg6b', name: undefined, col: false, sel: false, t: true },
    { id: 'grassbg7a', name: undefined, col: false, sel: false, t: true },
    { id: 'grassbg7b', name: undefined, col: false, sel: false, t: true },

    // leaves (full blocks)
    { id: 'leaves1', name: 'Yellow Autumn Leaves', col: true, sel: true },
    { id: 'leaves2', name: 'Orange Autumn Leaves', col: true, sel: true },
    { id: 'leaves3', name: 'Red Autumn Leaves', col: true, sel: true },
    { id: 'leaves4', name: 'Bright Yellow Autumn Leaves', col: true, sel: true },
    { id: 'leaves5', name: 'Green Meadow Leaves', col: true, sel: true },
    { id: 'leaves6', name: 'Dark Woods Leaves', col: true, sel: true },
    { id: 'leaves7', name: 'Snowy Leaves', col: true, sel: true },

    // logs
    { id: 'log1', name: 'Autumn Log', col: true, sel: true },
    { id: 'log2', name: 'Meadow Log', col: true, sel: true },
    { id: 'log3', name: 'Woods Log', col: true, sel: true },

    // stone types
    { id: 'stone1', name: 'Stone', col: true, sel: true },
    { id: 'stone2', name: 'Dark Stone', col: true, sel: true },
    { id: 'stone3', name: 'Very Dark Stone', col: true, sel: true },
    { id: 'stone4', name: 'Unbreakable Stone', col: true, sel: false }, // unbreakable stone

    // cobblestone types
    { id: 'cobblestone1', name: 'Cobblestone', col: true, sel: true },
    { id: 'cobblestone2', name: 'Dark Cobblestone', col: true, sel: true },
    { id: 'cobblestone3', name: 'Very Dark Cobblestone', col: true, sel: true },

    // ores (very big)
    { id: 'ore_coal1', name: 'Coal Ore', col: true, sel: true },
    { id: 'ore_coal2', name: 'Dark Coal Ore', col: true, sel: true },
    { id: 'ore_coal3', name: 'Very Dark Coal Ore', col: true, sel: true },
    { id: 'ore_iron1', name: 'Iron Ore', col: true, sel: true },
    { id: 'ore_iron2', name: 'Dark Iron Ore', col: true, sel: true },
    { id: 'ore_iron3', name: 'Very Dark Iron Ore', col: true, sel: true },
    { id: 'ore_gold1', name: 'Gold Ore', col: true, sel: true },
    { id: 'ore_gold2', name: 'Dark Gold Ore', col: true, sel: true },
    { id: 'ore_gold3', name: 'Very Dark Gold Ore', col: true, sel: true },
    { id: 'ore_diamond1', name: 'Diamond Ore', col: true, sel: true },
    { id: 'ore_diamond2', name: 'Dark Diamond Ore', col: true, sel: true },
    { id: 'ore_diamond3', name: 'Very Dark Diamond Ore', col: true, sel: true },
    { id: 'ore_emerald1', name: 'Emerald Ore', col: true, sel: true },
    { id: 'ore_emerald2', name: 'Dark Emerald Ore', col: true, sel: true },
    { id: 'ore_emerald3', name: 'Very Dark Emerald Ore', col: true, sel: true },
    { id: 'ore_ruby1', name: 'Ruby Ore', col: true, sel: true },
    { id: 'ore_ruby2', name: 'Dark Ruby Ore', col: true, sel: true },
    { id: 'ore_ruby3', name: 'Very Dark Ruby Ore', col: true, sel: true },
    { id: 'ore_zyrite1', name: 'Zyrite Ore', col: true, sel: true },
    { id: 'ore_zyrite2', name: 'Dark Zyrite Ore', col: true, sel: true },
    { id: 'ore_zyrite3', name: 'Very Dark Zyrite Ore', col: true, sel: true },

    //
    ///// Category: Colorful blocks
    //

    // colored glass
    { id: 'cglass1', name: 'Red Colored Glass', col: true, sel: true, t: true },
    { id: 'cglass2', name: 'Orange Colored Glass', col: true, sel: true, t: true },
    { id: 'cglass3', name: 'Yellow Colored Glass', col: true, sel: true, t: true },
    { id: 'cglass4', name: 'Lime Colored Glass', col: true, sel: true, t: true },
    { id: 'cglass5', name: 'Green Colored Glass', col: true, sel: true, t: true },
    { id: 'cglass6', name: 'Aqua Colored Glass', col: true, sel: true, t: true },
    { id: 'cglass7', name: 'Cyan Colored Glass', col: true, sel: true, t: true },
    { id: 'cglass8', name: 'Light Blue Colored Glass', col: true, sel: true, t: true },
    { id: 'cglass9', name: 'Blue Colored Glass', col: true, sel: true, t: true },
    { id: 'cglass10', name: 'Dark Purple Colored Glass', col: true, sel: true, t: true },
    { id: 'cglass11', name: 'Purple Colored Glass', col: true, sel: true, t: true },
    { id: 'cglass12', name: 'Pink Colored Glass', col: true, sel: true, t: true },
    { id: 'cglass13', name: 'Hot Pink Colored Glass', col: true, sel: true, t: true },
    { id: 'cglass14', name: 'Black Colored Glass', col: true, sel: true, t: true },
    { id: 'cglass15', name: 'Brown Colored Glass', col: true, sel: true, t: true },
    { id: 'cglass16', name: 'Gray Colored Glass', col: true, sel: true, t: true },

    //
    ///// Category: testing / internal
    //

    { id: 'player', name: undefined, col: false, sel: false, t: true },
    { id: 'test', name: undefined, col: true, sel: false },
    { id: 'watertop_render1', name: undefined, col: false, sel: false, t: true },
    { id: 'watertop_render2', name: undefined, col: false, sel: false, t: true },
    { id: 'watertop_render3', name: undefined, col: false, sel: false, t: true },
    { id: 'watertop_render4', name: undefined, col: false, sel: false, t: true },
];
const tools = [ // 
    // wooden, stone, coal, iron, gold, diamond, emerald, ruby, zyrite
    // only pickaxes for now.
    { id: 'pickaxe1', name: 'Wooden Pickaxe', tier: 1 },
    { id: 'pickaxe2', name: 'Stone Pickaxe', tier: 2 },
    { id: 'pickaxe3', name: 'Coal Pickaxe', tier: 3 },
    { id: 'pickaxe4', name: 'Iron Pickaxe', tier: 4 },
    { id: 'pickaxe5', name: 'Gold Pickaxe', tier: 5 },
    { id: 'pickaxe6', name: 'Diamond Pickaxe', tier: 6 },
    { id: 'pickaxe7', name: 'Emerald Pickaxe', tier: 7 },
    { id: 'pickaxe8', name: 'Ruby Pickaxe', tier: 8 },
    { id: 'pickaxe9', name: 'Zyrite Pickaxe', tier: 9 },
];
for (let block of initialBlockList) {
    addBlock(block);
}