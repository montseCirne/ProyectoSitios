import { Express } from "express";
import passport from "passport";
import { isAuthenticated, authorize } from "./auth/passport_config"; // Importar isAuthenticated y authorize para proteger rutas

function obtenerRol(req: any): string | undefined {
  return req.user ? req.user.rol : undefined;
}

export function registerFormRoutesUser(app: Express) {
  // Ruta para el formulario de login
  app.get("/login", (req, res) => {
    res.render("login");
  });

  // Ruta para procesar el login
  app.post("/login", passport.authenticate("local", {
    successRedirect: "/redirect",  // Redirige a la ruta '/redirect' después del login exitoso
    failureRedirect: "/login",     // Redirige al login si falla
    failureFlash: true
  }));

  // Ruta para redirigir según el rol del usuario
  app.get("/redirect", (req, res) => {
    const rol = obtenerRol(req);  // Obtener el rol del usuario autenticado
    if (rol) {
      // Redirige según el rol del usuario
      switch (rol) {
        case 'administrador':
          res.redirect('/admin');
          break;
        case 'mesero':
          res.redirect('/mesero');
          break;
        case 'cocinero':
          res.redirect('/cocinero');
          break;
        default:
          res.redirect('/login');  // Si no tiene rol o hay un error
      }
    } else {
      res.redirect('/login');  // Si no hay usuario autenticado
    }
  });

  // Rutas para los menús, accesibles solo para usuarios autenticados y con el rol adecuado

  // Admin - Acceso a todas las mesas, comandas, y creación de usuarios
  app.get("/admin", isAuthenticated, authorize('administrador'), (req, res) => {
    res.render("menuAdmin", { user: req.user });
  });

  // Admin - Crear usuario
  app.post("/admin/crearUsuario", isAuthenticated, authorize('administrador'), (req, res) => {
    // Aquí iría la lógica para crear usuarios
    const { nombre, correo, contraseña, rol } = req.body;
    // Llama a la función para crear el usuario en la base de datos
    res.redirect("/admin");
  });

  // Mesero - Acceso a las mesas y comandas
  app.get("/mesero", isAuthenticated, authorize('mesero'), (req, res) => {
    res.render("menuMesero", { user: req.user });
  });

  // Mesero - Registrar comanda
  app.post("/mesero/registrarComanda", isAuthenticated, authorize('mesero'), (req, res) => {
    const { idMesa, platillos, bebidas, notas } = req.body;
    // Llama a la función para crear la comanda en la base de datos
    res.redirect("/mesero");
  });

  // Cocinero - Ver comandas y cambiar estado
  app.get("/cocinero", isAuthenticated, authorize('cocinero'), (req, res) => {
    res.render("menuCocinero", { user: req.user });
  });

  // Cocinero - Editar estado de la comanda
  app.post("/cocinero/editarComanda", isAuthenticated, authorize('cocinero'), (req, res) => {
    const { idComanda, estado } = req.body;
    // Llama a la función para actualizar el estado de la comanda en la base de datos
    res.redirect("/cocinero");
  });

}
