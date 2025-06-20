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
    client.gameTickrateComputed = Math.round(1000 / (performance.now() - client.lastGameTick));
    if (client.gameTickrateComputed < 5) { // avoid divide by 0
        client.gameTickrateComputed = 5;
    }
    client.lastGameTick = performance.now();
    blockPhysics();
    globalUpdateMovement();
    updateLightmap();
    env.global.gameTickNum++;
}

function renderTick() {
    client.renderTickrateComputed = Math.round(1000 / (performance.now() - client.lastRenderTick));
    if (client.renderTickrateComputed < 5) { // avoid divide by 0
        client.renderTickrateComputed = 5;
    }
    client.lastRenderTick = performance.now();
    // non-visible (functional)
    updateMovementKeys();
    
    if (player.regenAllowed) {player.health += (player.regenRate/60 / (client.renderTickrateComputed / 60)); if (player.invulnerable) {player.health = player.maxHealth}};
    if (player.health > player.maxHealth) {
        player.health = player.maxHealth;
    }
    // visible
    updateCommonValues();
    playerPhysics(player);
    globalPhysics();
    blockModification();
    renderWorld(camera.x, camera.y);
    renderOverlay(globalCtx, camera.x, camera.y);
    updateTime();
    renderBlockSelector();
    renderInfoText();
    moveCamera();

    env.global.renderTickNum++;
    client.oldMx = client.mx; client.oldMy = client.my;
    if (!env.global.paused) {
        requestAnimationFrame(renderTick);
    }
}

worldGen(-256, 256);
spawnPlayer(0);
document.dispatchEvent(GameLoaded);
const finishedLoadTime = Date.now();
renderTick();

var clock = setInterval(gameTick, 1000/env.global.tickrate);

for (let i = 0; i < 32; i++) {
    const mob = new Mob();
    mob.x = Math.random() * 200 - 100;
    mob.init();
}
updateLightmap();