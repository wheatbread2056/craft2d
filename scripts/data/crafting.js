const recipes = {
    // crafting recipes, for blocks, items, and tools
    // plank recipes (1 log = 4 planks)
    'planks1': { output: 2, ingredients: { 'cactus': 1 } }, // alternate recipe that uses cactus, so player isnt doomed in desert biomes
    'planks1': { output: 4, ingredients: { 'log1': 1 } },
    'planks2': { output: 4, ingredients: { 'log2': 1 } },
    'planks3': { output: 4, ingredients: { 'log3': 1 } },

    // stick recipes
    'stick': {output: 2, ingredients: { '#planks': 1 } }, // 2 sticks from 1 plank
    'gold_stick': {output: 2, ingredients: { 'stick': 1, 'gold_bar': 1 } },
    'diamond_stick': {output: 2, ingredients: { 'stick': 1, 'diamond_bar': 2 } },
    'emerald_stick': {output: 2, ingredients: { 'stick': 1, 'emerald_bar': 3 } },
    'ruby_stick': {output: 2, ingredients: { 'stick': 1, 'ruby_bar': 4 } },
    'zyrite_stick': {output: 2, ingredients: { 'stick': 1, 'zyrite_bar': 5 } },

    // ingot recipes (smelting?)
    'iron_bar': { output: 1, ingredients: { '#iron': 1, '#coal': 1 } },
    'gold_bar': { output: 1, ingredients: { '#gold': 1, '#coal': 2 } },
    'diamond_bar': { output: 1, ingredients: { '#diamond': 1, '#coal': 3 } },
    'emerald_bar': { output: 1, ingredients: { '#emerald': 1, '#coal': 4 } },
    'ruby_bar': { output: 1, ingredients: { '#ruby': 1, '#coal': 6 } },
    'zyrite_bar': { output: 1, ingredients: { '#zyrite': 1, '#coal': 8 } },

    // utility recipes
    'crafter': { output: 1, ingredients: { '#planks': 8, '#allstone': 4 } }, // crafting table recipe

    // tool recipes: starts at 4 sticks, max out at 8, increase by 2 per tier.
    // pickaxe recipes. use 5 of primary resource.
    'pickaxe1': { output: 1, ingredients: { 'stick': 4, '#planks': 5 } },
    'pickaxe2': { output: 1, ingredients: { 'stick': 6, '#allstone': 5 } },
    'pickaxe3': { output: 1, ingredients: { 'stick': 8, '#coal': 5 } },
    'pickaxe4': { output: 1, ingredients: { 'stick': 8, 'iron_bar': 5 } },
    'pickaxe5': { output: 1, ingredients: { 'gold_stick': 8, 'gold_bar': 5 } },
    'pickaxe6': { output: 1, ingredients: { 'diamond_stick': 8, 'diamond_bar': 5 } },
    'pickaxe7': { output: 1, ingredients: { 'emerald_stick': 8, 'emerald_bar': 5 } },
    'pickaxe8': { output: 1, ingredients: { 'ruby_stick': 8, 'ruby_bar': 5 } },
    'pickaxe9': { output: 1, ingredients: { 'zyrite_stick': 8, 'zyrite_bar': 5 } },
    // axe recipes, use 4 of primary resource.
    'axe1': { output: 1, ingredients: { 'stick': 4, '#planks': 4 } },
    'axe2': { output: 1, ingredients: { 'stick': 6, '#allstone': 4 } },
    'axe3': { output: 1, ingredients: { 'stick': 8, '#coal': 4 } },
    'axe4': { output: 1, ingredients: { 'stick': 8, 'iron_bar': 4 } },
    'axe5': { output: 1, ingredients: { 'gold_stick': 8, 'gold_bar': 4 } },
    'axe6': { output: 1, ingredients: { 'diamond_stick': 8, 'diamond_bar': 4 } },
    'axe7': { output: 1, ingredients: { 'emerald_stick': 8, 'emerald_bar': 4 } },
    'axe8': { output: 1, ingredients: { 'ruby_stick': 8, 'ruby_bar': 4 } },
    'axe9': { output: 1, ingredients: { 'zyrite_stick': 8, 'zyrite_bar': 4 } },
    // shovel recipes, use 3 of primary resource.
    'shovel1': { output: 1, ingredients: { 'stick': 4, '#planks': 3 } },
    'shovel2': { output: 1, ingredients: { 'stick': 6, '#allstone': 3 } },
    'shovel3': { output: 1, ingredients: { 'stick': 8, '#coal': 3 } },
    'shovel4': { output: 1, ingredients: { 'stick': 8, 'iron_bar': 3 } },
    'shovel5': { output: 1, ingredients: { 'gold_stick': 8, 'gold_bar': 3 } },
    'shovel6': { output: 1, ingredients: { 'diamond_stick': 8, 'diamond_bar': 3 } },
    'shovel7': { output: 1, ingredients: { 'emerald_stick': 8, 'emerald_bar': 3 } },
    'shovel8': { output: 1, ingredients: { 'ruby_stick': 8, 'ruby_bar': 3 } },
    'shovel9': { output: 1, ingredients: { 'zyrite_stick': 8, 'zyrite_bar': 3 } }, 
}

const groups = { // used for crafting
    'logs': { name: 'Logs', items: ['log1', 'log2', 'log3'] },
    'planks': { name: 'Planks', items: ['planks1', 'planks2', 'planks3'] },
    'stone': { name: 'Stone', items: ['stone1', 'stone2', 'stone3'] },
    'cobblestone': { name: 'Cobblestone', items: ['cobblestone1', 'cobblestone2', 'cobblestone3'] },
    'allstone': { name: 'Stone', items: ['stone1', 'stone2', 'stone3', 'cobblestone1', 'cobblestone2', 'cobblestone3'] },
    'coal': { name: 'Coal Ore', items: ['ore_coal1', 'ore_coal2', 'ore_coal3'] },
    'iron': { name: 'Iron Ore', items: ['ore_iron1', 'ore_iron2', 'ore_iron3'] },
    'gold': { name: 'Gold Ore', items: ['ore_gold1', 'ore_gold2', 'ore_gold3'] },
    'diamond': { name: 'Diamond Ore', items: ['ore_diamond1', 'ore_diamond2', 'ore_diamond3'] },
    'emerald': { name: 'Emerald Ore', items: ['ore_emerald1', 'ore_emerald2', 'ore_emerald3'] },
    'ruby': { name: 'Ruby Ore', items: ['ore_ruby1', 'ore_ruby2', 'ore_ruby3'] },
    'zyrite': { name: 'Zyrite Ore', items: ['ore_zyrite1', 'ore_zyrite2', 'ore_zyrite3'] },
}