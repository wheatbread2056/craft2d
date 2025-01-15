function tick() {
    tickrateComputed = Math.round(1000 / (Date.now() - lastTick));
    if (Number.isInteger(ticknum / 60)) { // every 60 ticks reset low and high
        tickrateLow = tickrate; tickrateHigh = 0;
    }
    if (tickrateComputed < tickrateLow) {
        tickrateLow = tickrateComputed;
    }
    if (tickrateComputed > tickrateHigh) {
        tickrateHigh = tickrateComputed;
    }
    lastTick = Date.now();
    // non-visible (functional)
    updateMovementKeys();
    playerPhysics();
    player.health += (player.regenRate/60); if (player.invulnerable) {player.health = player.maxHealth}
    if (player.health > player.maxHealth) {
        player.health = player.maxHealth;
    }
    // visible
    updateTime();
    moveCamera();
    renderWorld(camera.x, camera.y);
    renderInfoText();
    ticknum++;
}

initialNoiseGeneration(16); // 2^16 size
worldGen(-256, 256);
spawnPlayer(Math.round((mapstart / 2) + (mapend / 2))); // should just be 0
tick();

var clock = setInterval(tick, 1000/tickrate);
var blockModificationTick = setInterval(blockModification, 0); // do block modification seperately to feel smoother. replace this with the line method!!!