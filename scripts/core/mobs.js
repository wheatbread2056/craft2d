const mobs = [];

// mob class
class Mob {
    constructor(type, image) {
        // Exclude 'player' from random mob types
        let mobTypes = ['woman','chicken','cow','pig','slime_blue','slime_green','slime_red','slime_yellow','slime_purple','slime_orange','zombie'];
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
        if (!type) {
            this.type = mobTypes[Math.floor(Math.random() * mobTypes.length)];
        }
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
        if (typeof this.movement.direction === 'undefined') { // direction doesnt directly mess with physics, just used to determine movement
            this.movement.direction = Math.random() <= 0.5; // false = left, true = right
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

function spawnMob(type, x, y, image) { // shortcut to spawn mob
    const mob = new Mob(type, image);
    mob.x = x || 0;
    mob.y = y || 200;
    mob.init();
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