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

// block selector v2!
const inventoryBar = document.createElement('div');
inventoryBar.style = `
position: absolute;
bottom: 0;`
document.body.appendChild(inventoryBar);

// inventory ui
const inventoryGrid = document.createElement('div');
inventoryGrid.setAttribute('class', 'inventory-grid');
inventoryGrid.style.display = 'grid';
inventoryGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(50px, 1fr))';
inventoryGrid.style.gap = '10px';
inventoryGrid.style.overflowY = 'scroll';
inventoryGrid.style.maxHeight = '400px';
inventoryGrid.style.border = '1px solid #ccc';
inventoryGrid.style.padding = '10px';
inventoryGrid.style.backgroundColor = '#00000088';
inventoryGrid.style.width = '80%';
inventoryGrid.style.maxHeight = '90%';
inventoryGrid.style.position = 'absolute';
inventoryGrid.style.top = '50%';
inventoryGrid.style.left = '50%';
inventoryGrid.style.transform = 'translate(-50%, -50%)';
inventoryGrid.style.backdropFilter = 'blur(10px)';
inventoryGrid.style.border = 'none';

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

function createInventoryUI() {
    for (let blockId in blockimages) {
        const blockSlot = document.createElement('div');
        blockSlot.setAttribute('class', 'inventory-block-slot');
        blockSlot.style.width = '50px';
        blockSlot.style.height = '50px';
        blockSlot.style.display = 'flex';
        blockSlot.style.alignItems = 'center';
        blockSlot.style.justifyContent = 'center';
        blockSlot.style.backgroundColor = '#00000088';
        blockSlot.style.border = '2px solid #00000000';

        let blockImage = blockimages[blockId].cloneNode(true);
        blockImage.style.width = '48px';
        blockImage.style.height = '48px';
        blockImage.style.imageRendering = 'pixelated';

        blockSlot.appendChild(blockImage);
        blockSlot.addEventListener('click', () => {
            player.inventory[player.currentSlot].id = blockId;
        });

        inventoryGrid.appendChild(blockSlot);
    }
}
createInventoryUI();

function renderBlockSelector() {
    inventoryBar.innerHTML = '';
    for (let i = 1; i <= 9; i++) {
        const slot = document.createElement('div');
        slot.setAttribute('class', 'inventory-slot');
        slot.style.display = 'inline-block';
        slot.style.marginRight = '8px';
        let image = blockimages[player.inventory[i].id].cloneNode(true);
        image.style.width = '48px';
        image.style.height = '48px';
        image.style.border = '4px solid rgb(54, 54, 54)';
        if (i == player.currentSlot) {
            image.style.border = '4px solid rgb(119, 0, 255)';
        }
        image.style.backgroundColor = 'rgba(100, 100, 100, 0.5)';
        image.style.imageRendering = 'pixelated';
        slot.appendChild(image);
        inventoryBar.appendChild(slot);
    }
    inventoryBar.style.left = '50%';
    inventoryBar.style.transform = 'translateX(-50%)';
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
}