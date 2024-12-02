import { Sequelize, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';

// Configuración de la base de datos
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'restaurante.bd',
});

// Modelo de Usuario
export const Usuario = sequelize.define('Usuario', {
  nombre: DataTypes.STRING,
  correo: DataTypes.STRING,
  contraseña: DataTypes.STRING,
  rol: DataTypes.STRING, // mesero, cocinero, administrador
});

// Modelo de Mesa
export const Mesa = sequelize.define('Mesa', {
  numero: DataTypes.INTEGER,
  estado: DataTypes.STRING, // disponible, ocupada
});

// Modelo de Comanda
export const Comanda = sequelize.define('Comanda', {
  idMesa: {
    type: DataTypes.INTEGER,
    references: {
      model: Mesa,
      key: 'id',
    },
  },
  platillos: DataTypes.STRING,
  bebidas: DataTypes.STRING,
  notas: DataTypes.STRING,
  estado: DataTypes.STRING, // pendiente, en preparación, listo
});

export class AuthStore {
  // Método para almacenar o actualizar un usuario
  async storeOrUpdateUser(
    nombre: string,
    correo: string,
    contraseña: string,
    rol: 'mesero' | 'cocinero' | 'administrador'
  ): Promise<void> {
    const hashedPassword = await bcrypt.hash(contraseña, 10); // Encriptar contraseña
    await Usuario.upsert({
      nombre,
      correo,
      contraseña: hashedPassword,
      rol,
    });
  }

  // Método para almacenar o actualizar una mesa
  async storeOrUpdateTable(numero: number, estado: 'disponible' | 'ocupada'): Promise<void> {
    await Mesa.upsert({ numero, estado });
  }

  // Inicializar la base de datos con datos por defecto
  async initModelAndDatabase(): Promise<void> {
    // Eliminar los datos anteriores, pero no las tablas
    await sequelize.truncate({ cascade: true });

    // Agregar usuarios por defecto
    await this.storeOrUpdateUser('Erik', 'eriklopez@gmail.com', '1234', 'mesero');
    await this.storeOrUpdateUser('Eber', 'eber@gmail.com', 'mysecret', 'cocinero');
    await this.storeOrUpdateUser('Tiberio', 'tibi@gmail.com', 'mysecret', 'administrador');

    // Agregar mesas por defecto
    const defaultTables: Promise<void>[] = [];
    for (let i = 1; i <= 10; i++) {
      defaultTables.push(this.storeOrUpdateTable(i, 'disponible'));
    }
    await Promise.all(defaultTables);

    console.log('Base de datos inicializada con usuarios y mesas por defecto.');
  }
}

// Ejemplo de uso para inicializar la base de datos
(async () => {
  const store = new AuthStore();
  await store.initModelAndDatabase();
})();
