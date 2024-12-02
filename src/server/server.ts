import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import passport from 'passport';
import session from 'express-session';

const app = express();
const port = process.env.PORT || 3000;

// Configuración de la vista (Handlebars)
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'handlebars');

// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'static')));

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
}));

// Inicialización de Passport
app.use(passport.initialize());
app.use(passport.session());


// Sin sesión de usuario redirige al login
app.get('*', (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth/login');
    }
    next();
});

// Arranque del servidor
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
