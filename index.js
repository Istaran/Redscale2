const fs = require('fs');
let google_oauth_config = null;

try {
    google_oauth_config = JSON.parse(fs.readFileSync('private/config/google-oauth-config.json'));
} catch (e) {
    console.log("Couldn't load Google OAuth configuration. Disabling authorization.");
}

// NOTE: this config is blocked from loading onto github, you will need your own if forking this project.
//{
//    clientID: GOOGLE_CLIENT_ID,
//    clientSecret: GOOGLE_CLIENT_SECRET,
//    callbackURL: "http://www.example.com/auth/google/callback"
//}

const express = require('express');
const querystring = require('querystring');
const app = express();
const port = process.env.PORT || 8161;

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// default settings. Any you don't have will default to these, and you can only set these.
const settingsTemplate = {
    displayName: null,
    darkTheme: false,
    fastAnimations: false
};

const cache = require('./cache');
function extractProfile(profile) {
    let profilePath = `saves/profiles/${profile.provider}.${profile.id}.json`;
    let savedProfile = cache.load(profilePath) || {
        id: profile.id,
        provider: profile.provider,
        displayName: profile.displayName
    };
    savedProfile.id = savedProfile.id || profile.id;
    savedProfile.provider = savedProfile.provider || profile.provider;
    savedProfile.displayName = savedProfile.displayName || profile.displayName;
    if (profile.photos && profile.photos.length) {
        savedProfile.imageUrl = profile.photos[0].value;
    }
    if (profile.emails && profile.emails.length) {
        savedProfile.email = profile.emails[0].value;
    }
    for (setting in settingsTemplate) {
        if (profile[setting] === undefined)
            profile[setting] = settingsTemplate[setting];
    }
    cache.save(profilePath, savedProfile);

    return `${profile.provider}.${profile.id}`;
}

if (google_oauth_config) {
    passport.use(new GoogleStrategy(google_oauth_config,
        function (accessToken, refreshToken, profile, cb) {
            return cb(null, extractProfile(profile));
        }
    ));
}

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

const chat = require('./chatserver');
const game = require('./gameengine');

app.use(express.urlencoded({extended: false }));
app.use(express.json());

// [START session]
// Configure the session and session storage.
const session = require('express-session');
const FileStore = require('session-file-store')(session);

const sessionConfig = {
    resave: false,
    saveUninitialized: false,
    secret: google_oauth_config ? google_oauth_config.clientSecret : "16777216",
    signed: true,
    store: new FileStore({})
};

app.set('trust proxy', 1);
app.use(session(sessionConfig));


// [END session]

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/assets'));

if (google_oauth_config) {
    app.get('/login/google',
        passport.authenticate('google', { scope: ['email', 'profile'] })
    );

    app.get(
        '/login/google/callback',
        passport.authenticate('google'),
        (req, res) => {
            res.redirect(req.session.nsfw ? '/?nsfw=true' : '/');
        }
    );
} else {
    app.get('/login/google',
        (req, res) => {
            res.redirect(req.session.nsfw ? '/?nsfw=true' : '/');
        }
    );
}

let getProfile = async function(user) {
    let profile = null;
    if (!google_oauth_config) {
        profile = await cache.load(`saves/profiles/local.dev.json`);
        let changed = false;
        if (!profile) {
            changed = true;
            profile = { "provider": "local", "id": "dev", displayName: "Developer" };
        }
        for (setting in settingsTemplate) {
            if (profile[setting] === undefined) {
                profile[setting] = settingsTemplate[setting];
                changed = true;
            }
        }
        if (changed)
            cache.save(`saves/profiles/local.dev.json`, profile);
    } else if (user) {
        profile = await cache.load(`saves/profiles/${user}.json`);
    }
    return profile;
};

app.post('/chat', async function (req, res) {
  const body = req.body.body;
  const local = (req.ip == "::1" || req.ip == "127.0.0.1");
    var profile = await getProfile(req.user);
    if (profile) {
        chat.sendChat(profile, body, local);
    }
    res.set('Content-Type', 'text/plain');
    res.send(`chat received: ${body}`);
});

app.get('/chat', async function (req, res) {
  var profile = await getProfile(req.user);
  const messages = chat.getChats(profile);
  
  res.set('Content-Type', 'Application/JSON');
  res.send(JSON.stringify(messages));
});

app.get('/', async function (req, res) {
    if (!google_oauth_config) { req.user = 'local.dev' };
    let path = (req.user ? 'hidden assets/home.html' : 'assets/home.html');
    req.session.nsfw = req.query.nsfw;
    let homepage = await new Promise(function (resolve, reject) {

        fs.readFile(path, { encoding: 'utf8' }, (err, data) => {
            if (err) {
                console.log(err);
                resolve('500');
            } else {
                resolve(data);
            }
        });
    });
    res.status(homepage === '500' ? 500 : 200).send(homepage);
});

app.post('/act', async function (req, res) {
    var profile = await getProfile(req.user);
	const body = req.body.body;
    console.log("Query:" + JSON.stringify(req.query));
	const view = await game.act(profile, body, req.query);
    view.profile = {};
	for (setting in settingsTemplate) {
        view.profile[setting] = profile[setting];
    }
	res.set('Content-Type', 'Application/JSON');
	res.send(JSON.stringify(view));
});

app.get('/list', async function (req, res) {
    var profile = await getProfile(req.user);
    let saveList = await game.list(profile);
    res.set('Content-Type', 'Application/JSON');
    res.send(JSON.stringify(saveList));
});

app.post('/set', async function (req, res) {    
    var profile = await getProfile(req.user);
	const body = req.body.body;
    
    console.log("Got request to set settings:");
    console.log(JSON.stringify(req.body));
    let viewProfile = {};
    for (setting in settingsTemplate) {
        if (body[setting] !== undefined)
            profile[setting] = body[setting];
        viewProfile[setting] = profile[setting];
    }
    
    let profilePath = `saves/profiles/${profile.provider}.${profile.id}.json`;
    cache.save(profilePath, profile);
	res.set('Content-Type', 'Application/JSON');
	res.send(JSON.stringify(viewProfile));
});

app.listen(port, () => console.log(`Redscale is listening on port ${port}!`));
