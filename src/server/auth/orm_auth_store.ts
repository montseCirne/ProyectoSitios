import { Sequelize, DataTypes } from 'sequelize';

// Configuración de la base de datos
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'restaurante.bd'
});

// Modelo de Usuario
export const Usuario = sequelize.define('Usuario', {
  nombre: DataTypes.STRING,
  correo: DataTypes.STRING,
  contraseña: DataTypes.STRING,
  rol: DataTypes.STRING // mesero, cocinero, administrador
});

// Modelo de Mesa
export const Mesa = sequelize.define('Mesa', {
  numero: DataTypes.INTEGER,
  estado: DataTypes.STRING // disponible, ocupada
});

// Modelo de Comanda
export const Comanda = sequelize.define('Comanda', {
  idMesa: {
    type: DataTypes.INTEGER,
    references: {
      model: Mesa,
      key: 'id'
    }
  },
  platillos: DataTypes.STRING,
  bebidas: DataTypes.STRING,
  notas: DataTypes.STRING,
  estado: DataTypes.STRING // pendiente, en preparación, listo
});
