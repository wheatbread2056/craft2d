function getMobileStatus() {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Opera Mini|IEMobile/i.test(navigator.userAgent)
}

if (getMobileStatus()) {
    alert("Mobile device support is NOT fully complete (yet). Please use a wireless mouse and keyboard.")
    console.log("User is on a mobile device.")
} else {
    console.log("User is on a desktop.")
}

function createMobileUI() {
    if (!getMobileStatus()) {
        return "User is not on a mobile device.";
    }

    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'mobile-controls';

    const dpad = document.createElement('div');
    dpad.className = 'dpad';

    [{
        class: 'up',
        label: '^',
        keyb: 'w'
    }, {
        class: 'down',
        label: "v",
        keyb: 's'
    }, {
        class: "left",
        label: "<",
        keyb: 'a'
    }, {
        class: "right",
        label: ">",
        keyb: 'd'
    }].forEach(dir => {
        const btn = document.createElement('button');
        btn.className = dir.class;
        btn.innerText = dir.label;
        btn.addEventListener('touchstart', () => keydownEvent(dir.keyb));
        btn.addEventListener('touchend', () => keyupEvent(dir.keyb));
        dpad.appendChild(btn);
    });

    const actions = document.createElement('div');
    actions.className = 'actions';

    const actionButtons = [
        { class: 'jump', label: '^' },
        { class: 'a', label: '⛏' }, // destroy / attack
        { class: 'b', label: '⏹' } // place / use
    ];

    actionButtons.forEach(({ class: cls, label }) => {
        const btn = document.createElement('button');
        btn.className = cls;
        btn.innerText = label;
        btn.addEventListener('touchstart', () => {
            if (cls === "jump") {
                keydownEvent(" ")
                return
            }
            if (cls === "a") {
                mobileControls.a = true
                mousedownEvent({ button: 0 })
                return
            }
            if (cls === "b") {
                mobileControls.b = true
                mousedownEvent({ button: 1 })
                return
            }
        });
        btn.addEventListener('touchend', () => {
            keyupEvent("")
            if (cls === "a") {
                mobileControls.a = false
                mouseupEvent({ button: 0 })
                return
            }
            if (cls === "b") {
                mobileControls.b = false
                mouseupEvent({ button: 1 })
                return
            }
        });
        actions.appendChild(btn);
    });

    controlsContainer.appendChild(dpad);
    controlsContainer.appendChild(actions);
    document.body.appendChild(controlsContainer);
}