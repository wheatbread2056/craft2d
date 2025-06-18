/**
 * Collection of functions to save
 * and load craft2d save files/worlds
 * 
 * Last updated: June 17th, 2025
 */

function fileMenu() {
    // here we actually construct our gui
    
    const c = document.getElementById("fileMenuContainer")
    if (c) c.remove()

    const container = document.createElement("div")
    const subcontainer = document.createElement("div")
    const title = document.createElement("h1")
    const description = document.createElement("p")
    const saveButton = document.createElement("button")
    const loadButton = document.createElement("button")

    saveButton.textContent = "Save World"
    loadButton.textContent = "Load World"

    saveButton.className = "playButton"
    loadButton.className = "playButton"

    saveButton.onclick = () => saveWorld(window.prompt("World name?") ?? "world")
    loadButton.onclick = loadWorld
    
    title.innerText = "Save/Load World"
    description.innerText = "Import or save your world's state. In the future, this will be a fancy pause menu with more options."

    title.style = `margin: 0; padding: 0;`

    container.style = `
        z-index: 5100;
        position: absolute;
        top: 50%;
        left: 50%;
        width: 65vw;
        transform: translate(-50%, -50%);
        background-color:rgba(0, 0, 0, 0.69);
        backdrop-filter: blur(10px);
        padding: 25px;
    `
    subcontainer.style = `
        display: flex;
        gap: 25px;
    `

    container.id = "fileMenuContainer"

    subcontainer.appendChild(saveButton)
    subcontainer.appendChild(loadButton)
    container.appendChild(title)
    container.appendChild(description)
    container.appendChild(subcontainer)

    document.body.appendChild(container)
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
    };
    document.body.appendChild(dummyInput);
    dummyInput.click();
}