import { createServer } from "http";
import express, { Express } from "express";
import httpProxy from "http-proxy";
import helmet from "helmet";
import path from 'path';

const port = 5000;
const expressApp: Express = express();
const proxy = httpProxy.createProxyServer({
    target: "http://localhost:5100", ws: true
});

expressApp.use(express.urlencoded({ extended: true }));
//express busca  archivos de plantilla en esa carpeta
expressApp.set("views", "templates/server");
//se usa el motor de plantillas "handlebars"
expressApp.set("view engine", "handlebars");

expressApp.use(helmet());
expressApp.use(express.json());
// Configura express-session
expressApp.use(express.static("static"));
//static file
expressApp.use(express.static('src/client'));
expressApp.get('/src/client/reserve.js', (req, res) => {//tipos MIME
    res.type('application/javascript');
    res.sendFile(path.join(__dirname, 'src/client/reserve.js'));
});
//scripts externos
expressApp.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "script-src 'self';"
    );
    next();
});

expressApp.use(express.static("node_modules/bootstrap/dist"));
//use agrega middleware redirige req a la url de target, no Sockets
expressApp.use("^/$", (req, resp) => resp.redirect("/loggin"));
expressApp.use((req, resp) => proxy.web(req, resp));
const server = createServer(expressApp);
//se activa una req de upgrade, redirecciona a webSockets
server.on('upgrade', (req, socket, head) => proxy.ws(req, socket, head));
server.listen(port, () => console.log(`HTTP Server listening on http://localhost:${port}`));