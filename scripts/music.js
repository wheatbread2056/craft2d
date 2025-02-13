var MusicEnabled = false;
var globalMusicSpeed = localStorage.getItem('audio.musicSpeed') || 1;
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
        musicLoop.volume = ((localStorage.getItem('audio.musicVolume') || 100) / 100) * ((localStorage.getItem('audio.masterVolume') || 100) / 100);
        musicLoop.playbackRate = music[current].speed * globalMusicSpeed;
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