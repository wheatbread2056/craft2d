/**
 * Collection of functions to save
 * and load craft2d save files/worlds
 * 
 * Last updated: June 17th, 2025
 */

function fileMenu() {
    // here we actually construct our gui
    
    const c = document.getElementById("fileMenuContainer");
    if (c) c.remove();

    const container = document.createElement("div");
    const subcontainer = document.createElement("div");
    const title = document.createElement("h1");
    const description = document.createElement("p");
    const saveButton = document.createElement("button");
    const loadButton = document.createElement("button");
    const menuButton = document.createElement("button");

    saveButton.textContent = "Save World";
    loadButton.textContent = "Load World";
    menuButton.textContent = "Back to Menu";

    saveButton.className = "playButton";
    loadButton.className = "playButton";
    menuButton.className = "playButton";

    saveButton.onclick = () => saveWorld(window.prompt("World name?") ?? "world");
    loadButton.onclick = loadWorld;
    menuButton.onclick = () => {
        // Return to main menu
        location.reload();
    };
    
    title.innerText = "Pause Menu";
    description.innerText = "";

    title.style = `margin: 0; padding: 0; justify-content: center; text-align: center; color: white; font-size: 2.5em; padding-bottom: 32px;`;

    container.style = `
        z-index: 5100;
        position: absolute;
        top: 50%;
        left: 50%;
        width: 65vw;
        transform: translate(-50%, -50%);
        padding: 25px;
    `;
    subcontainer.style = `
        display: flex;
        gap: 25px;
        flex-wrap: wrap;
        justify-content: center;
    `;

    container.id = "fileMenuContainer";

    subcontainer.appendChild(saveButton);
    subcontainer.appendChild(loadButton);
    subcontainer.appendChild(menuButton);
    container.appendChild(title);
    container.appendChild(description);
    container.appendChild(subcontainer);

    document.body.appendChild(container);
}

function saveWorld(filename, metadata) {
    if (!metadata) metadata = {};
    metadata.version = versionID;
    metadata.spawnpoint = metadata.spawnpoint || 0;
    // metadata would be an object
    // example: {name: 'My epic world in craft2d!', author: 'me', version: '1.10-dev16'}

    // turn the world into a json file!
    const blob = new Blob([JSON.stringify({
        metadata: metadata,
        world: {
            fg: Array.from(world.fg, ([key, map]) => [key, Array.from(map.entries())]),
            bg: Array.from(world.bg, ([key, map]) => [key, Array.from(map.entries())]),
        },
        env: env,
        player: player
    })], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    // automatic downloading
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.craft2d`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log(`World successfully saved:
File: ${filename}.craft2d
Size: ${(blob.size / 1024).toFixed(2)}K
Metadata: ${JSON.stringify(metadata)}`);
}

function loadWorld() {
    const dummyInput = document.createElement('input');
    dummyInput.type = 'file';
    dummyInput.accept = '.craft2d';
    dummyInput.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = event => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.metadata && data.world && data.env && data.player) {
                    // start with the world.
                    world.fg = new Map(data.world.fg.map(([key, entries]) => [key, new Map(entries)]));
                    world.bg = new Map(data.world.bg.map(([key, entries]) => [key, new Map(entries)]));
                    // then env
                    env.global = data.env.global;
                    env.player = data.env.player;
                    // then player.
                    for (const key in data.player) {
                        if (Object.prototype.hasOwnProperty.call(data.player, key) && key != 'inventory') {
                            player[key] = data.player[key];
                        }
                    }
                    player.inventory.slots = data.player.inventory.slots;
                    console.log(`World loaded successfully from ${file.name}`);
                } else {
                    console.error('Invalid world file format.');
                }
            } catch (error) {
                console.error('Error loading world:', error);
            }
        };
        reader.readAsText(file);
        // Clean up input after use
        document.body.removeChild(dummyInput);

        // save conversion here, lots of things to convert older versions to work properly
        function conversion() {
            // check first block and see its structure
            if (world.fg.size > 0) {
                // get the first chunk
                let chunkKey = world.fg.keys().next().value;
                let chunk = world.fg.get(chunkKey);

                // get the first block
                let firstBlockKey = chunk.keys().next().value;
                let firstBlock = chunk.get(firstBlockKey);
                
                let structureVersion = 'baby keem';
                // structure versions so far:
                // pre-survival: before block data, string
                // alpha 1.12: {id, data} = block format (might not have data)
                // check structure version
                if (typeof firstBlock === 'string') {
                    structureVersion = 'pre-survival';
                } else if (typeof firstBlock === 'object' && firstBlock.id) {
                    structureVersion = 'alpha 1.12';
                } else {
                    console.error('hello, i am craft2d. i do not know what structure version this is. please report this to the developers.');
                    console.error(':(');
                }

                if (structureVersion === 'pre-survival') {
                    // convert to alpha 1.12 format
                    for (const [chunkKey, chunk] of world.fg.entries()) {
                        for (const [blockKey, block] of chunk.entries()) {
                            // convert string to object
                            world.fg.get(chunkKey).set(blockKey, {id: block});
                        }
                    }
                    for (const [chunkKey, chunk] of world.bg.entries()) {
                        for (const [blockKey, block] of chunk.entries()) {
                            // convert string to object
                            world.bg.get(chunkKey).set(blockKey, {id: block});
                        }
                    }
                    console.log('hello, i am craft2d. i have converted your very old world.');
                    console.log(':D');
                }
            }

            let someGlobalEnvValues = {
                mobsEnabled: true, // whether mobs are enabled or not
                lightEnabled: true, // Advanced lighting system with sky light and 4-directional propagation
                lightUpdateCooldown: 500, // milliseconds between light updates (2 times per second)
                lastLightUpdate: 0, // timestamp of last light update
                skyLightLevel: 8, // maximum light level from sky
                minLightLevel: 4, // minimum light level for air blocks (ambient light)
            }
            // check if env.global has these values, if not, set them
            for (const key in someGlobalEnvValues) {
                if (!env.global.hasOwnProperty(key)) {
                    env.global[key] = someGlobalEnvValues[key];
                }
            }
        }

        // things to do after loading
        function afterLoad() {
            env.global.paused = true;
            mobs.length = 0;
            spawnMob('woman', player.x, player.y, {ai: 'follow'});
            updateLightmap();
        }

        setTimeout(conversion, 100);
        setTimeout(afterLoad, 200);
    };
    document.body.appendChild(dummyInput);
    dummyInput.click();
}