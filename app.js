/**
 * Module dependencies.
 */
var express = require('express');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var favicon = require('serve-favicon');
var session = require('express-session');
var bodyParser = require('body-parser');
var logger = require('morgan');
var errorHandler = require('errorhandler');
// var lusca = require('lusca');
var methodOverride = require('method-override');

var _ = require('lodash');
var MongoStore = require('connect-mongo')(session);
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var assets = require('connect-assets');


/**
 * Controllers (route handlers).
 */
var indexController = require('./controllers/index');
var homeController = require('./controllers/home');
var userController = require('./controllers/user');
var projectsController = require('./controllers/projects');
var membersController = require('./controllers/members');


/**
 * API keys and Passport configuration.
 */
var secrets = require('./config/secrets');
var passportConf = require('./config/passport');


/**
 * Create Express server.
 */
var app = express();


/**
 * Connect to MongoDB.
 */
mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
});


/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(compress());
app.use(assets({
  paths: ['public/css', 'public/js']
}));
app.use(logger('dev'));
app.use(favicon(path.join(__dirname, 'public/img/favicon.png')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secrets.sessionSecret,
  store: new MongoStore({ url: secrets.db, autoReconnect: true })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// app.use(lusca({
//   csrf: true,
//   xframe: 'SAMEORIGIN',
//   xssProtection: true
// }));
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});
app.use(function(req, res, next) {
  if (/api/i.test(req.path)) req.session.returnTo = req.path;
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));


/**
 * App Routes: Index page.
 */
app.get('/', indexController.index);
// app.post('/emailtest', indexController.getemailtest);
// app.get('/explore/core', homeController.getCore);
// app.get('/explore/advisors', homeController.getAdvisors);


/**
 * App Routes: Home and Explore Pages
 */
app.get('/home', indexController.index);
// app.get('/explore/members', membersController.getMembers);
// app.get('/explore/members/:memberID', membersController.getSoloMember);
// app.get('/explore/projects', projectsController.getProjects);
// app.get('/explore/projects/:projectID', projectsController.getSoloProject);


/**
 * App Routes: Account Pages
 */
// app.get('/account', passportConf.isAuthenticated, userController.getAccount);
// app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
// app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);
// app.get('/logout', userController.logout);


/**
 * App Routes: Account Project Pages
 */
// app.get('/account/projects', passportConf.isAuthenticated, userController.getProjects);
// app.get('/account/projects/new', passportConf.isAuthenticated, userController.getNewProject);
// app.post('/account/projects/new', passportConf.isAuthenticated, userController.postNewProject);
// app.get('/account/projects/:projectID', passportConf.isAuthenticated, userController.getSoloProject);


/**
 * OAuth authentication routes. (Sign in with Github)
 */
// app.get('/auth/github', passport.authenticate('github'));
// app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), function(req, res) {
//   res.redirect(req.session.returnTo || '/home');
// });


/**
 * Error Handler.
 */
app.use(errorHandler());


/**
 * Start Express server.
 */
app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;