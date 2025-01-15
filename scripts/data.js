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
