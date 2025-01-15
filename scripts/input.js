const keys = {
    // example keys
    'a': false,
    'w': false,
    'd': false,
    'ArrowLeft': false,
    'ArrowRight': false,
    'ArrowUp': false,
    'Space': false,
};
const movementKeys = {
    'left': false,
    'right': false,
    'jump': false,
};

// key events . part 1
function keydownEvent(key) {
    if (key == ' ') { // bind ' ' (can't access) to 'Space' in keys object
        keys.Space = true;
    }
    if (key == '`') { // debug mode toggle
        if (debug == false) {
            debug = true;
        } else {
            debug = false;
        }
    }
    if (key == 'c' && env.global.flyAllowed) { // fly mode toggle
        if (player.fly) {
            player.fly = false;
        } else {
            player.fly = true;
        }
    }
    if (key == 'm') { // next block
        currentblock++;
        if (currentblock >= selblocks.length) {
            currentblock = 0;
        }
    }
    if (key == 'n') { // previous block
        currentblock--;
        if (currentblock < 0) {
            currentblock = selblocks.length - 1;
        }
    }
    if (key == '-') { // zoom out
        camera.scale *= 0.5;
        if (camera.scale < 0.25) {
            camera.scale = 0.25;
        }
        camera.scale = Math.round(camera.scale*1000)/1000;
    }
    if (key == '=') { // zoom in
        camera.scale *= 2;
        if (camera.scale > 2) {
            camera.scale = 2;
        }
        camera.scale = Math.round(camera.scale*1000)/1000;
    }
    if (key == '0') { // reset zoom
        camera.scale = 1;
    }
    // fixes for capslock / shift
    if (key == 'CapsLock' || key == 'Shift') { // when capslock or shift is pressed
        for (possiblyLowerKey in keys) { // check all the keys in the object
            if (possiblyLowerKey == possiblyLowerKey.toLowerCase()) { // see if the keys are lowercase
                keyupEvent(possiblyLowerKey); // if the keys are lowercase, set them to false
            }
        }
    }
    keys[key] = true;
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
    movementKeys.left = (keys.a || keys.A || keys.ArrowLeft);
    movementKeys.right = (keys.d || keys.D || keys.ArrowRight);
    movementKeys.up = (keys.Space || keys.w || keys.W || keys.ArrowUp);
    movementKeys.down = (keys.s || keys.S || keys.ArrowDown);
}

// update mouse pos
document.addEventListener('mousemove', (event) => {
    mx = event.clientX;
    my = event.clientY;
});