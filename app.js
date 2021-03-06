// vendor libraries
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var ejs = require('ejs');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var exec = require('child_process').exec;
var SamsungRemote = require('samsung-remote');
var remote = new SamsungRemote({
    ip: '192.168.1.145' // required: IP address of your Samsung Smart TV
});

// custom libraries
// routes
var route = require('./routes/route');
// model
var Model = require('./models/user');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

passport.use(new LocalStrategy(function (username, password, done) {
    new Model.User({username: username}).fetch().then(function (data) {
        var user = data;
        if (user === null) {
            return done(null, false, {message: 'Invalid username or password'});
        } else {
            user = data.toJSON();
            if (!bcrypt.compareSync(password, user.password)) {
                return done(null, false, {message: 'Invalid username or password'});
            } else {
                return done(null, user);
            }
        }
    });
}));

passport.serializeUser(function (user, done) {
    done(null, user.username);
});

passport.deserializeUser(function (username, done) {
    new Model.User({username: username}).fetch().then(function (user) {
        done(null, user);
    });
});

app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(bodyParser());
app.use(session({secret: 'secret strategic xxzzz code'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// GET
app.get('/', route.index);

// signin
// GET
app.get('/signin', route.signIn);
// POST
app.post('/signin', route.signInPost);

// signup
// GET
app.get('/signup', route.signUp);
// POST
app.post('/signup', route.signUpPost);

// logout
// GET
app.get('/signout', route.signOut);

/********************************/

/********************************/
// 404 not found
app.use(route.notFound404);

server.listen(app.get('port'), function () {
    var message = 'Server is running @ http://localhost:' + server.address().port;
    console.log(message);
});

var cookerInUse = false;
var curtainOpen = true;
var curtainInUse = false;

io.on('connection', function (socket) {

    // when the client emits 'new message', this listens and executes
    socket.on('request', function (data) {
        // we tell the client to execute 'new message'
        console.log(data);

        var number = parseInt(data.command, 10);
        console.log(number);

        // LIGHTS ----------------------------------------------
        if (data.command == 'bureaulamp aan') {
            kaku('zzxyz', '20484', 'on');
            socket.emit('message', {
                message: 'Bureaulamp staat nu aan!'
            });
        }

        if (data.command == 'bureaulamp uit') {
            kaku('zzxyz', '20484', 'off');
            socket.emit('message', {
                message: 'Bureaulamp staat nu uit!'
            });
        }

        if (data.command == 'nachtlamp aan') {
            kaku('C', '1', 'on');
            socket.emit('message', {
                message: 'Nachtlamp staat nu aan!'
            });
        }

        if (data.command == 'nachtlamp uit') {
            kaku('C', '1', 'off');
            socket.emit('message', {
                message: 'Nachtlamp staat nu uit!'
            });
        }

        if (data.command == 'bedlamp aan') {
            kaku('M', '14', 'on');
            socket.emit('message', {
                message: 'Bedlamp staat nu aan!'
            });
        }

        if (data.command == 'bedlamp uit') {
            kaku('M', '14', 'off');
            socket.emit('message', {
                message: 'Bedlamp staat nu uit!'
            });
        }

        if (data.command == 'tv lamp aan' || data.command == 'tv licht aan') {
            kaku('M', '16', 'on');
            socket.emit('message', {
                message: 'Tv meubel lamp staat nu aan!'
            });
        }

        if (data.command == 'tv lamp uit' || data.command == 'tv licht uit') {
            kaku('M', '16', 'off');
            socket.emit('message', {
                message: 'Tv meubel lamp staat nu uit!'
            });
        }

        if (data.command == 'alle lichten aan' || data.command == 'alle lampen aan') {

            kaku('C', '1', 'on');

            setTimeout(function () {
                kaku('M', '14', 'on');
            }, 1250);

            setTimeout(function () {
                kaku('M', '16', 'on');
            }, 2500);

            setTimeout(function () {
                kaku('zzxyz', '20484', 'on');
            }, 3750);

            socket.emit('message', {
                message: 'Alle lichten worden aan gezet!'
            });
        }

        if (data.command == 'alle lichten uit' || data.command == 'alle lampen uit') {

            kaku('C', '1', 'off');

            setTimeout(function () {
                kaku('M', '14', 'off');
            }, 1250);

            setTimeout(function () {
                kaku('M', '16', 'off');
            }, 2500);

            setTimeout(function () {
                kaku('zzxyz', '20484', 'off');
            }, 3750);

            socket.emit('message', {
                message: 'Alle lichten worden uit gezet!'
            });
        }



        // FAN -------------------------------------------------
        if (data.command == 'ventilator aan') {
            kaku('C', '3', 'on');
            socket.emit('message', {
                message: 'Ventilator staat nu aan!'
            });
        }

        if (data.command == 'ventilator uit') {
            kaku('C', '3', 'off');
            socket.emit('message', {
                message: 'Ventilator staat nu uit!'
            });
        }

        // RADIO -----------------------------------------------
        //if (data.command == 'radio aan') {
        //    kaku('D', '2', 'on');
        //    socket.emit('message', {
        //        message: 'Radio has been turned on'
        //    });
        //}
        //
        //if (data.command == 'radio uit') {
        //    kaku('D', '2', 'off');
        //    socket.emit('message', {
        //        message: 'Radio is now turned off'
        //    });
        //}

        // CURTAIN - (DEPRICATED) ------------------------------
        if (data.command == 'gordijn open') {
            if (!curtainInUse) {
                if (!curtainOpen) {
                    // Code that is executed after timer
                    setTimeout(function () {
                        curtainInUse = false;
                        curtainOpen = true;
                        socket.emit('message', {
                            message: 'Curtain is now open!'
                        });
                    }, 38 * 1000);
                    //code that will be executed immediately
                    curtainInUse = true;
                    exec('sudo python scripts/omhoog.py', function (error, stdout, stderr) {
                        if (stdout !== null) {
                            console.log('stdout: ' + stdout);
                        }
                        if (stderr !== null) {
                            console.log('stderr: ' + stderr);
                        }
                        if (error !== null) {
                            console.log('exec error: ' + error);
                        }
                    });
                    socket.emit('message', {
                        message: 'Curtain is being opened!'
                    });
                    // curtainOpen Check
                } else {
                    socket.emit('message', {
                        message: 'Curtain is already open!'
                    });
                }
                // Curtain in use check
            } else {
                socket.emit('message', {
                    message: 'Curtain is already in use!'
                });
            }
        }
        if (data.command == 'gordijn dicht') {
            if (!curtainInUse) {
                if (curtainOpen) {
                    // Code that is executed after timer
                    setTimeout(function () {
                        curtainInUse = false;
                        curtainOpen = false;
                        socket.emit('message', {
                            message: 'Curtain has been closed!'
                        });
                    }, 38 * 1000);
                    //code that will be executed immediately
                    curtainInUse = true;
                    exec('sudo python scripts/omlaag.py', function (error, stdout, stderr) {
                        if (stdout !== null) {
                            console.log('stdout: ' + stdout);
                        }
                        if (stderr !== null) {
                            console.log('stderr: ' + stderr);
                        }
                        if (error !== null) {
                            console.log('exec error: ' + error);
                        }
                    });
                    socket.emit('message', {
                        message: 'Curtain is being closed'
                    });
                // curtainOpen Check
                } else {
                    socket.emit('message', {
                        message: 'Curtain has been closed!'
                    });
                }
            // Curtain in use check
            } else {
                socket.emit('message', {
                    message: 'Curtain is already in use!'
                });
            }
        }

        // TV --------------------------------------------------
        if (data.command == 'tv volume omhoog') {
            rem('KEY_VOLUP');
        }

        if (data.command == 'tv volume omlaag') {
            rem('KEY_VOLDOWN');
        }

        if (data.command == 'tv volume 10 omhoog') {
            for (i = 0; i < 10; i++) {
                setTimeout(function () {
                    rem('KEY_VOLUP');
                }, 300 * i);
            }
        }

        if (data.command == 'tv volume 10 omlaag') {
            for (i = 0; i < 10; i++) {
                setTimeout(function () {
                    rem('KEY_VOLDOWN');
                }, 300 * i);
            }
        }

        if (data.command == 'tv hdmi') {
            rem('KEY_HDMI');
        }

        if (data.command == 'tv slaap') {
            rem('KEY_SLEEP');
        }

        if (data.command == 'tv thuis') {
            rem('KEY_HOME');
        }

        if (data.command == 'tv enter') {
            rem('KEY_ENTER');
        }

        if (data.command == 'tv rechts') {
            rem('KEY_RIGHT');
        }

        if (data.command == 'tv links') {
            rem('KEY_LEFT');
        }

        if (data.command == 'tv boven') {
            rem('KEY_UP');
        }

        if (data.command == 'tv beneden') {
            rem('KEY_DOWN');
        }

        if (data.command == 'tv menu') {
            rem('KEY_MENU');
        }

        if (data.command == 'tv terug') {
            rem('KEY_RETURN');
        }

        if (data.command == 'tv smart') {
            rem('KEY_CONTENTS');
        }

        if (data.command == 'tv pauze') {
            rem('KEY_PAUSE');
        }

        if (data.command == 'tv play') {
            rem('KEY_PLAY');
        }

        if (data.command == 'tv afspelen') {
            rem('KEY_PLAY');
        }

        // PLAYSTATION -----------------------------------------

        if (data.command == 'playstation') {
            exec('sudo ps4-waker', function (error, stdout, stderr) {
                if (stdout !== null) {
                    console.log('stdout: ' + stdout);
                }
                if (stderr !== null) {
                    console.log('stderr: ' + stderr);
                }
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });
        }

        // WATER COOKER ----------------------------------------
        if (data.command == 'kook water') {
            if (!cookerInUse) {
                cookerInUse = true;
                //console.log(cookerInUse);
                kaku('M', '15', 'on');
                setTimeout(function () {
                    kaku('M', '15', 'off');
                    cookerInUse = false;
                    socket.emit('message', {
                        message: 'Water heeft gekookt!'
                    });
                }, 18 * 10000);
                console.log('started cooking water');
                socket.emit('message', {
                    message: 'In 3 minutes the water will be done cooking'
                });
            } else {
                console.log('Waterkoker is al in gebruik!');
                socket.emit('message', {
                    message: 'Water wordt al gekookt!'
                });
            }
        }
    });

});

var kaku = function (channel1, channel2, status) {
    var command = 'kaku ' + channel1 + ' ' + channel2 + ' ' + status;
    exec(command, function (error, stdout, stderr) {
        if (stdout !== null) {
            console.log('stdout: ' + stdout);
        }
        if (stderr !== null) {
            console.log('stderr: ' + stderr);
        }
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
}

var rem = function (key) {
    remote.send(key, function callback(err) {
        if (err) {
            throw new Error(err);
        } else {
            // command has been successfully transmitted to your tv
        }
    });
}