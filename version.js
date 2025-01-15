// this is the only thing that needs to be manually changed
const versionID = "a1.8.2";

// automatic stuff
const awerothiaergbyvze = { // version naming stuff
    'a': 'Alpha',
    'b': 'Beta'
};

const versionName = `${awerothiaergbyvze[versionID[0]]} ${versionID.slice(1)}`; // make the version name

document.title = `craft2D - ${versionName}`; // make the version title

// put the game script(s) in
const gameScript = document.createElement('script');
gameScript.src = `game.js?v=${versionID}`;

// wait until the document body is loaded
window.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(gameScript);
});

// it is like this because it makes changing the version easier