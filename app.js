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
    ip: '192.168.188.130' // required: IP address of your Samsung Smart TV
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

io.on('connection', function (socket) {

    // when the client emits 'new message', this listens and executes
    socket.on('request', function (data) {
        // we tell the client to execute 'new message'
        console.log(data);


        // LIGHTS ----------------------------------------------
        if (data.command == 'nachtlamp aan') {
            kaku('C', '1', 'on');
        }

        if (data.command == 'nachtlamp uit') {
            kaku('C', '1', 'off');
        }

        // VENT ------------------------------------------------
        if (data.command == 'ventilator aan') {
            kaku('C', '3', 'on');
        }

        if (data.command == 'ventilator uit') {
            kaku('C', '3', 'off');
        }

        // TV --------------------------------------------------
        if (data.command == 'tv hdmi') {
            rem('KEY_HDMI');
        }

        if (data.command == 'tv slaap') {
            rem('KEY_SLEEP');
        }

        if (data.command == 'tv slaap') {
            rem('KEY_HOME');
        }

        if (data.command == 'tv thuis') {
            rem('KEY_HOME');
        }

        if (data.command == 'tv enter') {
            rem('KEY_ENTER');
        }

        if (data.command == 'tv naar rechts') {
            rem('KEY_RIGHT');
        }

        if (data.command == 'tv naar links') {
            rem('KEY_LEFT');
        }

        if (data.command == 'tv naar boven') {
            rem('KEY_UP');
        }

        if (data.command == 'tv naar beneden') {
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

        // WATER COOKER ----------------------------------------
        if (data.command == 'kook water') {
            if (!cookerInUse) {
                cookerInUse = true;
                //console.log(cookerInUse);
                kaku('C', '2', 'on');
                setTimeout(function () {
                    kaku('C', '2', 'off');
                    cookerInUse = false;
                }, 6 * 10000);
            } else {
                console.log('Cooker is already in use!');
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