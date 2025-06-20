const mobs = [];

// mob class
class Mob {
    constructor(type, image) {
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
        if (!image) {
            this.image = this.type;
        } else {
            this.image = image;
        }
        this.movement = {};
    }
    init() {
        mobs.push(this);
    }
    updateMovement() {
        if (!this.movement.direction) { // direction doesnt directly mess with physics, just used to determine movement
            this.movement.direction = Math.random() < 0.5; // false = left, true = right
        }
        this.movement.up = Math.random() < 0.2;
        this.movement.down = Math.random() < 0.5;
        // 10% change direction
        if (Math.random() < 0.1) {
            this.movement.direction = !this.movement.direction;
        }
        this.movement.left = !this.movement.direction;
        this.movement.right = this.movement.direction;
    }
}

function globalPhysics() { // do physics on every mob
    for (const mob of mobs) {
        playerPhysics(mob);
    }
}

function globalUpdateMovement() {
    for (const mob of mobs) {
        mob.updateMovement();
    }
}

// TEST MOB
for (let i = 0; i < 32; i++) {
    const mob = new Mob('player');
    mob.x = Math.random() * 1024 + player.x;
    mob.y = 256;
    mob.init();
}