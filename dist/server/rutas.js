"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// rutas.ts
const express_1 = require("express");
const passport_config_1 = require("./auth/passport_config"); // Middleware de autenticación
const passport_config_2 = require("./auth/passport_config"); // Middleware de autorización basado en rol
const router = (0, express_1.Router)();
// Ruta para el Dashboard (únicamente accesible para usuarios autenticados)
router.get('/login', passport_config_1.isAuthenticated, (req, res) => {
    const usuario = req.user;
    // Redirigir a la vista correspondiente según el rol
    switch (usuario.rol) {
        case 'administrador':
            res.render('menuAdmin', { usuario });
            break;
        case 'cocinero':
            res.render('menuCocinero', { usuario });
            break;
        case 'mesero':
            res.render('menuMesero', { usuario });
            break;
        default:
            res.redirect('unauthorized'); // Redirigir a login si no tiene rol definido
    }
});
// Rutas específicas de Administrador (solo accesible por administradores)
router.get('/admin', passport_config_1.isAuthenticated, (0, passport_config_2.authorize)('administrador'), (req, res) => {
    res.render('menuAdmin'); // Página para administradores
});
// Rutas específicas de Cocinero (solo accesible por cocineros)
router.get('/cocinero', passport_config_1.isAuthenticated, (0, passport_config_2.authorize)('cocinero'), (req, res) => {
    res.render('menuCocinero'); // Página para cocineros
});
// Rutas específicas de Mesero (solo accesible por meseros)
router.get('/mesero', passport_config_1.isAuthenticated, (0, passport_config_2.authorize)('mesero'), (req, res) => {
    res.render('menuMesero'); // Página para meseros
});
exports.default = router;
