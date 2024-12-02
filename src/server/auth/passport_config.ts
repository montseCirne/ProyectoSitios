import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { AuthStore } from "./auth_types";
import { UsuarioModel } from "./orm_auth_models";

type Config = {
  jwt_secret: string;
  store: AuthStore;
};

export const configurePassport = (config: Config) => {
  // Estrategia local para autenticación con usuario y contraseña
  passport.use(
    new LocalStrategy(
      {
        usernameField: "correo", // Campo que se usará como "username"
        passwordField: "contraseña", // Campo para la contraseña
      },
      async (correo, contraseña, done) => {
        try {
          // Busca el usuario por correo
          const usuario = await UsuarioModel.findOne({ where: { correo } });
          if (!usuario) {
            return done(null, false, { message: "Usuario no encontrado" });
          }
          
          // Retorna el usuario autenticado
          return done(null, {
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol,
          });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialización del usuario en la sesión
  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  // Deserialización del usuario desde la sesión
  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });
};

// Middleware para verificar si un usuario está autenticado
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "No autenticado" });
}

// Middleware para verificar roles
export function authorize(role: "mesero" | "cocinero" | "administrador") {
  return (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.rol === role) {
      return next();
    }
    res.status(403).json({ error: "No autorizado" });
  };
}


// Ejemplo de uso en rutas
/*
import express from 'express';
import { isAuthenticated, authorize } from './passport_config';

const app = express();

app.post('/login', passport.authenticate('local', { 
  successRedirect: '/dashboard', 
  failureRedirect: '/login',
  failureMessage: true 
}));

app.get('/admin', isAuthenticated, authorize('administrador'), (req, res) => {
  res.send('Bienvenido al panel de administración');
});

app.get('/mesero', isAuthenticated, authorize('mesero'), (req, res) => {
  res.send('Zona de meseros');
});
*/
