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
}
const keys = {
    // example keys
    'a': false,
    'w': false,
    'd': false,
    'ArrowLeft': false,
    'ArrowRight': false,
    'ArrowUp': false,
    'Space': false,
    'Control': false,
};
const movementKeys = {
    'left': false,
    'right': false,
    'jump': false,
};

// key events . part 1
function keydownEvent(key) {
    /* if (chatboxActive) {
        keys[key] = true;
        if (key == 'v' && keys.Control) {
            navigator.clipboard.readText().then(text => {
                chatboxText += text;
            }).catch(err => {
                console.error('Failed to read clipboard contents: ', err);
            });
        } else if (key.length === 1) { // only add printable characters
            chatboxText += key;
        } else if (key == 'Enter') {
            enableChatbox();
        } else if (key == 'Backspace') {
            chatboxText = chatboxText.slice(0, -1);
        } else 
        return; */
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
window.addEventListener('keydown', (event) => { keydownEvent(event.key) });
window.addEventListener('keyup', (event) => { keyupEvent(event.key) });
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

function updateCommonValues() {
    client.blockMx = Math.floor(client.mx / 64 / camera.scale + camera.x);
    client.blockMy = Math.ceil(-client.my / 64 / camera.scale + camera.y);
    player.currentItem = player.inventory.slots[player.currentSlot].id;
    let currentTool = Object.values(tools).find(tool => tool.id === player.currentItem);
    player.currentBreakRate = toolTiers[currentTool?.tier]?.efficiency ?? 0.05;
    player.currentToolType = currentTool?.type || 'none';
    player.currentToolLevel = toolTiers[currentTool?.tier]?.level || 0;
}