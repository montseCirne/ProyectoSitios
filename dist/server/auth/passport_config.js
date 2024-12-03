"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = isAuthenticated;
exports.authorize = authorize;
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const bcrypt_1 = __importDefault(require("bcrypt"));
const orm_auth_models_1 = require("./orm_auth_models");
passport_1.default.use(new passport_local_1.Strategy({
    usernameField: 'correo',
    passwordField: 'contraseña',
}, async (correo, contraseña, done) => {
    try {
        const usuario = await orm_auth_models_1.UsuarioModel.findOne({ where: { correo } });
        if (!usuario) {
            return done(null, false, { message: 'Usuario no encontrado' });
        }
        const isValid = await bcrypt_1.default.compare(contraseña, usuario.contraseña);
        if (!isValid) {
            return done(null, false, { message: 'Contraseña incorrecta' });
        }
        return done(null, {
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            role: usuario.role,
        });
    }
    catch (error) {
        return done(error);
    }
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser((user, done) => {
    done(null, user);
});
// Middleware para verificar autenticación
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'No autenticado' });
}
// Middleware para verificar roles
function authorize(role) {
    return (req, res, next) => {
        if (req.isAuthenticated() && req.user.role === role) {
            return next();
        }
        res.status(403).json({ error: 'No autorizado' });
    };
}
