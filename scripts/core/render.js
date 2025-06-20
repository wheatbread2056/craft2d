// generate block images
function initializeImage(src) {
    let imagekey = src.split('/').pop().split('.')[0];
    globalImages[imagekey] = new Image();
    globalImages[imagekey].src = src;
}
for (const i in allblocks) {
    let blk = allblocks[i];
    initializeImage(`images/blocks/${blk}.png`);
}
for (const i in tools) {
    let tool = tools[i].id;
    initializeImage(`images/tools/${tool}.png`);
}
for (const i in items) {
    let item = items[i].id;
    initializeImage(`images/items/${item}.png`);
}
for (const i in overlays) {
    let overlay = overlays[i];
    initializeImage(`images/overlay/${overlay}.png`);
}

// canvas + ctx
const canvas = document.createElement('canvas');
canvas.style = `position:absolute;top:0;left:0;margin:0`;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const globalCtx = canvas.getContext('2d');
globalCtx.imageSmoothingEnabled = false;
document.body.appendChild(canvas);

function renderWorld(camx, camy) {
    blocksRendered = 0;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    globalCtx.imageSmoothingEnabled = false;

    const camx2 = camx - Math.floor(camx);
    const camy2 = camy - Math.floor(camy);
    
    for (var y = -1; y < 17 / camera.scale * (window.innerHeight / 1080); y++) {
        for (var x = 0; x < 31 / camera.scale * (window.innerWidth / 1920); x++) {
            if (x + Math.floor(camx) < env.global.mapstart) {
                worldGen(env.global.mapstart - 64, env.global.mapstart);
            }
            if (x + Math.floor(camx) > env.global.mapend) {
                worldGen(env.global.mapend, env.global.mapend + 64);
            }
            else {
                let block = getBlock(x + Math.floor(camx), -y + Math.floor(camy));
                if (transparentblocks.includes(block) || block == null) {
                    let block1 = getBlock(x + Math.floor(camx), -y + Math.floor(camy), 'bg');
                    if (block1 !== null) showBlock(globalCtx, x - camx2, -y - camy2, block1, true, getLight(x + Math.floor(camx), -y + Math.floor(camy), true));
                }
                if (!(block == null)) {
                    if (block == 'watertop') { // show water animated
                        showBlock(globalCtx, x - camx2, -y - camy2, waterimg);
                    } else {
                        showBlock(globalCtx, x - camx2, -y - camy2, block, false, getLight(x + Math.floor(camx), -y + Math.floor(camy), true));
                    }
                    blocksRendered++;
                }
            }
        }
    }
    renderMobs(globalCtx, camera.x, camera.y);
    renderPlayer(globalCtx, camera.x, camera.y);
}

function renderPlayer(ctx, camx, camy) {
    showMob(ctx, player.x - camx, player.y - camy, player);
}
function renderMobs(ctx, camx, camy) {
    client.mobsRendered = 0;
    
    // dont render mobs if they're disabled
    if (!env.global.mobsEnabled) {
        return;
    }
    
    for (const mob of mobs) {
        // camera X and y are only used to calculate if within viewport
        mob.cameraX = (mob.x - camx) * 64 * camera.scale;
        mob.cameraY = (mob.y - camy) * 64 * camera.scale;
        if (mob.cameraX < -64 || mob.cameraX > window.innerWidth + 64 || !mob.cameraY < -64 || mob.cameraY > window.innerHeight + 64) continue; // only render mobs within the viewport
        showMob(ctx, mob.x - camx, mob.y - camy, mob);
        client.mobsRendered++;
    }
}

function renderOverlay(ctx, camx, camy) {
    // block breaking overlay
    if (!(!player.blockDamage || player.blockDamage <= 0)) {
        let progress = player.blockDamage / player.currentBlockHardness;
        let breakOverlay = 0;
        if (progress > 0.2) breakOverlay = Math.ceil((progress - 0.2) / 0.2);
        if (breakOverlay == 0) ctx.globalAlpha = 0;
        else ctx.globalAlpha = 0.5;
        showBlock(ctx, player.blockX - camx, player.blockY - camy, `breaking${breakOverlay}`);
        ctx.globalAlpha = 1;
    }

    // block selection overlay
    if (getBlock(client.blockMx, client.blockMy, player.interactionLayer) !== null && client.withinReach) {
        if (!player.breakingBlock) ctx.globalAlpha = 0.5;
        else ctx.globalAlpha = 0.8;
        showBlock(ctx, client.blockMx - camx, client.blockMy - camy, `blockselect`);
        ctx.globalAlpha = 1;
    }
}

function moveCamera() {
    if (camera.scale < 1) {
        if (camera.scale == 0.25) {
            camera.x = player.x - ((window.innerWidth/2-32)/64/camera.scale-(camera.scale-1.75));
            camera.y = player.y - (-(window.innerHeight/2-32)/64/camera.scale+(camera.scale-1.75));
        } else {
            camera.x = player.x - ((window.innerWidth/2-32)/64/camera.scale-(camera.scale-1));
            camera.y = player.y - (-(window.innerHeight/2-32)/64/camera.scale+(camera.scale-1));
        }
    } else {
        camera.x = player.x - ((window.innerWidth/2-32)/64/camera.scale-((camera.scale-1)/4));
        camera.y = player.y - (-(window.innerHeight/2-32)/64/camera.scale+((camera.scale-1)/4));
    }
}