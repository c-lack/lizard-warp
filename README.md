# Lizard Warp

## Setup
Please ensure you do the following steps before the retreat as it may be difficult to download everything you need once we are already there.

Ensure you have Node installed. You can download it for Windows, Mac and Linux [here](https://nodejs.org/en/download/).

Once you have Node installed ensure it is running with `npm --v`. This should return `6.4.1`.

Clone or download the zip of this repository then in the root folder run the following
```
npm install -g concurrently
npm install -g nodemon
npm install
```

Once everything has downloaded and installed you should be able to run a local version of the game with `npm run dev`. You can then play the game at [`localhost:3000`](localhost:3000).

You can choose a username to play yourself, or you can play as a bot by selecting the username `bot_` followed by your name. You each have a bot script set up in the `/src/client/bots` folder. 

The code is not well optimised, nor well written. If you are playing as a bot, you will stil be able to use manual controls... Also, the page has to refresh after each game else stuff goes wrong. I haven't figured out where that bug is... 

## Writing your bot

You each already have a bot script set up. This is the only code you should be editing, and this is the only place that I will allow changes to from each of you. Your bot can make decisions approximatly 3 times a second. I will host locally at website for you to lookup JavaScript syntax. 

## Competition

The aim was to have a competition at the end to see who wrote the best bot. The example bots I wrote are terrible. Hopefully you do better. There is a scoring system that we can also discuss if you are interested.