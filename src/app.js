const path = require('path');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');

const siteRoutes = require('./routes/site');
const adminRoutes = require('./routes/admin');
const { formatDisplayViews } = require('./utils/displayViews');
const { truncate } = require('./utils/text');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.locals.formatViews = formatDisplayViews;
app.locals.truncate = truncate;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8h
  })
);
app.use(flash());

app.use('/admin', adminRoutes);
app.use('/', siteRoutes);

app.use((req, res) => {
  res.status(404).render('site/404', { categories: [], siteConfig: {} });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
});

module.exports = app;
