const loadTime = (performance.now() / 1000).toFixed(3);
console.log(`loader.js loaded @ ${loadTime}s`);

// this is the only thing that needs to be manually changed
const versionID = "a1.9-dev5";

// automatic stuff
const awerothiaergbyvze = { // version naming stuff
    'a': 'Alpha',
    'b': 'Beta'
};

const versionName = `${awerothiaergbyvze[versionID[0]]} ${versionID.slice(1)}`; // make the version name

document.title = `craft2D - ${versionName}`; // make the version title

// put the game script(s) in
const scripts = ['engine','data','input','render','worldgen','ui','main']; // list of script files. this needs to be in the right order

// wait until the document body is loaded
window.addEventListener('DOMContentLoaded', () => {
    const loadScript = (index) => {
        if (index >= scripts.length) return;

        const script = scripts[index];
        const gameScript = document.createElement('script');
        gameScript.src = `scripts/${script}.js?v=${versionID}`;
        gameScript.onload = () => {
            const loadTime = (performance.now() / 1000).toFixed(3);
            console.log(`scripts/${script}.js loaded @ ${loadTime}s`);
            loadScript(index + 1);
        };

        document.body.appendChild(gameScript);
    };

    loadScript(0);
});

// it is like this because it makes changing the version easier