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
// controls list will be replaced with controls in settings menu (alpha 1.10)
controlsList.innerHTML = `blocks are deleted and placed at the <b>mouse</b>
<b>move</b>: WASD / arrows
<b>delete block</b>: LeftClick / z
<b>place block</b>: RightClick / x
<b>toggle fly mode</b>: c
<b>choose block</b>: n / m
<b>change zoom</b>: - / 0 / +`;
document.body.appendChild(controlsList);

// block selector (replacing soon)
const blockSelector = document.createElement('p');
blockSelector.setAttribute('class', 'blockselector');
blockSelector.innerHTML = 'Block (1/99)';
document.body.appendChild(blockSelector);

var chatboxTimeout;
var chatboxActive = false;
var chatboxText = '';
const chatbox = document.createElement('p');
chatbox.setAttribute('class', 'chatbox');
chatbox.setAttribute('style', 'opacity:0.8');
chatbox.innerHTML = '<i>/help or /?</i>';
document.body.appendChild(chatbox);

const chathistory = document.createElement('div');
chathistory.setAttribute('class', 'chathistory');
chathistory.style.opacity = 0;
chathistory.style.whiteSpace = 'pre-wrap'; // supports newlines but not text wrapping
chathistory.style.whiteSpace = 'normal'; // supports text wrapping but not newlines
document.body.appendChild(chathistory);

function enableChatbox() {
    chatboxActive = !chatboxActive;
    player.controlAllowed = !chatboxActive;
    if (chatboxActive) {
        clearTimeout(chatboxTimeout);
        chatbox.setAttribute('style', 'opacity:1');
        chatboxText = '';
        chatbox.innerHTML = '';
        if (chathistory.innerHTML.length > 0) {
            chathistory.style.opacity = 1;
        }
    } else {
        chathistory.style.opacity = 1;
        chatbox.setAttribute('style', 'opacity:0.8');
        chatbox.innerHTML = '<i>/help or /?</i>';
        chathistory.innerHTML = command(chatboxText);
        
        // Check if the command output contains newlines
        if (chathistory.innerHTML.includes('\n')) {
            chathistory.style.whiteSpace = 'pre-wrap';
        } else {
            chathistory.style.whiteSpace = 'normal';
        }

        clearTimeout(chatboxTimeout);
        chatboxTimeout = setTimeout(() => {
            let opacity = 1;
            const fadeOut = setInterval(() => {
                if (opacity <= 0) {
                    clearInterval(fadeOut);
                    chathistory.style.opacity = 0;
                } else {
                    opacity -= 0.1;
                    chathistory.style.opacity = opacity;
                }
            }, 100);
        }, 5000);
    }
}

function renderInfoText() {
    if (debug == true) {
        // let didn't work for this
        if (tickrateLow >= 60) {
            var performanceGrade = 'a';
            var performanceColor = 'purple';
        } else if (tickrateLow >= 45) {
            var performanceGrade = 'b';
            var performanceColor = 'cyan';
        } else if (tickrateLow >= 30) {
            var performanceGrade = 'c';
            var performanceColor = 'green';
        } else if (tickrateLow >= 15) {
            var performanceGrade = 'd';
            var performanceColor = 'orange';
        } else {
            var performanceGrade = 'f';
            var performanceColor = 'red';
        }
        let worldSizeColor = 'green';
        if (((world.fg.size + world.bg.size) / (2**24*2) * 100).toFixed(2) >= 10) {
            worldSizeColor = 'yellow';
        }
        if (((world.fg.size + world.bg.size) / (2**24*2) * 100).toFixed(2) >= 25) {
            worldSizeColor = 'orange';
        }
        if (((world.fg.size + world.bg.size) / (2**24*2) * 100).toFixed(2) >= 45) { // even though it's close to 50%, since it's split between a fg and bg layer (where the fg layer is MUCH bigger than bg) the real limit is around 16.7m, aka 50%
            worldSizeColor = 'red';
        }
        infoLn1.innerHTML = `<b>player</b>: (<red>${player.x.toFixed(2)}</red>, <cyan>${player.y.toFixed(2)}</cyan>) | velocity (<yellow>${player.mx.toFixed(2)}</yellow>, <yellow>${player.my.toFixed(2)}</yellow>) | air <${player.air}>${player.air}</${player.air}>, acc <${player.acc}>${player.acc}</${player.acc}>, fly <${player.fly}>${player.fly}</${player.fly}>, water <${player.inWater}>${player.inWater}</${player.inWater}>`;
        infoLn2.innerHTML = `<b>world</b>: <yellow>${blocksRendered}</yellow> blocks rendered, <yellow>${world.fg.size + world.bg.size}</yellow> (<${worldSizeColor}>${((world.fg.size + world.bg.size) / (2**24*2) * 200).toFixed(2)}%</${worldSizeColor}>) blocks stored, <yellow>${mapxsize}</yellow> map x size, <yellow>${camera.scale}</yellow> camera scale`;
        infoLn3.innerHTML = `<b>time</b>: tick <yellow>${ticknum}</yellow> | target rate <cyan>${tickrate}</cyan>, actual rate <magenta>${tickrateComputed}</magenta>, max <green>${tickrateHigh}</green>, min <red>${tickrateLow}</red> | grade <${performanceColor}>${performanceGrade}</${performanceColor}>`;
    } else {
        infoLn1.innerHTML = `Position: (<red>${Math.round(player.x)}</red>, <cyan>${Math.round(player.y)}</cyan>)`;

        infoLn2.innerHTML = `Time: <yellow>${((Date.now() - finishedLoadTime) / 1000).toFixed(1)}</yellow> seconds`;

        if (!(camera.scale == 1)) {
            infoLn3.innerHTML = `Camera scale: <yellow>${camera.scale}x</yellow>`;
        } else {
            infoLn3.innerHTML = '';
        }
    }
    if (!keybinds.controls.some(key => keys[key])) {
        controlsKeybind.setAttribute('style', 'opacity:1');
        controlsList.setAttribute('style', 'opacity:0');
    } else {
        controlsKeybind.setAttribute('style', 'opacity:0');
        controlsList.setAttribute('style', 'opacity:1');
    }
    if (chatboxActive) {
        let cursorVisible = Math.floor((ticknum / 60) * 2) % 2 === 0;
        let cursorText = cursorVisible ? '|' : '';
        chatbox.innerHTML = chatboxText + cursorText;
        if (chatboxText.length <= 0) {
            chatbox.innerHTML = '<gray>...</gray>';
        }
    }
    blockSelector.innerHTML = `${blocknames[selblocks[currentblock]] || selblocks[currentblock]} (${currentblock + 1}/${selblocks.length}) | hp ${Math.ceil(player.health)}/${player.maxHealth} (${Math.round(player.health/player.maxHealth*1000)/10}%)`;
}