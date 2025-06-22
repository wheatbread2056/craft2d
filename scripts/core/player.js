const player = {
    inventory: { // now has functions!
        slots: {},
        generateSlots: function (size = env.player.defaultInventorySize) {
            this.slots = {};
            for (let i = 1; i <= size * 9; i++) {
                this.slots[i] = {id: null, amount: 0}; // empty slot
            }
        },
        generateDefault: function () {
            for (let slot in env.player.defaultInventory) {
                this.slots[slot] = {...env.player.defaultInventory[slot]};
            }
        },
        nextEmptySlot: function () {
            for (let slot of Object.values(this.slots)) {
                if (!slot.id || slot.amount === 0) {
                    return slot;
                }
            }
            return null;
        },
        checkFullStack: function (slot) {
            const maxStackSize = (typeof stacksizes === 'object' && stacksizes[slot.id]) ? stacksizes[slot.id] : env.global.maxStackSize;
            return slot.amount >= maxStackSize;
        },
        firstItemSlot: function (item, atLeast = 0) {
            for (let slot of Object.values(this.slots)) {
                if (slot.id === item && Object.keys(this.slots).find(key => this.slots[key] === slot) >= atLeast) {
                    return slot;
                }
            }
            return null;
        },
        totalItemCount: function (item) {
            let count = 0;
            for (let slot of Object.values(this.slots)) {
                if (slot.id === item) {
                    count += slot.amount;
                }
            }
            return count;
        },
        addItem: function (item, amount = 1) {
            // Check if item exists in blocks, tools, or items (with safety checks)
            const itemExists = (typeof blocks !== 'undefined' && blocks[item]) || 
                              (typeof tools !== 'undefined' && tools.some(tool => tool.id === item)) || 
                              (typeof items !== 'undefined' && items.some(gameItem => gameItem.id === item));
            
            if (!itemExists) {
                console.error(`Cannot add item "${item}": Item does not exist in game registry (blocks, tools, or items)`);
                return false;
            }
            
            let toAdd = amount;
            // Fill existing stacks first
            while (toAdd > 0) {
                let slot = this.firstItemSlot(item);
                let slotKeys = Object.keys(this.slots);
                let foundNonFull = false;
                for (let i = 0; i < slotKeys.length; i++) {
                    let s = this.slots[slotKeys[i]];
                    if (s.id === item && !this.checkFullStack(s)) {
                        slot = s;
                        foundNonFull = true;
                        break;
                    }
                }
                if (!foundNonFull) {
                    slot = this.nextEmptySlot();
                }
                if (!slot) {
                    slot = this.nextEmptySlot();
                }
                if (slot == null) {
                    console.warn(`Cannot add item "${item}": Inventory is full`);
                    return false;
                }
                const maxStackSize = (typeof stacksizes === 'object' && stacksizes[item]) ? stacksizes[item] : env.global.maxStackSize;
                const spaceLeft = maxStackSize - slot.amount;
                if (spaceLeft <= 0) {
                    // No space in this slot, try next
                    if (slot === this.nextEmptySlot()) break;
                    continue;
                }
                if (!slot.id) slot.id = item;
                const addNow = Math.min(toAdd, spaceLeft);
                slot.amount += addNow;
                toAdd -= addNow;
            }
            if (toAdd > 0) {
                console.warn(`Could only add ${amount - toAdd} of ${amount} "${item}" items due to inventory space`);
            }
            return toAdd === 0;
        },
        removeItem: function (item, amount = 1, slot = null) {
            // Check if item exists in blocks, tools, or items (with safety checks)
            const itemExists = (typeof blocks !== 'undefined' && blocks[item]) || 
                              (typeof tools !== 'undefined' && tools.some(tool => tool.id === item)) || 
                              (typeof items !== 'undefined' && items.some(gameItem => gameItem.id === item));
            
            if (!itemExists) {
                console.error(`Cannot remove item "${item}": Item does not exist in game registry (blocks, tools, or items)`);
                return false;
            }
            
            let toRemove = amount;
            if (slot != null && this.slots[slot] && this.slots[slot].id === item) {
            const removeNow = Math.min(toRemove, this.slots[slot].amount);
            this.slots[slot].amount -= removeNow;
            toRemove -= removeNow;
            if (this.slots[slot].amount <= 0) {
                this.slots[slot].id = null; // empty the slot
            }
            } else {
            for (let slotObj of Object.values(this.slots)) {
                if (slotObj.id === item) {
                const removeNow = Math.min(toRemove, slotObj.amount);
                slotObj.amount -= removeNow;
                toRemove -= removeNow;
                if (slotObj.amount <= 0) {
                    slotObj.id = null; // empty the slot
                }
                if (toRemove <= 0) break;
                }
            }
            }
            if (toRemove > 0) {
                console.warn(`Could only remove ${amount - toRemove} of ${amount} "${item}" items from inventory`);
            }
            return toRemove === 0;
        },
        getSlot: function (slotNumber) {
            if (this.slots[slotNumber]) {
                return this.slots[slotNumber];
            } else {
                return null; // slot does not exist
            }
        },
        getItem: function (slotNumber) { // get which item in a slot
            if (this.getSlot(slotNumber) && this.getSlot(slotNumber).id) {
                return this.getSlot(slotNumber).id;
            } else {return null;};
        },
        clearSlot: function (slotNumber) {
            if (this.slots[slotNumber]) {
                this.slots[slotNumber].id = null;
                this.slots[slotNumber].amount = 0;
            }
        },
        swapSlots: function (slot1, slot2) {
            if (this.slots[slot1] && this.slots[slot2]) {
                const temp = this.slots[slot1];
                this.slots[slot1] = this.slots[slot2];
                this.slots[slot2] = temp;
            }
        },
        clearAll: function () {
            for (let slot in this.slots) {
                this.slots[slot].id = null;
                this.slots[slot].amount = 0;
            }
        },
        removeSlot: function (slot, amount = 1) { // removeItem but just for 1 slot
            if (this.slots[slot] && this.slots[slot].id) {
                const removeNow = Math.min(amount, this.slots[slot].amount);
                this.slots[slot].amount -= removeNow;
                if (this.slots[slot].amount <= 0) {
                    this.clearSlot(slot); // empty the slot
                }
                return true;
            }
        },
        addSlot: function (slot, item, amount = 1) { // addItem but just for 1 slot
            // Check if item exists in blocks, tools, or items (with safety checks)
            const itemExists = (typeof blocks !== 'undefined' && blocks[item]) || 
                              (typeof tools !== 'undefined' && tools.some(tool => tool.id === item)) || 
                              (typeof items !== 'undefined' && items.some(gameItem => gameItem.id === item));
            
            if (!itemExists) {
                console.error(`Cannot add item "${item}" to slot ${slot}: Item does not exist in game registry (blocks, tools, or items)`);
                return false;
            }
            
            if (this.getItem(slot) == null) {
                player.inventory.slots[slot].id = item;
            }
            let stackSize = (typeof stacksizes === 'object' && stacksizes[item]) ? stacksizes[item] : env.global.maxStackSize;
            let toAdd = amount;
            while (toAdd > 0) {
                player.inventory.slots[slot].amount++;
                toAdd--;
                if (player.inventory.slots[slot].amount >= stackSize) {
                    if (toAdd > 0) {
                        console.warn(`Could only add ${amount - toAdd} of ${amount} "${item}" to slot ${slot} due to stack size limit`);
                    }
                    return;
                }
            }
            return true;
        },
        fixInventory: function () { // fixes: null with amount != 0, any items with amount <= 0, etc. note: overstacks are allowed.
            for (let slot in this.slots) {
                // Check if slot has an invalid item ID (with safety checks)
                if (this.slots[slot].id) {
                    const itemExists = (typeof blocks !== 'undefined' && blocks[this.slots[slot].id]) || 
                                      (typeof tools !== 'undefined' && tools.some(tool => tool.id === this.slots[slot].id)) || 
                                      (typeof items !== 'undefined' && items.some(gameItem => gameItem.id === this.slots[slot].id));
                    
                    if (!itemExists) {
                        console.warn(`Removing invalid item "${this.slots[slot].id}" from slot ${slot}: Item does not exist in game registry`);
                        this.slots[slot].id = null;
                        this.slots[slot].amount = 0;
                        continue;
                    }
                }
                
                if (this.slots[slot].id === null && this.slots[slot].amount > 0) {
                    this.slots[slot].amount = 0; // empty the slot
                }
                if (this.slots[slot].amount <= 0) {
                    this.slots[slot].id = null; // empty the slot
                    this.slots[slot].amount = 0;
                }
            }
        },
        getToolProperties: function(slot) {
            if (this.getSlot(slot) && this.getSlot(slot).id) {
                let tspmo = this.getSlot(slot);
                let tool = Object.values(tools).find(t => t.id === tspmo.id) || null;
                if (!tool) return null;
                let name = tool && tool.name || null;
                let type = tool && tool.type || null;
                let tier = tool && tool.tier || null;
                let efficiency = toolTiers[tool.tier].efficiency || null;
                let maxDurability = toolTiers[tool.tier].durability || null;
                let durability = tspmo.durability || null;
                // auto fix durability
                if (durability == null) {this.slots[slot].durability = maxDurability; durability = maxDurability;}
                let damage = toolTiers[tool.tier].damage || null;
                return {
                    name,
                    type,
                    tier,
                    efficiency,
                    maxDurability,
                    durability,
                    damage
                }
            }
        },
        lowerDurability: function(slot, amount = 1) {
            if (this.getToolProperties(slot)) {
                let props = this.getToolProperties(slot);
                this.slots[slot].durability -= amount;
                if (this.slots[slot].durability <= 0) this.clearSlot(slot);
                return this.slots[slot].durability;
            }
        },
        fullInit: function () {
            this.generateSlots(env.player.defaultInventorySize);
            this.generateDefault();
            player.initCrates(); // Initialize crates Map
        },
    },
    gamemode: env.player.defaultGamemode,
    currentSlot: 1, // 1 to 9 (first row in the inventory). note 0 does not exist in the inventory
    currentItem: null,
    x: 0, // player x position
    y: 0, // player y position
    blockX: 0, // x pos of interacting block
    blockY: 0, // y pos of interacting block
    blockDamage: 0, // current damage dealt to intreacting block
    currentBlockHardness: 0,
    breakingBlock: false, // if the player is breaking a block
    blockToolType: 'none',
    currentBreakRate: 0, // current break rate of the block
    currentToolType: 'none', // current tool type that the player is holding.
    mx: 0, // player x velocity per tick
    my: 0, // player y velocity per tick
    air: false, // if in midair
    acc: false, // if accelerating
    fly: false, // if flying / has alternate physics
    flyx: false, // if accelerating horizontally during flight
    flyy: false, // if accelerating vertically during flight
    inWater: false, // if underwater
    speedMult: env.player.defaultSpeedMultiplier, // speed velocity multiplier of the player
    jumpMult: env.player.defaultJumpMultiplier, // jump velocity multiplier of the player - does not correspond to blocks, meaning a 20% increase could cause a 50% height increase
    noclip: false, // toggle collision with the player and blocks
    maxHealth: env.player.defaultMaxHealth, // player's maximum health
    health: env.player.defaultMaxHealth, // player's current health
    controlAllowed: true, // if the user is allowed to control the player
    modificationAllowed: true, // if the user is allowed to modify the world
    invulnerable: env.player.defaultInvincibility, // true = no damage & infinite regen rate
    regenRate: env.player.defaultRegenRate, // hp regenerated every second
    regenAllowed: true, // player regen toggle
    deathOverlay: false,
    inventoryOpen: false,
    craftingOpen: false,
    currentRecipe: null, // current recipe being crafted
    interactionLayer: 'fg', // layer to interact with (foreground or background)
    reachDistance: env.player.defaultReachDistance, // distance the player can reach to interact with blocks
    // Add crate storage system
    crates: new Map(), // Map<"x,y", {items: {slotId: {id, amount}}, size: number}>
    currentCrate: null, // coordinates of currently open crate "x,y"
    crateOpen: false,
    // Add initialization method for crates
    initCrates: function() {
        if (!(this.crates instanceof Map)) {
            this.crates = new Map();
        }
    }
};
const camera = {
    x: 0,
    y: 0, 
    scale: 1
};