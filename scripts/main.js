const GameLoaded = new CustomEvent("GameLoaded", {
    detail: {
        message: "Game finished loading.",
        timestamp: new Date(),
    }
})

// Attempt to load settings from localStorage
// why is this so long
player.maxHealth = parseInt(localStorage.getItem('gameplay.maxHealth')) || env.player.defaultMaxHealth;
player.speedMult = parseInt(localStorage.getItem('gameplay.speedMultiplier'))|| env.player.defaultSpeedMultiplier;
player.jumpMult = parseInt(localStorage.getItem('gameplay.jumpMultiplier')) || env.player.defaultJumpMultiplier;
player.regenRate = parseInt(localStorage.getItem('gameplay.regenRate'))|| env.player.defaultRegenRate;
player.invulnerable = localStorage.getItem('gameplay.invincibility') === 'true' || env.player.defaultInvincibility;
player.health = player.maxHealth; // update player's health
env.global.physicsQuality = parseInt(localStorage.getItem('gameplay.physicsQuality')) || env.global.physicsQuality;

// update the keybinds
for (const key in keybinds) {
    const storedKey = localStorage.getItem(`controls.${key}`);
    if (storedKey) {
        // split into array, and remove whitespace
        keybinds[key] = storedKey.split(',').map(k => k.trim());
    }
}

function gameTick() { // block physics and other things go here, but player physics, building, rendering, etc. ANYTHING that needs to be smooth, goes in renderTick()
    gameTickrateComputed = Math.round(1000 / (performance.now() - lastGameTick));
    if (gameTickrateComputed < 5) { // avoid divide by 0
        gameTickrateComputed = 5;
    }
    lastGameTick = performance.now();
    updateTime();
    gameTickNum++;
}
function renderTick() {
    renderTickrateComputed = Math.round(1000 / (performance.now() - lastRenderTick));
    if (renderTickrateComputed < 5) { // avoid divide by 0
        renderTickrateComputed = 5;
    }
    lastRenderTick = performance.now();
    // non-visible (functional)
    updateMovementKeys();
    
    if (player.regenAllowed) {player.health += (player.regenRate/60 / (renderTickrateComputed / 60)); if (player.invulnerable) {player.health = player.maxHealth}};
    if (player.health > player.maxHealth) {
        player.health = player.maxHealth;
    }
    // visible
    playerPhysics();
    blockModification();
    renderWorld(camera.x, camera.y);
    renderBlockSelector();
    renderInfoText();
    moveCamera();

    renderTickNum++;
    oldMx = mx; oldMy = my;
    requestAnimationFrame(renderTick);
}

initialNoiseGeneration(16); // 2^16 size
worldGen(-256, 256);
spawnPlayer(Math.round((mapstart / 2) + (mapend / 2))); // should just be 0
document.dispatchEvent(GameLoaded);
const finishedLoadTime = Date.now();
renderTick();

var clock = setInterval(gameTick, 1000/tickrate);