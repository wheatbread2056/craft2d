function saveWorld(filename, metadata) {
    if (metadata === undefined) metadata = {};
    metadata.version = versionID;
    // metadata would be an object
    // example: {name: 'My epic world in craft2d!', author: 'me', version: '1.10-dev16'}

    // turn the world into a json file!
    const blob = new Blob([JSON.stringify([metadata, ...world.fg, 'startloadingthebackgroundnow!', ...world.bg])], { type: 'application/json' });
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
function loadWorld(clearMap = true, tp = true) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.craft2d';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = JSON.parse(e.target.result);
            let metadata = data[0];
            let foreground = data.slice(1, data.indexOf('startloadingthebackgroundnow!'));
            let background = data.slice(data.indexOf('startloadingthebackgroundnow!') + 1);
            if (metadata.version !== versionID) {
                console.warn(`World was saved in a different version (${metadata.version}, current version is ${versionID})`);
            }
            if (clearMap) {
                world.fg = new Map();
                world.bg = new Map();
            }
            foreground.forEach((block) => {
                let [xpos, ypos] = block[0].split(',');
                setBlock(xpos, ypos, block[1], 'fg');
            });
            background.forEach((block) => {
                let [xpos, ypos] = block[0].split(',');
                setBlock(xpos, ypos, block[1], 'bg');
            });
            if (tp) spawnPlayer(0);
        };
        reader.readAsText(file);
        console.log(`World successfully loaded:
File: ${input.files[0].name}
Size: ${(input.files[0].size / 1024).toFixed(2)}K`);
    };
    input.click();
}