const keybinds = {
    'left': ['a', 'A', 'ArrowLeft'],
    'right': ['d', 'D', 'ArrowRight'],
    'up': ['Space', 'w', 'W', 'ArrowUp'],
    'down': ['s', 'S', 'ArrowDown'],
    'delete': ['LeftClick', 'z'],
    'place': ['RightClick', 'x'],
    'fly': ['c'],
    'nextBlock': ['m'],
    'prevBlock': ['n'],
    'zoomOut': ['-'],
    'zoomIn': ['='],
    'resetZoom': ['0'],
    'debug': ['`'],
    'controls': ['q'],
    'chat': ['/'],
    'pause': ['p'],
    'inventory': ['e'],
    'layerToggle': ['l'],
    'MOBTEST': ['b'],
}
const keys = {}
const movementKeys = {
    'left': false,
    'right': false,
    'jump': false,
};

// We use this object to keep track of the player's current selection on mobile
const mobileInputSelection = {
    x: 0,
    y: 0
}

// This is to keep track of which mobile controls are active
const mobileControls = {
    a: false,
    b: false
}

// key events . part 1
function keydownEvent(key) {
    if (1 == 2) {
        1 + 1; // this is a placeholder to prevent the code from being empty
    } else {
        if (!isNaN(key) && key >= '1' && key <= '9') {
            player.currentSlot = parseInt(key);
            setTimeout(updateItemTooltip, 100);
        }
        if (key == ' ') { // bind ' ' (can't access) to 'Space' in keys object
            keys.Space = true;
        }
        if (keybinds.debug.includes(key)) { // debug mode toggle
            client.debug = !client.debug;
        }
        if (keybinds.fly.includes(key) && env.global.flyAllowed) { // fly mode toggle
            player.fly = !player.fly;
        }
        if (keybinds.inventory.includes(key) && player.controlAllowed) { // open/close inventory
            player.inventoryOpen = !player.inventoryOpen;
            if (player.inventoryOpen) {
                createInventoryUI();
                document.body.appendChild(inventoryGrid);
                player.modificationAllowed = false;
            } else {
                document.body.removeChild(inventoryGrid);
                player.craftingOpen = false;
                player.crateOpen = false;
                player.currentCrate = null;
                createInventoryUI();
                player.modificationAllowed = true;
            }
        }
        if (keybinds.nextBlock.includes(key)) { // next block
            player.currentSlot++;
            if (player.currentSlot > 9) {
                player.currentSlot = 1;
            }
        }
        if (keybinds.prevBlock.includes(key)) { // previous block
            player.currentSlot--;
            if (player.currentSlot < 1) {
                player.currentSlot = 9;
            }
        }
        if (keybinds.zoomOut.includes(key)) { // zoom out
            camera.scale *= 0.5;
            if (camera.scale < 0.25) {
                camera.scale = 0.25;
            }
            camera.scale = Math.round(camera.scale * 1000) / 1000;
        }
        if (keybinds.zoomIn.includes(key)) { // zoom in
            camera.scale *= 2;
            if (camera.scale > 2) {
                camera.scale = 2;
            }
            camera.scale = Math.round(camera.scale * 1000) / 1000;
        }
        if (keybinds.resetZoom.includes(key)) { // reset zoom
            camera.scale = 1;
        }
        if (keybinds.pause.includes(key)) {
            if (env.global.paused) {unpauseGame()} else {pauseGame()};
        }
        if (keybinds.layerToggle.includes(key)) {
            if (player.interactionLayer == 'fg') {
                player.interactionLayer = 'bg';
            } else {
                player.interactionLayer = 'fg';
            }
        }
        if (keybinds.MOBTEST.includes(key)) {
            spawnMob(null, player.x, player.y, {ai: 'wander'});
        }

        // fixes for capslock / shift
        if (key == 'CapsLock' || key == 'Shift') { // when capslock or shift is pressed
            for (let possiblyLowerKey in keys) { // check all the keys in the object
                if (possiblyLowerKey == possiblyLowerKey.toLowerCase()) { // see if the keys are lowercase
                    keyupEvent(possiblyLowerKey); // if the keys are lowercase, set them to false
                }
            }
        }
        keys[key] = true;
    }
}

function keyupEvent(key) {
    keys[key] = false;
    if (key == ' ') {
        keys.Space = false; 
    }
}

// left click only for now...
function mouseupEvent(event) {
    if (event.button === 0) {
        keys.LeftClick = false;
    } else if (event.button === 2) {
        keys.RightClick = false;
    }
}

function mousedownEvent(event) {
    if (event.button === 0) {
        keys.LeftClick = true;
    } else if (event.button === 2) {
        keys.RightClick = true;
    }
}

// key events
window.addEventListener('keydown', (event) => { keydownEvent(event.key.toLowerCase()) });
window.addEventListener('keyup', (event) => { keyupEvent(event.key.toLowerCase()) });
window.addEventListener('mouseup', (event) => { mouseupEvent(event) });
window.addEventListener('mousedown', (event) => { mousedownEvent(event) });

window.addEventListener('contextmenu', (event) => {
    event.preventDefault();
});

// ensure that movement keys get updated
function updateMovementKeys() {
    movementKeys.left = keybinds.left.some(key => keys[key]);
    movementKeys.right = keybinds.right.some(key => keys[key]);
    movementKeys.up = keybinds.up.some(key => keys[key]);
    movementKeys.down = keybinds.down.some(key => keys[key]);
}

// update mouse pos
document.addEventListener('mousemove', (event) => {
    client.mx = event.clientX;
    client.my = event.clientY;
});

document.addEventListener("touchstart", (event) => {
    if (mobileControls.a) {
        return
    }

    mobileInputSelection.x = event.touches[0].clientX
    mobileInputSelection.y = event.touches[0].clientY
    console.log(mobileInputSelection)
})

function updateCommonValues() {
    client.blockMx = Math.floor(client.mx / 64 / camera.scale + camera.x);
    client.blockMy = Math.ceil(-client.my / 64 / camera.scale + camera.y);
    player.currentItem = player.inventory.slots[player.currentSlot].id;
    let currentTool = Object.values(tools).find(tool => tool.id === player.currentItem);
    player.currentBreakRate = toolTiers[currentTool?.tier]?.efficiency ?? 0.05;
    player.currentToolType = currentTool?.type || 'none';
    player.currentToolLevel = toolTiers[currentTool?.tier]?.level || 0;
}