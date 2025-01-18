const mods = {};

// things done:
// [X] mod "loading"
// [X] AddBlock function
// [ ] AddItem function
// [ ] custom textures
// [ ] custom biomes
// [ ] custom tick functions

function initMod(mod) {
    if (mods[mod.id]) {
        console.error('Mod with id "' + mod.id + '" already exists!');
        return;
    }
    if (mod.id && mod.version) {
        mods[mod.id] = mod;
        console.log(`Mod loaded: ${mod.name} (id ${mod.id}) version ${mod.version}`)

        // set up functions
        mods[mod.id].AddBlock = function(block) {
            // properties: id, name, image, selectable=true, collide=true, log (logging)
            if (block.id && block.image) {
                let selectable = block.selectable || true;
                let collide = block.collide || true;
                let fullBlockId = mod.id + '.' + block.id;

                let newimage = new Image(); newimage.src = block.image;
                blockimages[mod.id + '.' + block.id] = newimage;
                allblocks.push(fullBlockId);
                if (selectable) { selblocks.push(fullBlockId) };
                if (block.name) { blocknames[fullBlockId] = block.name };
                if (!collide) { nocollision.push(fullBlockId) }

                if (mods[mod.id].blocks == undefined) {
                    mods[mod.id].blocks = {};
                }
                mods[mod.id].blocks[block.id] = block;
                
                if (block.log) { console.log(`Block added: ${block.name} (id ${block.id})`) };
            } else {
                console.error(`Block failed to load due to missing required properties: ${block}`)
            }
        }

    } else {
        console.error(`Mod failed to load due to missing required properties: ${mod}`)
    }
}