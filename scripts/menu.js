document.body.style.height = '100vh';
document.body.style.margin = '0';
document.body.style.backgroundImage = 'linear-gradient(to bottom right, purple, darkblue)';
document.body.style.backgroundSize = 'cover';

function showWorldSelector() {
    function openWorld(type) {
        document.body.removeChild(theDiv);
        document.body.removeChild(menuTitle);
        document.body.removeChild(menuTitle2);
        document.body.style = 'background-color: rgb(36, 125, 207);'
        
        env.global.worldGenType = type;
        console.log(env.global.worldGenType);

        startGame();

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

class MenuButton {
    constructor(text, className, onClick) {
        this.button = document.createElement('button');
        this.button.className = className;
        this.button.innerText = text;
        this.button.onclick = onClick;
    }

    appendTo(parent) {
        parent.appendChild(this.button);
    }
}

const menuDiv = document.createElement('div');
menuDiv.className = 'menuDiv';

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

const playButton = new MenuButton('Start craft2D', 'playButton', () => {
    document.body.removeChild(menuDiv);
    showWorldSelector();
});

const settingsButton = new MenuButton('Settings', 'playButton', () => {});

playButton.appendTo(menuDiv);
settingsButton.appendTo(menuDiv);

document.body.appendChild(menuDiv);