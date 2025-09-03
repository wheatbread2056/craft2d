const mobs = {
    [Symbol.iterator]: function* () {
        for (const id in this) {
            if (Object.prototype.hasOwnProperty.call(this, id) && !isNaN(Number(id))) {
                yield this[id];
            }
        }
    }
};
var CurrentMobID = 1;

// mob class
class Mob {
    constructor(type, image, ai, minFollowDistance, sightRange) {
        // all mob types.
        let mobTypes = ['player','woman','chicken','cow','pig','slime_blue','slime_green','slime_red','slime_yellow','slime_purple','slime_orange','zombie'];
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

        this.id = CurrentMobID;
        CurrentMobID++;

        if (ai) this.ai = ai;

        // mob properties
        if (!type) {
            this.type = mobTypes[Math.floor(Math.random() * mobTypes.length)];
        }
        if (!sightRange) {
            this.sightRange = 32;
        }
        if (image) {
            this.image = image;
        }
        this.movement = {};
        this.followingPlayer = false;
        if (minFollowDistance) this.minFollowDistance = minFollowDistance;
        else this.minFollowDistance = 2;
    }
    init() {
        mobs[this.id] = this;
    }
    updateMovement() {
        if (typeof this.movement.direction === 'undefined') { // direction doesnt directly mess with physics, just used to determine movement
            this.movement.direction = Math.random() <= 0.5; // false = left, true = right
        }

        let withinPlayerRange = false;
        // figure out if we're within the player
        if (this.sightRange) {
            const distanceToPlayer = Math.sqrt(Math.pow(this.x - player.x, 2) + Math.pow(this.y - player.y, 2));
            if (distanceToPlayer < this.sightRange) {
                withinPlayerRange = true;
            }
        }

        if (this.ai == 'follow') {
            this.alwaysFollow = true;
            this.neverFollow = false;
        } else if (this.ai == 'wander') {
            this.neverFollow = true;
            this.alwaysFollow = false;
        } else {
            this.alwaysFollow = false;
            this.neverFollow = false;
        }

        // Handle alwaysFollow and neverFollow flags
        if (this.alwaysFollow) {
            this.followingPlayer = true;
        } else if (this.neverFollow) {
            this.followingPlayer = false;
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
            let distanceToPlayer = Math.sqrt(Math.pow(this.x - player.x, 2) + Math.pow(this.y - player.y, 2));
            if (distanceToPlayer < this.minFollowDistance) {
                this.movement.left = false;
                this.movement.right = false;
                return;
            }
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

        // Only toggle followingPlayer if not forced by alwaysFollow/neverFollow
        if (!this.alwaysFollow && !this.neverFollow && Math.random() < 0.01) {
            this.followingPlayer = !this.followingPlayer;
        }
        if (!withinPlayerRange) {
            this.followingPlayer = false;
        }
    }
}

function spawnMob(type, x, y, props) { // shortcut to spawn mob
    // Check if mobs are enabled before spawning
    if (!env.global.mobsEnabled) {
        return null;
    }
    
    const mob = new Mob(type);
    if (type) mob.type = type;
    if (props) {
        for (const prop in props) {
            if (props.hasOwnProperty(prop)) {
                mob[prop] = props[prop];
            }
        }
    }
    mob.x = x || 0;
    mob.y = y || 200;
    mob.init();
    return mob;
}

function deleteMob(id) {
    if (mobs[id]) {
        delete mobs[id];
    }
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