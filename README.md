Craft2D is a game where there are blocks, a world, and large (not infinite) possibilities.

# Installation
There is currently one instance, at https://wheatbread2056.github.io/craft2d

It should always be updated to the latest commit, although that does mean that some versions may be unfinished or unstable.

You can also download the latest release, if there is one. If not, just clone the repository and open index.html in a browser.

# Engine
Craft2D's game engine is just the browser. There aren't any libraries besides the one for the seedrandom function.

> In the future, the engine (or, source code) may be rewritten due to poor optimizations and lack of readability.

# Future Plans
Right now (Alpha 1.10, as of June 6th 2025) Craft2D only has a "creative" mode, where you can infinitely modify the world with no consequences, no items, nothing.

This isn't a lot to do, so in Alpha 1.11 there will be items, tools, etc.

Then in Alpha 1.12, the world generation will be expanded to have taller mountains, at least 5 new biomes, and re-add Creative mode.

Later in development, there might be mobs, magic, etc. I'm not really sure what the game will end up as.

## How to install Custom Scripts
(Warning) Custom scripts execute code that is not present in the main game, only use scripts that you trust!

---

First, download the custom script, wherever it may be from, and be cautious to not download a malicious script.

Next, go into your game folder (the one with index.html) and make a scripts folder. Call it whatever you like, and put the script in there.

Now, make a scripts.js file in the game folder. Then, load the script, for example if you wanted to load mods/example.js, scripts.js would be:

```js
loadScript('mods/example.js');
```

The final step is to simply reload the game, and the scripts should load! If not, look in the developer console (ctrl+shift+i or F12) and troubleshoot the error.

## Why are there no versions before alpha 1.7 available?
Before alpha 1.7, I was not using GitHub with this project as I believed it would go nowhere.

Though, there may be an older version that is recoverable, if we manage to get the ZIP archive of it.

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/wheatbread2056/craft2d)

testt22