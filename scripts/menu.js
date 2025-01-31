document.body.style.height = '100vh';
document.body.style.margin = '0';
document.body.style.backgroundImage = 'linear-gradient(to bottom right, purple, darkblue)';
document.body.style.backgroundSize = 'cover';
loopMusic([{src:'music/craft2d-maintheme-v1.10.mp3',speed:1}]);

function pauseGame() {
    env.global.paused = true;
    setTickrate(0.0001);
    window.pauseDim = document.createElement('div');
    pauseDim.style = 'position:absolute;width:100%;height:100%;top:0;left:0;margin:0;background-color:black;opacity:0.5';
    document.body.appendChild(pauseDim);
}
function unpauseGame() {
    env.global.paused = false;
    setTickrate(env.global.targetRate);
    document.body.removeChild(pauseDim);    
}
function showWorldSelector() {
    function openWorld(type) {
        let tips = [
            "If you go up high enough, you will reach space.",
            "Please report bugs as GitHub issues.",
            "If you play craft2D in a local copy, you can do more.",
            "Remember, there are no bugs, only unintentional features.",
            "Are you having fun?",
            "Do NOT enable walljump.",
            "Press 'P' to pause the game.",
            "Update 2.0 releasing March 20, 6030!",
            "I am sorry about the very buggy collision.",
        ]
        document.body.removeChild(theDiv);
        document.body.removeChild(menuTitle);
        document.body.removeChild(menuTitle2);
        document.body.style = 'background-color: black';
        
        env.global.worldGenType = type;
        console.log(env.global.worldGenType);

        // loading screen
        window.loadingText = document.createElement('p');
        window.loadingText.innerHTML = 'Loading...';
        window.loadingText.style = 'font-size: 36px; text-align: center; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); margin:0';
        document.body.appendChild(window.loadingText);

        // random tip
        let randomTip = tips[Math.floor(Math.random() * tips.length)];
        window.tipText = document.createElement('p');
        window.tipText.innerHTML = `<i>${randomTip}</i>`;
        window.tipText.style = 'font-size: 24px; text-align: center; position: absolute; top: 57%; left: 50%; transform: translate(-50%, -50%); margin:0; opacity:0.8';
        document.body.appendChild(window.tipText);

        startGame(function() {
            document.body.style = 'background-color: rgb(36, 125, 207);';
            document.body.removeChild(window.loadingText);
            document.body.removeChild(window.tipText);

            // music stuff
            endLoop();
            loopMusic([{src:'music/grass1.mp3',speed:1}]);
        });

        if (!(env.global.worldGenType == 'normal' || env.global.worldGenType == 'flat')) {
            env.global.worldBottomEnabled = false;
        }
    }
    let theDiv = document.createElement('div');
    theDiv.style = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);width: 100%;text-align: center;';

    let title = document.createElement('p');
    title.innerHTML = 'Choose the World Type';
    title.style = `
    font-size: 32px; 
    text-align: center;
    width: 100%;`;
    theDiv.appendChild(title);

    let normalWorldGen = document.createElement('img');
    normalWorldGen.src = 'images/normal_worldgen.png';
    normalWorldGen.style = 'width: 256px; height: 256px; margin: 16px';
    normalWorldGen.onclick = () => {openWorld('normal')};
    theDiv.appendChild(normalWorldGen);

    let flatWorldGen = document.createElement('img');
    flatWorldGen.src = 'images/flat_worldgen.png';
    flatWorldGen.style = 'width: 256px; height: 256px; margin: 16px';
    flatWorldGen.onclick = () => {openWorld('flat')};
    theDiv.appendChild(flatWorldGen);

    let emptyWorldGen = document.createElement('img');
    emptyWorldGen.src = 'images/empty_worldgen.png';
    emptyWorldGen.style = 'width: 256px; height: 256px; margin: 16px';
    emptyWorldGen.onclick = () => {openWorld('none')};
    theDiv.appendChild(emptyWorldGen);

    document.body.appendChild(theDiv);
}

const menuDiv = document.createElement('div');
menuDiv.className = 'menuDiv';

const settingsDiv = document.createElement('div');
settingsDiv.style = `
position: absolute;
left: 0;
top: 50%;
transform: translateY(-50%);
width: 128px;
padding: 16px;
`;

class MenuButton {
    constructor(button) {
        this.button = document.createElement('button');
        this.button.className = button.class || 'playButton';
        this.button.innerHTML = button.text || null;
        if (button.tooltip) {this.button.title = button.tooltip};
        this.button.onclick = button.onclick || null;
        if (button.style) {this.button.style = button.style};
        this.button.style.color = button.color || null;
        this.button.style.backgroundColor = button.bg || null;
    }

    appendTo(parent) {
        parent.appendChild(this.button);
    }
}

const settingDivs = {};

function hideAllSettings() {
    // this sucks
    Object.entries(settingDivs).forEach(div => {
        try {document.body.removeChild(div[1])}
        catch {}});
}
function showSettings(divName) {
    hideAllSettings();
    document.body.appendChild(settingDivs[divName]);
}

const settings = [
    { id: 'audio', text: 'Audio', onclick: () => { showSettings('audio'); } },
    { id: 'video', text: 'Graphics', onclick: () => { showSettings('video'); } },
    { id: 'gameplay', text: 'Gameplay', onclick: () => { showSettings('gameplay'); } },
    { id: 'controls', text: 'Controls', onclick: () => { showSettings('controls'); } },
    { id: 'scripts', text: 'Scripts', onclick: () => { showSettings('scripts'); } },
    { id: 'extra', text: 'Extra', onclick: () => { showSettings('extra'); } },
    { id: 'back', text: 'Back', onclick: () => { 
        hideAllSettings();
        document.body.removeChild(settingsDiv);
        document.body.appendChild(menuDiv);
    } }
];

settings.forEach(setting => {
    settingDivs[setting.id] = document.createElement('div');
    settingDivs[setting.id].style = `
position: absolute;
left: 50%;
top: 50%;
transform: translate(-50%, -50%);
padding: 16px;
background-color: #00000080;
border: 4px solid #00000050;
border-radius: 8px;
max-height: 65vh;
overflow: auto;
`;

    let newText = document.createElement('h1'); 
    newText.innerHTML = setting.text;
    newText.style = `
    margin-bottom: 32px;
    margin-top: 16px;`
    newText.style.textAlign = 'center';
    settingDivs[setting.id].appendChild(newText);

    // Add actual settings content based on the setting id
    function createSetting(labelText, inputType, min, max, value) {
        let container = document.createElement('div');
        container.style.display = 'flex';
        container.style.justifyContent = 'space-between';
        container.style.alignItems = 'center';
        container.style.margin = '8px 0';

        let label = document.createElement('label');
        label.innerHTML = labelText + (inputType === 'range' ? ` (${value || 0})` : '');
        label.style.flex = '1';
        label.style.marginRight = '96px';
        label.style.maxWidth = '50vw';
        container.appendChild(label);

        let input = document.createElement('input');
        input.type = inputType;
        if (inputType === 'toggle') {
            input = document.createElement('button');
            input.style = `
            max-height: 48px;
            max-width: 256px;`
            input.innerHTML = value;
            input.onclick = () => {
                input.innerHTML = input.innerHTML === min ? max : min;
            };
            input.className = 'playButton';
        }
        if (min !== undefined) input.min = min;
        if (max !== undefined) input.max = max;
        if (value !== undefined) input.value = value;
        if (inputType === 'checkbox') {
            // custom because the normal checkbox sucks
            input = document.createElement('span');
            input.innerHTML = value ? '✅' : '❌';
            input.style.cursor = 'pointer';
            input.style.fontSize = '24px';
            input.addEventListener('click', () => {
            value = !value;
            input.innerHTML = value ? '✅' : '❌';
            input.style.color = value ? 'green' : 'red';
            });
            input.style.color = value ? 'green' : 'red';
        }
        if (inputType !== 'toggle' && inputType !== 'checkbox') {
            input.style = `
            background-color: #000000b0;
            border: 4px solid #00000025;
            border-radius: 8px;
            max-width: 256px;
            accent-color: #3800d3;`
            input.style.flex = '1';
        }
        container.appendChild(input);

        if (inputType === 'range') {
            input.addEventListener('input', () => {
                label.innerHTML = labelText + ` (${input.value})`;
            });
        }

        settingDivs[setting.id].appendChild(container);
    }

    switch (setting.id) {
        case 'audio':
            createSetting('Master Volume', 'range', 0, 100, 100);
            createSetting('Music Volume', 'range', 0, 100, 100);
            createSetting('Sfx Volume', 'range', 0, 100, 100);
            createSetting('Music Speed', 'range', 5, 20, 10);
            break;
        case 'video':
            createSetting('Enable Antialiasing', 'checkbox', undefined, undefined, true);
            createSetting('UI Visible', 'checkbox', undefined, undefined, true);
            break;
        case 'gameplay':
            createSetting('Max Health', 'range', 1, 10, 1);
            createSetting('Speed multiplier', 'range', 5, 20, 10);
            createSetting('Jump multiplier', 'range', 5, 20, 10);
            createSetting('Regen rate', 'range', -100, 500, 75);
            createSetting('Invincibility', 'checkbox', undefined, undefined, false);
            break;
        case 'controls':
            // for each thing in keybinds (input.js), create a setting with text input.
            Object.keys(keybinds).forEach(action => {
                createSetting(action.charAt(0).toUpperCase() + action.slice(1), 'text', undefined, undefined, keybinds[action].join(', '));
            });
            createSetting('Block modification mode', 'toggle', 'Modern', 'Classic', 'skibidi toilet');
            break;
        case 'scripts':
            createSetting('Load custom scripts', 'checkbox', undefined, undefined, false);
            break;
        case 'extra':
            createSetting('Player image', 'text', undefined, undefined, 'images/blocks/player.png');
            break;
    }
});

const settingButtons = {};

settings.forEach(setting => {
    settingButtons[setting.id] = new MenuButton(setting);
    settingButtons[setting.id].appendTo(settingsDiv);
});

const menuTitle = document.createElement('p');
menuTitle.innerHTML = `craft<b>2D</b>`;
menuTitle.style = `
font-size: 48px; 
text-align: center;
position: absolute;
width: 100%;
margin-top: 32px`;

const menuTitle2 = document.createElement('p');
menuTitle2.innerHTML = `<cyan>${versionName}</cyan>`;
menuTitle2.style = 'font-size: 24px; text-align: center; margin-top: 0; position: absolute; top: 84px; width: 100%;';

document.body.appendChild(menuTitle);
document.body.appendChild(menuTitle2);

const playButton = new MenuButton({text: 'Start craft2D', class: 'playButton', onclick: () => {
    document.body.removeChild(menuDiv);
    showWorldSelector();
}});

const settingsButton = new MenuButton({text: 'Settings', class: 'playButton', onclick: () => {
    document.body.removeChild(menuDiv);
    document.body.appendChild(settingsDiv);
}});

playButton.appendTo(menuDiv);
settingsButton.appendTo(menuDiv);

document.body.appendChild(menuDiv);