import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { UsuarioModel } from './orm_auth_models';

passport.use(
  new LocalStrategy(
    {
      usernameField: 'correo',
      passwordField: 'contraseña',
    },
    async (correo, contraseña, done) => {
      try {
        const usuario = await UsuarioModel.findOne({ where: { correo } });
        if (!usuario) {
          return done(null, false, { message: 'Usuario no encontrado' });
        }

        const isValid = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!isValid) {
          return done(null, false, { message: 'Contraseña incorrecta' });
        }

        return done(null, {
          id: usuario.id,
          nombre: usuario.nombre,
          correo: usuario.correo,
          role: usuario.role,
        });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

// Middleware para verificar autenticación
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'No autenticado' });
}

// Middleware para verificar roles
export function authorize(role: 'mesero' | 'cocinero' | 'administrador') {
  return (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    }
    res.status(403).json({ error: 'No autorizado' });
  };
}