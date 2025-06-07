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
inventoryGrid.style.maxWidth = '576px';
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
    function newBlockSlot(id = 'baby keem') {
        let blockSlot = document.createElement('div');
        blockSlot.setAttribute('class', 'inventory-block-slot');
        blockSlot.style.width = '50px';
        blockSlot.style.height = '50px';
        blockSlot.style.display = 'flex';
        blockSlot.style.alignItems = 'center';
        blockSlot.style.justifyContent = 'center';
        blockSlot.style.backgroundColor = '#00000088';
        blockSlot.style.border = '2px solid #00000000';
        blockSlot.style.position = 'relative'; // Ensure absolute children are positioned relative to this slot
        if (id <= 9) {
            blockSlot.style.border = '2px solid rgba(75, 0, 160, 0.5)';
            blockSlot.style.backgroundColor = 'rgba(37, 0, 78, 0.5)';
        }
        if (client.inventorySelectedSlot == id) {
            blockSlot.style.border = '2px solid rgb(119, 0, 255)';
            blockSlot.style.backgroundColor = 'rgba(119, 0, 255, 0.5)';
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
                player.inventory[player.currentSlot].id = blockId;
            });

            inventoryGrid.appendChild(blockSlot);
        }
    } else {
        for (let slotId in player.inventory) {
            const blockSlot = newBlockSlot(slotId);
            if (player.inventory[slotId].id !== null) {
                let blockImage = globalImages[player.inventory[slotId].id].cloneNode(true);
                blockImage.style.width = '48px';
                blockImage.style.height = '48px';
                blockImage.style.imageRendering = 'pixelated';
                blockSlot.appendChild(blockImage);
                // add text thats the amount stored
                if (player.inventory[slotId].amount > 1) {
                    const amountText = document.createElement('span');
                    amountText.style.position = 'absolute';
                    amountText.style.bottom = '2px';
                    amountText.style.right = '2px';
                    amountText.style.color = '#fff';
                    amountText.style.fontSize = '16px';
                    amountText.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                    amountText.style.pointerEvents = 'none'; // Allow clicks to pass through
                    amountText.textContent = player.inventory[slotId].amount;
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
                        // Swap the two slots
                        const temp = { ...player.inventory[client.inventorySelectedSlot] };
                        player.inventory[client.inventorySelectedSlot] = { ...player.inventory[slotId] };
                        player.inventory[slotId] = temp;
                    }
                    // Deselect after swap (or if same slot clicked)
                    client.inventorySelectedSlot = null;
                    // Optionally, re-render the UI to reflect changes
                    inventoryGrid.innerHTML = '';
                    createInventoryUI();
                }
            });
            inventoryGrid.appendChild(blockSlot);
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
        if (player.inventory[i] && globalImages[player.inventory[i].id]) {
            image = globalImages[player.inventory[i].id].cloneNode(true);
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
        if (player.inventory[i].amount > 1) {
            const amountText = document.createElement('span');
            amountText.style.position = 'absolute';
            amountText.style.bottom = '8px';
            amountText.style.right = '4px';
            amountText.style.color = '#fff';
            amountText.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
            amountText.style.fontSize = '16px';
            amountText.textContent = player.inventory[i].amount;
            slot.style.position = 'relative'; // Ensure parent is relative for absolute child
            slot.appendChild(amountText);
        }
        inventoryBar.appendChild(slot);
    }
    inventoryBar.style.left = '50%';
    inventoryBar.style.transform = 'translateX(-50%)';
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