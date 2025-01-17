const loadTime = (performance.now() / 1000).toFixed(3);
console.log(`loader.js loaded @ ${loadTime}s`);

// this is the only thing that needs to be manually changed
const versionID = "a1.9.3";

// automatic stuff
const awerothiaergbyvze = { // version naming stuff
    'a': 'Alpha',
    'b': 'Beta'
};

const versionName = `${awerothiaergbyvze[versionID[0]]} ${versionID.slice(1)}`; // make the version name

document.title = `craft2D - ${versionName}`; // make the version title

// put the game script(s) in
const scripts = ['engine','data','input','cmd','render','worldgen','ui','main']; // list of script files. this needs to be in the right order

// wait until the document body is loaded
// uses a different loadScript
window.addEventListener('DOMContentLoaded', () => {
    const initialLoadScript = (index) => {
        if (index >= scripts.length) return;

        if (index == scripts.length-1) { // custom script loading
            loadScript('scripts.js');
        }

        const script = scripts[index];
        const gameScript = document.createElement('script');
        gameScript.src = `scripts/${script}.js?v=${versionID}`;
        gameScript.onload = () => {
            const loadTime = (performance.now() / 1000).toFixed(3);
            console.log(`scripts/${script}.js loaded @ ${loadTime}s`);
            initialLoadScript(index + 1);
        };
        document.body.appendChild(gameScript);
    };

    initialLoadScript(0);
});

// let other scripts load more scripts!
function loadScript(src, version) {
    const initTime = (performance.now() / 1000);
    const script = document.createElement('script');
    if (version === undefined) version = versionID;
    script.src = `${src}?v=${version}`;
    script.onload = () => {
        const loadTime = (performance.now() / 1000);
        console.log(`${src} loaded in ${(loadTime-initTime).toFixed(3)}s`);
    };
    script.onerror = (e) => {
        console.warn(`custom script failed (${src}) @ ${(performance.now() / 1000).toFixed(3)}s`);
    };
    document.body.appendChild(script);
}

// it is like this because it makes changing the version easier