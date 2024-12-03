import express, { Response, NextFunction } from 'express';
import passport from 'passport';
import { AuthStore } from './auth/orm_auth_store';
import { AuthenticatedRequest } from './auth/auth_types'; // Asegúrate de importar tu tipo personalizado

const router = express.Router();
const authStore = new AuthStore();

// Middleware para verificar roles
function verificarRol(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.isAuthenticated() && req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).render('unauthorized');
    }
  };
}

// Ruta de inicio
router.get('/', (req, res) => {
  res.render('login');
});

// Ruta de autenticación
router.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/',
    failureFlash: true,
  }),
  (req: AuthenticatedRequest, res) => {
    const role = req.user?.role;
    if (role === 'mesero') res.redirect('/menuMesero');
    else if (role === 'cocinero') res.redirect('/menuCocinero');
    else if (role === 'administrador') res.redirect('/menuAdmin');
    else res.redirect('/menuUser');
  }
);

// Ruta para cerrar sesión
router.get('/logout', (req: AuthenticatedRequest, res) => {
  req.logout((err) => {
    if (err) return res.status(500).send('Error al cerrar sesión');
    res.redirect('/');
  });
});

export default router;
