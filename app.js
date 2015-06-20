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
    socket.on('new message', function (data) {
        // we tell the client to execute 'new message'
        console.log(data);

        if (data == 'nachtlamp aan') {
            kaku('C', '1', 'on');
        }

        if (data == 'nachtlamp uit') {
            kaku('C', '1', 'off');
        }

        if (data == 'kook water') {
            if (!cookerInUse) {
                kaku('C', '2', 'on');
                setTimeout(function () {
                    kaku('C', '2', 'off');
                    cookerInUse = false;
                }, 1 * 10000);
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