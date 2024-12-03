import { Router } from 'express';
import { isAuthenticated } from './auth/passport_config';  // Middleware de autenticación
import { authorize } from './auth/passport_config'; // Middleware de autorización basado en rol
import { Usuario } from './auth/auth_types';  // Importando la interfaz Usuario

const router = Router();

// Redirigir a login si no está autenticado
router.get("^/$", (req, res) => {
  if (req.isAuthenticated()) {
    const usuario = req.user as Usuario;
    // Si el usuario está autenticado, redirigir a su dashboard según su rol
    switch (usuario.rol) {
      case 'administrador':
        res.redirect('/admin');
        break;
      case 'cocinero':
        res.redirect('/cocinero');
        break;
      case 'mesero':
        res.redirect('/mesero');
        break;
      default:
        res.redirect('/login');  // Si el rol no está definido, redirigir al login
    }
  } else {
    res.redirect('/login');  // Si no está autenticado, redirigir al login
  }
});

// Ruta para el login
router.get('/login', (req, res) => {
  res.render('login');  // Asegúrate de tener una vista de login en tu carpeta de plantillas
});

// Ruta para el Dashboard (únicamente accesible para usuarios autenticados)
router.get('/dashboard', isAuthenticated, (req, res) => {
  const usuario = req.user as Usuario;

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
      res.redirect('/unauthorized');  // Redirigir a página de no autorizado si el rol no es válido
  }
});

// Rutas específicas de Administrador (solo accesible por administradores)
router.get('/admin', isAuthenticated, authorize('administrador'), (req, res) => {
  res.render('menuAdmin'); // Página para administradores
});

// Rutas específicas de Cocinero (solo accesible por cocineros)
router.get('/cocinero', isAuthenticated, authorize('cocinero'), (req, res) => {
  res.render('menuCocinero'); // Página para cocineros
});

// Rutas específicas de Mesero (solo accesible por meseros)
router.get('/mesero', isAuthenticated, authorize('mesero'), (req, res) => {
  res.render('menuMesero'); // Página para meseros
});

export default router;
