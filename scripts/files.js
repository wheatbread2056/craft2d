function saveWorld(filename, metadata) {
    if (metadata === undefined) metadata = {};
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
    // a
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
    const theInput = document.createElement('input');
    theInput.type = 'file';
    theInput.accept = '.craft2d';
    theInput.onchange = e => {
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
        document.body.removeChild(theInput);
    };
    document.body.appendChild(theInput);
    theInput.click();
}