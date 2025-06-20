const mobs = [];

// mob class
class Mob {
    constructor(type) {
        // properties taken from player
        this.x = 0;
        this.y = 200;
        this.mx = 0;
        this.my = 0;
        this.air = false;
        this.acc = false;
        this.fly = false;
        this.flyx = false;
        this.flyy = false;
        this.inWater = false;
        this.speedMult = env.player.defaultSpeedMultiplier;
        this.jumpMult = env.player.defaultJumpMultiplier;
        this.noclip = false;
        this.maxHealth = env.player.defaultMaxHealth;
        this.health = env.player.defaultMaxHealth;
        this.controlAllowed = true;
        this.modificationAllowed = true;
        this.invulnerable = env.player.defaultInvincibility;
        this.regenRate = env.player.defaultRegenRate;
        this.regenAllowed = true;

        // mob properties
        this.type = type; // type of mob
    }
    init() {
        mobs.push(this);
    }
}

// TEST MOB
const testMob = new Mob('baby keem').init();