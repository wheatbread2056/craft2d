// info text
const infoLn1 = document.createElement('p');
infoLn1.setAttribute('class', 'infotext');
infoLn1.innerHTML = 'Coordinates: (x, y)';
document.body.appendChild(infoLn1);

const infoLn2 = document.createElement('p');
infoLn2.setAttribute('class', 'infotext');
infoLn2.setAttribute('style', 'top:24px');
infoLn2.innerHTML = 'Time: hh:mm';
document.body.appendChild(infoLn2);

const infoLn3 = document.createElement('p');
infoLn3.setAttribute('class', 'infotext');
infoLn3.setAttribute('style', 'top:48px');
infoLn3.innerHTML = 'Camera scale: 1.23x';
document.body.appendChild(infoLn3);

const layerIndicator = document.createElement('p');
layerIndicator.setAttribute('class', 'infotext2');
layerIndicator.setAttribute('style', 'top:24px');
layerIndicator.innerHTML = 'Layer: Foreground';
document.body.appendChild(layerIndicator);

const itemTooltip = document.createElement('p');
itemTooltip.innerHTML = '';
itemTooltip.setAttribute('class', 'infotext3');
itemTooltip.style.position = 'absolute';
itemTooltip.style.left = '50%';
itemTooltip.style.bottom = '72px';
itemTooltip.style.transform = 'translateX(-50%)';
itemTooltip.style.textAlign = 'center';
itemTooltip.style.pointerEvents = 'none';
itemTooltip.style.width = 'max-content';
itemTooltip.style.maxWidth = '90vw';
itemTooltip.style.margin = '0';
document.body.appendChild(itemTooltip);

// version text
const versionText = document.createElement('p');
versionText.setAttribute('class', 'infotext2');
versionText.innerHTML = versionName
document.body.appendChild(versionText);

// controls text
const controlsKeybind = document.createElement('p');
controlsKeybind.setAttribute('class', 'infotext3');
controlsKeybind.innerHTML =  `❤️ ${player.health}/${player.maxHealth}`;
document.body.appendChild(controlsKeybind);

// block selector v2!
const inventoryBar = document.createElement('div');
inventoryBar.style = `
position: absolute;
bottom: 0;`
document.body.appendChild(inventoryBar);

// inventory ui
const inventoryGrid = document.createElement('div');
inventoryGrid.setAttribute('class', 'inventory-grid');
inventoryGrid.style.display = 'grid';
inventoryGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(50px, 1fr))';
inventoryGrid.style.gap = '10px';
inventoryGrid.style.overflowY = 'scroll';
inventoryGrid.style.maxHeight = '400px';
inventoryGrid.style.border = '1px solid #ccc';
inventoryGrid.style.padding = '10px';
inventoryGrid.style.backgroundColor = '#00000088';
inventoryGrid.style.minWidth = '584px';
inventoryGrid.style.maxWidth = '584px';
inventoryGrid.style.width = '80%';
inventoryGrid.style.maxHeight = '60%';
inventoryGrid.style.position = 'absolute';
inventoryGrid.style.top = '50%';
inventoryGrid.style.left = '50%';
inventoryGrid.style.transform = 'translate(-50%, -50%)';
inventoryGrid.style.backdropFilter = 'blur(10px)';
inventoryGrid.style.border = 'none';
inventoryGrid.style.userSelect = 'none';
// Prevent images from being draggable in the inventory grid
inventoryGrid.addEventListener('dragstart', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

function createInventoryUI() {
    inventoryGrid.innerHTML = ''; // clear grid... or else
    function newBlockSlot(id = 'baby keem', isCrateSlot = false) {
        let blockSlot = document.createElement('div');
        blockSlot.setAttribute('class', 'inventory-block-slot');
        blockSlot.style.width = '50px';
        blockSlot.style.height = '50px';
        blockSlot.style.display = 'flex';
        blockSlot.style.alignItems = 'center';
        blockSlot.style.justifyContent = 'center';
        blockSlot.style.backgroundColor = '#00000088';
        blockSlot.style.border = '2px solid #00000000';
        blockSlot.style.position = 'relative';
        
        if (!isCrateSlot) {
            if (id <= 9) {
                blockSlot.style.border = '2px solid rgba(75, 0, 160, 0.5)';
                blockSlot.style.backgroundColor = 'rgba(37, 0, 78, 0.5)';
            }
            if (client.inventorySelectedSlot == id) {
                blockSlot.style.border = '2px solid rgb(119, 0, 255)';
                blockSlot.style.backgroundColor = 'rgba(119, 0, 255, 0.5)';
            }
        } else {
            // Crate slot styling
            blockSlot.style.backgroundColor = 'rgba(139, 69, 19, 0.3)'; // Brown tint for crate
            blockSlot.style.border = '2px solid rgba(139, 69, 19, 0.5)';
            if (client.inventorySelectedSlot == `crate_${id}`) {
                blockSlot.style.border = '2px solid rgb(255, 165, 0)';
                blockSlot.style.backgroundColor = 'rgba(255, 165, 0, 0.5)';
            }
        }
        return blockSlot;
    }
    
    if (player.gamemode == 'creative') {
        for (let blockId in globalImages) {
            const blockSlot = newBlockSlot();

            let blockImage = globalImages[blockId].cloneNode(true);
            blockImage.style.width = '48px';
            blockImage.style.height = '48px';
            blockImage.style.imageRendering = 'pixelated';

            blockSlot.appendChild(blockImage);
            blockSlot.addEventListener('click', () => {
                player.inventory.addItem(blockId, stacksizes[blockId] || env.global.maxStackSize);
            });

            inventoryGrid.appendChild(blockSlot);
        }
    } else {
        if (player.craftingOpen) {
            // since no crafting system currently exists, this is just the layout, non-functional crafting gui
            // I HATE CSS.
            const craftingContainer = document.createElement('div');
            craftingContainer.style.display = 'flex';
            craftingContainer.style.flexDirection = 'column';
            craftingContainer.style.width = '576px';

            const topSection = document.createElement('div');
            topSection.style.height = '156px';
            topSection.style.width = '100%';
            topSection.style.backgroundColor = '#00000088';

            const LeftCraftingText = document.createElement('div');
            LeftCraftingText.style.position = 'absolute';
            LeftCraftingText.style.left = '16px';
            LeftCraftingText.style.top = '0px';

            // top left of topSection: text saying "Recipe Cost"
            const recipeCostText = document.createElement('p');
            recipeCostText.innerHTML = `Recipe: ${blocknames[player.currentRecipe] !== undefined ? blocknames[player.currentRecipe] : player.currentRecipe || 'None'}`;

            // then the cost of it, multiline (in 1 element)
            const recipeCost = document.createElement('pre');
            if (recipes[player.currentRecipe]) {
                // List each ingredient and its amount, one per line
                recipeCost.innerHTML = Object.entries(recipes[player.currentRecipe].ingredients)
                    .map(([ingredient, amount]) => {
                        if (ingredient.startsWith('#')) {
                            const groupId = ingredient.slice(1);
                            const groupName = groups[groupId]?.name || ingredient;
                            return `${groupName}: x${amount}`;
                        } else {
                            return `${blocknames[ingredient] || ingredient}: x${amount}`;
                        }
                    })
                    .join('\n');
            } else recipeCost.innerHTML = 'No recipe selected';

            LeftCraftingText.appendChild(recipeCostText);
            LeftCraftingText.appendChild(recipeCost);
            topSection.appendChild(LeftCraftingText);

            const RightCraftingText = document.createElement('div');
            RightCraftingText.style.position = 'absolute';
            RightCraftingText.style.right = '16px';
            RightCraftingText.style.top = '0px';
            // top right of topSection: text saying "Crafting Result"
            const craftingResultText = document.createElement('p');
            craftingResultText.innerHTML = 'Crafting Result:';
            // then the result which is the image, as a Block slot
            const craftingResultImage = globalImages[player.currentRecipe || 'player'].cloneNode(true);
            craftingResultImage.style.width = '48px';
            craftingResultImage.style.height = '48px';
            craftingResultImage.style.imageRendering = 'pixelated';
            const craftingResultAmount = document.createElement('span');
            craftingResultAmount.style.position = 'absolute';
            craftingResultAmount.style.bottom = '2px';
            craftingResultAmount.style.left = '-138px';
            craftingResultAmount.style.fontSize = '32px';
            craftingResultAmount.innerHTML = `x${recipes[player.currentRecipe]?.output || 0}`; // default to 1 if no recipe selected
            
            const craftingResultSlot = newBlockSlot();
            craftingResultSlot.style.position = 'absolute';
            craftingResultSlot.style.right = '8px';

            const craftButton = document.createElement('button');
            craftButton.style.height = '32px';
            craftButton.style.width = '192px';
            craftButton.style.backgroundColor = '#000000ff';
            craftButton.style.border = '2px solid #ffffff';
            craftButton.style.position = 'absolute';
            craftButton.style.right = '8px';
            craftButton.style.top = '126px';
            craftButton.innerHTML = 'Craft';
            craftButton.onclick = () => {
                if (recipes[player.currentRecipe]) {
                    const recipe = recipes[player.currentRecipe];
                    // Check if player has enough ingredients (supporting item groups)
                    let canCraft = true;

                    for (const [ingredient, amount] of Object.entries(recipe.ingredients)) {
                        let required = amount;
                        if (ingredient.startsWith('#')) {
                            const groupName = ingredient.slice(1);
                            const groupItems = groups[groupName] ? groups[groupName].items : [];
                            let groupTotal = 0;
                            for (const itemId of groupItems) {
                                groupTotal += player.inventory.totalItemCount(itemId);
                            }
                            if (groupTotal < required) {
                                canCraft = false;
                                break;
                            }
                        } else {
                            if (player.inventory.totalItemCount(ingredient) < required) {
                                canCraft = false;
                                break;
                            }
                        }
                    }

                    if (canCraft) {
                        // Remove ingredients
                        for (const [ingredient, amount] of Object.entries(recipe.ingredients)) {
                            let required = amount;
                            if (ingredient.startsWith('#')) {
                                const groupName = ingredient.slice(1);
                                const groupItems = groups[groupName] ? groups[groupName].items : [];
                                for (const itemId of groupItems) {
                                    let removed = player.inventory.removeItem(itemId, required);
                                    required -= removed;
                                    if (required <= 0) break;
                                }
                            } else {
                                player.inventory.removeItem(ingredient, required);
                            }
                        }
                        // Add result to inventory
                        const resultId = player.currentRecipe;
                        const resultAmount = recipe.output || 1;
                        player.inventory.addItem(resultId, resultAmount);
                    } else {
                        console.warn('Not enough ingredients to craft the item');
                    }
                }
            }

            craftingResultSlot.appendChild(craftingResultImage);
            craftingResultSlot.appendChild(craftingResultAmount);
            RightCraftingText.appendChild(craftingResultText);
            RightCraftingText.appendChild(craftingResultSlot);
            RightCraftingText.appendChild(craftButton);
            topSection.appendChild(RightCraftingText);


            const recipeGrid = document.createElement('div');
            recipeGrid.style.marginTop = '8px';
            recipeGrid.style.display = 'grid';
            recipeGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(50px, 1fr))';
            recipeGrid.style.gap = '10px';
            recipeGrid.style.minWidth = '576px';

            for (let recipe in recipes) {
                const recipeSlot = newBlockSlot();
                let blockImage = globalImages[recipe].cloneNode(true);
                blockImage.style.width = '48px';
                blockImage.style.height = '48px';
                blockImage.style.imageRendering = 'pixelated';
                recipeSlot.appendChild(blockImage);
                recipeSlot.addEventListener('click', () => {
                    player.currentRecipe = recipe;
                    createInventoryUI();
                });
                recipeGrid.appendChild(recipeSlot);
            }

            craftingContainer.appendChild(topSection);
            craftingContainer.appendChild(recipeGrid);
            inventoryGrid.appendChild(craftingContainer);
            

        } else if (player.crateOpen) {
            // CRATE INTERFACE
            const crateContainer = document.createElement('div');
            crateContainer.style.display = 'flex';
            crateContainer.style.flexDirection = 'column';
            crateContainer.style.width = '576px';

            // Crate title
            const crateTitle = document.createElement('h2');
            crateTitle.innerHTML = 'Wooden Crate';
            crateTitle.style.textAlign = 'center';
            crateTitle.style.margin = '0 0 16px 0';
            crateContainer.appendChild(crateTitle);

            // Crate slots
            const crateGrid = document.createElement('div');
            crateGrid.style.display = 'grid';
            crateGrid.style.gridTemplateColumns = 'repeat(9, 50px)';
            crateGrid.style.gap = '4px';
            crateGrid.style.justifyContent = 'center';
            crateGrid.style.marginBottom = '16px';
            crateGrid.style.padding = '8px';
            crateGrid.style.backgroundColor = 'rgba(139, 69, 19, 0.2)';

            const crateData = player.crates.get(player.currentCrate);
            for (let slotId = 1; slotId <= crateData.size; slotId++) {
                const crateSlot = newBlockSlot(slotId, true);
                const item = crateData.items[slotId];
                
                if (item && item.id !== null) {
                    let blockImage = globalImages[item.id].cloneNode(true);
                    blockImage.style.width = '48px';
                    blockImage.style.height = '48px';
                    blockImage.style.imageRendering = 'pixelated';
                    crateSlot.appendChild(blockImage);
                    
                    if (item.amount > 1) {
                        const amountText = document.createElement('span');
                        amountText.style.position = 'absolute';
                        amountText.style.bottom = '2px';
                        amountText.style.right = '2px';
                        amountText.style.color = '#fff';
                        amountText.style.fontSize = '16px';
                        amountText.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                        amountText.style.pointerEvents = 'none';
                        amountText.textContent = item.amount;
                        crateSlot.appendChild(amountText);
                    }
                }
                
                crateSlot.addEventListener('click', () => {
                    handleCrateSlotClick(`crate_${slotId}`, slotId);
                });
                
                crateGrid.appendChild(crateSlot);
            }

            // Player inventory (bottom part)
            const playerInventoryTitle = document.createElement('h3');
            playerInventoryTitle.innerHTML = 'Your Inventory';
            playerInventoryTitle.style.textAlign = 'center';
            playerInventoryTitle.style.margin = '16px 0 8px 0';

            const playerGrid = document.createElement('div');
            playerGrid.style.display = 'grid';
            playerGrid.style.gridTemplateColumns = 'repeat(9, 50px)';
            playerGrid.style.gap = '4px';
            playerGrid.style.justifyContent = 'center';

            for (let slotId in player.inventory.slots) {
                const playerSlot = newBlockSlot(slotId, false);
                const item = player.inventory.getSlot(slotId);
                
                if (item && item.id !== null) {
                    let blockImage = globalImages[item.id].cloneNode(true);
                    blockImage.style.width = '48px';
                    blockImage.style.height = '48px';
                    blockImage.style.imageRendering = 'pixelated';
                    playerSlot.appendChild(blockImage);
                    
                    if (item.amount > 1) {
                        const amountText = document.createElement('span');
                        amountText.style.position = 'absolute';
                        amountText.style.bottom = '2px';
                        amountText.style.right = '2px';
                        amountText.style.color = '#fff';
                        amountText.style.fontSize = '16px';
                        amountText.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                        amountText.textContent = item.amount;
                        playerSlot.appendChild(amountText);
                    }
                }
                
                playerSlot.addEventListener('click', () => {
                    handleCrateSlotClick(slotId, null);
                });
                
                playerGrid.appendChild(playerSlot);
            }

            crateContainer.appendChild(crateGrid);
            crateContainer.appendChild(playerInventoryTitle);
            crateContainer.appendChild(playerGrid);
            inventoryGrid.appendChild(crateContainer);
        } else {

            for (let slotId in player.inventory.slots) {
                const blockSlot = newBlockSlot(slotId);
                if (player.inventory.getSlot(slotId).id !== null) {
                    let isTool = !!player.inventory.getToolProperties(slotId);
                    let blockImage = globalImages[player.inventory.getSlot(slotId).id].cloneNode(true);
                    blockImage.style.width = '48px';
                    blockImage.style.height = '48px';
                    blockImage.style.imageRendering = 'pixelated';
                    blockSlot.appendChild(blockImage);
                    // add text thats the amount stored
                    if (player.inventory.getSlot(slotId).amount > 1 && player.inventory.getSlot(slotId).amount != Infinity) {
                        const amountText = document.createElement('span');
                        amountText.style.position = 'absolute';
                        amountText.style.bottom = '2px';
                        amountText.style.right = '2px';
                        amountText.style.color = '#fff';
                        amountText.style.fontSize = '16px';
                        amountText.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                        amountText.style.pointerEvents = 'none'; // Allow clicks to pass through
                        amountText.textContent = player.inventory.getSlot(slotId).amount;
                        blockSlot.appendChild(amountText);
                    } else if (isTool) {
                        let toolProps = player.inventory.getToolProperties(slotId);
                        let durability = toolProps.durability;
                        let maxDurability = toolProps.maxDurability || Infinity;
                        let durabilityColor = durability / maxDurability > 0.75
                        ? '#0f0'
                        : durability / maxDurability > 0.5
                            ? '#ff0'
                            : durability / maxDurability > 0.25
                                ? 'orange'
                                : '#f00';
                        // durability text.
                        const amountText = document.createElement('span');
                        amountText.style.position = 'absolute';
                        amountText.style.bottom = '0px';
                        amountText.style.right = '0px';
                        amountText.style.color = durabilityColor;
                        amountText.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                        amountText.style.fontSize = '16px';
                        amountText.textContent = durability;
                        amountText.style.position = 'absolute';
                        blockSlot.appendChild(amountText);
                    }
                }
                blockSlot.addEventListener('click', () => {
                    if (client.inventorySelectedSlot == null) {
                        // No slot selected yet, select this one
                        client.inventorySelectedSlot = slotId;
                        inventoryGrid.innerHTML = ''; // Clear the grid
                        createInventoryUI();
                    } else {
                        // Slot already selected, swap with this one
                        if (client.inventorySelectedSlot !== slotId) {
                            player.inventory.swapSlots(client.inventorySelectedSlot, slotId);
                        }
                        // Deselect after swap (or if same slot clicked)
                        client.inventorySelectedSlot = null;
                        // Optionally, re-render the UI to reflect changes
                        inventoryGrid.innerHTML = '';
                        createInventoryUI();
                    }
                });
                blockSlot.addEventListener('contextmenu', (e) => {
                    e.preventDefault(); // Prevent default context menu
                    if (client.inventorySelectedSlot == null) {
                        // No slot selected yet, select this one
                        client.inventorySelectedSlot = slotId;
                        inventoryGrid.innerHTML = ''; // Clear the grid
                        createInventoryUI();
                    } else {
                        // slot selected, take 1 item from it.
                        if (client.inventorySelectedSlot !== slotId) {
                            let item = player.inventory.getItem(client.inventorySelectedSlot);
                            let otherItem = player.inventory.getItem(slotId);
                            if (item != otherItem && otherItem != null) {client.inventorySelectedSlot = null; createInventoryUI(); return;}
                            player.inventory.removeSlot(client.inventorySelectedSlot);
                            player.inventory.addSlot(slotId, item, 1);
                        }
                        if (player.inventory.getSlot(client.inventorySelectedSlot).id == null) {
                            client.inventorySelectedSlot = null;
                        }
                        createInventoryUI();
                    }
                });
                inventoryGrid.appendChild(blockSlot);
            }
    }
    }
}
createInventoryUI();

function renderBlockSelector() {
    inventoryBar.innerHTML = '';
    for (let i = 1; i <= 9; i++) {
        const slot = document.createElement('div');
        slot.setAttribute('class', 'inventory-slot');
        slot.style.display = 'inline-block';
        slot.style.marginRight = '8px';
        let image;
        if (player.inventory.getSlot(i) && globalImages[player.inventory.getSlot(i).id]) {
            image = globalImages[player.inventory.getSlot(i).id].cloneNode(true);
        } else {
            image = document.createElement('img');
            // WHAT does this do.
            image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAFUlEQVR4nO3BMQEAAAgDoJvc6F9hAAAgwA8A9Qw2pQAAAABJRU5ErkJggg==';
        }
        image.style.width = '48px';
        image.style.height = '48px';
        image.style.border = '4px solid rgb(54, 54, 54)';
        if (i == player.currentSlot) {
            image.style.border = '4px solid rgb(119, 0, 255)';
        }
        image.style.backgroundColor = 'rgba(100, 100, 100, 0.5)';
        image.style.imageRendering = 'pixelated';
        slot.appendChild(image);
        let isTool = !!player.inventory.getToolProperties(i);
        if (player.inventory.getSlot(i).amount > 1 && player.inventory.getSlot(i).amount != Infinity) {
            const amountText = document.createElement('span');
            amountText.style.position = 'absolute';
            amountText.style.bottom = '8px';
            amountText.style.right = '4px';
            amountText.style.color = '#fff';
            amountText.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
            amountText.style.fontSize = '16px';
            amountText.textContent = player.inventory.getSlot(i).amount;
            slot.style.position = 'relative'; // Ensure parent is relative for absolute child
            slot.appendChild(amountText);
        } else if (isTool) {
            let toolProps = player.inventory.getToolProperties(i);
            let durability = toolProps.durability;
            let maxDurability = toolProps.maxDurability || Infinity;
            // Create durability bar container
            const durabilityBar = document.createElement('div');
            durabilityBar.style.position = 'absolute';
            durabilityBar.style.bottom = '8px';
            durabilityBar.style.left = '4px';
            durabilityBar.style.width = '48px';
            durabilityBar.style.height = '4px';
            durabilityBar.style.background = 'rgba(0,0,0,0.4)';
            durabilityBar.style.overflow = 'hidden';
            // inner fill.
            const durabilityFill = document.createElement('div');
            let durabilityColor = durability / maxDurability > 0.75
                ? '#0f0'
                : durability / maxDurability > 0.5
                    ? '#ff0'
                    : durability / maxDurability > 0.25
                        ? 'orange'
                        : '#f00';
            durabilityFill.style.height = '100%';
            durabilityFill.style.width = `${Math.max(0, Math.min(1, durability / maxDurability)) * 100}%`;
            durabilityFill.style.background = durabilityColor;
            durabilityBar.appendChild(durabilityFill);
            slot.style.position = 'relative';
            slot.appendChild(durabilityBar);
            // durability text.
            const amountText = document.createElement('span');
            amountText.style.position = 'absolute';
            amountText.style.bottom = '8px';
            amountText.style.right = '4px';
            amountText.style.color = durabilityColor;
            amountText.style.backgroundColor = 'rgba(0, 0, 0, 0)';
            amountText.style.fontSize = '16px';
            amountText.textContent = durability;
            slot.style.position = 'relative'; // Ensure parent is relative for absolute child
            slot.appendChild(amountText);
        }
        inventoryBar.appendChild(slot);
    }
    inventoryBar.style.left = '50%';
    inventoryBar.style.transform = 'translateX(-50%)';
}

function updateItemTooltip() {
    // if holding item, show name. if not, show nothing. fade out after 2s.
    if (player.currentItem) {
        if (blocknames[player.currentItem]) {itemTooltip.innerHTML = blocknames[player.currentItem]}
        else {itemTooltip.innerHTML = player.currentItem || ''};
        document.body.removeChild(itemTooltip);
        document.body.appendChild(itemTooltip);
        itemTooltip.style.opacity = '1';
        clearTimeout(client.tooltipTimeout);
        itemTooltip.style.animation = 'fade-out 0.5s 1s forwards';
        client.tooltipTimeout = setTimeout(() => {
            itemTooltip.style.opacity = '0';
            itemTooltip.style.animation = '';
        }, 1500);
    } else {
        itemTooltip.style.opacity = '0';
    }
}

function renderInfoText() {
    if (client.debug == true) {
        // let didn't work for this
        if (client.renderTickrateComputed >= 60) {
            var performanceGrade = 'a';
            var performanceColor = 'purple';
        } else if (client.renderTickrateComputed >= 45) {
            var performanceGrade = 'b';
            var performanceColor = 'cyan';
        } else if (client.renderTickrateComputed >= 30) {
            var performanceGrade = 'c';
            var performanceColor = 'green';
        } else if (client.renderTickrateComputed >= 15) {
            var performanceGrade = 'd';
            var performanceColor = 'orange';
        } else {
            var performanceGrade = 'f';
            var performanceColor = 'red';
        }
        let worldSizeColor = 'green';
        if (((world.fg.size + world.bg.size) / (2**24*2) * 100).toFixed(2) >= 10) {
            worldSizeColor = 'yellow';
        }
        if (((world.fg.size + world.bg.size) / (2**24*2) * 100).toFixed(2) >= 25) {
            worldSizeColor = 'orange';
        }
        if (((world.fg.size + world.bg.size) / (2**24*2) * 100).toFixed(2) >= 45) { // even though it's close to 50%, since it's split between a fg and bg layer (where the fg layer is MUCH bigger than bg) the real limit is around 16.7m, aka 50%
            worldSizeColor = 'red';
        }
        infoLn1.innerHTML = `<b>player</b>: (<red>${player.x.toFixed(2)}</red>, <cyan>${player.y.toFixed(2)}</cyan>) | velocity (<yellow>${player.mx.toFixed(2)}</yellow>, <yellow>${player.my.toFixed(2)}</yellow>) | air <${player.air}>${player.air}</${player.air}>, acc <${player.acc}>${player.acc}</${player.acc}>, fly <${player.fly}>${player.fly}</${player.fly}>, water <${player.inWater}>${player.inWater}</${player.inWater}>`;
        infoLn2.innerHTML = `<b>world</b>: <yellow>${blocksRendered}</yellow> blocks rendered, <yellow>${world.fg.size + world.bg.size}</yellow> (<${worldSizeColor}>${((world.fg.size + world.bg.size) / (2**24*2) * 200).toFixed(2)}%</${worldSizeColor}>) chunks stored, <yellow>${env.global.mapxsize}</yellow> map x size, <yellow>${camera.scale}</yellow> camera scale`;
        infoLn3.innerHTML = `<b>time</b>: rt <yellow>${env.global.renderTickNum}</yellow>, gt <blue>${env.global.gameTickNum}</blue> | target rate <cyan>${env.global.tickrate}</cyan>, actual rate <magenta>${client.gameTickrateComputed}</magenta>, fps <green>${client.renderTickrateComputed}</green> | grade <${performanceColor}>${performanceGrade}</${performanceColor}>`;
    } else {
        infoLn1.innerHTML = `Position: (<red>${Math.round(player.x)}</red>, <cyan>${Math.round(player.y)}</cyan>)`;

        infoLn2.innerHTML = `Time: <yellow>${((Date.now() - finishedLoadTime) / 1000).toFixed(1)}</yellow> seconds`;

        if (!(camera.scale == 1)) {
            infoLn3.innerHTML = `Camera scale: <yellow>${camera.scale}x</yellow>`;
        } else {
            infoLn3.innerHTML = '';
        }
    }
    let healthColor;
    if (player.health >= 0.75 * player.maxHealth) {
        healthColor = 'white';
    } else if (player.health > 0.5 * player.maxHealth) {
        healthColor = 'yellow';
    } else if (player.health > 0.25 * player.maxHealth) {
        healthColor = 'orange';
    } else {
        healthColor = 'red';
    }
    controlsKeybind.innerHTML = `❤️ <b><${healthColor}>${player.health.toFixed(0)}/${player.maxHealth}</${healthColor}></b>`;
    let interactionText = '';
    if (player.interactionLayer === 'fg') {
        interactionText = 'Foreground';
    } else if (player.interactionLayer === 'bg') {
        interactionText = 'Background';
    } else {
        interactionText = player.interactionLayer;
    }
    layerIndicator.innerHTML = `Layer: <b>${interactionText}</b>`;
}

function handleCrateSlotClick(slotId, crateSlotId) {
    if (client.inventorySelectedSlot == null) {
        client.inventorySelectedSlot = slotId;
        createInventoryUI();
    } else {
        if (client.inventorySelectedSlot !== slotId) {
            swapCrateItems(client.inventorySelectedSlot, slotId, crateSlotId);
        }
        client.inventorySelectedSlot = null;
        createInventoryUI();
    }
}

function swapCrateItems(fromSlot, toSlot, toCrateSlot) {
    const crateData = player.crates.get(player.currentCrate);
    
    const fromIsCrate = fromSlot.startsWith('crate_');
    const toIsCrate = toSlot.startsWith('crate_');
    
    let fromItem, toItem;
    
    if (fromIsCrate) {
        const crateSlotNum = parseInt(fromSlot.replace('crate_', ''));
        fromItem = crateData.items[crateSlotNum];
    } else {
        fromItem = player.inventory.getSlot(fromSlot);
    }
    
    if (toIsCrate) {
        const crateSlotNum = parseInt(toSlot.replace('crate_', ''));
        toItem = crateData.items[crateSlotNum];
    } else {
        toItem = player.inventory.getSlot(toSlot);
    }
    
    if (fromIsCrate && toIsCrate) {
        const fromSlotNum = parseInt(fromSlot.replace('crate_', ''));
        const toSlotNum = parseInt(toSlot.replace('crate_', ''));
        const temp = {...crateData.items[fromSlotNum]};
        crateData.items[fromSlotNum] = {...crateData.items[toSlotNum]};
        crateData.items[toSlotNum] = temp;
    } else if (fromIsCrate && !toIsCrate) {
        const crateSlotNum = parseInt(fromSlot.replace('crate_', ''));
        const temp = {...crateData.items[crateSlotNum]};
        crateData.items[crateSlotNum] = {...player.inventory.slots[toSlot]};
        player.inventory.slots[toSlot] = temp;
    } else if (!fromIsCrate && toIsCrate) {
        const crateSlotNum = parseInt(toSlot.replace('crate_', ''));
        const temp = {...player.inventory.slots[fromSlot]};
        player.inventory.slots[fromSlot] = {...crateData.items[crateSlotNum]};
        crateData.items[crateSlotNum] = temp;
    } else {
        player.inventory.swapSlots(fromSlot, toSlot);
    }
}