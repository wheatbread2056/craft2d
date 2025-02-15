// generate block images
for (const i in allblocks) {
    blk = allblocks[i];
    const imagekey = blk;
    blockimages[imagekey] = new Image();
    blockimages[imagekey].src = `images/blocks/${blk}.png`;
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
            if (x + Math.floor(camx) < mapstart) {
                worldGen(mapstart - 64, mapstart);
            }
            if (x + Math.floor(camx) > mapend) {
                worldGen(mapend, mapend + 64);
            }
            else {
                let darken = false;
                let block = getBlock(x + Math.floor(camx), -y + Math.floor(camy));
                if (block == null) {
                    block = getBlock(x + Math.floor(camx), -y + Math.floor(camy), 'bg');
                    darken = true;
                }
                if (!(block == null)) {
                    if (block == 'watertop') { // show water animated
                        showBlock(globalCtx, x - camx2, -y - camy2, waterimg);
                    } else {
                        showBlock(globalCtx, x - camx2, -y - camy2, block, darken);
                    }
                    blocksRendered++;
                }
            }
        }
    }
    renderPlayer(globalCtx, camera.x, camera.y);
}

function renderPlayer(ctx, camx, camy) {
    showBlock(ctx, player.x - camx, player.y - camy, 'player');
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