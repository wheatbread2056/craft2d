// info text
const infoLn1 = document.createElement('p');
infoLn1.setAttribute('class', 'infotext');
infoLn1.innerHTML = 'Coordinates: (x, y)';
document.body.appendChild(infoLn1);

const infoLn2 = document.createElement('p');
infoLn2.setAttribute('class', 'infotext');
infoLn2.setAttribute('style', 'top:24px');
infoLn2.innerHTML = 'Time: hh:mm';
document.body.appendChild(infoLn2);

const infoLn3 = document.createElement('p');
infoLn3.setAttribute('class', 'infotext');
infoLn3.setAttribute('style', 'top:48px');
infoLn3.innerHTML = 'Camera scale: 1.23x';
document.body.appendChild(infoLn3);

// version text
const versionText = document.createElement('p');
versionText.setAttribute('class', 'infotext2');
versionText.innerHTML = versionName
document.body.appendChild(versionText);

// controls text
const controlsKeybind = document.createElement('p');
controlsKeybind.setAttribute('class', 'infotext3');
controlsKeybind.innerHTML = 'hold <b>q</b> for controls.';
document.body.appendChild(controlsKeybind);

const controlsList = document.createElement('pre');
controlsList.setAttribute('class', 'infotext3');
controlsList.innerHTML = `blocks are deleted and placed at the <b>mouse</b>
<b>move</b>: WASD / arrows
<b>delete block</b>: z
<b>place block</b>: x
<b>toggle fly mode</b>: c
<b>choose block</b>: n / m
<b>change zoom</b>: - / 0 / +`;
document.body.appendChild(controlsList);

// block selector (replacing soon)
const blockSelector = document.createElement('p');
blockSelector.setAttribute('class', 'blockselector');
blockSelector.innerHTML = 'Block (1/99)';
document.body.appendChild(blockSelector);

function renderInfoText() {
    if (debug == true) {
        infoLn1.innerHTML = `<b>player</b>: (<red>${player.x.toFixed(2)}</red>, <cyan>${player.y.toFixed(2)}</cyan>) | velocity (<yellow>${player.mx.toFixed(2)}</yellow>, <yellow>${player.my.toFixed(2)}</yellow>) | air <${player.air}>${player.air}</${player.air}>, acc <${player.acc}>${player.acc}</${player.acc}>, fly <${player.fly}>${player.fly}</${player.fly}>, water <${player.inWater}>${player.inWater}</${player.inWater}>`;
        infoLn2.innerHTML = `<b>world</b>: <yellow>${blocksRendered}</yellow> blocks rendered, <yellow>${blocks.size}</yellow> blocks stored, <yellow>${mapxsize}</yellow> map x size, <yellow>${camera.scale}</yellow> camera scale`;
        infoLn3.innerHTML = `<b>time</b>: tick <yellow>${ticknum}</yellow> | target rate <cyan>${tickrate}</cyan>, actual rate <magenta>${tickrateComputed}</magenta>, max <green>${tickrateHigh}</green>, min <red>${tickrateLow}</red>`;
    } else {
        infoLn1.innerHTML = `Position: (<red>${Math.round(player.x)}</red>, <cyan>${Math.round(player.y)}</cyan>)`;

        infoLn2.innerHTML = `Time: <yellow>${(Math.floor(ticknum/60*10)/10).toFixed(1)}</yellow> seconds`;

        if (!(camera.scale == 1)) {
            infoLn3.innerHTML = `Camera scale: <yellow>${camera.scale}x</yellow>`;
        } else {
            infoLn3.innerHTML = '';
        }
    }
    if (!keys.q) {
        controlsKeybind.setAttribute('style', 'opacity:1');
        controlsList.setAttribute('style', 'opacity:0');
    } else {
        controlsKeybind.setAttribute('style', 'opacity:0');
        controlsList.setAttribute('style', 'opacity:1');
    }
    blockSelector.innerHTML = `${blocknames[selblocks[currentblock]] || selblocks[currentblock]} (${currentblock + 1}/${selblocks.length}) | hp ${Math.ceil(player.health)}/${player.maxHealth} (${Math.round(player.health/player.maxHealth*1000)/10}%)`;
}