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
    if (chatboxActive) {
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
        return;
    } else {
        if (key == ' ') { // bind ' ' (can't access) to 'Space' in keys object
            keys.Space = true;
        }
        if (keybinds.debug.includes(key)) { // debug mode toggle
            debug = !debug;
        }
        if (keybinds.fly.includes(key) && env.global.flyAllowed) { // fly mode toggle
            player.fly = !player.fly;
        }
        if (keybinds.nextBlock.includes(key)) { // next block
            currentblock++;
            if (currentblock >= selblocks.length) {
                currentblock = 0;
            }
        }
        if (keybinds.prevBlock.includes(key)) { // previous block
            currentblock--;
            if (currentblock < 0) {
                currentblock = selblocks.length - 1;
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
        if (keybinds.chat.includes(key)) { // chat
            enableChatbox();
        }
        if (keybinds.pause.includes(key)) {
            if (env.global.paused) {unpauseGame()} else {pauseGame()};
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
    mx = event.clientX;
    my = event.clientY;
});