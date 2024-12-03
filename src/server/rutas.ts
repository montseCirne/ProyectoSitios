import { Express } from "express";
import passport from "passport";
import { isAuthenticated } from "./auth/passport_config"; // Importar isAuthenticated para proteger las rutas

// Aquí registrarás las rutas del formulario de login, registro, etc.
export function registerFormRoutesUser(app: Express) {
  // Ruta para el formulario de login
  app.get("/login", (req, res) => {
    res.render("login");
  });

  // Ruta para procesar el login
  app.post("/login", passport.authenticate("local", {
    successRedirect: "/dashboard", // Redirigir al dashboard después de un login exitoso
    failureRedirect: "/login", // Redirigir al login si falla
    failureFlash: true
  }));

  // Ruta para el dashboard, solo accesible para usuarios autenticados
  app.get("/dashboard", isAuthenticated, (req, res) => {
    res.render("menuUser", { user: req.user });
  });
}
