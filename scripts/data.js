// addblock function helps organize everything
const allblocks = [];
const blocknames = {}; // object.
const nocollision = [];
const selblocks = [];
const transparentblocks = []; // used to optimize rendering
const hardness = [];
const tooltypes = [];
const blockactions = [];

// durability: how many interactions before breaking
// efficiency: rate at which blocks are destroyed (hardness/sec)
// damage: how much damage the tool does to mobs
// level: what types of blocks the tool can break depend on the level, like a wooden (level 1) tool can't break stone2, but a level 7 zyrite breaks everything
const toolTiers = { // wooden, stone, coal, iron, gold, diamond, emerald, ruby, zyrite, developer (special)
    0: { durability: Infinity, efficiency: 0, damage: 1, level: 0 }, // hands (no tool). can only break 0 hardness blocks
    1: { durability: 32, efficiency: 0.05, damage: 3, level: 1 },
    2: { durability: 64, efficiency: 0.1, damage: 4, level: 2 },
    3: { durability: 128, efficiency: 0.08, damage: 5, level: 2 }, // special, pickaxe autosmelts ores & sword burns mobs
    4: { durability: 256, efficiency: 0.25, damage: 7, level: 3 },
    5: { durability: 512, efficiency: 0.6, damage: 9, level: 3},
    6: { durability: 1024, efficiency: 1.0, damage: 12, level: 4 },
    7: { durability: 2048, efficiency: 2.2, damage: 18, level: 5 },
    8: { durability: 4096, efficiency: 3.6, damage: 27, level: 6 },
    9: { durability: 8192, efficiency: 5.0, damage: 48, level: 7 },
    10: { durability: Infinity, efficiency: Infinity, damage: Infinity },
}

function addBlock(block) {
    let id = block.id;
    let name = block.name;
    let collision = block.col;
    let selectable = block.sel;
    let t = block.t;
    let hard = block.h; // how long it takes to break
    let type = block.type;
    let actions = block.actions;
    allblocks.push(id);
    if (t) transparentblocks.push(id);
    if (!collision) nocollision.push(id);
    if (selectable) selblocks.push(id);
    if (name) blocknames[id] = name;
    if (hard) {hardness[id] = hard;}
    else {hardness[id] = 0;} // assume the block is meant to instantly break
    if (type) tooltypes[id] = type; // type of tool needed to break the block
    if (actions) blockactions[id] = actions; // actions are onInteract, onBreak, onPlace. more will be added in the future
}

const initialBlockList = [
    // block hardness values for reference: leaves 0.5, dirt/sand 1, grass block 1.5, log 5, stone1 10, stone2 40, stone3 160
    // the majority of blocks need a specific tool to break, the exclusions are: any 0-hardness blocks, glass, and leaves.
    // block types: pickaxe, axe, shovel, none
    // none = break with any tool including hand, others are self explanatory.
    // blocks with no type = automatically default to none
    
    //
    ///// Category: Construction blocks
    //

    // bricks
    { id: 'bricks', name: 'Bricks', col: true, sel: true, h: 20, type: 'pickaxe' },
    { id: 'dirtbricks', name: 'Dirt Bricks', col: true, sel: true, h: 8, type: 'pickaxe' },
    { id: 'goldbricks', name: 'Gold Bricks', col: true, sel: true, h: 444, type: 'pickaxe' }, // good for defense, due to its high hardness.
    { id: 'stonebricks', name: 'Stone Bricks', col: true, sel: true, h: 25, type: 'pickaxe' },

    // planks
    { id: 'planks1', name: 'Autumn Planks', col: true, sel: true, h: 5, type: 'axe' },
    { id: 'planks2', name: 'Meadow Planks', col: true, sel: true, h: 5, type: 'axe' },
    { id: 'planks3', name: 'Woods Planks', col: true, sel: true, h: 5, type: 'axe' },

    // other
    { id: 'crate', name: 'Wooden Crate', col: true, sel: true, h: 8 },
    { id: 'glass', name: 'Glass', col: true, sel: true, t: true, h: 3 },

    //
    ///// Category: Natural blocks
    //

    { id: 'water', name: 'Water', col: false, sel: true, h: Infinity },
    { id: 'watertop', name: undefined, col: false, sel: true, t: true, h: Infinity },

    { id: 'sand', name: 'Sand', col: true, sel: true, h: 1, type: 'shovel' },
    { id: 'dirt', name: 'Dirt', col: true, sel: true, h: 1, type: 'shovel' },
    { id: 'cactus', name: 'Cactus', col: true, sel: true, h: 0.5 },

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
    { id: 'grass1', name: 'Autumn Grass', col: true, sel: true, h: 1.5, type: 'shovel' },
    { id: 'grass2', name: 'Meadow Grass', col: true, sel: true, h: 1.5, type: 'shovel' },
    { id: 'grass3', name: 'Woods Grass', col: true, sel: true, h: 1.5, type: 'shovel' },
    { id: 'grass4', name: 'Snowy Grass', col: true, sel: true, h: 1.8, type: 'shovel' },

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
    { id: 'leaves1', name: 'Yellow Autumn Leaves', col: true, sel: true, h: 0.5 },
    { id: 'leaves2', name: 'Orange Autumn Leaves', col: true, sel: true, h: 0.5 },
    { id: 'leaves3', name: 'Red Autumn Leaves', col: true, sel: true, h: 0.5 },
    { id: 'leaves4', name: 'Bright Yellow Autumn Leaves', col: true, sel: true, h: 0.5 },
    { id: 'leaves5', name: 'Green Meadow Leaves', col: true, sel: true, h: 0.5 },
    { id: 'leaves6', name: 'Dark Woods Leaves', col: true, sel: true, h: 0.5 },
    { id: 'leaves7', name: 'Snowy Leaves', col: true, sel: true, h: 0.5 },

    // logs
    { id: 'log1', name: 'Autumn Log', col: true, sel: true, h: 5, type: 'axe' },
    { id: 'log2', name: 'Meadow Log', col: true, sel: true, h: 5, type: 'axe' },
    { id: 'log3', name: 'Woods Log', col: true, sel: true, h: 5, type: 'axe' },

    // stone types
    { id: 'stone1', name: 'Stone', col: true, sel: true, h: 10, type: 'pickaxe'},
    { id: 'stone2', name: 'Dark Stone', col: true, sel: true, h: 40, type: 'pickaxe' },
    { id: 'stone3', name: 'Very Dark Stone', col: true, sel: true, h: 160, type: 'pickaxe' },
    { id: 'stone4', name: 'Unbreakable Stone', col: true, sel: false }, // unbreakable stone

    // cobblestone types
    { id: 'cobblestone1', name: 'Cobblestone', col: true, sel: true, h: 15, type: 'pickaxe' },
    { id: 'cobblestone2', name: 'Dark Cobblestone', col: true, sel: true, h: 60, type: 'pickaxe' },
    { id: 'cobblestone3', name: 'Very Dark Cobblestone', col: true, sel: true, h: 200, type: 'pickaxe' },

    // ores (very big)
    // hardness base values: coal 12, iron 16, gold 24, diamond 48, emerald 72, ruby 96, zyrite 128
    // remember: each stone level increases the hardness by 4x, so coal ore in dark stone is 48, in very dark stone is 192, etc.
    { id: 'ore_coal1', name: 'Coal Ore', col: true, sel: true, h: 12, type: 'pickaxe' },
    { id: 'ore_coal2', name: 'Dark Coal Ore', col: true, sel: true, h: 48, type: 'pickaxe' },
    { id: 'ore_coal3', name: 'Very Dark Coal Ore', col: true, sel: true, h: 192, type: 'pickaxe' },
    { id: 'ore_iron1', name: 'Iron Ore', col: true, sel: true, h: 16, type: 'pickaxe' },
    { id: 'ore_iron2', name: 'Dark Iron Ore', col: true, sel: true, h: 64, type: 'pickaxe' },
    { id: 'ore_iron3', name: 'Very Dark Iron Ore', col: true, sel: true, h: 256, type: 'pickaxe' },
    { id: 'ore_gold1', name: 'Gold Ore', col: true, sel: true, h: 24, type: 'pickaxe' },
    { id: 'ore_gold2', name: 'Dark Gold Ore', col: true, sel: true, h: 96, type: 'pickaxe' },
    { id: 'ore_gold3', name: 'Very Dark Gold Ore', col: true, sel: true, h: 384, type: 'pickaxe' },
    { id: 'ore_diamond1', name: 'Diamond Ore', col: true, sel: true, h: 48, type: 'pickaxe' },
    { id: 'ore_diamond2', name: 'Dark Diamond Ore', col: true, sel: true, h: 192, type: 'pickaxe' },
    { id: 'ore_diamond3', name: 'Very Dark Diamond Ore', col: true, sel: true, h: 768, type: 'pickaxe' },
    { id: 'ore_emerald1', name: 'Emerald Ore', col: true, sel: true, h: 72, type: 'pickaxe' },
    { id: 'ore_emerald2', name: 'Dark Emerald Ore', col: true, sel: true, h: 288, type: 'pickaxe' },
    { id: 'ore_emerald3', name: 'Very Dark Emerald Ore', col: true, sel: true, h: 1152, type: 'pickaxe' },
    { id: 'ore_ruby1', name: 'Ruby Ore', col: true, sel: true, h: 96, type: 'pickaxe' },
    { id: 'ore_ruby2', name: 'Dark Ruby Ore', col: true, sel: true, h: 384, type: 'pickaxe' },
    { id: 'ore_ruby3', name: 'Very Dark Ruby Ore', col: true, sel: true, h: 1536, type: 'pickaxe' },
    { id: 'ore_zyrite1', name: 'Zyrite Ore', col: true, sel: true, h: 128, type: 'pickaxe' },
    { id: 'ore_zyrite2', name: 'Dark Zyrite Ore', col: true, sel: true, h: 512, type: 'pickaxe' },
    { id: 'ore_zyrite3', name: 'Very Dark Zyrite Ore', col: true, sel: true, h: 2048, type: 'pickaxe' },

    //
    ///// Category: Colorful blocks
    //

    // colored glass
    { id: 'cglass1', name: 'Red Colored Glass', col: true, sel: true, t: true, h: 3 },
    { id: 'cglass2', name: 'Orange Colored Glass', col: true, sel: true, t: true, h: 3 },
    { id: 'cglass3', name: 'Yellow Colored Glass', col: true, sel: true, t: true, h: 3 },
    { id: 'cglass4', name: 'Lime Colored Glass', col: true, sel: true, t: true, h: 3 },
    { id: 'cglass5', name: 'Green Colored Glass', col: true, sel: true, t: true, h: 3 },
    { id: 'cglass6', name: 'Aqua Colored Glass', col: true, sel: true, t: true, h: 3 },
    { id: 'cglass7', name: 'Cyan Colored Glass', col: true, sel: true, t: true, h: 3 },
    { id: 'cglass8', name: 'Light Blue Colored Glass', col: true, sel: true, t: true, h: 3 },
    { id: 'cglass9', name: 'Blue Colored Glass', col: true, sel: true, t: true, h: 3 },
    { id: 'cglass10', name: 'Dark Purple Colored Glass', col: true, sel: true, t: true, h: 3 },
    { id: 'cglass11', name: 'Purple Colored Glass', col: true, sel: true, t: true, h: 3 },
    { id: 'cglass12', name: 'Pink Colored Glass', col: true, sel: true, t: true, h: 3 },
    { id: 'cglass13', name: 'Hot Pink Colored Glass', col: true, sel: true, t: true, h: 3 },
    { id: 'cglass14', name: 'Black Colored Glass', col: true, sel: true, t: true, h: 3 },
    { id: 'cglass15', name: 'Brown Colored Glass', col: true, sel: true, t: true, h: 3 },
    { id: 'cglass16', name: 'Gray Colored Glass', col: true, sel: true, t: true, h: 3 },

    //
    ///// Category: testing / internal
    //

    { id: 'player', name: undefined, col: false, sel: false, t: true, h: Infinity },
    { id: 'test', name: undefined, col: true, sel: false, h: 1 },
    { id: 'watertop_render1', name: undefined, col: false, sel: false, t: true, h: Infinity },
    { id: 'watertop_render2', name: undefined, col: false, sel: false, t: true, h: Infinity },
    { id: 'watertop_render3', name: undefined, col: false, sel: false, t: true, h: Infinity },
    { id: 'watertop_render4', name: undefined, col: false, sel: false, t: true, h: Infinity },
];
const tools = [ // 
    // wooden, stone, coal, iron, gold, diamond, emerald, ruby, zyrite
    // pickaxes
    { id: 'pickaxe1', name: 'Wooden Pickaxe', tier: 1, type: 'pickaxe' },
    { id: 'pickaxe2', name: 'Stone Pickaxe', tier: 2, type: 'pickaxe' },
    { id: 'pickaxe3', name: 'Coal Pickaxe', tier: 3, type: 'pickaxe' },
    { id: 'pickaxe4', name: 'Iron Pickaxe', tier: 4, type: 'pickaxe' },
    { id: 'pickaxe5', name: 'Gold Pickaxe', tier: 5, type: 'pickaxe' },
    { id: 'pickaxe6', name: 'Diamond Pickaxe', tier: 6, type: 'pickaxe' },
    { id: 'pickaxe7', name: 'Emerald Pickaxe', tier: 7, type: 'pickaxe' },
    { id: 'pickaxe8', name: 'Ruby Pickaxe', tier: 8, type: 'pickaxe' },
    { id: 'pickaxe9', name: 'Zyrite Pickaxe', tier: 9, type: 'pickaxe' },
    // axes
    { id: 'axe1', name: 'Wooden Axe', tier: 1, type: 'axe' },
    { id: 'axe2', name: 'Stone Axe', tier: 2, type: 'axe' },
    { id: 'axe3', name: 'Coal Axe', tier: 3, type: 'axe' },
    { id: 'axe4', name: 'Iron Axe', tier: 4, type: 'axe' },
    { id: 'axe5', name: 'Gold Axe', tier: 5, type: 'axe' },
    { id: 'axe6', name: 'Diamond Axe', tier: 6, type: 'axe' },
    { id: 'axe7', name: 'Emerald Axe', tier: 7, type: 'axe' },
    { id: 'axe8', name: 'Ruby Axe', tier: 8, type: 'axe' },
    { id: 'axe9', name: 'Zyrite Axe', tier: 9, type: 'axe' },
    // shovels
    { id: 'shovel1', name: 'Wooden Shovel', tier: 1, type: 'shovel' },
    { id: 'shovel2', name: 'Stone Shovel', tier: 2, type: 'shovel' },
    { id: 'shovel3', name: 'Coal Shovel', tier: 3, type: 'shovel' },
    { id: 'shovel4', name: 'Iron Shovel', tier: 4, type: 'shovel' },
    { id: 'shovel5', name: 'Gold Shovel', tier: 5, type: 'shovel' },
    { id: 'shovel6', name: 'Diamond Shovel', tier: 6, type: 'shovel' },
    { id: 'shovel7', name: 'Emerald Shovel', tier: 7, type: 'shovel' },
    { id: 'shovel8', name: 'Ruby Shovel', tier: 8, type: 'shovel' },
    { id: 'shovel9', name: 'Zyrite Shovel', tier: 9, type: 'shovel' },
];
const overlays = ['breaking1', 'breaking2', 'breaking3', 'breaking4','blockselect'];
for (let block of initialBlockList) {
    addBlock(block);
}