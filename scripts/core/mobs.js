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
        this.followingPlayer = false;
    }
    init() {
        mobs.push(this);
    }
    updateMovement() {
        if (typeof this.movement.direction === 'undefined') { // direction doesnt directly mess with physics, just used to determine movement
            this.movement.direction = Math.random() <= 0.5; // false = left, true = right
        }
        if (!this.followingPlayer) {
            this.movement.up = Math.random() < 0.2;
            this.movement.down = Math.random() < 0.5;
            // 10% change direction
            if (Math.random() < 0.1) {
                this.movement.direction = !this.movement.direction;
            }
            // 5% toggle if moving
            if (Math.random() < 0.05) {
                this.movement.moving = !this.movement.moving;
            }
            if (this.movement.moving) {
                this.movement.left = this.movement.direction;
                this.movement.right = !this.movement.direction;
            } else {
                this.movement.left = false;
                this.movement.right = false;
            }
        } else {
            if (this.x < player.x) {
                this.movement.left = false;
                this.movement.right = true;
            } else {
                this.movement.left = true;
                this.movement.right = false;
            }
            if (this.y < player.y) {
                this.movement.up = true;
                this.movement.down = false;
            } else {
                this.movement.up = false;
                this.movement.down = true;
            }
            // jump either way, avoids getting stuck
            if (!this.movement.up) {
                this.movement.up = Math.random() < 0.2;
            }
        }
        // 1% chance toggle following
        if (Math.random() < 0.01) {
            this.followingPlayer = !this.followingPlayer;
            if (this.followingPlayer) {
                console.warn(`WARNING: You are being chased by a ${this.type}!`);
            } else {
                console.warn(`${this.type} gave up on you 🥀🥀🥀`);
            }
        }
    }
}

function spawnMob(type, x, y, image) { // shortcut to spawn mob
    // Check if mobs are enabled before spawning
    if (!env.global.mobsEnabled) {
        return null;
    }
    
    const mob = new Mob(type, image);
    mob.x = x || 0;
    mob.y = y || 200;
    mob.init();
    return mob;
}

function globalPhysics() { // do physics on every mob
    // Only process mob physics if mobs are enabled
    if (!env.global.mobsEnabled) {
        return;
    }
    
    for (const mob of mobs) {
        playerPhysics(mob);
    }
}

function globalUpdateMovement() {
    // Only update mob movement if mobs are enabled
    if (!env.global.mobsEnabled) {
        return;
    }
    
    for (const mob of mobs) {
        mob.updateMovement();
    }
}