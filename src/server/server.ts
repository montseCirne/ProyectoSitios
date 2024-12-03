import { createServer } from "http";
import express, { Express } from "express";
import httpProxy from "http-proxy";
import helmet from "helmet";
import { engine } from "express-handlebars";
import passport from "passport";
import session from "express-session";
import path from "path";
import { isAuthenticated, authorize } from "./auth/passport_config"; // Importar la autenticación y roles
import { registerFormRoutesUser } from "./rutas"; // Suponiendo que las rutas de usuario se manejan aquí
import { sequelize } from './auth/orm_auth_store';

sequelize.sync({ force: false }).then(() => {
    console.log('Base de datos sincronizada');
}).catch((err) => {
    console.error('Error al sincronizar la base de datos:', err);
});
const port = 5000;
const expressApp: Express = express();

// Configuración del proxy
const proxy = httpProxy.createProxyServer({
    target: "http://localhost:5100", ws: true,  // Redirigir solicitudes WebSocket
});

// Middleware para manejo de datos
expressApp.use(express.urlencoded({ extended: true }));
expressApp.use(express.json());

// Configurar el motor de plantillas Handlebars
expressApp.set("views", path.join(__dirname, "../../templates/server"));
expressApp.engine("handlebars", engine());
expressApp.set("view engine", "handlebars");

// Seguridad: proteger la aplicación con Helmet
expressApp.use(helmet());

// Configurar sesiones y Passport para la autenticación
expressApp.use(session({
    secret: "your_secret_key", // Cambiar en producción
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 } // Desactivar secure en desarrollo
}));

expressApp.use(passport.initialize());
expressApp.use(passport.session());

// Rutas para formularios de usuario (registrar, login, etc.)
registerFormRoutesUser(expressApp);

// Servir archivos estáticos como CSS y JS desde la carpeta "static"
expressApp.use(express.static(path.join(__dirname, "../../static")));

// Rutas específicas para servir archivos CSS y JS
expressApp.get('/static/styles.css', (req, res) => {
    res.type('application/css');
    res.sendFile(path.join(__dirname, "../../static/styles.css"));
});

expressApp.use(express.static(path.join(__dirname, "../../src/client")));
expressApp.get('/src/client/client.js', (req, res) => {
    res.type('application/javascript');
    res.sendFile(path.join(__dirname, "../../src/client/client.js"));
});

// Política de seguridad de contenido (CSP)
expressApp.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "script-src 'self' https://cdn.jsdelivr.net;");
    next();
});

// Servir Bootstrap desde node_modules
expressApp.use(express.static(path.join(__dirname, "../../node_modules/bootstrap/dist")));

// Redirigir la raíz a la página de login
expressApp.get("^/$", (req, res) => res.redirect("/login"));

// Configurar rutas de usuario según los roles
expressApp.get("/admin", isAuthenticated, authorize("administrador"), (req, res) => {
    res.render("menuAdmin");
});
expressApp.get("/cocinero", isAuthenticated, authorize("cocinero"), (req, res) => {
    res.render("menuCocinero");
});
expressApp.get("/mesero", isAuthenticated, authorize("mesero"), (req, res) => {
    res.render("menuMesero");
});

// Configuración del proxy para todas las demás solicitudes
expressApp.use((req, res) => {
    proxy.web(req, res);
});

// Configuración de WebSocket
const server = createServer(expressApp);
server.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head);  // Redirigir solicitudes de WebSocket
});

// Iniciar el servidor en el puerto 5000
server.listen(port, () => {
    console.log(`HTTP Server listening on http://localhost:${port}`);
});
