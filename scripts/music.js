var MusicEnabled = false;
let musicLoop = new Audio();
let current = 0;
let music = [];

function loopMusic(musicArray) {
    // example: musicArray = [{src: 'test.mp3', speed: 3}, {src: 'test2.mp3', speed: 1}]
    if (!musicArray || musicArray.length == 0) return;
    music = musicArray;
    current = 0;

    function playMusic() {
        if (!musicLoop) {
            musicLoop = new Audio();
        }
        musicLoop.src = music[current].src;
        musicLoop.playbackRate = music[current].speed;
        musicLoop.preservesPitch = false;
        musicLoop.play();
    }
    if (!MusicEnabled) {
        document.addEventListener('click', function startMusic() {
            playMusic();
            document.removeEventListener('click', startMusic);
        });
        MusicEnabled = true;
    } else {
        playMusic();
    }

    musicLoop.addEventListener('ended', () => {
        current++;
        if (current >= music.length) current = 0;
        playMusic();
    });
}

function endLoop() {
    if (musicLoop) {
        musicLoop.pause();
        musicLoop = null;
    }
}