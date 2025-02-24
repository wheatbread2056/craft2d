// addblock function helps organize everything
const allblocks = [];
const blocknames = {}; // object.
const nocollision = [];
const selblocks = [];

function addBlock(block) {
    let id = block[0];
    let name = block[1];
    let collision = block[2];
    let selectable = block[3];
    allblocks.push(id);
    if (!collision) nocollision.push(id);
    if (selectable) selblocks.push(id);
    if (name) blocknames[id] = name;
}

const initialBlockList = [
    //
    ///// Category: Construction blocks
    //

    // bricks
    ['bricks', 'Bricks', true, true],
    ['dirtbricks', 'Dirt Bricks', true, true],
    ['goldbricks', 'Gold Bricks', true, true],
    ['stonebricks', 'Stone Bricks', true, true],

    // planks
    ['planks1', 'Autumn Planks', true, true],
    ['planks2', 'Meadow Planks', true, true],
    ['planks3', 'Woods Planks', true, true],

    // other
    ['crate', 'Wooden Crate', true, true],
    ['glass', 'Glass', true, true],

    //
    ///// Category: Natural blocks
    //

    ['water', 'Water', false, true],
    ['watertop', undefined, false, true],

    ['sand', 'Sand', true, true],
    ['dirt', 'Dirt', true, true],
    ['cactus', 'Cactus', true, true],

    // flowers
    ['flower1', 'Red Flower', false, true],
    ['flower2', 'Orange Flower', false, true],
    ['flower3', 'Yellow Flower', false, true],
    ['flower4', 'Green Flower', false, true],
    ['flower5', 'Teal Flower', false, true],
    ['flower6', 'Blue Flower', false, true],
    ['flower7', 'Violet Flower', false, true],
    ['flower8', 'Pink Flower', false, true],

    // grass (full blocks)
    ['grass1', 'Autumn Grass', true, true],
    ['grass2', 'Meadow Grass', true, true],
    ['grass3', 'Woods Grass', true, true],
    ['grass4', 'Snowy Grass', true, true],

    // grass (backgrounds)
    // i believe that this system is flawed, since it was meant to be quick but not good, and it was implemented back in 1.3 which is really old
    ['grassbg1', undefined, false],
    ['grassbg2', undefined, false],
    ['grassbg3', undefined, false],
    ['grassbg4', undefined, false],
    ['grassbg5', undefined, false],
    ['grassbg6a', undefined, false],
    ['grassbg6b', undefined, false],
    ['grassbg7a', undefined, false],
    ['grassbg7b', undefined, false],

    // leaves (full blocks)
    ['leaves1', 'Yellow Autumn Leaves', true, true],
    ['leaves2', 'Orange Autumn Leaves', true, true],
    ['leaves3', 'Red Autumn Leaves', true, true],
    ['leaves4', 'Bright Yellow Autumn Leaves', true, true],
    ['leaves5', 'Green Meadow Leaves', true, true],
    ['leaves6', 'Dark Woods Leaves', true, true],
    ['leaves7', 'Snowy Leaves', true, true],

    // logs
    ['log1', 'Autumn Log', true, true],
    ['log2', 'Meadow Log', true, true],
    ['log3', 'Woods Log', true, true],

    // stone types
    ['stone1', 'Stone', true, true],
    ['stone2', 'Dark Stone', true, true],
    ['stone3', 'Very Dark Stone', true, true],
    ['stone4', 'Unbreakable Stone', true, false], // unbreakable stone

    // cobblestone types
    ['cobblestone1', 'Cobblestone', true, true],
    ['cobblestone2', 'Dark Cobblestone', true, true],
    ['cobblestone3', 'Very Dark Cobblestone', true, true],

    //
    ///// Category: Colorful blocks
    //

    // colored glass
    ['cglass1', 'Red Colored Glass', true, true],
    ['cglass2', 'Orange Colored Glass', true, true],
    ['cglass3', 'Yellow Colored Glass', true, true],
    ['cglass4', 'Lime Colored Glass', true, true],
    ['cglass5', 'Green Colored Glass', true, true],
    ['cglass6', 'Aqua Colored Glass', true, true],
    ['cglass7', 'Cyan Colored Glass', true, true],
    ['cglass8', 'Light Blue Colored Glass', true, true],
    ['cglass9', 'Blue Colored Glass', true, true],
    ['cglass10', 'Dark Purple Colored Glass', true, true],
    ['cglass11', 'Purple Colored Glass', true, true],
    ['cglass12', 'Pink Colored Glass', true, true],
    ['cglass13', 'Hot Pink Colored Glass', true, true],
    ['cglass14', 'Black Colored Glass', true, true],
    ['cglass15', 'Brown Colored Glass', true, true],
    ['cglass16', 'Gray Colored Glass', true, true],

    //
    ///// Category: testing / internal
    //

    ['player', undefined, false],
    ['test', undefined, false],
    ['watertop_render1', undefined, false],
    ['watertop_render2', undefined, false],
    ['watertop_render3', undefined, false],
    ['watertop_render4', undefined, false],
];
for (let block of initialBlockList) {
    addBlock(block);
}