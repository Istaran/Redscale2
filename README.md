Basic directions:
1) Install node.js and git. The search engine of your choice can find them for you.
2) Create a directory to install to, go there on command prompt and use 'git clone https://github.com/Istaran/Redscale2'; to download it.
3) Get the prerequisites by using 'npm install' in the directory to get everything ready.
4) To run, use 'npm start' from the directory. This will launch the server. If it's all working right, it should say 'Redscale is listening on port 8161!'
5) To connect to your local server, navigate your browser to 'localhost:8161'. If you know your IP, you can connect from any browser that can reach you. You can also configure the port with the PORT environment variable.
6) To update to the latest version, use 'git pull'. You should stop your server before doing so and restart it after for best results.


Limitations on a private server:
1) Google authentication will be disabled. So only one player is really supported.
2) The chat feature is disabled. (If I hadn't done that, there'd be a 'ghost chat' effect where you can be heard by whoever is logged in at the moment but your message is gone when someone logs in later)
3) NSFW content is not included. This is mandated by the TOS for github. The game will run fine without it, and you can always add your own if you like.

license-wise...
feel free to download the source, use it as inspiration and/or a starting point for your own thing. You may also host a copy for your own personal use or to share w/ friends. Hosting a direct copy online for public consumption is both uncool and unlicensed. I make no warrantee as to the quality or suitability of this code for any purpose other than mild entertainment.
