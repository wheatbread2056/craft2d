// addblock function helps organize everything
const allblocks = [];
const blocknames = {}; // object.
const nocollision = [];
const selblocks = [];
const transparentblocks = []; // used to optimize rendering
const hardness = [];
const blocktypes = [];
const blocklevels = [];
const blockactions = [];
const blockdrops = [];
const stacksizes = [];

// durability: how many interactions before breaking
// efficiency: rate at which blocks are destroyed (hardness/sec)
// damage: how much damage the tool does to mobs
// level: what types of blocks the tool can break depend on the level, like a wooden (level 1) tool can't break stone2, but a level 7 zyrite breaks everything
const toolTiers = { // wooden, stone, copper, iron, gold, diamond, emerald, ruby, zyrite, developer (special)
    0: { durability: Infinity, efficiency: 0, damage: 1, level: 0 }, // hands (no tool). can only break 0 hardness blocks
    1: { durability: 32, efficiency: 0.05, damage: 3, level: 1 },
    2: { durability: 64, efficiency: 0.1, damage: 4, level: 2 },
    3: { durability: 128, efficiency: 0.15, damage: 5, level: 3 }, // special, pickaxe autosmelts ores & sword burns mobs
    4: { durability: 256, efficiency: 0.25, damage: 7, level: 4 },
    5: { durability: 512, efficiency: 0.6, damage: 9, level: 5},
    6: { durability: 1024, efficiency: 1.0, damage: 12, level: 6 },
    7: { durability: 2048, efficiency: 2.2, damage: 18, level: 7 },
    8: { durability: 4096, efficiency: 3.6, damage: 27, level: 8 },
    9: { durability: 8192, efficiency: 5.0, damage: 48, level: 9 },
    10: { durability: 16384, efficiency: 10.0, damage: 96, level: 10 }, // solarite (will be added in beta 1.0)
    'dev': { durability: Infinity, efficiency: Infinity, damage: Infinity, level: Infinity },
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
    let drops = block.drops; // what the block drops when broken, can be a string or an array of strings
    let level = block.level;
    allblocks.push(id);
    if (t) transparentblocks.push(id);
    if (!collision) nocollision.push(id);
    if (selectable) selblocks.push(id);
    if (name) blocknames[id] = name;
    if (hard) {hardness[id] = hard;}
    else {hardness[id] = 0;} // assume the block is meant to instantly break
    if (type) blocktypes[id] = type; // type of tool needed to break the block
    if (actions) blockactions[id] = actions; // actions are onInteract, onBreak, onPlace, onTouch. more will be added in the future
    if (drops) {
        blockdrops[id] = drops; // what the block drops
    } else {
        blockdrops[id] = id; // if no drops specified, drop itself
    }
    if (level) {
        blocklevels[id] = level;
    } else {
        blocklevels[id] = 0; // break from anything including the hand.
    }
}

const initialBlockList = [
    // block hardness values for reference: leaves 0.5, dirt/sand 1, grass block 1.5, log 5, stone1 10, stone2 40, stone3 160
    // the majority of blocks need a specific tool to break, the exclusions are: any 0-hardness blocks, glass, and leaves.
    // block types: pickaxe, axe, shovel, none
    // none = break with any tool including hand, others are self explanatory.
    // blocks with no type = automatically default to none

    //
    ///// Category: Utility blocks
    //
    
    // crafting table aka the crafter
    { id: 'crafter', name: 'Crafter', col: true, sel: true, h: 5, actions: {onInteract: () => {openCraftingGUI();}}},
    
    //
    ///// Category: Construction blocks
    //

    // bricks
    { id: 'bricks', name: 'Bricks', col: true, sel: true, h: 20, type: 'pickaxe', level: 3 },
    { id: 'dirtbricks', name: 'Dirt Bricks', col: true, sel: true, h: 8, type: 'pickaxe', level: 1 },
    { id: 'goldbricks', name: 'Gold Bricks', col: true, sel: true, h: 444, type: 'pickaxe', level: 8 }, // good for defense, due to its high hardness.
    { id: 'stonebricks', name: 'Stone Bricks', col: true, sel: true, h: 25, type: 'pickaxe', level: 3 },

    // planks
    { id: 'planks1', name: 'Autumn Planks', col: true, sel: true, h: 5, type: 'axe', level: 1 },
    { id: 'planks2', name: 'Meadow Planks', col: true, sel: true, h: 5, type: 'axe', level: 1 },
    { id: 'planks3', name: 'Woods Planks', col: true, sel: true, h: 5, type: 'axe', level: 1},

    // other
    { id: 'crate', name: 'Wooden Crate', col: true, sel: true, h: 8, actions: {
        onInteract: (x, y, layer) => {
            openCrateGUI(x, y);
        },
        onBreak: (x, y, layer) => {
            // Drop all items from the crate when broken
            const crateKey = `${x},${y}`;
            const crateData = player.crates.get(crateKey);
            if (crateData) {
                // Add all crate items to player inventory (or drop them)
                for (let slotId in crateData.items) {
                    let item = crateData.items[slotId];
                    if (item.id && item.amount > 0) {
                        player.inventory.addItem(item.id, item.amount);
                    }
                }
                player.crates.delete(crateKey);
            }
        }
    }},
    { id: 'glass', name: 'Glass', col: true, sel: true, t: true, h: 3 },

    //
    ///// Category: Natural blocks
    //

    { id: 'water', name: 'Water', col: false, sel: true, h: Infinity },
    { id: 'watertop', name: undefined, col: false, sel: true, t: true, h: Infinity },

    { id: 'sand', name: 'Sand', col: true, sel: true, h: 1, type: 'shovel', level: 1 },
    { id: 'dirt', name: 'Dirt', col: true, sel: true, h: 1, type: 'shovel', level: 1 },
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
    { id: 'grass1', name: 'Autumn Grass', col: true, sel: true, h: 1.5, type: 'shovel', level: 1 },
    { id: 'grass2', name: 'Meadow Grass', col: true, sel: true, h: 1.5, type: 'shovel', level: 1 },
    { id: 'grass3', name: 'Woods Grass', col: true, sel: true, h: 1.5, type: 'shovel', level: 1 },
    { id: 'grass4', name: 'Snowy Grass', col: true, sel: true, h: 1.8, type: 'shovel', level: 1 },

    // grass (backgrounds)
    { id: 'grassbg1', name: undefined, col: false, sel: false, t: true, drops: [] },
    { id: 'grassbg2', name: undefined, col: false, sel: false, t: true, drops: [] },
    { id: 'grassbg3', name: undefined, col: false, sel: false, t: true, drops: [] },
    { id: 'grassbg4', name: undefined, col: false, sel: false, t: true, drops: [] },
    { id: 'grassbg5', name: undefined, col: false, sel: false, t: true, drops: [] },
    { id: 'grassbg6a', name: undefined, col: false, sel: false, t: true, drops: [] },
    { id: 'grassbg6b', name: undefined, col: false, sel: false, t: true, drops: [] },
    { id: 'grassbg7a', name: undefined, col: false, sel: false, t: true, drops: [] },
    { id: 'grassbg7b', name: undefined, col: false, sel: false, t: true, drops: [] },

    // leaves (full blocks)
    { id: 'leaves1', name: 'Yellow Autumn Leaves', col: true, sel: true, h: 0.5 },
    { id: 'leaves2', name: 'Orange Autumn Leaves', col: true, sel: true, h: 0.5 },
    { id: 'leaves3', name: 'Red Autumn Leaves', col: true, sel: true, h: 0.5 },
    { id: 'leaves4', name: 'Bright Yellow Autumn Leaves', col: true, sel: true, h: 0.5 },
    { id: 'leaves5', name: 'Green Meadow Leaves', col: true, sel: true, h: 0.5 },
    { id: 'leaves6', name: 'Dark Woods Leaves', col: true, sel: true, h: 0.5 },
    { id: 'leaves7', name: 'Snowy Leaves', col: true, sel: true, h: 0.5 },

    // logs
    { id: 'log1', name: 'Autumn Log', col: true, sel: true, h: 5, type: 'axe', level: 1 },
    { id: 'log2', name: 'Meadow Log', col: true, sel: true, h: 5, type: 'axe', level: 1 },
    { id: 'log3', name: 'Woods Log', col: true, sel: true, h: 5, type: 'axe', level: 1 },

    // stone types
    { id: 'stone1', name: 'Stone', col: true, sel: true, h: 10, type: 'pickaxe', drops: 'cobblestone1', level: 1 },
    { id: 'stone2', name: 'Dark Stone', col: true, sel: true, h: 40, type: 'pickaxe', drops: 'cobblestone2', level: 4 },
    { id: 'stone3', name: 'Very Dark Stone', col: true, sel: true, h: 160, type: 'pickaxe', drops: 'cobblestone3', level: 7 },
    { id: 'stone4', name: 'Unbreakable Stone', col: true, sel: false, h: Infinity }, // unbreakable stone

    // cobblestone types
    { id: 'cobblestone1', name: 'Cobblestone', col: true, sel: true, h: 15, type: 'pickaxe', level: 1 },
    { id: 'cobblestone2', name: 'Dark Cobblestone', col: true, sel: true, h: 60, type: 'pickaxe', level: 4 },
    { id: 'cobblestone3', name: 'Very Dark Cobblestone', col: true, sel: true, h: 200, type: 'pickaxe', level: 7 },

    // ores (very big)
    // hardness base values: coal 12, iron 16, gold 24, diamond 48, emerald 72, ruby 96, zyrite 128
    // remember: each stone level increases the hardness by 4x, so coal ore in dark stone is 48, in very dark stone is 192, etc.
    { id: 'ore_coal1', name: 'Coal Ore', col: true, sel: true, h: 12, type: 'pickaxe', level: 1 },
    { id: 'ore_coal2', name: 'Dark Coal Ore', col: true, sel: true, h: 48, type: 'pickaxe', level: 4 },
    { id: 'ore_coal3', name: 'Very Dark Coal Ore', col: true, sel: true, h: 192, type: 'pickaxe', level: 7 },
    { id: 'ore_copper1', name: 'Copper Ore', col: true, sel: true, h: 14, type: 'pickaxe', level: 2 },
    { id: 'ore_copper2', name: 'Dark Copper Ore', col: true, sel: true, h: 56, type: 'pickaxe', level: 4 },
    { id: 'ore_copper3', name: 'Very Dark Copper Ore', col: true, sel: true, h: 224, type: 'pickaxe', level: 7 },
    { id: 'ore_iron1', name: 'Iron Ore', col: true, sel: true, h: 16, type: 'pickaxe', level: 3 },
    { id: 'ore_iron2', name: 'Dark Iron Ore', col: true, sel: true, h: 64, type: 'pickaxe', level: 4 },
    { id: 'ore_iron3', name: 'Very Dark Iron Ore', col: true, sel: true, h: 256, type: 'pickaxe', level: 7 },
    { id: 'ore_gold1', name: 'Gold Ore', col: true, sel: true, h: 24, type: 'pickaxe', level: 4 },
    { id: 'ore_gold2', name: 'Dark Gold Ore', col: true, sel: true, h: 96, type: 'pickaxe', level: 4 },
    { id: 'ore_gold3', name: 'Very Dark Gold Ore', col: true, sel: true, h: 384, type: 'pickaxe', level: 7 },
    { id: 'ore_diamond1', name: 'Diamond Ore', col: true, sel: true, h: 48, type: 'pickaxe', level: 5 },
    { id: 'ore_diamond2', name: 'Dark Diamond Ore', col: true, sel: true, h: 192, type: 'pickaxe', level: 5 },
    { id: 'ore_diamond3', name: 'Very Dark Diamond Ore', col: true, sel: true, h: 768, type: 'pickaxe', level: 7 },
    { id: 'ore_emerald1', name: 'Emerald Ore', col: true, sel: true, h: 72, type: 'pickaxe', level: 6 },
    { id: 'ore_emerald2', name: 'Dark Emerald Ore', col: true, sel: true, h: 288, type: 'pickaxe', level: 6 },
    { id: 'ore_emerald3', name: 'Very Dark Emerald Ore', col: true, sel: true, h: 1152, type: 'pickaxe', level: 7 },
    { id: 'ore_ruby1', name: 'Ruby Ore', col: true, sel: true, h: 96, type: 'pickaxe', level: 7 },
    { id: 'ore_ruby2', name: 'Dark Ruby Ore', col: true, sel: true, h: 384, type: 'pickaxe', level: 7 },
    { id: 'ore_ruby3', name: 'Very Dark Ruby Ore', col: true, sel: true, h: 1536, type: 'pickaxe', level: 7 },
    { id: 'ore_zyrite1', name: 'Zyrite Ore', col: true, sel: true, h: 128, type: 'pickaxe', level: 8 },
    { id: 'ore_zyrite2', name: 'Dark Zyrite Ore', col: true, sel: true, h: 512, type: 'pickaxe', level: 8 },
    { id: 'ore_zyrite3', name: 'Very Dark Zyrite Ore', col: true, sel: true, h: 2048, type: 'pickaxe', level: 8 },

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

    // mobs (these shouldnt be blocks but whatever)
    { id: 'player', name: undefined, col: false, sel: false, t: true, h: Infinity },
    { id: 'woman', name: undefined, col: false, sel: false, t: true, h: Infinity },
    { id: 'pig', name: undefined, col: false, sel: false, t: true, h: Infinity },
    { id: 'cow', name: undefined, col: false, sel: false, t: true, h: Infinity },
    { id: 'chicken', name: undefined, col: false, sel: false, t: true, h: Infinity },
    { id: 'zombie', name: undefined, col: false, sel: false, t: true, h: Infinity },
    // slimes (blue, green, orange, purple, red, yellow)
    { id: 'slime_blue', name: undefined, col: false, sel: false, t: true, h: Infinity },
    { id: 'slime_green', name: undefined, col: false, sel: false, t: true, h: Infinity },
    { id: 'slime_orange', name: undefined, col: false, sel: false, t: true, h: Infinity },
    { id: 'slime_purple', name: undefined, col: false, sel: false, t: true, h: Infinity },
    { id: 'slime_red', name: undefined, col: false, sel: false, t: true, h: Infinity },
    { id: 'slime_yellow', name: undefined, col: false, sel: false, t: true, h: Infinity },

    // rest of testing
    { id: 'test', name: undefined, col: true, sel: false, h: 5, actions: { onPlace() {console.log('placed test block');}, onBreak() {console.log('broke test block');}, onInteract(x,y) {console.log('interacted with test block');}, onTouch() {console.log('touched test block');} } }, // test block, used for testing purposes
    { id: 'watertop_render1', name: undefined, col: false, sel: false, t: true, h: Infinity },
    { id: 'watertop_render2', name: undefined, col: false, sel: false, t: true, h: Infinity },
    { id: 'watertop_render3', name: undefined, col: false, sel: false, t: true, h: Infinity },
    { id: 'watertop_render4', name: undefined, col: false, sel: false, t: true, h: Infinity },
];
const tools = [ // 
    // wooden, stone, copper, iron, gold, diamond, emerald, ruby, zyrite
    // dev tools (template textures)
    { id: 'template_pickaxe', name: 'Developer Pickaxe', tier: 'dev', type: 'pickaxe', stack: 1 },
    { id: 'template_axe', name: 'Developer Axe', tier: 'dev', type: 'axe', stack: 1 },
    { id: 'template_shovel', name: 'Developer Shovel', tier: 'dev', type: 'shovel', stack: 1 },

    // pickaxes
    { id: 'pickaxe1', name: 'Wooden Pickaxe', tier: 1, type: 'pickaxe', stack: 1 },
    { id: 'pickaxe2', name: 'Stone Pickaxe', tier: 2, type: 'pickaxe', stack: 1 },
    { id: 'pickaxe3', name: 'Copper Pickaxe', tier: 3, type: 'pickaxe', stack: 1 },
    { id: 'pickaxe4', name: 'Iron Pickaxe', tier: 4, type: 'pickaxe', stack: 1 },
    { id: 'pickaxe5', name: 'Gold Pickaxe', tier: 5, type: 'pickaxe', stack: 1 },
    { id: 'pickaxe6', name: 'Diamond Pickaxe', tier: 6, type: 'pickaxe', stack: 1 },
    { id: 'pickaxe7', name: 'Emerald Pickaxe', tier: 7, type: 'pickaxe', stack: 1 },
    { id: 'pickaxe8', name: 'Ruby Pickaxe', tier: 8, type: 'pickaxe', stack: 1 },
    { id: 'pickaxe9', name: 'Zyrite Pickaxe', tier: 9, type: 'pickaxe', stack: 1 },
    // axes
    { id: 'axe1', name: 'Wooden Axe', tier: 1, type: 'axe', stack: 1 },
    { id: 'axe2', name: 'Stone Axe', tier: 2, type: 'axe', stack: 1 },
    { id: 'axe3', name: 'Copper Axe', tier: 3, type: 'axe', stack: 1 },
    { id: 'axe4', name: 'Iron Axe', tier: 4, type: 'axe', stack: 1 },
    { id: 'axe5', name: 'Gold Axe', tier: 5, type: 'axe', stack: 1 },
    { id: 'axe6', name: 'Diamond Axe', tier: 6, type: 'axe', stack: 1 },
    { id: 'axe7', name: 'Emerald Axe', tier: 7, type: 'axe', stack: 1 },
    { id: 'axe8', name: 'Ruby Axe', tier: 8, type: 'axe', stack: 1 },
    { id: 'axe9', name: 'Zyrite Axe', tier: 9, type: 'axe', stack: 1 },
    // shovels
    { id: 'shovel1', name: 'Wooden Shovel', tier: 1, type: 'shovel', stack: 1 },
    { id: 'shovel2', name: 'Stone Shovel', tier: 2, type: 'shovel', stack: 1 },
    { id: 'shovel3', name: 'Copper Shovel', tier: 3, type: 'shovel', stack: 1 },
    { id: 'shovel4', name: 'Iron Shovel', tier: 4, type: 'shovel', stack: 1 },
    { id: 'shovel5', name: 'Gold Shovel', tier: 5, type: 'shovel', stack: 1 },
    { id: 'shovel6', name: 'Diamond Shovel', tier: 6, type: 'shovel', stack: 1 },
    { id: 'shovel7', name: 'Emerald Shovel', tier: 7, type: 'shovel', stack: 1 },
    { id: 'shovel8', name: 'Ruby Shovel', tier: 8, type: 'shovel', stack: 1 },
    { id: 'shovel9', name: 'Zyrite Shovel', tier: 9, type: 'shovel', stack: 1 },
];
const items = [
    { id: 'stick', name: 'Stick'},
    { id: 'gold_stick', name: 'Gold Stick' },
    { id: 'diamond_stick', name: 'Diamond Stick' },
    { id: 'emerald_stick', name: 'Emerald Stick' },
    { id: 'ruby_stick', name: 'Ruby Stick' },
    { id: 'zyrite_stick', name: 'Zyrite Stick' },

    { id: 'copper_bar', name: 'Copper Bar' },
    { id: 'iron_bar', name: 'Iron Bar' },
    { id: 'gold_bar', name: 'Gold Bar' },
    { id: 'diamond_bar', name: 'Diamond Bar' },
    { id: 'emerald_bar', name: 'Emerald Bar' },
    { id: 'ruby_bar', name: 'Ruby Bar' },
    { id: 'zyrite_bar', name: 'Zyrite Bar' },

    { id: 'dye1', name: 'Red Dye' },
    { id: 'dye2', name: 'Orange Dye' },
    { id: 'dye3', name: 'Yellow Dye' },
    { id: 'dye4', name: 'Lime Dye' },
    { id: 'dye5', name: 'Green Dye' },
    { id: 'dye6', name: 'Aqua Dye' },
    { id: 'dye7', name: 'Cyan Dye' },
    { id: 'dye8', name: 'Light Blue Dye' },
    { id: 'dye9', name: 'Blue Dye' },
    { id: 'dye10', name: 'Dark Purple Dye' },
    { id: 'dye11', name: 'Purple Dye' },
    { id: 'dye12', name: 'Pink Dye' },
    { id: 'dye13', name: 'Hot Pink Dye' },
    { id: 'dye14', name: 'Black Dye' },
    { id: 'dye15', name: 'Brown Dye' },
    { id: 'dye16', name: 'Gray Dye' },
]
const groups = { // used for crafting
    'logs': { name: 'Logs', items: ['log1', 'log2', 'log3'] },
    'planks': { name: 'Planks', items: ['planks1', 'planks2', 'planks3'] },
    'stone': { name: 'Stone', items: ['stone1', 'stone2', 'stone3'] },
    'cobblestone': { name: 'Cobblestone', items: ['cobblestone1', 'cobblestone2', 'cobblestone3'] },
    'allstone': { name: 'Stone', items: ['stone1', 'stone2', 'stone3', 'cobblestone1', 'cobblestone2', 'cobblestone3'] },
    'coal': { name: 'Coal Ore', items: ['ore_coal1', 'ore_coal2', 'ore_coal3'] },
    'copper': { name: 'Copper Ore', items: ['ore_copper1', 'ore_copper2', 'ore_copper3'] },
    'iron': { name: 'Iron Ore', items: ['ore_iron1', 'ore_iron2', 'ore_iron3'] },
    'gold': { name: 'Gold Ore', items: ['ore_gold1', 'ore_gold2', 'ore_gold3'] },
    'diamond': { name: 'Diamond Ore', items: ['ore_diamond1', 'ore_diamond2', 'ore_diamond3'] },
    'emerald': { name: 'Emerald Ore', items: ['ore_emerald1', 'ore_emerald2', 'ore_emerald3'] },
    'ruby': { name: 'Ruby Ore', items: ['ore_ruby1', 'ore_ruby2', 'ore_ruby3'] },
    'zyrite': { name: 'Zyrite Ore', items: ['ore_zyrite1', 'ore_zyrite2', 'ore_zyrite3'] },
}
const recipes = {
    // crafting recipes, for blocks, items, and tools
    // plank recipes (1 log = 4 planks)
    'planks1': { output: 4, ingredients: { 'log1': 1 } },
    'planks2': { output: 4, ingredients: { 'log2': 1 } },
    'planks3': { output: 4, ingredients: { 'log3': 1 } },

    // stick recipes
    'stick': {output: 2, ingredients: { '#planks': 1 } }, // 2 sticks from 1 plank
    'gold_stick': {output: 1, ingredients: { 'stick': 1, 'gold_bar': 1 } },
    'diamond_stick': {output: 1, ingredients: { 'stick': 1, 'diamond_bar': 2 } },
    'emerald_stick': {output: 1, ingredients: { 'stick': 1, 'emerald_bar': 3 } },
    'ruby_stick': {output: 1, ingredients: { 'stick': 1, 'ruby_bar': 4 } },
    'zyrite_stick': {output: 1, ingredients: { 'stick': 1, 'zyrite_bar': 5 } },

    // ingot recipes (smelting?)
    'copper_bar': { output: 1, ingredients: { '#copper': 1, '#coal': 1 } },
    'iron_bar': { output: 1, ingredients: { '#iron': 1, '#coal': 2 } },
    'gold_bar': { output: 1, ingredients: { '#gold': 1, '#coal': 3 } },
    'diamond_bar': { output: 1, ingredients: { '#diamond': 1, '#coal': 4 } },
    'emerald_bar': { output: 1, ingredients: { '#emerald': 1, '#coal': 6 } },
    'ruby_bar': { output: 1, ingredients: { '#ruby': 1, '#coal': 8 } },
    'zyrite_bar': { output: 1, ingredients: { '#zyrite': 1, '#coal': 12 } },

    // craft cobblestone back into stone via smelting
    'stone1': { output: 4, ingredients: { 'cobblestone1': 4, '#coal': 1 } }, // smelt cobblestone into stone
    'stone2': { output: 4, ingredients: { 'cobblestone2': 4, '#coal': 1 } }, // smelt dark cobblestone into stone
    'stone3': { output: 4, ingredients: { 'cobblestone3': 4, '#coal': 1 } }, // smelt very dark cobblestone into stone

    // brick recipes
    'bricks': { output: 4, ingredients: { '#stone': 4, '#coal': 1 } }, // smelt stone into bricks
    'stonebricks': { output: 4, ingredients: { '#stone': 4, '#coal': 1 } }, // smelt stone into stone bricks
    'dirtbricks': { output: 4, ingredients: { 'dirt': 4, '#coal': 1 } }, // smelt dirt into dirt bricks
    'goldbricks': { output: 8, ingredients: { 'gold_bar': 4 } }, // use gold ingots to make gold bricks.

    // utility recipes
    'crafter': { output: 1, ingredients: { '#planks': 8, 'pickaxe2': 1, 'axe2': 1} }, // crafting table recipe (very important)
    'crate': { output: 1, ingredients: { '#planks': 8 } }, // crate is gonna be like a chest in the future when block data exists
    'glass': { output: 4, ingredients: { 'sand': 4, '#coal': 1 } },

    // tool recipes: starts at 4 sticks, max out at 8, increase by 2 per tier.
    // pickaxe recipes. use 5 of primary resource.
    'pickaxe1': { output: 1, ingredients: { 'stick': 4, '#planks': 5 } },
    'pickaxe2': { output: 1, ingredients: { 'stick': 6, '#allstone': 5 } },
    'pickaxe3': { output: 1, ingredients: { 'stick': 8, 'copper_bar': 5 } },
    'pickaxe4': { output: 1, ingredients: { 'stick': 8, 'iron_bar': 5 } },
    'pickaxe5': { output: 1, ingredients: { 'gold_stick': 8, 'gold_bar': 5 } },
    'pickaxe6': { output: 1, ingredients: { 'diamond_stick': 8, 'diamond_bar': 5 } },
    'pickaxe7': { output: 1, ingredients: { 'emerald_stick': 8, 'emerald_bar': 5 } },
    'pickaxe8': { output: 1, ingredients: { 'ruby_stick': 8, 'ruby_bar': 5 } },
    'pickaxe9': { output: 1, ingredients: { 'zyrite_stick': 8, 'zyrite_bar': 5 } },
    // axe recipes, use 4 of primary resource.
    'axe1': { output: 1, ingredients: { 'stick': 4, '#planks': 4 } },
    'axe2': { output: 1, ingredients: { 'stick': 6, '#allstone': 4 } },
    'axe3': { output: 1, ingredients: { 'stick': 8, 'copper_bar': 4 } },
    'axe4': { output: 1, ingredients: { 'stick': 8, 'iron_bar': 4 } },
    'axe5': { output: 1, ingredients: { 'gold_stick': 8, 'gold_bar': 4 } },
    'axe6': { output: 1, ingredients: { 'diamond_stick': 8, 'diamond_bar': 4 } },
    'axe7': { output: 1, ingredients: { 'emerald_stick': 8, 'emerald_bar': 4 } },
    'axe8': { output: 1, ingredients: { 'ruby_stick': 8, 'ruby_bar': 4 } },
    'axe9': { output: 1, ingredients: { 'zyrite_stick': 8, 'zyrite_bar': 4 } },
    // shovel recipes, use 3 of primary resource.
    'shovel1': { output: 1, ingredients: { 'stick': 4, '#planks': 3 } },
    'shovel2': { output: 1, ingredients: { 'stick': 6, '#allstone': 3 } },
    'shovel3': { output: 1, ingredients: { 'stick': 8, 'copper_bar': 3 } },
    'shovel4': { output: 1, ingredients: { 'stick': 8, 'iron_bar': 3 } },
    'shovel5': { output: 1, ingredients: { 'gold_stick': 8, 'gold_bar': 3 } },
    'shovel6': { output: 1, ingredients: { 'diamond_stick': 8, 'diamond_bar': 3 } },
    'shovel7': { output: 1, ingredients: { 'emerald_stick': 8, 'emerald_bar': 3 } },
    'shovel8': { output: 1, ingredients: { 'ruby_stick': 8, 'ruby_bar': 3 } },
    'shovel9': { output: 1, ingredients: { 'zyrite_stick': 8, 'zyrite_bar': 3 } }, 

    // dye recipes
    'dye1': { output: 1, ingredients: { 'flower1': 1 } }, // Red Dye
    'dye2': { output: 1, ingredients: { 'flower2': 1 } }, // Orange Dye
    'dye3': { output: 1, ingredients: { 'flower3': 1 } }, // Yellow Dye
    'dye4': { output: 2, ingredients: { 'dye3': 1, 'dye5': 1 } }, // lime
    'dye5': { output: 1, ingredients: { 'flower4': 1 } }, // green
    'dye6': { output: 1, ingredients: { 'flower5': 1 } }, // aqau
    'dye7': { output: 1, ingredients: { 'flower5': 1 } }, // cyan
    'dye8': { output: 2, ingredients: { 'dye7': 1, 'dye9': 1} }, // lite blue.
    'dye9': { output: 1, ingredients: { 'flower6': 1 } }, // Blue Dye
    'dye10': { output: 2, ingredients: { 'dye9': 1, 'dye11': 1 } }, // Dark Purple Dye (Blue + Purple)
    'dye11': { output: 1, ingredients: { 'flower7': 1 } }, // Purple Dye (Violet Flower)
    'dye12': { output: 1, ingredients: { 'flower8': 1 } }, // Pink Dye
    'dye13': { output: 2, ingredients: { 'dye12': 1, 'dye1': 1 } }, // Hot Pink Dye (Pink + Red)
    'dye14': { output: 3, ingredients: { 'dye1': 1, 'dye9': 1, 'dye11': 1 } }, // Black Dye (Red + Blue + Purple)
    'dye15': { output: 3, ingredients: { 'dye1': 1, 'dye2': 1, 'dye3': 1 } }, // Brown Dye (Red + Orange + Yellow)
    'dye16': { output: 3, ingredients: { 'dye3': 1, 'dye4': 1, 'dye9': 1 } }, // Gray Dye (Yellow + Lime + Blue)

    // colored glass recipes (4 glass + 1 dye = 4 colored glass)
    'cglass1': { output: 4, ingredients: { 'glass': 4, 'dye1': 1 } },
    'cglass2': { output: 4, ingredients: { 'glass': 4, 'dye2': 1 } },
    'cglass3': { output: 4, ingredients: { 'glass': 4, 'dye3': 1 } },
    'cglass4': { output: 4, ingredients: { 'glass': 4, 'dye4': 1 } },
    'cglass5': { output: 4, ingredients: { 'glass': 4, 'dye5': 1 } },
    'cglass6': { output: 4, ingredients: { 'glass': 4, 'dye6': 1 } },
    'cglass7': { output: 4, ingredients: { 'glass': 4, 'dye7': 1 } },
    'cglass8': { output: 4, ingredients: { 'glass': 4, 'dye8': 1 } },
    'cglass9': { output: 4, ingredients: { 'glass': 4, 'dye9': 1 } },
    'cglass10': { output: 4, ingredients: { 'glass': 4, 'dye10': 1 } },
    'cglass11': { output: 4, ingredients: { 'glass': 4, 'dye11': 1 } },
    'cglass12': { output: 4, ingredients: { 'glass': 4, 'dye12': 1 } },
    'cglass13': { output: 4, ingredients: { 'glass': 4, 'dye13': 1 } },
    'cglass14': { output: 4, ingredients: { 'glass': 4, 'dye14': 1 } },
    'cglass15': { output: 4, ingredients: { 'glass': 4, 'dye15': 1 } },
    'cglass16': { output: 4, ingredients: { 'glass': 4, 'dye16': 1 } },
}
const overlays = ['breaking1', 'breaking2', 'breaking3', 'breaking4','blockselect'];
for (let block of initialBlockList) {
    addBlock(block);
}
for (let tool of tools) {
    blocknames[tool.id] = tool.name;
}
for (let item of items) {
    blocknames[item.id] = item.name;
}
// for all items (blocks, tools, and items), set the stack size. if it doesnt exist set it to env.global.maxStackSize
for (let block of allblocks) {
    if (typeof stacksizes[block] === 'undefined') {
        stacksizes[block] = env.global.maxStackSize;
    }
}
// set the stack size for tools if not already set
for (let tool of tools) {
    if (typeof stacksizes[tool.id] === 'undefined') {
        stacksizes[tool.id] = tool.stack;
    }
}
// set the stack size for items if not already set
for (let item of items) {
    if (typeof stacksizes[item.id] === 'undefined') {
        stacksizes[item.id] = env.global.maxStackSize;
    }
}

// used to make the uhhhhhhhhhhhhhhhhhhhhhh recipes.
function getAllGameObjectsList() {
    let output = '';
    // Blocks
    output += '=== Blocks ===\n';
    for (let block of allblocks) {
        let name = blocknames[block] || '(unnamed)';
        let hasRecipe = recipes.hasOwnProperty(block);
        output += `- ${name} [${block}]${!hasRecipe ? ' •' : ''}\n`;
    }
    output += '\n=== Tools ===\n';
    for (let tool of tools) {
        let name = tool.name || '(unnamed)';
        let hasRecipe = recipes.hasOwnProperty(tool.id);
        output += `- ${name} [${tool.id}]${!hasRecipe ? ' •' : ''}\n`;
    }
    output += '\n=== Items ===\n';
    for (let item of items) {
        let name = item.name || '(unnamed)';
        let hasRecipe = recipes.hasOwnProperty(item.id);
        output += `- ${name} [${item.id}]${!hasRecipe ? ' •' : ''}\n`;
    }
    return output;
}

function downloadGameObjectsList() {
    const text = getAllGameObjectsList();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game_objects_list.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}