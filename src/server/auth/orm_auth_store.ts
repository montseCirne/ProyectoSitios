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
  rol: DataTypes.ENUM('mesero', 'cocinero', 'administrador'),
});

// Modelo de Mesa
export const Mesa = sequelize.define('Mesa', {
  numero: DataTypes.INTEGER,
  estado: DataTypes.ENUM('disponible', 'ocupada'),
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
  platillos: DataTypes.JSON,
  bebidas: DataTypes.JSON,
  notas: DataTypes.STRING,
  estado: DataTypes.ENUM('pendiente', 'en preparación', 'listo'),
  meseroId: {
    type: DataTypes.INTEGER,
    references: {
      model: Usuario,
      key: 'id',
    },
  },
});

export class AuthStore {
  // Crear o actualizar usuario
  async storeOrUpdateUser(
    nombre: string,
    correo: string,
    contraseña: string,
    rol: 'mesero' | 'cocinero' | 'administrador'
  ): Promise<void> {
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    await Usuario.upsert({
      nombre,
      correo,
      contraseña: hashedPassword,
      rol,
    });
  }

  // Eliminar un usuario
  async deleteUser(correo: string): Promise<void> {
    await Usuario.destroy({ where: { correo } });
  }

  // Listar todos los usuarios
  async listUsers(): Promise<any[]> {
    return await Usuario.findAll();
  }

  // Crear o actualizar una mesa
  async storeOrUpdateTable(numero: number, estado: 'disponible' | 'ocupada'): Promise<void> {
    await Mesa.upsert({ numero, estado });
  }

  // Eliminar una mesa
  async deleteTable(numero: number): Promise<void> {
    await Mesa.destroy({ where: { numero } });
  }

  // Listar todas las mesas
  async listTables(): Promise<any[]> {
    return await Mesa.findAll();
  }

  // Crear o actualizar una comanda
  async storeOrUpdateComanda(
    idMesa: number,
    meseroId: number,
    platillos: string[],
    bebidas: string[],
    notas: string,
    estado: 'pendiente' | 'en preparación' | 'listo'
  ): Promise<void> {
    await Comanda.upsert({
      idMesa,
      meseroId,
      platillos,
      bebidas,
      notas,
      estado,
    });
  }

  // Eliminar una comanda
  async deleteComanda(id: number): Promise<void> {
    await Comanda.destroy({ where: { id } });
  }

  // Listar todas las comandas
  async listComandas(): Promise<any[]> {
    return await Comanda.findAll();
  }

  // Inicializar la base de datos con datos por defecto
  async initModelAndDatabase(): Promise<void> {
    await sequelize.truncate({ cascade: true }); // Elimina datos pero no tablas

    // Usuarios por defecto
    await this.storeOrUpdateUser('Erik', 'eriklopez@gmail.com', '1234', 'mesero');
    await this.storeOrUpdateUser('Eber', 'eber@gmail.com', 'mysecret', 'cocinero');
    await this.storeOrUpdateUser('Tiberio', 'tibi@gmail.com', 'mysecret', 'administrador');

    // Mesas por defecto
    const defaultTables: Promise<void>[] = [];
    for (let i = 1; i <= 10; i++) {
      defaultTables.push(this.storeOrUpdateTable(i, 'disponible'));
    }
    await Promise.all(defaultTables);

    console.log('Base de datos inicializada con usuarios y mesas por defecto.');
  }
}

// Ejemplo de inicialización de la base de datos
(async () => {
  const store = new AuthStore();
  await store.initModelAndDatabase();
})();
