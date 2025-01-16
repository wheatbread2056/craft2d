function command(cmd) { // take a command input for the chatbox, then return the output.
    // LIST OF COMMANDS: (all commands are prefixed with /)
    // help or ? - show a list of commands
    // tp x y
    // place x y block
    // del x y
    // eval code (runs js)
    // set name val (example: /set env.global.gravity -1000)
    // get name (example: /get env.global.gravity)
    // output text (basically console.log for the chat box)
    // crash
    // tickrate val
    // respawn
    let args = cmd.split(' ');
    args[0] = args[0].replace('/', '');
    if (args[0] == 'help' || args[0] == '?') {
        return `/help or /?
/tp <yellow>x y</yellow>
/place <yellow>x y block</yellow>
/del <yellow>x y</yellow>
/eval <yellow>code</yellow>
/set <yellow>name val</yellow>
/get <yellow>name</yellow>
/output <yellow>text</yellow>
/crash
/tickrate <yellow>val</yellow>`;
    }
    if (args[0] == 'tp') { // teleport player
        let x = parseInt(args[1]);
        let y = parseInt(args[2]);
        if (isNaN(y) && !isNaN(x)) { // if only x param
            spawnPlayer(x); 
            return `teleported to (<red>${x}</red>, <cyan>${player.y}</cyan>)`;
        }
        if (isNaN(x) || isNaN(y)) {
            return `<yellow>invalid syntax</yellow>`;
        }
        player.x = x;
        player.y = y;
        return `teleported to (<red>${x}</red>, <cyan>${y}</cyan>)`;
    }
    else if (args[0] == 'place') { // place block
        let x = parseInt(args[1]);
        let y = parseInt(args[2]);
        let block = args[3];
        if (isNaN(x) || isNaN(y) || !block) {
            return `<yellow>invalid syntax</yellow>`;
        }
        setBlock(x, y, block, false);
        return `(<red>${x}</red>, <cyan>${y}</cyan>) set to ${block}`;
    }
    else if (args[0] == 'del') { // delete block
        let x = parseInt(args[1]);
        let y = parseInt(args[2]);
        if (isNaN(x) || isNaN(y)) {
            return `<yellow>invalid syntax</yellow>`;
        }
        deleteBlock(x, y);
        return `(<red>${x}</red>, <cyan>${y}</cyan>) deleted`;
    }
    else if (args[0] == 'eval') { // run javascript
        try {
            return eval(cmd.slice(args[0].length + 1));
        } catch (e) {
            return `<red>${e.message}</red>`;
        }
    } else if (args[0] == 'set') { // set a variable
        let name = args[1];
        let val = args[2];
        let newValue;
        try {
            newValue = eval(`${name} = ${val}`);
        } catch (e) {
            return `<red>${e.message}</red>`;
        }
        return `<cyan>${name}</cyan> updated to <yellow>${newValue}</yellow>`;
    } else if (args[0] == 'get') { // get a variable
        let name = args[1];
        try {
            return `<cyan>${name}</cyan> = <yellow>${eval(name)}</yellow>`;
        } catch (e) {
            return `<red>${e.message}</red>`;
        }
    } else if (args[0] == 'output') { // console.log for chatbox
        return cmd.slice(args[0].length + 1);
    } else if (args[0] == 'crash') { // why is this here.
        let consent = confirm("crash out?");
        if (consent) {
            while (true) {
                console.error("crashout");
            }
        } else {
            return `<red>canceled by user</red>`;
        }
        } else if (args[0] == 'tickrate') { // change the tickrate
        if (!isNaN(parseInt(args[1]))) {
            setTickrate(parseInt(args[1]));
            return `tickrate set to <yellow>${args[1]}</yellow>`;
        } else {
            return `<yellow>invalid syntax</yellow>`;
        }
    } else {
        // return `Player: ${cmd}`; // <-- fake multiplayer
        if (cmd.length > 0) {
            return `<yellow>"${args[0]}"</yellow> is an <yellow>invalid command</yellow>
<i>(chat hasn't been implemented yet)</i>`;
        } else {
            return `no command`;
        }
    }
}