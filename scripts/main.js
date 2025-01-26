const GameLoaded = new CustomEvent("GameLoaded", {
    detail: {
        message: "Game finished loading.",
        timestamp: new Date(),
    }
})

function tick() {
    tickrateComputed = Math.round(1000 / (performance.now() - lastTick));
    if (Number.isInteger(ticknum / tickrate)) { // every 60 ticks reset low and high
        tickrateLow = tickrate; tickrateHigh = 0;
    }
    if (tickrateComputed < tickrateLow) {
        tickrateLow = tickrateComputed;
    }
    if (tickrateComputed > tickrateHigh) {
        tickrateHigh = tickrateComputed;
    }
    lastTick = performance.now();
    // non-visible (functional)
    updateMovementKeys();
    playerPhysics();
    player.health += (player.regenRate/60); if (player.invulnerable) {player.health = player.maxHealth}
    if (player.health > player.maxHealth) {
        player.health = player.maxHealth;
    }
    // visible
    blockModification();
    updateTime();
    moveCamera();
    renderWorld(camera.x, camera.y);
    renderInfoText();
    ticknum++;
    oldMx = mx; oldMy = my;
}

initialNoiseGeneration(16); // 2^16 size
worldGen(-256, 256);
spawnPlayer(Math.round((mapstart / 2) + (mapend / 2))); // should just be 0
document.dispatchEvent(GameLoaded);
tick();

var clock = setInterval(tick, 1000/tickrate);